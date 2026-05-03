/* ================================================================
   ARIA — Mohak Mittal's AI Portfolio Assistant
   Click icon → icon hides → chat popup opens
   All AI handled by Cloudflare Worker
   ================================================================ */

(function () {
  'use strict';

  const WORKER = 'https://white-paper-62ef.mittalmohak0.workers.dev';

  /* ── STYLES ── */
  const s = document.createElement('style');
  s.textContent = `
    /* Floating Icon */
    #aria-icon {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 99999;
      width: 64px;
      height: 64px;
      background: rgba(4, 8, 20, 0.95);
      border: 2px solid #00f0ff;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      cursor: pointer;
      box-shadow: 0 0 24px rgba(0,240,255,0.4), 0 8px 32px rgba(0,0,0,0.8);
      animation: iconFloat 3s ease-in-out infinite;
      transition: transform 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    #aria-icon:hover {
      transform: scale(1.08);
      box-shadow: 0 0 40px rgba(0,240,255,0.6), 0 8px 32px rgba(0,0,0,0.9);
    }
    #aria-icon span {
      font-family: 'Orbitron', monospace, sans-serif;
      font-size: 8px;
      font-weight: 700;
      color: #00f0ff;
      letter-spacing: 2px;
    }
    @keyframes iconFloat {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-8px); }
    }

    /* Chat Popup */
    #aria-popup {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      z-index: 99998;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
    }
    #aria-popup.visible {
      display: flex;
      animation: popupIn 0.3s ease both;
    }
    @keyframes popupIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    #aria-box {
      width: min(560px, 96vw);
      height: min(680px, 92vh);
      background: rgba(4, 7, 18, 0.98);
      border: 1.5px solid rgba(0, 240, 255, 0.4);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 0 80px rgba(0,240,255,0.2), 0 40px 100px rgba(0,0,0,0.95);
      animation: boxIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    @keyframes boxIn {
      from { transform: scale(0.88) translateY(30px); opacity: 0; }
      to   { transform: scale(1) translateY(0); opacity: 1; }
    }

    /* Header */
    #aria-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0,240,255,0.12);
      background: rgba(0,240,255,0.03);
      flex-shrink: 0;
    }
    #aria-avatar {
      width: 42px; height: 42px;
      background: rgba(0,240,255,0.08);
      border: 1.5px solid rgba(0,240,255,0.3);
      border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #aria-title {
      flex: 1;
    }
    #aria-name {
      font-family: 'Orbitron', monospace, sans-serif;
      font-size: 12px; font-weight: 700;
      color: #00f0ff; letter-spacing: 1px;
    }
    #aria-status {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; color: rgba(0,240,255,0.5);
      margin-top: 2px; font-family: sans-serif;
    }
    #aria-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #00ff88; box-shadow: 0 0 6px #00ff88;
      animation: dotPulse 2s ease-in-out infinite;
    }
    @keyframes dotPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
    #aria-close {
      width: 32px; height: 32px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 9px; color: rgba(200,215,230,0.6);
      font-size: 15px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
    }
    #aria-close:hover { background: rgba(255,60,60,0.15); color: #ff6060; }

    /* Messages */
    #aria-messages {
      flex: 1;
      overflow-y: auto;
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: rgba(0,240,255,0.15) transparent;
    }
    #aria-messages::-webkit-scrollbar { width: 3px; }
    #aria-messages::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); border-radius: 3px; }

    .aria-msg {
      display: flex; flex-direction: column;
      max-width: 84%;
      animation: msgIn 0.25s ease both;
    }
    @keyframes msgIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
    .aria-msg.bot  { align-self: flex-start; }
    .aria-msg.user { align-self: flex-end; }

    .aria-bubble {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
      font-family: 'Rajdhani', sans-serif;
    }
    .aria-msg.bot  .aria-bubble {
      background: rgba(0,240,255,0.07);
      border: 1px solid rgba(0,240,255,0.2);
      color: #c8dde8;
      border-bottom-left-radius: 4px;
    }
    .aria-msg.user .aria-bubble {
      background: rgba(255,112,67,0.12);
      border: 1px solid rgba(255,112,67,0.25);
      color: #ffd0bb;
      border-bottom-right-radius: 4px;
    }
    .aria-time {
      font-size: 10px;
      color: rgba(150,170,190,0.35);
      margin-top: 3px;
      font-family: monospace;
    }
    .aria-msg.user .aria-time { text-align: right; }

    /* Typing dots */
    .aria-typing {
      display: flex; align-items: center; gap: 5px;
      padding: 12px 16px;
      background: rgba(0,240,255,0.07);
      border: 1px solid rgba(0,240,255,0.2);
      border-radius: 16px; border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .aria-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #00f0ff; display: inline-block;
      animation: td 1.2s ease-in-out infinite;
    }
    .aria-typing span:nth-child(2) { animation-delay: 0.2s; }
    .aria-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes td { 0%,60%,100%{transform:translateY(0);opacity:0.3;} 30%{transform:translateY(-7px);opacity:1;} }

    /* Suggestions */
    #aria-suggestions {
      padding: 0 20px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      flex-shrink: 0;
    }
    .aria-chip {
      padding: 6px 12px;
      background: rgba(0,240,255,0.05);
      border: 1px solid rgba(0,240,255,0.2);
      border-radius: 20px;
      font-size: 12px;
      color: rgba(0,240,255,0.7);
      cursor: pointer;
      font-family: 'Rajdhani', sans-serif;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }
    .aria-chip:hover, .aria-chip:active {
      background: rgba(0,240,255,0.14);
      color: #00f0ff;
      border-color: rgba(0,240,255,0.45);
    }

    /* Input */
    #aria-input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid rgba(0,240,255,0.1);
      background: rgba(0,240,255,0.02);
      flex-shrink: 0;
    }
    #aria-mic {
      width: 44px; height: 44px; min-width: 44px;
      border-radius: 50%;
      border: 2px solid rgba(0,240,255,0.45);
      background: rgba(0,240,255,0.07);
      color: #00f0ff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    #aria-mic:hover { background: rgba(0,240,255,0.15); box-shadow: 0 0 16px rgba(0,240,255,0.35); }
    #aria-mic.on {
      background: rgba(255,68,68,0.15) !important;
      border-color: #ff4444 !important;
      color: #ff4444 !important;
      animation: micOn 0.9s ease-in-out infinite;
    }
    #aria-mic:disabled { opacity: 0.35; cursor: not-allowed; }
    @keyframes micOn { 0%,100%{transform:scale(1);} 50%{transform:scale(1.12);} }

    #aria-text {
      flex: 1;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(0,240,255,0.2);
      border-radius: 12px;
      padding: 11px 14px;
      color: #c8dde8;
      font-size: 14px;
      font-family: 'Rajdhani', sans-serif;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      -webkit-appearance: none;
    }
    #aria-text::placeholder { color: rgba(0,240,255,0.28); }
    #aria-text:focus { border-color: rgba(0,240,255,0.5); box-shadow: 0 0 10px rgba(0,240,255,0.1); }
    #aria-text:disabled { opacity: 0.4; }

    #aria-send {
      width: 44px; height: 44px; min-width: 44px;
      border-radius: 50%;
      border: 2px solid rgba(0,240,255,0.45);
      background: rgba(0,240,255,0.1);
      color: #00f0ff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s; flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    #aria-send:hover { background: rgba(0,240,255,0.22); box-shadow: 0 0 16px rgba(0,240,255,0.35); }
    #aria-send:disabled { opacity: 0.35; cursor: not-allowed; }

    @media (max-width: 480px) {
      #aria-icon { bottom: 18px; right: 18px; width: 58px; height: 58px; }
      #aria-box { border-radius: 16px; }
      .aria-msg { max-width: 90%; }
      .aria-bubble { font-size: 13px; }
    }
  `;
  document.head.appendChild(s);

  /* ── SVG ── */
  const botSVG = (w, h) => `
    <svg width="${w}" height="${h}" viewBox="0 0 64 64" fill="none">
      <line x1="32" y1="4" x2="32" y2="13" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="32" cy="3" r="3" fill="#00f0ff"/>
      <rect x="10" y="13" width="44" height="30" rx="9" fill="#060d1f" stroke="#00f0ff" stroke-width="1.8"/>
      <ellipse cx="22" cy="27" rx="5" ry="5" fill="rgba(0,240,255,0.1)"/>
      <ellipse cx="22" cy="27" rx="3.2" ry="3.2" fill="#00f0ff"/>
      <ellipse cx="23" cy="25.8" rx="1.1" ry="1.1" fill="white" opacity=".7"/>
      <ellipse cx="42" cy="27" rx="5" ry="5" fill="rgba(0,240,255,0.1)"/>
      <ellipse cx="42" cy="27" rx="3.2" ry="3.2" fill="#00f0ff"/>
      <ellipse cx="43" cy="25.8" rx="1.1" ry="1.1" fill="white" opacity=".7"/>
      <rect x="22" y="35" width="20" height="4" rx="2" fill="#00f0ff" opacity=".5"/>
      <rect x="5"  y="22" width="5"  height="12" rx="2.5" fill="#00f0ff" opacity=".4"/>
      <rect x="54" y="22" width="5"  height="12" rx="2.5" fill="#00f0ff" opacity=".4"/>
    </svg>`;

  /* ── BUILD DOM ── */

  // Floating icon
  const icon = document.createElement('div');
  icon.id = 'aria-icon';
  icon.innerHTML = botSVG(32, 32) + '<span>ARIA</span>';
  document.body.appendChild(icon);

  // Popup
  const popup = document.createElement('div');
  popup.id = 'aria-popup';
  popup.innerHTML = `
    <div id="aria-box">
      <div id="aria-header">
        <div id="aria-avatar">${botSVG(26, 26)}</div>
        <div id="aria-title">
          <div id="aria-name">ARIA — AI Portfolio Assistant</div>
          <div id="aria-status"><div id="aria-dot"></div><span id="aria-status-txt">Online &amp; ready</span></div>
        </div>
        <button id="aria-close">✕</button>
      </div>
      <div id="aria-messages"></div>
      <div id="aria-suggestions">
        <button class="aria-chip">🎮 His games</button>
        <button class="aria-chip">🛠️ His skills</button>
        <button class="aria-chip">🎯 His goals</button>
        <button class="aria-chip">📩 Contact him</button>
        <button class="aria-chip">🖥️ UE5 work</button>
        <button class="aria-chip">🤖 ARIA project</button>
        <button class="aria-chip">🎓 Education</button>
        <button class="aria-chip">🌟 Why hire him?</button>
      </div>
      <div id="aria-input-row">
        <button id="aria-mic">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M5 10a7 7 0 0 0 14 0"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <input id="aria-text" type="text" placeholder="Ask me anything about Mohak..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>
        <button id="aria-send">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(popup);

  /* ── REFS ── */
  const msgs      = document.getElementById('aria-messages');
  const chips     = document.getElementById('aria-suggestions');
  const mic       = document.getElementById('aria-mic');
  const textEl    = document.getElementById('aria-text');
  const sendEl    = document.getElementById('aria-send');
  const closeEl   = document.getElementById('aria-close');
  const statusTxt = document.getElementById('aria-status-txt');

  /* ── OPEN / CLOSE ── */
  let opened = false;

  function open() {
    icon.style.display = 'none';
    popup.classList.add('visible');
    if (!opened) {
      opened = true;
      setTimeout(() => addBot(greeting()), 350);
    }
    setTimeout(() => textEl.focus(), 400);
  }

  function close() {
    popup.classList.remove('visible');
    icon.style.display = 'flex';
  }

  icon.addEventListener('click', open);
  closeEl.addEventListener('click', close);
  popup.addEventListener('click', e => { if (e.target === popup) close(); });

  /* ── GREETING ── */
  function greeting() {
    const h = new Date().getHours();
    const t = h < 12 ? '☀️ Good morning' : h < 17 ? '🌤️ Good afternoon' : h < 21 ? '🌆 Good evening' : '🌙 Good night';
    return `${t}! I'm <strong>ARIA</strong>, Mohak's AI assistant powered by Llama 3.3 70B. Ask me anything about his work, skills, or how to get in touch!`;
  }

  /* ── MESSAGES ── */
  function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  function addBot(html) {
    const d = document.createElement('div');
    d.className = 'aria-msg bot';
    d.innerHTML = `<div class="aria-bubble">${html}</div><div class="aria-time">ARIA · ${now()}</div>`;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUser(text) {
    chips.style.display = 'none';
    const d = document.createElement('div');
    d.className = 'aria-msg user';
    d.innerHTML = `<div class="aria-bubble">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div><div class="aria-time">You · ${now()}</div>`;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function typing() {
    const t = document.createElement('div');
    t.className = 'aria-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
    return t;
  }

  /* ── LOCK / UNLOCK ── */
  let busy = false;
  let offCount = 0;

  function lock() {
    busy = true;
    textEl.disabled = true;
    sendEl.disabled = true;
    mic.disabled = true;
    statusTxt.textContent = 'Thinking...';
  }
  function unlock() {
    busy = false;
    textEl.disabled = false;
    sendEl.disabled = false;
    mic.disabled = false;
    statusTxt.textContent = 'Online & ready';
    textEl.focus();
  }

  /* ── SEND ── */
  async function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;

    lock();
    addUser(text);
    textEl.value = '';

    const t = typing();

    try {
      const res = await fetch(WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, offTopicCount: offCount })
      });

      t.remove();

      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      const reply = data.reply || "I'm having a moment — please try again!";

      offCount = data.isOffTopic ? Math.min(offCount + 1, 5) : 0;

      addBot(reply);
      speak(reply);

    } catch (e) {
      t.remove();
      addBot("⚠️ Couldn't reach the backend. Make sure you're on the live GitHub Pages site and try again.");
      console.error('ARIA:', e.message);
    }

    unlock();
  }

  /* ── EVENT LISTENERS ── */
  sendEl.addEventListener('click', () => send(textEl.value));

  textEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(textEl.value); }
  });

  document.querySelectorAll('.aria-chip').forEach(btn => {
    btn.addEventListener('click', function () {
      if (busy) return;
      const q = this.textContent.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27FF}]/gu, '').trim();
      send(q);
    });
  });

  /* ── VOICE SYNTHESIS ── */
  let voice = null;

  function loadVoice() {
    const all = speechSynthesis.getVoices();
    const want = ['Microsoft Aria Online','Microsoft Aria','Microsoft Jenny Online','Microsoft Jenny','Microsoft Zira','Google UK English Female','Samantha','Victoria','Karen','Moira'];
    for (const n of want) {
      const v = all.find(v => v.name.includes(n));
      if (v) { voice = v; return; }
    }
    voice = all.find(v => /female/i.test(v.name)) || all.find(v => v.lang === 'en-GB') || all.find(v => v.lang?.startsWith('en')) || null;
  }

  if (window.speechSynthesis) {
    speechSynthesis.addEventListener('voiceschanged', loadVoice, { once: true });
    loadVoice();
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g,'').substring(0, 220));
    u.rate = 1.05; u.pitch = 1.15; u.volume = 1;
    if (voice) u.voice = voice;
    u.onstart = () => { statusTxt.textContent = '🔊 Speaking...'; };
    u.onend   = () => { statusTxt.textContent = 'Online & ready'; };
    speechSynthesis.speak(u);
  }

  /* ── SPEECH RECOGNITION ── */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    mic.disabled = true;
    mic.title = 'Use Chrome or Edge for voice';
  } else {
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    let listening = false;
    let permDone  = false;

    mic.addEventListener('click', () => {
      if (busy) return;
      if (listening) { rec.stop(); return; }
      if (!permDone && navigator.mediaDevices?.getUserMedia) {
        permDone = true;
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(s => { s.getTracks().forEach(t => t.stop()); rec.start(); })
          .catch(() => rec.start());
      } else {
        rec.start();
      }
    });

    rec.onstart  = () => { listening = true;  mic.classList.add('on');    statusTxt.textContent = '🎤 Listening...'; };
    rec.onend    = () => { listening = false; mic.classList.remove('on'); statusTxt.textContent = 'Online & ready'; };
    rec.onerror  = e => {
      listening = false; mic.classList.remove('on');
      if (e.error === 'not-allowed') addBot('Mic access denied. Please allow microphone in browser settings.');
    };
    rec.onresult = e => { const t = e.results[0][0].transcript.trim(); if (t) send(t); };
  }

})();