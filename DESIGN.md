---
name: Gobernanza ambiental · CECAR
description: Bitácora sonora de territorio para aprender escuchando.
colors:
  forest: "#143f35"
  forest-dark: "#0d3028"
  ink: "#213a33"
  muted: "#64736c"
  line: "#dfe7e1"
  paper: "#f6f8f5"
  soft: "#eaf0e8"
  lime: "#daecb1"
  white: "#fff"
typography:
  display:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "clamp(30px,3.2vw,43px)"
    fontWeight: 750
    lineHeight: 1.18
    letterSpacing: "-.04em"
  body:
    fontFamily: "Manrope, 'Segoe UI', sans-serif"
    fontSize: "14px"
    lineHeight: 1.65
  cover-title:
    fontSize: "clamp(24px,2.4vw,33px)"
    fontWeight: 650
    lineHeight: 1.22
    letterSpacing: "-.035em"
rounded:
  radius: "16px"
components:
  player:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.radius}"
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    rounded: "7px"
    padding: "12px 18px"
  chapter-active:
    backgroundColor: "{colors.soft}"
    rounded: "7px"
    padding: "17px 10px"
---

# Design System: Gobernanza ambiental · CECAR

## Overview

**Creative North Star: "Bitácora sonora de territorio"**

Mundo aprobado por el usuario: fotografía fluvial y bosque, fondo claro, verde profundo, reproductor protagonista y capítulos. La imagen tiene tratamiento fotográfico, pero es una escena generada ilustrativa, no un registro de un territorio real. La interfaz acompaña la escucha y la lectura sin competir con ellas.

**Key Characteristics:**
- Portada naturalista con texto blanco sobre sombreado.
- Controles sólidos, separadores discretos y superficies claras.
- Identidad CECAR conservada y Manrope local.

Fuente de verdad: `index.html` y `styles.css`; contexto aprobado en `PRODUCT.md` y `.impeccable/surface.md`. Implementación HTML/CSS/JavaScript estática, sin framework. El sidecar solicitado es `.impeccable/design-system.json`; extiende este frontmatter sin crear otra paleta.

## Colors

### Primary
- **forest / forest-dark:** cabecera, títulos, controles principales y selección de texto.
- **lime:** onda de portada y fondo de selección; acento pequeño, no superficie dominante.

### Neutral
- **paper / white:** fondo general y reproductor/campos.
- **ink / muted:** texto principal y secundario.
- **line / soft:** divisiones y superficies seleccionadas o suaves.

Son los valores reales de `:root`. Los colores locales de estados no forman una escala adicional. Excepción de contraste documentada: números de capítulos inactivos y subtítulos del capítulo activo usan (`#607066`); el número activo conserva forest por especificidad.

## Typography

Manrope variable local (`assets/manrope.woff2`, pesos 200–800, `font-display: swap`), con Segoe UI y sans-serif de respaldo. Procedencia en `assets/font-source.txt`; licencia en `assets/OFL-Manrope.txt`.

El título de página y el de portada usan los roles del frontmatter. Los títulos de contenido son de (22px), con interlínea (1.4); el texto explicativo es de (12px), interlínea (1.9) y ancho máximo (68ch). Etiquetas y metadatos oscilan entre (9–12px); tiempos usan cifras tabulares. No hay una segunda familia ni una escala tipográfica formal declarada.

## Layout

Contenedor centrado de (1280px), con laterales de (48px). Escucha en dos columnas (`minmax(0,1.9fr) minmax(290px,1fr)`), separación de (34px); sección educativa debajo. Contenido introductorio en proporción (1.5fr / 1fr), separación de (78px). No se ha declarado una escala de espaciado: conservar medidas de cada patrón.

- Hasta (1100px): laterales (30px), introducción apilada; escucha en (1.65fr / 1fr), capítulo mínimo (280px), separación (24px).
- Hasta (760px): laterales (22px), escucha y contenido educativo en una columna; capítulos después del reproductor. Título principal (32px), portada (300px) y título de portada (29px). Pestañas con desplazamiento horizontal. Volumen deslizante oculto, botón de silencio disponible; saltos, silencio, velocidad y pestañas tienen mínimos observados de (44px). Reflexión en rejilla de icono y contenido; acciones y pie se apilan.
- Desde (1500px): portada (340px), separación de escucha (40px), margen superior interior (35px); el contenedor mantiene su máximo.

## Elevation & Depth

Profundidad contenida: borde fino y sombra casi imperceptible del reproductor (`0 8px 24px #193e3105`). El resto se separa principalmente con líneas y fondos tonales. La portada usa un degradado oscuro sobre la imagen para sostener el texto, no una tarjeta flotante adicional.

## Shapes

Reproductor con radio principal del frontmatter y recorte de portada; reproducción circular. Capítulos, búsqueda y opciones usan esquinas de (7px); etiquetas (5px), reflexión y transcripción (10px), textarea (8px). Son medidas locales observadas, no nuevos tokens globales.

## Components

- **Reproductor:** portada recortada con `object-fit: cover`, posición `center 53%`, altura base (318px); cuerpo blanco, línea temporal, tiempos, volumen, saltos de 15 segundos, reproducción, velocidad y descarga. Reproducción aumenta a escala (1.04) y verde (`#255a48`) al hover. Error de audio con alerta, reintento y descarga alternativa.
- **Saltos de audio:** botones circulares de 44px, SVG de 30px con flechas simétricas y el número 15 integrado en sus coordenadas, sin superposición HTML. Hover soft y borde line; etiquetas accesibles y títulos describen la dirección.
- **Reflexión:** espacio personal opcional, temporal y sin evaluación. El aviso visible explica que no se guarda ni envía; la descarga es explícita y voluntaria.
- **Capítulos:** fila completa como botón; número, título, subtítulo y tiempo. Hover (`#edf1eb`), activo soft y `aria-current`; mantener los dos ajustes de contraste descritos arriba.
- **Pestañas:** texto muted, selección forest y peso (800), subrayado de (3px); roles y asociación con paneles presentes en HTML. No convertir la selección en una pastilla.
- **Etiquetas temáticas:** informativas, no botones; fondo soft, borde (`#dce5d6`), texto (`#446345`), relleno (4px 9px).
- **Búsqueda y escritura:** búsqueda blanca con borde line; etiqueta «Buscar en la transcripción» visualmente oculta, vinculada al campo. Textarea con etiqueta visible y altura mínima (120px). Transcripción desplazable, filas resaltadas por hover/estado actual.
- **Práctica:** opciones blancas con radio y borde; selección/hover verde suave. Feedback correcto verde; incorrecto ámbar. Acción principal forest; enlaces de texto con subrayado al hover. No se documentan estados no observados.

Foco compartido en botones, enlaces, select, inputs y textarea: contorno de (3px) en (`#658c41`), separado (4px); el buscador ajusta la separación a (5px). Enlace de salto visible al enfocar. Mantener nombres accesibles de controles e iconos decorativos ocultos a tecnologías de asistencia.

Movimiento observado: transiciones de fondo y escala de (0.2s), desplazamiento suave y pulso de estado de (1.8s) durante reproducción. Con `prefers-reduced-motion: reduce` se desactivan animaciones y transiciones, y el desplazamiento pasa a automático.

## Do's and Don'ts

### Do:
- **Do** conservar el protagonismo de la escucha, la fotografía ilustrativa y la identidad CECAR aprobadas.
- **Do** preservar foco visible, etiquetas accesibles y alternativa de movimiento reducido.
- **Do** mantener la procedencia raster: `assets/territorio.webp.json` documenta OpenAI/gpt-image-1 y conversión ffmpeg calidad 88; `assets/territorio.png.json` y `assets/territorio.provenance.json` registran el original; `assets/logo-cecar.png.json` identifica el logo proporcionado, sin modificación.

### Don'ts:
- **Don't** presentar la escena generada como fotografía documental de un lugar real ni inventar autoría o licencias. El favicon existente no tiene un registro de procedencia observado.
- **Don't** introducir escalas, componentes o tokens no presentes, ni copiar contratos de desarrollo al HTML.
- **Don't** convertir el veredicto final **ship** en una afirmación de conformidad WCAG total: el alcance comunicado es la resolución de dos contrastes de capítulos con `#607066` y la etiqueta sr-only del buscador. Esta documentación no añade una auditoría de navegador.
