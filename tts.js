/* ================================================================
   ARIA — TTS (native browser voices only, no model download)
   ================================================================ */

let _voice = null;

function pickFemaleVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Best-known female voices across Chrome / Edge / Safari / Firefox / Android / iOS
  const preferredNames = [
    'Google UK English Female', 'Google US English Female',
    'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira', 'Microsoft Michelle',
    'Samantha', 'Victoria', 'Karen', 'Moira', 'Tessa', 'Susan', 'Fiona', 'Ava', 'Allison', 'Serena'
  ];
  for (const name of preferredNames) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }

  return voices.find(v => /female/i.test(v.name) && v.lang.startsWith('en'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
}

function ensureVoicesLoaded() {
  return new Promise(resolve => {
    if (!window.speechSynthesis) return resolve([]);
    let voices = window.speechSynthesis.getVoices();
    if (voices.length) return resolve(voices);
    let tries = 0;
    const iv = setInterval(() => {
      voices = window.speechSynthesis.getVoices();
      tries++;
      if (voices.length || tries > 20) {
        clearInterval(iv);
        resolve(voices);
      }
    }, 100);
  });
}

ensureVoicesLoaded().then(() => { _voice = pickFemaleVoice(); });
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { _voice = pickFemaleVoice(); };
}

export async function ttsSpeak(text, onStart, onDone) {
  ttsStop();
  const clean = text.replace(/<[^>]+>/g, '').trim();
  if (!clean) { if (onDone) onDone(); return; }

  if (!window.speechSynthesis) { if (onDone) onDone(); return; }

  await ensureVoicesLoaded();
  if (!_voice) _voice = pickFemaleVoice();

  const utt = new SpeechSynthesisUtterance(clean);
  utt.rate = 1.0;
  utt.pitch = 1.1;
  if (_voice) utt.voice = _voice;

  if (onStart) onStart();
  utt.onend = utt.onerror = () => { if (onDone) onDone(); };
  window.speechSynthesis.speak(utt);
}

export function ttsStop() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}