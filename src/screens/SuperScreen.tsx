
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { colores, fuentes, radios } from "../theme";
import { useCompras } from "../hooks/useCompras";
import BarraNavegacion from "../components/BarraNavegacion";

const UNIDADES = ["pza", "g", "kg", "ml", "L", "taza", "paquete"];

export default function SuperScreen() {
  const router = useRouter();
  const c = useCompras();
  const [mostrarUnidades, setMostrarUnidades] = useState(false);

  return (
    <View style={s.pantalla}>
      <ScrollView
        style={s.contenido}
        contentContainerStyle={s.interior}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.sobreTitulo}>ORGANIZA TUS COMPRAS</Text>
        <Text style={s.titulo}>Súper</Text>
        <Text style={s.descripcion}>
          Lleva el control de lo que necesitas para tu cocina.
        </Text>

        <View style={s.resumen}>
          <View style={s.resumenItem}>
            <Text style={s.numero}>{c.pendientes.length}</Text>
            <Text style={s.resumenTexto}>Pendientes</Text>
          </View>
          <View style={s.separador} />
          <View style={s.resumenItem}>
            <Text style={s.numero}>{c.comprados.length}</Text>
            <Text style={s.resumenTexto}>Comprados</Text>
          </View>
          <View style={s.separador} />
          <View style={s.resumenItem}>
            <Text style={s.numero}>{c.items.length}</Text>
            <Text style={s.resumenTexto}>Total</Text>
          </View>
        </View>

        <Text style={s.seccion}>Agregar a mi lista</Text>
        <View style={s.formulario}>
          <Text style={s.etiqueta}>Ingrediente</Text>
          <TextInput
            style={s.input}
            value={c.nombre}
            onChangeText={c.setNombre}
            placeholder="Ej. Tomate"
            placeholderTextColor={colores.gris}
          />

          <Text style={s.etiqueta}>Cantidad y unidad</Text>
          <View style={s.fila}>
            <TextInput
              style={[s.input, s.cantidad]}
              value={c.cantidad}
              onChangeText={c.setCantidad}
              keyboardType="decimal-pad"
              placeholder="1"
              placeholderTextColor={colores.gris}
            />
            <Pressable
              style={s.selector}
              onPress={() => setMostrarUnidades(!mostrarUnidades)}
            >
              <Text style={s.selectorTexto}>{c.unidad}⌄</Text>
            </Pressable>
          </View>

          {mostrarUnidades && (
            <View style={s.unidades}>
              {UNIDADES.map((unidad) => (
                <Pressable
                  key={unidad}
                  style={[
                    s.unidadOpcion,
                    c.unidad === unidad && s.unidadActiva,
                  ]}
                  onPress={() => {
                    c.setUnidad(unidad);
                    setMostrarUnidades(false);
                  }}
                >
                  <Text
                    style={[
                      s.unidadTexto,
                      c.unidad === unidad && s.unidadTextoActivo,
                    ]}
                  >
                    {unidad}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable
            style={[s.botonAgregar, c.cargando && s.deshabilitado]}
            onPress={c.agregar}
            disabled={c.cargando}
          >
            <Text style={s.botonAgregarTexto}>
              + Agregar ingrediente
            </Text>
          </Pressable>
        </View>

        <View style={s.tituloLista}>
          <Text style={s.seccion}>Mi lista de compras</Text>
          <Text style={s.contador}>{c.items.length} artículos</Text>
        </View>

        {c.items.length === 0 ? (
          <View style={s.vacio}>
            <Text style={s.vacioIcono}>🛒</Text>
            <Text style={s.vacioTitulo}>Tu lista está vacía</Text>
            <Text style={s.vacioTexto}>
              Agrega los ingredientes que necesitas comprar.
            </Text>
          </View>
        ) : (
          <>
            {c.pendientes.length > 0 && (
              <>
                <Text style={s.subtitulo}>Por comprar</Text>
                {c.pendientes.map((item) => (
                  <View key={item.id} style={s.articulo}>
                    <Pressable
                      style={s.check}
                      onPress={() => c.alternarComprado(item)}
                    >
                      <View style={s.circulo} />
                    </Pressable>
                    <Pressable
                      style={s.datosArticulo}
                      onPress={() => c.alternarComprado(item)}
                    >
                      <Text style={s.nombreArticulo}>{item.nombre}</Text>
                      <Text style={s.cantidadArticulo}>
                        {item.cantidad} {item.unidad}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => c.borrar(item)}>
                      <Text style={s.eliminar}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}

            {c.comprados.length > 0 && (
              <>
                <Text style={s.subtitulo}>Ya comprados</Text>
                {c.comprados.map((item) => (
                  <View key={item.id} style={[s.articulo, s.articuloComprado]}>
                    <Pressable
                      style={s.check}
                      onPress={() => c.alternarComprado(item)}
                    >
                      <View style={s.circuloActivo}>
                        <Text style={s.checkTexto}>✓</Text>
                      </View>
                    </Pressable>
                    <Pressable
                      style={s.datosArticulo}
                      onPress={() => c.alternarComprado(item)}
                    >
                      <Text style={s.nombreComprado}>{item.nombre}</Text>
                      <Text style={s.cantidadArticulo}>
                        {item.cantidad} {item.unidad}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => c.borrar(item)}>
                      <Text style={s.eliminar}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </>
            )}

            {c.comprados.length > 0 && (
              <Pressable
                style={[s.botonConfirmar, c.cargando && s.deshabilitado]}
                onPress={c.pasarADespensa}
                disabled={c.cargando}
              >
                <Text style={s.botonConfirmarTexto}>
                  Pasar compras a Despensa →
                </Text>
              </Pressable>
            )}
          </>
        )}

        <Pressable
          style={s.linkDespensa}
          onPress={() => router.push("/despensa")}
        >
          <Text style={s.linkDespensaTexto}>← Volver a mi despensa</Text>
        </Pressable>
      </ScrollView>

      <BarraNavegacion />
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.crema },
  contenido: { flex: 1 },
  interior: { padding: 22, paddingTop: 58, paddingBottom: 35 },
  sobreTitulo: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  titulo: {
    color: colores.bosque,
    fontFamily: fuentes.titulo,
    fontSize: 36,
  },
  descripcion: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 13,
    marginTop: 3,
    marginBottom: 20,
  },
  resumen: {
    backgroundColor: colores.blanco,
    borderRadius: radios.tarjeta,
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 25,
  },
  resumenItem: { alignItems: "center", flex: 1 },
  numero: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 24,
  },
  resumenTexto: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    marginTop: 3,
  },
  separador: { width: 1, height: 35, backgroundColor: "#DDD7CA" },
  seccion: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 18,
  },
  formulario: {
    backgroundColor: colores.blanco,
    padding: 16,
    borderRadius: radios.tarjeta,
    marginTop: 12,
    marginBottom: 25,
  },
  etiqueta: {
    color: colores.carbon,
    fontFamily: fuentes.negrita,
    fontSize: 12,
    marginBottom: 7,
    marginTop: 5,
  },
  input: {
    backgroundColor: colores.crema,
    borderRadius: radios.input,
    padding: 13,
    color: colores.carbon,
    fontFamily: fuentes.texto,
    fontSize: 14,
    marginBottom: 12,
  },
  fila: { flexDirection: "row", gap: 10 },
  cantidad: { flex: 1 },
  selector: {
    width: 105,
    backgroundColor: colores.crema,
    borderRadius: radios.input,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  selectorTexto: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
  },
  unidades: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  unidadOpcion: {
    backgroundColor: colores.crema,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 15,
  },
  unidadActiva: { backgroundColor: colores.bosque },
  unidadTexto: { color: colores.carbon, fontFamily: fuentes.texto },
  unidadTextoActivo: { color: colores.blanco },
  botonAgregar: {
    backgroundColor: colores.bosque,
    padding: 14,
    borderRadius: radios.boton,
    alignItems: "center",
    marginTop: 3,
  },
  botonAgregarTexto: {
    color: colores.blanco,
    fontFamily: fuentes.negrita,
    fontSize: 13,
  },
  deshabilitado: { opacity: 0.55 },
  tituloLista: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  contador: { color: colores.gris, fontFamily: fuentes.texto, fontSize: 12 },
  subtitulo: {
    color: colores.terracota,
    fontFamily: fuentes.negrita,
    fontSize: 13,
    marginTop: 12,
    marginBottom: 8,
  },
  articulo: {
    backgroundColor: colores.blanco,
    borderRadius: radios.tarjeta,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  articuloComprado: { opacity: 0.7 },
  check: { paddingRight: 12, paddingVertical: 4 },
  circulo: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: colores.salvia,
    borderRadius: 11,
  },
  circuloActivo: {
    width: 22,
    height: 22,
    backgroundColor: colores.bosque,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  checkTexto: { color: colores.blanco, fontSize: 13 },
  datosArticulo: { flex: 1 },
  nombreArticulo: {
    color: colores.carbon,
    fontFamily: fuentes.negrita,
    fontSize: 14,
  },
  nombreComprado: {
    color: colores.gris,
    fontFamily: fuentes.negrita,
    fontSize: 14,
    textDecorationLine: "line-through",
  },
  cantidadArticulo: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 11,
    marginTop: 3,
  },
  eliminar: {
    color: colores.terracota,
    fontSize: 25,
    paddingHorizontal: 5,
  },
  botonConfirmar: {
    backgroundColor: colores.terracota,
    padding: 16,
    borderRadius: radios.boton,
    alignItems: "center",
    marginTop: 16,
  },
  botonConfirmarTexto: {
    color: colores.blanco,
    fontFamily: fuentes.negrita,
    fontSize: 13,
  },
  vacio: {
    backgroundColor: colores.blanco,
    padding: 30,
    borderRadius: radios.tarjeta,
    alignItems: "center",
  },
  vacioIcono: { fontSize: 35, marginBottom: 10 },
  vacioTitulo: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 15,
  },
  vacioTexto: {
    color: colores.gris,
    fontFamily: fuentes.texto,
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },
  linkDespensa: { alignItems: "center", marginTop: 25, padding: 10 },
  linkDespensaTexto: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 12,
  },
});
