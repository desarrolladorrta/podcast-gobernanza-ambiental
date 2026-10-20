import { mkdir, copyFile, readFile, readdir } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';

// Lista explícita: .env, herramientas y documentos internos nunca se publican.
export const publicFiles = [
  'index.html', 'styles.css', 'app.js',
  'assets/favicon.ico', 'assets/logo-cecar.png', 'assets/territorio.webp',
  'assets/manrope.woff2', 'assets/font-source.txt', 'assets/OFL-Manrope.txt',
  'assets/territorio.webp.json', 'assets/logo-cecar.png.json',
  'audio/podcast.mp3', 'audio/transcript.json', 'audio/transcripcion.txt',
];
const output = resolve('dist');
await mkdir(output, { recursive: true });
// No se borran archivos desconocidos: se bloquea el despliegue si aparecen.
async function validate(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Enlace no permitido en dist: ${entry.name}`);
    if (entry.isDirectory()) await validate(absolute);
    else if (!publicFiles.includes(relative(output, absolute).replaceAll('\\', '/')) && entry.name !== '.nojekyll') throw new Error(`Archivo no autorizado en dist: ${relative(output, absolute)}. Revísalo antes de publicar.`);
  }
}
await validate(output);
for (const file of publicFiles) {
  await mkdir(dirname(resolve(output, file)), { recursive: true });
  await copyFile(file, resolve(output, file));
}
const { writeFile } = await import('node:fs/promises');
await writeFile(resolve(output, '.nojekyll'), '');
const html = await readFile(resolve(output, 'index.html'), 'utf8');
if (html.includes('.env')) throw new Error('Referencia a archivo privado detectada.');
console.log(`Sitio estático preparado en dist/ (${publicFiles.length} archivos públicos).`);
