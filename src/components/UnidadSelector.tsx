import { View, Text, Pressable, StyleSheet } from "react-native";
import { colores } from "../theme";

// Unidades disponibles: peso, volumen y piezas (catsup, mayonesa, huevos, etc.)
export const UNIDADES = ["g", "kg", "ml", "l", "pza"];

type Props = {
  valor: string;
  onChange: (unidad: string) => void;
};

export default function UnidadSelector({ valor, onChange }: Props) {
  return (
    <View style={s.unidades}>
      {UNIDADES.map((u) => (
        <Pressable
          key={u}
          style={[s.chip, valor === u && s.chipActivo]}
          onPress={() => onChange(u)}
        >
          <Text style={[s.chipTexto, valor === u && s.chipTextoActivo]}>
            {u}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  unidades: { flexDirection: "row", gap: 8, marginTop: 16 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 2,
  },
  chipActivo: {
    backgroundColor: colores.cobalto,
    borderColor: colores.cobalto,
  },
  chipTexto: { color: colores.tinta, fontSize: 15 },
  chipTextoActivo: { color: colores.porcelana, fontWeight: "600" },
});
