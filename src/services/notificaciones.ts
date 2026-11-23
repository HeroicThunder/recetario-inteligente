
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export async function solicitarPermisosNotificaciones() {
  const permisos = await Notifications.getPermissionsAsync();

  console.log("Estado actual de permisos:", permisos);

  if (permisos.granted) {
    return true;
  }

  const respuesta = await Notifications.requestPermissionsAsync();

  console.log("Resultado de solicitud:", respuesta);

  return respuesta.granted;
}


async function cancelarPorTipo(tipo: string) {
  const programadas =
    await Notifications.getAllScheduledNotificationsAsync();

  for (const notificacion of programadas) {
    if (notificacion.content.data?.tipo === tipo) {
      await Notifications.cancelScheduledNotificationAsync(
        notificacion.identifier
      );
    }
  }
}

export async function programarRecordatorioDiario(
  hora: number,
  minuto: number
) {
  await cancelarRecordatorioDiario();

  const permiso = await solicitarPermisosNotificaciones();

  if (!permiso) {
    throw new Error("No se concedieron permisos para las notificaciones.");
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Es hora de cocinar!",
      body: "Tu despensa puede inspirarte. Prepara algo delicioso hoy.",
      sound: "default",
      data: { tipo: "recordatorio-diario" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hora,
      minute: minuto,
    },
  });
}

export async function cancelarRecordatorioDiario() {
  await cancelarPorTipo("recordatorio-diario");
}

export async function programarSugerenciaReceta() {
  await cancelarSugerenciaReceta();

  const permiso = await solicitarPermisosNotificaciones();

  if (!permiso) {
    throw new Error("No se concedieron permisos para las notificaciones.");
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Una idea para tu próxima comida",
      body: "¡Descubre qué puedes preparar hoy con los ingredientes de tu despensa!",
      sound: "default",
      data: { tipo: "sugerencia-receta" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    },
  });
}

export async function cancelarSugerenciaReceta() {
  await cancelarPorTipo("sugerencia-receta");
}
