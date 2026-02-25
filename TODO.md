# TODO

## Revisión técnica (2026-02-24)

- [x] Corregir desincronización al clicar proyectos durante transición (`goToProject` cambia estado aunque `renderSlide` se cancele por `isTransitioning`).
- [x] Endurecer seguridad de render de texto: evitar `innerHTML` directo con contenido de `data.json` o sanitizar explícitamente.
- [x] Validar protocolo en links antes de asignar `href` (bloquear `javascript:` y esquemas no deseados).
- [x] Mejorar accesibilidad: añadir `aria-label` a flechas de navegación desktop y mobile.
- [x] Actualizar `README.md`: idioma real (`cat/en`) y carpeta de imágenes (`img/` en lugar de `images/`)