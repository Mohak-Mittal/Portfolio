const WORKER = 'https://empty-pond-54e9.mittalmohak0.workers.dev';

let audioCtx  = null;
let curSource = null;

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

    if (!res.ok) throw new Error('TTS worker ' + res.status);

    const arrayBuffer = await res.arrayBuffer();

    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const decoded = await audioCtx.decodeAudioData(arrayBuffer);

    curSource = audioCtx.createBufferSource();
    curSource.buffer = decoded;
    curSource.connect(audioCtx.destination);
    curSource.onended = () => { curSource = null; if (onDone) onDone(); };

    if (onStart) onStart();
    curSource.start();

  } catch (e) {
    console.warn('[ARIA TTS] ElevenLabs failed, using fallback:', e.message);
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