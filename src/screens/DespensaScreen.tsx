import { View, Text, FlatList, StyleSheet } from "react-native";
import { colores } from "../theme";
import { useDespensa } from "../hooks/useDespensa";
import FormularioIngrediente from "../components/FormularioIngrediente";
import IngredienteItem from "../components/IngredienteItem";
import ModalEditarIngrediente from "../components/ModalEditarIngrediente";

export default function DespensaScreen() {
  const d = useDespensa();

  return (
    <View style={s.pantalla}>
      <Text style={s.titulo}>Despensa</Text>

      <FormularioIngrediente
        nombre={d.nombre}
        cantidad={d.cantidad}
        unidad={d.unidad}
        onNombre={d.setNombre}
        onCantidad={d.setCantidad}
        onUnidad={d.setUnidad}
        onGuardar={d.guardar}
      />

      <FlatList
        data={d.items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <IngredienteItem item={item} onPress={() => d.abrirEdicion(item)} />
        )}
        ListEmptyComponent={
          <Text style={s.vacio}>
            Tu despensa está vacía. Agrega tu primer ingrediente.
          </Text>
        }
      />

      <ModalEditarIngrediente
        visible={d.editando !== null}
        nombre={d.eNombre}
        cantidad={d.eCantidad}
        unidad={d.eUnidad}
        onNombre={d.setENombre}
        onCantidad={d.setECantidad}
        onUnidad={d.setEUnidad}
        onGuardar={d.guardarEdicion}
        onEliminar={d.borrarEdicion}
        onCerrar={d.cerrarEdicion}
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
  vacio: { marginTop: 24, color: colores.gris },
});
