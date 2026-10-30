# Feature F02: Generación de 3 recetas con Gemini

Estado: borrador por revisar.

## Objetivo

Sugerir al usuario tres opciones de platillo que pueda preparar con los ingredientes y cantidades que tiene registrados en su despensa.

## Actor

Usuario que cocina en casa.

## Precondiciones

- La despensa tiene al menos un ingrediente.
- El dispositivo tiene conexión a Internet.
- La clave de la API de Gemini está configurada en el proyecto (archivo .env, fuera de Git).

## Datos de entrada

El inventario actual de la despensa: nombre, cantidad y unidad de cada ingrediente. No hay otros datos que capture el usuario en esta feature.

## Flujo principal

1. El usuario presiona el botón "¿Qué cocino hoy?".
2. El sistema lee el inventario desde SQLite.
3. El sistema construye un prompt con el inventario y la instrucción de responder exclusivamente en formato JSON.
4. El sistema envía la petición a la API de Gemini y muestra un estado de carga.
5. El sistema recibe la respuesta y la valida (ver Validaciones).
6. El sistema muestra hasta tres opciones, cada una con nombre, descripción breve, tiempo estimado, dificultad e ingredientes que utiliza.

## Formato JSON esperado de la respuesta

Un arreglo de recetas. Cada receta contiene:

- nombre (texto);
- descripcion (texto breve);
- tiempo_minutos (número);
- dificultad (facil, media o dificil);
- ingredientes: lista de objetos con nombre, cantidad y unidad.

## Validaciones

- No se llama a la API si la despensa está vacía.
- La respuesta debe ser un JSON válido con la estructura esperada.
- Cada ingrediente de una receta debe existir en la despensa (comparación con la función normalizar).
- La cantidad requerida no puede superar la cantidad disponible, y la unidad debe coincidir con la registrada.
- Las recetas que no cumplan se descartan; si ninguna es válida se trata como error.

## Casos de error

- Sin conexión a Internet: mensaje claro y botón para reintentar.
- Falla de la API, clave inválida o límite de uso alcanzado: mensaje claro, sin detalles técnicos.
- Respuesta que no es JSON válido: un reintento automático y, si vuelve a fallar, mensaje de error.
- Tiempo de espera excedido: se cancela la petición y se ofrece reintentar.
- Menos de tres recetas válidas: se muestran las que haya, con aviso.
- Despensa vacía: mensaje que invita a registrar ingredientes, sin llamar a la API.

## Estados de la pantalla

Inicial, cargando, con resultados, sin resultados válidos, error.

## Resultado esperado

El usuario ve opciones realistas que puede cocinar con lo que tiene y puede elegir una (la preparación guiada se especifica en F03).

## Fuera de alcance

Instrucciones paso a paso (F03), descuento de insumos (F04), guardar recetas favoritas y filtros por preferencia o dieta.

## Supuestos por confirmar

- Se permite que las recetas usen agua y sal sin que estén en la despensa. Todo lo demás debe estar registrado.
- Si el usuario no tiene ingredientes suficientes para tres recetas, basta con mostrar las que sí sean viables.
- La clave de Gemini vive en el cliente (limitación aceptada para el prototipo y declarada en la documentación).

## Criterios de aceptación

- [ ] Con la despensa vacía no se llama a la API y se muestra un mensaje.
- [ ] Con ingredientes, el botón muestra estado de carga y luego hasta tres recetas.
- [ ] Cada receta muestra nombre, descripción, tiempo, dificultad e ingredientes.
- [ ] Ninguna receta mostrada usa ingredientes que no estén en la despensa (salvo los permitidos).
- [ ] Ninguna receta mostrada requiere más cantidad de la disponible.
- [ ] Sin Internet se muestra un mensaje de error y se puede reintentar.
- [ ] Una respuesta inválida de la IA no rompe la app.
- [ ] La clave de la API no se sube a GitHub.

## Tareas

- [ ] Agregar .env al .gitignore y crear el archivo con la clave.
- [ ] Definir los tipos Receta e IngredienteReceta (src/types).
- [ ] Crear el servicio de Gemini (src/services/gemini.ts).
- [ ] Crear la función que construye el prompt a partir del inventario.
- [ ] Crear el validador de la respuesta y de la disponibilidad (src/utils).
- [ ] Crear el hook useRecetas con los estados cargando, resultados y error.
- [ ] Crear la pantalla de sugerencias y sus componentes.
- [ ] Agregar la navegación entre Despensa y Sugerencias.
- [ ] Probar los criterios de aceptación.
