# RED · Gobernanza ambiental

Podcast educativo de CECAR, realizado con el audio original `audio/podcast.wav` (9:17). Sitio estático, sin dependencias de ejecución ni servicios de pago para sus visitantes.

## Incluye

- Reproductor adaptable con pausa, avance/retroceso de 15 s, volumen, velocidad y descarga.
- Seis capítulos, transcripción temporal navegable con búsqueda y descarga.
- Objetivos de aprendizaje y tres preguntas con retroalimentación y enlaces al audio.
- Reflexión personal opcional, temporal y descargable; no se guarda, envía ni revisa.
- Navegación por teclado, pestañas accesibles y respeto de movimiento reducido.
- Imagen ilustrativa generada con OpenAI. El caso amazónico del audio es hipotético, no un estudio documentado.

## Vista previa

Requiere Node.js 22 o superior solo para las herramientas locales. No requiere `npm install`.

```sh
npm start
```

Abre `http://localhost:4173`. Es preferible usar el servidor en vez de abrir `index.html` con doble clic: la transcripción se carga mediante `fetch`.

```sh
npm test
npm run build
```

## Publicar en GitHub Pages

1. Crea un repositorio y sube el proyecto a su rama `main`. **Nunca subas `.env`**; está excluido por `.gitignore`.
2. En **Settings → Pages → Source**, selecciona **GitHub Actions**.
3. El workflow `.github/workflows/pages.yml` prueba y publica solo los archivos permitidos de `dist/`.
4. La dirección publicada aparecerá en la ejecución de Actions. Las rutas relativas permiten usar un subdirectorio de repositorio.

GitHub Pages gratuito requiere un repositorio público en los planes gratuitos habituales. Verifica la disponibilidad según tu plan. Si tu rama tiene otro nombre, actualiza el workflow.

## Publicar en Cloudflare Pages

**Con repositorio:** crea un proyecto Pages, conecta el repositorio y usa:

- Framework: **None**.
- Build command: `npm run build`.
- Build output directory: `dist`.
- Node.js: **22** (`NODE_VERSION=22`, si hace falta).

**Sin repositorio:** ejecuta `npm run build` y sube únicamente el contenido de `dist/` mediante Direct Upload de Pages.

No necesitas variables de OpenAI para construir, publicar ni usar el RED. No despliegues la raíz completa del proyecto: contiene materiales internos y podría incluir `.env`.

## Audio y contenido

El WAV original se conserva sin modificaciones en el proyecto y no se copia a `dist/`: supera el límite de 25 MiB por archivo de Cloudflare Pages. `audio/podcast.mp3` es una versión de distribución de 96 kbps (~6.7 MB), derivada del mismo audio para reducir la transferencia. La transcripción se generó automáticamente con `whisper-1` y puede contener imprecisiones; conviene revisarla editorialmente antes de un uso evaluativo formal. Los capítulos usan tiempos aproximados y las actividades son material didáctico elaborado a partir del episodio.

Para editar capítulos: `index.html`, atributos `data-time` en segundos. Para editar las actividades: arreglo `questions` en `app.js`. Para editar transcripción: `audio/transcript.json` y su versión descargable `audio/transcripcion.txt`.

## Privacidad y activos

No hay analítica, cookies de seguimiento ni envíos de notas. Solo el progreso del audio usa `localStorage`; puede desaparecer si el usuario limpia el navegador. Las reflexiones no se persisten y no son revisadas ni calificadas: se pierden al recargar o cerrar la página, salvo que el estudiante decida descargarlas. La imagen y la transcripción se generaron durante el desarrollo; los visitantes no llaman a OpenAI. `tools/prepare-assets.mjs` es una herramienta opcional de autoría que requiere una clave local y puede generar costos si se ejecuta nuevamente.

Manrope se aloja localmente bajo SIL OFL 1.1; ver `assets/OFL-Manrope.txt`. El logo y favicon fueron proporcionados. La procedencia de la portada está en `assets/territorio.provenance.json`. No se atribuye una licencia al audio ni a la marca: corresponde al titular confirmar los permisos antes de publicarlos.

La publicación remota no se ha realizado: requiere acceso a la cuenta/repositorio del titular.
