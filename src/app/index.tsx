import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
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

export default function Despensa() {
  const [items, setItems] = useState<Ingrediente[]>([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("g");

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
    await agregarIngrediente(nombre.trim(), num, unidad.trim());
    setNombre("");
    setCantidad("");
    cargar();
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
        <TextInput
          style={[s.input, { flex: 1 }]}
          placeholder="Unidad"
          placeholderTextColor={colores.gris}
          value={unidad}
          onChangeText={setUnidad}
        />
      </View>

      <Pressable style={s.boton} onPress={guardar}>
        <Text style={s.botonTexto}>Agregar a la despensa</Text>
      </Pressable>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <Pressable
            style={s.renglon}
            onLongPress={async () => {
              await eliminarIngrediente(item.id);
              cargar();
            }}
          >
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
});
