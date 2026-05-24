/* ================================================================
   ARIA — Mohak Mittal's AI Portfolio Assistant
   Professional Hollywood-style Interface
   Hologram ball + Kokoro TTS + Sliding window memory
   ================================================================ */
import { kokoroSpeak, kokoroStop } from './tts.js';

const WORKER = 'https://empty-pond-54e9.mittalmohak0.workers.dev';
let portfolioData = null;
fetch('./mohak-data.json')
  .then(r => r.json())
  .then(d => { portfolioData = d; })
  .catch(() => {});

/* ================================================================
   HOLOGRAM BALL — Canvas Renderer
   States: idle | listening | thinking | speaking
   ================================================================ */
class HologramBall {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.state   = 'idle';
    this.ry      = 0;
    this.rx      = 0.3;
    this.amp     = 0;
    this.targetAmp = 0;
    this.frame   = 0;
    this.listenPulse = 0;
    this.thinkAngle  = 0;
    this.rings   = [
      { angle: 0,           tilt: 0.28,  speed: 0.007,  color: 'rgba(14,165,233,VAL)'  },
      { angle: Math.PI/2.4, tilt: 1.05,  speed: -0.005, color: 'rgba(14,165,233,VAL)'  },
      { angle: Math.PI/1.2, tilt: 1.62,  speed: 0.0035, color: 'rgba(99,102,241,VAL)'  },
    ];
    this.sphereDots = this._genDots(90);
    this._raf();
  }

  _genDots(n) {
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y     = 1 - (i / (n - 1)) * 2;
      const r     = Math.sqrt(1 - y * y);
      const theta = phi * i;
      pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
    }
    return pts;
  }

  setState(s) {
    this.state = s;
    if (s === 'speaking') this.targetAmp = 1;
    else this.targetAmp = 0;
  }

  _rotate(x, y, z) {
    const x1 =  x * Math.cos(this.ry) + z * Math.sin(this.ry);
    const z1 = -x * Math.sin(this.ry) + z * Math.cos(this.ry);
    const y2 =  y * Math.cos(this.rx) - z1 * Math.sin(this.rx);
    const z2 =  y * Math.sin(this.rx) + z1 * Math.cos(this.rx);
    return { x: x1, y: y2, z: z2 };
  }

  _draw() {
    const cvs = this.canvas;
    const ctx = this.ctx;
    const W   = cvs.width;
    const H   = cvs.height;
    const cx  = W / 2;
    const cy  = H / 2;
    const R   = Math.min(W, H) * 0.33;

    ctx.clearRect(0, 0, W, H);

    this.amp += (this.targetAmp - this.amp) * 0.08;

    let rySpeed = 0.004;
    if (this.state === 'thinking') rySpeed = 0.018;
    if (this.state === 'speaking') rySpeed = 0.008 + this.amp * 0.012;
    if (this.state === 'listening') rySpeed = 0.006;
    this.ry += rySpeed;

    const glowR = R * (1.5 + this.amp * 0.25);
    const outerGlow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, glowR);
    if (this.state === 'listening') {
      outerGlow.addColorStop(0,   'rgba(52,211,153,0.07)');
      outerGlow.addColorStop(0.5, 'rgba(52,211,153,0.02)');
      outerGlow.addColorStop(1,   'transparent');
    } else if (this.state === 'thinking') {
      outerGlow.addColorStop(0,   'rgba(251,191,36,0.06)');
      outerGlow.addColorStop(1,   'transparent');
    } else if (this.state === 'speaking') {
      const speakAlpha = 0.05 + this.amp * 0.1;
      outerGlow.addColorStop(0,   `rgba(167,139,250,${speakAlpha})`);
      outerGlow.addColorStop(1,   'transparent');
    } else {
      outerGlow.addColorStop(0,   'rgba(14,165,233,0.05)');
      outerGlow.addColorStop(1,   'transparent');
    }
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, W, H);

    for (const pt of this.sphereDots) {
      const r  = this._rotate(pt.x, pt.y, pt.z);
      const px = cx + r.x * R;
      const py = cy - r.y * R;
      const depth = (r.z + 1) / 2;

      if (r.z < -0.1) continue;

      const dotAlpha  = depth * 0.55;
      const dotRadius = 1.1 + depth * 0.9;

      let dotColor = `rgba(14,165,233,${dotAlpha})`;
      if (this.state === 'listening') dotColor = `rgba(52,211,153,${dotAlpha})`;
      if (this.state === 'thinking')  dotColor = `rgba(251,191,36,${dotAlpha * 0.9})`;
      if (this.state === 'speaking')  dotColor = `rgba(167,139,250,${dotAlpha + this.amp * 0.2})`;

      ctx.beginPath();
      ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
    }

    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i];
      ring.angle += ring.speed * (this.state === 'thinking' ? 2.5 : 1);

      const rX = R * 1.05;
      const rY = R * 1.05 * Math.abs(Math.sin(ring.tilt));

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.angle);

      const ringPulse = this.state === 'speaking'
        ? 1 + Math.sin(this.frame * 0.18 + i * 2.1) * 0.12 * this.amp
        : 1;

      let baseAlpha = 0.35;
      if (this.state === 'listening') baseAlpha = 0.5;
      if (this.state === 'thinking')  baseAlpha = 0.28;
      if (this.state === 'speaking')  baseAlpha = 0.3 + this.amp * 0.25;

      const c = ring.color.replace('VAL', String(baseAlpha));

      ctx.scale(ringPulse, ringPulse);
      ctx.beginPath();
      ctx.ellipse(0, 0, rX, rY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = c;
      ctx.lineWidth   = 1;
      ctx.stroke();

      const dotTheta = ring.angle * 3.1;
      const dX = Math.cos(dotTheta) * rX;
      const dY = Math.sin(dotTheta) * rY;

      ctx.beginPath();
      ctx.arc(dX, dY, 2.5, 0, Math.PI * 2);
      let dotC = '#0ea5e9';
      if (this.state === 'listening') dotC = '#34d399';
      if (this.state === 'thinking')  dotC = '#fbbf24';
      if (this.state === 'speaking')  dotC = '#a78bfa';
      ctx.fillStyle = dotC;
      ctx.fill();
      ctx.restore();
    }

    let coreAlpha = 0.55 + 0.05 * Math.sin(this.frame * 0.04);
    if (this.state === 'speaking')  coreAlpha = 0.6 + this.amp * 0.35;
    if (this.state === 'listening') coreAlpha = 0.55 + 0.1 * Math.sin(this.frame * 0.15);
    if (this.state === 'thinking')  coreAlpha = 0.45 + 0.15 * ((Math.sin(this.frame * 0.12) + 1) / 2);

    const coreR = R * (0.22 + (this.state === 'speaking' ? this.amp * 0.06 : 0));
    const core  = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.5);

    if (this.state === 'listening') {
      core.addColorStop(0,   `rgba(52,211,153,${coreAlpha})`);
      core.addColorStop(0.4, `rgba(52,211,153,${coreAlpha * 0.3})`);
      core.addColorStop(1,   'transparent');
    } else if (this.state === 'thinking') {
      core.addColorStop(0,   `rgba(251,191,36,${coreAlpha})`);
      core.addColorStop(0.4, `rgba(251,191,36,${coreAlpha * 0.25})`);
      core.addColorStop(1,   'transparent');
    } else if (this.state === 'speaking') {
      core.addColorStop(0,   `rgba(167,139,250,${coreAlpha})`);
      core.addColorStop(0.4, `rgba(167,139,250,${coreAlpha * 0.3})`);
      core.addColorStop(1,   'transparent');
    } else {
      core.addColorStop(0,   `rgba(14,165,233,${coreAlpha})`);
      core.addColorStop(0.4, `rgba(14,165,233,${coreAlpha * 0.3})`);
      core.addColorStop(1,   'transparent');
    }

    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();

    if (this.state === 'listening') {
      this.listenPulse = (this.listenPulse + 0.025) % 1;
      for (let p = 0; p < 3; p++) {
        const t      = (this.listenPulse + p / 3) % 1;
        const pR     = R * 1.1 + t * R * 0.8;
        const pAlpha = (1 - t) * 0.25;
        ctx.beginPath();
        ctx.arc(cx, cy, pR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52,211,153,${pAlpha})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
    }

    if (this.state === 'thinking') {
      this.thinkAngle += 0.05;
      for (let d = 0; d < 5; d++) {
        const a  = this.thinkAngle + (d / 5) * Math.PI * 2;
        const dR = R * 1.25;
        const dX = cx + Math.cos(a) * dR;
        const dY = cy + Math.sin(a) * dR;
        ctx.beginPath();
        ctx.arc(dX, dY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${0.3 + (d / 5) * 0.4})`;
        ctx.fill();
      }
    }

    this.frame++;
  }

  _raf() {
    this._draw();
    requestAnimationFrame(() => this._raf());
  }
}

/* ================================================================
   BUILD HTML
   ================================================================ */

const trigger = document.createElement('div');
trigger.id = 'aria-trigger';
trigger.title = 'Chat with ARIA';
trigger.innerHTML = `
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z"/>
    <path d="M19 2L19.75 4.25L22 5L19.75 5.75L19 8L18.25 5.75L16 5L18.25 4.25Z"/>
    <path d="M5 17L5.5 18.5L7 19L5.5 19.5L5 21L4.5 19.5L3 19L4.5 18.5Z"/>
  </svg>`;

const overlay = document.createElement('div');
overlay.id = 'aria-overlay';
overlay.setAttribute('role', 'dialog');
overlay.setAttribute('aria-modal', 'true');
overlay.innerHTML = `
  <div id="aria-container">
    <div id="aria-header">
      <div class="aria-status-dot" id="aria-dot"></div>
      <div class="aria-header-info">
        <div class="aria-header-name">ARIA</div>
        <div class="aria-header-sub">Mohak Mittal · AI Portfolio Assistant</div>
      </div>
      <div id="aria-status-label">Online</div>
      <button id="aria-close" title="Close" aria-label="Close ARIA">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div id="aria-body">
      <div id="aria-left">
        <canvas id="aria-canvas" width="200" height="200"></canvas>
        <div class="aria-ball-info">
          <div class="aria-ball-name">ARIA</div>
          <div class="aria-ball-tagline">AI · v2.0 · Active</div>
        </div>
      </div>

      <div id="aria-right">
        <div id="aria-messages" role="log" aria-live="polite"></div>

        <div id="aria-suggestions">
          <button class="aria-chip">What can Mohak build?</button>
          <button class="aria-chip">Tell me about his projects</button>
          <button class="aria-chip">What are his skills?</button>
          <button class="aria-chip">How can I contact him?</button>
        </div>

        <div id="aria-input-area">
          <button id="aria-mic-btn" title="Voice input" aria-label="Toggle microphone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <rect x="9" y="2" width="6" height="11" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
          <input
            id="aria-text-input"
            type="text"
            placeholder="Ask anything about Mohak..."
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            maxlength="500"
          />
          <button id="aria-send-btn" title="Send" aria-label="Send message">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>`;

document.body.appendChild(trigger);
document.body.appendChild(overlay);

/* ── ELEMENT REFS ── */
const dot         = document.getElementById('aria-dot');
const statusLabel = document.getElementById('aria-status-label');
const closeBtn    = document.getElementById('aria-close');
const messages    = document.getElementById('aria-messages');
const suggestions = document.getElementById('aria-suggestions');
const micBtn      = document.getElementById('aria-mic-btn');
const textInput   = document.getElementById('aria-text-input');
const sendBtn     = document.getElementById('aria-send-btn');
const canvas      = document.getElementById('aria-canvas');

/* ── INIT BALL ── */
const dpr      = window.devicePixelRatio || 1;
const ballSize = window.innerWidth <= 640 ? 130 : 200;
canvas.width   = ballSize * dpr;
canvas.height  = ballSize * dpr;
canvas.style.width  = ballSize + 'px';
canvas.style.height = ballSize + 'px';
canvas.getContext('2d').scale(dpr, dpr);

const ball = new HologramBall(canvas);

/* ── SESSION STATE ── */
let isOpen      = false;
let greeted     = false;
let busy        = false;
let chatHistory = [];

/* ── STATUS HELPER ── */
function setStatus(state, text) {
  dot.className = 'aria-status-dot';
  if (state === 'listening') dot.classList.add('aria-dot-listening');
  if (state === 'thinking')  dot.classList.add('aria-dot-thinking');
  if (state === 'speaking')  dot.classList.add('aria-dot-speaking');

  statusLabel.className = '';
  statusLabel.id = 'aria-status-label';
  if (state === 'listening') statusLabel.classList.add('aria-status-listening');
  if (state === 'thinking')  statusLabel.classList.add('aria-status-thinking');
  if (state === 'speaking')  statusLabel.classList.add('aria-status-speaking');

  statusLabel.textContent = text;
  ball.setState(state === 'idle' ? 'idle' : state);
}

/* ── OPEN / CLOSE ── */
function openAria() {
  overlay.classList.add('aria-open');
  trigger.style.display = 'none';
  isOpen = true;

  if (!greeted) {
    greeted = true;
    setTimeout(() => {
      const h = new Date().getHours();
      const greet =
        h < 5  ? 'Good night' :
        h < 12 ? 'Good morning' :
        h < 17 ? 'Good afternoon' :
        h < 21 ? 'Good evening' : 'Good night';
      addBot(`${greet}. I'm ARIA, Mohak Mittal's AI assistant. Ask me anything about his work, skills, or how to get in touch.`);
    }, 400);
  }

  setTimeout(() => textInput.focus(), 500);
}

function closeAria() {
  overlay.classList.remove('aria-open');
  trigger.style.display = 'flex';
  isOpen = false;
  kokoroStop();
}

trigger.addEventListener('click', openAria);
closeBtn.addEventListener('click', closeAria);
overlay.addEventListener('click', e => {
  if (e.target === overlay) closeAria();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isOpen) closeAria();
});

/* ── TIME HELPER ── */
function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ── ADD MESSAGES ── */
function addBot(html) {
  removeTyping();
  const d = document.createElement('div');
  d.className = 'aria-msg aria-bot';
  d.innerHTML = `
    <div class="aria-bubble">${html}</div>
    <div class="aria-msg-meta">ARIA · ${nowTime()}</div>`;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

function addUser(text) {
  setTimeout(() => { suggestions.style.display = 'none'; }, 300);
  const d = document.createElement('div');
  d.className = 'aria-msg aria-user';
  const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  d.innerHTML = `
    <div class="aria-bubble">${safe}</div>
    <div class="aria-msg-meta">You · ${nowTime()}</div>`;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

let typingEl = null;

function showTyping() {
  removeTyping();
  typingEl = document.createElement('div');
  typingEl.className = 'aria-typing';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(typingEl);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  if (typingEl) { typingEl.remove(); typingEl = null; }
}

/* ── HISTORY MANAGEMENT ── */
function pushHistory(role, content) {
  chatHistory.push({ role, content });
  if (chatHistory.length > 4) chatHistory = chatHistory.slice(-4);
}

/* ── LOCK / UNLOCK ── */
function lock() {
  busy = true;
  textInput.disabled = true;
  sendBtn.disabled   = true;
  micBtn.disabled    = true;
}

function unlock() {
  busy = false;
  textInput.disabled = false;
  sendBtn.disabled   = false;
  micBtn.disabled    = false;
  textInput.focus();
}

/* ── SEND MESSAGE ── */
async function send(text) {
  text = (text || '').trim();
  if (!text || busy) return;

  lock();
  addUser(text);
  textInput.value = '';
  showTyping();
  setStatus('thinking', 'Thinking...');

  pushHistory('user', text);

  try {
    const res = await fetch(WORKER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory.slice(0, -1),
        context: portfolioData
      })
    });

    removeTyping();

    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data  = await res.json();
    const reply = data.reply || "I seem to be having a moment — please try again.";

    pushHistory('assistant', reply);

    addBot(reply);
    setStatus('speaking', 'Speaking...');
    kokoroSpeak(reply, () => { setStatus('idle', 'Online'); unlock(); });

  } catch (e) {
    removeTyping();
    setStatus('idle', 'Online');
    addBot("Unable to reach the server right now. Make sure you're on the live site and try again.");
    console.error('ARIA fetch error:', e.message);
    unlock();
  }
}

/* ── EVENT LISTENERS ── */
sendBtn.addEventListener('click', () => {
  send(textInput.value).then(unlock);
});

textInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send(textInput.value).then(unlock);
  }
});

suggestions.querySelectorAll('.aria-chip').forEach(btn => {
  btn.addEventListener('click', function () {
    if (busy) return;
    const q = this.textContent.trim();
    send(q).then(unlock);
  });
});

/* ================================================================
   SPEECH RECOGNITION
   ================================================================ */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SR) {
  micBtn.disabled = true;
  micBtn.title    = 'Voice input requires Chrome or Edge';
} else {
  const rec = new SR();
  rec.lang            = 'en-US';
  rec.interimResults  = false;
  rec.maxAlternatives = 1;
  rec.continuous      = false;

  let listening   = false;
  let permAsked   = false;
  let resultFired = false;

  micBtn.addEventListener('click', () => {
    if (busy) return;
    if (listening) { rec.stop(); return; }

    if (!permAsked && navigator.mediaDevices?.getUserMedia) {
      permAsked = true;
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => { stream.getTracks().forEach(t => t.stop()); rec.start(); })
        .catch(() => rec.start());
    } else {
      rec.start();
    }
  });

  rec.onstart = () => {
    listening   = true;
    resultFired = false;
    micBtn.classList.add('aria-mic-on');
    setStatus('listening', 'Listening...');
  };

  rec.onend = () => {
    listening = false;
    micBtn.classList.remove('aria-mic-on');
    if (!busy) setStatus('idle', 'Online');
  };

  rec.onerror = e => {
    listening = false;
    micBtn.classList.remove('aria-mic-on');
    if (!busy) setStatus('idle', 'Online');
    if (e.error === 'not-allowed') {
      addBot('Microphone access was denied. Please allow microphone access in your browser settings.');
    }
  };

  rec.onresult = e => {
    if (resultFired) return;
    resultFired = true;
    const transcript = e.results[0][0].transcript.trim();
    if (transcript) {
      textInput.value = transcript;
      send(transcript).then(unlock);
    }
  };
}