import { readFile, writeFile } from 'node:fs/promises';

const env = await readFile('.env', 'utf8');
const keys = [...env.matchAll(/^\s*([\w]+)\s*=\s*(.+)\s*$/gm)];
const match = keys.find(([ , name]) => /OPENAI.*(KEY|TOKEN)|API_TOKEN/i.test(name));
if (!match) throw new Error('No se encontró la clave OpenAI en .env');
const key = match[2].trim().replace(/^['"]|['"]$/g, '');
const headers = { Authorization: `Bearer ${key}` };
if (process.argv[2] === 'transcribe') {
  const form = new FormData();
  form.append('file', new Blob([await readFile('audio/podcast.mp3')], { type: 'audio/mpeg' }), 'podcast.mp3');
  form.append('model', 'whisper-1');
  form.append('language', 'es');
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'segment');
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers, body: form });
  if (!response.ok) throw new Error(`Transcripción: HTTP ${response.status}`);
  const data = await response.json();
  await writeFile('audio/transcript.json', JSON.stringify({ text: data.text, segments: data.segments.map(({ start, end, text }) => ({ start, end, text })) }, null, 2));
  console.log('Transcripción guardada en audio/transcript.json');
} else if (process.argv[2] === 'image') {
  const prompt = 'Create an exquisite editorial landscape photograph for a university educational podcast about environmental governance in Colombia. A wide winding emerald river through dense tropical green rainforest, viewed from a gently elevated hillside, distant misty blue mountains, soft daylight, lush natural greens with a subtly cool palette, a small rural riverside settlement integrated into nature in the far distance. Photorealistic, sophisticated natural history magazine art direction, atmospheric depth, no text, no logos, no lettering, no people in foreground. Landscape composition, river flows from bottom center toward upper right. This is an illustrative scene, not a depiction of a specific real place.';
  const response = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1536x1024', quality: 'medium', n: 1 }) });
  if (!response.ok) throw new Error(`Imagen: HTTP ${response.status}`);
  const data = await response.json();
  await writeFile('assets/territorio.png', Buffer.from(data.data[0].b64_json, 'base64'));
  await writeFile('assets/territorio.provenance.json', JSON.stringify({ source: 'OpenAI', model: 'gpt-image-1', prompt, generated: new Date().toISOString(), note: 'Escena ilustrativa; no representa un lugar específico.' }, null, 2));
  console.log('Imagen generada.');
}
