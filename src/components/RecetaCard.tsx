import { View, Text, StyleSheet } from "react-native";
import { colores, fuentes, radios } from "../theme";
import type { RecetaEvaluada } from "../types/receta";

const ETIQUETA: Record<string, string> = {
  facil: "FÁCIL",
  media: "MEDIA",
  dificil: "DIFÍCIL",
};

type Props = {
  receta: RecetaEvaluada;
};

export default function RecetaCard({ receta }: Props) {
  const total = receta.disponibles.length + receta.faltantes.length;
  const completa = receta.faltantes.length === 0;

  return (
    <View style={s.tarjeta}>
      <Text style={s.meta}>
        {receta.tiempo_minutos} MIN ·{" "}
        {ETIQUETA[receta.dificultad] ?? receta.dificultad}
      </Text>
      <Text style={s.nombre}>{receta.nombre}</Text>
      <Text style={s.descripcion}>{receta.descripcion}</Text>

      <View style={s.filaProgreso}>
        <Text style={s.progresoTexto}>
          {receta.disponibles.length} de {total} ingredientes disponibles
        </Text>
        <Text style={s.porcentaje}>{receta.porcentaje}%</Text>
      </View>
      <View style={s.pista}>
        <View
          style={[
            s.relleno,
            {
              width: `${receta.porcentaje}%` as `${number}%`,
              backgroundColor: completa ? colores.salvia : colores.bosque,
            },
          ]}
        />
      </View>

      <View style={s.columnas}>
        <View style={s.columna}>
          <Text style={s.subtitulo}>Disponibles</Text>
          {receta.disponibles.map((i, k) => (
            <Text key={`d${k}`} style={s.disponible}>
              ✓ {i.nombre}
            </Text>
          ))}
        </View>
        <View style={s.columna}>
          <Text style={[s.subtitulo, { color: colores.terracota }]}>
            Faltantes
          </Text>
          {completa ? (
            <Text style={s.ninguno}>Ninguno</Text>
          ) : (
            receta.faltantes.map((i, k) => (
              <Text key={`f${k}`} style={s.faltante}>
                ○ {i.nombre} {i.cantidad} {i.unidad}
              </Text>
            ))
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: radios.tarjeta,
    padding: 18,
    marginBottom: 14,
  },
  meta: {
    fontSize: 12,
    letterSpacing: 1.2,
    fontFamily: fuentes.negrita,
    color: colores.bosque,
    marginBottom: 6,
  },
  nombre: {
    fontSize: 24,
    fontFamily: fuentes.titulo,
    color: colores.bosque,
    marginBottom: 6,
  },
  descripcion: {
    fontSize: 15,
    color: colores.bosque,
    marginBottom: 14,
    fontFamily: fuentes.texto,
  },
  filaProgreso: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progresoTexto: {
    fontSize: 13,
    color: colores.gris,
    fontFamily: fuentes.texto,
  },
  porcentaje: {
    fontSize: 13,
    color: colores.bosque,
    fontFamily: fuentes.negrita,
  },
  pista: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colores.linea,
    overflow: "hidden",
    marginBottom: 16,
  },
  relleno: { height: 6, borderRadius: 3 },
  columnas: { flexDirection: "row", gap: 16 },
  columna: { flex: 1 },
  subtitulo: {
    fontSize: 13,
    fontFamily: fuentes.negrita,
    color: colores.salvia,
    marginBottom: 6,
  },
  disponible: {
    fontSize: 14,
    color: colores.bosque,
    fontFamily: fuentes.texto,
    lineHeight: 22,
  },
  faltante: {
    fontSize: 14,
    color: colores.terracota,
    fontFamily: fuentes.texto,
    lineHeight: 22,
  },
  ninguno: {
    fontSize: 14,
    color: colores.gris,
    fontFamily: fuentes.texto,
    lineHeight: 22,
  },
});
