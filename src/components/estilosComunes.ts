import { StyleSheet } from "react-native";
import { colores, fuentes } from "../theme";

// Estilos compartidos por el formulario y la ventana de edición
export const comunes = StyleSheet.create({
  input: {
    borderBottomWidth: 1.5,
    borderColor: colores.bosque,
    paddingVertical: 8,
    color: colores.bosque,
    fontSize: 16,
    fontFamily: fuentes.texto,
  },
  boton: {
    backgroundColor: colores.bosque,
    paddingVertical: 14,
    marginVertical: 20,
    alignItems: "center",
    borderRadius: 2,
  },
  botonTexto: {
    color: colores.crema,
    fontFamily: fuentes.negrita,
    fontSize: 16,
  },
});
