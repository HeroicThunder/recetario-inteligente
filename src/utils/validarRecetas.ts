import type { Ingrediente } from "../db/database";
import type { Receta } from "../types/receta";
import { normalizar } from "./texto";
import { aBase } from "./unidades";

// Ingredientes que se permiten aunque no estén en la despensa (decisión de la spec F02)
const PERMITIDOS = ["agua", "sal"];
const DIFICULTADES = ["facil", "media", "dificil"];

export type ResultadoValidacion = {
  formatoValido: boolean; // false si la respuesta ni siquiera es una lista
  validas: Receta[]; // recetas que cumplen estructura y disponibilidad (máximo 3)
  descartadas: number; // recetas que se descartaron por incumplir alguna regla
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

// Comprueba que la receta use solo ingredientes disponibles y en cantidad suficiente.
// Las cantidades se comparan en unidad base, así que 200 g equivalen a 0.2 kg y 500 ml a 0.5 l.
// Se suman los usos repetidos del mismo ingrediente dentro de la receta.
function esViable(receta: Receta, inventario: Ingrediente[]): boolean {
  const usado = new Map<string, number>();

  for (const ing of receta.ingredientes) {
    const clave = normalizar(ing.nombre);
    if (PERMITIDOS.includes(clave)) continue;

    const base = aBase(ing.cantidad, ing.unidad);
    if (!base) return false; // unidad desconocida (por ejemplo "cucharadas" de un ingrediente de la despensa)

    const llave = `${clave}|${base.familia}`;
    usado.set(llave, (usado.get(llave) ?? 0) + base.valor);
  }

  for (const [llave, total] of usado) {
    const [clave, familia] = llave.split("|");

    // Disponible: suma de todos los registros del mismo ingrediente y la misma familia de unidad
    const disponible = inventario
      .filter((i) => normalizar(i.nombre) === clave)
      .reduce((suma, i) => {
        const b = aBase(i.cantidad, i.unidad);
        return b && b.familia === familia ? suma + b.valor : suma;
      }, 0);

    if (disponible === 0 || total > disponible + 1e-9) return false;
  }
  return true;
}

export function validarRecetas(
  crudo: unknown,
  inventario: Ingrediente[],
): ResultadoValidacion {
  if (!Array.isArray(crudo))
    return { formatoValido: false, validas: [], descartadas: 0 };

  const validas: Receta[] = [];
  let descartadas = 0;

  for (const candidata of crudo) {
    if (esReceta(candidata) && esViable(candidata, inventario))
      validas.push(candidata);
    else descartadas++;
  }

  return { formatoValido: true, validas: validas.slice(0, 3), descartadas };
}
