import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { colores } from "../theme";
import { comunes } from "./estilosComunes";
import UnidadSelector from "./UnidadSelector";

type Props = {
  nombre: string;
  cantidad: string;
  unidad: string;
  onNombre: (v: string) => void;
  onCantidad: (v: string) => void;
  onUnidad: (v: string) => void;
  onGuardar: () => void;
};

export default function FormularioIngrediente({
  nombre,
  cantidad,
  unidad,
  onNombre,
  onCantidad,
  onUnidad,
  onGuardar,
}: Props) {
  return (
    <View>
      <View style={s.fila}>
        <TextInput
          style={[comunes.input, { flex: 2 }]}
          placeholder="Ingrediente"
          placeholderTextColor={colores.gris}
          value={nombre}
          onChangeText={onNombre}
        />
        <TextInput
          style={[comunes.input, { flex: 1 }]}
          placeholder="Cantidad"
          placeholderTextColor={colores.gris}
          keyboardType="numeric"
          value={cantidad}
          onChangeText={onCantidad}
        />
      </View>
      <UnidadSelector valor={unidad} onChange={onUnidad} />
      <Pressable style={comunes.boton} onPress={onGuardar}>
        <Text style={comunes.botonTexto}>Agregar a la despensa</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  fila: { flexDirection: "row", gap: 12 },
});
