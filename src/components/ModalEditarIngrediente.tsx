import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
} from "react-native";
import { colores } from "../theme";
import { comunes } from "./estilosComunes";
import UnidadSelector from "./UnidadSelector";

type Props = {
  visible: boolean;
  nombre: string;
  cantidad: string;
  unidad: string;
  onNombre: (v: string) => void;
  onCantidad: (v: string) => void;
  onUnidad: (v: string) => void;
  onGuardar: () => void;
  onEliminar: () => void;
  onCerrar: () => void;
};

export default function ModalEditarIngrediente({
  visible,
  nombre,
  cantidad,
  unidad,
  onNombre,
  onCantidad,
  onUnidad,
  onGuardar,
  onEliminar,
  onCerrar,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
    >
      <View style={s.fondoModal}>
        <View style={s.hoja}>
          <Text style={s.tituloModal}>Editar ingrediente</Text>
          <TextInput
            style={comunes.input}
            placeholder="Ingrediente"
            placeholderTextColor={colores.gris}
            value={nombre}
            onChangeText={onNombre}
          />
          <TextInput
            style={[comunes.input, { marginTop: 12 }]}
            placeholder="Cantidad"
            placeholderTextColor={colores.gris}
            keyboardType="numeric"
            value={cantidad}
            onChangeText={onCantidad}
          />
          <UnidadSelector valor={unidad} onChange={onUnidad} />
          <Pressable style={comunes.boton} onPress={onGuardar}>
            <Text style={comunes.botonTexto}>Guardar cambios</Text>
          </Pressable>
          <View style={s.accionesModal}>
            <Pressable onPress={onEliminar}>
              <Text style={s.eliminar}>Eliminar</Text>
            </Pressable>
            <Pressable onPress={onCerrar}>
              <Text style={s.cancelar}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(22, 33, 62, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  hoja: {
    backgroundColor: colores.porcelana,
    padding: 24,
    borderRadius: 2,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  tituloModal: {
    fontSize: 24,
    fontWeight: "300",
    color: colores.tinta,
    marginBottom: 16,
  },
  accionesModal: { flexDirection: "row", justifyContent: "space-between" },
  eliminar: { color: "#B3261E", fontSize: 16, fontWeight: "600" },
  cancelar: { color: colores.gris, fontSize: 16 },
});
