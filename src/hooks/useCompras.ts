
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  iniciarDb,
  inicializarAutenticacion,
  listarCompras,
  agregarCompra,
  cambiarEstadoCompra,
  eliminarCompra,
  confirmarCompras,
  type ItemCompra,
} from "../db/database";

export function useCompras() {
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [unidad, setUnidad] = useState("pza");
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      await iniciarDb();
      await inicializarAutenticacion();
      const compras = await listarCompras();
      setItems(compras);
    } catch (error) {
      console.error("Error cargando compras:", error);
      Alert.alert("Error", "No se pudo cargar tu lista de compras.");
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pendientes = useMemo(
    () => items.filter((item) => item.comprado === 0),
    [items],
  );

  const comprados = useMemo(
    () => items.filter((item) => item.comprado === 1),
    [items],
  );

  const agregar = async () => {
    const cantidadNumero = Number(cantidad);

    if (!nombre.trim() || !Number.isFinite(cantidadNumero) || cantidadNumero <= 0) {
      Alert.alert("Datos incompletos", "Escribe un ingrediente y una cantidad válida.");
      return;
    }

    try {
      setCargando(true);
      await agregarCompra(nombre, cantidadNumero, unidad);
      setNombre("");
      setCantidad("1");
      await cargar();
    } catch (error) {
      Alert.alert(
        "No se pudo agregar",
        error instanceof Error ? error.message : "Inténtalo nuevamente.",
      );
    } finally {
      setCargando(false);
    }
  };

  const alternarComprado = async (item: ItemCompra) => {
    try {
      await cambiarEstadoCompra(item.id, item.comprado === 0);
      await cargar();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el ingrediente.");
    }
  };

  const borrar = (item: ItemCompra) => {
    Alert.alert(
      "Eliminar ingrediente",
      `¿Quieres quitar ${item.nombre} de tu lista?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarCompra(item.id);
              await cargar();
            } catch {
              Alert.alert("Error", "No se pudo eliminar el ingrediente.");
            }
          },
        },
      ],
    );
  };

  const pasarADespensa = () => {
    if (comprados.length === 0) {
      Alert.alert("Sin compras", "Primero marca los ingredientes que ya compraste.");
      return;
    }

    Alert.alert(
      "Actualizar despensa",
      `Se agregarán ${comprados.length} ingrediente(s) a tu despensa. ¿Continuar?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setCargando(true);
              await confirmarCompras();
              await cargar();
              Alert.alert("¡Listo!", "Tus compras se agregaron a la despensa.");
            } catch (error) {
              Alert.alert("Error", "No se pudieron confirmar las compras.");
            } finally {
              setCargando(false);
            }
          },
        },
      ],
    );
  };

  return {
    items,
    pendientes,
    comprados,
    nombre,
    setNombre,
    cantidad,
    setCantidad,
    unidad,
    setUnidad,
    cargando,
    agregar,
    alternarComprado,
    borrar,
    pasarADespensa,
    cargar,
  };
}
