import type { Ingrediente } from "../db/database";
import type { RecetaEvaluada } from "../types/receta";
import { validarRecetas } from "../utils/validarRecetas";
import { ErrorGemini } from "./ErrorGemini";
import { generarJson } from "./gemini";
import { construirPrompt, ESQUEMA_RECETAS } from "./promptRecetas";

export type SugerenciaRecetas = {
  recetas: RecetaEvaluada[];
  descartadas: number;
};

// Orquesta la feature F02: prompt -> Gemini -> validación.
// Si la respuesta no tiene el formato esperado, reintenta una vez (según la spec).
export async function sugerirRecetas(
  inventario: Ingrediente[],
  principal?: string,
): Promise<SugerenciaRecetas> {
  if (inventario.length === 0) {
    throw new ErrorGemini("despensa_vacia", "La despensa está vacía");
  }

  const prompt = construirPrompt(inventario, principal);

  for (let intento = 0; intento < 2; intento++) {
    try {
      const crudo = await generarJson(prompt, ESQUEMA_RECETAS);
      const resultado = validarRecetas(crudo, inventario);

      if (!resultado.formatoValido)
        throw new ErrorGemini("formato", "La respuesta no es una lista");
      if (resultado.validas.length === 0) {
        throw new ErrorGemini(
          "sin_resultados",
          "Ninguna receta cumple las reglas",
        );
      }
      return { recetas: resultado.validas, descartadas: resultado.descartadas };
    } catch (e) {
      const esFormato = e instanceof ErrorGemini && e.tipo === "formato";
      if (esFormato && intento === 0) continue; // un solo reintento
      throw e;
    }
  }

  throw new ErrorGemini("formato", "No se obtuvo una respuesta válida");
}
