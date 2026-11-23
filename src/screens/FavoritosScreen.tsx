
import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import {
  listarFavoritos,
  eliminarFavorito,
} from "../db/database";

import { colores, fuentes } from "../theme";
import BarraNavegacion from "../components/BarraNavegacion";

type RecetaGuardada = {
  id: number;
  receta_json: string;
  foto_uri: string | null;
  creado_en: string;
};

type DatosReceta = {
  nombre?: string;
  descripcion?: string;
  tiempo_minutos?: number;
  dificultad?: string;
  ingredientes?: {
    nombre: string;
    cantidad: number;
    unidad: string;
  }[];
  procedimiento?: string[];
  porcentaje?: number;
};

export default function FavoritosScreen() {
  const router = useRouter();

  const [favoritos, setFavoritos] = useState<RecetaGuardada[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarFavoritos = useCallback(async () => {
    try {
      setCargando(true);
      const resultado = await listarFavoritos();
      setFavoritos(resultado);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar tus recetas guardadas."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [cargarFavoritos])
  );

  function obtenerDatos(recetaJson: string): DatosReceta | null {
    try {
      return JSON.parse(recetaJson) as DatosReceta;
    } catch (error) {
      console.error("Error al leer receta guardada:", error);
      return null;
    }
  }

  function abrirDetalle(recetaJson: string) {
    router.push({
      pathname: "/detalle-receta" as any,
      params: {
        receta: recetaJson,
      },
    });
  }

  function confirmarEliminar(id: number, nombre: string) {
    Alert.alert(
      "Eliminar receta",
      `¿Quieres quitar "${nombre}" de tus recetas guardadas?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarFavorito(id);
              setFavoritos((actuales) =>
                actuales.filter((item) => item.id !== id)
              );
            } catch (error) {
              console.error("Error al eliminar favorito:", error);
              Alert.alert(
                "Error",
                "No se pudo eliminar la receta."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.contenido}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/perfil");
            }
          }}
          style={styles.botonVolver}
        >
          <Text style={styles.textoVolver}>← Mi perfil</Text>
        </Pressable>

        <Text style={styles.titulo}>Mis recetas guardadas</Text>

        <Text style={styles.subtitulo}>
          Tus recetas favoritas, siempre disponibles.
        </Text>

        {cargando ? (
          <View style={styles.centro}>
            <ActivityIndicator
              size="large"
              color={colores.bosque}
            />
            <Text style={styles.textoCargando}>
              Cargando tus recetas...
            </Text>
          </View>
        ) : (
          <FlatList
            data={favoritos}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              favoritos.length === 0
                ? styles.listaVacia
                : styles.lista
            }
            ListEmptyComponent={
              <View style={styles.vacio}>
                <Text style={styles.iconoVacio}>♡</Text>

                <Text style={styles.tituloVacio}>
                  Aún no tienes recetas guardadas
                </Text>

                <Text style={styles.textoVacio}>
                  Cuando encuentres una receta que te guste,
                  guárdala con el botón de Favoritos y aparecerá aquí.
                </Text>

                <Pressable
                  style={styles.botonRecetas}
                  onPress={() => router.replace("/sugerencias")}
                >
                  <Text style={styles.textoBotonRecetas}>
                    Buscar recetas
                  </Text>
                </Pressable>
              </View>
            }
            renderItem={({ item }) => {
              const receta = obtenerDatos(item.receta_json);

              if (!receta) {
                return (
                  <View style={styles.tarjeta}>
                    <Text style={styles.nombre}>
                      Receta no disponible
                    </Text>

                    <Pressable
                      onPress={() =>
                        confirmarEliminar(item.id, "esta receta")
                      }
                    >
                      <Text style={styles.textoEliminar}>
                        Eliminar registro
                      </Text>
                    </Pressable>
                  </View>
                );
              }

              return (
                <View style={styles.tarjeta}>
                  <View style={styles.encabezadoTarjeta}>
                    <View style={styles.contenidoTarjeta}>
                      <Text style={styles.nombre}>
                        {receta.nombre || "Receta sin nombre"}
                      </Text>

                      <Text style={styles.descripcion}>
                        {receta.descripcion ||
                          "Sin descripción disponible."}
                      </Text>
                    </View>

                    <Text style={styles.corazon}>♥</Text>
                  </View>

                  <View style={styles.metadatos}>
                    <Text style={styles.metadato}>
                      ◷ {receta.tiempo_minutos ?? "—"} min
                    </Text>

                    <Text style={styles.metadato}>
                      {receta.dificultad || "Sin dificultad"}
                    </Text>
                  </View>

                  <View style={styles.separador} />

                  <Text style={styles.etiquetaIngredientes}>
                    Ingredientes: {receta.ingredientes?.length ?? 0}
                  </Text>

                  {receta.ingredientes?.slice(0, 3).map(
                    (ingrediente, index) => (
                      <Text
                        key={`${item.id}-${index}`}
                        style={styles.ingrediente}
                      >
                        • {ingrediente.nombre} — {ingrediente.cantidad}{" "}
                        {ingrediente.unidad}
                      </Text>
                    )
                  )}

                  {(receta.ingredientes?.length ?? 0) > 3 && (
                    <Text style={styles.masIngredientes}>
                      Y {receta.ingredientes!.length - 3} ingredientes más...
                    </Text>
                  )}

                  <Pressable
                    style={styles.botonDetalle}
                    onPress={() => abrirDetalle(item.receta_json)}
                  >
                    <Text style={styles.textoBotonDetalle}>
                      Ver receta completa →
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.botonEliminar}
                    onPress={() =>
                      confirmarEliminar(
                        item.id,
                        receta.nombre || "esta receta"
                      )
                    }
                  >
                    <Text style={styles.textoEliminar}>
                      Quitar de guardados
                    </Text>
                  </Pressable>
                </View>
              );
            }}
          />
        )}
      </View>

      <BarraNavegacion />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.crema,
  },
  contenido: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 55,
  },
  botonVolver: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 12,
  },
  textoVolver: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
  titulo: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 29,
  },
  subtitulo: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 20,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textoCargando: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    marginTop: 12,
  },
  lista: {
    paddingBottom: 20,
  },
  listaVacia: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 30,
  },
  vacio: {
    alignItems: "center",
    paddingHorizontal: 15,
  },
  iconoVacio: {
    color: colores.salvia,
    fontSize: 65,
    marginBottom: 12,
  },
  tituloVacio: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 21,
    textAlign: "center",
  },
  textoVacio: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
  },
  botonRecetas: {
    backgroundColor: colores.bosque,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 12,
    marginTop: 20,
  },
  textoBotonRecetas: {
    color: colores.blanco,
    fontFamily: fuentes.negrita,
    fontSize: 13,
  },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 17,
    padding: 17,
    marginBottom: 15,
  },
  encabezadoTarjeta: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  contenidoTarjeta: {
    flex: 1,
  },
  nombre: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 21,
  },
  descripcion: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  corazon: {
    color: colores.terracota,
    fontSize: 23,
    marginLeft: 10,
  },
  metadatos: {
    flexDirection: "row",
    gap: 18,
    marginTop: 13,
  },
  metadato: {
    color: colores.gris,
    fontFamily: fuentes.negrita,
    fontSize: 11,
    textTransform: "capitalize",
  },
  separador: {
    height: 1,
    backgroundColor: colores.linea,
    marginVertical: 13,
  },
  etiquetaIngredientes: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 12,
    marginBottom: 7,
  },
  ingrediente: {
    color: colores.carbon,
    fontFamily: fuentes.texto,
    fontSize: 12,
    marginTop: 4,
  },
  masIngredientes: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    marginTop: 6,
  },
  botonDetalle: {
    backgroundColor: colores.bosque,
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  textoBotonDetalle: {
    color: colores.blanco,
    fontFamily: fuentes.negrita,
    fontSize: 13,
  },
  botonEliminar: {
    alignSelf: "flex-end",
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 5,
  },
  textoEliminar: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },
});
