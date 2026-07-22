# Sendero — London Dry Gin

Sitio web oficial de **Sendero London Dry Gin**, un gin artesanal argentino.
Landing page de una sola vista (one-page) con presentación de la marca, botánicos,
cócteles signature, historia y formulario de contacto.

🔗 **Producción:** https://senderogin.com.ar

## Stack

Sitio estático, sin dependencias ni build. HTML + CSS + JavaScript vanilla.

- `index.html` — estructura y contenido de todas las secciones.
- `css/styles.css` — estilos (design tokens en `:root`, nomenclatura BEM, responsive).
- `js/main.js` — age gate, navegación, animaciones (IntersectionObserver), validación del formulario.
- `js/config.js` — flag `window.TESTING` para el envío del formulario (ver abajo).
- `assets/img/` — logos, fotos y texturas. Las fotos tienen versión `.webp` + fallback original.

## Correr localmente

Al ser un sitio estático, alcanza con abrir `index.html` en el navegador.
Para evitar problemas de rutas relativas conviene servirlo con un servidor local:

```bash
# Python
python -m http.server 8000
# o Node
npx serve
```

Luego abrir http://localhost:8000

## Formulario de contacto

El formulario usa [FormSubmit](https://formsubmit.co) (sin backend propio).
El comportamiento se controla con `window.TESTING` en `js/config.js`:

- `TESTING = false` → **producción**: se envían los mails reales.
- `TESTING = true` → **desarrollo**: no se envía nada (bypass), para probar sin generar mails.

## Deploy

Se publica con **GitHub Pages** sobre el dominio propio definido en `CNAME`
(`senderogin.com.ar`). Cada push a `main` actualiza el sitio.

## SEO

Incluye meta description, Open Graph, Twitter Cards, JSON-LD (schema.org `Brand`),
`robots.txt`, `sitemap.xml` y `canonical`.
