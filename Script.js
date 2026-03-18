/* ============================================
   PORTFOLIO - script.js
   Carousel | Detail Page | Modal | EmailJS
============================================ */
 
// ============================================
// EMAILJS — paste your IDs here
// ============================================
const EMAILJS_SERVICE_ID  = 'service_15blu5y';
const EMAILJS_TEMPLATE_ID = 'template_zbpt2qr';
const EMAILJS_PUBLIC_KEY  = 'Cebhyt0R5eP56EYvW';

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
 
 
// ============================================
// CURSOR GLOW
// ============================================
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});
 
 
// ============================================
// PARTICLE CANVAS
// ============================================
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H, particles;
 
function resizeCanvas() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
function createParticles() {
  particles = [];
  const count = Math.floor((W * H) / 11000);
  for (let i = 0; i < count; i++) {
    particles.push({ x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.4+0.3, dx:(Math.random()-0.5)*0.3, dy:(Math.random()-0.5)*0.3, alpha:Math.random()*0.45+0.1, color:Math.random()>0.5?'0,240,255':'123,47,255' });
  }
}
function animateParticles() {
  ctx.clearRect(0,0,W,H);
  for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
    const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
    if (d<100) { ctx.beginPath(); ctx.strokeStyle=`rgba(0,240,255,${0.032*(1-d/100)})`; ctx.lineWidth=0.4; ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke(); }
  }
  particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=`rgba(${p.color},${p.alpha})`; ctx.fill(); p.x+=p.dx; p.y+=p.dy; if(p.x<0||p.x>W)p.dx*=-1; if(p.y<0||p.y>H)p.dy*=-1; });
  requestAnimationFrame(animateParticles);
}
window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
resizeCanvas(); createParticles(); animateParticles();
 
 
// ============================================
// PAGE NAVIGATION
// ============================================
const allPages   = document.querySelectorAll('.page');
const navBtns    = document.querySelectorAll('.nav-btn');
let currentPage  = 'home';
let transitioning = false;
 
function navigateTo(targetPage) {
  if (targetPage === currentPage || transitioning) return;
  transitioning = true;
  const outPage = document.getElementById('page-' + currentPage);
  const inPage  = document.getElementById('page-' + targetPage);
  if (!outPage || !inPage) { transitioning = false; return; }
  outPage.classList.add('exiting');
  setTimeout(() => {
    outPage.classList.remove('active','exiting');
    inPage.querySelectorAll('.pop-in').forEach(el => { el.style.animation='none'; el.offsetHeight; el.style.animation=''; });
    if (targetPage === 'skills') { inPage.querySelectorAll('.skill-fill').forEach(f => { f.style.transition='none'; f.style.width='0%'; f.offsetHeight; f.style.transition=''; }); setTimeout(triggerSkillBars,80); }
    inPage.classList.add('active','entering');
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.page===targetPage));
    currentPage = targetPage;
    setTimeout(() => { inPage.classList.remove('entering'); transitioning=false; }, 360);
  }, 190);
}
 
// Global click router — skip if inside modal or detail page
document.addEventListener('click', (e) => {
  if (e.target.closest('.project-modal') || e.target.closest('.project-detail-page')) return;
  const el = e.target.closest('[data-page]');
  if (el && el.dataset.page) navigateTo(el.dataset.page);
});
 
 
// ============================================
// HAMBURGER
// ============================================
const hamburger = document.getElementById('hamburger');
const navMenu   = document.querySelector('.nav-links');
hamburger.addEventListener('click', (e) => { e.stopPropagation(); navMenu.classList.toggle('open'); });
document.addEventListener('click', () => navMenu.classList.remove('open'));
 
 
// ============================================
// IMAGE CAROUSEL
// ============================================
const track      = document.getElementById('carouselTrack');
const dotsWrap   = document.getElementById('carouselDots');
const prevBtn    = document.getElementById('carouselPrev');
const nextBtn    = document.getElementById('carouselNext');
 
let currentSlide = 0;
let totalSlides  = 0;
 
function initCarousel() {
  const imgs = track.querySelectorAll('.carousel-img');
  totalSlides = imgs.length;
  if (totalSlides === 0) return;
 
  // Build dots
  dotsWrap.innerHTML = '';
  imgs.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i+1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });
 
  goToSlide(0);
}
 
function goToSlide(index) {
  currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
 
  // Update dots
  dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
 
  // Update arrow states
  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === totalSlides - 1;
}
 
prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide - 1); });
nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide + 1); });
 
// Keyboard left/right inside modal
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('projectModal');
  if (!modal.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  goToSlide(currentSlide - 1);
  if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
});
 
// Touch/swipe support for carousel
let touchStartX = 0;
track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend',   (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
});
 
 
// ============================================
// PROJECT MODAL — open / close
// ============================================
const modal       = document.getElementById('projectModal');
const openModalBtn = document.getElementById('openModalBtn');
const modalClose  = document.getElementById('modalClose');
 
openModalBtn.addEventListener('click', () => {
  modal.classList.add('open');
  initCarousel(); // reset carousel every time modal opens
});
modalClose.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
 
function closeModal() {
  const inner = modal.querySelector('.modal-inner');
  inner.style.transform  = 'scale(0.9)';
  inner.style.opacity    = '0';
  inner.style.transition = 'transform 0.22s ease,opacity 0.2s ease';
  setTimeout(() => {
    modal.classList.remove('open');
    inner.style.transform = inner.style.opacity = inner.style.transition = '';
  }, 230);
}
 
 
// ============================================
// PROJECT DETAIL PAGE — open / close
// ============================================
const detailPage  = document.getElementById('projectDetailPage');
const viewLiveBtn = document.getElementById('viewLiveBtn');
const detailBack  = document.getElementById('detailBack');
const detailBack2 = document.getElementById('detailBack2');
 
viewLiveBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  // Close modal first, then open detail page
  closeModal();
  setTimeout(() => {
    detailPage.classList.add('open');
    detailPage.scrollTop = 0; // always start at top
  }, 260);
});
 
function closeDetailPage() {
  detailPage.classList.remove('open');
  // Stop any playing video to avoid audio continuing
  const iframe = document.getElementById('projectVideoIframe');
  if (iframe) {
    // Reset iframe src to stop video
    const src = iframe.src;
    iframe.src = '';
    setTimeout(() => { iframe.src = src; }, 100);
  }
}
 
detailBack.addEventListener('click',  closeDetailPage);
detailBack2.addEventListener('click', closeDetailPage);
 
// Escape key closes detail page (or modal)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (detailPage.classList.contains('open')) { closeDetailPage(); return; }
    if (modal.classList.contains('open'))      { closeModal(); }
  }
});
 
 
// ============================================
// PROJECT CARD MOUSE GLOW
// ============================================
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r=card.getBoundingClientRect(), x=((e.clientX-r.left)/r.width)*100, y=((e.clientY-r.top)/r.height)*100;
    const g=card.querySelector('.project-glow'); if(g) g.style.background=`radial-gradient(circle at ${x}% ${y}%,rgba(0,240,255,0.09) 0%,transparent 58%)`;
  });
});
 
 
// ============================================
// SKILL BARS
// ============================================
function triggerSkillBars() { document.querySelectorAll('.skill-fill').forEach(f => { f.style.width=f.dataset.width+'%'; }); }
 
 
// ============================================
// TYPING EFFECT
// ============================================
const phrases = ['Unreal Engine Developer','3D Artist & Blender Pro','Game World Builder','Blueprint & C++ Coder','Immersive Experience Creator'];
let phraseIdx=0, charIdx=0, deleting=false;
const typedEl = document.getElementById('typedText');
function type() {
  const c=phrases[phraseIdx];
  if (!deleting) { typedEl.textContent=c.slice(0,++charIdx); if(charIdx===c.length){deleting=true;setTimeout(type,1800);return;} }
  else { typedEl.textContent=c.slice(0,--charIdx); if(charIdx===0){deleting=false;phraseIdx=(phraseIdx+1)%phrases.length;} }
  setTimeout(type,deleting?42:82);
}
setTimeout(type,800);
 
 
// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contactForm');
const sendBtn     = document.getElementById('sendBtn');
const sendBtnText = document.getElementById('sendBtnText');
const formStatus  = document.getElementById('formStatus');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); sendBtn.disabled=true; sendBtnText.textContent='Sending...'; formStatus.textContent=''; formStatus.className='form-status';
    const params = { from_name:contactForm.from_name.value, from_email:contactForm.from_email.value, subject:contactForm.subject.value||'Portfolio Contact', message:contactForm.message.value, to_email:'mohakmittal92@gmail.com' };
    try {
      await emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,params);
      sendBtnText.textContent='✓ Message Sent!'; sendBtn.style.background='linear-gradient(135deg,#00ff88,#00c8ff)';
      formStatus.textContent='Thanks! Mohak will get back to you soon.'; formStatus.className='form-status success'; contactForm.reset();
      setTimeout(()=>{sendBtnText.textContent='Send Message';sendBtn.style.background='';sendBtn.disabled=false;formStatus.textContent='';},4000);
    } catch(err) {
      sendBtnText.textContent='Failed — Try Again'; sendBtn.style.background='linear-gradient(135deg,#ff2d78,#ff6b35)';
      formStatus.textContent='Something went wrong. Email: mohakmittal92@gmail.com'; formStatus.className='form-status error'; sendBtn.disabled=false;
      setTimeout(()=>{sendBtnText.textContent='Send Message';sendBtn.style.background='';formStatus.textContent='';},5000);
    }
  });
}
 
 
// ============================================
// GLOW PULSE
// ============================================
function glowPulse() { document.querySelectorAll('.stat-num').forEach(el=>{el.style.textShadow=`0 0 ${16+Math.random()*16}px rgba(0,240,255,${0.3+Math.random()*0.4})`;}); setTimeout(glowPulse,800+Math.random()*700); }
glowPulse();
 
 
// ============================================
// KEYBOARD SHORTCUTS (1–5 for pages)
// ============================================
const pageKeys={'1':'home','2':'about','3':'skills','4':'projects','5':'contact'};
document.addEventListener('keydown',(e)=>{
  if (modal.classList.contains('open')) return;
  if (detailPage.classList.contains('open')) return;
  if (pageKeys[e.key]) navigateTo(pageKeys[e.key]);
});