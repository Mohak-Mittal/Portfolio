/* ================================================================
   ARIA v3.0 — Mohak Mittal's Portfolio Assistant
   • Draggable floating icon
   • Full chat modal with example questions
   • Time-aware greetings & farewells
   • Smart weighted NLP engine
   • Female voice | Web Speech API
   ================================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     STYLES
  ══════════════════════════════════════════════════════════════ */
  const css = `
    /* ── Reset inside ARIA ── */
    #ariaRoot *, #ariaModal * {
      box-sizing: border-box;
      margin: 0; padding: 0;
    }

    /* ── Floating Robot Button ── */
    #ariaRoot {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      cursor: grab;
      user-select: none;
      touch-action: none;
    }
    #ariaRoot.dragging { cursor: grabbing; }
    #ariaBubble {
      width: 64px;
      height: 64px;
      background: rgba(5, 8, 20, 0.95);
      border: 2px solid #00f0ff;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(0,240,255,0.35), 0 6px 28px rgba(0,0,0,0.8);
      backdrop-filter: blur(14px);
      transition: box-shadow 0.25s ease, transform 0.25s ease;
      position: relative;
      overflow: visible;
    }
    #ariaBubble::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 24px;
      border: 1px solid rgba(0,240,255,0.15);
      animation: ariaRing 2.5s ease-in-out infinite;
    }
    @keyframes ariaRing {
      0%,100% { transform: scale(1); opacity: 0.5; }
      50%      { transform: scale(1.08); opacity: 0.15; }
    }
    #ariaRoot:not(.dragging) #ariaBubble:hover {
      box-shadow: 0 0 36px rgba(0,240,255,0.6), 0 8px 36px rgba(0,0,0,0.9);
      transform: scale(1.07);
    }
    #ariaRobotSvg { pointer-events: none; }
    #ariaTag {
      font-family: 'Orbitron', monospace, sans-serif;
      font-size: 9px;
      font-weight: 700;
      color: #00f0ff;
      letter-spacing: 2.5px;
      text-shadow: 0 0 8px rgba(0,240,255,0.6);
      pointer-events: none;
    }
    /* Eye blink animation on robot */
    #ariaEyeL, #ariaEyeR {
      animation: ariaEyeBlink 4s ease-in-out infinite;
    }
    #ariaEyeR { animation-delay: 0.1s; }
    @keyframes ariaEyeBlink {
      0%,90%,100% { transform: scaleY(1); transform-origin: center; }
      95%          { transform: scaleY(0.1); transform-origin: center; }
    }
    /* Float animation (when not dragging) */
    #ariaRoot:not(.dragging) {
      animation: ariaFloat 3.5s ease-in-out infinite;
    }
    @keyframes ariaFloat {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }

    /* ── Notification dot ── */
    #ariaNotif {
      position: absolute;
      top: -5px; right: -5px;
      width: 14px; height: 14px;
      background: #ff4444;
      border-radius: 50%;
      border: 2px solid #050814;
      box-shadow: 0 0 8px #ff4444;
      display: none;
      animation: notifPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    #ariaNotif.show { display: block; }
    @keyframes notifPop {
      from { transform: scale(0); }
      to   { transform: scale(1); }
    }

    /* ══════════════════════════════════════════════
       FULL CHAT MODAL
    ══════════════════════════════════════════════ */
    #ariaModal {
      position: fixed;
      inset: 0;
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      font-family: 'Rajdhani', sans-serif;
    }
    #ariaModal.aria-show {
      opacity: 1;
      pointer-events: all;
    }
    #ariaWindow {
      width: min(600px, 95vw);
      height: min(700px, 90vh);
      background: rgba(4, 7, 18, 0.98);
      border: 1.5px solid rgba(0,240,255,0.4);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(0,240,255,0.08),
        0 0 60px rgba(0,240,255,0.15),
        0 30px 80px rgba(0,0,0,0.9);
      transform: scale(0.9) translateY(20px);
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      position: relative;
    }
    #ariaModal.aria-show #ariaWindow {
      transform: scale(1) translateY(0);
    }

    /* Scanline effect on modal */
    #ariaWindow::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,240,255,0.015) 2px,
        rgba(0,240,255,0.015) 4px
      );
      pointer-events: none;
      border-radius: 20px;
      z-index: 0;
    }

    /* Header */
    #ariaHeader {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px 22px;
      border-bottom: 1px solid rgba(0,240,255,0.12);
      background: rgba(0,240,255,0.03);
      position: relative;
      z-index: 1;
      flex-shrink: 0;
    }
    #ariaHeaderAvatar {
      width: 46px; height: 46px;
      background: rgba(0,240,255,0.08);
      border: 1.5px solid rgba(0,240,255,0.3);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #ariaHeaderInfo { flex: 1; }
    #ariaHeaderName {
      font-family: 'Orbitron', monospace, sans-serif;
      font-size: 13px; font-weight: 700;
      color: #00f0ff; letter-spacing: 1px;
    }
    #ariaHeaderSub {
      font-size: 12px;
      color: rgba(0,240,255,0.5);
      display: flex; align-items: center; gap: 6px;
      margin-top: 2px;
    }
    #ariaOnlineDot {
      width: 7px; height: 7px;
      border-radius: 50%; background: #00ff88;
      box-shadow: 0 0 6px #00ff88;
      animation: ariaPulse 1.8s ease-in-out infinite;
      flex-shrink: 0;
    }
    @keyframes ariaPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
    #ariaCloseBtn {
      width: 34px; height: 34px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: rgba(200,210,230,0.6);
      font-size: 16px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    #ariaCloseBtn:hover { background: rgba(255,60,60,0.15); border-color: rgba(255,60,60,0.3); color: #ff6060; }

    /* Chat area */
    #ariaChatArea {
      flex: 1;
      overflow-y: auto;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
      z-index: 1;
      scrollbar-width: thin;
      scrollbar-color: rgba(0,240,255,0.2) transparent;
    }
    #ariaChatArea::-webkit-scrollbar { width: 4px; }
    #ariaChatArea::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.2); border-radius: 4px; }

    /* Messages */
    .amsg {
      display: flex;
      flex-direction: column;
      max-width: 82%;
      animation: msgSlide 0.3s ease both;
    }
    @keyframes msgSlide {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .amsg.bot { align-self: flex-start; }
    .amsg.user { align-self: flex-end; }
    .amsg-bubble {
      padding: 11px 16px;
      border-radius: 16px;
      font-size: 14.5px;
      line-height: 1.6;
    }
    .amsg.bot .amsg-bubble {
      background: rgba(0,240,255,0.07);
      border: 1px solid rgba(0,240,255,0.18);
      color: #c8dde8;
      border-bottom-left-radius: 4px;
    }
    .amsg.user .amsg-bubble {
      background: rgba(255, 112, 67, 0.12);
      border: 1px solid rgba(255,112,67,0.25);
      color: #ffd0bb;
      border-bottom-right-radius: 4px;
    }
    .amsg-bubble strong { color: #00f0ff; }
    .amsg-bubble a { color: #00f0ff; text-decoration: underline; }
    .amsg-time {
      font-size: 10px;
      color: rgba(150,170,190,0.4);
      margin-top: 4px;
      font-family: monospace;
      letter-spacing: 0.5px;
    }
    .amsg.user .amsg-time { text-align: right; }

    /* Typing indicator */
    .aria-typing-bubble {
      display: flex; align-items: center; gap: 5px;
      padding: 14px 18px;
      background: rgba(0,240,255,0.07);
      border: 1px solid rgba(0,240,255,0.18);
      border-radius: 16px; border-bottom-left-radius: 4px;
      align-self: flex-start;
      max-width: 80px;
    }
    .aria-typing-bubble span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #00f0ff;
      animation: tdot 1.3s ease-in-out infinite;
    }
    .aria-typing-bubble span:nth-child(2) { animation-delay: 0.18s; }
    .aria-typing-bubble span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes tdot {
      0%,60%,100% { transform: translateY(0); opacity: 0.35; }
      30%          { transform: translateY(-6px); opacity: 1; }
    }

    /* ── Example questions grid (shown at start) ── */
    #ariaExamples {
      position: relative; z-index: 1;
      padding: 0 22px 14px;
      flex-shrink: 0;
    }
    #ariaExamplesLabel {
      font-size: 11px;
      color: rgba(0,240,255,0.4);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-family: 'Orbitron', monospace, sans-serif;
    }
    #ariaExamplesGrid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }
    .aexample {
      padding: 9px 12px;
      background: rgba(0,240,255,0.05);
      border: 1px solid rgba(0,240,255,0.18);
      border-radius: 10px;
      font-size: 12.5px;
      color: rgba(0,240,255,0.75);
      cursor: pointer;
      transition: all 0.2s;
      line-height: 1.4;
      font-family: 'Rajdhani', sans-serif;
    }
    .aexample:hover {
      background: rgba(0,240,255,0.12);
      border-color: rgba(0,240,255,0.45);
      color: #00f0ff;
      transform: translateY(-1px);
    }
    .aexample-icon { margin-right: 5px; font-size: 13px; }

    /* Divider */
    .aria-divider {
      display: flex; align-items: center; gap: 10px;
      margin: 4px 0;
    }
    .aria-divider::before, .aria-divider::after {
      content: ''; flex: 1;
      height: 1px; background: rgba(0,240,255,0.1);
    }
    .aria-divider span {
      font-size: 10px; color: rgba(0,240,255,0.3);
      font-family: monospace; letter-spacing: 1px;
      white-space: nowrap;
    }

    /* ── Input row ── */
    #ariaInputArea {
      position: relative;
      z-index: 1;
      padding: 14px 18px;
      border-top: 1px solid rgba(0,240,255,0.1);
      background: rgba(0,240,255,0.02);
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    #ariaMicBtn {
      width: 46px; height: 46px; min-width: 46px;
      border-radius: 50%;
      border: 2px solid rgba(0,240,255,0.5);
      background: rgba(0,240,255,0.07);
      color: #00f0ff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    #ariaMicBtn:hover {
      background: rgba(0,240,255,0.15);
      box-shadow: 0 0 18px rgba(0,240,255,0.4);
      border-color: #00f0ff;
    }
    #ariaMicBtn.listening {
      background: rgba(255,68,68,0.15) !important;
      border-color: #ff4444 !important;
      color: #ff4444 !important;
      box-shadow: 0 0 22px rgba(255,68,68,0.5) !important;
      animation: micPulse 0.85s ease-in-out infinite;
    }
    @keyframes micPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.13);} }

    #ariaTextInput {
      flex: 1;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(0,240,255,0.2);
      border-radius: 12px;
      padding: 11px 16px;
      color: #c8dde8;
      font-size: 14px;
      font-family: 'Rajdhani', sans-serif;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    #ariaTextInput::placeholder { color: rgba(0,240,255,0.3); }
    #ariaTextInput:focus {
      border-color: rgba(0,240,255,0.5);
      box-shadow: 0 0 12px rgba(0,240,255,0.1);
    }
    #ariaSendBtn {
      width: 46px; height: 46px; min-width: 46px;
      border-radius: 50%;
      border: 2px solid rgba(0,240,255,0.5);
      background: rgba(0,240,255,0.1);
      color: #00f0ff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    #ariaSendBtn:hover {
      background: rgba(0,240,255,0.25);
      box-shadow: 0 0 18px rgba(0,240,255,0.4);
      border-color: #00f0ff;
    }

    /* ── Voice status bar ── */
    #ariaVoiceBar {
      position: relative; z-index: 1;
      text-align: center;
      padding: 6px 0 10px;
      font-size: 12px;
      color: rgba(0,240,255,0.4);
      font-family: monospace;
      letter-spacing: 0.5px;
      display: none;
      flex-shrink: 0;
    }
    #ariaVoiceBar.show { display: block; }
    #ariaVoiceBar.speaking { color: rgba(0,255,136,0.6); }

    @media (max-width: 480px) {
      #ariaWindow { border-radius: 16px; }
      #ariaExamplesGrid { grid-template-columns: 1fr; }
      .amsg { max-width: 90%; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ══════════════════════════════════════════════════════════════
     ROBOT SVG ICON
  ══════════════════════════════════════════════════════════════ */
  const robotSVG = `
    <svg id="ariaRobotSvg" width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <rect x="20" y="43" width="24" height="7" rx="3.5" fill="#00f0ff" opacity="0.18"/>
    </svg>
  `;

  const miniRobotSVG = `
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="32" y1="5" x2="32" y2="13" stroke="#00f0ff" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="32" cy="4" r="3" fill="#00f0ff"/>
      <rect x="10" y="13" width="44" height="30" rx="9" fill="#060d1f" stroke="#00f0ff" stroke-width="1.8"/>
      <ellipse cx="22" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
      <ellipse cx="42" cy="27" rx="3.5" ry="3.5" fill="#00f0ff"/>
      <rect x="22" y="35" width="20" height="4" rx="2" fill="#00f0ff" opacity="0.55"/>
      <rect x="5" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity="0.45"/>
      <rect x="54" y="22" width="5" height="13" rx="2.5" fill="#00f0ff" opacity="0.45"/>
    </svg>
  `;

  /* ══════════════════════════════════════════════════════════════
     BUILD DOM
  ══════════════════════════════════════════════════════════════ */

  // Floating button
  const root = document.createElement('div');
  root.id = 'ariaRoot';
  root.innerHTML = `
    <div id="ariaBubble">
      ${robotSVG}
      <div id="ariaNotif"></div>
    </div>
    <span id="ariaTag">ARIA</span>
  `;
  document.body.appendChild(root);

  // Full modal
  const modal = document.createElement('div');
  modal.id = 'ariaModal';
  modal.innerHTML = `
    <div id="ariaWindow">
      <div id="ariaHeader">
        <div id="ariaHeaderAvatar">${miniRobotSVG}</div>
        <div id="ariaHeaderInfo">
          <div id="ariaHeaderName">ARIA — Portfolio Assistant</div>
          <div id="ariaHeaderSub">
            <div id="ariaOnlineDot"></div>
            <span id="ariaStatusText">Online &amp; ready</span>
          </div>
        </div>
        <button id="ariaCloseBtn" title="Close">✕</button>
      </div>

      <div id="ariaChatArea"></div>

      <div id="ariaExamples">
        <div id="ariaExamplesLabel">Try asking</div>
        <div id="ariaExamplesGrid">
          <button class="aexample"><span class="aexample-icon">🎮</span>Tell me about his games</button>
          <button class="aexample"><span class="aexample-icon">🛠️</span>What are his skills?</button>
          <button class="aexample"><span class="aexample-icon">🎯</span>What's his dream goal?</button>
          <button class="aexample"><span class="aexample-icon">📩</span>How do I contact him?</button>
          <button class="aexample"><span class="aexample-icon">🖥️</span>Tell me about his UE5 work</button>
          <button class="aexample"><span class="aexample-icon">🤖</span>What is the ARIA project?</button>
          <button class="aexample"><span class="aexample-icon">🎓</span>His education background</button>
          <button class="aexample"><span class="aexample-icon">🌟</span>Why hire Mohak?</button>
        </div>
      </div>

      <div id="ariaVoiceBar">🎤 Listening...</div>

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
    </div>
  `;
  document.body.appendChild(modal);

  /* ══════════════════════════════════════════════════════════════
     KNOWLEDGE BASE
  ══════════════════════════════════════════════════════════════ */
  const kb = [
    {
      id: 'greeting',
      weight: 10,
      keys: ['hello','hi there','hey','good morning','good afternoon','good evening','good night','howdy','greetings','sup','what\'s up','whats up'],
      variants: [] // handled dynamically by time-aware greeting
    },
    {
      id: 'farewell',
      weight: 10,
      keys: ['bye','goodbye','see you','farewell','take care','cya','later','good night','signing off','thanks bye','thank you bye','that\'s all','thats all','i\'m done','im done','exit','close','end','quit'],
      variants: [] // handled dynamically
    },
    {
      id: 'thanks',
      weight: 9,
      keys: ['thank you','thanks','thank u','thankyou','appreciate','helpful','great help','you\'re helpful','nice','wonderful','awesome','amazing','brilliant','great job','well done','perfect','excellent'],
      variants: [
        "You're very welcome! It's a pleasure representing Mohak. Feel free to ask anything else — I'm always here! 😊",
        "Glad I could help! If you have more questions about Mohak's work or want to get in touch with him, don't hesitate to ask.",
        "Always happy to help! Mohak would be thrilled to know you found this useful. Is there anything else you'd like to know?",
      ]
    },
    {
      id: 'intro',
      weight: 9,
      keys: ['who are you','what are you','introduce yourself','your name','about aria','what is aria','are you ai','are you a bot','are you real','are you human'],
      variants: [
        "I'm <strong>ARIA</strong> — Mohak Mittal's personal AI portfolio assistant. I'm built to tell you everything about his work, skills, and projects with a smile. What would you like to explore?",
        "The name's <strong>ARIA</strong>! Think of me as Mohak's digital representative — I know his story inside out. Ask me about his projects, skills, background, or how to reach him.",
        "I'm <strong>ARIA</strong>, a custom-built assistant living right here in Mohak's portfolio. I can walk you through his entire journey — from 3D art to game development to his big studio dream!",
      ]
    },
    {
      id: 'about',
      weight: 9,
      keys: ['who is mohak','about mohak','tell me about him','about him','who is he','his background','himself','mohak mittal','describe mohak','brief about'],
      variants: [
        "<strong>Mohak Mittal</strong> is a passionate Game Developer and 3D Artist from Barnala, Punjab, India. He specializes in <strong>Unreal Engine 5</strong> and <strong>Blender</strong>, and his core ambition is to build his own game studio. Every project he creates is a step closer to that dream.",
        "Mohak is a driven developer in his final semester of BCA, with a unique blend of game development and 3D artistry. He's built complete projects from scratch — from crafting Blueprint systems in UE5 to sculpting photorealistic environments in Blender.",
        "Think of Mohak as someone who turns imagination into interactive worlds. He's a <strong>Game Developer, 3D Artist</strong>, and aspiring <strong>studio founder</strong> from India — currently mastering C++ and UE5 to take his craft to the next level.",
      ]
    },
    {
      id: 'skills',
      weight: 8,
      keys: ['skill','what can he do','technology','tech stack','expertise','proficient','good at','capable of','what does he know','tools he uses','his abilities','technical skills'],
      variants: [
        "Mohak's technical arsenal spans two domains. <strong>Game Dev:</strong> Unreal Engine 5, Blueprint Scripting, C++, Lumen, Nanite, Niagara VFX. <strong>3D Art:</strong> Blender, PBR texturing, UV unwrapping, FBX pipeline. <strong>Programming:</strong> Python, Java, HTML, CSS. A well-rounded developer.",
        "He's strong across the full game development pipeline — <strong>gameplay scripting</strong> in UE5 Blueprint and C++, <strong>real-time rendering</strong> with Lumen & Nanite, <strong>3D modeling</strong> in Blender with PBR workflows, and general programming in Python and Java.",
        "Mohak's core skills: <strong>UE5, Blueprint, C++</strong> for game systems — <strong>Blender, PBR, UV unwrap</strong> for 3D art — <strong>Python, Java, HTML, CSS</strong> for software development. He also built an AI voice assistant using Groq and Llama 3.3.",
      ]
    },
    {
      id: 'projects',
      weight: 8,
      keys: ['project','work','built','made','portfolio','what has he done','his work','games','creations','what did he make','his projects','show projects'],
      variants: [
        "Mohak's notable projects: <strong>1)</strong> A full <strong>Checkpoint Car Game</strong> in Unreal Engine 5 — his BCA final project, complete with Lumen lighting and custom Blender assets. <strong>2)</strong> <strong>ARIA</strong> — a Python AI voice assistant using Groq Whisper + Llama 3.3. <strong>3)</strong> Several 3D environment scenes in Blender. And more in progress!",
        "Key works from Mohak's portfolio: an <strong>open-world car game</strong> in UE5 with checkpoint mechanics and dynamic lighting, a <strong>Python AI assistant</strong> with real speech recognition and LLM reasoning, and a growing library of <strong>150+ Blender 3D models</strong>.",
        "Mohak has shipped two major projects: the <strong>Checkpoint Car Game</strong> (UE5) — a complete game with timer, checkpoints, Blueprint scripting, and all-original Blender assets — and <strong>ARIA</strong>, a Python-based voice assistant powered by Llama 3.3. Both built solo.",
      ]
    },
    {
      id: 'cargame',
      weight: 9,
      keys: ['car game','checkpoint game','ue5 game','unreal game','racing game','driving game','timer game','his game','the game','game project','final project','bca project','semester project'],
      variants: [
        "The <strong>Checkpoint Car Game</strong> is Mohak's BCA final semester project — an open-world driving experience built entirely in Unreal Engine 5. Features: real-time timer (+10 seconds per checkpoint), Blueprint visual scripting for all game logic, Lumen global illumination for cinematic lighting, Nanite geometry for performance, and every single 3D asset hand-crafted in Blender.",
        "It's a solo-developed open-world car game. You race against the clock, driving through checkpoints scattered across a custom-built environment. What makes it stand out: Mohak designed <em>and modeled</em> everything — the buildings, roads, and props — in Blender, then brought it all into UE5 via FBX pipeline. A complete, shipping game.",
        "Built for his BCA final year: a <strong>checkpoint-based driving game</strong> in UE5 where players race through environments in a timed run. The tech stack: Blueprint for gameplay, Lumen for real-time GI, Nanite for asset fidelity, and 100% original Blender models. A genuine end-to-end production.",
      ]
    },
    {
      id: 'blender',
      weight: 7,
      keys: ['blender','3d model','3d art','3d work','render','sculpt','asset','geometry','mesh','texture','pbr material','uv unwrap','3d modeling','environment','3d scene','his art'],
      variants: [
        "Blender is one of Mohak's most refined skills. He's created <strong>150+ 3D models</strong> — architectural buildings, environmental props, vehicles, and game-ready assets — all UV-unwrapped and textured with a complete PBR workflow. Every asset in his car game was built in Blender from scratch.",
        "In Blender, Mohak works the full pipeline: <strong>high-poly modeling → UV unwrapping → PBR material creation → FBX export to Unreal Engine</strong>. Over 150 models in his library, covering everything from urban environments to stylized game props.",
        "Mohak has spent serious time in Blender — <strong>150+ models</strong> ranging from architectural environments to game-ready assets. His workflow covers modeling, UV mapping, PBR texturing, and seamless UE5 import. The car game environment is entirely his Blender work.",
      ]
    },
    {
      id: 'aria_project',
      weight: 9,
      keys: ['aria project','python project','voice assistant project','ai project','groq','llama','whisper','how were you made','your origin','who made you','python assistant','llama 3','ai assistant he built','built you'],
      variants: [
        "Mohak built an <strong>AI voice assistant in Python</strong> using a sophisticated pipeline: <strong>Groq's Whisper API</strong> for real-time speech-to-text, <strong>Llama 3.3 70B</strong> as the intelligence layer for natural language understanding, and <strong>pyttsx3</strong> for speech output. It also features file system indexing and OS-level screen control. That's the project that inspired me!",
        "The ARIA project uses a real-time voice pipeline: user speaks → Whisper transcribes → Llama 3.3 processes → spoken response. Built entirely in Python by Mohak, it also has advanced features like <strong>file indexing</strong> (find any file by voice) and <strong>screen control</strong> — a genuinely impressive standalone AI tool.",
        "It's a production-quality AI voice assistant — not a toy. Mohak used <strong>Groq's Whisper</strong> for low-latency speech recognition, <strong>Llama 3.3 70B</strong> for reasoning, and integrated file-system search and screen automation in Python. Real-world AI engineering, built independently.",
      ]
    },
    {
      id: 'ue5',
      weight: 8,
      keys: ['unreal engine','ue5','unreal','lumen','nanite','niagara','blueprint scripting','visual scripting','unreal 5','game engine','engine','real-time rendering'],
      variants: [
        "Mohak works with <strong>Unreal Engine 5</strong> at a serious level. He uses <strong>Lumen</strong> for real-time global illumination, <strong>Nanite</strong> for virtualized geometry with no LOD management, <strong>Niagara</strong> for VFX systems, and <strong>Blueprint Visual Scripting</strong> for gameplay logic — with C++ for deeper engine customization.",
        "In UE5, Mohak handles the complete pipeline: Blueprint scripting, Lumen lighting, Nanite geometry, Niagara particle effects, and the FBX asset import workflow from Blender. He built an entire game using these tools — no shortcuts.",
        "UE5 is Mohak's primary development environment. He's built with <strong>Lumen (ray-traced GI), Nanite (virtualized geometry), Niagara (VFX), Blueprint (logic scripting)</strong>, and is actively advancing his <strong>C++ UE5</strong> skills for engine-level development.",
      ]
    },
    {
      id: 'cplusplus',
      weight: 7,
      keys: ['c++','cpp','c plus plus','programming','software development','coding','code','developer','computer science'],
      variants: [
        "<strong>C++</strong> is a core pillar of Mohak's roadmap — specifically <strong>Unreal Engine C++</strong>. He's building on his foundational knowledge to move beyond Blueprint scripting into deeper engine customization, custom gameplay systems, and performance-critical code.",
        "Mohak codes in <strong>C++</strong> with a focus on Unreal Engine development. He understands OOP fundamentals and is actively deepening his C++ expertise — a key step toward his game studio ambitions.",
        "C++ is where Mohak is investing serious time. Coming from strong Blueprint scripting experience, he's now learning <strong>native UE5 C++</strong> for actor components, game modes, and engine plugins — the next level of game development.",
      ]
    },
    {
      id: 'contact',
      weight: 9,
      keys: ['contact','hire','reach','connect','collaborate','work together','get in touch','available','freelance','opportunity','job','email','message','dm','direct message','how to contact','reach out'],
      variants: [
        "Mohak is open to collaborations, freelance projects, and game development opportunities. Best ways to reach him: <strong>Instagram @mohakmittal92</strong> for direct messages, and <strong>GitHub github.com/Mohak-Mittal</strong> to explore his code. Don't hesitate — he genuinely loves working on interesting projects!",
        "You can reach Mohak through his <strong>Instagram (@mohakmittal92)</strong> for a quick message, or check his <strong>GitHub (github.com/Mohak-Mittal)</strong> to see his work firsthand. He's actively looking for collaborations and new opportunities.",
        "To connect with Mohak: slide into his <strong>Instagram DMs @mohakmittal92</strong>, or explore his repositories on <strong>GitHub at github.com/Mohak-Mittal</strong>. He's available for game dev collaborations, freelance work, and exciting new projects.",
      ]
    },
    {
      id: 'github',
      weight: 6,
      keys: ['github','repository','repo','open source','source code','code samples','his github','his code','codebase'],
      variants: [
        "Mohak's GitHub is at <strong>github.com/Mohak-Mittal</strong> — head over to explore his repositories, projects, and code in action.",
        "You'll find his projects and code at <strong>github.com/Mohak-Mittal</strong>. Worth a visit to see his technical work up close!",
      ]
    },
    {
      id: 'instagram',
      weight: 6,
      keys: ['instagram','social media','insta','follow him','social','his instagram','his social'],
      variants: [
        "Follow Mohak on Instagram at <strong>@mohakmittal92</strong> for his latest 3D renders, game dev updates, and behind-the-scenes creative work.",
        "His Instagram is <strong>@mohakmittal92</strong> — a great place to see his visual work, progress updates, and creative process.",
      ]
    },
    {
      id: 'location',
      weight: 5,
      keys: ['location','where is he','where is he from','his city','country','india','barnala','punjab','based in','lives in','hometown'],
      variants: [
        "Mohak is based in <strong>Barnala, Punjab, India</strong>. He's in his final semester of BCA and fully available for remote collaborations and projects worldwide.",
        "He's from <strong>Barnala, Punjab, India</strong> — proving that world-class work can come from anywhere. Open to remote opportunities globally.",
      ]
    },
    {
      id: 'education',
      weight: 6,
      keys: ['education','study','college','degree','bca','university','student','qualification','academic','where did he study','his college','his degree','bachelor'],
      variants: [
        "Mohak is pursuing a <strong>Bachelor of Computer Applications (BCA)</strong> at S.D. College Barnala, affiliated with Punjabi University Patiala. He's in his final 6th semester — and already shipping professional-level projects.",
        "He's completing a <strong>BCA at S.D. College Barnala</strong> (Punjabi University Patiala). Final semester student who builds real things — a shipped UE5 game, 150+ 3D models, and a Python AI assistant.",
      ]
    },
    {
      id: 'goal',
      weight: 8,
      keys: ['goal','dream','future plan','studio dream','ambition','vision','where is he headed','aspiration','long term','plans','studio','game studio','his own studio','found a studio'],
      variants: [
        "Mohak's ultimate vision is to <strong>found his own game studio</strong>. Every project he builds — the car game, the AI assistant, the 3D art — is deliberate preparation for that goal. He's systematically mastering the tools used by the world's top studios: UE5 and C++.",
        "The dream is crystal clear: <strong>his own game studio</strong>. Mohak isn't waiting for an opportunity — he's creating the skills, building the portfolio, and developing the technical depth to make it happen. Watch this space.",
        "Long-term, Mohak wants to be a <strong>game studio founder</strong>. He's building mastery in Unreal Engine 5 and C++, creating real projects, and developing both technical and creative skills — all in pursuit of that singular goal.",
      ]
    },
    {
      id: 'experience',
      weight: 6,
      keys: ['experience','how long','since when','years of experience','how experienced','beginner','expert','skill level','his level','how good'],
      variants: [
        "Mohak has <strong>1+ years of active game development and 3D art experience</strong> — not theoretical, but practical. He's shipped a complete UE5 game, built 150+ Blender models, and independently developed a Python AI assistant. Learning by building is his philosophy.",
        "Over a year of hands-on experience with tangible results: a full UE5 game, 150+ 3D assets, and a working AI assistant. He's at an <strong>intermediate-to-advanced level</strong> for his stage, and growing fast.",
      ]
    },
    {
      id: 'cv',
      weight: 5,
      keys: ['cv','resume','download cv','curriculum vitae','his resume','get his cv','download resume'],
      variants: [
        "Mohak's CV is available for download right on this portfolio! Head to the <strong>About section</strong> and click the <strong>Download CV</strong> button — it covers his full skill set, projects, education, and contact details.",
        "You can grab his CV from the <strong>About page</strong> of this site using the Download CV button. It's a comprehensive snapshot of his skills and experience.",
      ]
    },
    {
      id: 'hire',
      weight: 9,
      keys: ['why hire','should i hire','why should i hire','is he good','worth hiring','is he available','can he work','would he be good','recommend','would you recommend'],
      variants: [
        "Absolutely — here's why: Mohak brings a <strong>rare combination</strong> of gameplay programming (UE5, Blueprint, C++) and 3D artistry (Blender, PBR). He doesn't just design games — he builds them end-to-end, solo. That full-pipeline ownership is genuinely rare and valuable.",
        "Mohak is a <strong>complete game developer</strong> — he can handle gameplay logic, 3D modeling, lighting, and asset pipelines independently. For any team or project needing UE5 expertise combined with strong 3D art, he's an excellent choice. Plus, he's driven, deadline-aware, and passionate.",
        "Here's the pitch: Mohak shipped a complete game, built 150+ 3D assets, and developed an AI assistant — all independently. He's <strong>self-sufficient, technically strong</strong>, and deeply motivated. For UE5 projects, game dev collaboration, or 3D art work — he delivers.",
      ]
    },
    {
      id: 'toolzone',
      weight: 6,
      keys: ['toolzone','tool zone','online tools','web tools','tools website','his website','tools site'],
      variants: [
        "Mohak is also building <strong>ToolZone</strong> — a free online tools website with utilities like a PDF Merger and Image Compressor. It showcases his web development skills alongside his game dev work.",
        "<strong>ToolZone</strong> is a side project — a free online tools platform Mohak is developing with a clean dark UI, featuring tools like PDF merging and image compression. Still growing!",
      ]
    },
    {
      id: 'portfolio',
      weight: 7,
      keys: ['portfolio website','this website','this site','portfolio site','his portfolio','about this website','who made this'],
      variants: [
        "This portfolio was designed and built entirely by Mohak — featuring a <strong>cyberpunk aesthetic</strong> with a Three.js 3D city background, particle effects, custom cursor, animated skill bars, and a project modal with image carousel. Oh, and me! 🤖",
        "Mohak built this site himself using <strong>HTML, CSS, JavaScript, and Three.js</strong> for the 3D background. The cyberpunk design reflects his game dev aesthetic — everything from the neon colors to the animated elements is intentional.",
      ]
    },
  ];

  /* ── Context ── */
  let lastTopicId = null;
  const usedVariants = {};
  const chatHistory = [];
  let modalOpened = false;

  /* ── Follow-up detection ── */
  function isFollowUp(input) {
    const lower = input.toLowerCase();
    const followUpPhrases = ['tell me more','more about','what else','can you explain','elaborate','go on','continue','and then','anything else','what about that','more details','expand on','in detail','give me more'];
    return followUpPhrases.some(p => lower.includes(p));
  }

  /* ── Scoring engine ── */
  function score(input, topic) {
    const lower = input.toLowerCase().replace(/[^\w\s']/g, '');
    const tokens = lower.split(/\s+/);
    let s = 0;
    for (const key of topic.keys) {
      if (lower.includes(key)) {
        s += topic.weight * 2.5;
      } else {
        const kt = key.split(/\s+/);
        for (const k of kt) {
          if (k.length <= 2) continue;
          for (const t of tokens) {
            if (t === k) { s += topic.weight; }
            else if (t.length > 3 && k.length > 3 && (t.includes(k) || k.includes(t))) { s += topic.weight * 0.6; }
          }
        }
      }
    }
    return s;
  }

  /* ── Pick variant without repeating ── */
  function pickVariant(topic) {
    if (!topic.variants || topic.variants.length === 0) return null;
    const used = usedVariants[topic.id] || [];
    const available = topic.variants
      .map((v, i) => ({ v, i }))
      .filter(x => !used.includes(x.i));
    const pool = available.length > 0 ? available : topic.variants.map((v, i) => ({ v, i }));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    usedVariants[topic.id] = [...(used.slice(-3)), pick.i];
    return pick.v;
  }

  /* ── Time-aware greeting ── */
  function getTimeGreeting() {
    const h = new Date().getHours();
    let time, emoji;
    if (h >= 5 && h < 12)       { time = 'Good morning';   emoji = '☀️'; }
    else if (h >= 12 && h < 17) { time = 'Good afternoon'; emoji = '🌤️'; }
    else if (h >= 17 && h < 21) { time = 'Good evening';   emoji = '🌆'; }
    else                         { time = 'Good night';     emoji = '🌙'; }

    const greetings = [
      `${emoji} <strong>${time}!</strong> I'm <strong>ARIA</strong>, Mohak Mittal's personal portfolio assistant. Wonderful to have you here! What would you like to know about his work?`,
      `${emoji} <strong>${time}!</strong> Welcome to Mohak's portfolio — I'm <strong>ARIA</strong>, his digital assistant. I'm here to guide you through his projects, skills, and story. Ask me anything!`,
      `${emoji} <strong>${time}!</strong> Great timing — I'm <strong>ARIA</strong>, always on duty to represent Mohak. Whether it's about his games, his art, or how to work with him, I've got answers!`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /* ── Farewell response ── */
  function getFarewell() {
    const h = new Date().getHours();
    const closing = h >= 21 || h < 5 ? 'Have a wonderful night' : h < 12 ? 'Have a great day' : h < 17 ? 'Have a wonderful afternoon' : 'Have a lovely evening';
    const farewells = [
      `It was a pleasure chatting with you! ${closing}, and thank you sincerely for visiting Mohak's portfolio. 🙏 If you ever want to collaborate or learn more, you know where to find us!`,
      `Thank you so much for stopping by! ${closing}. Mohak appreciates every visitor — and if anything sparks your interest, don't hesitate to reach out to him directly. Take care! 👋`,
      `Goodbye for now! ${closing}. On behalf of Mohak — thank you for your time and interest. This portfolio represents years of passion and hard work. Hope to see you again! 🌟`,
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }

  /* ── Main response function ── */
  function getResponse(input) {
    const lower = input.toLowerCase().trim();

    // Farewell detection
    const farewellKeys = ['bye','goodbye','see you','farewell','take care','cya','later','signing off','thanks bye','thank you bye','that\'s all','thats all','i\'m done','im done'];
    if (farewellKeys.some(k => lower.includes(k))) {
      return { text: getFarewell(), topicId: 'farewell', isFarewell: true };
    }

    // Greeting detection
    const greetKeys = ['hello','hi there','hey there','good morning','good afternoon','good evening','good night','howdy','greetings'];
    if (greetKeys.some(k => lower === k || lower.startsWith(k + ' ') || lower.startsWith(k + '!'))) {
      return { text: getTimeGreeting(), topicId: 'greeting' };
    }

    // Follow-up on last topic
    if (isFollowUp(lower) && lastTopicId) {
      const last = kb.find(k => k.id === lastTopicId);
      if (last && last.variants && last.variants.length > 1) {
        const reply = pickVariant(last);
        if (reply) return { text: reply, topicId: lastTopicId };
      }
    }

    // Score all topics
    const scored = kb
      .filter(t => t.id !== 'greeting' && t.id !== 'farewell')
      .map(t => ({ topic: t, s: score(input, t) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s);

    if (scored.length > 0 && scored[0].s >= 3) {
      const best = scored[0].topic;
      lastTopicId = best.id;
      const reply = pickVariant(best);
      return { text: reply || "I know about this! Could you rephrase your question so I can give you the best answer?", topicId: best.id };
    }

    // Smart fallbacks
    const fallbacks = [
      `That's a great question — though it's a bit outside my training on Mohak's portfolio. Try asking about his <strong>skills, projects, UE5 work, Blender art, education</strong>, or <strong>how to contact him</strong>. I'd love to help with any of those!`,
      `Hmm, I want to give you the right answer! I'm specialized in Mohak's portfolio — try asking about his <strong>game development work</strong>, <strong>3D art</strong>, <strong>background</strong>, or <strong>contact details</strong>.`,
      `I'm not quite sure how to answer that one! My expertise is Mohak Mittal's portfolio. Ask me about his <strong>projects, skills, experience</strong>, or <strong>how to collaborate with him</strong> — I'll nail it!`,
    ];
    lastTopicId = null;
    return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)], topicId: null };
  }

  /* ── Follow-up suggestions per topic ── */
  const followUps = {
    'default':      ['His projects 🎮','His skills 🛠️','Contact him 📩','His dream 🌟'],
    'about':        ['His skills','His projects','His education','His goal'],
    'skills':       ['UE5 details','Blender work','C++ skills','Python project'],
    'projects':     ['Car game details','Blender assets','ARIA project','Why hire him?'],
    'cargame':      ['Blender assets used','His UE5 skills','More projects','Contact him'],
    'goal':         ['His current projects','His skills','Contact him','His background'],
    'contact':      ['His GitHub','His Instagram','Download CV','Why hire him?'],
    'intro':        ['Who is Mohak?','His projects','His skills','His dream'],
    'aria_project': ['His other projects','Python skills','Contact him','His GitHub'],
    'ue5':          ['The car game','Blender pipeline','His C++ skills','His projects'],
    'blender':      ['His 3D models','UE5 pipeline','The car game','His skills'],
    'hire':         ['His projects','His skills','Contact him','Download CV'],
    'education':    ['His skills','His projects','His goal','Contact him'],
    'cplusplus':    ['His UE5 skills','His projects','His goal','Contact him'],
    'greeting':     ['Who is Mohak?','His projects 🎮','His skills 🛠️','Contact him 📩'],
  };

  /* ══════════════════════════════════════════════════════════════
     DRAGGABLE LOGIC
  ══════════════════════════════════════════════════════════════ */
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let rootStartX = 0, rootStartY = 0;
  let dragMoved = false;
  const DRAG_THRESHOLD = 5;

  function getPos() {
    const rect = root.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartX = clientX;
    dragStartY = clientY;
    const pos = getPos();
    rootStartX = pos.x;
    rootStartY = pos.y;
    isDragging = true;
    dragMoved = false;
    root.classList.add('dragging');
    root.style.animation = 'none';
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStartX;
    const dy = clientY - dragStartY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragMoved = true;
    }
    if (!dragMoved) return;
    const newX = rootStartX + dx;
    const newY = rootStartY + dy;
    // Clamp to viewport
    const bw = root.offsetWidth;
    const bh = root.offsetHeight;
    const clampedX = Math.max(8, Math.min(window.innerWidth - bw - 8, newX));
    const clampedY = Math.max(8, Math.min(window.innerHeight - bh - 8, newY));
    root.style.left = clampedX + 'px';
    root.style.top  = clampedY + 'px';
    root.style.right = 'auto';
    root.style.bottom = 'auto';
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    root.classList.remove('dragging');
    root.style.animation = '';
    if (!dragMoved) {
      // It was a click, not a drag — open modal
      openModal();
    }
  }

  root.addEventListener('mousedown', onPointerDown);
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', onPointerUp);
  root.addEventListener('touchstart', onPointerDown, { passive: false });
  document.addEventListener('touchmove', onPointerMove, { passive: false });
  document.addEventListener('touchend', onPointerUp);

  /* ══════════════════════════════════════════════════════════════
     MODAL LOGIC
  ══════════════════════════════════════════════════════════════ */
  const closeBtn     = document.getElementById('ariaCloseBtn');
  const chatArea     = document.getElementById('ariaChatArea');
  const examples     = document.getElementById('ariaExamples');
  const exampleBtns  = document.querySelectorAll('.aexample');
  const micBtn       = document.getElementById('ariaMicBtn');
  const textInput    = document.getElementById('ariaTextInput');
  const sendBtn      = document.getElementById('ariaSendBtn');
  const voiceBar     = document.getElementById('ariaVoiceBar');
  const statusText   = document.getElementById('ariaStatusText');
  const notifDot     = document.getElementById('ariaNotif');

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function openModal() {
    modal.classList.add('aria-show');
    notifDot.classList.remove('show');
    if (!modalOpened) {
      modalOpened = true;
      // Show opening greeting after brief delay
      setTimeout(() => {
        addBotMessage(getTimeGreeting(), 'greeting');
      }, 400);
    }
    setTimeout(() => textInput.focus(), 350);
  }

  function closeModal() {
    modal.classList.remove('aria-show');
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });

  // Show notif dot after 3s if modal never opened
  setTimeout(() => {
    if (!modalOpened) notifDot.classList.add('show');
  }, 3000);

  /* ── Add messages ── */
  function addBotMessage(html, topicId) {
    // Hide examples after first real interaction
    if (chatHistory.length > 0) {
      examples.style.display = 'none';
    }

    const wrap = document.createElement('div');
    wrap.className = 'amsg bot';
    wrap.innerHTML = `
      <div class="amsg-bubble">${html}</div>
      <div class="amsg-time">ARIA · ${getTime()}</div>
    `;
    chatArea.appendChild(wrap);
    chatArea.scrollTop = chatArea.scrollHeight;

    // Update suggestions after topic
    updateSuggestions(topicId);

    chatHistory.push({ role: 'bot', text: html });
    return wrap;
  }

  function addUserMessage(text) {
    examples.style.display = 'none';
    const wrap = document.createElement('div');
    wrap.className = 'amsg user';
    wrap.innerHTML = `
      <div class="amsg-bubble">${escapeHtml(text)}</div>
      <div class="amsg-time">You · ${getTime()}</div>
    `;
    chatArea.appendChild(wrap);
    chatArea.scrollTop = chatArea.scrollHeight;
    chatHistory.push({ role: 'user', text });
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'aria-typing-bubble';
    t.innerHTML = '<span></span><span></span><span></span>';
    chatArea.appendChild(t);
    chatArea.scrollTop = chatArea.scrollHeight;
    return t;
  }

  /* ── Suggestion chips ── */
  function updateSuggestions(topicId) {
    const chips = followUps[topicId] || followUps['default'];
    // Remove old chip bar if exists
    const old = document.getElementById('ariaChipBar');
    if (old) old.remove();
    const bar = document.createElement('div');
    bar.id = 'ariaChipBar';
    bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;padding:4px 0 2px;';
    bar.innerHTML = chips.map(c =>
      `<button style="font-size:12px;padding:5px 11px;border:1px solid rgba(0,240,255,0.25);border-radius:20px;color:rgba(0,240,255,0.7);cursor:pointer;background:rgba(0,240,255,0.05);transition:all 0.2s;font-family:'Rajdhani',sans-serif;" onmouseover="this.style.background='rgba(0,240,255,0.13)';this.style.color='#00f0ff'" onmouseout="this.style.background='rgba(0,240,255,0.05)';this.style.color='rgba(0,240,255,0.7)'">${c}</button>`
    ).join('');
    // Append after last bot message
    const lastBot = [...chatArea.querySelectorAll('.amsg.bot')].pop();
    if (lastBot) lastBot.after(bar);
    else chatArea.appendChild(bar);
    chatArea.scrollTop = chatArea.scrollHeight;
    bar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function() {
        processInput(this.textContent.replace(/[🎮🛠️📩🌟🤖🎓]/g,'').trim());
      });
    });
  }

  /* ── Process input ── */
  const WORKER_URL = 'https://white-paper-62ef.mittalmohak0.workers.dev';

  async function processInput(text) {
    if (!text.trim()) return;
    addUserMessage(text);
    textInput.value = '';
    const old = document.getElementById('ariaChipBar');
    if (old) old.remove();
    const typing = showTyping();

    // Check for farewell locally first
    const lower = text.toLowerCase();
    const farewellKeys = ['bye','goodbye','see you','farewell','take care','cya','later','signing off','thanks bye','thank you bye'];
    if (farewellKeys.some(k => lower.includes(k))) {
      typing.remove();
      const fw = getFarewell();
      addBotMessage(fw, 'farewell');
      speak(fw.replace(/<[^>]+>/g, ''));
      setTimeout(() => closeModal(), 3500);
      return;
    }

    // Call Cloudflare Worker
    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      typing.remove();
      if (!res.ok) throw new Error('Worker error');
      const data = await res.json();
      const reply = data.reply || "I'm having trouble connecting right now. Please try again!";
      addBotMessage(reply, null);
      speak(reply);
    } catch (err) {
      typing.remove();
      // Fallback to local KB if Worker fails
      const result = getResponse(text);
      addBotMessage(result.text + ' <em style="font-size:11px;opacity:0.5">(offline mode)</em>', result.topicId);
      speak(result.text.replace(/<[^>]+>/g, ''));
    }
  }

  /* ── Example buttons ── */
  exampleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const q = this.textContent.replace(/[🎮🛠️🎯📩🖥️🤖🎓🌟]/g,'').trim();
      openModal();
      setTimeout(() => processInput(q), 200);
    });
  });

  /* ── Text input ── */
  sendBtn.addEventListener('click', () => processInput(textInput.value.trim()));
  textInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processInput(this.value.trim());
    }
  });

  /* ══════════════════════════════════════════════════════════════
     VOICE — Female voice, cached, no repeats
  ══════════════════════════════════════════════════════════════ */
  let cachedVoice = null;

  function getFemaleVoice() {
    if (cachedVoice) return cachedVoice;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const priority = [
      'Microsoft Aria Online','Microsoft Aria','Microsoft Jenny Online','Microsoft Jenny',
      'Microsoft Zira','Microsoft Eva','Google UK English Female',
      'Samantha','Victoria','Karen','Moira','Fiona','Tessa','Allison'
    ];
    for (const name of priority) {
      const v = voices.find(v => v.name.includes(name));
      if (v) { cachedVoice = v; return v; }
    }
    // Any female
    const fem = voices.find(v => v.name.toLowerCase().includes('female'));
    if (fem) { cachedVoice = fem; return fem; }
    // English fallback
    cachedVoice = voices.find(v => v.lang === 'en-GB')
               || voices.find(v => v.lang === 'en-US')
               || voices.find(v => v.lang && v.lang.startsWith('en'))
               || null;
    return cachedVoice;
  }

  window.speechSynthesis.addEventListener('voiceschanged', function() {
    cachedVoice = null;
    getFemaleVoice();
  }, { once: true });

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    // Trim to reasonable length for TTS
    const trimmed = text.length > 220 ? text.substring(0, 220) + '...' : text;
    const utt = new SpeechSynthesisUtterance(trimmed);
    utt.rate = 1.05; utt.pitch = 1.15; utt.volume = 1;
    const v = getFemaleVoice();
    if (v) utt.voice = v;
    utt.onstart = () => {
      voiceBar.textContent = '🔊 Speaking...';
      voiceBar.className = 'show speaking';
      statusText.textContent = 'Speaking';
    };
    utt.onend = () => {
      voiceBar.className = '';
      statusText.textContent = 'Online & ready';
    };
    window.speechSynthesis.speak(utt);
  }

  /* ══════════════════════════════════════════════════════════════
     SPEECH RECOGNITION
  ══════════════════════════════════════════════════════════════ */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    micBtn.style.opacity = '0.4';
    micBtn.title = 'Voice not supported — use Chrome or Edge';
    micBtn.style.cursor = 'not-allowed';
  } else {
    const recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    let listening = false;
    let micPermAsked = false;

    micBtn.addEventListener('click', function() {
      if (listening) { recog.stop(); return; }
      // Request permission once silently
      if (!micPermAsked) {
        micPermAsked = true;
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia({ audio: true })
          .then(s => { s.getTracks().forEach(t => t.stop()); recog.start(); })
          .catch(() => recog.start());
      } else {
        recog.start();
      }
    });

    recog.onstart = function() {
      listening = true;
      micBtn.classList.add('listening');
      voiceBar.textContent = '🎤 Listening...';
      voiceBar.className = 'show';
      statusText.textContent = 'Listening...';
    };
    recog.onend = function() {
      listening = false;
      micBtn.classList.remove('listening');
      if (!voiceBar.classList.contains('speaking')) {
        voiceBar.className = '';
        statusText.textContent = 'Online & ready';
      }
    };
    recog.onerror = function(e) {
      listening = false;
      micBtn.classList.remove('listening');
      voiceBar.className = '';
      statusText.textContent = 'Online & ready';
      if (e.error === 'not-allowed') {
        addBotMessage('Microphone access was denied. Please allow microphone permissions in your browser settings to use voice input.', null);
      }
    };
    recog.onresult = function(e) {
      const said = e.results[0][0].transcript.trim();
      textInput.value = said;
      processInput(said);
    };
  }

})();