
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
  procedimiento: string[];
};

export type RecetaEvaluada = Receta & {
  disponibles: IngredienteReceta[];
  faltantes: IngredienteReceta[];
  porcentaje: number;
};
