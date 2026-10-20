import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

test('El HTML usa rutas relativas y todos los recursos locales existen', async () => {
  const html = await readFile('index.html', 'utf8');
  for (const [, path] of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) {
    if (path === './' || /^https?:/.test(path)) continue;
    assert.ok(!(path.startsWith('/')), `Ruta absoluta: ${path}`);
    assert.ok((await stat(path)).isFile(), `Recurso ausente: ${path}`);
  }
  assert.match(html, /lang="es"/);
  assert.equal((html.match(/class="chapter(?: active)?"/g) || []).length, 6);
});
test('La transcripción conserva segmentos cronológicos del audio', async () => {
  const data = JSON.parse(await readFile('audio/transcript.json', 'utf8'));
  assert.ok(data.segments.length > 100);
  let last = 0;
  for (const segment of data.segments) {
    assert.ok(segment.start >= last);
    assert.ok(segment.end >= segment.start);
    assert.ok(segment.text.trim());
    last = segment.start;
  }
  assert.ok(data.segments.at(-1).end <= 558);
  assert.match(data.text, /gobernanza ambiental/i);
});
test('La aplicación pública no incorpora credenciales ni llamadas a servicios de IA', async () => {
  for (const path of ['index.html', 'styles.css', 'app.js']) {
    const text = await readFile(path, 'utf8');
    assert.doesNotMatch(text, /sk-[a-zA-Z0-9]{15,}|api\.openai\.com|OPENAI_API_KEY|\.env/);
  }
});
test('La portada está optimizada y la tipografía es un WOFF2 real', async () => {
  assert.ok((await stat('assets/territorio.webp')).size < 800000);
  const font = await readFile('assets/manrope.woff2');
  assert.equal(font.subarray(0, 4).toString(), 'wOF2');
});

test('El paquete de publicación excluye secretos y respeta el límite de Cloudflare', async () => {
  const { publicFiles } = await import('../tools/build.mjs');
  assert.ok(!publicFiles.some((path) => path.includes('.env') || path.startsWith('tools/') || path.endsWith('.wav')));
  for (const path of publicFiles) assert.ok((await stat(`dist/${path}`)).size <= 25 * 1024 * 1024, `Archivo demasiado grande: ${path}`);
  await assert.rejects(stat('dist/.env'));
});

test('La reflexión es opcional y no tiene persistencia ni envío', async () => {
  const html = await readFile('index.html', 'utf8');
  const js = await readFile('app.js', 'utf8');
  assert.match(html, /nadie las revisará ni calificará/);
  assert.match(html, /Tu reflexión personal \(opcional\)/);
  assert.doesNotMatch(js, /cecar-podcast-reflection/);
  assert.match(js, /link\.download = 'mi-reflexion-gobernanza-ambiental.txt'/);
});
