/* ================================================================
   ARIA v4.2 — Mohak Mittal's Portfolio Assistant
   Fixed: multiple responses, Android, lock/unlock, CORS
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
      position: fixed; top: 80px; right: 20px; z-index: 999999;
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      cursor: pointer; user-select: none; touch-action: none;
    }
    #ariaRoot:not(.dragging) { animation: ariaFloat 3.5s ease-in-out infinite; }
    @keyframes ariaFloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }

    #ariaBubble {
      width: 64px; height: 64px;
      background: rgba(5,8,20,0.95); border: 2px solid #00f0ff; border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 20px rgba(0,240,255,0.35), 0 6px 28px rgba(0,0,0,0.8);
      backdrop-filter: blur(14px); position: relative;
      transition: box-shadow 0.25s, transform 0.25s;
    }
    #ariaBubble::after {
      content:''; position:absolute; inset:-4px; border-radius:24px;
      border:1px solid rgba(0,240,255,0.15);
      animation:ariaRing 2.5s ease-in-out infinite;
    }
    @keyframes ariaRing{0%,100%{transform:scale(1);opacity:.5;}50%{transform:scale(1.08);opacity:.15;}}
    #ariaRoot:not(.dragging):hover #ariaBubble {
      box-shadow:0 0 36px rgba(0,240,255,0.6),0 8px 36px rgba(0,0,0,0.9);
      transform:scale(1.07);
    }
    #ariaTag {
      font-family:'Orbitron',monospace; font-size:9px; font-weight:700;
      color:#00f0ff; letter-spacing:2.5px; pointer-events:none;
    }
    #ariaEyeL,#ariaEyeR{animation:eyeBlink 4s ease-in-out infinite;}
    #ariaEyeR{animation-delay:.1s;}
    @keyframes eyeBlink{0%,90%,100%{transform:scaleY(1);}95%{transform:scaleY(.1);}}

    #ariaNotif {
      position:absolute; top:-5px; right:-5px;
      width:14px; height:14px; background:#ff4444;
      border-radius:50%; border:2px solid #050814;
      box-shadow:0 0 8px #ff4444; display:none;
    }
    #ariaNotif.show{display:block;}

    /* ── Modal overlay ── */
    #ariaModal {
      position:fixed; inset:0; z-index:999998;
      display:flex; align-items:center; justify-content:center;
      background:rgba(0,0,0,0.75); backdrop-filter:blur(6px);
      opacity:0; pointer-events:none; transition:opacity .3s ease;
      font-family:'Rajdhani',sans-serif;
    }
    #ariaModal.open { opacity:1; pointer-events:all; }

    #ariaWindow {
      width:min(600px,95vw); height:min(700px,90vh);
      background:rgba(4,7,18,0.98);
      border:1.5px solid rgba(0,240,255,0.4); border-radius:20px;
      display:flex; flex-direction:column; overflow:hidden;
      box-shadow:0 0 60px rgba(0,240,255,0.15),0 30px 80px rgba(0,0,0,0.9);
      transform:scale(0.9) translateY(20px);
      transition:transform .35s cubic-bezier(0.34,1.56,0.64,1);
      position:relative;
    }
    #ariaModal.open #ariaWindow { transform:scale(1) translateY(0); }
    #ariaWindow::before {
      content:''; position:absolute; inset:0; pointer-events:none;
      border-radius:20px; z-index:0;
      background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,240,255,.015) 2px,rgba(0,240,255,.015) 4px);
    }

    /* Header */
    #ariaHeader {
      display:flex; align-items:center; gap:14px; padding:16px 20px;
      border-bottom:1px solid rgba(0,240,255,.12);
      background:rgba(0,240,255,.03); position:relative; z-index:1; flex-shrink:0;
    }
    #ariaAvatar {
      width:44px; height:44px; background:rgba(0,240,255,.08);
      border:1.5px solid rgba(0,240,255,.3); border-radius:14px;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    #ariaInfo { flex:1; }
    #ariaName {
      font-family:'Orbitron',monospace; font-size:12px;
      font-weight:700; color:#00f0ff; letter-spacing:1px;
    }
    #ariaSub {
      font-size:12px; color:rgba(0,240,255,.5);
      display:flex; align-items:center; gap:6px; margin-top:2px;
    }
    #ariaStatusDot {
      width:7px; height:7px; border-radius:50%;
      background:#00ff88; box-shadow:0 0 6px #00ff88;
      animation:pulse 1.8s ease-in-out infinite; flex-shrink:0;
    }
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}
    #ariaCloseBtn {
      width:34px; height:34px; background:rgba(255,255,255,.04);
      border:1px solid rgba(255,255,255,.1); border-radius:10px;
      color:rgba(200,210,230,.6); font-size:16px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .2s; flex-shrink:0;
    }
    #ariaCloseBtn:hover{background:rgba(255,60,60,.15);border-color:rgba(255,60,60,.3);color:#ff6060;}

    /* Chat */
    #ariaChatArea {
      flex:1; overflow-y:auto; padding:18px 20px;
      display:flex; flex-direction:column; gap:12px;
      position:relative; z-index:1;
      scrollbar-width:thin; scrollbar-color:rgba(0,240,255,.2) transparent;
      -webkit-overflow-scrolling: touch;
    }
    #ariaChatArea::-webkit-scrollbar{width:4px;}
    #ariaChatArea::-webkit-scrollbar-thumb{background:rgba(0,240,255,.2);border-radius:4px;}

    .amsg{display:flex;flex-direction:column;max-width:82%;animation:msgIn .3s ease both;}
    @keyframes msgIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    .amsg.bot{align-self:flex-start;}
    .amsg.user{align-self:flex-end;}
    .amsg-bubble{padding:10px 15px;border-radius:16px;font-size:14px;line-height:1.6;}
    .amsg.bot .amsg-bubble{
      background:rgba(0,240,255,.07);border:1px solid rgba(0,240,255,.18);
      color:#c8dde8;border-bottom-left-radius:4px;
    }
    .amsg.user .amsg-bubble{
      background:rgba(255,112,67,.12);border:1px solid rgba(255,112,67,.25);
      color:#ffd0bb;border-bottom-right-radius:4px;
    }
    .amsg-time{font-size:10px;color:rgba(150,170,190,.4);margin-top:3px;font-family:monospace;}
    .amsg.user .amsg-time{text-align:right;}

    .aria-typing{
      display:flex;align-items:center;gap:5px;padding:12px 16px;
      background:rgba(0,240,255,.07);border:1px solid rgba(0,240,255,.18);
      border-radius:16px;border-bottom-left-radius:4px;
      align-self:flex-start;
    }
    .aria-typing span{
      width:7px;height:7px;border-radius:50%;background:#00f0ff;
      animation:tdot 1.3s ease-in-out infinite;display:inline-block;
    }
    .aria-typing span:nth-child(2){animation-delay:.18s;}
    .aria-typing span:nth-child(3){animation-delay:.36s;}
    @keyframes tdot{0%,60%,100%{transform:translateY(0);opacity:.35;}30%{transform:translateY(-6px);opacity:1;}}

    /* Example questions */
    #ariaExamples{position:relative;z-index:1;padding:0 20px 12px;flex-shrink:0;}
    #ariaExamplesLabel{
      font-size:10px;color:rgba(0,240,255,.4);letter-spacing:1px;
      text-transform:uppercase;margin-bottom:7px;font-family:'Orbitron',monospace;
    }
    #ariaExamplesGrid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
    .aex{
      padding:8px 11px;background:rgba(0,240,255,.05);
      border:1px solid rgba(0,240,255,.18);border-radius:10px;
      font-size:12px;color:rgba(0,240,255,.75);cursor:pointer;
      transition:all .2s;line-height:1.4;font-family:'Rajdhani',sans-serif;
      text-align:left; -webkit-tap-highlight-color:transparent;
    }
    .aex:hover,.aex:active{background:rgba(0,240,255,.13);border-color:rgba(0,240,255,.45);color:#00f0ff;}
    .aex:disabled{opacity:.4;cursor:not-allowed;}

    /* Voice bar */
    #ariaVoiceBar{
      position:relative;z-index:1;text-align:center;padding:5px 0 8px;
      font-size:11px;color:rgba(0,240,255,.4);font-family:monospace;
      display:none;flex-shrink:0;
    }
    #ariaVoiceBar.show{display:block;}
    #ariaVoiceBar.speak{color:rgba(0,255,136,.7);}

    /* Input */
    #ariaInputArea{
      position:relative;z-index:1;padding:12px 16px;
      border-top:1px solid rgba(0,240,255,.1);background:rgba(0,240,255,.02);
      display:flex;align-items:center;gap:8px;flex-shrink:0;
    }
    #ariaMicBtn{
      width:46px;height:46px;min-width:46px;border-radius:50%;
      border:2px solid rgba(0,240,255,.5);background:rgba(0,240,255,.07);
      color:#00f0ff;display:flex;align-items:center;justify-content:center;
      cursor:pointer;transition:all .2s;flex-shrink:0;
      -webkit-tap-highlight-color:transparent;
    }
    #ariaMicBtn:hover{background:rgba(0,240,255,.15);box-shadow:0 0 18px rgba(0,240,255,.4);}
    #ariaMicBtn.listening{
      background:rgba(255,68,68,.15)!important;border-color:#ff4444!important;
      color:#ff4444!important;box-shadow:0 0 22px rgba(255,68,68,.5)!important;
      animation:micPulse .85s ease-in-out infinite;
    }
    #ariaMicBtn:disabled{opacity:.4;cursor:not-allowed;}
    @keyframes micPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.13);}}
    #ariaInput{
      flex:1;background:rgba(255,255,255,.04);
      border:1px solid rgba(0,240,255,.2);border-radius:12px;
      padding:11px 15px;color:#c8dde8;font-size:14px;
      font-family:'Rajdhani',sans-serif;outline:none;
      transition:border-color .2s,box-shadow .2s;
      -webkit-appearance:none;
    }
    #ariaInput::placeholder{color:rgba(0,240,255,.3);}
    #ariaInput:focus{border-color:rgba(0,240,255,.5);box-shadow:0 0 12px rgba(0,240,255,.1);}
    #ariaInput:disabled{opacity:.5;}
    #ariaSendBtn{
      width:46px;height:46px;min-width:46px;border-radius:50%;
      border:2px solid rgba(0,240,255,.5);background:rgba(0,240,255,.1);
      color:#00f0ff;display:flex;align-items:center;justify-content:center;
      cursor:pointer;transition:all .2s;flex-shrink:0;
      -webkit-tap-highlight-color:transparent;
    }
    #ariaSendBtn:hover{background:rgba(0,240,255,.25);box-shadow:0 0 18px rgba(0,240,255,.4);}
    #ariaSendBtn:disabled{opacity:.4;cursor:not-allowed;}

    @media(max-width:480px){
      #ariaWindow{border-radius:16px;}
      #ariaExamplesGrid{grid-template-columns:1fr;}
      .amsg{max-width:88%;}
      #ariaRoot{top:70px;right:10px;}
      .amsg-bubble{font-size:13px;}
    }
  `;
  document.head.appendChild(styleEl);

  /* ══════════════════════════════════════════════════════════════
     SVG
  ══════════════════════════════════════════════════════════════ */
  const bigBot = `<svg width="36" height="36" viewBox="0 0 64 64" fill="none">
    <line x1="32" y1="5" x2="32" y2="13" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="32" cy="4" r="3" fill="#00f0ff"/>
    <rect x="10" y="13" width="44" height="30" rx="9" fill="#060d1f" stroke="#00f0ff" stroke-width="1.8"/>
    <g id="ariaEyeL"><ellipse cx="22" cy="27" rx="5.5" ry="5.5" fill="rgba(0,240,255,.12)"/>
    <ellipse cx="22" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
    <ellipse cx="23.2" cy="25.8" rx="1.2" ry="1.2" fill="white" opacity=".7"/></g>
    <g id="ariaEyeR"><ellipse cx="42" cy="27" rx="5.5" ry="5.5" fill="rgba(0,240,255,.12)"/>
    <ellipse cx="42" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
    <ellipse cx="43.2" cy="25.8" rx="1.2" ry="1.2" fill="white" opacity=".7"/></g>
    <rect x="22" y="35" width="20" height="4" rx="2" fill="#00f0ff" opacity=".55"/>
    <rect x="5" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity=".45"/>
    <rect x="54" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity=".45"/>
  </svg>`;

  const smallBot = `<svg width="26" height="26" viewBox="0 0 64 64" fill="none">
    <line x1="32" y1="5" x2="32" y2="13" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="32" cy="4" r="3" fill="#00f0ff"/>
    <rect x="10" y="13" width="44" height="30" rx="9" fill="#060d1f" stroke="#00f0ff" stroke-width="1.8"/>
    <ellipse cx="22" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
    <ellipse cx="42" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
    <rect x="22" y="35" width="20" height="4" rx="2" fill="#00f0ff" opacity=".55"/>
    <rect x="5" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity=".45"/>
    <rect x="54" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity=".45"/>
  </svg>`;

  /* ══════════════════════════════════════════════════════════════
     DOM
  ══════════════════════════════════════════════════════════════ */
  const root = document.createElement('div');
  root.id = 'ariaRoot';
  root.innerHTML = `<div id="ariaBubble">${bigBot}<div id="ariaNotif"></div></div><span id="ariaTag">ARIA</span>`;
  document.body.appendChild(root);

  const modal = document.createElement('div');
  modal.id = 'ariaModal';
  modal.innerHTML = `
    <div id="ariaWindow">
      <div id="ariaHeader">
        <div id="ariaAvatar">${smallBot}</div>
        <div id="ariaInfo">
          <div id="ariaName">ARIA — AI Portfolio Assistant</div>
          <div id="ariaSub"><div id="ariaStatusDot"></div><span id="ariaStatusTxt">Online &amp; ready</span></div>
        </div>
        <button id="ariaCloseBtn" aria-label="Close">✕</button>
      </div>
      <div id="ariaChatArea"></div>
      <div id="ariaExamples">
        <div id="ariaExamplesLabel">Try asking</div>
        <div id="ariaExamplesGrid">
          <button class="aex">🎮 Tell me about his games</button>
          <button class="aex">🛠️ What are his skills?</button>
          <button class="aex">🎯 What is his dream goal?</button>
          <button class="aex">📩 How do I contact him?</button>
          <button class="aex">🖥️ His Unreal Engine work</button>
          <button class="aex">🤖 What is the ARIA project?</button>
          <button class="aex">🎓 His education background</button>
          <button class="aex">🌟 Why should I hire him?</button>
        </div>
      </div>
      <div id="ariaVoiceBar"></div>
      <div id="ariaInputArea">
        <button id="ariaMicBtn" aria-label="Voice input">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="9" y="2" width="6" height="11" rx="3"/>
            <path d="M5 10a7 7 0 0 0 14 0"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <input id="ariaInput" type="text" placeholder="Ask me anything about Mohak..." autocomplete="off" autocorrect="off" autocapitalize="off"/>
        <button id="ariaSendBtn" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  /* ── Refs ── */
  const chatArea   = document.getElementById('ariaChatArea');
  const examples   = document.getElementById('ariaExamples');
  const micBtn     = document.getElementById('ariaMicBtn');
  const input      = document.getElementById('ariaInput');
  const sendBtn    = document.getElementById('ariaSendBtn');
  const voiceBar   = document.getElementById('ariaVoiceBar');
  const statusTxt  = document.getElementById('ariaStatusTxt');
  const notifDot   = document.getElementById('ariaNotif');
  const closeBtn   = document.getElementById('ariaCloseBtn');

  /* ══════════════════════════════════════════════════════════════
     DRAG (mouse + touch)
  ══════════════════════════════════════════════════════════════ */
  let dragging = false, moved = false;
  let sx = 0, sy = 0, rx = 0, ry = 0;

  function onDown(e) {
    const p = e.touches ? e.touches[0] : e;
    sx = p.clientX; sy = p.clientY;
    const r = root.getBoundingClientRect();
    rx = r.left; ry = r.top;
    dragging = true; moved = false;
    root.classList.add('dragging');
    root.style.animation = 'none';
    e.preventDefault();
  }
  function onMove(e) {
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - sx, dy = p.clientY - sy;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
    if (!moved) return;
    const x = Math.max(8, Math.min(window.innerWidth - root.offsetWidth - 8, rx + dx));
    const y = Math.max(8, Math.min(window.innerHeight - root.offsetHeight - 8, ry + dy));
    root.style.cssText += `left:${x}px;top:${y}px;right:auto;bottom:auto;`;
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('dragging');
    root.style.animation = '';
    if (!moved) openModal();
  }

  root.addEventListener('mousedown', onDown);
  root.addEventListener('touchstart', onDown, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchend', onUp);

  /* ══════════════════════════════════════════════════════════════
     MODAL
  ══════════════════════════════════════════════════════════════ */
  let opened = false;

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function getGreeting() {
    const h = new Date().getHours();
    const t = h < 12 ? '☀️ Good morning' : h < 17 ? '🌤️ Good afternoon' : h < 21 ? '🌆 Good evening' : '🌙 Good night';
    return `${t}! I'm <strong>ARIA</strong>, Mohak's AI portfolio assistant powered by Llama 3.3. Ask me anything about his work, skills, or how to get in touch!`;
  }

  function openModal() {
    modal.classList.add('open');
    notifDot.classList.remove('show');
    if (!opened) {
      opened = true;
      setTimeout(() => addBot(getGreeting()), 400);
    }
    setTimeout(() => input.focus(), 300);
  }
  function closeModal() { modal.classList.remove('open'); }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  setTimeout(() => { if (!opened) notifDot.classList.add('show'); }, 3000);

  /* ══════════════════════════════════════════════════════════════
     MESSAGES
  ══════════════════════════════════════════════════════════════ */
  function addBot(html) {
    if (chatArea.children.length > 0) examples.style.display = 'none';
    const d = document.createElement('div');
    d.className = 'amsg bot';
    d.innerHTML = `<div class="amsg-bubble">${html}</div><div class="amsg-time">ARIA · ${getTime()}</div>`;
    chatArea.appendChild(d);
    chatArea.scrollTop = chatArea.scrollHeight;
  }
  function addUser(text) {
    examples.style.display = 'none';
    const d = document.createElement('div');
    d.className = 'amsg user';
    d.innerHTML = `<div class="amsg-bubble">${text.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div><div class="amsg-time">You · ${getTime()}</div>`;
    chatArea.appendChild(d);
    chatArea.scrollTop = chatArea.scrollHeight;
  }
  function showTyping() {
    const t = document.createElement('div');
    t.className = 'aria-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    chatArea.appendChild(t);
    chatArea.scrollTop = chatArea.scrollHeight;
    return t;
  }

  /* ══════════════════════════════════════════════════════════════
     LOCK / UNLOCK — single source of truth
  ══════════════════════════════════════════════════════════════ */
  let busy = false;
  let offTopicCount = 0;

  function lock() {
    busy = true;
    input.disabled = true;
    sendBtn.disabled = true;
    micBtn.disabled = true;
    statusTxt.textContent = 'Thinking...';
    document.querySelectorAll('.aex').forEach(b => { b.disabled = true; });
  }
  function unlock() {
    busy = false;
    input.disabled = false;
    sendBtn.disabled = false;
    micBtn.disabled = false;
    statusTxt.textContent = 'Online & ready';
    document.querySelectorAll('.aex').forEach(b => { b.disabled = false; });
  }

  /* ══════════════════════════════════════════════════════════════
     PROCESS INPUT — single entry point for ALL input types
  ══════════════════════════════════════════════════════════════ */
  async function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;

    lock();
    addUser(text);
    input.value = '';
    const typing = showTyping();

    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, offTopicCount }),
      });

      typing.remove();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "I'm having a moment — please try again!";

      if (data.isOffTopic) offTopicCount = Math.min(offTopicCount + 1, 10);
      else offTopicCount = 0;

      addBot(reply);
      speak(reply);

    } catch (err) {
      typing.remove();
      console.error('ARIA error:', err.message);
      addBot(`Hmm, I couldn't connect to my backend. Please make sure you're on the live GitHub Pages site, not a local file.`);
    }

    unlock();
  }

  /* ── Wire up ALL input methods ── */

  // 1. Send button
  sendBtn.addEventListener('click', () => send(input.value));

  // 2. Enter key
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); }
  });

  // 3. Example buttons — strip emojis safely
  document.querySelectorAll('.aex').forEach(btn => {
    btn.addEventListener('click', function () {
      if (busy) return; // guard here too
      // Strip emojis using unicode range
      const q = this.textContent.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27FF}]/gu, '').trim();
      openModal();
      // Small delay to let modal open, but don't re-fire if already busy
      setTimeout(() => send(q), 200);
    });
  });

  /* ══════════════════════════════════════════════════════════════
     SPEECH SYNTHESIS — female voice, cached
  ══════════════════════════════════════════════════════════════ */
  let cachedVoice = null;

  function getFemaleVoice() {
    if (cachedVoice) return cachedVoice;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const priority = [
      'Microsoft Aria Online', 'Microsoft Aria',
      'Microsoft Jenny Online', 'Microsoft Jenny',
      'Microsoft Zira', 'Google UK English Female',
      'Samantha', 'Victoria', 'Karen', 'Moira', 'Fiona'
    ];
    for (const n of priority) {
      const v = voices.find(v => v.name.includes(n));
      if (v) { cachedVoice = v; return v; }
    }
    cachedVoice = voices.find(v => /female/i.test(v.name))
               || voices.find(v => v.lang === 'en-GB')
               || voices.find(v => v.lang && v.lang.startsWith('en'))
               || null;
    return cachedVoice;
  }

  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.addEventListener('voiceschanged', () => { cachedVoice = null; getFemaleVoice(); }, { once: true });
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    const clean = text.replace(/<[^>]+>/g, '').substring(0, 250);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 1.05; utt.pitch = 1.15; utt.volume = 1;
    const v = getFemaleVoice();
    if (v) utt.voice = v;
    utt.onstart = () => { voiceBar.textContent = '🔊 Speaking...'; voiceBar.className = 'show speak'; statusTxt.textContent = 'Speaking'; };
    utt.onend   = () => { voiceBar.className = ''; statusTxt.textContent = 'Online & ready'; };
    speechSynthesis.speak(utt);
  }

  /* ══════════════════════════════════════════════════════════════
     SPEECH RECOGNITION — Chrome/Edge/Android Chrome
  ══════════════════════════════════════════════════════════════ */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    micBtn.style.opacity = '0.4';
    micBtn.disabled = true;
    micBtn.title = 'Voice not supported. Use Chrome or Edge.';
  } else {
    const recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false;
    let listening = false;
    let permAsked = false;

    micBtn.addEventListener('click', () => {
      if (busy) return;
      if (listening) { recog.stop(); return; }
      if (!permAsked) {
        permAsked = true;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(s => { s.getTracks().forEach(t => t.stop()); recog.start(); })
            .catch(() => recog.start());
        } else {
          recog.start();
        }
      } else {
        recog.start();
      }
    });

    recog.onstart = () => {
      listening = true;
      micBtn.classList.add('listening');
      voiceBar.textContent = '🎤 Listening...';
      voiceBar.className = 'show';
      statusTxt.textContent = 'Listening...';
    };
    recog.onend = () => {
      listening = false;
      micBtn.classList.remove('listening');
      if (!voiceBar.classList.contains('speak')) {
        voiceBar.className = '';
        statusTxt.textContent = 'Online & ready';
      }
    };
    recog.onerror = e => {
      listening = false;
      micBtn.classList.remove('listening');
      voiceBar.className = '';
      if (e.error === 'not-allowed') {
        addBot('Microphone access denied. Please allow mic permissions in your browser settings and try again.');
      }
    };
    recog.onresult = e => {
      const said = e.results[0][0].transcript.trim();
      if (said) send(said);
    };
  }

})();