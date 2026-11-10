# SazónIA — Fase 2: Despensa y Stock

## Cambios

- Rediseño de la pantalla Despensa con identidad visual SazónIA.
- Resumen del número de ingredientes registrados.
- Búsqueda de ingredientes.
- Formulario existente para agregar ingredientes, conservando validaciones y suma de cantidades.
- Edición y eliminación mediante el modal existente.
- Nueva pantalla Stock (`src/screens/StockScreen.tsx`) para consultar el inventario con búsqueda y edición.
- Nueva ruta Expo Router: `src/app/stock.tsx`.
- Acceso Stock agregado a la navegación inferior.

## Decisión de datos

Despensa y Stock muestran la misma tabla `ingredientes`, filtrada por el usuario activo. No se crea una segunda tabla ni se duplican cantidades. Despensa funciona como espacio de captura/administración y Stock como vista de consulta del inventario.

## Prueba recomendada

1. Iniciar sesión con una cuenta que ya tenga ingredientes.
2. Abrir Despensa y verificar el resumen, búsqueda y edición.
3. Abrir Stock desde la navegación inferior.
4. Buscar un ingrediente y editarlo; volver a Despensa y comprobar que el cambio aparece ahí.
5. Cambiar de cuenta y verificar que cada usuario ve únicamente sus ingredientes.

No se cambió la estructura de SQLite ni las funciones de autenticación. Este paquete no incluye `.env`, `.git`, `.expo` ni `node_modules`.
