/* ============================================================
   ARIA — Mohak's Portfolio Voice Assistant
   No API key required | Uses Web Speech API (Chrome/Edge)
   ============================================================ */

(function () {

  /* ── Inject Styles ── */
  const style = document.createElement('style');
  style.textContent = `

    #ariaBtn {
      position: fixed !important;
      top: 80px !important;
      right: 20px !important;
      z-index: 99999 !important;
      display: flex !important;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      background: rgba(5, 8, 16, 0.92);
      border: 1.5px solid #00f0ff;
      border-radius: 18px;
      padding: 12px 14px 8px;
      box-shadow: 0 0 18px rgba(0,240,255,0.3), 0 4px 24px rgba(0,0,0,0.7);
      backdrop-filter: blur(12px);
      transition: box-shadow 0.2s ease;
      animation: ariaFloat 3s ease-in-out infinite;
      user-select: none;
      pointer-events: all !important;
    }
    #ariaBtn:hover {
      box-shadow: 0 0 30px rgba(0,240,255,0.55), 0 8px 32px rgba(0,0,0,0.7);
    }
    #ariaBtn:active { opacity: 0.8; }
    .aria-label {
      font-family: 'Orbitron', monospace, sans-serif;
      font-size: 10px;
      color: #00f0ff;
      letter-spacing: 2px;
      font-weight: 700;
    }
    @keyframes ariaFloat {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-7px); }
    }

    #ariaPanel {
      position: fixed !important;
      top: 185px !important;
      right: 20px !important;
      z-index: 99998 !important;
      width: 320px;
      background: rgba(5, 8, 16, 0.97);
      border: 1.5px solid #00f0ff;
      border-radius: 16px;
      box-shadow: 0 0 40px rgba(0,240,255,0.2), 0 16px 48px rgba(0,0,0,0.85);
      backdrop-filter: blur(20px);
      flex-direction: column;
      overflow: hidden;
      font-family: 'Rajdhani', sans-serif;
      pointer-events: all !important;
      display: none;
    }
    #ariaPanel.aria-open {
      display: flex !important;
      animation: ariaPanelIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes ariaPanelIn {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    #ariaPanelHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0,240,255,0.15);
      background: rgba(0,240,255,0.04);
    }
    #ariaPanelTitle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Orbitron', monospace, sans-serif;
      font-size: 11px;
      color: #00f0ff;
      letter-spacing: 1px;
      font-weight: 700;
    }
    #ariaStatusDot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00f0ff;
      box-shadow: 0 0 8px #00f0ff;
      animation: ariaPulse 1.5s ease-in-out infinite;
    }
    #ariaStatusDot.aria-listening {
      background: #ff4444 !important;
      box-shadow: 0 0 12px #ff4444 !important;
    }
    @keyframes ariaPulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.35; }
    }
    #ariaPanelClose {
      background: none;
      border: none;
      color: rgba(0,240,255,0.5);
      font-size: 18px;
      cursor: pointer;
      padding: 2px 8px;
      border-radius: 4px;
      transition: color 0.2s;
      line-height: 1;
    }
    #ariaPanelClose:hover { color: #00f0ff; }

    #ariaChatBox {
      flex: 1;
      max-height: 250px;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scrollbar-width: thin;
      scrollbar-color: rgba(0,240,255,0.3) transparent;
    }
    #ariaChatBox::-webkit-scrollbar { width: 4px; }
    #ariaChatBox::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.3); border-radius: 4px; }

    .aria-msg {
      max-width: 90%;
      padding: 9px 13px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      color: #c8d8e8;
      animation: msgIn 0.25s ease both;
    }
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .aria-msg-bot {
      background: rgba(0,240,255,0.07);
      border: 1px solid rgba(0,240,255,0.18);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .aria-msg-user {
      background: rgba(255,112,67,0.1);
      border: 1px solid rgba(255,112,67,0.22);
      color: #ffccbb;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .aria-msg strong { color: #00f0ff; }

    #ariaInputRow {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-top: 1px solid rgba(0,240,255,0.12);
      background: rgba(0,240,255,0.03);
    }
    #ariaMicBtn {
      width: 44px;
      height: 44px;
      min-width: 44px;
      border-radius: 50%;
      border: 2px solid #00f0ff;
      background: rgba(0,240,255,0.08);
      color: #00f0ff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    #ariaMicBtn:hover {
      background: rgba(0,240,255,0.18);
      box-shadow: 0 0 16px rgba(0,240,255,0.4);
    }
    #ariaMicBtn.aria-listening {
      background: rgba(255,68,68,0.15) !important;
      border-color: #ff4444 !important;
      color: #ff4444 !important;
      box-shadow: 0 0 20px rgba(255,68,68,0.5) !important;
      animation: micPulse 0.8s ease-in-out infinite;
    }
    @keyframes micPulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.12); }
    }
    #ariaHint {
      font-size: 13px;
      color: rgba(0,240,255,0.5);
      font-family: 'Rajdhani', sans-serif;
      letter-spacing: 0.5px;
    }

    @media (max-width: 420px) {
      #ariaPanel { width: calc(100vw - 20px); right: 10px !important; }
      #ariaBtn   { right: 10px !important; top: 70px !important; }
    }
  `;
  document.head.appendChild(style);

  /* ── Q&A Knowledge Base ── */
  const qa = [
    {
      keys: ['who are you', 'what are you', 'introduce yourself', 'your name', 'aria'],
      answer: "I'm ARIA — Mohak's AI Portfolio Assistant! Ask me about his skills, projects, education, or how to reach him!"
    },
    {
      keys: ['who is mohak', 'about mohak', 'tell me about him', 'about him'],
      answer: "Mohak Mittal is a passionate Game Developer from Barnala, Punjab, India. He's a BCA student specializing in Unreal Engine 5 and Blender. His dream is to build his own game studio!"
    },
    {
      keys: ['skill', 'know', 'technology', 'stack', 'tech', 'language', 'can he'],
      answer: "Mohak's skills include Unreal Engine 5, Blueprint Scripting, C++, Blender 3D, Python, Java, HTML and CSS. He's especially strong in 3D modeling, PBR texturing, and UE5's Lumen and Nanite systems."
    },
    {
      keys: ['project', 'work', 'built', 'made', 'portfolio', 'what has he'],
      answer: "Mohak built a Checkpoint Car Game in Unreal Engine 5 with Lumen lighting and custom Blender 3D assets. He also built ARIA — an AI voice assistant using Python, Groq Whisper, and Llama 3.3!"
    },
    {
      keys: ['car game', 'checkpoint', 'ue5 game', 'unreal game', 'racing'],
      answer: "The Checkpoint Car Game is Mohak's BCA final project. Built in UE5 with a timer system, checkpoints, Blueprint scripting, Lumen lighting, and fully custom Blender-made assets."
    },
    {
      keys: ['blender', '3d', 'model', 'render', 'sculpt', 'asset'],
      answer: "Mohak has 150+ 3D models in Blender — environments and game-ready assets with full PBR texturing. Every asset in his car game was made entirely in Blender!"
    },
    {
      keys: ['python', 'voice assistant', 'ai project', 'groq'],
      answer: "Mohak built an AI voice assistant using Groq's Whisper API for speech recognition, Llama 3.3 70B as the AI brain, and features like file indexing and screen control. Pretty impressive!"
    },
    {
      keys: ['contact', 'hire', 'reach', 'email', 'connect', 'collaborate', 'get in touch'],
      answer: "Reach Mohak on Instagram at @mohakmittal92, or find his work on GitHub at github.com/Mohak-Mittal. He's open to game dev projects and freelance work!"
    },
    {
      keys: ['github', 'code', 'repository', 'repo'],
      answer: "Mohak's GitHub is github.com/Mohak-Mittal — check it out for his projects and code!"
    },
    {
      keys: ['instagram', 'social', 'insta', 'follow'],
      answer: "Follow Mohak on Instagram at @mohakmittal92 for his latest 3D renders and game dev updates!"
    },
    {
      keys: ['location', 'where', 'from', 'city', 'india', 'barnala'],
      answer: "Mohak is based in Barnala, Punjab, India. Currently in his 6th semester of BCA."
    },
    {
      keys: ['education', 'study', 'college', 'degree', 'bca', 'university', 'student'],
      answer: "Mohak is pursuing a BCA at S.D. College Barnala, affiliated with Punjabi University Patiala. He's in his final 6th semester!"
    },
    {
      keys: ['goal', 'dream', 'future', 'plan', 'studio', 'ambition'],
      answer: "Mohak's ultimate goal is to found his own game studio! He's mastering Unreal Engine 5 and C++ to make that dream happen."
    },
    {
      keys: ['experience', 'year', 'how long'],
      answer: "Mohak has been actively developing games and 3D art for over a year, shipping real projects with UE5, Blender, Niagara VFX, and Blueprint scripting."
    },
    {
      keys: ['cv', 'resume', 'download'],
      answer: "Download Mohak's CV using the Download CV button on the About page. It has his skills, projects and contact info!"
    },
    {
      keys: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
      answer: "Hey there! I'm ARIA, Mohak's portfolio assistant. Ask me about his skills, projects, or how to get in touch. I'm all ears — literally!"
    },
    {
      keys: ['help', 'what can you', 'what do you know', 'what can i ask'],
      answer: "I can answer questions about Mohak's skills, projects, education, and contact info. Try: 'What are his skills?' or 'Tell me about his game!'"
    },
    {
      keys: ['thank', 'thanks', 'awesome', 'cool', 'great', 'nice', 'wow'],
      answer: "You're very welcome! Mohak appreciates you stopping by. Feel free to reach out to him directly anytime!"
    }
  ];

  function getResponse(text) {
    const lower = text.toLowerCase();
    for (const item of qa) {
      if (item.keys.some(k => lower.includes(k))) return item.answer;
    }
    return "I'm not sure about that! Try asking about Mohak's skills, projects, education, or contact info. I'm still learning!";
  }

  /* ── Init ── */
  function init() {
    const btn       = document.getElementById('ariaBtn');
    const panel     = document.getElementById('ariaPanel');
    const closeBtn  = document.getElementById('ariaPanelClose');
    const micBtn    = document.getElementById('ariaMicBtn');
    const chatBox   = document.getElementById('ariaChatBox');
    const hint      = document.getElementById('ariaHint');
    const statusDot = document.getElementById('ariaStatusDot');

    if (!btn || !panel) { console.warn('ARIA: elements missing.'); return; }

    let micPermissionGranted = false;

    function requestMicOnce() {
      if (micPermissionGranted) return;
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          micPermissionGranted = true;
          stream.getTracks().forEach(t => t.stop()); // just need permission, stop stream
        })
        .catch(() => {}); // silent fail, recognition will show error if denied
    }

    /* Toggle */
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.classList.contains('aria-open')) {
        panel.classList.remove('aria-open');
        btn.style.animationPlayState = 'running';
      } else {
        panel.classList.add('aria-open');
        btn.style.animationPlayState = 'paused';
        chatBox.scrollTop = chatBox.scrollHeight;
        requestMicOnce(); // ask for permission as soon as panel opens
      }
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.remove('aria-open');
      btn.style.animationPlayState = 'running';
    });

    function addMsg(html, type) {
      const div = document.createElement('div');
      div.className = 'aria-msg aria-msg-' + type;
      div.innerHTML = html;
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    let cachedVoice = null;
    function getFemaleVoice() {
      if (cachedVoice) return cachedVoice;
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;

      // Windows 11 female voices (Microsoft)
      const priority = [
        'Microsoft Aria',
        'Microsoft Jenny',
        'Microsoft Zira',
        'Microsoft Eva',
        'Google UK English Female',
        'Samantha',
        'Victoria',
        'Karen',
        'Moira',
        'Fiona',
        'Tessa',
      ];
      for (const name of priority) {
        const v = voices.find(v => v.name.includes(name));
        if (v) { cachedVoice = v; return v; }
      }
      // Fallback: any voice that has 'female' anywhere
      const femFallback = voices.find(v => v.name.toLowerCase().includes('female'));
      if (femFallback) { cachedVoice = femFallback; return femFallback; }
      // Last resort: English female by URI hint
      const enVoice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang === 'en-US');
      cachedVoice = enVoice || voices[0] || null;
      return cachedVoice;
    }
    window.speechSynthesis.addEventListener('voiceschanged', function() { cachedVoice = null; getFemaleVoice(); }, { once: true });

    function speak(text) {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.05; utt.pitch = 1.2; utt.volume = 1;
      const voice = getFemaleVoice();
      if (voice) utt.voice = voice;
      window.speechSynthesis.speak(utt);
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      micBtn.disabled = true;
      hint.textContent = 'Use Chrome/Edge for voice';
      hint.style.color = '#ff7043';
      return;
    }

    const recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    let listening = false;

    micBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (listening) { recog.stop(); return; }
      recog.start();
    });

    recog.onstart = function () {
      listening = true;
      micBtn.classList.add('aria-listening');
      statusDot.classList.add('aria-listening');
      hint.textContent = 'Listening...';
    };
    recog.onend = function () {
      listening = false;
      micBtn.classList.remove('aria-listening');
      statusDot.classList.remove('aria-listening');
      hint.textContent = 'Tap mic & speak';
    };
    recog.onerror = function (e) {
      listening = false;
      micBtn.classList.remove('aria-listening');
      statusDot.classList.remove('aria-listening');
      hint.textContent = 'Tap mic & speak';
      if (e.error === 'not-allowed')
        addMsg('Mic access denied. Please allow microphone permissions and try again.', 'bot');
    };
    recog.onresult = function (e) {
      const said = e.results[0][0].transcript.trim();
      addMsg(said, 'user');
      setTimeout(function () {
        const reply = getResponse(said);
        addMsg(reply, 'bot');
        speak(reply);
      }, 400);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();