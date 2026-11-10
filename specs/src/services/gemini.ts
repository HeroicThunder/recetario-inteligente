import { ErrorGemini } from "./ErrorGemini";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODELO = process.env.EXPO_PUBLIC_GEMINI_MODEL;
const URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TIEMPO_ESPERA_MS = 20000;

export async function generarJson(
  prompt: string,
  esquema: object,
): Promise<unknown> {
  if (!API_KEY || !MODELO) {
    throw new ErrorGemini(
      "configuracion",
      "Falta EXPO_PUBLIC_GEMINI_API_KEY o EXPO_PUBLIC_GEMINI_MODEL",
    );
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_ESPERA_MS);

  let respuesta: Response;

  try {
    respuesta = await fetch(`${URL_BASE}/${MODELO}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: esquema,
          temperature: 0.7,
        },
      }),
      signal: controlador.signal,
    });
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new ErrorGemini("tiempo", "Tiempo de espera agotado");
    }

    throw new ErrorGemini("red", "No se pudo conectar con Gemini");
  } finally {
    clearTimeout(temporizador);
  }

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    console.error("Error de Gemini:", respuesta.status, detalle);

    if (respuesta.status === 404) {
      throw new ErrorGemini("modelo", "Modelo no encontrado");
    }

    if (respuesta.status === 429) {
      throw new ErrorGemini("limite", "Límite de uso alcanzado");
    }

    if ([400, 401, 403].includes(respuesta.status)) {
      throw new ErrorGemini(
        "configuracion",
        `Solicitud o clave rechazada (${respuesta.status})`,
      );
    }

    throw new ErrorGemini("api", `Error de Gemini (${respuesta.status})`);
  }

  let datos: any;

  try {
    datos = await respuesta.json();
  } catch {
    throw new ErrorGemini("formato", "La respuesta no es JSON");
  }

  const partes: any[] = datos?.candidates?.[0]?.content?.parts ?? [];

  const texto = partes
    .map((p) => (typeof p?.text === "string" ? p.text : ""))
    .join("")
    .trim();

  if (!texto) {
    throw new ErrorGemini("formato", "La respuesta vino vacía");
  }

  try {
    return JSON.parse(texto);
  } catch {
    throw new ErrorGemini("formato", "El texto devuelto no es JSON válido");
  }
}
