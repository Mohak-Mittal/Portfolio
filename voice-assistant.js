/* ================================================================
   ARIA v5.0 — Mohak Mittal Portfolio Assistant
   ================================================================ */
(function () {
  'use strict';

  const WORKER_URL = 'https://white-paper-62ef.mittalmohak0.workers.dev';

  /* ── STYLES ── */
  const style = document.createElement('style');
  style.textContent = `
    #ariaRoot *, #ariaModal * { box-sizing: border-box; margin: 0; padding: 0; }

    #ariaRoot {
      position: fixed; bottom: 28px; right: 24px;
      z-index: 999999;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      cursor: pointer; user-select: none; touch-action: manipulation;
    }

    #ariaBubble {
      width: 62px; height: 62px;
      background: linear-gradient(135deg, rgba(0,12,30,0.97), rgba(0,20,45,0.97));
      border: 1.5px solid rgba(0,240,255,0.7);
      border-radius: 22px;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: visible;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
      box-shadow: 0 0 0 1px rgba(0,240,255,0.12), 0 0 20px rgba(0,240,255,0.25), 0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(0,240,255,0.15);
      animation: ariaFloat 4s ease-in-out infinite;
    }
    #ariaBubble:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 0 0 1px rgba(0,240,255,0.2), 0 0 35px rgba(0,240,255,0.45), 0 12px 40px rgba(0,0,0,0.8);
    }
    #ariaBubble:active { transform: scale(0.95); animation: none; }
    #ariaBubble::before {
      content: ''; position: absolute; inset: -6px; border-radius: 28px;
      border: 1px solid rgba(0,240,255,0.18);
      animation: ariaRingPulse 3s ease-in-out infinite; pointer-events: none;
    }
    #ariaBubble::after {
      content: ''; position: absolute; top: 6px; left: 8px; right: 8px; height: 30%;
      background: linear-gradient(180deg, rgba(0,240,255,0.12), transparent);
      border-radius: 10px 10px 0 0; pointer-events: none;
    }
    @keyframes ariaFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-7px);} }
    @keyframes ariaRingPulse { 0%,100%{opacity:0.6;transform:scale(1);} 50%{opacity:0.15;transform:scale(1.06);} }

    #ariaTag {
      font-family: 'Orbitron', monospace; font-size: 8.5px; font-weight: 700;
      color: rgba(0,240,255,0.85); letter-spacing: 3px;
      text-shadow: 0 0 10px rgba(0,240,255,0.5); pointer-events: none;
    }

    #ariaNotif {
      position: absolute; top: -4px; right: -4px;
      width: 16px; height: 16px;
      background: linear-gradient(135deg, #ff4444, #ff6b6b);
      border-radius: 50%; border: 2px solid rgba(0,8,20,1);
      box-shadow: 0 0 10px rgba(255,68,68,0.7); display: none;
      animation: notifBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    #ariaNotif.show { display: block; }
    @keyframes notifBounce { from{transform:scale(0) rotate(-15deg);} to{transform:scale(1) rotate(0);} }

    #ariaEyeL, #ariaEyeR { animation: ariaEyeBlink 5s ease-in-out infinite; }
    #ariaEyeR { animation-delay: 0.08s; }
    @keyframes ariaEyeBlink { 0%,88%,100%{transform:scaleY(1);} 94%{transform:scaleY(0.08);} }

    #ariaModal {
      position: fixed; inset: 0; z-index: 999998;
      display: flex; align-items: flex-end; justify-content: center;
      background: rgba(0,0,0,0); backdrop-filter: blur(0px);
      pointer-events: none;
      transition: background 0.3s ease, backdrop-filter 0.3s ease;
      font-family: 'Rajdhani', sans-serif;
    }
    #ariaModal.aria-show {
      background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); pointer-events: all;
    }

    #ariaWindow {
      width: 100%; max-width: 480px; height: 85vh; max-height: 700px;
      background: rgba(3,6,18,0.98);
      border: 1px solid rgba(0,240,255,0.25); border-bottom: none;
      border-radius: 28px 28px 0 0;
      display: flex; flex-direction: column; overflow: hidden;
      box-shadow: 0 0 0 1px rgba(0,240,255,0.06), 0 -20px 60px rgba(0,240,255,0.08), 0 -40px 100px rgba(0,0,0,0.9);
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.32,0.72,0,1);
      position: relative;
    }
    #ariaModal.aria-show #ariaWindow { transform: translateY(0); }
    #ariaWindow::before {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      border-radius: 28px 28px 0 0; z-index: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,240,255,0.008) 3px, rgba(0,240,255,0.008) 4px);
    }

    #ariaHandle {
      width: 36px; height: 4px; background: rgba(0,240,255,0.2);
      border-radius: 2px; margin: 10px auto 0; flex-shrink: 0;
    }

    #ariaHeader {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px 16px;
      border-bottom: 1px solid rgba(0,240,255,0.1);
      background: linear-gradient(180deg, rgba(0,240,255,0.04), transparent);
      position: relative; z-index: 1; flex-shrink: 0;
    }
    #ariaHeaderAvatar {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, rgba(0,30,60,0.9), rgba(0,15,35,0.9));
      border: 1.5px solid rgba(0,240,255,0.35); border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      box-shadow: 0 0 14px rgba(0,240,255,0.15), inset 0 1px 0 rgba(0,240,255,0.1);
    }
    #ariaHeaderInfo { flex: 1; min-width: 0; }
    #ariaHeaderName {
      font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 700;
      color: #00f0ff; letter-spacing: 0.5px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    #ariaHeaderSub {
      font-size: 12px; color: rgba(0,200,220,0.5);
      display: flex; align-items: center; gap: 5px; margin-top: 2px;
    }
    #ariaOnlineDot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #00ff88; box-shadow: 0 0 6px #00ff88;
      flex-shrink: 0; animation: statusPulse 2s ease-in-out infinite;
    }
    #ariaOnlineDot.thinking { background: #ffaa00; box-shadow: 0 0 6px #ffaa00; }
    #ariaOnlineDot.speaking { background: #00aaff; box-shadow: 0 0 6px #00aaff; }
    @keyframes statusPulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }

    #ariaCloseBtn {
      width: 32px; height: 32px; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
      color: rgba(180,200,220,0.5); font-size: 15px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease; flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    #ariaCloseBtn:hover, #ariaCloseBtn:active {
      background: rgba(255,60,60,0.15); border-color: rgba(255,60,60,0.3); color: #ff6060;
    }

    #ariaChatArea {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      padding: 16px 18px; display: flex; flex-direction: column; gap: 12px;
      position: relative; z-index: 1;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin; scrollbar-color: rgba(0,240,255,0.15) transparent;
      overscroll-behavior: contain;
    }
    #ariaChatArea::-webkit-scrollbar { width: 3px; }
    #ariaChatArea::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); border-radius: 3px; }

    .amsg {
      display: flex; flex-direction: column; max-width: 85%;
      animation: msgIn 0.28s cubic-bezier(0.34,1.2,0.64,1) both;
    }
    @keyframes msgIn { from{opacity:0;transform:translateY(12px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
    .amsg.bot  { align-self: flex-start; }
    .amsg.user { align-self: flex-end; }
    .amsg-bubble { padding: 10px 15px; border-radius: 18px; font-size: 14px; line-height: 1.65; word-break: break-word; }
    .amsg.bot .amsg-bubble {
      background: linear-gradient(135deg, rgba(0,240,255,0.07), rgba(0,180,220,0.05));
      border: 1px solid rgba(0,240,255,0.16); color: #cce8f0;
      border-bottom-left-radius: 5px; box-shadow: 0 2px 12px rgba(0,240,255,0.05);
    }
    .amsg.user .amsg-bubble {
      background: linear-gradient(135deg, rgba(255,100,50,0.14), rgba(255,140,80,0.08));
      border: 1px solid rgba(255,120,60,0.22); color: #ffd5bb;
      border-bottom-right-radius: 5px;
    }
    .amsg-meta {
      font-size: 10px; color: rgba(140,165,185,0.35);
      margin-top: 5px; font-family: monospace; letter-spacing: 0.3px;
    }
    .amsg.user .amsg-meta { text-align: right; }

    .aria-typing {
      display: flex; align-items: center; gap: 5px;
      padding: 13px 17px;
      background: rgba(0,240,255,0.06); border: 1px solid rgba(0,240,255,0.14);
      border-radius: 18px; border-bottom-left-radius: 5px;
      align-self: flex-start; width: fit-content;
    }
    .aria-typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #00f0ff; opacity: 0.4;
      animation: typingDot 1.2s ease-in-out infinite;
    }
    .aria-typing span:nth-child(2) { animation-delay: 0.16s; }
    .aria-typing span:nth-child(3) { animation-delay: 0.32s; }
    @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.35;} 30%{transform:translateY(-5px);opacity:1;} }

    #ariaExamples { position: relative; z-index: 1; padding: 0 18px 12px; flex-shrink: 0; }
    #ariaExamplesLabel {
      font-size: 10px; color: rgba(0,240,255,0.35); letter-spacing: 1.5px;
      text-transform: uppercase; margin-bottom: 8px; font-family: 'Orbitron', monospace;
    }
    #ariaExamplesGrid { display: flex; flex-wrap: wrap; gap: 6px; }
    .aexample {
      padding: 7px 12px;
      background: rgba(0,240,255,0.04); border: 1px solid rgba(0,240,255,0.15);
      border-radius: 20px; font-size: 12px; color: rgba(0,220,240,0.7);
      cursor: pointer; transition: all 0.18s ease;
      font-family: 'Rajdhani', sans-serif; font-weight: 500;
      white-space: nowrap; -webkit-tap-highlight-color: transparent;
    }
    .aexample:hover, .aexample:active {
      background: rgba(0,240,255,0.1); border-color: rgba(0,240,255,0.4); color: #00f0ff;
    }
    .aexample:disabled { opacity: 0.35; cursor: not-allowed; }

    #ariaVoiceBar {
      position: relative; z-index: 1; text-align: center;
      padding: 4px 0 8px; font-size: 11.5px; color: rgba(0,240,255,0.4);
      font-family: monospace; letter-spacing: 0.5px; display: none; flex-shrink: 0;
    }
    #ariaVoiceBar.show { display: block; }
    #ariaVoiceBar.speaking { color: rgba(0,200,255,0.65); }

    #ariaInputArea {
      position: relative; z-index: 1;
      padding: 12px 14px;
      padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));
      border-top: 1px solid rgba(0,240,255,0.08);
      background: linear-gradient(0deg, rgba(0,240,255,0.025), transparent);
      display: flex; align-items: center; gap: 9px; flex-shrink: 0;
    }
    #ariaMicBtn, #ariaSendBtn {
      width: 44px; height: 44px; min-width: 44px; border-radius: 14px;
      border: 1.5px solid rgba(0,240,255,0.3); background: rgba(0,240,255,0.06);
      color: #00f0ff; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    #ariaMicBtn:hover, #ariaSendBtn:hover {
      background: rgba(0,240,255,0.14); border-color: rgba(0,240,255,0.55);
      box-shadow: 0 0 14px rgba(0,240,255,0.25);
    }
    #ariaMicBtn:active, #ariaSendBtn:active { transform: scale(0.93); }
    #ariaMicBtn:disabled, #ariaSendBtn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
    #ariaMicBtn.listening {
      background: rgba(255,60,60,0.14) !important; border-color: rgba(255,60,60,0.5) !important;
      color: #ff5555 !important; box-shadow: 0 0 18px rgba(255,60,60,0.3) !important;
      animation: micListen 0.9s ease-in-out infinite;
    }
    @keyframes micListen { 0%,100%{transform:scale(1);} 50%{transform:scale(1.1);} }
    #ariaSendBtn {
      background: linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,180,220,0.08));
      border-color: rgba(0,240,255,0.4);
    }
    #ariaTextInput {
      flex: 1; min-width: 0;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(0,240,255,0.18);
      border-radius: 14px; padding: 11px 16px; color: #cce8f0;
      font-size: 14px; font-family: 'Rajdhani', sans-serif; font-weight: 500;
      outline: none; transition: border-color 0.2s, box-shadow 0.2s;
      -webkit-appearance: none; appearance: none;
    }
    #ariaTextInput::placeholder { color: rgba(0,200,220,0.28); }
    #ariaTextInput:focus { border-color: rgba(0,240,255,0.4); box-shadow: 0 0 0 3px rgba(0,240,255,0.06); }
    #ariaTextInput:disabled { opacity: 0.45; }

    @media (max-width: 480px) {
      #ariaRoot { bottom: 20px; right: 16px; }
      #ariaWindow { height: 92vh; max-height: 92vh; border-radius: 22px 22px 0 0; }
      #ariaChatArea { padding: 14px; }
      #ariaInputArea { padding: 10px 12px; padding-bottom: max(10px, env(safe-area-inset-bottom, 10px)); }
      .amsg { max-width: 90%; }
      .aexample { font-size: 11.5px; padding: 6px 10px; }
    }
  `;
  document.head.appendChild(style);

  /* ── SVGs ── */
  const robotSVG = `<svg width="34" height="34" viewBox="0 0 64 64" fill="none">
    <line x1="32" y1="6" x2="32" y2="13" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="32" cy="4.5" r="2.8" fill="#00f0ff" opacity="0.9"/>
    <rect x="11" y="13" width="42" height="29" rx="9" fill="rgba(0,20,45,0.95)" stroke="#00f0ff" stroke-width="1.8"/>
    <g id="ariaEyeL">
      <circle cx="22" cy="27" r="5.5" fill="rgba(0,240,255,0.1)"/>
      <circle cx="22" cy="27" r="3.5" fill="#00f0ff"/>
      <circle cx="23.3" cy="25.7" r="1.2" fill="white" opacity="0.75"/>
    </g>
    <g id="ariaEyeR">
      <circle cx="42" cy="27" r="5.5" fill="rgba(0,240,255,0.1)"/>
      <circle cx="42" cy="27" r="3.5" fill="#00f0ff"/>
      <circle cx="43.3" cy="25.7" r="1.2" fill="white" opacity="0.75"/>
    </g>
    <rect x="22" y="35" width="20" height="3.5" rx="1.75" fill="#00f0ff" opacity="0.5"/>
    <rect x="5" y="22" width="6" height="12" rx="3" fill="#00f0ff" opacity="0.35"/>
    <rect x="53" y="22" width="6" height="12" rx="3" fill="#00f0ff" opacity="0.35"/>
  </svg>`;

  const miniRobotSVG = `<svg width="26" height="26" viewBox="0 0 64 64" fill="none">
    <line x1="32" y1="6" x2="32" y2="13" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="32" cy="4.5" r="2.8" fill="#00f0ff" opacity="0.9"/>
    <rect x="11" y="13" width="42" height="29" rx="9" fill="rgba(0,20,45,0.95)" stroke="#00f0ff" stroke-width="1.8"/>
    <circle cx="22" cy="27" r="3.5" fill="#00f0ff"/>
    <circle cx="42" cy="27" r="3.5" fill="#00f0ff"/>
    <rect x="22" y="35" width="20" height="3.5" rx="1.75" fill="#00f0ff" opacity="0.5"/>
    <rect x="5" y="22" width="6" height="12" rx="3" fill="#00f0ff" opacity="0.35"/>
    <rect x="53" y="22" width="6" height="12" rx="3" fill="#00f0ff" opacity="0.35"/>
  </svg>`;

  /* ── BUILD DOM ── */
  const root = document.createElement('div');
  root.id = 'ariaRoot';
  root.setAttribute('role', 'button');
  root.setAttribute('tabindex', '0');
  root.setAttribute('aria-label', 'Open ARIA assistant');
  root.innerHTML = `<div id="ariaBubble">${robotSVG}<div id="ariaNotif"></div></div><span id="ariaTag">ARIA</span>`;
  document.body.appendChild(root);

  const modal = document.createElement('div');
  modal.id = 'ariaModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.innerHTML = `
    <div id="ariaWindow">
      <div id="ariaHandle"></div>
      <div id="ariaHeader">
        <div id="ariaHeaderAvatar">${miniRobotSVG}</div>
        <div id="ariaHeaderInfo">
          <div id="ariaHeaderName">ARIA — Portfolio Assistant</div>
          <div id="ariaHeaderSub"><div id="ariaOnlineDot"></div><span id="ariaStatusText">Online &amp; ready</span></div>
        </div>
        <button id="ariaCloseBtn" aria-label="Close">✕</button>
      </div>
      <div id="ariaChatArea" role="log" aria-live="polite"></div>
      <div id="ariaExamples">
        <div id="ariaExamplesLabel">Quick questions</div>
        <div id="ariaExamplesGrid">
          <button class="aexample">🎮 His games</button>
          <button class="aexample">🛠️ Skills</button>
          <button class="aexample">🎯 Dream goal</button>
          <button class="aexample">📩 Contact him</button>
          <button class="aexample">🔷 Blender work</button>
          <button class="aexample">🤖 ARIA project</button>
          <button class="aexample">🎓 Education</button>
          <button class="aexample">🌟 Why hire him?</button>
        </div>
      </div>
      <div id="ariaVoiceBar"></div>
      <div id="ariaInputArea">
        <button id="ariaMicBtn" aria-label="Voice input">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M5 10a7 7 0 0 0 14 0"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <input id="ariaTextInput" type="text" placeholder="Ask me about Mohak..."
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="send"/>
        <button id="ariaSendBtn" aria-label="Send">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  /* ── REFS ── */
  const notifDot  = document.getElementById('ariaNotif');
  const closeBtn  = document.getElementById('ariaCloseBtn');
  const chatArea  = document.getElementById('ariaChatArea');
  const examples  = document.getElementById('ariaExamples');
  const micBtn    = document.getElementById('ariaMicBtn');
  const textInput = document.getElementById('ariaTextInput');
  const sendBtn   = document.getElementById('ariaSendBtn');
  const voiceBar  = document.getElementById('ariaVoiceBar');
  const statusTxt = document.getElementById('ariaStatusText');
  const onlineDot = document.getElementById('ariaOnlineDot');

  /* ── OPEN / CLOSE ── */
  let opened = false;

  function openModal() {
    modal.classList.add('aria-show');
    notifDot.classList.remove('show');
    document.body.style.overflow = 'hidden';
    if (!opened) {
      opened = true;
      setTimeout(() => addBot(greeting()), 420);
    }
    if (window.innerWidth > 480) setTimeout(() => textInput.focus(), 500);
  }

  function closeModal() {
    modal.classList.remove('aria-show');
    document.body.style.overflow = '';
    window.speechSynthesis && window.speechSynthesis.cancel();
  }

  root.addEventListener('click', openModal);
  root.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(); });
  closeBtn.addEventListener('click', e => { e.stopPropagation(); closeModal(); });
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Swipe down handle to close
  let swipeY = 0;
  const handle = document.getElementById('ariaHandle');
  handle.addEventListener('touchstart', e => { swipeY = e.touches[0].clientY; }, { passive: true });
  handle.addEventListener('touchmove', e => { if (e.touches[0].clientY - swipeY > 60) closeModal(); }, { passive: true });

  setTimeout(() => { if (!opened) notifDot.classList.add('show'); }, 4000);

  /* ── HELPERS ── */
  function now() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  function greeting() {
    const h = new Date().getHours();
    const g = h < 12 ? '☀️ Good morning' : h < 17 ? '🌤️ Good afternoon' : h < 21 ? '🌆 Good evening' : '🌙 Good night';
    return `${g}! I'm <strong>ARIA</strong> — Mohak's AI portfolio assistant. Ask me anything about his work, skills, or how to reach him.`;
  }

  function esc(t) {
    return t.replace(/[<>&"]/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[c]));
  }

  function scrollBot() { requestAnimationFrame(() => { chatArea.scrollTop = chatArea.scrollHeight; }); }

  function addBot(html) {
    if (chatArea.children.length > 0) examples.style.display = 'none';
    const d = document.createElement('div');
    d.className = 'amsg bot';
    d.innerHTML = `<div class="amsg-bubble">${html}</div><div class="amsg-meta">ARIA · ${now()}</div>`;
    chatArea.appendChild(d);
    scrollBot();
  }

  function addUser(text) {
    examples.style.display = 'none';
    const d = document.createElement('div');
    d.className = 'amsg user';
    d.innerHTML = `<div class="amsg-bubble">${esc(text)}</div><div class="amsg-meta">You · ${now()}</div>`;
    chatArea.appendChild(d);
    scrollBot();
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'aria-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    chatArea.appendChild(t);
    scrollBot();
    return t;
  }

  /* ── STATE ── */
  let busy = false;
  let offTopicCount = 0;

  function setStatus(s) {
    onlineDot.className = '';
    if (s === 'thinking') { onlineDot.classList.add('thinking'); statusTxt.textContent = 'Thinking...'; }
    else if (s === 'speaking') { onlineDot.classList.add('speaking'); statusTxt.textContent = 'Speaking...'; }
    else if (s === 'listening') { statusTxt.textContent = 'Listening...'; }
    else { statusTxt.textContent = 'Online & ready'; }
  }

  function lock() {
    busy = true;
    textInput.disabled = sendBtn.disabled = micBtn.disabled = true;
    setStatus('thinking');
    document.querySelectorAll('.aexample').forEach(b => b.disabled = true);
  }

  function unlock() {
    busy = false;
    textInput.disabled = sendBtn.disabled = micBtn.disabled = false;
    setStatus('ready');
    document.querySelectorAll('.aexample').forEach(b => b.disabled = false);
    if (window.innerWidth > 480) textInput.focus();
  }

  /* ── FETCH ── */
  async function send(text) {
    text = text.trim();
    if (!text || busy) return;
    lock();
    addUser(text);
    textInput.value = '';
    const typing = showTyping();

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, offTopicCount }),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      typing.remove();
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const reply = data.reply || "I'm having a moment — try again!";
      if (data.isOffTopic) offTopicCount++; else offTopicCount = Math.max(0, offTopicCount - 1);
      addBot(reply);
      speak(reply);
    } catch (err) {
      typing.remove();
      addBot(err.name === 'AbortError'
        ? "That took too long — Groq might be busy. Try again! ⚡"
        : "Lost connection to my backend. Check your connection and try again.");
    }
    unlock();
  }

  /* Quick buttons */
  document.querySelectorAll('.aexample').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const q = this.textContent.replace(/\p{Emoji}/gu, '').trim();
      if (!opened) openModal();
      setTimeout(() => send(q), 150);
    });
  });

  sendBtn.addEventListener('click', e => { e.stopPropagation(); send(textInput.value); });
  textInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(textInput.value); }
  });

  /* ── SPEECH SYNTHESIS ── */
  let cachedVoice = null;
  function getVoice() {
    if (cachedVoice) return cachedVoice;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const names = ['Microsoft Aria Online','Microsoft Aria','Microsoft Jenny Online','Microsoft Jenny','Google UK English Female','Samantha','Victoria','Karen','Moira','Microsoft Zira'];
    for (const n of names) {
      const v = voices.find(v => v.name.includes(n));
      if (v) { cachedVoice = v; return v; }
    }
    cachedVoice = voices.find(v => /female/i.test(v.name)) || voices.find(v => v.lang && v.lang.startsWith('en')) || null;
    return cachedVoice;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.addEventListener('voiceschanged', () => { cachedVoice = null; getVoice(); }, { once: true });
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/<[^>]+>/g, '').substring(0, 280);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 1.05; utt.pitch = 1.1; utt.volume = 1;
    const v = getVoice();
    if (v) utt.voice = v;
    utt.onstart = () => { voiceBar.textContent = '🔊 ARIA is speaking...'; voiceBar.className = 'show speaking'; setStatus('speaking'); };
    utt.onend = utt.onerror = () => { voiceBar.className = ''; setStatus('ready'); };
    setTimeout(() => window.speechSynthesis.speak(utt), 100);
  }

  /* ── SPEECH RECOGNITION ── */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    micBtn.style.opacity = '0.35'; micBtn.disabled = true; micBtn.title = 'Requires Chrome or Edge';
  } else {
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
    let listening = false, permAsked = false;

    micBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (busy) return;
      if (listening) { rec.stop(); return; }
      window.speechSynthesis && window.speechSynthesis.cancel();
      const start = () => { try { rec.start(); } catch(_) {} };
      if (!permAsked) {
        permAsked = true;
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia({ audio: true })
          .then(s => { s.getTracks().forEach(t => t.stop()); start(); }).catch(start);
      } else { start(); }
    });

    rec.onstart = () => { listening = true; micBtn.classList.add('listening'); voiceBar.textContent = '🎤 Listening...'; voiceBar.className = 'show'; setStatus('listening'); };
    rec.onend = () => { listening = false; micBtn.classList.remove('listening'); if (!voiceBar.classList.contains('speaking')) { voiceBar.className = ''; setStatus('ready'); } };
    rec.onerror = e => {
      listening = false; micBtn.classList.remove('listening'); voiceBar.className = ''; setStatus('ready');
      if (e.error === 'not-allowed') addBot('Microphone access denied. Allow mic permissions in your browser settings.');
    };
    rec.onresult = e => { const t = e.results[0][0].transcript.trim(); if (t) send(t); };
  }

})();
