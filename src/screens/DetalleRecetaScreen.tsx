
import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  iniciarDb,
  inicializarAutenticacion,
  finalizarPreparacion,
  obtenerFaltantesReceta,
  agregarFaltantesACompras,
  type FaltanteReceta,
} from "../db/database";

import { colores, fuentes } from "../theme";
import BarraNavegacion from "../components/BarraNavegacion";

import type { Receta } from "../types/receta";

type RecetaCompleta = Receta & {
  disponibles?: Receta["ingredientes"];
  faltantes?: Receta["ingredientes"];
  porcentaje?: number;
};

export default function DetalleRecetaScreen() {
  const router = useRouter();

  const { receta: parametro } = useLocalSearchParams<{
    receta?: string;
  }>();

  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [faltantesActuales, setFaltantesActuales] =
    useState<FaltanteReceta[] | null>(null);

  const [cargandoDisponibilidad, setCargandoDisponibilidad] =
    useState(true);

  const [enviandoCompras, setEnviandoCompras] = useState(false);

  const [errorDisponibilidad, setErrorDisponibilidad] =
    useState<string | null>(null);

  let receta: RecetaCompleta | null = null;

  try {
    if (parametro) {
      receta = JSON.parse(parametro) as RecetaCompleta;
    }
  } catch (error) {
    console.error("Error al abrir la receta:", error);
  }

  // CONSULTAR DESPENSA CADA VEZ QUE SE ABRE O RECUPERA LA PANTALLA
  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function revisarDespensa() {
        if (!receta) {
          setCargandoDisponibilidad(false);
          return;
        }

        try {
          setCargandoDisponibilidad(true);
          setErrorDisponibilidad(null);
          setFaltantesActuales(null);

          await iniciarDb();
          await inicializarAutenticacion();

          const resultado = await obtenerFaltantesReceta(receta);

          if (activo) {
            setFaltantesActuales(resultado);
          }
        } catch (error) {
          console.error("Error consultando la despensa:", error);

          if (activo) {
            setErrorDisponibilidad(
              error instanceof Error
                ? error.message
                : "No se pudo consultar tu Despensa."
            );
          }
        } finally {
          if (activo) {
            setCargandoDisponibilidad(false);
          }
        }
      }

      revisarDespensa();

      return () => {
        activo = false;
      };
    }, [parametro])
  );

  // TOMAR FOTOGRAFÍA
  async function tomarFotografia() {
    try {
      const permiso =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tu cámara para tomar una fotografía."
        );
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets.length > 0) {
        setFotoUri(resultado.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al abrir la cámara:", error);

      Alert.alert(
        "Error",
        "No se pudo abrir la cámara. Inténtalo nuevamente."
      );
    }
  }

  // ELEGIR FOTOGRAFÍA DE GALERÍA
  async function elegirFotografia() {
    try {
      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tu galería para seleccionar una fotografía."
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

      if (!resultado.canceled && resultado.assets.length > 0) {
        setFotoUri(resultado.assets[0].uri);
      }
    } catch (error) {
      console.error("Error al abrir la galería:", error);

      Alert.alert(
        "Error",
        "No se pudo abrir la galería. Inténtalo nuevamente."
      );
    }
  }

  // OPCIONES DE FOTOGRAFÍA
  function seleccionarFotografia() {
    Alert.alert(
      "Fotografía de tu preparación",
      "¿Cómo quieres agregar una fotografía?",
      [
        {
          text: "Tomar fotografía",
          onPress: tomarFotografia,
        },
        {
          text: "Elegir de galería",
          onPress: elegirFotografia,
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  }

  // ENVIAR INGREDIENTES FALTANTES A SÚPER
  async function enviarFaltantesASuper() {
    if (
      !receta ||
      enviandoCompras ||
      cargandoDisponibilidad
    ) {
      return;
    }

    try {
      setEnviandoCompras(true);

      const resultado = await agregarFaltantesACompras(receta);

      setFaltantesActuales(resultado);

      if (resultado.length === 0) {
        Alert.alert(
          "¡Ya tienes todo!",
          "Todos los ingredientes de esta receta están disponibles en tu Despensa."
        );
        return;
      }

      Alert.alert(
        "¡Lista actualizada!",
        `Se agregaron o actualizaron ${resultado.length} ingrediente(s) en tu lista de Súper.`,
        [
          {
            text: "Ir a Súper",
            onPress: () => router.push("/super"),
          },
          {
            text: "Seguir aquí",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error agregando faltantes:", error);

      Alert.alert(
        "No se pudo actualizar Súper",
        error instanceof Error
          ? error.message
          : "Inténtalo nuevamente."
      );
    } finally {
      setEnviandoCompras(false);
    }
  }

  // MARCAR RECETA COMO PREPARADA
  async function marcarComoPreparada() {
    if (
      !receta ||
      guardando ||
      cargandoDisponibilidad ||
      faltantesActuales === null ||
      faltantesActuales.length > 0 ||
      !!errorDisponibilidad
    ) {
      return;
    }

    try {
      setGuardando(true);

      await finalizarPreparacion(
        receta.nombre,
        receta,
        fotoUri
      );

      Alert.alert(
        "¡Preparación guardada!",
        "Tu receta se registró correctamente y los ingredientes utilizados fueron descontados de tu Despensa.",
        [
          {
            text: "Ver historial",
            onPress: () => router.replace("/historial"),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error al guardar la preparación:", error);

      Alert.alert(
        "No se pudo finalizar",
        error instanceof Error
          ? error.message
          : "Ocurrió un error al descontar los ingredientes."
      );
    } finally {
      setGuardando(false);
    }
  }

  // VALIDAR RECETA
  if (!receta) {
    return (
      <View style={s.pantalla}>
        <Text style={s.error}>
          No se pudo cargar esta receta.
        </Text>

        <Pressable onPress={() => router.back()}>
          <Text style={s.volver}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const procedimiento = Array.isArray(receta.procedimiento)
    ? receta.procedimiento
    : [];

  const puedePreparar =
    !guardando &&
    !cargandoDisponibilidad &&
    faltantesActuales !== null &&
    faltantesActuales.length === 0 &&
    !errorDisponibilidad;

  return (
    <View style={s.pantalla}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.contenido}
      >
        <Pressable
          style={s.botonVolver}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/sugerencias");
            }
          }}
        >
          <Text style={s.textoVolver}>← Regresar</Text>
        </Pressable>

        <Text style={s.etiqueta}>RECETA SAZÓNIA</Text>

        <Text style={s.titulo}>{receta.nombre}</Text>

        <Text style={s.descripcion}>
          {receta.descripcion}
        </Text>

        {/* RESUMEN */}
        <View style={s.resumen}>
          <View style={s.resumenItem}>
            <Text style={s.resumenIcono}>◷</Text>
            <Text style={s.resumenValor}>
              {receta.tiempo_minutos} min
            </Text>
            <Text style={s.resumenEtiqueta}>Tiempo</Text>
          </View>

          <View style={s.divisor} />

          <View style={s.resumenItem}>
            <Text style={s.resumenIcono}>✳</Text>
            <Text style={s.resumenValor}>
              {receta.dificultad?.toUpperCase()}
            </Text>
            <Text style={s.resumenEtiqueta}>Dificultad</Text>
          </View>

          {receta.porcentaje !== undefined && (
            <>
              <View style={s.divisor} />

              <View style={s.resumenItem}>
                <Text style={s.resumenIcono}>✓</Text>
                <Text style={s.resumenValor}>
                  {receta.porcentaje}%
                </Text>
                <Text style={s.resumenEtiqueta}>
                  Disponible
                </Text>
              </View>
            </>
          )}
        </View>

        {/* INGREDIENTES */}
        <View style={s.seccion}>
          <Text style={s.tituloSeccion}>
            Ingredientes
          </Text>

          <Text style={s.textoSeccion}>
            Todo lo que necesitas para preparar esta receta.
          </Text>

          {receta.ingredientes?.map((ingrediente, index) => (
            <View
              key={`${ingrediente.nombre}-${index}`}
              style={s.ingrediente}
            >
              <View style={s.punto} />

              <View style={s.ingredienteTexto}>
                <Text style={s.nombreIngrediente}>
                  {ingrediente.nombre}
                </Text>
              </View>

              <Text style={s.cantidad}>
                {ingrediente.cantidad} {ingrediente.unidad}
              </Text>
            </View>
          ))}

          {/* ESTADO DE DESPENSA */}
          <View style={s.estadoDespensa}>
            {cargandoDisponibilidad ? (
              <View style={s.contenidoEstado}>
                <ActivityIndicator color={colores.bosque} />

                <Text style={s.textoEstado}>
                  Revisando tu Despensa...
                </Text>
              </View>
            ) : errorDisponibilidad ? (
              <View style={s.avisoError}>
                <Text style={s.tituloAviso}>
                  No se pudo revisar tu Despensa
                </Text>

                <Text style={s.textoAviso}>
                  {errorDisponibilidad}
                </Text>
              </View>
            ) : faltantesActuales &&
              faltantesActuales.length > 0 ? (
              <View style={s.avisoFaltantes}>
                <Text style={s.tituloAviso}>
                  Te faltan ingredientes
                </Text>

                <Text style={s.textoAviso}>
                  Estos ingredientes no están disponibles
                  en las cantidades necesarias:
                </Text>

                {faltantesActuales.map((item, index) => (
                  <View
                    key={`${item.nombre}-${index}`}
                    style={s.faltanteFila}
                  >
                    <Text style={s.nombreFaltante}>
                      • {item.nombre}
                    </Text>

                    <Text style={s.cantidadFaltante}>
                      {item.cantidad} {item.unidad}
                    </Text>
                  </View>
                ))}

                <Pressable
                  style={[
                    s.botonSuper,
                    enviandoCompras && s.botonDeshabilitado,
                  ]}
                  onPress={enviarFaltantesASuper}
                  disabled={enviandoCompras}
                >
                  {enviandoCompras ? (
                    <View style={s.contenidoGuardando}>
                      <ActivityIndicator color={colores.blanco} />

                      <Text style={s.textoBotonSuper}>
                        Actualizando Súper...
                      </Text>
                    </View>
                  ) : (
                    <Text style={s.textoBotonSuper}>
                      + Agregar faltantes a Súper
                    </Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <View style={s.avisoDisponible}>
                <Text style={s.tituloDisponible}>
                  ✓ ¡Tienes todos los ingredientes!
                </Text>

                <Text style={s.textoDisponible}>
                  Tu Despensa cuenta con lo necesario
                  para preparar esta receta.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* PREPARACIÓN */}
        <View style={s.seccion}>
          <Text style={s.tituloSeccion}>
            Preparación
          </Text>

          <Text style={s.textoSeccion}>
            Sigue estos pasos para preparar tu platillo.
          </Text>

          {procedimiento.length > 0 ? (
            procedimiento.map((paso, index) => (
              <View
                key={`paso-${index}`}
                style={s.paso}
              >
                <View style={s.numeroPaso}>
                  <Text style={s.numeroTexto}>
                    {index + 1}
                  </Text>
                </View>

                <Text style={s.textoPaso}>
                  {paso}
                </Text>
              </View>
            ))
          ) : (
            <View style={s.avisoAntigua}>
              <Text style={s.textoAntigua}>
                Esta receta fue guardada antes de incorporar
                los procedimientos completos. Por eso no tiene
                pasos de preparación almacenados.
              </Text>
            </View>
          )}
        </View>

        {/* FOTOGRAFÍA */}
        <View style={s.seccion}>
          <Text style={s.tituloSeccion}>
            Tu preparación
          </Text>

          <Text style={s.textoSeccion}>
            ¿Cómo quedó tu platillo? Puedes agregar una
            fotografía para conservar el recuerdo.
          </Text>

          {fotoUri ? (
            <View>
              <Image
                source={{ uri: fotoUri }}
                style={s.vistaPrevia}
                resizeMode="cover"
              />

              <Pressable
                style={s.botonCambiarFoto}
                onPress={seleccionarFotografia}
                disabled={guardando}
              >
                <Text style={s.textoCambiarFoto}>
                  Cambiar fotografía
                </Text>
              </Pressable>

              <Pressable
                style={s.botonQuitarFoto}
                onPress={() => setFotoUri(null)}
                disabled={guardando}
              >
                <Text style={s.textoQuitarFoto}>
                  Quitar fotografía
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={s.botonFoto}
              onPress={seleccionarFotografia}
              disabled={guardando}
            >
              <Text style={s.iconoBotonFoto}>＋</Text>

              <Text style={s.textoBotonFoto}>
                Agregar fotografía
              </Text>
            </Pressable>
          )}
        </View>

        {/* FINALIZAR RECETA */}
        <Pressable
          style={[
            s.botonPreparada,
            !puedePreparar && s.botonDeshabilitado,
          ]}
          onPress={marcarComoPreparada}
          disabled={!puedePreparar}
        >
          {guardando ? (
            <View style={s.contenidoGuardando}>
              <ActivityIndicator color={colores.blanco} />

              <Text style={s.textoBotonPreparada}>
                Guardando preparación...
              </Text>
            </View>
          ) : (
            <Text style={s.textoBotonPreparada}>
              ✓ Marcar como preparada
            </Text>
          )}
        </Pressable>

        {!puedePreparar && !guardando && (
          <Text style={s.textoBloqueo}>
            {cargandoDisponibilidad
              ? "Espera mientras revisamos tu Despensa."
              : errorDisponibilidad
                ? "No es posible finalizar sin verificar los ingredientes."
                : faltantesActuales && faltantesActuales.length > 0
                  ? "Agrega los ingredientes faltantes a tu Despensa antes de finalizar."
                  : "No se pudo verificar la disponibilidad de los ingredientes."}
          </Text>
        )}

        <View style={s.nota}>
          <Text style={s.notaIcono}>✳</Text>

          <Text style={s.notaTexto}>
            ¡Disfruta tu preparación! Tu cocina, tus ingredientes
            y tus recetas en un solo lugar.
          </Text>
        </View>
      </ScrollView>

      <BarraNavegacion />
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.crema,
  },
  contenido: {
    padding: 22,
    paddingTop: 55,
    paddingBottom: 30,
  },
  botonVolver: {
    alignSelf: "flex-start",
    marginBottom: 22,
  },
  textoVolver: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
  etiqueta: {
    color: colores.salvia,
    fontFamily: fuentes.negrita,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 9,
  },
  titulo: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 34,
  },
  descripcion: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 9,
  },
  resumen: {
    flexDirection: "row",
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 16,
    marginTop: 22,
    justifyContent: "space-around",
    alignItems: "center",
  },
  resumenItem: {
    alignItems: "center",
    flex: 1,
  },
  resumenIcono: {
    color: colores.salvia,
    fontSize: 22,
    marginBottom: 5,
  },
  resumenValor: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },
  resumenEtiqueta: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 10,
    marginTop: 4,
  },
  divisor: {
    width: 1,
    height: 40,
    backgroundColor: colores.linea,
  },
  seccion: {
    backgroundColor: colores.blanco,
    borderRadius: 17,
    padding: 18,
    marginTop: 20,
  },
  tituloSeccion: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 24,
  },
  textoSeccion: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 16,
    lineHeight: 18,
  },
  ingrediente: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colores.salvia,
    marginRight: 12,
  },
  ingredienteTexto: {
    flex: 1,
  },
  nombreIngrediente: {
    color: colores.carbon,
    fontFamily: fuentes.texto,
    fontSize: 14,
  },
  cantidad: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },

  // DISPONIBILIDAD DE INGREDIENTES
  estadoDespensa: {
    marginTop: 18,
  },
  contenidoEstado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    backgroundColor: colores.compras,
    borderRadius: 12,
  },
  textoEstado: {
    color: colores.bosque,
    fontFamily: fuentes.texto,
    fontSize: 12,
  },
  avisoFaltantes: {
    padding: 15,
    backgroundColor: "#F9EDE7",
    borderRadius: 12,
  },
  avisoError: {
    padding: 15,
    backgroundColor: "#F9EDE7",
    borderRadius: 12,
  },
  tituloAviso: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 14,
    marginBottom: 7,
  },
  textoAviso: {
    color: colores.carbon,
    fontFamily: fuentes.texto,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 10,
  },
  faltanteFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colores.linea,
  },
  nombreFaltante: {
    flex: 1,
    color: colores.carbon,
    fontFamily: fuentes.texto,
    fontSize: 13,
  },
  cantidadFaltante: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },
  botonSuper: {
    backgroundColor: colores.bosque,
    padding: 14,
    borderRadius: 11,
    alignItems: "center",
    marginTop: 15,
  },
  textoBotonSuper: {
    color: colores.blanco,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },
  avisoDisponible: {
    padding: 15,
    backgroundColor: "#EAF0E5",
    borderRadius: 12,
  },
  tituloDisponible: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 14,
    marginBottom: 6,
  },
  textoDisponible: {
    color: colores.bosque,
    fontFamily: fuentes.texto,
    fontSize: 12,
    lineHeight: 19,
  },
  textoBloqueo: {
    color: colores.terracota,
    fontFamily: fuentes.texto,
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 17,
  },

  // PREPARACIÓN
  paso: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  numeroPaso: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colores.compras,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  numeroTexto: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
  textoPaso: {
    flex: 1,
    color: colores.carbon,
    fontFamily: fuentes.texto,
    fontSize: 14,
    lineHeight: 22,
    paddingTop: 4,
  },
  avisoAntigua: {
    padding: 14,
    backgroundColor: colores.compras,
    borderRadius: 12,
  },
  textoAntigua: {
    color: colores.bosque,
    fontFamily: fuentes.texto,
    fontSize: 12,
    lineHeight: 19,
  },

  // FOTOGRAFÍA
  vistaPrevia: {
    width: "100%",
    height: 210,
    borderRadius: 13,
    backgroundColor: colores.compras,
  },
  botonFoto: {
    minHeight: 105,
    borderWidth: 1,
    borderColor: colores.salvia,
    borderStyle: "dashed",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.crema,
  },
  iconoBotonFoto: {
    color: colores.bosque,
    fontSize: 30,
    marginBottom: 5,
  },
  textoBotonFoto: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 13,
  },
  botonCambiarFoto: {
    backgroundColor: colores.compras,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  textoCambiarFoto: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },
  botonQuitarFoto: {
    padding: 10,
    alignItems: "center",
    marginTop: 3,
  },
  textoQuitarFoto: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },

  // FINALIZAR
  botonPreparada: {
    backgroundColor: colores.bosque,
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 22,
  },
  botonDeshabilitado: {
    opacity: 0.45,
  },
  contenidoGuardando: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textoBotonPreparada: {
    color: colores.blanco,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
  nota: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colores.compras,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  notaIcono: {
    color: colores.bosque,
    fontSize: 23,
    marginRight: 12,
  },
  notaTexto: {
    flex: 1,
    color: colores.bosque,
    fontFamily: fuentes.texto,
    fontSize: 12,
    lineHeight: 19,
  },
  error: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 16,
    margin: 25,
  },
  volver: {
    color: colores.bosque,
    marginHorizontal: 25,
    fontFamily: fuentes.negrita,
  },
});
