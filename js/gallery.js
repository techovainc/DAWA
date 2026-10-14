/* DAWA — product photo slideshow
   Crossfading slides with autoplay, arrows, dots, swipe and keyboard support.
   Autoplay pauses on hover/focus, while off-screen or in a hidden tab, and is
   off entirely for visitors who prefer reduced motion. */
function mountGallery(root) {
  const slides = [...root.querySelectorAll('.gallery__slide')];
  const dots = [...root.querySelectorAll('.gallery__dot')];
  const prevBtn = root.querySelector('.gallery__nav--prev');
  const nextBtn = root.querySelector('.gallery__nav--next');
  const counter = root.querySelector('[data-gallery-current]');
  if (slides.length < 2) return () => {};

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DELAY = 5000;
  const cleanups = [];
  const listen = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  let index = 0;
  let timer = 0;
  let hovering = false;
  let focused = false;
  let inView = true;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => {
      const active = n === index;
      slide.classList.toggle('is-active', active);
      if (active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((dot, n) => {
      if (n === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (counter) counter.textContent = String(index + 1);
    // start loading the next image before it is needed
    const next = slides[(index + 1) % slides.length].querySelector('img');
    if (next && next.loading === 'lazy') next.loading = 'eager';
  }

  function schedule() {
    clearTimeout(timer);
    timer = 0;
    if (reduceMotion.matches || hovering || focused || !inView || document.hidden) return;
    timer = setTimeout(() => { show(index + 1); schedule(); }, DELAY);
  }
  const go = (i) => { show(i); schedule(); };

  listen(prevBtn, 'click', () => go(index - 1));
  listen(nextBtn, 'click', () => go(index + 1));
  dots.forEach((dot, n) => listen(dot, 'click', () => go(n)));

  listen(root, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
  });
  listen(root, 'mouseenter', () => { hovering = true; schedule(); });
  listen(root, 'mouseleave', () => { hovering = false; schedule(); });
  listen(root, 'focusin', () => { focused = true; schedule(); });
  listen(root, 'focusout', (e) => { if (!root.contains(e.relatedTarget)) { focused = false; schedule(); } });

  // swipe
  let startX = 0, startY = 0, tracking = false;
  listen(root, 'pointerdown', (e) => {
    if (e.pointerType === 'mouse' || e.target.closest('button')) return;
    tracking = true; startX = e.clientX; startY = e.clientY;
  });
  listen(root, 'pointerup', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
  });
  listen(root, 'pointercancel', () => { tracking = false; });

  listen(document, 'visibilitychange', schedule);
  listen(reduceMotion, 'change', schedule);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: 0.3 });
    io.observe(root);
    cleanups.push(() => io.disconnect());
  }

  root.tabIndex = 0;
  show(0);
  schedule();

  return () => {
    clearTimeout(timer);
    cleanups.forEach((fn) => fn());
  };
}

document.querySelectorAll('[data-gallery]').forEach((el) => mountGallery(el));
