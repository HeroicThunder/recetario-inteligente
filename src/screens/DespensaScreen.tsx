import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colores, fuentes } from "../theme";
import { useDespensa } from "../hooks/useDespensa";
import FormularioIngrediente from "../components/FormularioIngrediente";
import IngredienteItem from "../components/IngredienteItem";
import ModalEditarIngrediente from "../components/ModalEditarIngrediente";
import { Alert } from "react-native";
import { cerrarSesion } from "../db/database";

export default function DespensaScreen() {
  const d = useDespensa();
  const router = useRouter();
  async function salir() {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await cerrarSesion();
          router.replace("/login");
        },
      },
    ]);
  }

  return (
    <View style={s.pantalla}>
      <Text style={s.titulo}>Despensa</Text>

      <Pressable
        onPress={salir}
        style={{ alignSelf: "flex-end", marginBottom: 12 }}
      >
        <Text style={{ color: colores.terracota, fontFamily: fuentes.negrita }}>
          Cerrar sesión
        </Text>
      </Pressable>

      <Pressable style={s.sugerir} onPress={() => router.push("/sugerencias")}>
        <Text style={s.sugerirTexto}>¿Qué cocino hoy? →</Text>
      </Pressable>

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
    backgroundColor: colores.crema,
    padding: 24,
    paddingTop: 64,
  },
  titulo: {
    fontSize: 34,
    fontFamily: fuentes.titulo,
    letterSpacing: -0.5,
    color: colores.bosque,
    marginBottom: 16,
  },
  vacio: { marginTop: 24, color: colores.gris, fontFamily: fuentes.texto },
  sugerir: {
    backgroundColor: colores.terracota,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 2,
    marginBottom: 24,
  },
  sugerirTexto: {
    color: colores.crema,
    fontFamily: fuentes.negrita,
    fontSize: 16,
  },
});
