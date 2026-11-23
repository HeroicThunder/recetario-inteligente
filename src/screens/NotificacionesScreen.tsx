
import { useState } from "react";
import {
  View,
  Text,
  Switch,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

import { colores, fuentes } from "../theme";
import { useNotificaciones } from "../hooks/useNotificaciones";

export default function NotificacionesScreen() {
  const router = useRouter();

  const {
    preferencias,
    cargando,
    cambiarRecordatorio,
    cambiarHora,
    cambiarSugerencias,
  } = useNotificaciones();

  const [mostrarHora, setMostrarHora] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const fechaHora = new Date();
  fechaHora.setHours(preferencias.hora);
  fechaHora.setMinutes(preferencias.minuto);

  const horaFormateada = fechaHora.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  
async function ejecutarCambio(accion: () => Promise<void>) {
  try {
    setProcesando(true);
    await accion();
  } catch (error) {
    console.error("Error en configuración de notificaciones:", error);

    Alert.alert(
      "Permisos de notificaciones",
      "SazónIA necesita que habilites los permisos de notificaciones desde los ajustes de Android.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Abrir ajustes",
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  } finally {
    setProcesando(false);
  }
}


  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.botonVolver}
          onPress={() => router.back()}
        >
          <Text style={styles.textoVolver}>‹  Volver</Text>
        </Pressable>

        <Text style={styles.titulo}>Recordatorios</Text>

        <Text style={styles.subtitulo}>
          Personaliza cuándo quieres recibir avisos de SazónIA.
        </Text>

        {/* Recordatorio diario */}
        <View style={styles.tarjeta}>
          <View style={styles.fila}>
            <View style={styles.iconoRecordatorio}>
              <Text style={styles.icono}>◷</Text>
            </View>

            <View style={styles.textoContenedor}>
              <Text style={styles.tituloOpcion}>
                Recordatorio diario
              </Text>
              <Text style={styles.descripcion}>
                Recibe un aviso para preparar tus comidas.
              </Text>
            </View>

            <Switch
              value={preferencias.recordatorioActivado}
              disabled={cargando || procesando}
              onValueChange={(valor) =>
                ejecutarCambio(() => cambiarRecordatorio(valor))
              }
              trackColor={{
                false: colores.linea,
                true: colores.salvia,
              }}
              thumbColor={colores.blanco}
            />
          </View>

          <View style={styles.separador} />

          <Pressable
            style={[
              styles.selectorHora,
              !preferencias.recordatorioActivado && styles.deshabilitado,
            ]}
            disabled={
              !preferencias.recordatorioActivado ||
              cargando ||
              procesando
            }
            onPress={() => setMostrarHora(true)}
          >
            <View>
              <Text style={styles.etiqueta}>Hora del recordatorio</Text>
              <Text style={styles.hora}>{horaFormateada}</Text>
            </View>

            <Text style={styles.cambiarHora}>Cambiar ›</Text>
          </Pressable>

          {mostrarHora && (
            <DateTimePicker
              value={fechaHora}
              mode="time"
              display="default"
              onChange={(evento, fechaSeleccionada) => {
                setMostrarHora(false);

                if (evento.type === "set" && fechaSeleccionada) {
                  ejecutarCambio(() =>
                    cambiarHora(
                      fechaSeleccionada.getHours(),
                      fechaSeleccionada.getMinutes()
                    )
                  );
                }
              }}
            />
          )}
        </View>

        {/* Sugerencias de recetas */}
        <View style={styles.tarjeta}>
          <View style={styles.fila}>
            <View style={styles.iconoSugerencias}>
              <Text style={styles.icono}>✳</Text>
            </View>

            <View style={styles.textoContenedor}>
              <Text style={styles.tituloOpcion}>
                Sugerencias de recetas
              </Text>
              <Text style={styles.descripcion}>
                Recibe ideas para descubrir qué cocinar.
              </Text>
            </View>

            <Switch
              value={preferencias.sugerenciasActivadas}
              disabled={cargando || procesando}
              onValueChange={(valor) =>
                ejecutarCambio(() => cambiarSugerencias(valor))
              }
              trackColor={{
                false: colores.linea,
                true: colores.salvia,
              }}
              thumbColor={colores.blanco}
            />
          </View>

          <View style={styles.separador} />

          <Text style={styles.nota}>
            Las sugerencias se enviarán diariamente a las 12:00 PM.
          </Text>
        </View>

        <View style={styles.informacion}>
          <Text style={styles.infoIcono}>✦</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitulo}>
              Tú decides cuándo
            </Text>
            <Text style={styles.infoTexto}>
              Puedes activar o desactivar estas notificaciones
              cuando quieras desde tu perfil.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.crema,
  },
  contenido: {
    padding: 23,
    paddingTop: 55,
    paddingBottom: 35,
  },
  botonVolver: {
    marginBottom: 24,
  },
  textoVolver: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 16,
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
    marginTop: 5,
    marginBottom: 25,
    lineHeight: 20,
  },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconoRecordatorio: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: colores.compras,
    alignItems: "center",
    justifyContent: "center",
  },
  iconoSugerencias: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: colores.salvia,
    alignItems: "center",
    justifyContent: "center",
  },
  icono: {
    color: colores.bosque,
    fontSize: 25,
  },
  textoContenedor: {
    flex: 1,
    marginLeft: 12,
    marginRight: 5,
  },
  tituloOpcion: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
  descripcion: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  separador: {
    height: 1,
    backgroundColor: colores.linea,
    marginVertical: 17,
  },
  selectorHora: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deshabilitado: {
    opacity: 0.4,
  },
  etiqueta: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
  },
  hora: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 23,
    marginTop: 4,
  },
  cambiarHora: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },
  nota: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    lineHeight: 17,
  },
  informacion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colores.compras,
    borderRadius: 15,
    padding: 17,
    marginTop: 5,
  },
  infoIcono: {
    fontSize: 27,
    color: colores.bosque,
    marginRight: 13,
  },
  infoTitulo: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 13,
  },
  infoTexto: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
});
