
import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";

import { useFonts } from "expo-font";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display/400Regular";
import { Manrope_400Regular } from "@expo-google-fonts/manrope/400Regular";
import { Manrope_600SemiBold } from "@expo-google-fonts/manrope/600SemiBold";

import { supabase } from "../services/supabase";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  const [fuentesListas, errorFuentes] = useFonts({
    DMSerifDisplay_400Regular,
    Manrope_400Regular,
    Manrope_600SemiBold,
  });

  useEffect(() => {
    if (fuentesListas || errorFuentes) {
      SplashScreen.hideAsync();
    }
  }, [fuentesListas, errorFuentes]);

  useEffect(() => {
    let enlaceProcesado: string | null = null;

    async function procesarEnlace(url: string | null) {
      if (!url || url === enlaceProcesado) return;

      const resultado = Linking.parse(url);
      const parametros = resultado.queryParams;

      const codigo = parametros?.code;
      const tipo = parametros?.type;

      if (typeof codigo !== "string") return;

      enlaceProcesado = url;

      try {
        const { error } =
          await supabase.auth.exchangeCodeForSession(codigo);

        if (error) {
          console.error("Error procesando enlace:", error.message);
          return;
        }

        const { data, error: errorSesion } =
          await supabase.auth.getSession();

        if (errorSesion || !data.session) {
          console.error("No se pudo establecer la sesión de recuperación.");
          return;
        }

        if (tipo === "recovery" || tipo === null) {
          router.replace("/recuperar?modo=cambiar");
        }
      } catch (error) {
        console.error("Error al procesar enlace:", error);
      }
    }

    const suscripcion = Linking.addEventListener(
      "url",
      ({ url }) => {
        procesarEnlace(url);
      }
    );

    Linking.getInitialURL().then(procesarEnlace);

    return () => {
      suscripcion.remove();
    };
  }, [router]);

  if (!fuentesListas && !errorFuentes) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
