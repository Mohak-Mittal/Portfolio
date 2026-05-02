/* ================================================================
   ARIA v5.0 — Mohak Mittal's Portfolio Assistant
   - Full redesign: glassmorphism + cyberpunk premium UI
   - Mobile-first, Android optimized
   - Fixed: keyboard pushes chat up on mobile
   - Fixed: touch drag vs tap detection
   - Fixed: speech synthesis on Android Chrome
   - Fixed: modal fullscreen on small screens
   ================================================================ */

(function () {
  'use strict';

  const WORKER_URL = 'https://white-paper-62ef.mittalmohak0.workers.dev';

  /* ══════════════════════════════════════════════════════════════
     STYLES
  ══════════════════════════════════════════════════════════════ */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600&display=swap');

    #ariaRoot *, #ariaModal * { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Floating Button ── */
    #ariaRoot {
      position: fixed;
      bottom: 28px;
      right: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
      touch-action: manipulation;
    }

    #ariaBubble {
      width: 62px;
      height: 62px;
      background: linear-gradient(135deg, rgba(0,12,30,0.97) 0%, rgba(0,20,45,0.97) 100%);
      border: 1.5px solid rgba(0,240,255,0.7);
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: visible;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
      box-shadow:
        0 0 0 1px rgba(0,240,255,0.12),
        0 0 20px rgba(0,240,255,0.25),
        0 8px 32px rgba(0,0,0,0.7),
        inset 0 1px 0 rgba(0,240,255,0.15);
      animation: ariaFloat 4s ease-in-out infinite;
    }

    #ariaBubble:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow:
        0 0 0 1px rgba(0,240,255,0.2),
        0 0 35px rgba(0,240,255,0.45),
        0 12px 40px rgba(0,0,0,0.8),
        inset 0 1px 0 rgba(0,240,255,0.2);
    }

    #ariaBubble:active { transform: scale(0.95); }

    /* Outer glow ring */
    #ariaBubble::before {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 28px;
      border: 1px solid rgba(0,240,255,0.18);
      animation: ariaRingPulse 3s ease-in-out infinite;
      pointer-events: none;
    }
    /* Inner shine */
    #ariaBubble::after {
      content: '';
      position: absolute;
      top: 6px; left: 8px; right: 8px;
      height: 30%;
      background: linear-gradient(180deg, rgba(0,240,255,0.12) 0%, transparent 100%);
      border-radius: 10px 10px 0 0;
      pointer-events: none;
    }

    @keyframes ariaFloat {
      0%,100% { transform: translateY(0px); }
      50% { transform: translateY(-7px); }
    }
    @keyframes ariaRingPulse {
      0%,100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 0.15; transform: scale(1.06); }
    }

    #ariaTag {
      font-family: 'Orbitron', monospace;
      font-size: 8.5px;
      font-weight: 700;
      color: rgba(0,240,255,0.85);
      letter-spacing: 3px;
      text-shadow: 0 0 10px rgba(0,240,255,0.5);
      pointer-events: none;
    }

    /* Notification dot */
    #ariaNotif {
      position: absolute;
      top: -4px; right: -4px;
      width: 16px; height: 16px;
      background: linear-gradient(135deg, #ff4444, #ff6b6b);
      border-radius: 50%;
      border: 2px solid rgba(0,8,20,1);
      box-shadow: 0 0 10px rgba(255,68,68,0.7);
      display: none;
      animation: notifBounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    #ariaNotif.show { display: block; }
    @keyframes notifBounce { from { transform: scale(0) rotate(-15deg); } to { transform: scale(1) rotate(0); } }

    /* Eye animations */
    #ariaEyeL, #ariaEyeR { animation: ariaEyeBlink 5s ease-in-out infinite; }
    #ariaEyeR { animation-delay: 0.08s; }
    @keyframes ariaEyeBlink {
      0%,88%,100% { transform: scaleY(1); }
      94% { transform: scaleY(0.08); }
    }

    /* ── Modal Overlay ── */
    #ariaModal {
      position: fixed;
      inset: 0;
      z-index: 999998;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      background: rgba(0,0,0,0);
      backdrop-filter: blur(0px);
      pointer-events: none;
      transition: background 0.3s ease, backdrop-filter 0.3s ease;
      font-family: 'Rajdhani', sans-serif;
    }
    #ariaModal.aria-show {
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      pointer-events: all;
    }

    /* ── Chat Window ── */
    #ariaWindow {
      width: 100%;
      max-width: 480px;
      height: 85vh;
      max-height: 700px;
      background: rgba(3,6,18,0.98);
      border: 1px solid rgba(0,240,255,0.25);
      border-bottom: none;
      border-radius: 28px 28px 0 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(0,240,255,0.06),
        0 -20px 60px rgba(0,240,255,0.08),
        0 -40px 100px rgba(0,0,0,0.9);
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.32,0.72,0,1);
      position: relative;
    }
    #ariaModal.aria-show #ariaWindow {
      transform: translateY(0);
    }

    /* Scanlines overlay */
    #ariaWindow::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: 28px 28px 0 0;
      z-index: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 3px,
        rgba(0,240,255,0.008) 3px,
        rgba(0,240,255,0.008) 4px
      );
    }

    /* Top drag handle */
    #ariaHandle {
      width: 36px; height: 4px;
      background: rgba(0,240,255,0.2);
      border-radius: 2px;
      margin: 10px auto 0;
      flex-shrink: 0;
    }

    /* ── Header ── */
    #ariaHeader {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px 16px;
      border-bottom: 1px solid rgba(0,240,255,0.1);
      background: linear-gradient(180deg, rgba(0,240,255,0.04) 0%, transparent 100%);
      position: relative;
      z-index: 1;
      flex-shrink: 0;
    }

    #ariaHeaderAvatar {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, rgba(0,30,60,0.9), rgba(0,15,35,0.9));
      border: 1.5px solid rgba(0,240,255,0.35);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 0 14px rgba(0,240,255,0.15), inset 0 1px 0 rgba(0,240,255,0.1);
    }

    #ariaHeaderInfo { flex: 1; min-width: 0; }

    #ariaHeaderName {
      font-family: 'Orbitron', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #00f0ff;
      letter-spacing: 0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    #ariaHeaderSub {
      font-size: 12px;
      color: rgba(0,200,220,0.5);
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
      font-family: 'Rajdhani', sans-serif;
    }

    #ariaOnlineDot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #00ff88;
      box-shadow: 0 0 6px #00ff88;
      flex-shrink: 0;
      animation: statusPulse 2s ease-in-out infinite;
    }
    #ariaOnlineDot.thinking { background: #ffaa00; box-shadow: 0 0 6px #ffaa00; }
    #ariaOnlineDot.speaking { background: #00aaff; box-shadow: 0 0 6px #00aaff; }
    @keyframes statusPulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }

    #ariaCloseBtn {
      width: 32px; height: 32px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      color: rgba(180,200,220,0.5);
      font-size: 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    #ariaCloseBtn:hover, #ariaCloseBtn:active {
      background: rgba(255,60,60,0.15);
      border-color: rgba(255,60,60,0.3);
      color: #ff6060;
    }

    /* ── Chat Area ── */
    #ariaChatArea {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      z-index: 1;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: rgba(0,240,255,0.15) transparent;
      overscroll-behavior: contain;
    }
    #ariaChatArea::-webkit-scrollbar { width: 3px; }
    #ariaChatArea::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); border-radius: 3px; }

    /* Messages */
    .amsg {
      display: flex;
      flex-direction: column;
      max-width: 85%;
      animation: msgIn 0.28s cubic-bezier(0.34,1.2,0.64,1) both;
    }
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .amsg.bot  { align-self: flex-start; }
    .amsg.user { align-self: flex-end; }

    .amsg-bubble {
      padding: 10px 15px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.65;
      word-break: break-word;
    }
    .amsg.bot .amsg-bubble {
      background: linear-gradient(135deg, rgba(0,240,255,0.07) 0%, rgba(0,180,220,0.05) 100%);
      border: 1px solid rgba(0,240,255,0.16);
      color: #cce8f0;
      border-bottom-left-radius: 5px;
      box-shadow: 0 2px 12px rgba(0,240,255,0.05);
    }
    .amsg.user .amsg-bubble {
      background: linear-gradient(135deg, rgba(255,100,50,0.14) 0%, rgba(255,140,80,0.08) 100%);
      border: 1px solid rgba(255,120,60,0.22);
      color: #ffd5bb;
      border-bottom-right-radius: 5px;
      box-shadow: 0 2px 12px rgba(255,100,50,0.05);
    }

    .amsg-meta {
      font-size: 10px;
      color: rgba(140,165,185,0.35);
      margin-top: 5px;
      font-family: monospace;
      letter-spacing: 0.3px;
    }
    .amsg.user .amsg-meta { text-align: right; }

    /* Typing indicator */
    .aria-typing {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 13px 17px;
      background: rgba(0,240,255,0.06);
      border: 1px solid rgba(0,240,255,0.14);
      border-radius: 18px;
      border-bottom-left-radius: 5px;
      align-self: flex-start;
      width: fit-content;
    }
    .aria-typing span {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #00f0ff;
      opacity: 0.4;
      animation: typingDot 1.2s ease-in-out infinite;
    }
    .aria-typing span:nth-child(2) { animation-delay: 0.16s; }
    .aria-typing span:nth-child(3) { animation-delay: 0.32s; }
    @keyframes typingDot {
      0%,60%,100% { transform: translateY(0); opacity: 0.35; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* ── Quick Questions ── */
    #ariaExamples {
      position: relative;
      z-index: 1;
      padding: 0 18px 12px;
      flex-shrink: 0;
    }
    #ariaExamplesLabel {
      font-size: 10px;
      color: rgba(0,240,255,0.35);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-family: 'Orbitron', monospace;
    }
    #ariaExamplesGrid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .aexample {
      padding: 7px 12px;
      background: rgba(0,240,255,0.04);
      border: 1px solid rgba(0,240,255,0.15);
      border-radius: 20px;
      font-size: 12px;
      color: rgba(0,220,240,0.7);
      cursor: pointer;
      transition: all 0.18s ease;
      font-family: 'Rajdhani', sans-serif;
      font-weight: 500;
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
      line-height: 1.3;
    }
    .aexample:hover, .aexample:active {
      background: rgba(0,240,255,0.1);
      border-color: rgba(0,240,255,0.4);
      color: #00f0ff;
      transform: translateY(-1px);
    }
    .aexample:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

    /* ── Voice Status Bar ── */
    #ariaVoiceBar {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 4px 0 8px;
      font-size: 11.5px;
      color: rgba(0,240,255,0.4);
      font-family: monospace;
      letter-spacing: 0.5px;
      display: none;
      flex-shrink: 0;
    }
    #ariaVoiceBar.show { display: block; }
    #ariaVoiceBar.speaking { color: rgba(0,200,255,0.65); }

    /* ── Input Area ── */
    #ariaInputArea {
      position: relative;
      z-index: 1;
      padding: 12px 14px;
      padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));
      border-top: 1px solid rgba(0,240,255,0.08);
      background: linear-gradient(0deg, rgba(0,240,255,0.025) 0%, transparent 100%);
      display: flex;
      align-items: center;
      gap: 9px;
      flex-shrink: 0;
    }

    #ariaMicBtn, #ariaSendBtn {
      width: 44px; height: 44px;
      min-width: 44px;
      border-radius: 14px;
      border: 1.5px solid rgba(0,240,255,0.3);
      background: rgba(0,240,255,0.06);
      color: #00f0ff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }
    #ariaMicBtn:hover, #ariaSendBtn:hover {
      background: rgba(0,240,255,0.14);
      border-color: rgba(0,240,255,0.55);
      box-shadow: 0 0 14px rgba(0,240,255,0.25);
    }
    #ariaMicBtn:active, #ariaSendBtn:active { transform: scale(0.93); }
    #ariaMicBtn:disabled, #ariaSendBtn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

    #ariaMicBtn.listening {
      background: rgba(255,60,60,0.14) !important;
      border-color: rgba(255,60,60,0.5) !important;
      color: #ff5555 !important;
      box-shadow: 0 0 18px rgba(255,60,60,0.3) !important;
      animation: micListen 0.9s ease-in-out infinite;
    }
    @keyframes micListen {
      0%,100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    #ariaSendBtn {
      background: linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,180,220,0.08));
      border-color: rgba(0,240,255,0.4);
    }
    #ariaSendBtn:not(:disabled):hover {
      background: linear-gradient(135deg, rgba(0,240,255,0.22), rgba(0,180,220,0.15));
    }

    #ariaTextInput {
      flex: 1;
      min-width: 0;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(0,240,255,0.18);
      border-radius: 14px;
      padding: 11px 16px;
      color: #cce8f0;
      font-size: 14px;
      font-family: 'Rajdhani', sans-serif;
      font-weight: 500;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      -webkit-appearance: none;
      appearance: none;
    }
    #ariaTextInput::placeholder { color: rgba(0,200,220,0.28); }
    #ariaTextInput:focus {
      border-color: rgba(0,240,255,0.4);
      box-shadow: 0 0 0 3px rgba(0,240,255,0.06);
    }
    #ariaTextInput:disabled { opacity: 0.45; }

    /* ── Mobile tweaks ── */
    @media (max-width: 480px) {
      #ariaRoot { bottom: 20px; right: 16px; }
      #ariaWindow {
        height: 92vh;
        max-height: 92vh;
        border-radius: 22px 22px 0 0;
      }
      #ariaChatArea { padding: 14px 14px; }
      #ariaInputArea { padding: 10px 12px; padding-bottom: max(10px, env(safe-area-inset-bottom, 10px)); }
      .amsg { max-width: 90%; }
      #ariaExamplesGrid { gap: 5px; }
      .aexample { font-size: 11.5px; padding: 6px 11px; }
    }
  `;
  document.head.appendChild(styleEl);

  /* ══════════════════════════════════════════════════════════════
     SVGs
  ══════════════════════════════════════════════════════════════ */
  const robotSVG = `
    <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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

  const miniRobotSVG = `
    <svg width="26" height="26" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="32" y1="6" x2="32" y2="13" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="32" cy="4.5" r="2.8" fill="#00f0ff" opacity="0.9"/>
      <rect x="11" y="13" width="42" height="29" rx="9" fill="rgba(0,20,45,0.95)" stroke="#00f0ff" stroke-width="1.8"/>
      <circle cx="22" cy="27" r="3.5" fill="#00f0ff"/>
      <circle cx="42" cy="27" r="3.5" fill="#00f0ff"/>
      <rect x="22" y="35" width="20" height="3.5" rx="1.75" fill="#00f0ff" opacity="0.5"/>
      <rect x="5" y="22" width="6" height="12" rx="3" fill="#00f0ff" opacity="0.35"/>
      <rect x="53" y="22" width="6" height="12" rx="3" fill="#00f0ff" opacity="0.35"/>
    </svg>`;

  /* ══════════════════════════════════════════════════════════════
     BUILD DOM
  ══════════════════════════════════════════════════════════════ */

  // Floating button
  const root = document.createElement('div');
  root.id = 'ariaRoot';
  root.setAttribute('aria-label', 'Open ARIA chat assistant');
  root.setAttribute('role', 'button');
  root.setAttribute('tabindex', '0');
  root.innerHTML = `
    <div id="ariaBubble">
      ${robotSVG}
      <div id="ariaNotif"></div>
    </div>
    <span id="ariaTag">ARIA</span>`;
  document.body.appendChild(root);

  // Modal
  const modal = document.createElement('div');
  modal.id = 'ariaModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'ARIA Portfolio Assistant');
  modal.innerHTML = `
    <div id="ariaWindow">
      <div id="ariaHandle"></div>
      <div id="ariaHeader">
        <div id="ariaHeaderAvatar">${miniRobotSVG}</div>
        <div id="ariaHeaderInfo">
          <div id="ariaHeaderName">ARIA — Portfolio Assistant</div>
          <div id="ariaHeaderSub">
            <div id="ariaOnlineDot"></div>
            <span id="ariaStatusText">Online &amp; ready</span>
          </div>
        </div>
        <button id="ariaCloseBtn" aria-label="Close chat">✕</button>
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
      <div id="ariaVoiceBar"></d