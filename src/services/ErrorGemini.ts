// Error propio de la integración con Gemini. El campo "tipo" permite que la
// interfaz muestre un mensaje claro sin exponer detalles técnicos al usuario.

export type TipoError =
  | "configuracion"
  | "red"
  | "tiempo"
  | "modelo"
  | "limite"
  | "api"
  | "formato"
  | "despensa_vacia"
  | "sin_resultados";

export class ErrorGemini extends Error {
  tipo: TipoError;

  constructor(tipo: TipoError, mensaje: string) {
    super(mensaje);
    this.name = "ErrorGemini";
    this.tipo = tipo;
    // Necesario para que "instanceof" funcione al extender Error en React Native
    Object.setPrototypeOf(this, ErrorGemini.prototype);
  }
}

const MENSAJES: Record<TipoError, string> = {
  configuracion:
    "Falta configurar la clave o el modelo de Gemini, o la clave no es válida. Revisa el archivo .env.",
  red: "No hay conexión a Internet. Revisa tu red e inténtalo de nuevo.",
  tiempo: "La respuesta tardó demasiado. Inténtalo de nuevo.",
  modelo:
    "El modelo de Gemini configurado no está disponible. Revisa su nombre en el archivo .env.",
  limite:
    "Se alcanzó el límite de uso de la IA. Espera un momento e inténtalo de nuevo.",
  api: "No se pudo obtener respuesta de la IA. Inténtalo de nuevo.",
  formato:
    "La IA devolvió una respuesta que no se pudo leer. Inténtalo de nuevo.",
  despensa_vacia:
    "Tu despensa está vacía. Agrega ingredientes para recibir sugerencias.",
  sin_resultados:
    "No encontré recetas que se puedan preparar con lo que tienes. Agrega más ingredientes.",
};

// Devuelve el mensaje que se muestra al usuario para cualquier error
export function mensajeParaUsuario(error: unknown): string {
  if (error instanceof ErrorGemini) return MENSAJES[error.tipo];
  return MENSAJES.api;
}
