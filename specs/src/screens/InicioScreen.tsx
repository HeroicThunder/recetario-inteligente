import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { obtenerSesion, Usuario } from "../db/database";
import { useDespensa } from "../hooks/useDespensa";
import { colores, fuentes, radios } from "../theme";
import BarraNavegacion from "../components/BarraNavegacion";

export default function InicioScreen() {
  const router = useRouter();
  const { items } = useDespensa();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    obtenerSesion().then(setUsuario);
  }, []);

  const nombre = usuario?.nombre?.split(" ")[0] || "Cocinero";

  return (
    <View style={styles.pantalla}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contenido}
      >
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.marca}>SazónIA</Text>
            <Text style={styles.submarca}>COCINA INTELIGENTE</Text>
          </View>
          <Text style={styles.saludoIcono}>✳</Text>
        </View>

        <View style={styles.bienvenida}>
          <Text style={styles.saludo}>¡Hola, {nombre}!</Text>
          <Text style={styles.descripcion}>¿Qué se te antoja cocinar hoy?</Text>
          <Text style={styles.eslogan}>
            Tu despensa inspira, nosotros te ayudamos a cocinar.
          </Text>
        </View>

        <Pressable
          style={styles.tarjetaPrincipal}
          onPress={() => router.push("/sugerencias")}
        >
          <View style={styles.etiquetaReceta}>
            <Text style={styles.etiquetaTexto}>RECETAS INTELIGENTES</Text>
          </View>

          <Text style={styles.tituloTarjeta}>
            Convierte tus ingredientes en algo delicioso.
          </Text>

          <Text style={styles.textoTarjeta}>
            Descubre qué puedes preparar con ayuda de Gemini.
          </Text>

          <View style={styles.botonRecetas}>
            <Text style={styles.textoBoton}>Descubrir recetas →</Text>
          </View>

          <Text style={styles.decoracion}>✳</Text>
        </Pressable>

        <View style={styles.seccionTitulo}>
          <Text style={styles.tituloSeccion}>Tu cocina hoy</Text>
          <Text style={styles.subtituloSeccion}>Un vistazo a tu despensa</Text>
        </View>

        <View style={styles.resumen}>
          <View style={styles.tarjetaResumen}>
            <View
              style={[
                styles.iconoResumen,
                { backgroundColor: colores.despensa },
              ]}
            >
              <Text style={styles.emoji}>🥕</Text>
            </View>
            <Text style={styles.numero}>{items.length}</Text>
            <Text style={styles.nombreResumen}>Ingredientes</Text>
          </View>

          <View style={styles.tarjetaResumen}>
            <View
              style={[
                styles.iconoResumen,
                { backgroundColor: colores.recetas },
              ]}
            >
              <Text style={styles.emoji}>✧</Text>
            </View>
            <Text style={styles.numero}>IA</Text>
            <Text style={styles.nombreResumen}>Recetas inteligentes</Text>
          </View>
        </View>

        <View style={styles.seccionTitulo}>
          <Text style={styles.tituloSeccion}>Accesos rápidos</Text>
        </View>

        <Pressable
          style={styles.acceso}
          onPress={() => router.push("/despensa")}
        >
          <View style={styles.accesoIcono}>
            <Text style={styles.emoji}>🧺</Text>
          </View>
          <View style={styles.accesoTexto}>
            <Text style={styles.accesoTitulo}>Mi despensa</Text>
            <Text style={styles.accesoDescripcion}>
              Administra tus ingredientes
            </Text>
          </View>
          <Text style={styles.flecha}>›</Text>
        </Pressable>

        <Pressable
          style={styles.acceso}
          onPress={() => router.push("/sugerencias")}
        >
          <View
            style={[styles.accesoIcono, { backgroundColor: colores.recetas }]}
          >
            <Text style={styles.emoji}>🍲</Text>
          </View>
          <View style={styles.accesoTexto}>
            <Text style={styles.accesoTitulo}>Inspiración para cocinar</Text>
            <Text style={styles.accesoDescripcion}>
              Genera recetas con tus ingredientes
            </Text>
          </View>
          <Text style={styles.flecha}>›</Text>
        </Pressable>

        <View style={styles.pie}>
          <Text style={styles.pieTexto}>
            Hecho para disfrutar cada ingrediente.
          </Text>
        </View>
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
    paddingHorizontal: 22,
    paddingTop: 56,
    paddingBottom: 24,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  marca: {
    fontFamily: fuentes.titulo,
    fontSize: 31,
    color: colores.bosque,
  },
  submarca: {
    fontFamily: fuentes.negrita,
    fontSize: 9,
    letterSpacing: 2,
    color: colores.gris,
  },
  saludoIcono: {
    fontSize: 29,
    color: colores.terracota,
  },
  bienvenida: {
    marginBottom: 22,
  },
  saludo: {
    fontFamily: fuentes.titulo,
    fontSize: 29,
    color: colores.carbon,
  },
  descripcion: {
    fontFamily: fuentes.texto,
    fontSize: 16,
    color: colores.carbon,
    marginTop: 4,
  },
  eslogan: {
    fontFamily: fuentes.texto,
    color: colores.gris,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 19,
  },
  tarjetaPrincipal: {
    backgroundColor: colores.bosque,
    padding: 23,
    borderRadius: radios.tarjeta,
    minHeight: 230,
    overflow: "hidden",
    marginBottom: 30,
  },
  etiquetaReceta: {
    alignSelf: "flex-start",
    backgroundColor: colores.salvia,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },
  etiquetaTexto: {
    fontFamily: fuentes.negrita,
    color: colores.bosque,
    fontSize: 9,
    letterSpacing: 1,
  },
  tituloTarjeta: {
    color: colores.blanco,
    fontFamily: fuentes.titulo,
    fontSize: 25,
    lineHeight: 32,
    maxWidth: "85%",
    marginTop: 16,
  },
  textoTarjeta: {
    color: "#E6E9E1",
    fontFamily: fuentes.texto,
    fontSize: 12,
    lineHeight: 19,
    maxWidth: "85%",
    marginTop: 7,
  },
  botonRecetas: {
    backgroundColor: colores.mostaza,
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 11,
    marginTop: 17,
  },
  textoBoton: {
    color: colores.carbon,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },
  decoracion: {
    position: "absolute",
    right: 13,
    bottom: 5,
    fontSize: 100,
    color: "#FFFFFF20",
  },
  seccionTitulo: {
    marginBottom: 14,
  },
  tituloSeccion: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 22,
  },
  subtituloSeccion: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 12,
    marginTop: 3,
  },
  resumen: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  tarjetaResumen: {
    flex: 1,
    backgroundColor: colores.blanco,
    padding: 15,
    borderRadius: radios.tarjeta,
  },
  iconoResumen: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emoji: {
    fontSize: 20,
  },
  numero: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 27,
  },
  nombreResumen: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    marginTop: 2,
  },
  acceso: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colores.blanco,
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
  },
  accesoIcono: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colores.compras,
    alignItems: "center",
    justifyContent: "center",
  },
  accesoTexto: {
    flex: 1,
    marginLeft: 12,
  },
  accesoTitulo: {
    fontFamily: fuentes.negrita,
    color: colores.carbon,
    fontSize: 13,
  },
  accesoDescripcion: {
    fontFamily: fuentes.texto,
    color: colores.gris,
    fontSize: 11,
    marginTop: 4,
  },
  flecha: {
    color: colores.salvia,
    fontSize: 27,
    paddingHorizontal: 5,
  },
  pie: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  pieTexto: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
  },
});
