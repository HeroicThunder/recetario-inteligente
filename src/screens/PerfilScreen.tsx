
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../services/supabase";
import {
  obtenerSesion,
  cerrarSesion,
  Usuario,
} from "../db/database";
import { colores, fuentes } from "../theme";
import BarraNavegacion from "../components/BarraNavegacion";

export default function PerfilScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    obtenerSesion().then(setUsuario);
  }, []);

  function salir() {
    Alert.alert(
      "Cerrar sesión",
      "¿Quieres salir de tu cuenta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();

              if (error) throw error;

              await cerrarSesion();
              router.replace("/login");
            } catch (error) {
              console.error("Error al cerrar sesión:", error);

              Alert.alert(
                "Error",
                "No se pudo cerrar la sesión. Inténtalo nuevamente."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView
        style={styles.contenido}
        contentContainerStyle={styles.contenidoInterno}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>Mi perfil</Text>
        <Text style={styles.subtitulo}>
          Tu espacio personal en SazónIA
        </Text>

        <View style={styles.tarjeta}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {usuario?.nombre?.charAt(0).toUpperCase() || "S"}
            </Text>
          </View>

          <Text style={styles.nombre}>
            {usuario?.nombre || "Usuario"}
          </Text>

          <Text style={styles.correo}>
            {usuario?.correo || ""}
          </Text>

          <View style={styles.separador} />

          <Text style={styles.etiqueta}>Nombre de usuario</Text>
          <Text style={styles.dato}>
            {usuario?.nombre || "—"}
          </Text>

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <Text style={styles.dato}>
            {usuario?.correo || "—"}
          </Text>
        </View>

        {/* Acceso a recetas favoritas */}
        <Pressable
          style={styles.botonOpcion}
          onPress={() => router.push("/favoritos")}
        >
          <View style={styles.iconoGuardados}>
            <Text style={styles.iconoTexto}>♥</Text>
          </View>

          <View style={styles.textoOpcion}>
            <Text style={styles.tituloOpcion}>
              Mis recetas guardadas
            </Text>
            <Text style={styles.descripcionOpcion}>
              Consulta tus recetas favoritas.
            </Text>
          </View>

          <Text style={styles.flecha}>›</Text>
        </Pressable>

        {/* Acceso al historial de preparaciones */}
        <Pressable
          style={styles.botonOpcion}
          onPress={() => router.push("/historial")}
        >
          <View style={styles.iconoHistorial}>
            <Text style={styles.iconoHistorialTexto}>↻</Text>
          </View>

          <View style={styles.textoOpcion}>
            <Text style={styles.tituloOpcion}>
              Historial de preparaciones
            </Text>
            <Text style={styles.descripcionOpcion}>
              Revisa las recetas que ya has preparado.
            </Text>
          </View>

          <Text style={styles.flecha}>›</Text>
        </Pressable>


{/* Configuración de recordatorios */}
<Pressable
  style={styles.botonOpcion}
  onPress={() => router.push("/notificaciones")}
>
  <View style={styles.iconoHistorial}>
    <Text style={styles.iconoHistorialTexto}>♧</Text>
  </View>

  <View style={styles.textoOpcion}>
    <Text style={styles.tituloOpcion}>
      Recordatorios y sugerencias
    </Text>
    <Text style={styles.descripcionOpcion}>
      Configura tus avisos y sugerencias de recetas.
    </Text>
  </View>

  <Text style={styles.flecha}>›</Text>
</Pressable>


        <View style={styles.info}>
          <Text style={styles.infoIcono}>✳</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitulo}>SazónIA</Text>
            <Text style={styles.infoTexto}>
              Tu despensa inspira, nosotros te ayudamos a cocinar.
            </Text>
          </View>
        </View>

        <Pressable style={styles.botonSalir} onPress={salir}>
          <Text style={styles.textoSalir}>Cerrar sesión</Text>
        </Pressable>
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
    paddingBottom: 25,
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
    marginBottom: 25,
  },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 19,
    padding: 22,
    alignItems: "center",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colores.salvia,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 34,
  },
  nombre: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 24,
    marginTop: 12,
  },
  correo: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 13,
    marginTop: 4,
  },
  separador: {
    height: 1,
    backgroundColor: colores.linea,
    width: "100%",
    marginVertical: 22,
  },
  etiqueta: {
    alignSelf: "flex-start",
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    marginTop: 12,
  },
  dato: {
    alignSelf: "flex-start",
    color: colores.carbon,
    fontFamily: fuentes.negrita,
    fontSize: 14,
    marginTop: 5,
  },
  botonOpcion: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },
  iconoGuardados: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colores.compras,
    alignItems: "center",
    justifyContent: "center",
  },
  iconoTexto: {
    color: colores.bosque,
    fontSize: 23,
  },
  iconoHistorial: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colores.salvia,
    alignItems: "center",
    justifyContent: "center",
  },
  iconoHistorialTexto: {
    color: colores.bosque,
    fontSize: 27,
  },
  textoOpcion: {
    flex: 1,
    marginLeft: 13,
  },
  tituloOpcion: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
  descripcionOpcion: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    marginTop: 4,
  },
  flecha: {
    color: colores.gris,
    fontSize: 27,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colores.compras,
    padding: 17,
    borderRadius: 15,
    marginTop: 20,
  },
  infoIcono: {
    fontSize: 29,
    color: colores.bosque,
    marginRight: 13,
  },
  infoTitulo: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
  infoTexto: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  botonSalir: {
    marginTop: 25,
    padding: 16,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colores.terracota,
    alignItems: "center",
  },
  textoSalir: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
});
