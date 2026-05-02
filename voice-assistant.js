/* ================================================================
   ARIA v4.0 — Mohak Mittal's Portfolio Assistant
   Clean UI only — all AI handled by Cloudflare Worker
   ================================================================ */

(function () {
  'use strict';

  const WORKER_URL = 'https://white-paper-62ef.mittalmohak0.workers.dev';

  /* ══════════════════════════════════════════════════════════════
     STYLES
  ══════════════════════════════════════════════════════════════ */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #ariaRoot *, #ariaModal * { box-sizing: border-box; margin: 0; padding: 0; }

    #ariaRoot {
      position: fixed; top: 80px; right: 20px;
      z-index: 999999;
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      cursor: grab; user-select: none; touch-action: none;
    }
    #ariaRoot.dragging { cursor: grabbing; }
    #ariaRoot:not(.dragging) { animation: ariaFloat 3.5s ease-in-out infinite; }
    @keyframes ariaFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }

    #ariaBubble {
      width: 64px; height: 64px;
      background: rgba(5,8,20,0.95);
      border: 2px solid #00f0ff; border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 20px rgba(0,240,255,0.35), 0 6px 28px rgba(0,0,0,0.8);
      backdrop-filter: blur(14px);
      position: relative; overflow: visible;
      transition: box-shadow 0.25s ease, transform 0.25s ease;
    }
    #ariaBubble::after {
      content: ''; position: absolute; inset: -4px; border-radius: 24px;
      border: 1px solid rgba(0,240,255,0.15);
      animation: ariaRing 2.5s ease-in-out infinite;
    }
    @keyframes ariaRing { 0%,100%{transform:scale(1);opacity:0.5;} 50%{transform:scale(1.08);opacity:0.15;} }
    #ariaRoot:not(.dragging) #ariaBubble:hover {
      box-shadow: 0 0 36px rgba(0,240,255,0.6), 0 8px 36px rgba(0,0,0,0.9);
      transform: scale(1.07);
    }
    #ariaTag {
      font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 700;
      color: #00f0ff; letter-spacing: 2.5px;
      text-shadow: 0 0 8px rgba(0,240,255,0.6); pointer-events: none;
    }
    #ariaEyeL, #ariaEyeR { animation: ariaEyeBlink 4s ease-in-out infinite; }
    #ariaEyeR { animation-delay: 0.1s; }
    @keyframes ariaEyeBlink { 0%,90%,100%{transform:scaleY(1);} 95%{transform:scaleY(0.1);} }

    #ariaNotif {
      position: absolute; top: -5px; right: -5px;
      width: 14px; height: 14px; background: #ff4444;
      border-radius: 50%; border: 2px solid #050814;
      box-shadow: 0 0 8px #ff4444; display: none;
      animation: notifPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    #ariaNotif.show { display: block; }
    @keyframes notifPop { from{transform:scale(0);} to{transform:scale(1);} }

    /* Modal */
    #ariaModal {
      position: fixed; inset: 0; z-index: 999998;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
      opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
      font-family: 'Rajdhani', sans-serif;
    }
    #ariaModal.aria-show { opacity: 1; pointer-events: all; }
    #ariaWindow {
      width: min(600px, 95vw); height: min(700px, 90vh);
      background: rgba(4,7,18,0.98);
      border: 1.5px solid rgba(0,240,255,0.4); border-radius: 20px;
      display: flex; flex-direction: column; overflow: hidden;
      box-shadow: 0 0 0 1px rgba(0,240,255,0.08), 0 0 60px rgba(0,240,255,0.15), 0 30px 80px rgba(0,0,0,0.9);
      transform: scale(0.9) translateY(20px);
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      position: relative;
    }
    #ariaModal.aria-show #ariaWindow { transform: scale(1) translateY(0); }
    #ariaWindow::before {
      content: ''; position: absolute; inset: 0; pointer-events: none; border-radius: 20px; z-index: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.015) 2px, rgba(0,240,255,0.015) 4px);
    }

    /* Header */
    #ariaHeader {
      display: flex; align-items: center; gap: 14px;
      padding: 18px 22px; border-bottom: 1px solid rgba(0,240,255,0.12);
      background: rgba(0,240,255,0.03); position: relative; z-index: 1; flex-shrink: 0;
    }
    #ariaHeaderAvatar {
      width: 46px; height: 46px; background: rgba(0,240,255,0.08);
      border: 1.5px solid rgba(0,240,255,0.3); border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #ariaHeaderInfo { flex: 1; }
    #ariaHeaderName {
      font-family: 'Orbitron', monospace; font-size: 13px;
      font-weight: 700; color: #00f0ff; letter-spacing: 1px;
    }
    #ariaHeaderSub {
      font-size: 12px; color: rgba(0,240,255,0.5);
      display: flex; align-items: center; gap: 6px; margin-top: 2px;
    }
    #ariaOnlineDot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #00ff88; box-shadow: 0 0 6px #00ff88;
      animation: ariaPulse 1.8s ease-in-out infinite; flex-shrink: 0;
    }
    @keyframes ariaPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
    #ariaCloseBtn {
      width: 34px; height: 34px; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
      color: rgba(200,210,230,0.6); font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
    }
    #ariaCloseBtn:hover { background: rgba(255,60,60,0.15); border-color: rgba(255,60,60,0.3); color: #ff6060; }

    /* Chat */
    #ariaChatArea {
      flex: 1; overflow-y: auto; padding: 20px 22px;
      display: flex; flex-direction: column; gap: 14px;
      position: relative; z-index: 1;
      scrollbar-width: thin; scrollbar-color: rgba(0,240,255,0.2) transparent;
    }
    #ariaChatArea::-webkit-scrollbar { width: 4px; }
    #ariaChatArea::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.2); border-radius: 4px; }

    .amsg { display: flex; flex-direction: column; max-width: 82%; animation: msgSlide 0.3s ease both; }
    @keyframes msgSlide { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
    .amsg.bot { align-self: flex-start; }
    .amsg.user { align-self: flex-end; }
    .amsg-bubble { padding: 11px 16px; border-radius: 16px; font-size: 14.5px; line-height: 1.6; }
    .amsg.bot .amsg-bubble {
      background: rgba(0,240,255,0.07); border: 1px solid rgba(0,240,255,0.18);
      color: #c8dde8; border-bottom-left-radius: 4px;
    }
    .amsg.user .amsg-bubble {
      background: rgba(255,112,67,0.12); border: 1px solid rgba(255,112,67,0.25);
      color: #ffd0bb; border-bottom-right-radius: 4px;
    }
    .amsg-time { font-size: 10px; color: rgba(150,170,190,0.4); margin-top: 4px; font-family: monospace; }
    .amsg.user .amsg-time { text-align: right; }

    .aria-typing-bubble {
      display: flex; align-items: center; gap: 5px;
      padding: 14px 18px; background: rgba(0,240,255,0.07);
      border: 1px solid rgba(0,240,255,0.18);
      border-radius: 16px; border-bottom-left-radius: 4px;
      align-self: flex-start; max-width: 80px;
    }
    .aria-typing-bubble span {
      width: 7px; height: 7px; border-radius: 50%; background: #00f0ff;
      animation: tdot 1.3s ease-in-out infinite;
    }
    .aria-typing-bubble span:nth-child(2) { animation-delay: 0.18s; }
    .aria-typing-bubble span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes tdot { 0%,60%,100%{transform:translateY(0);opacity:0.35;} 30%{transform:translateY(-6px);opacity:1;} }

    /* Example questions */
    #ariaExamples {
      position: relative; z-index: 1; padding: 0 22px 14px; flex-shrink: 0;
    }
    #ariaExamplesLabel {
      font-size: 11px; color: rgba(0,240,255,0.4); letter-spacing: 1px;
      text-transform: uppercase; margin-bottom: 8px;
      font-family: 'Orbitron', monospace;
    }
    #ariaExamplesGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
    .aexample {
      padding: 9px 12px; background: rgba(0,240,255,0.05);
      border: 1px solid rgba(0,240,255,0.18); border-radius: 10px;
      font-size: 12.5px; color: rgba(0,240,255,0.75); cursor: pointer;
      transition: all 0.2s; line-height: 1.4; font-family: 'Rajdhani', sans-serif;
      text-align: left;
    }
    .aexample:hover {
      background: rgba(0,240,255,0.12); border-color: rgba(0,240,255,0.45);
      color: #00f0ff; transform: translateY(-1px);
    }
    .aexample:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

    /* Voice bar */
    #ariaVoiceBar {
      position: relative; z-index: 1; text-align: center;
      padding: 6px 0 10px; font-size: 12px; color: rgba(0,240,255,0.4);
      font-family: monospace; letter-spacing: 0.5px; display: none; flex-shrink: 0;
    }
    #ariaVoiceBar.show { display: block; }
    #ariaVoiceBar.speaking { color: rgba(0,255,136,0.6); }

    /* Input */
    #ariaInputArea {
      position: relative; z-index: 1; padding: 14px 18px;
      border-top: 1px solid rgba(0,240,255,0.1); background: rgba(0,240,255,0.02);
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    #ariaMicBtn {
      width: 46px; height: 46px; min-width: 46px; border-radius: 50%;
      border: 2px solid rgba(0,240,255,0.5); background: rgba(0,240,255,0.07);
      color: #00f0ff; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;
    }
    #ariaMicBtn:hover { background: rgba(0,240,255,0.15); box-shadow: 0 0 18px rgba(0,240,255,0.4); }
    #ariaMicBtn:disabled { opacity: 0.4; cursor: not-allowed; }
    #ariaMicBtn.listening {
      background: rgba(255,68,68,0.15) !important; border-color: #ff4444 !important;
      color: #ff4444 !important; box-shadow: 0 0 22px rgba(255,68,68,0.5) !important;
      animation: micPulse 0.85s ease-in-out infinite;
    }
    @keyframes micPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.13);} }
    #ariaTextInput {
      flex: 1; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(0,240,255,0.2); border-radius: 12px;
      padding: 11px 16px; color: #c8dde8; font-size: 14px;
      font-family: 'Rajdhani', sans-serif; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    #ariaTextInput::placeholder { color: rgba(0,240,255,0.3); }
    #ariaTextInput:focus { border-color: rgba(0,240,255,0.5); box-shadow: 0 0 12px rgba(0,240,255,0.1); }
    #ariaTextInput:disabled { opacity: 0.5; }
    #ariaSendBtn {
      width: 46px; height: 46px; min-width: 46px; border-radius: 50%;
      border: 2px solid rgba(0,240,255,0.5); background: rgba(0,240,255,0.1);
      color: #00f0ff; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;
    }
    #ariaSendBtn:hover { background: rgba(0,240,255,0.25); box-shadow: 0 0 18px rgba(0,240,255,0.4); }
    #ariaSendBtn:disabled { opacity: 0.4; cursor: not-allowed; }

    @media (max-width: 480px) {
      #ariaWindow { border-radius: 16px; }
      #ariaExamplesGrid { grid-template-columns: 1fr; }
      .amsg { max-width: 90%; }
      #ariaRoot { top: 70px; right: 10px; }
    }
  `;
  document.head.appendChild(styleEl);

  /* ══════════════════════════════════════════════════════════════
     BUILD DOM
  ══════════════════════════════════════════════════════════════ */
  const robotSVG = `
    <svg id="ariaRobotSvg" width="36" height="36" viewBox="0 0 64 64" fill="none">
      <line x1="32" y1="5" x2="32" y2="13" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="32" cy="4" r="3" fill="#00f0ff"/>
      <rect x="10" y="13" width="44" height="30" rx="9" fill="#060d1f" stroke="#00f0ff" stroke-width="1.8"/>
      <g id="ariaEyeL">
        <ellipse cx="22" cy="27" rx="5.5" ry="5.5" fill="rgba(0,240,255,0.12)"/>
        <ellipse cx="22" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
        <ellipse cx="23.2" cy="25.8" rx="1.2" ry="1.2" fill="white" opacity="0.7"/>
      </g>
      <g id="ariaEyeR">
        <ellipse cx="42" cy="27" rx="5.5" ry="5.5" fill="rgba(0,240,255,0.12)"/>
        <ellipse cx="42" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
        <ellipse cx="43.2" cy="25.8" rx="1.2" ry="1.2" fill="white" opacity="0.7"/>
      </g>
      <rect x="22" y="35" width="20" height="4" rx="2" fill="#00f0ff" opacity="0.55"/>
      <rect x="5" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity="0.45"/>
      <rect x="54" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity="0.45"/>
    </svg>`;

  const miniRobotSVG = `
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <line x1="32" y1="5" x2="32" y2="13" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="32" cy="4" r="3" fill="#00f0ff"/>
      <rect x="10" y="13" width="44" height="30" rx="9" fill="#060d1f" stroke="#00f0ff" stroke-width="1.8"/>
      <ellipse cx="22" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
      <ellipse cx="42" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
      <rect x="22" y="35" width="20" height="4" rx="2" fill="#00f0ff" opacity="0.55"/>
      <rect x="5" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity="0.45"/>
      <rect x="54" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity="0.45"/>
    </svg>`;

  // Floating button
  const root = document.createElement('div');
  root.id = 'ariaRoot';
  root.innerHTML = `
    <div id="ariaBubble">${robotSVG}<div id="ariaNotif"></div></div>
    <span id="ariaTag">ARIA</span>`;
  document.body.appendChild(root);

  // Modal
  const modal = document.createElement('div');
  modal.id = 'ariaModal';
  modal.innerHTML = `
    <div id="ariaWindow">
      <div id="ariaHeader">
        <div id="ariaHeaderAvatar">${miniRobotSVG}</div>
        <div id="ariaHeaderInfo">
          <div id="ariaHeaderName">ARIA — AI Portfolio Assistant</div>
          <div id="ariaHeaderSub"><div id="ariaOnlineDot"></div><span id="ariaStatusText">Online &amp; ready</span></div>
        </div>
        <button id="ariaCloseBtn">✕</button>
      </div>
      <div id="ariaChatArea"></div>
      <div id="ariaExamples">
        <div id="ariaExamplesLabel">Try asking</div>
        <div id="ariaExamplesGrid">
          <button class="aexample">🎮 Tell me about his games</button>
          <button class="aexample">🛠️ What are his skills?</button>
          <button class="aexample">🎯 What's his dream goal?</button>
          <button class="aexample">📩 How do I contact him?</button>
          <button class="aexample">🖥️ His Unreal Engine work</button>
          <button class="aexample">🤖 What is the ARIA project?</button>
          <button class="aexample">🎓 His education background</button>
          <button class="aexample">🌟 Why should I hire him?</button>
        </div>
      </div>
      <div id="ariaVoiceBar"></div>
      <div id="ariaInputArea">
        <button id="ariaMicBtn" title="Tap to speak">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M5 10a7 7 0 0 0 14 0"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <input id="ariaTextInput" type="text" placeholder="Ask me anything about Mohak..." autocomplete="off"/>
        <button id="ariaSendBtn" title="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  /* ══════════════════════════════════════════════════════════════
     DOM REFS
  ══════════════════════════════════════════════════════════════ */
  const closeBtn    = document.getElementById('ariaCloseBtn');
  const chatArea    = document.getElementById('ariaChatArea');
  const examples    = document.getElementById('ariaExamples');
  const micBtn      = document.getElementById('ariaMicBtn');
  const textInput   = document.getElementById('ariaTextInput');
  const sendBtn     = document.getElementById('ariaSendBtn');
  const voiceBar    = document.getElementById('ariaVoiceBar');
  const statusText  = document.getElementById('ariaStatusText');
  const notifDot    = document.getElementById('ariaNotif');

  /* ══════════════════════════════════════════════════════════════
     DRAG
  ══════════════════════════════════════════════════════════════ */
  let isDragging = false, dragMoved = false;
  let dragStartX = 0, dragStartY = 0, rootStartX = 0, rootStartY = 0;

  root.addEventListener('mousedown', dragStart);
  root.addEventListener('touchstart', dragStart, { passive: false });
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('touchmove', dragMove, { passive: false });
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('touchend', dragEnd);

  function dragStart(e) {
    if (e.button !== undefined && e.button !== 0) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartX = cx; dragStartY = cy;
    const r = root.getBoundingClientRect();
    rootStartX = r.left; rootStartY = r.top;
    isDragging = true; dragMoved = false;
    root.classList.add('dragging');
    root.style.animation = 'none';
    e.preventDefault();
  }
  function dragMove(e) {
    if (!isDragging) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = cx - dragStartX, dy = cy - dragStartY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragMoved = true;
    if (!dragMoved) return;
    const x = Math.max(8, Math.min(window.innerWidth - root.offsetWidth - 8, rootStartX + dx));
    const y = Math.max(8, Math.min(window.innerHeight - root.offsetHeight - 8, rootStartY + dy));
    root.style.left = x + 'px'; root.style.top = y + 'px';
    root.style.right = 'auto'; root.style.bottom = 'auto';
  }
  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    root.classList.remove('dragging');
    root.style.animation = '';
    if (!dragMoved) openModal();
  }

  /* ══════════════════════════════════════════════════════════════
     MODAL
  ══════════════════════════════════════════════════════════════ */
  let modalOpened = false;

  function getTime() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

  function getGreeting() {
    const h = new Date().getHours();
    const t = h < 12 ? '☀️ Good morning' : h < 17 ? '🌤️ Good afternoon' : h < 21 ? '🌆 Good evening' : '🌙 Good night';
    return `${t}! I'm <strong>ARIA</strong>, Mohak's AI portfolio assistant powered by Llama 3.3. Ask me anything about his work, skills, or how to reach him!`;
  }

  function openModal() {
    modal.classList.add('aria-show');
    notifDot.classList.remove('show');
    if (!modalOpened) {
      modalOpened = true;
      setTimeout(() => addBotMsg(getGreeting()), 400);
    }
    setTimeout(() => textInput.focus(), 350);
  }
  function closeModal() { modal.classList.remove('aria-show'); }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  setTimeout(() => { if (!modalOpened) notifDot.classList.add('show'); }, 3000);

  /* ══════════════════════════════════════════════════════════════
     MESSAGES
  ══════════════════════════════════════════════════════════════ */
  function addBotMsg(html) {
    if (chatArea.children.length > 0) examples.style.display = 'none';
    const d = document.createElement('div');
    d.className = 'amsg bot';
    d.innerHTML = `<div class="amsg-bubble">${html}</div><div class="amsg-time">ARIA · ${getTime()}</div>`;
    chatArea.appendChild(d);
    chatArea.scrollTop = chatArea.scrollHeight;
  }
  function addUserMsg(text) {
    examples.style.display = 'none';
    const d = document.createElement('div');
    d.className = 'amsg user';
    d.innerHTML = `<div class="amsg-bubble">${text.replace(/</g,'&lt;')}</div><div class="amsg-time">You · ${getTime()}</div>`;
    chatArea.appendChild(d);
    chatArea.scrollTop = chatArea.scrollHeight;
  }
  function showTyping() {
    const t = document.createElement('div');
    t.className = 'aria-typing-bubble';
    t.innerHTML = '<span></span><span></span><span></span>';
    chatArea.appendChild(t);
    chatArea.scrollTop = chatArea.scrollHeight;
    return t;
  }

  /* ══════════════════════════════════════════════════════════════
     LOCK / UNLOCK INPUTS
  ══════════════════════════════════════════════════════════════ */
  let isProcessing = false;
  let offTopicCount = 0;

  async function processInput(text) {
    text = text.trim();
    if (!text || isProcessing) return;
    lock();
    addUserMsg(text);
    textInput.value = '';
    const typing = showTyping();

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, offTopicCount }),
      });
      typing.remove();
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const reply = data.reply || "I'm having a moment — please try again!";

      // Track off-topic streak
      if (data.isOffTopic) offTopicCount++;
      else offTopicCount = 0;

      addBotMsg(reply);
      speak(reply);
    } catch (err) {
      typing.remove();
      addBotMsg("I couldn't reach my backend right now. Please check your connection and try again.");
    }

    unlock();
  }

  /* Example buttons */
  document.querySelectorAll('.aexample').forEach(btn => {
    btn.addEventListener('click', function () {
      const q = this.textContent.replace(/[🎮🛠️🎯📩🖥️🤖🎓🌟]/g, '').trim();
      openModal();
      setTimeout(() => processInput(q), 150);
    });
  });

  /* Text input */
  sendBtn.addEventListener('click', () => processInput(textInput.value));
  textInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processInput(textInput.value); }
  });

  /* ══════════════════════════════════════════════════════════════
     VOICE SYNTHESIS — Female, cached
  ══════════════════════════════════════════════════════════════ */
  let cachedVoice = null;
  function getFemaleVoice() {
    if (cachedVoice) return cachedVoice;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const priority = ['Microsoft Aria Online','Microsoft Aria','Microsoft Jenny Online','Microsoft Jenny','Microsoft Zira','Google UK English Female','Samantha','Victoria','Karen','Moira'];
    for (const n of priority) {
      const v = voices.find(v => v.name.includes(n));
      if (v) { cachedVoice = v; return v; }
    }
    cachedVoice = voices.find(v => v.name.toLowerCase().includes('female'))
               || voices.find(v => v.lang === 'en-GB')
               || voices.find(v => v.lang && v.lang.startsWith('en')) || null;
    return cachedVoice;
  }
  window.speechSynthesis.addEventListener('voiceschanged', () => { cachedVoice = null; getFemaleVoice(); }, { once: true });

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/<[^>]+>/g, '').substring(0, 250);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 1.05; utt.pitch = 1.15; utt.volume = 1;
    const v = getFemaleVoice();
    if (v) utt.voice = v;
    utt.onstart = () => { voiceBar.textContent = '🔊 Speaking...'; voiceBar.className = 'show speaking'; statusText.textContent = 'Speaking'; };
    utt.onend   = () => { voiceBar.className = ''; statusText.textContent = 'Online & ready'; };
    window.speechSynthesis.speak(utt);
  }

  /* ══════════════════════════════════════════════════════════════
     SPEECH RECOGNITION
  ══════════════════════════════════════════════════════════════ */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    micBtn.style.opacity = '0.4'; micBtn.disabled = true; micBtn.title = 'Use Chrome/Edge for voice';
  } else {
    const recog = new SR();
    recog.lang = 'en-US'; recog.interimResults = false; recog.maxAlternatives = 1;
    let listening = false;
    let micPermAsked = false;

    micBtn.addEventListener('click', () => {
      if (isProcessing) return;
      if (listening) { recog.stop(); return; }
      if (!micPermAsked) {
        micPermAsked = true;
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia({ audio: true })
          .then(s => { s.getTracks().forEach(t => t.stop()); recog.start(); })
          .catch(() => recog.start());
      } else { recog.start(); }
    });

    recog.onstart = () => {
      listening = true; micBtn.classList.add('listening');
      voiceBar.textContent = '🎤 Listening...'; voiceBar.className = 'show';
      statusText.textContent = 'Listening...';
    };
    recog.onend = () => {
      listening = false; micBtn.classList.remove('listening');
      if (!voiceBar.classList.contains('speaking')) { voiceBar.className = ''; statusText.textContent = 'Online & ready'; }
    };
    recog.onerror = e => {
      listening = false; micBtn.classList.remove('listening');
      voiceBar.className = ''; statusText.textContent = 'Online & ready';
      if (e.error === 'not-allowed') addBotMsg('Microphone access denied. Please allow mic permissions in your browser settings.');
    };
    recog.onresult = e => { processInput(e.results[0][0].transcript.trim()); };
  }

})();