import { KokoroTTS } from 'https://cdn.jsdelivr.net/npm/kokoro-js@1/dist/kokoro.mjs';

let tts       = null;
let audioCtx  = null;
let curSource = null;

// Silent background preload
(async () => {
  try {
    tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-ONNX', { dtype: 'q8' });
    console.log('[ARIA TTS] Kokoro loaded successfully');
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
    const audio = await tts.generate(text, { voice: 'af_bella' });

    const buffer = audioCtx.createBuffer(1, audio.audio.length, audio.sampling_rate);
    buffer.getChannelData(0).set(audio.audio);

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
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice =
    voices.find(v => /zira|susan|hazel|female|woman|girl|samantha|karen|moira|fiona|victoria|aria|jenny/i.test(v.name)) ||
    voices.find(v => v.lang === 'en-GB') ||
    voices.find(v => v.lang && v.lang.startsWith('en')) ||
    null;
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate  = 1.0;
  utt.pitch = 1.1;
  if (femaleVoice) utt.voice = femaleVoice;
  utt.onend = utt.onerror = () => { if (onDone) onDone(); };
  window.speechSynthesis.speak(utt);
}