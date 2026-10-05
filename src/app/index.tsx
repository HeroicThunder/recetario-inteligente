import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import {
  iniciarDb,
  listarIngredientes,
  agregarIngrediente,
  actualizarIngrediente,
  eliminarIngrediente,
  Ingrediente,
} from "../db/database";
import { colores } from "../theme";

const UNIDADES = ["g", "kg", "ml", "l", "pza"];

const normalizar = (texto: string) =>
  texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function UnidadSelector({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (u: string) => void;
}) {
  return (
    <View style={s.unidades}>
      {UNIDADES.map((u) => (
        <Pressable
          key={u}
          style={[s.chip, valor === u && s.chipActivo]}
          onPress={() => onChange(u)}
        >
          <Text style={[s.chipTexto, valor === u && s.chipTextoActivo]}>
            {u}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function Despensa() {
  const [items, setItems] = useState<Ingrediente[]>([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("g");

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

    await crear();
  };

  const abrirEdicion = (item: Ingrediente) => {
    setEditando(item);
    setENombre(item.nombre);
    setECantidad(String(item.cantidad));
    setEUnidad(item.unidad);
  };

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

  return (
    <View style={s.pantalla}>
      <Text style={s.titulo}>Despensa</Text>

      <View style={s.fila}>
        <TextInput
          style={[s.input, { flex: 2 }]}
          placeholder="Ingrediente"
          placeholderTextColor={colores.gris}
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={[s.input, { flex: 1 }]}
          placeholder="Cantidad"
          placeholderTextColor={colores.gris}
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
        />
      </View>
      <UnidadSelector valor={unidad} onChange={setUnidad} />

      <Pressable style={s.boton} onPress={guardar}>
        <Text style={s.botonTexto}>Agregar a la despensa</Text>
      </Pressable>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <Pressable style={s.renglon} onPress={() => abrirEdicion(item)}>
            <Text style={s.nombre}>{item.nombre}</Text>
            <Text style={s.cantidad}>
              {item.cantidad} {item.unidad}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={s.vacio}>
            Tu despensa está vacía. Agrega tu primer ingrediente.
          </Text>
        }
      />

      <Modal
        visible={editando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditando(null)}
      >
        <View style={s.fondoModal}>
          <View style={s.hoja}>
            <Text style={s.tituloModal}>Editar ingrediente</Text>
            <TextInput
              style={s.input}
              placeholder="Ingrediente"
              placeholderTextColor={colores.gris}
              value={eNombre}
              onChangeText={setENombre}
            />
            <TextInput
              style={[s.input, { marginTop: 12 }]}
              placeholder="Cantidad"
              placeholderTextColor={colores.gris}
              keyboardType="numeric"
              value={eCantidad}
              onChangeText={setECantidad}
            />
            <UnidadSelector valor={eUnidad} onChange={setEUnidad} />
            <Pressable style={s.boton} onPress={guardarEdicion}>
              <Text style={s.botonTexto}>Guardar cambios</Text>
            </Pressable>
            <View style={s.accionesModal}>
              <Pressable onPress={borrarEdicion}>
                <Text style={s.eliminar}>Eliminar</Text>
              </Pressable>
              <Pressable onPress={() => setEditando(null)}>
                <Text style={s.cancelar}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.porcelana,
    padding: 24,
    paddingTop: 64,
  },
  titulo: {
    fontSize: 34,
    fontWeight: "300",
    letterSpacing: -0.5,
    color: colores.tinta,
    marginBottom: 24,
  },
  fila: { flexDirection: "row", gap: 12 },
  input: {
    borderBottomWidth: 1.5,
    borderColor: colores.tinta,
    paddingVertical: 8,
    color: colores.tinta,
    fontSize: 16,
  },
  boton: {
    backgroundColor: colores.cobalto,
    paddingVertical: 14,
    marginVertical: 20,
    alignItems: "center",
    borderRadius: 2,
  },
  botonTexto: { color: colores.porcelana, fontWeight: "600", fontSize: 16 },
  renglon: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colores.linea,
  },
  nombre: { fontSize: 17, color: colores.tinta },
  cantidad: { fontSize: 17, color: colores.cobalto, fontWeight: "600" },
  vacio: { marginTop: 24, color: colores.gris },
  unidades: { flexDirection: "row", gap: 8, marginTop: 16 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 2,
  },
  chipActivo: {
    backgroundColor: colores.cobalto,
    borderColor: colores.cobalto,
  },
  chipTexto: { color: colores.tinta, fontSize: 15 },
  chipTextoActivo: { color: colores.porcelana, fontWeight: "600" },
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(22, 33, 62, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  hoja: {
    backgroundColor: colores.porcelana,
    padding: 24,
    borderRadius: 2,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  tituloModal: {
    fontSize: 24,
    fontWeight: "300",
    color: colores.tinta,
    marginBottom: 16,
  },
  accionesModal: { flexDirection: "row", justifyContent: "space-between" },
  eliminar: { color: "#B3261E", fontSize: 16, fontWeight: "600" },
  cancelar: { color: colores.gris, fontSize: 16 },
});
