# Feature F01: Gestión de despensa

## Objetivo

Permitir que el usuario registre, consulte, modifique y elimine los ingredientes que tiene disponibles, con cantidades exactas y unidad de medida.

## Actor

Usuario que cocina en casa.

## Precondiciones

Ninguna. La base de datos local se crea automáticamente al abrir la app por primera vez.

## Datos de entrada

- nombre del ingrediente (texto);
- cantidad (número mayor que cero);
- unidad: g, kg, ml, l o pza (selección, no texto libre).

## Flujo principal

1. El usuario abre la app y ve la lista de ingredientes (o un mensaje de despensa vacía).
2. Escribe nombre y cantidad, elige la unidad y presiona "Agregar a la despensa".
3. El sistema valida los datos y guarda el ingrediente en SQLite.
4. El ingrediente aparece en la lista, ordenada por nombre.
5. Para modificar o eliminar, el usuario toca un ingrediente y se abre una ventana de edición.
6. En la ventana puede cambiar nombre, cantidad y unidad y presionar "Guardar cambios", o presionar "Eliminar" y confirmar.

## Reglas de duplicados

- Si el ingrediente ya existe con la misma unidad, el sistema pregunta si se desea sumar la nueva cantidad a la existente.
- Si el ingrediente existe con otra unidad, el sistema avisa y pide confirmación antes de crear un registro aparte, porque no hay conversión válida entre, por ejemplo, piezas y mililitros.
- La comparación de nombres ignora mayúsculas, acentos y espacios sobrantes.

## Validaciones

- El nombre es obligatorio.
- La cantidad debe ser un número mayor que cero.
- La unidad solo puede ser una de las opciones del selector.

## Casos de error

- Si faltan datos o son inválidos, el ingrediente no se guarda.
- Pendiente: mostrar un mensaje al usuario cuando falle una operación de la base de datos.
- Pendiente: mostrar un mensaje específico cuando la validación falle (por ahora solo se ignora el intento).

## Resultado esperado

El inventario refleja con fidelidad lo que el usuario tiene y persiste aunque se cierre la app.

## Criterios de aceptación

- [x] El usuario puede agregar un ingrediente con nombre, cantidad y unidad.
- [x] No se guarda un ingrediente sin nombre o con cantidad menor o igual a cero.
- [x] Los ingredientes siguen en la lista después de cerrar y reabrir la app.
- [x] Al tocar un ingrediente se abre la ventana de edición.
- [x] El usuario puede modificar nombre, cantidad y unidad.
- [x] El usuario puede eliminar un ingrediente tras confirmar.
- [x] Al agregar un ingrediente existente en la misma unidad se ofrece sumar la cantidad.
- [x] Al agregar un ingrediente existente en otra unidad se pide confirmación.
- [ ] Se informa al usuario cuando la validación o la base de datos fallan.
- [ ] La pantalla se adapta correctamente a orientación horizontal.

## Tareas

- [x] Crear tabla de ingredientes y funciones CRUD (src/db/database.ts).
- [x] Crear pantalla de despensa con formulario y lista.
- [x] Agregar selector de unidades.
- [x] Agregar ventana de edición y eliminación.
- [x] Agregar detección de duplicados.
- [ ] Agregar mensajes de error visibles.
- [ ] Adaptar el diseño a orientación horizontal.
