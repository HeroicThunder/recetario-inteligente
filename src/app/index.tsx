import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

import {
  iniciarDb,
  inicializarAutenticacion,
  obtenerSesion,
} from "../db/database";

import { colores } from "../theme";

export default function IndexScreen() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarSesion() {
      try {
        await iniciarDb();
        await inicializarAutenticacion();

        const usuario = await obtenerSesion();

        if (usuario) {
          router.replace("/despensa");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        router.replace("/login");
      } finally {
        setCargando(false);
      }
    }

    verificarSesion();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colores.crema,
      }}
    >
      <ActivityIndicator size="large" color={colores.bosque} />
    </View>
  );
}
