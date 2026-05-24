import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js';

let tts       = null;
let loading   = false;
let audioCtx  = null;
let curSource = null;

async function preload() {
  if (tts || loading) return;
  loading = true;
  try {
    tts = await pipeline('text-to-speech', 'onnx-community/Kokoro-82M-v1.0', { dtype: 'fp32' });
    console.log('[ARIA TTS] Kokoro ready');
  } catch (e) {
    console.warn('[ARIA TTS] Kokoro load failed:', e.message);
  } finally {
    loading = false;
  }
}

preload();

export async function ttsSpeak(text, onStart, onDone) {
  ttsStop();

  const clean = text.replace(/<[^>]+>/g, '').trim();
  if (!clean) { if (onDone) onDone(); return; }

  let waited = 0;
  while (loading && waited < 30000) {
    await new Promise(r => setTimeout(r, 200));
    waited += 200;
  }

  if (!tts) { _fallback(clean, onDone); return; }

  try {
    if (onStart) onStart();

    const out = await tts(clean, { voice: 'af_bella', speed: 1.0 });

    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const buffer = audioCtx.createBuffer(1, out.audio.length, out.sampling_rate);
    buffer.getChannelData(0).set(out.audio);

    curSource = audioCtx.createBufferSource();
    curSource.buffer = buffer;
    curSource.connect(audioCtx.destination);
    curSource.onended = () => { curSource = null; if (onDone) onDone(); };
    curSource.start();

  } catch (e) {
    console.warn('[ARIA TTS] Speak error, fallback:', e.message);
    _fallback(clean, onDone);
  }
}

export function ttsStop() {
  if (curSource) {
    try { curSource.stop(); } catch (_) {}
    curSource = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function _fallback(text, onDone) {
  if (!window.speechSynthesis) { if (onDone) onDone(); return; }
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate  = 1.0;
  utt.pitch = 1.05;
  utt.onend = utt.onerror = () => { if (onDone) onDone(); };
  window.speechSynthesis.speak(utt);
}