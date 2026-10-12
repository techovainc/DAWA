/* DAWA — page behaviour: navigation, PWA install, reveal-on-scroll, contact form */
(() => {
  'use strict';

  /* ---- Nav background on scroll ---- */
  const nav = document.querySelector('[data-nav]');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('is-open', open);
    if (open) nav.classList.add('is-scrolled');
    else onScroll();
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---- Toast ---- */
  const toast = document.querySelector('[data-toast]');
  let toastTimer = 0;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.hidden = true), 3500);
  };

  /* ---- PWA: service worker + install prompt ---- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  const installBtn = document.querySelector('[data-install]');
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    installBtn.hidden = true;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => {});
    deferredPrompt = null;
  });
  window.addEventListener('appinstalled', () => {
    installBtn.hidden = true;
    showToast('DAWA was installed on your device.');
  });

  /* ---- Reveal on scroll + count-up stats ---- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target + suffix; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
        el.style.transitionDelay = Math.max(0, siblings.indexOf(el)) * 90 + 'ms';
        el.classList.add('is-visible');
        const counter = el.querySelector('[data-count]');
        if (counter) countUp(counter);
        io.unobserve(el);
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---- Contact form (client-side only; wire to your backend/CRM) ---- */
  const form = document.querySelector('[data-form]');
  const status = document.querySelector('[data-form-status]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    for (const field of form.querySelectorAll('[required]')) {
      const valid = field.checkValidity() && field.value.trim() !== '';
      field.setAttribute('aria-invalid', String(!valid));
      if (!valid && ok) { field.focus(); ok = false; }
    }
    if (!ok) {
      status.textContent = 'Please fill in your name and a valid email.';
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const body = encodeURIComponent(
      `Name: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}\nMetal: ${data.metal}\n\n${data.message}`
    );
    status.textContent = 'Thank you — opening your email app to send the request…';
    window.location.href = `mailto:desk@dawa.example?subject=${encodeURIComponent('Quote request — ' + data.metal)}&body=${body}`;
    form.reset();
  });

  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
