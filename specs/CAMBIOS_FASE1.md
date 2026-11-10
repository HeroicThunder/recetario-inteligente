# SazónIA — Base de datos fase 1

Esta versión conserva las pantallas y el flujo actual y prepara SQLite para las funciones nuevas.

## Cambios
- `src/db/database.ts`: `iniciarDb()` crea las tablas `compras`, `favoritos` y `preparaciones` si no existen.
- Las nuevas tablas incluyen `usuario_id`; las consultas y operaciones filtran por la sesión activa.
- `confirmarCompras()` mueve al stock (tabla `ingredientes`) los artículos marcados como comprados y elimina esos artículos de la lista, dentro de una transacción.
- Se agregaron operaciones para listar/agregar/marcar/eliminar compras.
- Se agregaron operaciones para guardar/listar/actualizar foto/eliminar favoritos.
- Se agregaron operaciones para guardar y listar preparaciones terminadas.
- `src/hooks/useRecetas.ts`: se corrigió la importación de `inicializarAutenticacion()` que faltaba en el ZIP recibido.

## Importante
- Stock es la tabla `ingredientes` existente. Despensa y Stock no duplican cantidades: serán vistas diferentes del mismo inventario.
- Las pantallas nuevas todavía no están conectadas en esta fase.
- La estructura detallada de recetas y el descuento transaccional de ingredientes se implementarán en la fase de recetas/preparación.
- Este ZIP no incluye `.env`, `.git`, `.expo` ni `node_modules`.
- Crea nuevamente tu `.env` local con tu clave API nueva. No compartas ni subas ese archivo.
