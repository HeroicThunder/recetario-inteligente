
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  programarRecordatorioDiario,
  cancelarRecordatorioDiario,
  programarSugerenciaReceta,
  cancelarSugerenciaReceta,
} from "../services/notificaciones";

const CLAVE_PREFERENCIAS = "@sazonia_notificaciones";

export type PreferenciasNotificaciones = {
  recordatorioActivado: boolean;
  hora: number;
  minuto: number;
  sugerenciasActivadas: boolean;
};

const PREFERENCIAS_INICIALES: PreferenciasNotificaciones = {
  recordatorioActivado: false,
  hora: 20,
  minuto: 0,
  sugerenciasActivadas: false,
};

export function useNotificaciones() {
  const [preferencias, setPreferencias] =
    useState<PreferenciasNotificaciones>(PREFERENCIAS_INICIALES);

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPreferencias();
  }, []);

  async function cargarPreferencias() {
    try {
      const guardadas = await AsyncStorage.getItem(CLAVE_PREFERENCIAS);

      if (guardadas) {
        const datos = {
          ...PREFERENCIAS_INICIALES,
          ...JSON.parse(guardadas),
        };

        setPreferencias(datos);

        if (datos.recordatorioActivado) {
          await programarRecordatorioDiario(datos.hora, datos.minuto);
        }

        if (datos.sugerenciasActivadas) {
          await programarSugerenciaReceta();
        }
      }
    } catch (error) {
      console.error("Error al cargar preferencias:", error);
    } finally {
      setCargando(false);
    }
  }

  async function guardarPreferencias(
    nuevas: PreferenciasNotificaciones
  ) {
    setPreferencias(nuevas);

    await AsyncStorage.setItem(
      CLAVE_PREFERENCIAS,
      JSON.stringify(nuevas)
    );
  }

  async function cambiarRecordatorio(activado: boolean) {
    const nuevas = {
      ...preferencias,
      recordatorioActivado: activado,
    };

    if (activado) {
      await programarRecordatorioDiario(nuevas.hora, nuevas.minuto);
    } else {
      await cancelarRecordatorioDiario();
    }

    await guardarPreferencias(nuevas);
  }

  async function cambiarHora(hora: number, minuto: number) {
    const nuevas = {
      ...preferencias,
      hora,
      minuto,
    };

    if (nuevas.recordatorioActivado) {
      await programarRecordatorioDiario(hora, minuto);
    }

    await guardarPreferencias(nuevas);
  }

  async function cambiarSugerencias(activado: boolean) {
    const nuevas = {
      ...preferencias,
      sugerenciasActivadas: activado,
    };

    if (activado) {
      await programarSugerenciaReceta();
    } else {
      await cancelarSugerenciaReceta();
    }

    await guardarPreferencias(nuevas);
  }

  return {
    preferencias,
    cargando,
    cambiarRecordatorio,
    cambiarHora,
    cambiarSugerencias,
  };
}
