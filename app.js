'use strict';
const $ = (selector) => document.querySelector(selector);
const audio = $('#audio');
const play = $('#play');
const seek = $('#seek');
const chapters = [...document.querySelectorAll('.chapter')];
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
};
const time = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const icon = (button, name) => button.querySelector('use').setAttribute('href', `#i-${name}`);
let pendingSeek = null;
let lastSaved = 0;
let transcriptLines = [];
let transcriptReady = false;
let resumeApplied = false;

function setState(text) {
  $('#play-state').replaceChildren(Object.assign(document.createElement('span'), { className: 'status-dot' }), document.createTextNode(` ${text}`));
}
async function startAudio() {
  try { await audio.play(); } catch (error) {
    if (error.name !== 'AbortError') {
      setState('Pulsa reproducir para reintentar');
      if (audio.error) $('#audio-error').hidden = false;
    }
  }
}
play.addEventListener('click', () => audio.paused ? startAudio() : audio.pause());
audio.addEventListener('play', () => {
  icon(play, 'pause'); play.setAttribute('aria-label', 'Pausar podcast');
  $('.player').classList.add('is-playing'); setState('Estás escuchando');
});
audio.addEventListener('pause', () => {
  icon(play, 'play'); play.setAttribute('aria-label', 'Reproducir podcast');
  $('.player').classList.remove('is-playing'); setState(audio.ended ? 'Episodio finalizado' : 'En pausa · continúa a tu ritmo');
  storage.set('cecar-podcast-position', audio.currentTime);
});
audio.addEventListener('waiting', () => { if (!audio.paused) setState('Cargando audio…'); });
audio.addEventListener('playing', () => setState('Estás escuchando'));
audio.addEventListener('ended', () => { storage.set('cecar-podcast-position', '0'); setState('Episodio finalizado · sigue con la actividad'); });
audio.addEventListener('error', () => { $('#audio-error').hidden = false; setState('Audio no disponible'); });
$('#retry').addEventListener('click', () => { $('#audio-error').hidden = true; audio.load(); startAudio(); });
function paintRange(range, percentage) {
  range.style.background = `linear-gradient(to right, var(--forest) ${percentage}%, var(--line) ${percentage}%)`;
}
function updatePlayer() {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 556.85;
  seek.max = duration;
  seek.value = audio.currentTime;
  seek.setAttribute('aria-valuetext', `${time(audio.currentTime)} de ${time(duration)}`);
  paintRange(seek, audio.currentTime / duration * 100);
  $('#current-time').textContent = time(audio.currentTime);
  $('#duration').textContent = time(Math.round(duration));
  let currentChapter = 0;
  chapters.forEach((chapter, index) => { if (audio.currentTime >= Number(chapter.dataset.time)) currentChapter = index; });
  chapters.forEach((chapter, index) => {
    chapter.classList.toggle('active', index === currentChapter);
    if (index === currentChapter) chapter.setAttribute('aria-current', 'true');
    else chapter.removeAttribute('aria-current');
  });
  transcriptLines.forEach((line) => line.classList.toggle('current', audio.currentTime >= Number(line.dataset.start) && audio.currentTime < Number(line.dataset.end)));
  if (Math.abs(audio.currentTime - lastSaved) > 5) { storage.set('cecar-podcast-position', audio.currentTime); lastSaved = audio.currentTime; }
}
audio.addEventListener('loadedmetadata', () => {
  if (pendingSeek !== null) { audio.currentTime = pendingSeek; pendingSeek = null; }
  else if (!resumeApplied) {
    const saved = Number(storage.get('cecar-podcast-position'));
    if (Number.isFinite(saved) && saved > 0 && saved < audio.duration - 3) { audio.currentTime = saved; setState('Retoma donde lo dejaste'); }
  }
  resumeApplied = true; updatePlayer();
});
audio.addEventListener('timeupdate', updatePlayer);
function jumpTo(seconds, shouldPlay = false) {
  const target = Math.max(0, Math.min(seconds, Number.isFinite(audio.duration) ? audio.duration : 556.85));
  if (audio.readyState >= 1) audio.currentTime = target;
  else { pendingSeek = target; audio.load(); }
  if (shouldPlay) startAudio();
  updatePlayer();
}
seek.addEventListener('input', () => jumpTo(Number(seek.value)));
$('#back').addEventListener('click', () => jumpTo(audio.currentTime - 15));
$('#forward').addEventListener('click', () => jumpTo(audio.currentTime + 15));
chapters.forEach((chapter) => chapter.addEventListener('click', () => jumpTo(Number(chapter.dataset.time), true)));
$('#speed').addEventListener('change', (event) => { audio.playbackRate = Number(event.target.value); });
function updateVolume() {
  const muted = audio.muted || audio.volume === 0;
  icon($('#mute'), muted ? 'muted' : 'volume');
  $('#mute').setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar');
  $('#volume').value = audio.muted ? 0 : audio.volume;
  paintRange($('#volume'), Number($('#volume').value) * 100);
}
$('#volume').addEventListener('input', (event) => { audio.volume = Number(event.target.value); audio.muted = audio.volume === 0; updateVolume(); });
$('#mute').addEventListener('click', () => { audio.muted = !audio.muted; if (!audio.muted && audio.volume === 0) audio.volume = 1; updateVolume(); });
audio.addEventListener('volumechange', updateVolume);
updateVolume();

const tabs = [...document.querySelectorAll('[role=tab]')];
function activateTab(tab, focus = false) {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
  if (tab.id === 'tab-transcript') loadTranscript();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); activateTab(tabs[next], true); }
  });
});
$('#go-practice').addEventListener('click', () => { activateTab($('#tab-practice'), true); $('.learning').scrollIntoView({ block: 'start' }); });
async function loadTranscript() {
  if (transcriptReady) return;
  transcriptReady = true;
  try {
    const response = await fetch('audio/transcript.json');
    if (!response.ok) throw new Error('No disponible');
    const data = await response.json();
    const fragment = document.createDocumentFragment();
    // Agrupar fragmentos cortos facilita la lectura sin perder la navegación temporal.
    for (let i = 0; i < data.segments.length; i += 3) {
      const group = data.segments.slice(i, i + 3);
      const line = document.createElement('button'); line.type = 'button'; line.className = 'transcript-line';
      line.dataset.start = group[0].start; line.dataset.end = group.at(-1).end;
      const stamp = document.createElement('time'); stamp.textContent = time(group[0].start);
      const text = document.createElement('span'); text.textContent = group.map((segment) => segment.text.trim()).join(' ');
      line.append(stamp, text);
      line.setAttribute('aria-label', `Escuchar desde ${stamp.textContent}: ${text.textContent}`);
      line.addEventListener('click', () => jumpTo(Number(line.dataset.start), true));
      fragment.append(line);
    }
    $('#transcript').replaceChildren(fragment);
    transcriptLines = [...document.querySelectorAll('.transcript-line')]; updatePlayer();
  } catch {
    $('#transcript').replaceChildren();
    const message = document.createElement('p'); message.textContent = 'No se pudo cargar la transcripción. ';
    const retry = document.createElement('button'); retry.className = 'text-link'; retry.textContent = 'Reintentar';
    retry.addEventListener('click', () => { transcriptReady = false; loadTranscript(); });
    message.append(retry); $('#transcript').append(message);
  }
}
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
$('#transcript-search').addEventListener('input', (event) => {
  const query = normalize(event.target.value.trim()); let count = 0;
  transcriptLines.forEach((line) => { const found = normalize(line.textContent).includes(query); line.hidden = !found; if (found) count++; });
  $('#search-count').textContent = query ? `${count} fragmento${count === 1 ? '' : 's'}` : '';
});

const questions = [
  { question: '1. ¿Qué caracteriza a la gobernanza ambiental?', options: ['El control exclusivo del Estado sobre todos los recursos naturales.', 'La articulación de actores, reglas y procesos para tomar decisiones ambientales.', 'La protección de ecosistemas sin considerar a quienes los habitan.'], correct: 1, feedback: 'La gobernanza articula comunidades, Estado, organizaciones y otros actores. Importan tanto las decisiones como quién participa y cómo se distribuyen las responsabilidades.', at: 58.5 },
  { question: '2. ¿Qué distingue la cogestión de recibir información?', options: ['La comunidad comparte decisiones y responsabilidades con otros actores.', 'La comunidad solo conoce una decisión que ya fue tomada.', 'La comunidad reemplaza todas las responsabilidades del Estado.'], correct: 0, feedback: 'Informar no equivale a decidir. En la cogestión, la comunidad comparte responsabilidades y decisiones; la participación no elimina el papel del Estado.', at: 140.5 },
  { question: '3. ¿Por qué es valioso el conocimiento ecológico tradicional?', options: ['Porque hace innecesario cualquier otro tipo de conocimiento.', 'Porque garantiza que nunca habrá conflictos en el territorio.', 'Porque aporta saberes transmitidos entre generaciones sobre los ecosistemas y las prácticas locales.'], correct: 2, feedback: 'Los saberes locales ayudan a entender cambios del territorio y prácticas de conservación. Reconocerlos permite complementar los conocimientos y fortalecer los proyectos.', at: 204 },
];
questions.forEach((question, index) => {
  const field = document.createElement('fieldset'); field.className = 'quiz-question';
  const legend = document.createElement('legend'); legend.textContent = question.question;
  const options = document.createElement('div'); options.className = 'quiz-options';
  question.options.forEach((text, optionIndex) => {
    const label = document.createElement('label'); label.className = 'quiz-option';
    const input = document.createElement('input'); input.type = 'radio'; input.name = `question-${index}`; input.value = optionIndex;
    const span = document.createElement('span'); span.textContent = text; label.append(input, span); options.append(label);
  });
  const feedback = document.createElement('div'); feedback.className = 'quiz-feedback'; feedback.id = `feedback-${index}`; feedback.hidden = true;
  field.append(legend, options, feedback); $('#quiz-questions').append(field);
});
$('#quiz').addEventListener('change', () => {
  const count = document.querySelectorAll('#quiz input:checked').length;
  $('#quiz-progress').textContent = `${count} de 3 respondidas`;
  $('#quiz-result').textContent = '';
  document.querySelectorAll('.quiz-feedback').forEach((feedback) => { feedback.hidden = true; });
});
$('#quiz').addEventListener('submit', (event) => {
  event.preventDefault();
  const answers = questions.map((_, index) => document.querySelector(`input[name="question-${index}"]:checked`));
  const missing = answers.findIndex((answer) => !answer);
  if (missing !== -1) {
    $('#quiz-result').textContent = 'Responde las tres preguntas antes de comprobar.';
    document.querySelector(`input[name="question-${missing}"]`).focus(); return;
  }
  let correct = 0;
  questions.forEach((question, index) => {
    const isCorrect = Number(answers[index].value) === question.correct;
    if (isCorrect) correct++;
    const feedback = $(`#feedback-${index}`); feedback.hidden = false;
    feedback.classList.toggle('incorrect', !isCorrect);
    const text = document.createElement('p'); text.style.margin = '0 0 6px'; text.textContent = `${isCorrect ? 'Correcto.' : 'Revisa esta idea.'} ${question.feedback}`;
    const review = document.createElement('button'); review.type = 'button'; review.className = 'text-link'; review.textContent = `Volver al audio · ${time(question.at)}`;
    review.addEventListener('click', () => { jumpTo(question.at, true); $('.player').scrollIntoView({ block: 'center' }); });
    feedback.replaceChildren(text, review);
  });
  $('#quiz-result').textContent = `${correct} de 3 correctas. ${correct === 3 ? '¡Ahora conecta estas ideas con tu territorio!' : 'Lee la retroalimentación y vuelve a intentarlo cuando quieras.'}`;
});
$('#reset-quiz').addEventListener('click', () => {
  $('#quiz').reset(); $('#quiz-result').textContent = ''; $('#quiz-progress').textContent = '0 de 3 respondidas';
  document.querySelectorAll('.quiz-feedback').forEach((feedback) => { feedback.hidden = true; });
  $('#quiz input').focus();
});
// Reflexión temporal: no se persiste ni se envía; solo se descarga a petición.
$('#download-notes').addEventListener('click', () => {
  const content = `Gobernanza ambiental · Mi reflexión\n\n${$('.written-reflection p').textContent}\n\n${$('#reflection').value || '(Sin notas todavía)'}\n`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'mi-reflexion-gobernanza-ambiental.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
