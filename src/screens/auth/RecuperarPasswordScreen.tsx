import Constants, { ExecutionEnvironment } from "expo-constants";
import { useState } from "react";
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

import { useRouter, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";

import { supabase } from "../../services/supabase";
import { colores } from "../../theme";

export default function RecuperarPasswordScreen() {
  const router = useRouter();
  const { modo } = useLocalSearchParams<{ modo?: string }>();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarPassword = modo === "cambiar";

  async function solicitarRecuperacion() {
    if (!correo.trim()) {
      Alert.alert("Campo incompleto", "Ingresa tu correo electrónico.");
      return;
    }

    const correoLimpio = correo.trim().toLowerCase();

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correoLimpio)) {
      Alert.alert("Correo inválido", "Verifica tu dirección de correo.");
      return;
    }

    try {
      setCargando(true);

      console.log("ENTORNO:", Constants.executionEnvironment);
console.log("EXPO GO:", ExecutionEnvironment.StoreClient);
console.log("HOST:", Constants.expoConfig?.hostUri);

const redirectTo = Linking.createURL("recuperar", {
  queryParams: {
    modo: "cambiar",
  },
});

console.log("DIRECCIÓN DE RECUPERACIÓN:", redirectTo);

      const { error } = await supabase.auth.resetPasswordForEmail(
        correoLimpio,
        {
          redirectTo,
        }
      );

      if (error) {
        throw error;
      }

      Alert.alert(
        "Correo enviado",
        "Si la dirección corresponde a una cuenta, recibirás un enlace para recuperar tu contraseña. Revisa también tu carpeta de spam.",
        [
          {
            text: "Aceptar",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error solicitando recuperación:", error);

      Alert.alert(
        "No se pudo enviar",
        error.message || "Ocurrió un error inesperado."
      );
    } finally {
      setCargando(false);
    }
  }

  async function actualizarPassword() {
    if (!password || !confirmar) {
      Alert.alert(
        "Campos incompletos",
        "Ingresa y confirma tu nueva contraseña."
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Contraseña inválida",
        "Utiliza al menos 8 caracteres."
      );
      return;
    }

    if (password !== confirmar) {
      Alert.alert(
        "Las contraseñas no coinciden",
        "Verifica que ambas contraseñas sean iguales."
      );
      return;
    }

    try {
      setCargando(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        "¡Contraseña actualizada!",
        "Tu contraseña se cambió correctamente. Ya puedes iniciar sesión.",
        [
          {
            text: "Continuar",
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error actualizando contraseña:", error);

      Alert.alert(
        "No se pudo actualizar",
        error.message || "Ocurrió un error inesperado."
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
        <Pressable onPress={() => router.replace("/login")}>
          <Text style={styles.volver}>‹ Volver al inicio de sesión</Text>
        </Pressable>

        <View style={styles.encabezado}>
          <Text style={styles.icono}>🔐</Text>

          <Text style={styles.titulo}>
            {cambiarPassword
              ? "Nueva contraseña"
              : "Recuperar contraseña"}
          </Text>

          <Text style={styles.descripcion}>
            {cambiarPassword
              ? "Crea una nueva contraseña para proteger tu cuenta."
              : "Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para recuperar el acceso."}
          </Text>
        </View>

        <View style={styles.formulario}>
          {!cambiarPassword ? (
            <>
              <Text style={styles.etiqueta}>
                Correo electrónico
              </Text>

              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#999"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </>
          ) : (
            <>
              <Text style={styles.etiqueta}>
                Nueva contraseña
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Text style={styles.etiqueta}>
                Confirmar contraseña
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#999"
                value={confirmar}
                onChangeText={setConfirmar}
                secureTextEntry
              />
            </>
          )}

          <Pressable
            style={[
              styles.boton,
              cargando && styles.botonDeshabilitado,
            ]}
            onPress={
              cambiarPassword
                ? actualizarPassword
                : solicitarRecuperacion
            }
            disabled={cargando}
          >
            <Text style={styles.textoBoton}>
              {cargando
                ? "Procesando..."
                : cambiarPassword
                  ? "Actualizar contraseña"
                  : "Enviar enlace"}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.nota}>
          {cambiarPassword
            ? "Tu nueva contraseña será guardada de forma segura en Supabase."
            : "Recibirás un correo con instrucciones para recuperar el acceso a tu cuenta."}
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
    fontSize: 15,
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
