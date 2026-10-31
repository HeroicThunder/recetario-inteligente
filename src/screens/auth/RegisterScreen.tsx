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
  registrarUsuario,
} from "../../db/database";

export default function RegisterScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [cargando, setCargando] = useState(false);

  async function registrarse() {
    if (!nombre.trim() || !correo.trim() || !password || !confirmacion) {
      Alert.alert("Campos incompletos", "Completa todos los campos.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      Alert.alert("Correo inválido", "Escribe un correo válido.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Contraseña insegura", "Utiliza al menos 8 caracteres.");
      return;
    }

    if (password !== confirmacion) {
      Alert.alert(
        "Las contraseñas no coinciden",
        "Verifica ambas contraseñas.",
      );
      return;
    }

    try {
      setCargando(true);
      await iniciarDb();
      await inicializarAutenticacion();

      await registrarUsuario(nombre, correo, password);

      Alert.alert("¡Cuenta creada!", "Tu cuenta local de SazónIA está lista.", [
        { text: "Continuar", onPress: () => router.replace("/") },
      ]);
    } catch (error) {
      Alert.alert(
        "No se pudo crear la cuenta",
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
        <Pressable onPress={() => router.back()}>
          <Text style={styles.volver}>← Volver</Text>
        </Pressable>

        <View style={styles.logo}>
          <Text style={styles.logoIcono}>🌿</Text>
          <Text style={styles.nombre}>SazónIA</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Crea tu cuenta</Text>
          <Text style={styles.descripcion}>
            Empieza a descubrir nuevas recetas con lo que tienes en casa.
          </Text>

          <Text style={styles.etiqueta}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="¿Cómo te llamas?"
            placeholderTextColor={colores.gris}
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor={colores.gris}
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={colores.gris}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.etiqueta}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor={colores.gris}
            value={confirmacion}
            onChangeText={setConfirmacion}
            secureTextEntry
          />

          <Pressable
            style={({ pressed }) => [
              styles.boton,
              pressed && styles.presionado,
              cargando && styles.deshabilitado,
            ]}
            onPress={registrarse}
            disabled={cargando}
          >
            <Text style={styles.botonTexto}>
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </Text>
          </Pressable>

          <View style={styles.pie}>
            <Text style={styles.pieTexto}>¿Ya tienes cuenta?</Text>
            <Pressable onPress={() => router.replace("/login")}>
              <Text style={styles.enlace}> Inicia sesión</Text>
            </Pressable>
          </View>
        </View>
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
    padding: 24,
    paddingTop: 55,
    paddingBottom: 35,
  },
  volver: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
  logo: {
    alignItems: "center",
    marginTop: 22,
    marginBottom: 22,
  },
  logoIcono: {
    fontSize: 32,
  },
  nombre: {
    fontFamily: fuentes.titulo,
    fontSize: 38,
    color: colores.bosque,
  },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: radios.tarjeta,
    padding: 22,
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
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 14,
  },
  etiqueta: {
    fontFamily: fuentes.negrita,
    fontSize: 13,
    color: colores.carbon,
    marginTop: 13,
    marginBottom: 7,
  },
  input: {
    height: 49,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: radios.input,
    paddingHorizontal: 13,
    color: colores.carbon,
    fontFamily: fuentes.texto,
  },
  boton: {
    height: 52,
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
    marginTop: 22,
    flexWrap: "wrap",
  },
  pieTexto: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 12,
  },
  enlace: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },
});
