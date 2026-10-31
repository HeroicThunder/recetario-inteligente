import type { Ingrediente } from "../db/database";
import type {
  IngredienteReceta,
  Receta,
  RecetaEvaluada,
} from "../types/receta";
import { normalizar } from "./texto";
import { aBase } from "./unidades";

// Ingredientes que se asumen disponibles aunque no estén en la despensa (decisión de la spec F02)
const PERMITIDOS = ["agua", "sal"];
const DIFICULTADES = ["facil", "media", "dificil"];

// Una receta solo se muestra si le faltan pocos ingredientes (decisión de la spec F02, opción B)
export const MAX_FALTANTES = 3;
export const MIN_PORCENTAJE = 50;
const EPS = 1e-9;

export type ResultadoValidacion = {
  formatoValido: boolean; // false si la respuesta ni siquiera es una lista
  validas: RecetaEvaluada[]; // recetas que cumplen estructura y disponibilidad, mejores primero (máximo 3)
  descartadas: number; // recetas descartadas por incumplir alguna regla
};

function esReceta(x: any): x is Receta {
  return (
    x &&
    typeof x.nombre === "string" &&
    x.nombre.trim() !== "" &&
    typeof x.descripcion === "string" &&
    typeof x.tiempo_minutos === "number" &&
    DIFICULTADES.includes(x.dificultad) &&
    Array.isArray(x.ingredientes) &&
    x.ingredientes.length > 0 &&
    x.ingredientes.every(
      (i: any) =>
        i &&
        typeof i.nombre === "string" &&
        typeof i.cantidad === "number" &&
        i.cantidad > 0 &&
        typeof i.unidad === "string",
    )
  );
}

// Compara la receta con la despensa. Devuelve null si debe descartarse.
// Las cantidades se comparan en unidad base (200 g equivalen a 0.2 kg) y las existencias
// se van consumiendo, así que un ingrediente repetido en la receta no se cuenta dos veces.
function evaluar(
  receta: Receta,
  inventario: Ingrediente[],
): RecetaEvaluada | null {
  const restante = new Map<string, number>(); // existencias en unidad base por ingrediente y familia
  const nombresEnDespensa = new Set<string>();

  for (const i of inventario) {
    const clave = normalizar(i.nombre);
    nombresEnDespensa.add(clave);
    const b = aBase(i.cantidad, i.unidad);
    if (!b) continue;
    const llave = `${clave}|${b.familia}`;
    restante.set(llave, (restante.get(llave) ?? 0) + b.valor);
  }

  const disponibles: IngredienteReceta[] = [];
  const faltantes: IngredienteReceta[] = [];

  for (const ing of receta.ingredientes) {
    const clave = normalizar(ing.nombre);
    if (PERMITIDOS.includes(clave)) continue;

    // No está en la despensa: falta completo
    if (!nombresEnDespensa.has(clave)) {
      faltantes.push(ing);
      continue;
    }

    // Está en la despensa pero no se puede comparar (unidad desconocida o de otra familia): receta incoherente
    const base = aBase(ing.cantidad, ing.unidad);
    if (!base) return null;
    const llave = `${clave}|${base.familia}`;
    if (!restante.has(llave)) return null;

    const existente = restante.get(llave) as number;
    if (existente + EPS >= base.valor) {
      restante.set(llave, existente - base.valor);
      disponibles.push(ing);
    } else {
      // Hay algo, pero no alcanza: se cuenta como faltante por la diferencia
      restante.set(llave, 0);
      const falta = ((base.valor - existente) / base.valor) * ing.cantidad;
      faltantes.push({ ...ing, cantidad: Math.round(falta * 100) / 100 });
    }
  }

  const total = disponibles.length + faltantes.length;
  if (total === 0) return null; // solo usa agua y sal

  const porcentaje = Math.round((disponibles.length / total) * 100);
  if (faltantes.length > MAX_FALTANTES || porcentaje < MIN_PORCENTAJE)
    return null;

  return { ...receta, disponibles, faltantes, porcentaje };
}

export function validarRecetas(
  crudo: unknown,
  inventario: Ingrediente[],
): ResultadoValidacion {
  if (!Array.isArray(crudo))
    return { formatoValido: false, validas: [], descartadas: 0 };

  const validas: RecetaEvaluada[] = [];
  let descartadas = 0;

  for (const candidata of crudo) {
    const evaluada = esReceta(candidata)
      ? evaluar(candidata, inventario)
      : null;
    if (evaluada) validas.push(evaluada);
    else descartadas++;
  }

  // Primero las que cubren mayor porcentaje de la despensa
  validas.sort((a, b) => b.porcentaje - a.porcentaje);
  return { formatoValido: true, validas: validas.slice(0, 3), descartadas };
}
