import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import { recuperarPasswordLocal } from "../../db/database";
import { colores } from "../../theme";

export default function RecuperarPasswordScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);

  async function recuperar() {
    if (!nombre.trim() || !correo.trim() || !password || !confirmar) {
      Alert.alert("Campos incompletos", "Completa todos los campos.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Contraseña inválida", "Utiliza al menos 8 caracteres.");
      return;
    }

    if (password !== confirmar) {
      Alert.alert(
        "Las contraseñas no coinciden",
        "Verifica que ambas contraseñas sean iguales.",
      );
      return;
    }

    try {
      setCargando(true);

      await recuperarPasswordLocal(correo, nombre, password);

      Alert.alert(
        "¡Contraseña actualizada!",
        "Ya puedes iniciar sesión con tu nueva contraseña.",
        [
          {
            text: "Continuar",
            onPress: () => router.replace("/login"),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "No se pudo recuperar",
        error.message || "Ocurrió un error inesperado.",
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
          <Text style={styles.volver}>‹ Volver</Text>
        </Pressable>

        <View style={styles.encabezado}>
          <Text style={styles.icono}>🔐</Text>
          <Text style={styles.titulo}>Recuperar contraseña</Text>
          <Text style={styles.descripcion}>
            Ingresa los datos de tu cuenta para crear una contraseña nueva.
          </Text>
        </View>

        <View style={styles.formulario}>
          <Text style={styles.etiqueta}>Nombre de usuario</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre completo"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#999"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.etiqueta}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.etiqueta}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#999"
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry
          />

          <Pressable
            style={[styles.boton, cargando && styles.botonDeshabilitado]}
            onPress={recuperar}
            disabled={cargando}
          >
            <Text style={styles.textoBoton}>
              {cargando ? "Actualizando..." : "Cambiar contraseña"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.nota}>
          Esta recuperación funciona únicamente con la información guardada en
          este dispositivo.
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
    padding: 24,
    justifyContent: "center",
  },
  volver: {
    color: colores.bosque,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 30,
  },
  encabezado: {
    alignItems: "center",
    marginBottom: 28,
  },
  icono: {
    fontSize: 48,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 29,
    color: colores.bosque,
    fontFamily: "DMSerifDisplay_400Regular",
    textAlign: "center",
  },
  descripcion: {
    color: colores.gris,
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 21,
  },
  formulario: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 20,
  },
  etiqueta: {
    color: colores.carbon,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: colores.crema,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 49,
    color: colores.carbon,
    fontSize: 14,
  },
  boton: {
    backgroundColor: colores.bosque,
    height: 52,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBoton: {
    color: colores.blanco,
    fontWeight: "700",
    fontSize: 15,
  },
  nota: {
    color: colores.gris,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 20,
  },
});
