import { Text, Pressable, StyleSheet } from "react-native";
import { colores, fuentes } from "../theme";
import { Ingrediente } from "../db/database";

type Props = {
  item: Ingrediente;
  onPress: () => void;
};

export default function IngredienteItem({ item, onPress }: Props) {
  return (
    <Pressable style={s.renglon} onPress={onPress}>
      <Text style={s.nombre}>{item.nombre}</Text>
      <Text style={s.cantidad}>
        {item.cantidad} {item.unidad}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  renglon: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colores.linea,
  },
  nombre: { fontSize: 17, color: colores.bosque, fontFamily: fuentes.texto },
  cantidad: {
    fontSize: 17,
    color: colores.bosque,
    fontFamily: fuentes.negrita,
  },
});
