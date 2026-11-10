import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

import { obtenerSesion, cerrarSesion, Usuario } from "../db/database";

import { colores, fuentes } from "../theme";
import BarraNavegacion from "../components/BarraNavegacion";

export default function PerfilScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    obtenerSesion().then(setUsuario);
  }, []);

  function salir() {
    Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await cerrarSesion();
          router.replace("/login");
        },
      },
    ]);
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.contenido}>
        <Text style={styles.titulo}>Mi perfil</Text>
        <Text style={styles.subtitulo}>Tu espacio personal en SazónIA</Text>

        <View style={styles.tarjeta}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {usuario?.nombre?.charAt(0).toUpperCase() || "S"}
            </Text>
          </View>

          <Text style={styles.nombre}>{usuario?.nombre || "Usuario"}</Text>

          <Text style={styles.correo}>{usuario?.correo || ""}</Text>

          <View style={styles.separador} />

          <Text style={styles.etiqueta}>Nombre de usuario</Text>
          <Text style={styles.dato}>{usuario?.nombre || "—"}</Text>

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <Text style={styles.dato}>{usuario?.correo || "—"}</Text>
        </View>

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
    padding: 23,
    paddingTop: 60,
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
