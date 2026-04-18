// ============================================
// ANDROID VIEWPORT HEIGHT FIX
// ============================================
function setVh() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
setVh();
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', () => setTimeout(setVh, 200));

// ============================================
// CURSOR GLOW — desktop only
// ============================================
const cursorGlow = document.getElementById('cursorGlow');
const isTouch    = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
if (isTouch) {
  cursorGlow.style.display = 'none';
} else {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
  });
}

// ============================================
// EMAILJS — put your real keys here
// ============================================
const EMAILJS_SERVICE_ID  = '';   // ← paste your Service ID
const EMAILJS_TEMPLATE_ID = '';   // ← paste your Template ID
const EMAILJS_PUBLIC_KEY  = '';   // ← paste your Public Key
try {
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
} catch(e) {
  console.warn('EmailJS not loaded:', e);
}

// ============================================
// PARTICLE CANVAS
// ============================================
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H, particles;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  const density = isTouch ? 18000 : 11000;
  const count   = Math.floor((W * H) / density);
  for (let i = 0; i < count; i++) {
    particles.push({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.4 + 0.3,
      dx:    (Math.random() - 0.5) * 0.3,
      dy:    (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.45 + 0.1,
      color: Math.random() > 0.5 ? '0,240,255' : '123,47,255',
    });
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,240,255,${0.032 * (1 - d / 100)})`;
        ctx.lineWidth   = 0.4;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
    ctx.fill();
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > W) p.dx *= -1;
    if (p.y < 0 || p.y > H) p.dy *= -1;
  });
  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
resizeCanvas();
createParticles();
animateParticles();

// ============================================
// PAGE NAVIGATION
// ============================================
const navBtns     = document.querySelectorAll('.nav-btn');
let currentPage   = 'home';
let transitioning = false;

function navigateTo(targetPage) {
  if (targetPage === currentPage || transitioning) return;
  transitioning = true;
  const outPage = document.getElementById('page-' + currentPage);
  const inPage  = document.getElementById('page-' + targetPage);
  if (!outPage || !inPage) { transitioning = false; return; }
  outPage.classList.add('exiting');
  setTimeout(() => {
    outPage.classList.remove('active', 'exiting');
    inPage.querySelectorAll('.pop-in').forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
    });
    if (targetPage === 'skills') {
      inPage.querySelectorAll('.skill-fill').forEach(f => {
        f.style.transition = 'none';
        f.style.width = '0%';
        f.offsetHeight;
        f.style.transition = '';
      });
      setTimeout(triggerSkillBars, 80);
    }
    inPage.classList.add('active', 'entering');
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.page === targetPage));
    currentPage = targetPage;
    setTimeout(() => {
      inPage.classList.remove('entering');
      transitioning = false;
    }, 360);
  }, 190);
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.project-modal'))        return;
  if (e.target.closest('.project-detail-page'))  return;
  if (e.target.closest('.ue-list-overlay'))       return;
  if (e.target.closest('.blender-feed-overlay'))  return;
  const el = e.target.closest('[data-page]');
  if (el && el.dataset.page) navigateTo(el.dataset.page);
});

// ============================================
// HAMBURGER
// ============================================
const hamburger = document.getElementById('hamburger');
const navMenu   = document.querySelector('.nav-links');
hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  navMenu.classList.toggle('open');
});
document.addEventListener('click', () => navMenu.classList.remove('open'));

// ============================================
// IMAGE CAROUSEL
// ============================================
const track    = document.getElementById('carouselTrack');
const dotsWrap = document.getElementById('carouselDots');
const prevBtn  = document.getElementById('carouselPrev');
const nextBtn  = document.getElementById('carouselNext');
let currentSlide = 0;
let totalSlides  = 0;

function initCarousel() {
  const imgs  = track.querySelectorAll('.carousel-img');
  totalSlides = imgs.length;
  if (totalSlides === 0) return;
  dotsWrap.innerHTML = '';
  imgs.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
  goToSlide(0);
}

function goToSlide(index) {
  currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
  track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
  dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
}

prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide - 1); });
nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide + 1); });

let touchStartX = 0;
track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend',   (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
});

// ============================================
// PROJECT MODAL
// ============================================
const modal      = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');

modalClose.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

function closeModal() {
  const inner = modal.querySelector('.modal-inner');
  inner.style.transform  = 'scale(0.9)';
  inner.style.opacity    = '0';
  inner.style.transition = 'transform 0.22s ease, opacity 0.2s ease';
  setTimeout(() => {
    modal.classList.remove('open');
    inner.style.transform = inner.style.opacity = inner.style.transition = '';
  }, 230);
}

// ============================================
// UNREAL LIST POPUP
// ============================================
const ueListOverlay = document.getElementById('ueListOverlay');
const openUeList    = document.getElementById('openUeList');
const ueListClose   = document.getElementById('ueListClose');
const ueProject1    = document.getElementById('ueProject1');

openUeList.addEventListener('click', (e) => {
  e.stopPropagation();
  ueListOverlay.classList.add('open');
});
ueListClose.addEventListener('click', () => ueListOverlay.classList.remove('open'));
ueListOverlay.addEventListener('click', (e) => {
  if (e.target === ueListOverlay) ueListOverlay.classList.remove('open');
});

ueProject1.addEventListener('click', () => {
  ueListOverlay.classList.remove('open');
  setTimeout(() => { modal.classList.add('open'); initCarousel(); }, 250);
});

// ============================================
// BLENDER FEED POPUP
// ============================================
const blenderFeedOverlay = document.getElementById('blenderFeedOverlay');
const openBlenderFeed    = document.getElementById('openBlenderFeed');
const blenderFeedClose   = document.getElementById('blenderFeedClose');

openBlenderFeed.addEventListener('click', (e) => {
  e.stopPropagation();
  blenderFeedOverlay.classList.add('open');
  document.getElementById('blenderFeedScroll').scrollTop = 0;
});
blenderFeedClose.addEventListener('click', () => blenderFeedOverlay.classList.remove('open'));

// ============================================
// LIKE BUTTON — fully fixed
// ============================================
function toggleLike(btnId, countId) {
  const btn   = document.getElementById(btnId);
  const count = document.getElementById(countId);
  if (!btn || !count) return;

  const isNowLiked = btn.classList.toggle('liked');
  const current    = parseInt(count.textContent) || 0;
  count.textContent = isNowLiked ? current + 1 : Math.max(0, current - 1);

  const path = btn.querySelector('path');
  if (path) {
    path.style.fill   = isNowLiked ? '#ff2d78' : 'none';
    path.style.stroke = '#ff2d78';
  }

  btn.style.transform = 'scale(1.3)';
  setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
}

// ============================================
// PROJECT DETAIL PAGE
// ============================================
const detailPage  = document.getElementById('projectDetailPage');
const viewLiveBtn = document.getElementById('viewLiveBtn');
const detailBack  = document.getElementById('detailBack');
const detailBack2 = document.getElementById('detailBack2');

viewLiveBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  closeModal();
  setTimeout(() => { detailPage.classList.add('open'); detailPage.scrollTop = 0; }, 260);
});

function closeDetailPage() {
  detailPage.classList.remove('open');
  const iframe = document.getElementById('projectVideoIframe');
  if (iframe) {
    const src = iframe.src;
    iframe.src = '';
    setTimeout(() => { iframe.src = src; }, 100);
  }
}

detailBack.addEventListener('click',  closeDetailPage);
detailBack2.addEventListener('click', closeDetailPage);

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
  if (modal.classList.contains('open')) {
    if (e.key === 'ArrowLeft')  goToSlide(currentSlide - 1);
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
  }
  if (e.key === 'Escape') {
    if (detailPage.classList.contains('open'))           { closeDetailPage(); return; }
    if (modal.classList.contains('open'))                { closeModal();      return; }
    if (ueListOverlay.classList.contains('open'))        { ueListOverlay.classList.remove('open'); return; }
    if (blenderFeedOverlay.classList.contains('open'))   { blenderFeedOverlay.classList.remove('open'); return; }
  }
  if (!modal.classList.contains('open') && !detailPage.classList.contains('open') &&
      !ueListOverlay.classList.contains('open') && !blenderFeedOverlay.classList.contains('open')) {
    const map = { '1':'home','2':'about','3':'skills','4':'projects','5':'contact' };
    if (map[e.key]) navigateTo(map[e.key]);
  }
});

// ============================================
// PROJECT CARD MOUSE GLOW
// ============================================
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width)  * 100;
    const y = ((e.clientY - r.top)  / r.height) * 100;
    const g = card.querySelector('.project-glow');
    if (g) g.style.background = 'radial-gradient(circle at ' + x + '% ' + y + '%, rgba(0,240,255,0.09) 0%, transparent 58%)';
  });
});

// ============================================
// SKILL BARS
// ============================================
function triggerSkillBars() {
  document.querySelectorAll('.skill-fill').forEach(f => { f.style.width = f.dataset.width + '%'; });
}

// ============================================
// TYPING EFFECT
// ============================================
const phrases = [
  'Unreal Engine Developer',
  '3D Artist & Blender Pro',
  'Game World Builder',
  'Blueprint & C++ Coder',
  'Immersive Experience Creator',
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typedText');

function type() {
  const c = phrases[phraseIdx];
  if (!deleting) {
    typedEl.textContent = c.slice(0, ++charIdx);
    if (charIdx === c.length) { deleting = true; setTimeout(type, 1800); return; }
  } else {
    typedEl.textContent = c.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
  }
  setTimeout(type, deleting ? 42 : 82);
}
setTimeout(type, 800);

// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contactForm');
const sendBtn     = document.getElementById('sendBtn');
const sendBtnText = document.getElementById('sendBtnText');
const formStatus  = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    sendBtn.disabled        = true;
    sendBtnText.textContent = 'Sending...';
    formStatus.textContent  = '';
    formStatus.className    = 'form-status';
    const params = {
      from_name:  contactForm.from_name.value,
      from_email: contactForm.from_email.value,
      subject:    contactForm.subject.value || 'Portfolio Contact',
      message:    contactForm.message.value,
      to_email:   'mittalmohak0@gmail.com',
    };
    try {
      if (typeof emailjs === 'undefined') throw new Error('EmailJS not loaded');
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      sendBtnText.textContent  = 'Message Sent!';
      sendBtn.style.background = 'linear-gradient(135deg,#00ff88,#00c8ff)';
      formStatus.textContent   = 'Thanks! Mohak will get back to you soon.';
      formStatus.className     = 'form-status success';
      contactForm.reset();
      setTimeout(() => {
        sendBtnText.textContent  = 'Send Message';
        sendBtn.style.background = '';
        sendBtn.disabled         = false;
        formStatus.textContent   = '';
      }, 4000);
    } catch (err) {
      sendBtnText.textContent  = 'Failed - Try Again';
      sendBtn.style.background = 'linear-gradient(135deg,#ff2d78,#ff6b35)';
      formStatus.textContent   = 'Something went wrong. Email: mittalmohak0@gmail.com';
      formStatus.className     = 'form-status error';
      sendBtn.disabled         = false;
      setTimeout(() => {
        sendBtnText.textContent  = 'Send Message';
        sendBtn.style.background = '';
        formStatus.textContent   = '';
      }, 5000);
    }
  });
}

// ============================================
// GLOW PULSE
// ============================================
function glowPulse() {
  document.querySelectorAll('.stat-num').forEach(el => {
    el.style.textShadow = '0 0 ' + (16 + Math.random() * 16) + 'px rgba(0,240,255,' + (0.3 + Math.random() * 0.4) + ')';
  });
  setTimeout(glowPulse, 800 + Math.random() * 700);
}
glowPulse();