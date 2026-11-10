import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { colores, fuentes, radios } from "../theme";
import { useDespensa } from "../hooks/useDespensa";
import IngredienteItem from "../components/IngredienteItem";
import ModalEditarIngrediente from "../components/ModalEditarIngrediente";
import BarraNavegacion from "../components/BarraNavegacion";

export default function StockScreen() {
  const d = useDespensa();
  const [busqueda, setBusqueda] = useState("");
  const filtrados = useMemo(() => d.items.filter((i) => i.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())), [d.items, busqueda]);
  const unidades = useMemo(() => new Set(d.items.map((i) => i.unidad)).size, [d.items]);

  return (
    <View style={s.pantalla}>
      <ScrollView contentContainerStyle={s.contenido} keyboardShouldPersistTaps="handled">
        <Text style={s.sobreTitulo}>CONTROL DE EXISTENCIAS</Text>
        <Text style={s.titulo}>Mi stock</Text>
        <Text style={s.subtitulo}>Consulta y actualiza las cantidades disponibles en tu cocina.</Text>

        <View style={s.tarjetas}>
          <View style={[s.tarjeta, { backgroundColor: colores.compras }]}><Text style={s.numero}>{d.items.length}</Text><Text style={s.etiqueta}>Productos</Text></View>
          <View style={[s.tarjeta, { backgroundColor: colores.despensa }]}><Text style={s.numero}>{unidades}</Text><Text style={s.etiqueta}>Tipos de unidad</Text></View>
        </View>

        <View style={s.nota}><Text style={s.notaIcono}>✦</Text><Text style={s.notaTexto}>Este es tu inventario disponible. Al confirmar una compra, los productos se sumarán aquí; al terminar una receta, se descontarán las cantidades utilizadas.</Text></View>

        <View style={s.encabezadoLista}><Text style={s.seccion}>Existencias</Text><Text style={s.contador}>{filtrados.length} productos</Text></View>
        <TextInput value={busqueda} onChangeText={setBusqueda} placeholder="Buscar en stock..." placeholderTextColor={colores.gris} style={s.busqueda} />
        {filtrados.length ? filtrados.map((item) => <IngredienteItem key={item.id} item={item} onPress={() => d.abrirEdicion(item)} />) : <View style={s.vacio}><Text style={{ fontSize: 32 }}>📦</Text><Text style={s.vacioTitulo}>{busqueda ? "No hay coincidencias" : "Todavía no tienes existencias"}</Text><Text style={s.vacioTexto}>{busqueda ? "Intenta con otro término." : "Agrega ingredientes desde Despensa o registra tus compras."}</Text></View>}
      </ScrollView>
      <ModalEditarIngrediente visible={d.editando !== null} nombre={d.eNombre} cantidad={d.eCantidad} unidad={d.eUnidad} onNombre={d.setENombre} onCantidad={d.setECantidad} onUnidad={d.setEUnidad} onGuardar={d.guardarEdicion} onEliminar={d.borrarEdicion} onCerrar={d.cerrarEdicion} />
      <BarraNavegacion />
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.crema }, contenido: { padding: 22, paddingTop: 62, paddingBottom: 30 }, sobreTitulo: { color: colores.terracota, fontFamily: fuentes.negrita, fontSize: 10, letterSpacing: 1.5 }, titulo: { color: colores.bosque, fontFamily: fuentes.titulo, fontSize: 36, marginTop: 3 }, subtitulo: { color: colores.gris, fontFamily: fuentes.texto, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 22 },
  tarjetas: { flexDirection: "row", gap: 12, marginBottom: 15 }, tarjeta: { flex: 1, borderRadius: radios.tarjeta, padding: 17 }, numero: { color: colores.bosque, fontFamily: fuentes.negrita, fontSize: 27 }, etiqueta: { color: colores.gris, fontFamily: fuentes.texto, fontSize: 12, marginTop: 3 },
  nota: { flexDirection: "row", gap: 10, backgroundColor: colores.blanco, borderRadius: radios.tarjeta, padding: 15, marginBottom: 26 }, notaIcono: { color: colores.terracota, fontSize: 18 }, notaTexto: { flex: 1, color: colores.gris, fontFamily: fuentes.texto, fontSize: 12, lineHeight: 18 }, encabezadoLista: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, seccion: { color: colores.bosque, fontFamily: fuentes.negrita, fontSize: 18 }, contador: { color: colores.gris, fontFamily: fuentes.texto, fontSize: 11 }, busqueda: { backgroundColor: colores.blanco, borderRadius: radios.input, paddingHorizontal: 15, paddingVertical: 12, color: colores.carbon, fontFamily: fuentes.texto, marginBottom: 8 },
  vacio: { alignItems: "center", paddingVertical: 38, gap: 8 }, vacioTitulo: { color: colores.bosque, fontFamily: fuentes.negrita, fontSize: 15 }, vacioTexto: { color: colores.gris, fontFamily: fuentes.texto, fontSize: 12, textAlign: "center" },
});
