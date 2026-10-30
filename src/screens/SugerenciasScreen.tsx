import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { colores } from "../theme";
import { useRecetas } from "../hooks/useRecetas";
import RecetaCard from "../components/RecetaCard";
import { comunes } from "../components/estilosComunes";

export default function SugerenciasScreen() {
  const router = useRouter();
  const { estado, recetas, mensaje, tipoError, sugerir } = useRecetas();

  return (
    <View style={s.pantalla}>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={s.volver}>← Despensa</Text>
      </Pressable>
      <Text style={s.titulo}>Sugerencias</Text>

      {estado === "cargando" && (
        <View style={s.centro}>
          <ActivityIndicator size="large" color={colores.cobalto} />
          <Text style={s.mensaje}>Buscando recetas con lo que tienes…</Text>
        </View>
      )}

      {estado === "error" && (
        <View style={s.centro}>
          <Text style={s.mensaje}>{mensaje}</Text>
          {tipoError === "despensa_vacia" ? (
            <Pressable
              style={[comunes.boton, s.botonCentro]}
              onPress={() => router.back()}
            >
              <Text style={comunes.botonTexto}>Ir a la despensa</Text>
            </Pressable>
          ) : (
            <Pressable style={[comunes.boton, s.botonCentro]} onPress={sugerir}>
              <Text style={comunes.botonTexto}>Reintentar</Text>
            </Pressable>
          )}
        </View>
      )}

      {estado === "resultados" && (
        <FlatList
          data={recetas}
          keyExtractor={(r, i) => `${r.nombre}-${i}`}
          renderItem={({ item }) => <RecetaCard receta={item} />}
          ListHeaderComponent={
            recetas.length < 3 ? (
              <Text style={s.aviso}>
                Solo encontré {recetas.length}{" "}
                {recetas.length === 1 ? "opción viable" : "opciones viables"}{" "}
                con tu despensa actual.
              </Text>
            ) : null
          }
          ListFooterComponent={
            <Pressable onPress={sugerir} style={s.otras}>
              <Text style={s.otrasTexto}>Generar otras opciones</Text>
            </Pressable>
          }
        />
      )}
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
  volver: { fontSize: 16, color: colores.cobalto, marginBottom: 12 },
  titulo: {
    fontSize: 34,
    fontWeight: "300",
    letterSpacing: -0.5,
    color: colores.tinta,
    marginBottom: 16,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  mensaje: {
    marginTop: 16,
    fontSize: 16,
    color: colores.tinta,
    textAlign: "center",
  },
  botonCentro: { paddingHorizontal: 28 },
  aviso: { fontSize: 14, color: colores.gris, marginBottom: 4 },
  otras: { paddingVertical: 24, alignItems: "center" },
  otrasTexto: { fontSize: 16, color: colores.cobalto, fontWeight: "600" },
});
