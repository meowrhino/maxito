# 🌳 Maxito

Portfolio personal de Max Azemar. Una web minimalista que fusiona conceptos de navegación y diseño para crear una experiencia única de visualización de proyectos.

## Características

- **Una dirección por página:** `/god/` (inglés) y `/ca/god/` (catalán); el about es `/` y `/ca/`. Cada una es un HTML de verdad, con su contenido, su title y su og:image. Las de antes (`/en/god`, `/cat/god`) redirigen.

## Estructura

```
maxito/
├── data/site.json          el nombre, el dominio y el menú: "lists" (about, work, collective), en orden
├── data/                   también los PDF y los easter eggs (eastereggs/, svg/)
├── projects/<slug>/        un proyecto, una carpeta: project.json + img/1.webp… (imgToWeb)
├── schema/                 qué campos lleva cada JSON (VS Code, el build y la vista previa)
├── index.html              la plantilla de todas las páginas, y la vista previa con Live Server
├── build/build.mjs         data/ + projects/ + index.html → dist/ (una página por dirección)
├── app.js, js/core/        el JS de siempre (render, estado); js/effects/, los easter eggs
├── js/core/house.js        la forma de la casa → la forma que entiende el JS (lo usan el navegador y el build)
├── js/core/validar.js      el JSON Schema sin dependencias (de JAMstack), mensajes en catalán
├── style.css
├── GUIA.md                 para Max · TRASPASO.md · CLAUDE.md (si el build falla)
└── wrangler.jsonc          la copia de Max, en Workers Builds
```

## Cómo funciona

- **Una SPA con pre-render** (JAMstack, receta §"SPA"): el build escribe cada dirección con su
  contenido, su title y su og:image, y al cargar el JS de siempre vuelve a pintar lo mismo. Las
  flechas, los idiomas y los easter eggs no cambian de página, solo de dirección. Por eso no lleva
  la transición de la casa: no hay recargas entre proyectos.
- **El contenido, a la manera de la casa**: `data/site.json` + `projects/<slug>/project.json`,
  campos en inglés, `{ "en", "ca" }`, fotos por número. `js/core/house.js` lo pasa a la forma
  de antes (`{ slug: [slides] }`, con `title_cat`, `text_en`…), así que render.js y los efectos
  no cambian. Una lista de `lists` es un grupo del menú; `about` tiene que ser el primero.
- **Fotos**: una sola versión en el repo (imgToWeb). El build hace con **sharp** (`npm ci`) la
  og:image (1200×630, sobre `#f5f5f0`) y las de 640 y 1200 del `srcset`, en `.cache/` (fuera de
  git) y a `dist/` junto a su foto. Sin sharp, avisa y publica sin ellas.
- **Vista previa**: Live Server sobre la carpeta (`index.html`). Sin `data-built` en `<html>`, el
  JS valida los JSON con `schema/` y enseña en pantalla lo que pararía el build; las fotos van sin
  `srcset` (las pequeñas solo las hace el build).
- **Publicar, una en cada copia**: la nuestra, `.github/workflows/deploy.yml` a GitHub Pages
  (solo corre en `meowrhino`; si falla, un issue). La de Max, Workers Builds con `wrangler.jsonc`.
  El build mira dónde está: con `GITHUB_ACTIONS`, base `/maxito` y `noindex`; si no, la raíz y el
  `url` de `site.json` (con `url`, se indexa). Traspaso: [TRASPASO.md](TRASPASO.md).
- **Direcciones**: `/`, `/god/`, `/ca/`, `/ca/god/`; las de antes (`/en/god`, `/cat/god`) redirigen.
- **Ocultos**: no hay. En una SPA el menú es la web entera; para quitar un proyecto, se quita de `lists`.

## Uso

```bash
npm ci
node build/build.mjs      # escribe dist/
```

## Cambios v2

- **Estética Windows XP "Roto":** Nueva paleta de colores con tonos suaves y rotos.
- **Controles Rediseñados:** Flechas fijas en las esquinas inferiores y contador de diapositivas como fracción diagonal.
- **Responsive Mejorado:** Barra de navegación móvil optimizada (max 25dvh) y contenido más compacto.
- **About como Popup:** El panel "About" ahora es un modal centrado con borde y sombra.
- **Indicadores de Navegación Mejorados:** El nombre del proyecto anterior/siguiente aparece junto a las flechas de navegación.

## Créditos

Desarrollado por [meowrhino.studio](https://meowrhino.studio)

---

© 2025 Max Azemar
