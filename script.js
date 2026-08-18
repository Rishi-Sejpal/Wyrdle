import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

const $ = (id) => document.getElementById(id);

const dropZone = $('drop-zone');
const fileInput = $('file-input');
const browseBtn = $('browse-btn');
const toast = $('toast');
const loading = $('loading');
const uploadView = $('upload-view');
const readerView = $('reader-view');
const startBtn = $('start-btn');
const pauseBtn = $('pause-btn');
const stopBtn = $('stop-btn');
const zenBtn = $('zen-btn');
const zenHint = $('zen-hint');
const speedSlider = $('speed-slider');
const wpmDisplay = $('wpm-display');
const pageDisplay = $('page-display');
const progressDisplay = $('progress-display');
const progressBar = $('progress-bar');
const startPageInput = $('start-page');
const wordSpan = $('word');
const spinnerChar = $('spinner-char');

let pagesText = [];
let isRunning = false;
let isPaused = false;
let startWpm = 150;
let words = [];
let wordIdx = 0;
let readingElapsed = 0;
let lastTickTime = 0;
let timeoutId = null;
let spinInterval = null;

const openPicker = () => fileInput.click();
browseBtn.addEventListener('click', openPicker);
dropZone.addEventListener('click', (e) => {
  if (e.target.closest('#browse-btn')) return;
  openPicker();
});
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', (e) => {
  if (e.relatedTarget && dropZone.contains(e.relatedTarget)) return;
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

let toastTimer;
function setMessage(text, error = false) {
  toast.textContent = '> ' + text;
  toast.className = 'toast ' + (error ? 'error' : 'ok');
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
}

const spinFrames = ['|', '/', '-', '\\'];
function showLoading() {
  loading.hidden = false;
  let i = 0;
  spinInterval = setInterval(() => {
    spinnerChar.textContent = spinFrames[i++ % spinFrames.length];
  }, 100);
}
function hideLoading() {
  clearInterval(spinInterval);
  loading.hidden = true;
}

async function handleFile(file) {
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    setMessage('file exceeds 10 MB limit', true);
    return;
  }
  if (file.type !== 'application/pdf') {
    setMessage('please choose a PDF file', true);
    return;
  }
  showLoading();
  try {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    pagesText = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      const text = tc.items.map(it => it.str).join(' ');
      pagesText.push(text.split(/\s+/).filter(Boolean));
    }
    startPageInput.max = pdf.numPages;
    startPageInput.value = Math.min(parseInt(startPageInput.value) || 1, pdf.numPages);
    hideLoading();
    uploadView.hidden = true;
    readerView.hidden = false;
    startBtn.disabled = false;
    zenBtn.disabled = false;
    wordSpan.textContent = 'PRESS [ START ] TO BEGIN';
    wordSpan.classList.add('placeholder');
    setMessage(`pdf ready · ${pdf.numPages} pages`);
  } catch (err) {
    console.error(err);
    hideLoading();
    setMessage('failed to read pdf', true);
  }
}

function scheduleNext() {
  const now = Date.now();
  readingElapsed = Math.min(readingElapsed + (now - lastTickTime), 30000);
  lastTickTime = now;
  const progress = readingElapsed / 30000;
  const wpm = startWpm + (300 - startWpm) * progress;
  wpmDisplay.textContent = Math.round(wpm);
  timeoutId = setTimeout(advance, 60000 / wpm);
}

function advance() {
  if (!isRunning || isPaused) return;
  if (wordIdx >= words.length) {
    endReading();
    return;
  }
  wordSpan.textContent = words[wordIdx];
  wordIdx++;
  const pct = Math.round((wordIdx / words.length) * 100);
  progressBar.style.width = pct + '%';
  progressDisplay.textContent = pct + '%';
  scheduleNext();
}

function startReading() {
  if (isRunning) return;
  const startPage = Math.max(1, parseInt(startPageInput.value) || 1) - 1;
  words = pagesText[startPage] || [];
  if (!words.length) {
    setMessage('no text on this page', true);
    return;
  }
  startWpm = parseInt(speedSlider.value) || 150;
  pageDisplay.textContent = startPage + 1;
  wpmDisplay.textContent = startWpm;
  progressBar.style.width = '0%';
  progressDisplay.textContent = '0%';
  wordIdx = 0;
  readingElapsed = 0;
  lastTickTime = Date.now();
  isRunning = true;
  isPaused = false;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  stopBtn.disabled = false;
  speedSlider.disabled = true;
  wordSpan.classList.remove('placeholder');
  advance();
}

function endReading(message = 'finished this page') {
  isRunning = false;
  clearTimeout(timeoutId);
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  stopBtn.disabled = true;
  speedSlider.disabled = false;
  pauseBtn.textContent = '[ PAUSE ]';
  progressBar.style.width = '0%';
  progressDisplay.textContent = '0%';
  wordSpan.textContent = 'PRESS [ START ] TO BEGIN';
  wordSpan.classList.add('placeholder');
  setMessage(message);
}

function togglePause() {
  if (!isRunning) return;
  if (isPaused) {
    isPaused = false;
    pauseBtn.textContent = '[ PAUSE ]';
    lastTickTime = Date.now();
    scheduleNext();
  } else {
    isPaused = true;
    clearTimeout(timeoutId);
    pauseBtn.textContent = '[ RESUME ]';
  }
}

function toggleZen(on) {
  document.body.classList.toggle('zen', on);
  zenHint.hidden = !on;
  if (on) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  }
}

startBtn.addEventListener('click', startReading);
pauseBtn.addEventListener('click', togglePause);
stopBtn.addEventListener('click', () => endReading('reading stopped'));
zenBtn.addEventListener('click', () => toggleZen(true));
speedSlider.addEventListener('input', (e) => {
  wpmDisplay.textContent = e.target.value;
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    toggleZen(false);
    return;
  }
  if (e.code !== 'Space') return;
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  e.preventDefault();
  if (pagesText.length === 0) return;
  if (isRunning) {
    togglePause();
  } else {
    startReading();
  }
});