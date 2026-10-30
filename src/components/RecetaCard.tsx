import { View, Text, StyleSheet } from "react-native";
import { colores } from "../theme";
import type { Receta } from "../types/receta";

const ETIQUETA: Record<string, string> = {
  facil: "FÁCIL",
  media: "MEDIA",
  dificil: "DIFÍCIL",
};

type Props = {
  receta: Receta;
};

export default function RecetaCard({ receta }: Props) {
  return (
    <View style={s.tarjeta}>
      <Text style={s.meta}>
        {receta.tiempo_minutos} MIN ·{" "}
        {ETIQUETA[receta.dificultad] ?? receta.dificultad}
      </Text>
      <Text style={s.nombre}>{receta.nombre}</Text>
      <Text style={s.descripcion}>{receta.descripcion}</Text>
      <Text style={s.ingredientes}>
        {receta.ingredientes
          .map((i) => `${i.nombre} ${i.cantidad} ${i.unidad}`)
          .join("  ·  ")}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  tarjeta: {
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colores.linea,
  },
  meta: {
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: "600",
    color: colores.cobalto,
    marginBottom: 6,
  },
  nombre: {
    fontSize: 24,
    fontWeight: "300",
    color: colores.tinta,
    marginBottom: 6,
  },
  descripcion: { fontSize: 16, color: colores.tinta, marginBottom: 10 },
  ingredientes: { fontSize: 14, color: colores.gris, lineHeight: 20 },
});
