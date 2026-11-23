
import type { Ingrediente } from "../db/database";
import type {
  IngredienteReceta,
  Receta,
  RecetaEvaluada,
} from "../types/receta";

import { normalizar } from "./texto";
import { aBase } from "./unidades";

const DIFICULTADES = ["facil", "media", "dificil"];
const EPS = 1e-9;

export type ResultadoValidacion = {
  formatoValido: boolean;
  validas: RecetaEvaluada[];
  descartadas: number;
};

function esReceta(x: any): x is Receta {
  return (
    x &&
    typeof x.nombre === "string" &&
    x.nombre.trim() !== "" &&
    typeof x.descripcion === "string" &&
    typeof x.tiempo_minutos === "number" &&
    Number.isFinite(x.tiempo_minutos) &&
    x.tiempo_minutos > 0 &&
    DIFICULTADES.includes(x.dificultad) &&
    Array.isArray(x.ingredientes) &&
    x.ingredientes.length > 0 &&
    x.ingredientes.every(
      (i: any) =>
        i &&
        typeof i.nombre === "string" &&
        i.nombre.trim() !== "" &&
        typeof i.cantidad === "number" &&
        Number.isFinite(i.cantidad) &&
        i.cantidad > 0 &&
        typeof i.unidad === "string" &&
        i.unidad.trim() !== "",
    ) &&
    Array.isArray(x.procedimiento) &&
    x.procedimiento.length >= 3 &&
    x.procedimiento.every(
      (paso: any) =>
        typeof paso === "string" && paso.trim().length > 0,
    )
  );
}

function evaluar(
  receta: Receta,
  inventario: Ingrediente[],
  principal?: string,
): RecetaEvaluada | null {
  // Existencias agrupadas por nombre normalizado y familia de unidad.
  const existencias = new Map<string, number>();

  for (const item of inventario) {
    if (item.cantidad <= 0) continue;

    const nombre = normalizar(item.nombre);
    const base = aBase(item.cantidad, item.unidad);

    if (!base) continue;

    const llave = `${nombre}|${base.familia}`;

    existencias.set(
      llave,
      (existencias.get(llave) ?? 0) + base.valor,
    );
  }

  const restante = new Map(existencias);
  const requeridos = new Map<string, number>();

  const protagonista = principal
    ? normalizar(principal)
    : null;

  let contieneProtagonista = !protagonista;

  // Primero acumular cantidades repetidas.
  for (const ingrediente of receta.ingredientes) {
    const nombre = normalizar(ingrediente.nombre);

    if (nombre === protagonista) {
      contieneProtagonista = true;
    }

    const base = aBase(
      ingrediente.cantidad,
      ingrediente.unidad,
    );

    if (!base) return null;

    const llave = `${nombre}|${base.familia}`;

    if (!existencias.has(llave)) {
      return null;
    }

    requeridos.set(
      llave,
      (requeridos.get(llave) ?? 0) + base.valor,
    );
  }

  if (!contieneProtagonista) return null;

  // Comprobar que alcanza para TODOS los ingredientes.
  for (const [llave, cantidadNecesaria] of requeridos) {
    const disponible = restante.get(llave) ?? 0;

    if (disponible + EPS < cantidadNecesaria) {
      return null;
    }

    restante.set(
      llave,
      Math.max(0, disponible - cantidadNecesaria),
    );
  }

  const disponibles: IngredienteReceta[] = receta.ingredientes.map(
    (item) => ({ ...item }),
  );

  return {
    ...receta,
    disponibles,
    faltantes: [],
    porcentaje: 100,
  };
}

export function validarRecetas(
  crudo: unknown,
  inventario: Ingrediente[],
  principal?: string,
): ResultadoValidacion {
  if (!Array.isArray(crudo)) {
    return {
      formatoValido: false,
      validas: [],
      descartadas: 0,
    };
  }

  const validas: RecetaEvaluada[] = [];
  let descartadas = 0;

  for (const candidata of crudo) {
    const evaluada = esReceta(candidata)
      ? evaluar(candidata, inventario, principal)
      : null;

    if (evaluada) {
      validas.push(evaluada);
    } else {
      descartadas++;
    }
  }

  return {
    formatoValido: true,
    validas: validas.slice(0, 3),
    descartadas,
  };
}
