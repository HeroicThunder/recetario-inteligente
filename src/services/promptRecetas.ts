
import type { Ingrediente } from "../db/database";

export const ESQUEMA_RECETAS = {
  type: "array",
  maxItems: 3,
  items: {
    type: "object",
    properties: {
      nombre: { type: "string" },
      descripcion: { type: "string" },
      tiempo_minutos: { type: "integer" },
      dificultad: {
        type: "string",
        enum: ["facil", "media", "dificil"],
      },
      ingredientes: {
        type: "array",
        minItems: 1,
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
      procedimiento: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: [
      "nombre",
      "descripcion",
      "tiempo_minutos",
      "dificultad",
      "ingredientes",
      "procedimiento",
    ],
  },
};

export function construirPrompt(
  inventario: Ingrediente[],
  principal?: string,
): string {
  const lista = inventario
    .filter((i) => i.cantidad > 0)
    .map((i) => `- ${i.nombre}: ${i.cantidad} ${i.unidad}`)
    .join("\n");

  return [
    "Eres un chef profesional y asistente culinario.",
    "Debes crear recetas que el usuario pueda preparar COMPLETAMENTE con su despensa actual.",
    "",
    "INVENTARIO REAL DEL USUARIO:",
    lista,
    "",
    "REGLAS OBLIGATORIAS:",
    "1. UTILIZA EXCLUSIVAMENTE ingredientes que aparezcan en el inventario.",
    "2. Está PROHIBIDO agregar ingredientes externos, aunque sean agua, sal, aceite, especias o condimentos.",
    "3. Escribe el nombre de cada ingrediente exactamente como aparece en el inventario.",
    "4. Utiliza la misma unidad que aparece en el inventario.",
    "5. Nunca solicites una cantidad superior a la disponible.",
    "6. La suma de las cantidades de un ingrediente repetido no puede superar su existencia total.",
    "7. Si no puedes crear una receta completa con los ingredientes disponibles, no la propongas.",
    "8. No inventes ingredientes ni supongas que el usuario tiene productos que no aparecen en la lista.",
    "9. Propón hasta 3 recetas diferentes, utilizando la mayor cantidad posible de ingredientes disponibles.",
    "10. Cada receta debe tener una descripción breve, en español y de máximo 20 palabras.",
    "11. El tiempo debe expresarse en minutos.",
    "12. La dificultad debe ser facil, media o dificil.",
    "13. Cada receta debe incluir entre 4 y 8 pasos de preparación.",
    "14. Explica cada paso con acciones concretas, tiempos y temperaturas cuando sean necesarios.",
    "15. No incluyas ingredientes que no aparezcan en el inventario ni en el procedimiento.",
    "16. Devuelve exclusivamente el JSON solicitado.",
    ...(principal
      ? [
          `17. El ingrediente protagonista debe ser ${principal}. Debe estar disponible en el inventario.`,
        ]
      : []),
  ].join("\n");
}
