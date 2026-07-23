/* ================================================================
   ARIA — TTS (native browser voices only, no model download)
   Includes fixes for two well-known Chrome bugs:
   1) calling cancel() immediately before speak() can silently drop speech
   2) Chrome auto-stops utterances after ~15s unless kept alive
   ================================================================ */

let _voice = null;
let _keepAliveTimer = null;

function pickFemaleVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

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

function _startKeepAlive() {
  _stopKeepAlive();
  _keepAliveTimer = setInterval(() => {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      _stopKeepAlive();
    }
  }, 5000);
}
function _stopKeepAlive() {
  if (_keepAliveTimer) { clearInterval(_keepAliveTimer); _keepAliveTimer = null; }
}

export async function ttsSpeak(text, onStart, onDone) {
  const clean = text.replace(/<[^>]+>/g, '').trim();
  if (!clean) { if (onDone) onDone(); return; }
  if (!window.speechSynthesis) { if (onDone) onDone(); return; }

  await ensureVoicesLoaded();
  if (!_voice) _voice = pickFemaleVoice();

  const speakNow = () => {
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 1.0;
    utt.pitch = 1.1;
    if (_voice) utt.voice = _voice;

    if (onStart) onStart();
    utt.onstart = () => { _startKeepAlive(); };
    utt.onend = utt.onerror = () => { _stopKeepAlive(); if (onDone) onDone(); };
    window.speechSynthesis.speak(utt);
  };

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    setTimeout(speakNow, 120); // dodge Chrome's cancel->speak race bug
  } else {
    speakNow();
  }
}

export function ttsStop() {
  _stopKeepAlive();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}