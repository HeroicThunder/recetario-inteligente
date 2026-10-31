import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colores, fuentes } from "../theme";
import { useRecetas } from "../hooks/useRecetas";
import RecetaCard from "../components/RecetaCard";
import { comunes } from "../components/estilosComunes";

export default function SugerenciasScreen() {
  const router = useRouter();
  const { principal } = useLocalSearchParams<{ principal?: string }>(); // modo 2: ingrediente principal
  const { estado, recetas, mensaje, tipoError, sugerir } =
    useRecetas(principal);

  return (
    <View style={s.pantalla}>
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={s.volver}>← Despensa</Text>
      </Pressable>
      <Text style={s.titulo}>Sugerencias</Text>
      {principal ? (
        <Text style={s.modo}>Con {principal} como protagonista</Text>
      ) : null}

      {estado === "cargando" && (
        <View style={s.centro}>
          <ActivityIndicator size="large" color={colores.bosque} />
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
                {recetas.length === 1 ? "opción" : "opciones"} que se acerquen a
                tu despensa actual.
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
    backgroundColor: colores.crema,
    padding: 24,
    paddingTop: 64,
  },
  volver: {
    fontSize: 16,
    color: colores.bosque,
    marginBottom: 12,
    fontFamily: fuentes.texto,
  },
  titulo: {
    fontSize: 34,
    fontFamily: fuentes.titulo,
    letterSpacing: -0.5,
    color: colores.bosque,
    marginBottom: 16,
  },
  modo: {
    fontSize: 14,
    color: colores.gris,
    marginBottom: 12,
    fontFamily: fuentes.texto,
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
    color: colores.bosque,
    textAlign: "center",
    fontFamily: fuentes.texto,
  },
  botonCentro: { paddingHorizontal: 28 },
  aviso: {
    fontSize: 14,
    color: colores.gris,
    marginBottom: 4,
    fontFamily: fuentes.texto,
  },
  otras: { paddingVertical: 24, alignItems: "center" },
  otrasTexto: {
    fontSize: 16,
    color: colores.bosque,
    fontFamily: fuentes.negrita,
  },
});
