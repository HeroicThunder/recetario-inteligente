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

// Construye el prompt a partir del inventario actual.
// Si se indica un ingrediente principal, todas las recetas deben tenerlo como protagonista.
export function construirPrompt(
  inventario: Ingrediente[],
  principal?: string,
): string {
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
    "1. Prioriza los ingredientes de la lista. Puedes agregar como máximo 3 ingredientes extra que no estén en ella (comunes y fáciles de conseguir). El agua y la sal no cuentan como extras.",
    "2. Para un ingrediente de la lista, usa el mismo nombre y la misma unidad, y nunca pidas más cantidad de la disponible.",
    "3. Para los extras indica una cantidad realista y una unidad entre g, kg, ml, l o pza.",
    "4. Propón 3 recetas distintas, de la que usa más ingredientes de la lista a la que usa menos. Si no es posible armar 3, devuelve menos.",
    "5. La descripción debe tener máximo 20 palabras y estar en español.",
    "6. El tiempo va en minutos y la dificultad es facil, media o dificil.",
    "7. Responde únicamente con el JSON solicitado, sin texto adicional.",
    ...(principal
      ? [
          `8. Todas las recetas deben tener como ingrediente protagonista: ${principal}.`,
        ]
      : []),
  ].join("\n");
}
