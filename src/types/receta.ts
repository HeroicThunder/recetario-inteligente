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

// Receta ya comparada con la despensa: qué ingredientes hay, cuáles faltan y qué porcentaje se cubre.
// El agua y la sal no se cuentan (se asumen disponibles).
export type RecetaEvaluada = Receta & {
  disponibles: IngredienteReceta[];
  faltantes: IngredienteReceta[]; // en "cantidad" va lo que falta, no la cantidad total de la receta
  porcentaje: number; // de 0 a 100
};
