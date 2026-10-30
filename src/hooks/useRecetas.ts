import { useCallback, useEffect, useRef, useState } from "react";
import { iniciarDb, listarIngredientes } from "../db/database";
import {
  ErrorGemini,
  mensajeParaUsuario,
  TipoError,
} from "../services/ErrorGemini";
import { sugerirRecetas } from "../services/recetas";
import type { Receta } from "../types/receta";

type Estado = "cargando" | "resultados" | "error";

// Estado de la pantalla de sugerencias (feature F02). Al montarse pide las recetas automáticamente.
export function useRecetas() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoError, setTipoError] = useState<TipoError | null>(null);

  const enCurso = useRef(false); // evita lanzar dos peticiones a la vez
  const montado = useRef(true); // evita actualizar el estado si la pantalla ya se cerró

  const sugerir = useCallback(async () => {
    if (enCurso.current) return;
    enCurso.current = true;
    setEstado("cargando");
    setMensaje("");
    setTipoError(null);

    try {
      await iniciarDb();
      const inventario = await listarIngredientes();
      const resultado = await sugerirRecetas(inventario);
      if (!montado.current) return;
      setRecetas(resultado.recetas);
      setEstado("resultados");
    } catch (e) {
      if (!montado.current) return;
      setMensaje(mensajeParaUsuario(e));
      setTipoError(e instanceof ErrorGemini ? e.tipo : "api");
      setEstado("error");
    } finally {
      enCurso.current = false;
    }
  }, []);

  useEffect(() => {
    montado.current = true;
    sugerir();
    return () => {
      montado.current = false;
    };
  }, [sugerir]);

  return { estado, recetas, mensaje, tipoError, sugerir };
}
