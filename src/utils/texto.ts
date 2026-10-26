// Normaliza un nombre para compararlo: sin mayúsculas, acentos ni espacios sobrantes
export const normalizar = (texto: string) =>
  texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
