# 🌳 Maxito

Portfolio personal de Max Azemar. Una web minimalista que fusiona conceptos de navegación y diseño para crear una experiencia única de visualización de proyectos.

## Características

- **Una dirección por página:** `/god/` (inglés) y `/ca/god/` (catalán); el about es `/` y `/ca/`. Cada una es un HTML de verdad, con su contenido, su title y su og:image. Las de antes (`/en/god`, `/cat/god`) redirigen.

## Estructura del Proyecto

```
maxito/
├── index.html          # La plantilla de todas las páginas
├── build/build.mjs     # data.json + index.html -> dist/ (una página por dirección)
├── style.css           # Estilos minimalistas
├── app.js              # Lógica de la aplicación
├── data.json           # Datos de proyectos y slides
├── data/                # PDFs y assets de easter eggs
└── img/                # Imágenes de los proyectos
```

## Uso

1. Clona el repositorio:
   ```bash
   git clone https://github.com/meowrhino/maxito.git
   ```

2. `node build/build.mjs` escribe la web en `dist/` (no se commitea; con ffmpeg, también las og:image). Para verla: `node .claude/static-server.cjs` → http://localhost:8766.
   Al hacer push a `main`, la Action (`.github/workflows/deploy.yml`) la construye y la publica en GitHub Pages.

3. Para añadir nuevos proyectos, edita `data.json` siguiendo la estructura existente.

## Tecnologías

- HTML5
- CSS3 (sin frameworks)
- JavaScript vanilla (sin librerías)

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
