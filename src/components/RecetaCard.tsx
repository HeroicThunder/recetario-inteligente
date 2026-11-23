
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import { colores, fuentes, radios } from "../theme";
import type { RecetaEvaluada } from "../types/receta";

import {
  listarFavoritos,
  guardarFavorito,
  eliminarFavorito,
} from "../db/database";

const ETIQUETA: Record<string, string> = {
  facil: "FÁCIL",
  media: "MEDIA",
  dificil: "DIFÍCIL",
};

type Props = {
  receta: RecetaEvaluada;
};

export default function RecetaCard({ receta }: Props) {
  const router = useRouter();

  const total = receta.disponibles.length + receta.faltantes.length;
  const completa = receta.faltantes.length === 0;

  const [favoritoId, setFavoritoId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;

    async function comprobarFavorito() {
      try {
        const favoritos = await listarFavoritos();

        const encontrado = favoritos.find((favorito) => {
          try {
            const guardada = JSON.parse(favorito.receta_json);

            return (
              guardada.nombre?.trim().toLowerCase() ===
              receta.nombre.trim().toLowerCase()
            );
          } catch {
            return false;
          }
        });

        if (activo) setFavoritoId(encontrado?.id ?? null);
      } catch (error) {
        console.error("Error al consultar favoritos:", error);
      }
    }

    comprobarFavorito();

    return () => {
      activo = false;
    };
  }, [receta.nombre]);

  function abrirDetalle() {
    router.push({
      pathname: "/detalle-receta" as any,
      params: {
        receta: JSON.stringify(receta),
      },
    });
  }

  async function alternarFavorito() {
    if (guardando) return;

    setGuardando(true);

    try {
      if (favoritoId !== null) {
        await eliminarFavorito(favoritoId);
        setFavoritoId(null);

        Alert.alert("Favoritos", "La receta se eliminó de tus favoritos.");
      } else {
        await guardarFavorito(receta);

        const favoritos = await listarFavoritos();

        const encontrado = favoritos.find((favorito) => {
          try {
            const guardada = JSON.parse(favorito.receta_json);

            return (
              guardada.nombre?.trim().toLowerCase() ===
              receta.nombre.trim().toLowerCase()
            );
          } catch {
            return false;
          }
        });

        setFavoritoId(encontrado?.id ?? null);

        Alert.alert(
          "¡Receta guardada!",
          "Ahora puedes encontrarla en tus favoritos."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo actualizar tu lista de favoritos."
      );
    } finally {
      setGuardando(false);
    }
  }

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

      <Pressable style={s.botonDetalle} onPress={abrirDetalle}>
        <Text style={s.textoBotonDetalle}>Ver receta completa →</Text>
      </Pressable>

      <Pressable
        style={[
          s.botonFavorito,
          favoritoId !== null && s.botonFavoritoActivo,
          guardando && { opacity: 0.6 },
        ]}
        onPress={alternarFavorito}
        disabled={guardando}
      >
        <Text
          style={[
            s.textoFavorito,
            favoritoId !== null && s.textoFavoritoActivo,
          ]}
        >
          {guardando
            ? "Guardando..."
            : favoritoId !== null
              ? "♥ Guardada en Favoritos"
              : "♡ Guardar en Favoritos"}
        </Text>
      </Pressable>
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
  relleno: {
    height: 6,
    borderRadius: 3,
  },
  columnas: {
    flexDirection: "row",
    gap: 16,
  },
  columna: {
    flex: 1,
  },
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
  botonDetalle: {
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colores.bosque,
    alignItems: "center",
  },
  textoBotonDetalle: {
    color: colores.blanco,
    fontFamily: fuentes.negrita,
    fontSize: 13,
  },
  botonFavorito: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.salvia,
    alignItems: "center",
  },
  botonFavoritoActivo: {
    backgroundColor: colores.bosque,
    borderColor: colores.bosque,
  },
  textoFavorito: {
    color: colores.bosque,
    fontFamily: fuentes.negrita,
    fontSize: 13,
  },
  textoFavoritoActivo: {
    color: colores.blanco,
  },
});
