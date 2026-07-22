# Metabuscador Bibliográfico con IA — Biblioteca UADE

Herramienta web que **unifica todo el material bibliográfico disponible** (libros físicos, eBooks y recursos Open Access) en un solo buscador, para que los docentes puedan armar la bibliografía de sus clases de forma rápida. Incluye un asistente de **IA** que recomienda bibliografía de manera inteligente.

## Características

- **Búsqueda unificada** sobre el catálogo completo (físico + digital + Open Access) con puntaje de relevancia por tokens e ISBN.
- **Filtros** por disponibilidad (físico / digital / open access), año, idioma y colección.
- **Detalle del libro** con acciones de copiar, favoritos y "Utilizar IA".
- **Asistente de IA** (bot de ChatGPT) alimentado con los mismos datos para recomendar bibliografía.
- Vinculación automática a las plataformas de acceso (Cátedra/eLibro, Hammurabi, CP67).

## Tecnologías

- **Frontend:** HTML, CSS y JavaScript (vanilla, sin frameworks).
- **Procesamiento de datos:** Python (`pandas`, `openpyxl`).

## Estructura

| Archivo | Descripción |
|---|---|
| `Main.html` | Página del metabuscador (interfaz). |
| `styles.css` | Estilos y diseño visual. |
| `script.js` | Motor de búsqueda, filtros y renderizado de resultados. |
| `script.py` | Procesa el catálogo (Excel + CSV de OAPEN) y genera los JSON de datos. |
| `scriptSE.py` | Divide los datos en partes para cargarlas al bot de IA. |
| `Documento.txt` | Guía de uso completa del sistema. |

## Nota sobre los datos

Los archivos de datos (`search_fisico.json` y `search_digital.json`) **no se incluyen** en el repositorio por su tamaño (~67 MB, ~186.000 registros). Se **generan automáticamente** con `script.py` a partir del catálogo de la biblioteca. Por eso están excluidos en el `.gitignore`.

---

Desarrollado por **Sebastián Elgue** · Biblioteca UADE.
