/* ============================================================
   ARIA — Mohak Mittal's Portfolio Assistant v2.0
   Smart keyword engine | No API key required
   ============================================================ */

(function () {

  /* ── Styles ── */
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
    #ariaBtn:hover { box-shadow: 0 0 30px rgba(0,240,255,0.55), 0 8px 32px rgba(0,0,0,0.7); }
    #ariaBtn:active { opacity: 0.8; }
    .aria-label {
      font-family: 'Orbitron', monospace, sans-serif;
      font-size: 10px; color: #00f0ff;
      letter-spacing: 2px; font-weight: 700;
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
      width: 330px;
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
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0,240,255,0.15);
      background: rgba(0,240,255,0.04);
    }
    #ariaPanelTitle {
      display: flex; align-items: center; gap: 8px;
      font-family: 'Orbitron', monospace, sans-serif;
      font-size: 11px; color: #00f0ff;
      letter-spacing: 1px; font-weight: 700;
    }
    #ariaStatusDot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #00f0ff; box-shadow: 0 0 8px #00f0ff;
      animation: ariaPulse 1.5s ease-in-out infinite;
    }
    #ariaStatusDot.aria-listening { background: #ff4444 !important; box-shadow: 0 0 12px #ff4444 !important; }
    @keyframes ariaPulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }

    #ariaPanelClose {
      background: none; border: none;
      color: rgba(0,240,255,0.5); font-size: 18px;
      cursor: pointer; padding: 2px 8px;
      border-radius: 4px; transition: color 0.2s; line-height: 1;
    }
    #ariaPanelClose:hover { color: #00f0ff; }

    #ariaChatBox {
      flex: 1; max-height: 280px; overflow-y: auto;
      padding: 14px; display: flex;
      flex-direction: column; gap: 10px;
      scrollbar-width: thin;
      scrollbar-color: rgba(0,240,255,0.3) transparent;
    }
    #ariaChatBox::-webkit-scrollbar { width: 4px; }
    #ariaChatBox::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.3); border-radius: 4px; }

    .aria-msg {
      max-width: 92%; padding: 10px 14px;
      border-radius: 12px; font-size: 14px;
      line-height: 1.55; color: #c8d8e8;
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
      color: #ffccbb; align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .aria-msg strong { color: #00f0ff; }

    /* Typing indicator */
    .aria-typing {
      display: flex; align-items: center; gap: 5px;
      padding: 12px 16px;
      background: rgba(0,240,255,0.07);
      border: 1px solid rgba(0,240,255,0.18);
      border-radius: 12px; border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .aria-typing span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #00f0ff; display: inline-block;
      animation: typingDot 1.2s ease-in-out infinite;
    }
    .aria-typing span:nth-child(2) { animation-delay: 0.2s; }
    .aria-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingDot {
      0%,60%,100% { transform: translateY(0); opacity: 0.4; }
      30%          { transform: translateY(-5px); opacity: 1; }
    }

    /* Suggestion chips */
    #ariaSuggestions {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding: 8px 14px 0;
    }
    .aria-chip {
      font-size: 11px; padding: 4px 10px;
      border: 1px solid rgba(0,240,255,0.3);
      border-radius: 20px; color: rgba(0,240,255,0.7);
      cursor: pointer; background: rgba(0,240,255,0.05);
      transition: all 0.2s; white-space: nowrap;
      font-family: 'Rajdhani', sans-serif;
    }
    .aria-chip:hover {
      background: rgba(0,240,255,0.15);
      color: #00f0ff; border-color: #00f0ff;
    }

    #ariaInputRow {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px;
      border-top: 1px solid rgba(0,240,255,0.12);
      background: rgba(0,240,255,0.03);
    }
    #ariaMicBtn {
      width: 44px; height: 44px; min-width: 44px;
      border-radius: 50%;
      border: 2px solid #00f0ff;
      background: rgba(0,240,255,0.08);
      color: #00f0ff; display: flex;
      align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s ease;
    }
    #ariaMicBtn:hover { background: rgba(0,240,255,0.18); box-shadow: 0 0 16px rgba(0,240,255,0.4); }
    #ariaMicBtn.aria-listening {
      background: rgba(255,68,68,0.15) !important;
      border-color: #ff4444 !important; color: #ff4444 !important;
      box-shadow: 0 0 20px rgba(255,68,68,0.5) !important;
      animation: micPulse 0.8s ease-in-out infinite;
    }
    @keyframes micPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.12);} }
    #ariaHint { font-size: 13px; color: rgba(0,240,255,0.5); font-family:'Rajdhani',sans-serif; letter-spacing:0.5px; }

    @media (max-width: 420px) {
      #ariaPanel { width: calc(100vw - 20px); right: 10px !important; }
      #ariaBtn   { right: 10px !important; top: 70px !important; }
    }
  `;
  document.head.appendChild(style);

  /* ══════════════════════════════════════════════════
     KNOWLEDGE BASE — weighted topics with variants
  ══════════════════════════════════════════════════ */
  const knowledge = [
    {
      id: 'intro',
      weight: 10,
      keys: ['who are you','what are you','introduce','your name','about aria','what is aria','are you ai','are you a bot'],
      variants: [
        "I'm <strong>ARIA</strong> — Mohak Mittal's personal portfolio assistant. I'm here to tell you everything about his work, skills, and projects. What would you like to know?",
        "The name's <strong>ARIA</strong> — think of me as Mohak's digital representative. I can walk you through his skills, projects, experience, and how to reach him. Ask away!",
      ]
    },
    {
      id: 'about',
      weight: 9,
      keys: ['who is mohak','about mohak','tell me about him','about him','who is he','background','himself'],
      variants: [
        "Mohak Mittal is a passionate <strong>Game Developer</strong> from Barnala, Punjab, India. He specializes in <strong>Unreal Engine 5</strong> and <strong>Blender</strong>, and his core ambition is to build his own game studio from the ground up.",
        "Mohak is a driven developer and 3D artist from India, currently in his final semester of BCA. He lives and breathes game development — from crafting gameplay systems in C++ and Blueprint to sculpting photorealistic 3D environments in Blender.",
      ]
    },
    {
      id: 'skills',
      weight: 8,
      keys: ['skill','what can he do','technology','stack','tech','language','expertise','proficient','good at','capable','know','tools'],
      variants: [
        "Mohak's arsenal includes <strong>Unreal Engine 5</strong>, <strong>Blueprint Scripting</strong>, <strong>C++</strong>, <strong>Blender</strong>, Python, Java, HTML, and CSS. He's especially sharp in real-time 3D pipelines — Lumen lighting, Nanite geometry, Niagara VFX, and PBR texturing workflows.",
        "On the game dev side: UE5, Blueprint, C++, Lumen, Nanite, and Niagara VFX. On the art side: Blender, 3D modeling, UV unwrapping, and full PBR texturing. He also codes in Python, Java, and web technologies.",
      ]
    },
    {
      id: 'projects',
      weight: 8,
      keys: ['project','work','built','made','portfolio','what has he done','show me','his work','games','creations'],
      variants: [
        "Mohak's flagship project is a <strong>Checkpoint Car Game</strong> built in Unreal Engine 5 — a full open-world driving experience with Lumen lighting, Nanite geometry, and every 3D asset hand-crafted in Blender. He's also built <strong>ARIA</strong> (that's me!), a Python AI voice assistant using Groq Whisper and Llama 3.3.",
        "Two standout projects: first, an <strong>open-world car game</strong> in UE5 featuring a timer-based checkpoint system, dynamic weather, and custom Blender assets. Second, a <strong>Python AI assistant</strong> with voice recognition, Llama 3.3 as the brain, and screen control capabilities.",
      ]
    },
    {
      id: 'cargame',
      weight: 9,
      keys: ['car game','checkpoint','ue5 game','unreal game','racing game','driving','timer','checkpoint game'],
      variants: [
        "The <strong>Checkpoint Car Game</strong> is Mohak's BCA final semester project. Built entirely in Unreal Engine 5, it features a real-time timer system, checkpoint-based rewards (+10s per checkpoint), Blueprint visual scripting for game logic, Lumen global illumination, and every building and environment asset modeled from scratch in Blender.",
        "It's an open-world driving game where you race against the clock through checkpoints. What makes it impressive is the full pipeline — from Blueprint scripting and Lumen lighting in UE5, to custom FBX assets exported from Blender. A complete solo production.",
      ]
    },
    {
      id: 'blender',
      weight: 7,
      keys: ['blender','3d','model','render','sculpt','asset','geometry','mesh','texture','pbr','uv'],
      variants: [
        "Mohak has crafted <strong>150+ 3D models</strong> in Blender — architectural assets, environmental props, and game-ready meshes, all UV-unwrapped and textured with a full PBR workflow. Every single asset in his car game was built in Blender from scratch.",
        "Blender is one of Mohak's strongest tools. He works with high-poly sculpting, UV unwrapping, PBR material creation, and the FBX export pipeline into Unreal Engine. Over 150 models in his portfolio so far.",
      ]
    },
    {
      id: 'aria_project',
      weight: 8,
      keys: ['python project','voice assistant','ai assistant','groq','llama','whisper','aria project','your origin','how were you made'],
      variants: [
        "Mohak built an <strong>AI voice assistant</strong> in Python using Groq's Whisper API for speech recognition, Llama 3.3 70B as the intelligence layer, and pyttsx3 for text-to-speech. It also features file system indexing and screen control capabilities — a genuinely impressive standalone project.",
        "The ARIA project uses a real-time pipeline: voice input → Whisper transcription → Llama 3.3 processing → spoken response. Mohak built it entirely in Python with added features like file indexing and OS-level screen interaction.",
      ]
    },
    {
      id: 'contact',
      weight: 8,
      keys: ['contact','hire','reach','connect','collaborate','work together','get in touch','available','freelance','opportunity'],
      variants: [
        "Mohak is open to collaborations, freelance projects, and game development opportunities. You can find him on <strong>Instagram @mohakmittal92</strong> or explore his code on <strong>GitHub at github.com/Mohak-Mittal</strong>. Don't hesitate — he'd love to hear from you!",
        "The best way to reach Mohak is via <strong>Instagram (@mohakmittal92)</strong> or <strong>GitHub (github.com/Mohak-Mittal)</strong>. He's actively looking for collaborations and interesting projects to contribute to.",
      ]
    },
    {
      id: 'github',
      weight: 6,
      keys: ['github','repository','repo','code','open source','source code'],
      variants: [
        "Mohak's GitHub is <strong>github.com/Mohak-Mittal</strong> — head over there to see his repositories and code in action.",
        "You'll find Mohak's projects and repositories at <strong>github.com/Mohak-Mittal</strong>. Worth a visit!",
      ]
    },
    {
      id: 'instagram',
      weight: 6,
      keys: ['instagram','social media','insta','follow','social'],
      variants: [
        "Follow Mohak on Instagram at <strong>@mohakmittal92</strong> for his latest 3D renders, game dev updates, and creative work.",
        "His Instagram handle is <strong>@mohakmittal92</strong> — a good place to see his visual work and stay updated on new projects.",
      ]
    },
    {
      id: 'location',
      weight: 5,
      keys: ['location','where','from','city','country','india','barnala','punjab','based'],
      variants: [
        "Mohak is based in <strong>Barnala, Punjab, India</strong>. He's currently in his final semester of BCA and available for remote collaborations.",
        "He's from <strong>Barnala, Punjab, India</strong> — a dedicated developer building world-class work from a small city.",
      ]
    },
    {
      id: 'education',
      weight: 6,
      keys: ['education','study','college','degree','bca','university','student','qualification','academic'],
      variants: [
        "Mohak is pursuing a <strong>Bachelor of Computer Applications (BCA)</strong> at S.D. College Barnala, affiliated with Punjabi University Patiala. He's currently in his 6th and final semester.",
        "He's finishing a <strong>BCA degree</strong> at S.D. College Barnala under Punjabi University Patiala — final semester, and already building professional-level projects.",
      ]
    },
    {
      id: 'goal',
      weight: 7,
      keys: ['goal','dream','future','plan','studio','ambition','vision','where is he headed','aspiration'],
      variants: [
        "Mohak's ultimate vision is to <strong>found his own game studio</strong>. He's systematically building expertise in Unreal Engine 5 and C++ — the exact tools used by the world's top studios — to make that a reality.",
        "The long-term goal is crystal clear: <strong>his own game studio</strong>. Every project he builds, every skill he sharpens in UE5 and C++, is a step toward that dream.",
      ]
    },
    {
      id: 'experience',
      weight: 6,
      keys: ['experience','how long','since when','years','beginner','expert','level'],
      variants: [
        "Mohak has been actively building in game development and 3D art for over a year — shipping real, complete projects using Unreal Engine 5, Blender, Niagara VFX, Lumen, and Blueprint scripting.",
        "Over a year of hands-on experience, with tangible outputs: a shipped UE5 game, 150+ Blender models, and a functional AI assistant. He learns by building.",
      ]
    },
    {
      id: 'cv',
      weight: 5,
      keys: ['cv','resume','download','curriculum vitae'],
      variants: [
        "You can grab Mohak's CV directly from the <strong>About section</strong> of this portfolio — just hit the Download CV button. It covers his full skill set, projects, and contact details.",
        "The Download CV button on the About page has everything — his skills, projects, education, and contact info, neatly packaged.",
      ]
    },
    {
      id: 'ue5',
      weight: 7,
      keys: ['unreal engine','ue5','unreal','lumen','nanite','niagara','blueprint'],
      variants: [
        "Mohak works extensively with <strong>Unreal Engine 5</strong> — using Lumen for real-time global illumination, Nanite for virtualized geometry, Niagara for VFX systems, and Blueprint Visual Scripting for gameplay logic. C++ for deeper engine work.",
        "In UE5, Mohak handles the full pipeline: Blueprint scripting, Lumen lighting, Nanite meshes, Niagara particle effects, and the FBX asset import workflow from Blender. A complete end-to-end developer.",
      ]
    },
    {
      id: 'cplusplus',
      weight: 6,
      keys: ['c++','cpp','programming','code','coding','developer','software'],
      variants: [
        "C++ is one of Mohak's core focuses — particularly <strong>Unreal Engine C++</strong>. He's actively building on his foundational knowledge to move beyond Blueprint scripting and into deeper engine customization.",
        "Mohak codes in <strong>C++</strong> with a focus on Unreal Engine development. It's a key part of his roadmap to becoming a complete game developer.",
      ]
    },
  ];

  /* ── Context memory ── */
  let lastTopicId = null;
  const usedVariants = {};

  /* ── Suggestion chips per topic ── */
  const suggestions = {
    'default':    ['His skills', 'His projects', 'Contact him', 'His dream'],
    'about':      ['His skills', 'His projects', 'His education'],
    'skills':     ['UE5 skills', 'Blender work', 'C++ experience'],
    'projects':   ['Car game details', 'Blender work', 'Python project'],
    'cargame':    ['Blender assets', 'His UE5 skills', 'More projects'],
    'goal':       ['His projects', 'Contact him', 'His experience'],
    'contact':    ['His GitHub', 'His Instagram', 'Download CV'],
    'intro':      ['Who is Mohak?', 'His skills', 'His projects'],
  };

  /* ── Tokenize & score ── */
  function score(input, topic) {
    const lower = input.toLowerCase().replace(/[^\w\s]/g, '');
    const tokens = lower.split(/\s+/);
    let s = 0;
    for (const key of topic.keys) {
      if (lower.includes(key)) s += topic.weight * 2;
      else {
        const keyTokens = key.split(/\s+/);
        for (const kt of keyTokens) {
          if (tokens.some(t => t === kt || (t.length > 3 && kt.includes(t)) || (kt.length > 3 && t.includes(kt)))) {
            s += topic.weight;
          }
        }
      }
    }
    return s;
  }

  /* ── Detect follow-ups ── */
  function isFollowUp(input) {
    const lower = input.toLowerCase();
    return ['tell me more','more about','what else','explain','elaborate','go on','continue','and','anything else','what about that'].some(p => lower.includes(p));
  }

  /* ── Pick response variant (avoid repeats) ── */
  function pickVariant(topic) {
    const used = usedVariants[topic.id] || [];
    const available = topic.variants.filter((_, i) => !used.includes(i));
    const pool = available.length > 0 ? available : topic.variants;
    const idx = topic.variants.indexOf(pool[Math.floor(Math.random() * pool.length)]);
    usedVariants[topic.id] = [...(usedVariants[topic.id] || []).slice(-2), idx];
    return topic.variants[idx];
  }

  /* ── Get best response ── */
  function getResponse(input) {
    // Follow-up: expand on last topic
    if (isFollowUp(input) && lastTopicId) {
      const last = knowledge.find(k => k.id === lastTopicId);
      if (last && last.variants.length > 1) {
        const reply = pickVariant(last);
        return { text: reply, topicId: lastTopicId };
      }
    }

    // Score all topics
    const scored = knowledge
      .map(t => ({ topic: t, s: score(input, t) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s);

    if (scored.length > 0) {
      const best = scored[0].topic;
      lastTopicId = best.id;
      return { text: pickVariant(best), topicId: best.id };
    }

    // Smart fallback
    const fallbacks = [
      "That's an interesting question! I'm specifically trained on Mohak's portfolio. Try asking about his <strong>skills</strong>, <strong>projects</strong>, <strong>education</strong>, or <strong>how to contact him</strong>.",
      "I want to give you the right answer — could you rephrase that? I know everything about Mohak's <strong>game dev work</strong>, <strong>3D art</strong>, <strong>background</strong>, and <strong>contact details</strong>.",
      "Hmm, I didn't quite catch that. I'm best at answering questions about Mohak's <strong>projects</strong>, <strong>skills</strong>, and <strong>experience</strong>. What would you like to know?",
    ];
    return { text: fallbacks[Math.floor(Math.random() * fallbacks.length)], topicId: null };
  }

  /* ── Time-aware greeting ── */
  function getGreeting() {
    const h = new Date().getHours();
    const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const openers = [
      `${time}! I'm <strong>ARIA</strong>, Mohak's portfolio assistant. What would you like to know about him?`,
      `${time}! Welcome to Mohak's portfolio. I'm <strong>ARIA</strong> — ask me anything about his work, skills, or how to reach him.`,
    ];
    return openers[Math.floor(Math.random() * openers.length)];
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

    /* Update greeting with time-aware message */
    const firstMsg = chatBox.querySelector('.aria-msg-bot');
    if (firstMsg) firstMsg.innerHTML = getGreeting();

    /* Suggestion chips */
    const chipBar = document.createElement('div');
    chipBar.id = 'ariaSuggestions';
    chatBox.after(chipBar);

    function renderChips(topicId) {
      const chips = suggestions[topicId] || suggestions['default'];
      chipBar.innerHTML = chips.map(c => `<button class="aria-chip">${c}</button>`).join('');
      chipBar.querySelectorAll('.aria-chip').forEach(chip => {
        chip.addEventListener('click', function () {
          processInput(this.textContent);
        });
      });
    }
    renderChips('default');

    /* Add message */
    function addMsg(html, type) {
      const div = document.createElement('div');
      div.className = 'aria-msg aria-msg-' + type;
      div.innerHTML = html;
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
      return div;
    }

    /* Typing indicator */
    function showTyping() {
      const t = document.createElement('div');
      t.className = 'aria-typing';
      t.innerHTML = '<span></span><span></span><span></span>';
      chatBox.appendChild(t);
      chatBox.scrollTop = chatBox.scrollHeight;
      return t;
    }

    /* Process input (from mic or chip) */
    function processInput(text) {
      addMsg(text, 'user');
      const typing = showTyping();
      const delay = 600 + Math.random() * 500; // feels natural
      setTimeout(function () {
        typing.remove();
        const result = getResponse(text);
        addMsg(result.text, 'bot');
        renderChips(result.topicId || 'default');
        speak(result.text.replace(/<[^>]+>/g, '')); // strip HTML for TTS
      }, delay);
    }

    /* Toggle panel */
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.classList.contains('aria-open')) {
        panel.classList.remove('aria-open');
        btn.style.animationPlayState = 'running';
      } else {
        panel.classList.add('aria-open');
        btn.style.animationPlayState = 'paused';
        chatBox.scrollTop = chatBox.scrollHeight;
        // Request mic permission silently once
        if (!btn._micRequested) {
          btn._micRequested = true;
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia({ audio: true })
            .then(s => s.getTracks().forEach(t => t.stop()))
            .catch(() => {});
        }
      }
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.remove('aria-open');
      btn.style.animationPlayState = 'running';
    });

    /* Voice */
    let cachedVoice = null;
    function getFemaleVoice() {
      if (cachedVoice) return cachedVoice;
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;
      const priority = ['Microsoft Aria','Microsoft Jenny','Microsoft Zira','Microsoft Eva','Google UK English Female','Samantha','Victoria','Karen','Moira','Fiona','Tessa'];
      for (const name of priority) {
        const v = voices.find(v => v.name.includes(name));
        if (v) { cachedVoice = v; return v; }
      }
      cachedVoice = voices.find(v => v.name.toLowerCase().includes('female'))
                 || voices.find(v => v.lang === 'en-GB')
                 || voices.find(v => v.lang && v.lang.startsWith('en'))
                 || null;
      return cachedVoice;
    }
    window.speechSynthesis.addEventListener('voiceschanged', function () { cachedVoice = null; getFemaleVoice(); }, { once: true });

    function speak(text) {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.05; utt.pitch = 1.2; utt.volume = 1;
      const v = getFemaleVoice();
      if (v) utt.voice = v;
      window.speechSynthesis.speak(utt);
    }

    /* Speech Recognition */
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
        addMsg('Microphone access was denied. Please allow mic permissions to use voice input.', 'bot');
    };
    recog.onresult = function (e) {
      const said = e.results[0][0].transcript.trim();
      processInput(said);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();