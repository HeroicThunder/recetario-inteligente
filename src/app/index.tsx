import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

import {
  iniciarDb,
  inicializarAutenticacion,
  obtenerOCrearUsuarioSupabase,
  cerrarSesion,
} from "../db/database";

import { supabase } from "../services/supabase";
import { colores } from "../theme";

export default function IndexScreen() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarSesion() {
      try {
        await iniciarDb();
        await inicializarAutenticacion();

        // Consultar la sesión persistente de Supabase.
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const usuario = data.session?.user;

        if (usuario) {
          const nombre =
            usuario.user_metadata?.nombre ||
            usuario.email?.split("@")[0] ||
            "Usuario";

          // Recuperar o crear su perfil local.
          await obtenerOCrearUsuarioSupabase(
            usuario.id,
            usuario.email ?? "",
            nombre,
          );

          router.replace("/inicio");
        } else {
          // No hay sesión de Supabase.
          await cerrarSesion();
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);

        await cerrarSesion();
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
      {cargando && <ActivityIndicator size="large" color={colores.bosque} />}
    </View>
  );
}
