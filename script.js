/* =====================================================
   ZEN & ZEBA — CINEMATIC WEDDING INVITATION
   Vanilla JS + GSAP + ScrollTrigger + Lenis
===================================================== */

gsap.registerPlugin(ScrollTrigger);

/* -----------------------------------------------------
   1. SMOOTH SCROLL — LENIS
----------------------------------------------------- */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* -----------------------------------------------------
   2. SPLIT TEXT (manual — no paid plugin)
   Wraps each character in a span for reveal animation.
----------------------------------------------------- */
function splitChars(el){
  const text = el.textContent;
  el.textContent = '';
  const frag = document.createDocumentFragment();
  [...text].forEach((ch) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.style.display = 'inline-block';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    frag.appendChild(span);
  });
  el.appendChild(frag);
  return el.querySelectorAll('.char');
}

/* -----------------------------------------------------
   3. LOADER
----------------------------------------------------- */
function runLoader(){
  const loader = document.getElementById('loader');
  const names = document.querySelectorAll('#loader [data-split]');
  const bar = document.querySelector('.loader-bar-fill');
  const heart = document.querySelector('.loader-heart');

  let charSets = [];
  names.forEach(n => charSets.push(splitChars(n)));
  gsap.set(charSets.flat(), { yPercent: 120, opacity: 0 });
  gsap.set(heart, { scale: 0, opacity: 0 });

  const tl = gsap.timeline({
    onComplete: () => initSite()
  });

  tl.to(charSets[0], { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: 'power4.out' })
    .to(heart, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(3)' }, '-=0.4')
    .to(charSets[1], { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: 'power4.out' }, '-=0.3')
    .to(bar, { width: '100%', duration: 1.1, ease: 'power2.inOut' }, '-=0.6')
    .to('.loader-inner', { opacity: 0, y: -20, duration: 0.6, ease: 'power2.in' }, '+=0.3')
    .to(loader, {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 1.1,
      ease: 'power4.inOut',
      onComplete: () => { loader.style.display = 'none'; }
    }, '-=0.2');
}
document.querySelector('#loader').style.clipPath = 'circle(150% at 50% 50%)';

window.addEventListener('load', () => {
  // small delay so fonts/paint settle
  setTimeout(runLoader, 300);
});

/* -----------------------------------------------------
   4. BACKGROUND ATMOSPHERE — stars, hearts, petals
----------------------------------------------------- */
function buildAtmosphere(){
  const starsLayer = document.getElementById('starsLayer');
  const heartsField = document.getElementById('heartsField');
  const petalsField = document.getElementById('petalsField');

  for (let i = 0; i < 40; i++){
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 5) + 's';
    starsLayer.appendChild(s);
  }
  for (let i = 0; i < 14; i++){
    const h = document.createElement('div');
    h.className = 'float-heart';
    h.textContent = '❤';
    h.style.left = Math.random() * 100 + '%';
    h.style.fontSize = (10 + Math.random() * 14) + 'px';
    h.style.animationDuration = (14 + Math.random() * 12) + 's';
    h.style.animationDelay = (Math.random() * 14) + 's';
    heartsField.appendChild(h);
  }
  for (let i = 0; i < 22; i++){
    const p = document.createElement('div');
    p.className = 'float-petal';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (10 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 12) + 's';
    petalsField.appendChild(p);
  }
}

/* -----------------------------------------------------
   5. CURSOR GLOW (desktop only, smooth lerp via GSAP)
----------------------------------------------------- */
function initCursorGlow(){
  const glow = document.getElementById('cursorGlow');
  if (!window.matchMedia('(hover:hover)').matches) return;
  const xTo = gsap.quickTo(glow, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(glow, 'y', { duration: 0.6, ease: 'power3' });
  window.addEventListener('mousemove', (e) => {
    xTo(e.clientX - 210);
    yTo(e.clientY - 210);
  });
}

/* -----------------------------------------------------
   6. CLICK RIPPLE + FLOATING HEART ON CLICK
----------------------------------------------------- */
function initClickEffects(){
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px; width:10px; height:10px;
      margin:-5px 0 0 -5px; border-radius:50%; pointer-events:none; z-index:9500;
      border:1px solid rgba(201,160,138,0.8);`;
    document.body.appendChild(ripple);
    gsap.to(ripple, { width: 90, height: 90, marginLeft: -45, marginTop: -45, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });

    const heart = document.createElement('div');
    heart.textContent = '❤';
    heart.style.cssText = `
      position:fixed; left:${e.clientX}px; top:${e.clientY}px; pointer-events:none; z-index:9500;
      color:#C9A08A; font-size:14px;`;
    document.body.appendChild(heart);
    gsap.to(heart, { y: -70, x: (Math.random() - 0.5) * 60, opacity: 0, duration: 1.1, ease: 'power2.out', onComplete: () => heart.remove() });
  });
}

/* -----------------------------------------------------
   7. GOLDEN THREAD — signature scroll element
   Two lines converge into one as the page progresses,
   visualising "Two Hearts. One Destiny."
----------------------------------------------------- */
function initThread(){
  const svg = document.getElementById('threadSvg');
  const left = document.getElementById('threadLeft');
  const right = document.getElementById('threadRight');
  const maxOffset = 26; // px separation at start

  function draw(progress){
    const docH = document.body.scrollHeight;
    svg.setAttribute('viewBox', `0 0 100 ${docH}`);
    svg.setAttribute('height', docH);

    // merge fully by 45% scroll progress
    const mergeP = Math.min(progress / 0.45, 1);
    const offset = maxOffset * (1 - mergeP);

    const steps = 24;
    let dLeft = `M ${50 - offset} 0 `;
    let dRight = `M ${50 + offset} 0 `;
    for (let i = 1; i <= steps; i++){
      const t = i / steps;
      const y = t * docH;
      const wobble = Math.sin(t * Math.PI * 6 + progress * 10) * 4 * (1 - mergeP * 0.6);
      dLeft += `L ${50 - offset + wobble} ${y} `;
      dRight += `L ${50 + offset - wobble} ${y} `;
    }
    left.setAttribute('d', dLeft);
    right.setAttribute('d', dRight);
  }

  draw(0);
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => draw(self.progress),
    onRefresh: (self) => draw(self.progress),
  });
  window.addEventListener('resize', () => draw(ScrollTrigger.getById ? 0 : 0));
}

/* -----------------------------------------------------
   8. SCROLL REVEAL ANIMATIONS
----------------------------------------------------- */
function initScrollReveals(){
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.fromTo(el, { y: 50, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
  gsap.utils.toArray('.reveal-left').forEach((el) => {
    gsap.fromTo(el, { x: -70, opacity: 0 }, {
      x: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });
  gsap.utils.toArray('.reveal-right').forEach((el) => {
    gsap.fromTo(el, { x: 70, opacity: 0 }, {
      x: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });
  gsap.utils.toArray('.reveal-scale').forEach((el) => {
    gsap.fromTo(el, { scale: 0.88, opacity: 0 }, {
      scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Section-level headings split reveal (character animation)
  document.querySelectorAll('[data-split]:not(#loader [data-split])').forEach((el) => {
    const chars = splitChars(el);
    gsap.fromTo(chars, { yPercent: 130, opacity: 0, rotate: 6 }, {
      yPercent: 0, opacity: 1, rotate: 0, duration: 0.9, stagger: 0.02, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });
}

/* -----------------------------------------------------
   9. HERO PARALLAX (mouse move)
----------------------------------------------------- */
function initHeroParallax(){
  const frame = document.querySelector('.hero-frame');
  const hero = document.getElementById('hero');
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(frame, { x: px * 18, y: py * 12, duration: 0.8, ease: 'power3.out' });
  });
}

/* -----------------------------------------------------
   10. TIMELINE CARDS — pin-ish stagger via ScrollTrigger
----------------------------------------------------- */
function initTimeline(){
  gsap.utils.toArray('.timeline-item').forEach((item) => {
    const card = item.querySelector('.timeline-card');
    const node = item.querySelector('.timeline-node');
    const fromX = item.dataset.side === 'left' ? -60 : 60;
    gsap.fromTo(card, { x: fromX, opacity: 0 }, {
      x: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 82%' }
    });
    gsap.fromTo(node, { scale: 0 }, {
      scale: 1, duration: 0.6, ease: 'back.out(3)',
      scrollTrigger: { trigger: item, start: 'top 80%' }
    });
  });
}

/* -----------------------------------------------------
   11. QUOTES — soft blur reveal one by one
----------------------------------------------------- */
function initQuotes(){
  gsap.utils.toArray('.quote-item').forEach((q) => {
    gsap.fromTo(q, { opacity: 0, filter: 'blur(10px)', y: 30 }, {
      opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: q, start: 'top 85%' }
    });
  });
}

/* -----------------------------------------------------
   12. COUNTDOWN — Save the Date
----------------------------------------------------- */
function initCountdown(){
  function nextTargetDate(){
    const now = new Date();
    let year = now.getFullYear();
    let target = new Date(year, 7, 14, 0, 0, 0); // August is month index 7
    if (target.getTime() < now.getTime()) target = new Date(year + 1, 7, 14, 0, 0, 0);
    return target;
  }
  const target = nextTargetDate();
  const d = document.getElementById('cdDays');
  const h = document.getElementById('cdHours');
  const m = document.getElementById('cdMins');
  const s = document.getElementById('cdSecs');

  function tick(){
    const diff = Math.max(0, target.getTime() - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    d.textContent = String(days).padStart(2, '0');
    h.textContent = String(hours).padStart(2, '0');
    m.textContent = String(mins).padStart(2, '0');
    s.textContent = String(secs).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
}

/* -----------------------------------------------------
   13. MUSIC CONTROL
----------------------------------------------------- */
function initMusic(){
  const btn = document.getElementById('musicBtn');
  const audio = document.getElementById('bgAudio');
  let playing = false;

  btn.addEventListener('click', () => {
    if (playing){
      audio.pause();
      btn.classList.remove('playing');
    } else {
      audio.play().catch(() => { /* autoplay/policy restriction — user gesture required, this click satisfies it */ });
      btn.classList.add('playing');
    }
    playing = !playing;
  });
}

/* -----------------------------------------------------
   14. QUOTE MARQUEE-ISH SPACING REFRESH ON RESIZE
----------------------------------------------------- */
function initResizeRefresh(){
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
  });
}

/* -----------------------------------------------------
   INIT SITE — called once loader completes
----------------------------------------------------- */
function initSite(){
  initHeroParallax();
  initScrollReveals();
  initTimeline();
  initQuotes();
  ScrollTrigger.refresh();
}

/* -----------------------------------------------------
   BOOT — things that don't need to wait for the loader
----------------------------------------------------- */
buildAtmosphere();
initCursorGlow();
initClickEffects();
initThread();
initCountdown();
initMusic();
initResizeRefresh();
