# Diario de decisiones de desarrollo — SazónIA

## 1. Descripción del proyecto

SazónIA es una aplicación móvil de recetas inteligentes que permite administrar ingredientes, organizar compras y obtener sugerencias de recetas mediante inteligencia artificial.

## 2. Decisiones técnicas

| Decisión | Justificación |
|---|---|
| Utilizar React Native con Expo | Facilitar el desarrollo de una aplicación móvil y las pruebas en dispositivos Android. |
| Utilizar TypeScript | Mejorar la organización del código y detectar errores durante el desarrollo. |
| Utilizar Expo Router | Organizar la navegación entre las diferentes pantallas de la aplicación. |
| Utilizar SQLite | Almacenar localmente los datos del usuario, ingredientes y demás información sin depender de un servidor propio. |
| Integrar Gemini API | Permitir la generación de recetas mediante inteligencia artificial. |
| Utilizar Expo Image Picker | Permitir seleccionar fotografías para las recetas guardadas. |
| Utilizar expo-print y expo-sharing | Generar documentos PDF de las recetas y facilitar su compartición. |

## 3. Decisiones de diseño y funcionalidad

- Se eligió el nombre SazónIA para representar la combinación entre cocina e inteligencia artificial.
- Se organizaron las funciones principales en módulos para facilitar su utilización.
- Se implementó una despensa para administrar los ingredientes disponibles.
- Se incorporó un apartado de compras para organizar los ingredientes que el usuario necesita.
- Se integró un módulo de recetas que utiliza Gemini para generar sugerencias.
- Se agregó un apartado de favoritos para conservar recetas y sus fotografías.
- Se incorporó la posibilidad de exportar recetas en formato PDF.

## 4. Decisión sobre el almacenamiento

Se optó por utilizar SQLite como almacenamiento local para mantener la información dentro del dispositivo y evitar la necesidad de implementar un backend para la versión académica del proyecto.

Esta decisión también permite reducir la complejidad de la infraestructura necesaria para desarrollar y demostrar la aplicación.

## 5. Decisión sobre la inteligencia artificial

Se eligió Gemini API para generar recetas a partir de los ingredientes disponibles o de un ingrediente seleccionado.

La integración se planteó como una funcionalidad de demostración académica. La aplicación requiere una conexión a internet para comunicarse con el servicio de IA.

## 6. Decisiones sobre recursos y rendimiento

Se procuró evitar la incorporación innecesaria de imágenes pesadas dentro del proyecto para mantener un tamaño de aplicación razonable.

También se utilizaron recursos de Expo para implementar funcionalidades sin agregar infraestructura adicional.

## 7. Conclusión

Las decisiones tomadas durante el desarrollo de SazónIA buscaron mantener una aplicación funcional, organizada y adecuada para los objetivos académicos del proyecto. Se priorizó el almacenamiento local, la facilidad de desarrollo y la integración de inteligencia artificial, procurando evitar complejidad técnica innecesaria.