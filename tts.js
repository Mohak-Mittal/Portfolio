import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js';

let tts     = null;
let loading = false;

async function preload() {
  if (tts || loading) return;
  loading = true;
  try {
    tts = await pipeline('text-to-speech', 'onnx-community/Kokoro-82M-v1.0', { dtype: 'fp32' });
    console.log('[ARIA TTS] Kokoro ready');
  } catch (e) {
    console.warn('[ARIA TTS] Kokoro failed:', e.message);
  } finally {
    loading = false;
  }
}

preload();

// Warm up the browser voice list early (some browsers load it async)
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
}

function _pickFemaleVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferredNames = ['Google UK English Female', 'Samantha', 'Zira', 'Victoria', 'Karen', 'Moira', 'Tessa', 'Susan', 'Fiona'];
  for (const name of preferredNames) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  return voices.find(v => /female/i.test(v.name) && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
}

export async function ttsSpeak(text, onStart, onDone) {
  ttsStop();
  const clean = text.replace(/<[^>]+>/g, '').trim();
  if (!clean) { if (onDone) onDone(); return; }

  let waited = 0;
  while (loading && waited < 30000) {
    await new Promise(r => setTimeout(r, 200));
    waited += 200;
  }

  if (!tts) {
    if (onStart) onStart();
    _fallback(clean, onDone);
    return;
  }

  try {
    if (onStart) onStart();
    const out = await tts(clean, { voice: 'af_bella', speed: 1.0 });
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') { try { await ctx.resume(); } catch (_) {} }
    const buf = ctx.createBuffer(1, out.audio.length, out.sampling_rate);
    buf.getChannelData(0).set(out.audio);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.onended = () => { if (onDone) onDone(); };
    src.start();
  } catch (e) {
    console.warn('[ARIA TTS] Speak error, fallback:', e.message);
    _fallback(clean, onDone);
  }
}

export function ttsStop() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function _fallback(text, onDone) {
  if (!window.speechSynthesis) { if (onDone) onDone(); return; }
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.0; utt.pitch = 1.1;
  const voice = _pickFemaleVoice();
  if (voice) utt.voice = voice;
  utt.onend = utt.onerror = () => { if (onDone) onDone(); };
  window.speechSynthesis.speak(utt);
}