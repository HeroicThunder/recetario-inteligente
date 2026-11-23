
import { useCallback, useState } from "react";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";

import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import * as ImagePicker from "expo-image-picker";

import {
  listarFavoritos,
  eliminarFavorito,
  actualizarFotoFavorito,
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
  procedimiento?: string[] | string;
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

  // Evitar que caracteres especiales rompan el contenido HTML del PDF.
  function escaparHTML(texto: unknown): string {
    return String(texto ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Guardar una fotografía en una receta favorita existente.
  async function guardarFotografia(id: number, uri: string) {
    try {
      await actualizarFotoFavorito(id, uri);

      setFavoritos((actuales) =>
        actuales.map((item) =>
          item.id === id
            ? { ...item, foto_uri: uri }
            : item
        )
      );

      Alert.alert(
        "Fotografía guardada",
        "La imagen se agregó correctamente a tu receta favorita."
      );
    } catch (error) {
      console.error("Error al guardar fotografía:", error);
      Alert.alert(
        "Error",
        "No se pudo guardar la fotografía."
      );
    }
  }

  // Abrir la galería.
  async function seleccionarDeGaleria(id: number) {
    try {
      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos permiso para acceder a tus fotografías."
        );
        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

      if (resultado.canceled || !resultado.assets?.length) {
        return;
      }

      await guardarFotografia(
        id,
        resultado.assets[0].uri
      );
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert(
        "Error",
        "No se pudo seleccionar la imagen de la galería."
      );
    }
  }

  // Tomar una fotografía con la cámara.
  async function tomarFotografia(id: number) {
    try {
      const permiso =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos permiso para utilizar la cámara."
        );
        return;
      }

      const resultado =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

      if (resultado.canceled || !resultado.assets?.length) {
        return;
      }

      await guardarFotografia(
        id,
        resultado.assets[0].uri
      );
    } catch (error) {
      console.error("Error al tomar fotografía:", error);
      Alert.alert(
        "Error",
        "No se pudo tomar la fotografía."
      );
    }
  }

  // Mostrar las opciones para agregar o cambiar fotografía.
  function mostrarOpcionesFotografia(item: RecetaGuardada) {
    Alert.alert(
      item.foto_uri
        ? "Cambiar fotografía"
        : "Agregar fotografía",
      "¿Cómo quieres agregar la imagen a esta receta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Elegir de galería",
          onPress: () => seleccionarDeGaleria(item.id),
        },
        {
          text: "Tomar fotografía",
          onPress: () => tomarFotografia(item.id),
        },
      ]
    );
  }

  
  // Generar un PDF con la fotografía y la información de la receta.
  async function compartirRecetaPDF(item: RecetaGuardada) {
    try {
      const receta = obtenerDatos(item.receta_json);

      if (!receta) {
        Alert.alert(
          "Error",
          "No se pudieron leer los datos de esta receta."
        );
        return;
      }

      // Preparar fotografía para incluirla dentro del PDF.
      let imagenHTML = `
        <div class="sin-foto">
          Esta receta todavía no tiene fotografía.
        </div>
      `;

      if (item.foto_uri) {
        const extension = item.foto_uri.split("?")[0].toLowerCase();

        const mimeType = extension.endsWith(".png")
          ? "image/png"
          : "image/jpeg";

        const imagenBase64 = await FileSystem.readAsStringAsync(
          item.foto_uri,
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );

        imagenHTML = `
          <img
            class="foto"
            src="data:${mimeType};base64,${imagenBase64}"
          />
        `;
      }

      // Preparar ingredientes.
      const ingredientesHTML =
        receta.ingredientes
          ?.map(
            (ingrediente) => `
              <li>
                <strong>${escaparHTML(ingrediente.nombre)}</strong>
                - ${escaparHTML(ingrediente.cantidad)}
                ${escaparHTML(ingrediente.unidad)}
              </li>
            `
          )
          .join("") || "<li>No especificados</li>";

      // Preparar pasos de elaboración.
      const pasos = Array.isArray(receta.procedimiento)
        ? receta.procedimiento
        : typeof receta.procedimiento === "string"
          ? receta.procedimiento.split("\n")
          : [];

      const procedimientoHTML = pasos
        .filter((paso) => paso.trim().length > 0)
        .map((paso) => `<li>${escaparHTML(paso)}</li>`)
        .join("");

      // Crear contenido HTML del PDF.
      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 28px;
              color: #333333;
            }

            h1 {
              color: #526b50;
              text-align: center;
              margin-bottom: 10px;
            }

            h2 {
              color: #526b50;
              border-bottom: 1px solid #d8dfd3;
              padding-bottom: 7px;
              margin-top: 25px;
            }

            .descripcion {
              text-align: center;
              color: #666666;
              line-height: 1.5;
              margin-bottom: 20px;
            }

            .foto {
              width: 100%;
              max-height: 300px;
              object-fit: cover;
              border-radius: 12px;
              margin: 15px 0;
            }

            .sin-foto {
              padding: 25px;
              background: #f1f3ee;
              text-align: center;
              color: #777777;
              margin: 15px 0;
            }

            .datos {
              text-align: center;
              color: #666666;
              margin: 15px 0;
            }

            li {
              margin-bottom: 10px;
              line-height: 1.5;
            }

            .pie {
              text-align: center;
              margin-top: 35px;
              color: #888888;
              font-size: 12px;
            }
          </style>
        </head>

        <body>
          <h1>${escaparHTML(receta.nombre || "Receta de SazónIA")}</h1>

          <p class="descripcion">
            ${escaparHTML(receta.descripcion || "Una deliciosa receta.")}
          </p>

          ${imagenHTML}

          <div class="datos">
            Tiempo: ${escaparHTML(receta.tiempo_minutos ?? "—")} minutos
            &nbsp; | &nbsp;
            Dificultad: ${escaparHTML(receta.dificultad || "—")}
          </div>

          <h2>Ingredientes</h2>
          <ul>
            ${ingredientesHTML}
          </ul>

          <h2>Preparación</h2>
          <ol>
            ${procedimientoHTML || "<li>No especificada</li>"}
          </ol>

          <p class="pie">
            Receta compartida desde SazónIA
          </p>
        </body>
        </html>
      `;

      
      // Generar el PDF y obtener también su contenido en Base64.
      const archivo = await Print.printToFileAsync({
        html,
        base64: true,
      });

      console.log("PDF generado correctamente.");

      // Verificar que se obtuvo el contenido.
      if (!archivo.base64) {
        throw new Error("No se pudo obtener el contenido del PDF.");
      }

      // Guardar una copia dentro del almacenamiento de SazónIA.
      if (!FileSystem.documentDirectory) {
        throw new Error("No se encontró el almacenamiento de la aplicación.");
      }

      const pdfDestino =
        `${FileSystem.documentDirectory}SazonIA_Receta_${Date.now()}.pdf`;

      await FileSystem.writeAsStringAsync(
        pdfDestino,
        archivo.base64,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      console.log("PDF guardado:", pdfDestino);

      // Comprobar disponibilidad para compartir.
      const disponible = await Sharing.isAvailableAsync();

      if (!disponible) {
        Alert.alert(
          "No disponible",
          "Tu dispositivo no permite compartir archivos."
        );
        return;
      }

      // Compartir el archivo guardado.
      await Sharing.shareAsync(pdfDestino, {
        mimeType: "application/pdf",
        dialogTitle: "Compartir receta de SazónIA",
        UTI: "com.adobe.pdf",
      });

      console.log("Menú de compartir abierto correctamente.");


    } catch (error) {
      console.error("Error al compartir receta PDF:", error);

      Alert.alert(
        "Error",
        "No se pudo generar o compartir el PDF de la receta."
      );
    }
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

        <Text style={styles.titulo}>
          Mis recetas guardadas
        </Text>

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

                  {/* Fotografía de la receta */}
                  {item.foto_uri ? (
                    <Image
                      source={{ uri: item.foto_uri }}
                      style={styles.fotoFavorito}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.sinFoto}>
                      <Text style={styles.textoSinFoto}>
                        ♡ Esta receta aún no tiene fotografía
                      </Text>
                    </View>
                  )}

                  {/* Agregar o cambiar fotografía */}
                  <Pressable
                    style={styles.botonFoto}
                    onPress={() =>
                      mostrarOpcionesFotografia(item)
                    }
                  >
                    <Text style={styles.textoBotonFoto}>
                      {item.foto_uri
                        ? "📷 Cambiar fotografía"
                        : "＋ Agregar fotografía"}
                    </Text>
                  </Pressable>

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

                  {/* Único botón para compartir receta y fotografía */}
                  <Pressable
                    style={styles.botonCompartir}
                    onPress={() => compartirRecetaPDF(item)}
                  >
                    <Text style={styles.textoBotonCompartir}>
                      ↗ Compartir receta
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
  fotoFavorito: {
    width: "100%",
    height: 190,
    borderRadius: 13,
    marginTop: 14,
    backgroundColor: colores.compras,
  },
  sinFoto: {
    height: 85,
    borderRadius: 13,
    marginTop: 14,
    backgroundColor: colores.crema,
    alignItems: "center",
    justifyContent: "center",
  },
  textoSinFoto: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 12,
  },
  botonFoto: {
    backgroundColor: colores.salvia,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 11,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotonFoto: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 12,
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
  botonCompartir: {
    backgroundColor: colores.compras,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotonCompartir: {
    color: colores.bosque,
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
