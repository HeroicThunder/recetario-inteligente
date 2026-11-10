import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { colores, fuentes } from "../theme";

const opciones = [
  { ruta: "/inicio", icono: "⌂", etiqueta: "Inicio" },
  { ruta: "/despensa", icono: "▤", etiqueta: "Despensa" },
  { ruta: "/sugerencias", icono: "✧", etiqueta: "Recetas" },
  { ruta: "/perfil", icono: "◉", etiqueta: "Perfil" },
];

export default function BarraNavegacion() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.contenedor}>
      {opciones.map((opcion) => {
        const activo = pathname === opcion.ruta;

        return (
          <Pressable
            key={opcion.ruta}
            style={styles.opcion}
            onPress={() => router.replace(opcion.ruta as any)}
          >
            <Text style={[styles.icono, activo && styles.activo]}>
              {opcion.icono}
            </Text>

            <Text style={[styles.etiqueta, activo && styles.activo]}>
              {opcion.etiqueta}
            </Text>

            {activo && <View style={styles.indicador} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    backgroundColor: colores.blanco,
    borderTopWidth: 1,
    borderTopColor: colores.linea,
    paddingTop: 10,
    paddingBottom: 9,
    paddingHorizontal: 8,
    justifyContent: "space-around",
  },
  opcion: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  icono: {
    fontSize: 23,
    color: colores.gris,
  },
  etiqueta: {
    fontSize: 11,
    color: colores.gris,
    fontFamily: fuentes.texto,
  },
  activo: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
  },
  indicador: {
    width: 18,
    height: 3,
    borderRadius: 3,
    backgroundColor: colores.salvia,
    marginTop: 2,
  },
});
