import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  iniciarDb,
  listarIngredientes,
  agregarIngrediente,
  actualizarIngrediente,
  eliminarIngrediente,
  Ingrediente,
} from "../db/database";
import { normalizar } from "../utils/texto";

// Lógica y estado de la despensa (feature F01). No contiene nada visual.
export function useDespensa() {
  const [items, setItems] = useState<Ingrediente[]>([]);

  // Formulario de alta
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("g");

  // Ventana de edición
  const [editando, setEditando] = useState<Ingrediente | null>(null);
  const [eNombre, setENombre] = useState("");
  const [eCantidad, setECantidad] = useState("");
  const [eUnidad, setEUnidad] = useState("g");

  const cargar = useCallback(
    async () => setItems(await listarIngredientes()),
    [],
  );

  useEffect(() => {
    iniciarDb().then(cargar);
  }, [cargar]);

  const guardar = async () => {
    const num = parseFloat(cantidad);
    if (!nombre.trim() || isNaN(num) || num <= 0) return;

    const limpio = nombre.trim();
    const clave = normalizar(limpio);
    const mismaUnidad = items.find(
      (i) => normalizar(i.nombre) === clave && i.unidad === unidad,
    );
    const otraUnidad = items.find(
      (i) => normalizar(i.nombre) === clave && i.unidad !== unidad,
    );

    const limpiarFormulario = () => {
      setNombre("");
      setCantidad("");
      cargar();
    };

    const crear = async () => {
      await agregarIngrediente(limpio, num, unidad);
      limpiarFormulario();
    };

    const sumar = async (existente: Ingrediente) => {
      const total = Math.round((existente.cantidad + num) * 100) / 100;
      await actualizarIngrediente(
        existente.id,
        existente.nombre,
        total,
        existente.unidad,
        existente.caducidad,
      );
      limpiarFormulario();
    };

    // Caso 1: mismo ingrediente y misma unidad -> ofrecer sumar
    if (mismaUnidad) {
      Alert.alert(
        "Ya existe en tu despensa",
        `${mismaUnidad.nombre} ya está registrado (${mismaUnidad.cantidad} ${mismaUnidad.unidad}). ¿Quieres sumar ${num} ${unidad} a lo que ya tienes?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sumar", onPress: () => sumar(mismaUnidad) },
        ],
      );
      return;
    }

    // Caso 2: mismo ingrediente pero otra unidad -> confirmar antes de crear un registro aparte
    if (otraUnidad) {
      Alert.alert(
        "Unidad distinta",
        `Ya tienes ${otraUnidad.nombre} en ${otraUnidad.unidad} (${otraUnidad.cantidad}). ¿Seguro que quieres agregarlo también en ${unidad}? Se guardará como un registro aparte.`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Agregar", onPress: crear },
        ],
      );
      return;
    }

    // Caso 3: ingrediente nuevo
    await crear();
  };

  const abrirEdicion = (item: Ingrediente) => {
    setEditando(item);
    setENombre(item.nombre);
    setECantidad(String(item.cantidad));
    setEUnidad(item.unidad);
  };

  const cerrarEdicion = () => setEditando(null);

  const guardarEdicion = async () => {
    if (!editando) return;
    const num = parseFloat(eCantidad);
    if (!eNombre.trim() || isNaN(num) || num <= 0) return;
    await actualizarIngrediente(
      editando.id,
      eNombre.trim(),
      num,
      eUnidad,
      editando.caducidad,
    );
    setEditando(null);
    cargar();
  };

  const borrarEdicion = () => {
    if (!editando) return;
    Alert.alert(
      "Eliminar ingrediente",
      `¿Quitar ${editando.nombre} de tu despensa?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await eliminarIngrediente(editando.id);
            setEditando(null);
            cargar();
          },
        },
      ],
    );
  };

  return {
    items,
    nombre,
    setNombre,
    cantidad,
    setCantidad,
    unidad,
    setUnidad,
    guardar,
    editando,
    eNombre,
    setENombre,
    eCantidad,
    setECantidad,
    eUnidad,
    setEUnidad,
    abrirEdicion,
    cerrarEdicion,
    guardarEdicion,
    borrarEdicion,
  };
}
