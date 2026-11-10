import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { colores, fuentes, radios } from "../../theme";
import {
  iniciarDb,
  inicializarAutenticacion,
  iniciarSesionLocal,
} from "../../db/database";

export default function LoginScreen() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    if (!correo.trim() || !password) {
      Alert.alert("Campos incompletos", "Escribe tu correo y contraseña.");
      return;
    }

    try {
      setCargando(true);
      await iniciarDb();
      await inicializarAutenticacion();
      await iniciarSesionLocal(correo, password);
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "No se pudo iniciar sesión",
        error instanceof Error ? error.message : "Ocurrió un error.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <Text style={styles.logoIcono}>🌿</Text>
          <Text style={styles.nombre}>SazónIA</Text>
          <Text style={styles.eslogan}>
            Tu despensa inspira, nosotros te ayudamos a cocinar.
          </Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>¡Qué gusto verte!</Text>
          <Text style={styles.descripcion}>
            Inicia sesión para descubrir qué puedes cocinar hoy.
          </Text>

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor={colores.gris}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={correo}
            onChangeText={setCorreo}
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu contraseña"
            placeholderTextColor={colores.gris}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={({ pressed }) => [
              styles.boton,
              pressed && styles.presionado,
              cargando && styles.deshabilitado,
            ]}
            onPress={entrar}
            disabled={cargando}
          >
            <Text style={styles.botonTexto}>
              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push("/recuperar")}>
            <Text style={styles.enlace}> ¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/recuperar")}
            style={{ alignItems: "center", marginTop: 18 }}
          >
            <Text
              style={{
                color: colores.bosque,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Text>
          </Pressable>

          <View style={styles.pie}>
            <Text style={styles.pieTexto}>¿Todavía no tienes cuenta?</Text>
            <Pressable onPress={() => router.push("/register")}>
              <Text style={styles.enlace}> Regístrate</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.pieMarca}>
          Cocina rico. Cocina con lo que tienes.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.crema,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 55,
    paddingBottom: 35,
  },
  logo: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoIcono: {
    fontSize: 38,
    marginBottom: 5,
  },
  nombre: {
    fontFamily: fuentes.titulo,
    fontSize: 43,
    color: colores.bosque,
  },
  eslogan: {
    fontFamily: fuentes.texto,
    color: colores.gris,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: radios.tarjeta,
    padding: 23,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  titulo: {
    fontFamily: fuentes.titulo,
    fontSize: 29,
    color: colores.bosque,
  },
  descripcion: {
    fontFamily: fuentes.texto,
    fontSize: 13,
    color: colores.gris,
    marginTop: 5,
    marginBottom: 24,
    lineHeight: 20,
  },
  etiqueta: {
    fontFamily: fuentes.negrita,
    fontSize: 13,
    color: colores.carbon,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 51,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: radios.input,
    paddingHorizontal: 14,
    color: colores.carbon,
    fontFamily: fuentes.texto,
    backgroundColor: colores.blanco,
  },
  boton: {
    height: 53,
    backgroundColor: colores.bosque,
    borderRadius: radios.boton,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  botonTexto: {
    color: colores.blanco,
    fontFamily: fuentes.negrita,
    fontSize: 15,
  },
  presionado: {
    opacity: 0.8,
  },
  deshabilitado: {
    opacity: 0.6,
  },
  pie: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 23,
    flexWrap: "wrap",
  },
  pieTexto: {
    fontFamily: fuentes.texto,
    color: colores.gris,
    fontSize: 12,
  },
  enlace: {
    fontFamily: fuentes.negrita,
    color: colores.terracota,
    fontSize: 12,
  },
  pieMarca: {
    textAlign: "center",
    marginTop: 25,
    fontFamily: fuentes.texto,
    color: colores.gris,
    fontSize: 11,
  },
});
