// Conversión entre unidades compatibles. Todo se lleva a una unidad base por familia:
// masa -> gramos, volumen -> mililitros, piezas -> piezas.

export type Familia = "masa" | "volumen" | "piezas";

const TABLA: Record<string, { familia: Familia; factor: number }> = {
  g: { familia: "masa", factor: 1 },
  gr: { familia: "masa", factor: 1 },
  gramo: { familia: "masa", factor: 1 },
  gramos: { familia: "masa", factor: 1 },
  kg: { familia: "masa", factor: 1000 },
  kilo: { familia: "masa", factor: 1000 },
  kilos: { familia: "masa", factor: 1000 },
  kilogramo: { familia: "masa", factor: 1000 },
  kilogramos: { familia: "masa", factor: 1000 },
  ml: { familia: "volumen", factor: 1 },
  mililitro: { familia: "volumen", factor: 1 },
  mililitros: { familia: "volumen", factor: 1 },
  l: { familia: "volumen", factor: 1000 },
  lt: { familia: "volumen", factor: 1000 },
  litro: { familia: "volumen", factor: 1000 },
  litros: { familia: "volumen", factor: 1000 },
  pza: { familia: "piezas", factor: 1 },
  pzas: { familia: "piezas", factor: 1 },
  pz: { familia: "piezas", factor: 1 },
  pieza: { familia: "piezas", factor: 1 },
  piezas: { familia: "piezas", factor: 1 },
};

export type CantidadBase = { familia: Familia; valor: number };

// Convierte una cantidad a su unidad base. Devuelve null si la unidad no se reconoce.
export function aBase(cantidad: number, unidad: string): CantidadBase | null {
  const u = TABLA[unidad.trim().toLowerCase()];
  if (!u) return null;
  return { familia: u.familia, valor: cantidad * u.factor };
}
