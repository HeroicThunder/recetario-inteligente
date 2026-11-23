
import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import {
  listarPreparaciones,
  PreparacionGuardada,
} from "../db/database";
import { colores, fuentes } from "../theme";
import BarraNavegacion from "../components/BarraNavegacion";

export default function HistorialScreen() {
  const router = useRouter();

  const [preparaciones, setPreparaciones] = useState<
    PreparacionGuardada[]
  >([]);
  const [cargando, setCargando] = useState(true);

  const cargarHistorial = useCallback(async () => {
    try {
      setCargando(true);
      const resultado = await listarPreparaciones();
      setPreparaciones(resultado);
    } catch (error) {
      console.error("Error al cargar el historial:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [cargarHistorial])
  );

  function abrirReceta(preparacion: PreparacionGuardada) {
    try {
      const receta = JSON.parse(preparacion.receta_json);

      router.push({
        pathname: "/detalle-receta",
        params: {
          receta: JSON.stringify(receta),
        },
      });
    } catch (error) {
      console.error("Error al abrir la receta:", error);
    }
  }

  function obtenerFecha(fecha: string) {
    const fechaValida = new Date(fecha);

    if (Number.isNaN(fechaValida.getTime())) {
      return "Fecha no disponible";
    }

    return fechaValida.toLocaleString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView
        style={styles.contenido}
        contentContainerStyle={styles.contenidoInterno}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Mi historial</Text>
        <Text style={styles.subtitulo}>
          Todas las recetas que has preparado.
        </Text>

        {cargando ? (
          <View style={styles.estado}>
            <ActivityIndicator
              size="large"
              color={colores.bosque}
            />
            <Text style={styles.textoEstado}>
              Cargando tus preparaciones...
            </Text>
          </View>
        ) : preparaciones.length === 0 ? (
          <View style={styles.vacio}>
            <Text style={styles.iconoVacio}>♨</Text>
            <Text style={styles.tituloVacio}>
              Aún no tienes preparaciones
            </Text>
            <Text style={styles.textoVacio}>
              Cuando termines de preparar una receta, aparecerá aquí
              junto con su fecha y fotografía, si agregaste una.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.contador}>
              {preparaciones.length}{" "}
              {preparaciones.length === 1
                ? "preparación registrada"
                : "preparaciones registradas"}
            </Text>

            {preparaciones.map((item) => (
              <View key={item.id} style={styles.tarjeta}>
                {item.foto_uri ? (
                  <Image
                    source={{ uri: item.foto_uri }}
                    style={styles.foto}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.fotoVacia}>
                    <Text style={styles.iconoFoto}>♨</Text>
                    <Text style={styles.textoFoto}>
                      Sin fotografía
                    </Text>
                  </View>
                )}

                <View style={styles.detalle}>
                  <Text style={styles.nombreReceta}>
                    {item.receta_nombre}
                  </Text>

                  <Text style={styles.fecha}>
                    {obtenerFecha(item.terminado_en)}
                  </Text>

                  <View
                    style={[
                      styles.estadoIngredientes,
                      item.ingredientes_descontados === 1
                        ? styles.estadoDescontado
                        : styles.estadoSinDescontar,
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoEstadoIngredientes,
                        item.ingredientes_descontados === 1
                          ? styles.textoDescontado
                          : styles.textoSinDescontar,
                      ]}
                    >
                      {item.ingredientes_descontados === 1
                        ? "✓ Ingredientes descontados"
                        : "Ingredientes sin descontar"}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.botonVer}
                    onPress={() => abrirReceta(item)}
                  >
                    <Text style={styles.textoBotonVer}>
                      Ver receta
                    </Text>
                    <Text style={styles.flecha}>›</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

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
  },
  contenidoInterno: {
    padding: 23,
    paddingTop: 60,
    paddingBottom: 30,
  },
  titulo: {
    fontFamily: fuentes.titulo,
    color: colores.bosque,
    fontSize: 32,
  },
  subtitulo: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 24,
  },
  contador: {
    color: colores.gris,
    fontFamily: fuentes.negrita,
    fontSize: 12,
    marginBottom: 13,
  },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 17,
  },
  foto: {
    width: "100%",
    height: 185,
    backgroundColor: colores.compras,
  },
  fotoVacia: {
    width: "100%",
    height: 135,
    backgroundColor: colores.compras,
    alignItems: "center",
    justifyContent: "center",
  },
  iconoFoto: {
    fontSize: 35,
    color: colores.bosque,
  },
  textoFoto: {
    fontFamily: fuentes.texto,
    color: colores.gris,
    fontSize: 12,
    marginTop: 5,
  },
  detalle: {
    padding: 17,
  },
  nombreReceta: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 21,
  },
  fecha: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    marginTop: 6,
  },
  estadoIngredientes: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    marginTop: 13,
  },
  estadoDescontado: {
    backgroundColor: colores.salvia,
  },
  estadoSinDescontar: {
    backgroundColor: colores.compras,
  },
  textoEstadoIngredientes: {
    fontFamily: fuentes.negrita,
    fontSize: 10,
  },
  textoDescontado: {
    color: colores.bosque,
  },
  textoSinDescontar: {
    color: colores.carbon,
  },
  botonVer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colores.linea,
    marginTop: 15,
    paddingTop: 12,
  },
  textoBotonVer: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 13,
  },
  flecha: {
    color: colores.gris,
    fontSize: 24,
  },
  estado: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 65,
  },
  textoEstado: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 13,
    marginTop: 13,
  },
  vacio: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    marginTop: 12,
  },
  iconoVacio: {
    color: colores.salvia,
    fontSize: 48,
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
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 9,
  },
});
