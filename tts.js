import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js';

let tts       = null;
let audioCtx  = null;
let curSource = null;

// Silent background preload — starts the moment the page loads
(async () => {
  try {
    tts = await pipeline('text-to-speech', 'onnx-community/Kokoro-82M-v1.0', { dtype: 'fp32' });
  } catch (e) {
    console.warn('[ARIA TTS] Kokoro failed to load, will use fallback:', e.message);
  }
})();

export async function kokoroSpeak(rawText, onDone) {
  kokoroStop();

  const text = rawText.replace(/<[^>]+>/g, '').trim();
  if (!text) { if (onDone) onDone(); return; }

  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') await audioCtx.resume();

  if (!tts) { _fallback(text, onDone); return; }

  try {
    const out = await tts(text, { voice: 'af_sarah', speed: 1.0 });

    const buffer = audioCtx.createBuffer(1, out.audio.length, out.sampling_rate);
    buffer.getChannelData(0).set(out.audio);

    curSource = audioCtx.createBufferSource();
    curSource.buffer = buffer;
    curSource.connect(audioCtx.destination);
    curSource.onended = () => { curSource = null; if (onDone) onDone(); };
    curSource.start();
  } catch (e) {
    console.warn('[ARIA TTS] Speak error, fallback:', e.message);
    _fallback(text, onDone);
  }
}

export function kokoroStop() {
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