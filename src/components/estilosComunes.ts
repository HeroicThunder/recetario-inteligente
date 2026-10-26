import { StyleSheet } from "react-native";
import { colores } from "../theme";

// Estilos compartidos por el formulario y la ventana de edición
export const comunes = StyleSheet.create({
  input: {
    borderBottomWidth: 1.5,
    borderColor: colores.tinta,
    paddingVertical: 8,
    color: colores.tinta,
    fontSize: 16,
  },
  boton: {
    backgroundColor: colores.cobalto,
    paddingVertical: 14,
    marginVertical: 20,
    alignItems: "center",
    borderRadius: 2,
  },
  botonTexto: { color: colores.porcelana, fontWeight: "600", fontSize: 16 },
});
