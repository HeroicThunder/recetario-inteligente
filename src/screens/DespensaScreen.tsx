import { useMemo, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colores, fuentes, radios } from "../theme";
import { useDespensa } from "../hooks/useDespensa";
import FormularioIngrediente from "../components/FormularioIngrediente";
import IngredienteItem from "../components/IngredienteItem";
import ModalEditarIngrediente from "../components/ModalEditarIngrediente";
import { Alert } from "react-native";
import { cerrarSesion } from "../db/database";
import BarraNavegacion from "../components/BarraNavegacion";

export default function DespensaScreen() {
  const d = useDespensa();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const filtrados = useMemo(() => d.items.filter((i) => i.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())), [d.items, busqueda]);

  async function salir() {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => { await cerrarSesion(); router.replace("/login"); } },
    ]);
  }

  return (
    <View style={s.pantalla}>
      <ScrollView style={s.contenido} contentContainerStyle={s.contenidoInterior} keyboardShouldPersistTaps="handled">
        <View style={s.encabezado}>
          <View>
            <Text style={s.sobreTitulo}>TU COCINA, EN ORDEN</Text>
            <Text style={s.titulo}>Despensa</Text>
          </View>
          <Pressable onPress={salir} style={s.salir}><Text style={s.salirTexto}>Salir</Text></Pressable>
        </View>

        <View style={s.resumen}>
          <View style={s.resumenIcono}><Text style={s.icono}>▤</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.resumenNumero}>{d.items.length}</Text>
            <Text style={s.resumenTexto}>{d.items.length === 1 ? "ingrediente registrado" : "ingredientes registrados"}</Text>
          </View>
          <Pressable onPress={() => router.push("/stock")} style={s.linkStock}><Text style={s.linkStockTexto}>Ver stock →</Text></Pressable>
        </View>

        <Pressable style={s.banner} onPress={() => router.push("/sugerencias")}>
          <View style={{ flex: 1 }}>
            <Text style={s.bannerTitulo}>¿Qué cocinamos hoy?</Text>
            <Text style={s.bannerTexto}>Inspírate con lo que ya tienes en casa.</Text>
          </View>
          <Text style={s.bannerFlecha}>→</Text>
        </Pressable>

        <Text style={s.seccion}>Agregar ingredientes</Text>
        <Text style={s.descripcion}>Registra lo que tienes para recibir recetas más precisas.</Text>
        <View style={s.formulario}><FormularioIngrediente nombre={d.nombre} cantidad={d.cantidad} unidad={d.unidad} onNombre={d.setNombre} onCantidad={d.setCantidad} onUnidad={d.setUnidad} onGuardar={d.guardar} /></View>

        <View style={s.tituloLista}>
          <View><Text style={s.seccion}>Mi despensa</Text><Text style={s.descripcion}>{filtrados.length} de {d.items.length} ingredientes</Text></View>
          <Pressable onPress={() => router.push("/stock")}><Text style={s.verTodo}>Ver stock</Text></Pressable>
        </View>
        <TextInput value={busqueda} onChangeText={setBusqueda} placeholder="Buscar ingrediente..." placeholderTextColor={colores.gris} style={s.busqueda} />
        {filtrados.length ? filtrados.map((item) => <IngredienteItem key={item.id} item={item} onPress={() => d.abrirEdicion(item)} />) : <View style={s.vacio}><Text style={s.vacioIcono}>🥬</Text><Text style={s.vacioTitulo}>{busqueda ? "No encontramos ese ingrediente" : "Tu despensa está esperando"}</Text><Text style={s.vacioTexto}>{busqueda ? "Prueba con otro nombre." : "Agrega tus primeros ingredientes para comenzar."}</Text></View>}
      </ScrollView>
      <ModalEditarIngrediente visible={d.editando !== null} nombre={d.eNombre} cantidad={d.eCantidad} unidad={d.eUnidad} onNombre={d.setENombre} onCantidad={d.setECantidad} onUnidad={d.setEUnidad} onGuardar={d.guardarEdicion} onEliminar={d.borrarEdicion} onCerrar={d.cerrarEdicion} />
      <BarraNavegacion />
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.crema }, contenido: { flex: 1 }, contenidoInterior: { padding: 22, paddingTop: 58, paddingBottom: 28 },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }, sobreTitulo: { color: colores.terracota, fontFamily: fuentes.negrita, fontSize: 10, letterSpacing: 1.6 }, titulo: { color: colores.bosque, fontFamily: fuentes.titulo, fontSize: 36 }, salir: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colores.blanco }, salirTexto: { color: colores.terracota, fontFamily: fuentes.negrita, fontSize: 12 },
  resumen: { backgroundColor: colores.blanco, borderRadius: radios.tarjeta, padding: 17, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }, resumenIcono: { width: 46, height: 46, borderRadius: 15, backgroundColor: colores.despensa, alignItems: "center", justifyContent: "center" }, icono: { color: colores.bosque, fontSize: 24 }, resumenNumero: { fontSize: 25, color: colores.bosque, fontFamily: fuentes.negrita }, resumenTexto: { color: colores.gris, fontSize: 12, fontFamily: fuentes.texto }, linkStock: { padding: 9 }, linkStockTexto: { color: colores.bosque, fontFamily: fuentes.negrita, fontSize: 12 },
  banner: { backgroundColor: colores.bosque, borderRadius: radios.tarjeta, padding: 19, flexDirection: "row", alignItems: "center", marginBottom: 25 }, bannerTitulo: { color: colores.crema, fontFamily: fuentes.titulo, fontSize: 22 }, bannerTexto: { color: "#E1E8DD", fontFamily: fuentes.texto, fontSize: 12, marginTop: 4 }, bannerFlecha: { color: colores.crema, fontSize: 28, marginLeft: 12 },
  seccion: { color: colores.bosque, fontFamily: fuentes.negrita, fontSize: 18 }, descripcion: { color: colores.gris, fontFamily: fuentes.texto, fontSize: 12, marginTop: 4 }, formulario: { backgroundColor: colores.blanco, borderRadius: radios.tarjeta, padding: 15, marginTop: 12, marginBottom: 24 }, tituloLista: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, verTodo: { color: colores.terracota, fontFamily: fuentes.negrita, fontSize: 12 }, busqueda: { backgroundColor: colores.blanco, borderRadius: radios.input, paddingHorizontal: 15, paddingVertical: 12, color: colores.carbon, fontFamily: fuentes.texto, marginBottom: 8 },
  vacio: { alignItems: "center", paddingVertical: 30, paddingHorizontal: 20 }, vacioIcono: { fontSize: 32, marginBottom: 8 }, vacioTitulo: { color: colores.bosque, fontFamily: fuentes.negrita, fontSize: 15 }, vacioTexto: { color: colores.gris, fontFamily: fuentes.texto, fontSize: 12, textAlign: "center", marginTop: 5 },
});
