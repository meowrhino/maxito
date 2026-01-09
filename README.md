# 🌳 Maxito

Portfolio personal de Max Azemar. Una web minimalista que fusiona conceptos de navegación y diseño para crear una experiencia única de visualización de proyectos.

## Características

- **Navegación por slides:** Explora proyectos navegando entre slides, similar a una presentación.
- **Diseño minimal:** Estética limpia y sin distracciones, enfocada en el contenido.
- **Responsive:** Adaptado para desktop y móvil.
- **Acceso directo:** Usa `?slug=nombre-del-proyecto` para acceder directamente a un proyecto.
- **Multiidioma:** Preparado para español e inglés.

## Estructura del Proyecto

```
maxito/
├── index.html          # Estructura principal
├── style.css           # Estilos minimalistas
├── app.js              # Lógica de la aplicación
├── data.json           # Datos de proyectos y slides
├── images/             # Imágenes de los proyectos
└── manus/              # Documentación del proceso
    ├── ROADMAP.md
    └── TODO.md
```

## Uso

1. Clona el repositorio:
   ```bash
   git clone https://github.com/meowrhino/maxito.git
   ```

2. Abre `index.html` en tu navegador o despliega en un servidor web.

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
