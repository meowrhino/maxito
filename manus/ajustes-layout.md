# Ajustes de Layout - MAXITO

## 10 de febrero de 2026 - 07:45 GMT+1

### Sinopsis
Ajustes en el layout responsive de MAXITO para optimizar el uso del espacio en móvil y mejorar la alineación del contenido en desktop.

---

## Cambios Implementados

### 1. Móvil - Reducción de alturas

**Sidebar superior:**
- **Antes:** `max-height: 25dvh`
- **Después:** `max-height: 20dvh`
- **Motivo:** Liberar más espacio vertical para el contenido principal

**Footer inferior:**
- **Antes:** `--footer-height: 10dvh`
- **Después:** `--footer-height: 5dvh`
- **Motivo:** Reducir el espacio ocupado por los controles de navegación

**Resultado:** El contenido principal ahora tiene 5dvh adicionales (de 65dvh a 75dvh aproximadamente)

### 2. Móvil - Padding en proyectos

**Cambio en `.project-link` (móvil):**
```css
.project-link {
  flex-shrink: 0;
  white-space: normal;
  font-size: 0.875rem;
  padding: 0.5rem 0;  /* NUEVO */
}
```

**Motivo:** Añadir aire vertical entre los items de la lista de proyectos para mejorar la legibilidad y facilitar el toque en pantallas táctiles.

### 3. Desktop - Contenido pegado a la izquierda

**Cambio en `.slide-content`:**
```css
.slide-content {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;  /* Antes: center */
  justify-content: flex-start;
  gap: 2rem;
  padding: 3rem;
  opacity: 1;
  transition: opacity var(--transition-speed) ease-in-out;
}
```

**Cambio en `.slide-image-wrapper`:**
```css
.slide-image-wrapper {
  display: flex;
  align-items: flex-start;      /* Antes: center */
  justify-content: flex-start;  /* Antes: center */
  width: 100%;
  max-width: 900px;
  cursor: pointer;
}
```

**Motivo:** Alinear todo el contenido (texto e imágenes) a la izquierda en lugar de centrarlo horizontalmente, creando un layout más editorial y menos simétrico.

---

## Max-width Actual

El contenido en desktop mantiene los siguientes límites de anchura:

- **Imágenes y texto con imagen:** `max-width: 900px`
- **Slides de solo texto:** `max-width: 600px`

Estos valores no se han modificado en esta iteración.

---

## Archivos Modificados

- `style.css` - 5 edits aplicados

---

## Resultado Visual

**Desktop:**
- Contenido alineado a la izquierda con max-width de 900px
- Imágenes y texto comienzan desde el margen izquierdo del contenedor

**Móvil:**
- Sidebar superior: 20dvh (5dvh menos que antes)
- Footer inferior: 5dvh (5dvh menos que antes)
- Proyectos con padding vertical de 0.5rem para mejor separación
- Contenido principal con 10dvh adicionales de espacio
