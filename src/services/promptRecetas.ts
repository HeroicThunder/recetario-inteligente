import type { Ingrediente } from "../db/database";

// Esquema JSON que Gemini debe respetar: hasta 3 recetas con la estructura de la spec F02
export const ESQUEMA_RECETAS = {
  type: "array",
  maxItems: 3,
  items: {
    type: "object",
    properties: {
      nombre: { type: "string" },
      descripcion: { type: "string" },
      tiempo_minutos: { type: "integer" },
      dificultad: { type: "string", enum: ["facil", "media", "dificil"] },
      ingredientes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            nombre: { type: "string" },
            cantidad: { type: "number" },
            unidad: { type: "string" },
          },
          required: ["nombre", "cantidad", "unidad"],
        },
      },
    },
    required: [
      "nombre",
      "descripcion",
      "tiempo_minutos",
      "dificultad",
      "ingredientes",
    ],
  },
};

// Construye el prompt a partir del inventario actual
export function construirPrompt(inventario: Ingrediente[]): string {
  const lista = inventario
    .map((i) => `- ${i.nombre}: ${i.cantidad} ${i.unidad}`)
    .join("\n");

  return [
    "Eres un asistente culinario. Propón recetas que el usuario pueda preparar con lo que tiene en su despensa.",
    "",
    'Despensa del usuario (nombre: cantidad unidad). La unidad "pza" significa piezas:',
    lista,
    "",
    "Reglas obligatorias:",
    "1. Usa únicamente ingredientes de la lista. La única excepción son el agua y la sal, que puedes usar sin límite.",
    "2. Nunca pidas más cantidad de la disponible de un ingrediente.",
    "3. Escribe cada ingrediente con el mismo nombre y la misma unidad que aparecen en la lista.",
    "4. Propón 3 recetas distintas. Si con lo disponible no es posible armar 3, devuelve menos.",
    "5. La descripción debe tener máximo 20 palabras y estar en español.",
    "6. El tiempo va en minutos y la dificultad es facil, media o dificil.",
    "7. Responde únicamente con el JSON solicitado, sin texto adicional.",
  ].join("\n");
}
