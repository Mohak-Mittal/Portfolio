const WORKER = 'https://empty-pond-54e9.mittalmohak0.workers.dev';

let audioCtx  = null;
let curSource = null;
let curAudio  = null;

export async function ttsSpeak(text, onStart, onDone) {
  ttsStop();

  const clean = text.replace(/<[^>]+>/g, '').trim();
  if (!clean) { if (onDone) onDone(); return; }

  try {
    const res = await fetch(WORKER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tts: true, text: clean })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[ARIA TTS] Failed:', err);
      throw new Error('TTS ' + res.status);
    }

    const arrayBuffer = await res.arrayBuffer();

    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const decoded = await audioCtx.decodeAudioData(arrayBuffer);

    if (onStart) onStart();

    curSource = audioCtx.createBufferSource();
    curSource.buffer = decoded;
    curSource.connect(audioCtx.destination);
    curSource.onended = () => { curSource = null; if (onDone) onDone(); };
    curSource.start();

  } catch (e) {
    console.warn('[ARIA TTS] ElevenLabs failed, fallback:', e.message);
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