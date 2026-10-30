// Tipos de la feature F02 (recetas generadas por Gemini)

export type Dificultad = "facil" | "media" | "dificil";

export type IngredienteReceta = {
  nombre: string;
  cantidad: number;
  unidad: string;
};

export type Receta = {
  nombre: string;
  descripcion: string;
  tiempo_minutos: number;
  dificultad: Dificultad;
  ingredientes: IngredienteReceta[];
};
