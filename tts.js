import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3/dist/transformers.min.js';

let tts       = null;
let audioCtx  = null;
let curSource = null;

// Silent background preload
(async () => {
  try {
    tts = await pipeline('text-to-speech', 'Xenova/mms-tts-eng', { dtype: 'fp32' });
    console.log('[ARIA TTS] TTS loaded successfully');
  } catch (e) {
    console.warn('[ARIA TTS] TTS failed to load, will use fallback:', e.message);
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
    const out = await tts(text);

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
  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice =
      voices.find(v => /zira|susan|hazel|samantha|karen|moira|fiona|aria|jenny/i.test(v.name)) ||
      voices.find(v => /female|woman/i.test(v.name)) ||
      voices.find(v => v.lang === 'en-GB') ||
      voices.find(v => v.lang && v.lang.startsWith('en')) ||
      null;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate  = 1.0;
    utt.pitch = 1.2;
    if (femaleVoice) utt.voice = femaleVoice;
    utt.onend = utt.onerror = () => { if (onDone) onDone(); };
    window.speechSynthesis.speak(utt);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', trySpeak, { once: true });
  } else {
    trySpeak();
  }
}