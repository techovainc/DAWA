/**
 * DAWA — Wholesale Distribution landing page (single-file React component)
 *
 * Everything the page needs is in this file: markup, styles, the animated hero
 * engine (sun rays, spinning gold globe, plane, sea, ship), the official logo and
 * the coastline data for the globe. Drop it into any React 18+ app:
 *
 *   import DawaLanding from './DawaLanding';
 *   export default function App() { return <DawaLanding />; }
 *
 * Generated from the static site by tools/build-jsx.py — edit the site, then re-run it.
 * The installable PWA (manifest + service worker) lives in the static site.
 */
import React, { memo, useEffect, useRef, useState } from 'react';

export default function DawaLanding() {
  const rootRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [enquiry, setEnquiry] = useState('Precious metals');
  const [status, setStatus] = useState('');
  const [invalid, setInvalid] = useState({});
  const [toast, setToast] = useState('');

  // Nav background once the page scrolls; Escape closes the mobile menu
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // "Install app" button (shown when the browser offers PWA installation)
  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
    const onInstalled = () => { setInstallPrompt(null); setToast('DAWA was installed on your device.'); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    setInstallPrompt(null);
  };

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Reveal-on-scroll with staggered siblings and count-up figures
  useEffect(() => {
    const root = rootRef.current;
    const els = root.querySelectorAll('.reveal');
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
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
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
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Contact form: validates, then opens the visitor's email app (wire to your CRM for production)
  const submit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const bad = {
      name: !data.name.trim(),
      email: !form.elements.email.checkValidity() || !data.email.trim(),
    };
    setInvalid(bad);
    if (bad.name || bad.email) {
      setStatus('Please fill in your name and a valid email.');
      form.elements[bad.name ? 'name' : 'email'].focus();
      return;
    }
    const body = encodeURIComponent(
      `Name: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}\nEnquiry: ${data.enquiry}\n\n${data.message}`
    );
    setStatus("Thank you. Your email app should open with the enquiry ready to send. If it doesn't, email trade@dawa.example.");
    window.location.href = `mailto:trade@dawa.example?subject=${encodeURIComponent('Enquiry — ' + data.enquiry)}&body=${body}`;
    form.reset();
    setEnquiry('Precious metals');
  };

  return (
    <div ref={rootRef}>
      <style>{CSS}</style>
      <a className="skip-link" href="#main">Skip to content</a>

    <header className={`nav${scrolled || menuOpen ? " is-scrolled" : ""}`}>
        <a className="brand" href="#top" aria-label="DAWA — home">
            <img className="brand__logo" src={LOGO} alt="DAWA" width="720" height="156" />
          <span className="brand__tagline">Wholesale Distribution</span>
        </a>

        <nav className={`nav__links${menuOpen ? " is-open" : ""}`} id="nav-links" aria-label="Primary" onClick={(e) => e.target.closest("a") && setMenuOpen(false)}>
          <a href="#products">Products</a>
          <a href="#logistics">Logistics</a>
          <a href="#events">Partner events</a>
          <a href="#process">How it works</a>
          <a href="#trust">Compliance</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="nav__actions">
          <button className="btn btn--ghost btn--sm" type="button" hidden={!installPrompt} onClick={install}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 19h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Install app
          </button>
          <a className="btn btn--gold btn--sm nav__cta" href="#contact">Become a partner</a>
          <button className="nav__toggle" type="button" aria-controls="nav-links" aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((o) => !o)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <Hero />

      <main id="main">
        {/* Trade hubs marquee */}
        <div className="marquee" aria-label="Trade hubs">
          <div className="marquee__track">
            <span>Dubai</span><span>London</span><span>Zurich</span><span>Hong Kong</span><span>Singapore</span><span>New York</span><span>Johannesburg</span><span>Mumbai</span><span>Istanbul</span><span>Shanghai</span>
            <span aria-hidden="true">Dubai</span><span aria-hidden="true">London</span><span aria-hidden="true">Zurich</span><span aria-hidden="true">Hong Kong</span><span aria-hidden="true">Singapore</span><span aria-hidden="true">New York</span><span aria-hidden="true">Johannesburg</span><span aria-hidden="true">Mumbai</span><span aria-hidden="true">Istanbul</span><span aria-hidden="true">Shanghai</span>
          </div>
        </div>

        {/* Stats */}
        <section className="section stats" aria-label="DAWA at a glance">
          <div className="container stats__grid">
            <div className="stat reveal"><strong data-count="40" data-suffix="+">40+</strong><span>Destination markets</span></div>
            <div className="stat reveal"><strong data-count="2">2</strong><span>Specialist divisions</span></div>
            <div className="stat reveal"><strong data-count="24" data-suffix="/7">24/7</strong><span>Tracked, insured transit</span></div>
            <div className="stat reveal"><strong data-count="12" data-suffix="+">12+</strong><span>Partner events a year</span></div>
          </div>
        </section>

        {/* Divisions */}
        <section className="section" id="products">
          <div className="container">
            <header className="section__head reveal">
              <p className="kicker">What we distribute</p>
              <h2>Two specialist divisions. One trusted supply chain.</h2>
              <p>Each division has its own sourcing team, compliance desk and handling standards,
                and both share our global logistics network.</p>
            </header>

            <div className="divisions">
              <article className="division division--metals reveal">
                <div className="division__visual" aria-hidden="true">
                  <div className="bars">
                    <span className="bar" style={{ '--m1': '#fff0b3', '--m2': '#e2ad45', '--m3': '#9b6516' }}>Au</span>
                    <span className="bar" style={{ '--m1': '#ffffff', '--m2': '#c9d1da', '--m3': '#7d8894' }}>Ag</span>
                    <span className="bar" style={{ '--m1': '#f4f6f8', '--m2': '#b7bec7', '--m3': '#5f6873' }}>Pt</span>
                    <span className="bar" style={{ '--m1': '#f3efe9', '--m2': '#c4b8a8', '--m3': '#6f6456' }}>Pd</span>
                  </div>
                </div>
                <div className="division__body">
                  <p className="division__tag">Division 01</p>
                  <h3>Precious metals</h3>
                  <p>Investment-grade gold, silver, platinum and palladium for banks, refiners,
                    jewellers and manufacturers. Assayed, serial-numbered and allocated before dispatch.</p>
                  <ul className="chips">
                    <li>Gold 999.9 bars &amp; coins</li><li>Silver bars &amp; granules</li>
                    <li>Platinum &amp; palladium ingots</li><li>Allocated vaulting</li>
                  </ul>
                </div>
              </article>

              <article className="division division--accessories reveal">
                <div className="division__visual" aria-hidden="true">
                  <svg className="accessories" viewBox="0 -28 380 228">
                    <defs>
                      <linearGradient id="accGold" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#fff4c4"/>
                        <stop offset=".35" stopColor="#f0c665"/>
                        <stop offset=".7" stopColor="#c98d2a"/>
                        <stop offset="1" stopColor="#8f5c14"/>
                      </linearGradient>
                      <linearGradient id="accGoldH" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#a8701f"/>
                        <stop offset=".45" stopColor="#ffeaa6"/>
                        <stop offset="1" stopColor="#b27a22"/>
                      </linearGradient>
                    </defs>
                    {/* pipe */}
                    {/* churchwarden pipe: bent bowl with engraved rim, twisted band, long sweeping stem */}
                    <g className="acc acc--pipe">
                      <path d="M80 140 C104 120 124 74 136 20 L143 22 C132 76 112 124 86 146 Z" fill="url(#accGoldH)"/>
                      <path d="M136 20 L143 22 L144 17 L137 15 Z" fill="#7a4d12"/>
                      <path d="M126 58 C132 44 135 32 137 22" stroke="#fff6d2" strokeWidth="1.4" fill="none" opacity=".6" strokeLinecap="round"/>
                      <path d="M20 122 C18 142 28 160 47 162 C60 163 72 156 82 146 L88 140 L80 131 C72 135 63 128 60 109 Z" fill="url(#accGold)"/>
                      <path d="M28 132 C29 146 36 154 46 156" stroke="#fff6d2" strokeWidth="2.6" fill="none" opacity=".55" strokeLinecap="round"/>
                      <g transform="rotate(-47 84 137)">
                        <rect x="77" y="133" width="14" height="8" rx="1.5" fill="url(#accGoldH)"/>
                        <path d="M79 133 l3 8 M83 133 l3 8 M87 133 l3 8" stroke="#7a4d12" strokeWidth="1" opacity=".7"/>
                      </g>
                      <g transform="rotate(-18 40 116)">
                        <ellipse cx="40" cy="116" rx="21" ry="8.5" fill="#ffeaa6"/>
                        <ellipse cx="40" cy="116" rx="21" ry="8.5" fill="none" stroke="#a8701f" strokeWidth="1.2" strokeDasharray="1.6 1.4" opacity=".8"/>
                        <ellipse cx="40" cy="116.6" rx="13" ry="5" fill="#1a1006"/>
                      </g>
                    </g>
                    {/* steam chalice (after the supplied reference): engraved bell base with sun emblem,
                         vase stem, flared bowl with coals and steam, white hose with gold spiral wraps */}
                    <g className="acc acc--chalice">
                      <defs>
                        <clipPath id="accBell"><path d="M150 176 C150 138 160 114 188 110 C216 114 226 138 226 176 Z"/></clipPath>
                      </defs>
                      <path d="M220 124 C226 98 234 78 241 79 C249 81 249 116 248 148 C247 170 241 182 226 187" stroke="#efe6d4" strokeWidth="6" fill="none" strokeLinecap="round"/>
                      <path d="M220 124 C226 98 234 78 241 79 C249 81 249 116 248 148 C247 170 241 182 226 187" stroke="#c9952e" strokeWidth="6" fill="none" strokeDasharray="1.6 4" opacity=".85"/>
                      <rect x="215" y="118" width="9" height="7" rx="1.5" fill="url(#accGoldH)" transform="rotate(-62 219 121)"/>
                      <path d="M150 176 C150 138 160 114 188 110 C216 114 226 138 226 176 Z" fill="url(#accGold)"/>
                      <g clipPath="url(#accBell)" stroke="#8f5c14" fill="none" opacity=".75">
                        <path d="M140 120 H236 M140 125 H236 M140 166 H236 M140 170 H236" strokeWidth="1"/>
                        <path d="M156 132 V164 M163 128 V166 M213 128 V166 M220 132 V164" strokeWidth=".7" opacity=".6"/>
                      </g>
                      <path d="M160 136 C162 126 170 118 180 115" stroke="#fff6d2" strokeWidth="2.4" fill="none" opacity=".6" strokeLinecap="round"/>
                      <g stroke="#a8701f" strokeWidth="1.3" strokeLinecap="round"><path d="M195.5 148.0 L208.0 148.0"/><path d="M195.0 150.6 L202.1 153.1"/><path d="M193.7 152.8 L203.3 160.9"/><path d="M191.8 154.5 L195.5 161.0"/><path d="M189.3 155.4 L191.5 167.7"/><path d="M186.7 155.4 L185.4 162.8"/><path d="M184.2 154.5 L178.0 165.3"/><path d="M182.3 152.8 L176.5 157.6"/><path d="M181.0 150.6 L169.2 154.8"/><path d="M180.5 148.0 L173.0 148.0"/><path d="M181.0 145.4 L169.2 141.2"/><path d="M182.3 143.2 L176.5 138.4"/><path d="M184.2 141.5 L178.0 130.7"/><path d="M186.7 140.6 L185.4 133.2"/><path d="M189.3 140.6 L191.5 128.3"/><path d="M191.8 141.5 L195.5 135.0"/><path d="M193.7 143.2 L203.3 135.1"/><path d="M195.0 145.4 L202.1 142.9"/></g>
                      <circle cx="188" cy="148" r="6.5" fill="url(#accGoldH)" stroke="#8f5c14" strokeWidth=".8"/>
                      <circle cx="186" cy="146" r="2" fill="#fff6d2" opacity=".8"/>
                      <rect x="146" y="173" width="84" height="7" rx="2.5" fill="url(#accGoldH)"/>
                      <path d="M226 187 C206 191 186 191 170 188" stroke="#efe6d4" strokeWidth="6" fill="none" strokeLinecap="round"/>
                      <path d="M226 187 C206 191 186 191 170 188" stroke="#c9952e" strokeWidth="6" fill="none" strokeDasharray="1.6 4" opacity=".85"/>
                      <g transform="rotate(-4 160 188)">
                        <rect x="146" y="184" width="26" height="8" rx="2" fill="url(#accGoldH)"/>
                        <rect x="167" y="183" width="5" height="10" rx="1.5" fill="url(#accGold)"/>
                        <g fill="#5a3a10"><circle cx="152" cy="188" r=".9"/><circle cx="156" cy="188" r=".9"/><circle cx="160" cy="188" r=".9"/></g>
                      </g>
                      <rect x="184" y="88" width="8" height="24" fill="url(#accGoldH)"/>
                      <ellipse cx="188" cy="111" rx="9" ry="2.6" fill="url(#accGold)"/>
                      <path d="M182 50 C171 60 171 80 181 92 H195 C205 80 205 60 194 50 Z" fill="url(#accGold)"/>
                      <path d="M178 62 l4 3 l-3 4 l4 3 l-3 4 l4 3 M198 62 l-4 3 l3 4 l-4 3 l3 4 l-4 3" stroke="#a8701f" strokeWidth=".7" fill="none" opacity=".7"/>
                      <path d="M180 58 C176 66 176 78 181 86" stroke="#fff6d2" strokeWidth="1.8" fill="none" opacity=".6" strokeLinecap="round"/>
                      <path d="M163 26 H213 L197 50 H179 Z" fill="url(#accGold)"/>
                      <ellipse cx="188" cy="26" rx="25" ry="4.6" fill="#ffeaa6"/>
                      <g stroke="#a8701f" strokeWidth=".8" strokeLinecap="round"><path d="M190.6 37.0 L193.5 37.0"/><path d="M190.3 38.3 L192.8 39.8"/><path d="M189.3 39.3 L190.8 41.8"/><path d="M188.0 39.6 L188.0 42.5"/><path d="M186.7 39.3 L185.2 41.8"/><path d="M185.7 38.3 L183.2 39.8"/><path d="M185.4 37.0 L182.5 37.0"/><path d="M185.7 35.7 L183.2 34.2"/><path d="M186.7 34.7 L185.2 32.2"/><path d="M188.0 34.4 L188.0 31.5"/><path d="M189.3 34.7 L190.8 32.2"/><path d="M190.3 35.7 L192.8 34.2"/></g>
                      <circle cx="188" cy="37" r="2.4" fill="url(#accGoldH)"/>
                      <g fill="#2b2622">
                        <path d="M172 26 l3 -6 l6 -1 l3 5 l-2 2 Z"/>
                        <path d="M181 25 l2 -7 l7 -1 l4 6 l-3 2 Z"/>
                        <path d="M192 25 l3 -6 l6 0 l3 6 Z"/>
                        <path d="M185 22 l4 -5 l5 1 l1 4 Z" fill="#3a332d"/>
                      </g>
                      <g className="acc-steam" fill="none" stroke="#fff8e6" strokeLinecap="round" strokeWidth="2.4">
                        <path d="M180 14 C174 6 184 0 178 -8"/>
                        <path d="M190 13 C196 3 186 -3 192 -13"/>
                        <path d="M199 14 C194 7 203 2 198 -6"/>
                      </g>
                    </g>
                    {/* 24K gold king-size rolling papers: unbranded 6-sheet pack with gold-leaf window, plus an empty gold cone */}
                    <g className="acc acc--papers">
                      <rect x="252" y="54" width="86" height="122" rx="3" fill="#1d4532"/>
                      <rect x="252" y="54" width="86" height="122" rx="3" fill="none" stroke="#2c5f45" strokeWidth="1.2"/>
                      <text x="257" y="63.5" fontFamily="system-ui, sans-serif" fontSize="3.8" letterSpacing=".6" fill="#d9e6dc">6-SHEET PACK</text>
                      <text x="333" y="63.5" textAnchor="end" fontFamily="system-ui, sans-serif" fontSize="3.8" letterSpacing=".6" fill="#d9e6dc">KING SIZE</text>
                      <rect className="acc-leaf" x="259" y="68" width="72" height="62" fill="url(#accGold)"/>
                      <path d="M263 78 l12 4 l10 -3 l14 5 l12 -3 l14 4 M261 96 l14 -3 l12 4 l16 -2 l14 3 l8 -2 M265 116 l12 3 l14 -4 l12 3 l16 -2 l6 2" stroke="#fff6d2" strokeWidth=".8" fill="none" opacity=".6"/>
                      <rect x="259" y="68" width="72" height="62" fill="none" stroke="#0f2a1e" strokeWidth="1"/>
                      <circle cx="263" cy="162" r="5.2" fill="#f3f1ea"/>
                      <text x="263" y="163.8" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="4.2" fontWeight="700" fill="#1d4532">24K</text>
                      <text x="271" y="163.6" fontFamily="system-ui, sans-serif" fontSize="4.6" letterSpacing=".5" fill="#f3f1ea">GOLD ROLLING PAPERS</text>
                      <g transform="rotate(12 356 120)">
                        <path d="M349 64 H363 L359 176 H353 Z" fill="url(#accGoldH)"/>
                        <ellipse cx="356" cy="64" rx="7" ry="2.2" fill="#5a3a10"/>
                        <path d="M353 72 l4 10 l-2 12 l4 14 l-3 16 l4 18 l-3 20" stroke="#fff6d2" strokeWidth=".8" fill="none" opacity=".55"/>
                      </g>
                    </g>
                    <g className="acc-sparks" fill="#fffbe6">
                      <path className="acc-spark" d="M60 52 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5 Z"/>
                      <path className="acc-spark" d="M232 40 l2 5.5 5.5 2 -5.5 2 -2 5.5 -2 -5.5 -5.5 -2 5.5 -2 Z"/>
                      <path className="acc-spark" d="M318 70 l1.8 5 5 1.8 -5 1.8 -1.8 5 -1.8 -5 -5 -1.8 5 -1.8 Z"/>
                    </g>
                  </svg>
                </div>
                <div className="division__body">
                  <p className="division__tag">Division 02</p>
                  <h3>Gold smoking accessories</h3>
                  <p>Steam chalices, pipes, 24K gold rolling papers and more, all crafted in genuine 18K to 24K
                    gold. Hallmarked statement pieces for luxury retailers, lounges and collectors.</p>
                  <ul className="chips">
                    <li>Gold steam chalices</li><li>Gold pipes</li>
                    <li>24K gold rolling papers</li><li>Custom pieces</li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Logistics */}
        <section className="section section--navy" id="logistics">
          <div className="container split">
            <header className="section__head section__head--left reveal">
              <p className="kicker">Logistics</p>
              <h2>Air when it's urgent.<br />Sea when it's heavy.</h2>
              <p>We plan every consignment door to door: secure collection, customs
                clearance, specialist insurance and live tracking from producer to your warehouse.</p>
              <a className="btn btn--gold" href="#contact">Plan a shipment</a>
            </header>

            <div className="cards cards--2">
              <article className="feature reveal">
                <div className="feature__icon">
                  <svg viewBox="0 0 24 24"><path d="M2.5 13.5 21 7.5c.9-.3 1.6.8.9 1.5l-4.4 3.6 1.2 6.4-2 .9-3.4-5.4-4.8 2 .2 2.6-1.6.8-1.5-3.6-3.7-1.5.4-1.6 2.6.2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                </div>
                <h3>Air freight</h3>
                <p>Priority, high-security handling for bullion and time-critical orders, typically delivered in 48–72 hours.</p>
              </article>
              <article className="feature reveal">
                <div className="feature__icon">
                  <svg viewBox="0 0 24 24"><path d="M3 15h18l-2.5 4.5H5.5L3 15Zm3-1V9h5v5m1 0V6h5v8M4 21c1.3 0 1.3-.8 2.7-.8S8 21 9.3 21s1.3-.8 2.7-.8 1.3.8 2.7.8 1.3-.8 2.6-.8 1.4.8 2.7.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>
                </div>
                <h3>Sea freight</h3>
                <p>Sealed, monitored containers for bulk silver and large accessory consignments.</p>
              </article>
              <article className="feature reveal">
                <div className="feature__icon">
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M12 8.5V7m0 10v-1.5M15.5 12H17M7 12h1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </div>
                <h3>Vaults &amp; bonded storage</h3>
                <p>Allocated vaulting for metals and high-security storage for finished gold pieces.</p>
              </article>
              <article className="feature reveal">
                <div className="feature__icon">
                  <svg viewBox="0 0 24 24"><path d="M12 3 4 6v5.5c0 4.6 3.3 8.3 8 9.5 4.7-1.2 8-4.9 8-9.5V6l-8-3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="m8.5 12 2.4 2.4 4.6-4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3>All-risk insurance</h3>
                <p>Cover from collection to delivery, including transit, transshipment and storage.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Partner events */}
        <section className="section events" id="events">
          <div className="container">
            <header className="section__head reveal">
              <p className="kicker">Partner events</p>
              <h2>Experience it before you stock it</h2>
              <p>We host private, trade-only events where business partners meet producers,
                experience our products in person, and raise a glass of DAWA Wine, our signature
                served nowhere else.</p>
            </header>

            <div className="cards cards--3">
              <article className="event reveal">
                <div className="event__icon">
                  <svg viewBox="0 0 24 24"><path d="M4 10h16l-2 9H6l-2-9Zm3 0 2-5h6l2 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </div>
                <h3>Bullion viewings</h3>
                <p>See, hold and verify bars in a secure viewing room, with live assay demonstrations and our metals desk on hand.</p>
              </article>
              <article className="event reveal">
                <div className="event__icon">
                  <svg viewBox="0 0 24 24"><path d="M6.5 4h11l3.5 5-9 11L3 9l3.5-5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                </div>
                <h3>Gold atelier sessions</h3>
                <p>Handle our chalices, pipes and 24K papers up close, check the hallmarks and meet the goldsmiths behind them.</p>
              </article>
              <article className="event reveal">
                <div className="event__icon">
                  <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M3 9h18M8 3v4m8-4v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="m9.5 14 1.8 1.8 3.4-3.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3>Trade showcases</h3>
                <p>New-season launches and producer meet-ups in our trade hubs, plus stands at major international trade fairs.</p>
              </article>
            </div>

            {/* DAWA Wine — event-exclusive signature tonic */}
            <article className="wine reveal" id="dawa-wine" aria-labelledby="wine-title">
              <div className="wine__visual" aria-hidden="true">
                <div className="wine__glow"></div>
                <svg className="wine__bottle" viewBox="0 0 160 420">
                  <defs>
                    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#1a0606"/>
                      <stop offset=".3" stopColor="#4a0f14"/>
                      <stop offset=".55" stopColor="#2a080b"/>
                      <stop offset="1" stopColor="#120304"/>
                    </linearGradient>
                    <linearGradient id="wineShine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#fff" stopOpacity="0"/>
                      <stop offset=".5" stopColor="#fff" stopOpacity=".35"/>
                      <stop offset="1" stopColor="#fff" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="labelGold" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#fff1b8"/>
                      <stop offset=".45" stopColor="#e6b54f"/>
                      <stop offset="1" stopColor="#a8701f"/>
                    </linearGradient>
                    <clipPath id="bottleClip">
                      <path d="M64 8h32v70c0 18 34 34 34 70v250c0 8-6 14-14 14H44c-8 0-14-6-14-14V148c0-36 34-52 34-70Z"/>
                    </clipPath>
                  </defs>
                  <path d="M64 8h32v70c0 18 34 34 34 70v250c0 8-6 14-14 14H44c-8 0-14-6-14-14V148c0-36 34-52 34-70Z" fill="url(#glass)"/>
                  <g clipPath="url(#bottleClip)">
                    <rect className="wine__sheen" x="-60" y="0" width="50" height="420" fill="url(#wineShine)"/>
                    <rect x="44" y="120" width="6" height="280" rx="3" fill="#fff" opacity=".12"/>
                  </g>
                  {/* capsule */}
                  <rect x="61" y="4" width="38" height="58" rx="4" fill="url(#labelGold)"/>
                  <rect x="61" y="52" width="38" height="4" fill="#7a4d12" opacity=".5"/>
                  {/* label */}
                  <rect x="38" y="200" width="84" height="150" rx="6" fill="#f6ecd6"/>
                  <rect x="44" y="206" width="72" height="138" rx="4" fill="none" stroke="url(#labelGold)" strokeWidth="1.5"/>
                  <path d="M80 222c10 6 14 15 12 25-2 9-8 14-12 16-4-2-10-7-12-16-2-10 2-19 12-25Z" fill="#5c3412" opacity=".85"/>
                  <path d="M80 226v36" stroke="#f6ecd6" strokeWidth="1"/>
                  <text x="80" y="290" textAnchor="middle" fontFamily="Georgia, serif" fontSize="18" fontWeight="700" letterSpacing="4" fill="#3b0d10">DAWA</text>
                  <text x="80" y="306" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" letterSpacing="3" fill="#8a5a12">WINE</text>
                  <text x="80" y="330" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="6" letterSpacing="2.2" fill="#6b5a40">AMAZONIA</text>
                </svg>
                <svg className="wine__glass" viewBox="0 0 100 180">
                  <defs>
                    <linearGradient id="pour" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#9b1c2a"/>
                      <stop offset="1" stopColor="#4a0710"/>
                    </linearGradient>
                    <clipPath id="bowl"><path d="M14 10h72c0 40-12 70-36 74C26 80 14 50 14 10Z"/></clipPath>
                  </defs>
                  <g clipPath="url(#bowl)">
                    <rect className="wine__liquid" x="0" y="44" width="100" height="60" fill="url(#pour)"/>
                  </g>
                  <path d="M14 10h72c0 40-12 70-36 74C26 80 14 50 14 10Z" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.6"/>
                  <path d="M50 84v70M28 160c6-5 38-5 44 0" stroke="rgba(255,255,255,.55)" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                  <path d="M22 18c0 24 6 44 16 54" stroke="#fff" strokeOpacity=".35" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="wine__body">
                <p className="kicker">Events-only signature</p>
                <h3 className="wine__title" id="wine-title">DAWA Wine</h3>
                <p className="wine__lead">Our proprietary tonic, crafted from barks gathered in the Amazon rainforest.
                  It is brewed just once a year over eight patient months, and it is never sold —
                  you can only taste it at a DAWA partner event.</p>
                <ul className="wine__facts">
                  <li><strong>1</strong><span>Batch a year</span></li>
                  <li><strong>8</strong><span>Months in the making</span></li>
                  <li><strong>0</strong><span>Bottles sold in stores</span></li>
                </ul>
                <p className="wine__note">Served only to adult guests at DAWA events, where local law allows. Please enjoy responsibly.</p>
              </div>
            </article>

            <div className="events__cta reveal">
              <p>Invitations go to registered trade partners. New to DAWA? Request an invitation to the next event near you.</p>
              <a className="btn btn--gold" href="#contact" onClick={() => setEnquiry("Partner event invitation")}>Request an invitation</a>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section section--cream" id="process">
          <div className="container">
            <header className="section__head reveal">
              <p className="kicker">How it works</p>
              <h2>From first enquiry to delivery in four steps</h2>
            </header>
            <ol className="steps">
              <li className="step reveal"><span className="step__n">01</span><h3>Enquire</h3><p>Tell us the products, volumes and destination. We return a quote within one business day.</p></li>
              <li className="step reveal"><span className="step__n">02</span><h3>Onboard</h3><p>KYC/AML checks and trade-licence verification, with a dedicated account manager.</p></li>
              <li className="step reveal"><span className="step__n">03</span><h3>Experience</h3><p>Join a partner event or receive trade samples where permitted, then confirm your order.</p></li>
              <li className="step reveal"><span className="step__n">04</span><h3>Deliver</h3><p>Insured air or sea transport with full customs documents, tracked end to end.</p></li>
            </ol>
          </div>
        </section>

        {/* Compliance */}
        <section className="section" id="trust">
          <div className="container split split--reverse">
            <div className="trust-visual reveal" aria-hidden="true">
              <div className="ingot ingot--1"></div>
              <div className="ingot ingot--2"></div>
              <div className="ingot ingot--3"></div>
            </div>
            <header className="section__head section__head--left reveal">
              <p className="kicker">Compliance</p>
              <h2>Responsible trade, documented at every step</h2>
              <ul className="checks">
                <li>Conflict-free metals with full chain-of-custody records</li>
                <li>Hallmarking and fineness certificates for every gold accessory</li>
                <li>Smoking accessories sold to age-verified adult trade buyers only</li>
                <li>Rigorous KYC/AML screening of every counterparty</li>
              </ul>
            </header>
          </div>
        </section>

        {/* Contact */}
        <section className="section section--navy" id="contact">
          <div className="container split">
            <header className="section__head section__head--left reveal">
              <p className="kicker">Contact</p>
              <h2>Let's do business</h2>
              <p>Request a quote, open a trade account or ask for an invitation to our next partner
                event. Our team replies within one business day.</p>
              <dl className="contact-list">
                <div><dt>Trade desk</dt><dd><a href="mailto:trade@dawa.example">trade@dawa.example</a></dd></div>
                <div><dt>Hours</dt><dd>Mon–Fri, 07:00–19:00 GST</dd></div>
              </dl>
            </header>

            <form className="form reveal" noValidate onSubmit={submit}>
              <div className="form__row">
                <label>Full name<input name="name" autoComplete="name" required aria-invalid={invalid.name ? "true" : undefined} /></label>
                <label>Company<input name="company" autoComplete="organization" /></label>
              </div>
              <div className="form__row">
                <label>Email<input name="email" type="email" autoComplete="email" required aria-invalid={invalid.email ? "true" : undefined} /></label>
                <label>Enquiry
                  <select name="enquiry" value={enquiry} onChange={(e) => setEnquiry(e.target.value)}>
                    <option>Precious metals</option>
                    <option>Gold smoking accessories</option>
                    <option>Partner event invitation</option>
                    <option>Logistics only</option>
                  </select>
                </label>
              </div>
              <label>Details<textarea name="message" rows="4" placeholder="e.g. 25 × 1 kg gold bars to Zurich by air, or 200 boxes of 24K gold rolling papers to Dubai"></textarea></label>
              <button className="btn btn--gold btn--block" type="submit">Send enquiry</button>
              <p className="form__status" role="status" aria-live="polite">{status}</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <a className="brand brand--footer" href="#top" aria-label="DAWA — back to top">
              <img className="brand__logo" src={LOGO} alt="DAWA" width="720" height="156" loading="lazy" />
            <span className="brand__tagline">Wholesale Distribution</span>
          </a>
          <p>© {new Date().getFullYear()} DAWA Wholesale Distribution. All rights reserved.</p>
          <p className="footer__note">Trade customers only. Smoking accessories are sold only to adults of legal age. DAWA does not sell, supply or ship tobacco or any smokable product. DAWA Wine is served only at private DAWA events to guests of legal drinking age; please enjoy responsibly. Prices and availability are subject to market conditions.</p>
        </div>
      </footer>



      <div className="toast" role="status" aria-live="polite" hidden={!toast}>{toast}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ HERO */
const Hero = memo(function Hero() {
  const ref = useRef(null);
  useEffect(() => mountHero(ref.current, LAND_RINGS), []);
  return (
    <div ref={ref} style={{ display: 'contents' }}>
      {/* ============ HERO (animated scene) ============ */}
      <section className="hero" id="top" data-hero>
        <div className="scene" aria-hidden="true" data-scene>
          <div className="sky"></div>
          <div className="sun">
            <div className="sun__rays sun__rays--a"></div>
            <div className="sun__rays sun__rays--b"></div>
            <div className="sun__rays sun__rays--c"></div>
            <div className="sun__core"></div>
          </div>
          <div className="sparkles" data-sparkles></div>

          <svg className="skyline" data-skyline preserveAspectRatio="none"></svg>

          {/* plane flies behind the globe for depth */}
          <div className="plane" data-plane>
            <div className="plane__trail"></div>
            <svg className="plane__svg" viewBox="0 0 320 120">
              <defs>
                <linearGradient id="fuse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff"/>
                  <stop offset=".55" stopColor="#eef2f7"/>
                  <stop offset="1" stopColor="#b9c3cf"/>
                </linearGradient>
                <linearGradient id="tail" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#4c8fe0"/>
                  <stop offset="1" stopColor="#123f8c"/>
                </linearGradient>
                <linearGradient id="wing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f4f6f9"/>
                  <stop offset="1" stopColor="#a8b3c1"/>
                </linearGradient>
                <linearGradient id="eng" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff"/>
                  <stop offset=".6" stopColor="#cfd6df"/>
                  <stop offset="1" stopColor="#8a96a5"/>
                </linearGradient>
              </defs>
              {/* far wing */}
              <path d="M150 52 L112 22 L126 21 L178 50 Z" fill="#c9d2dc"/>
              {/* far stabiliser */}
              <path d="M40 50 L22 36 L32 35 L58 49 Z" fill="#c4cdd8"/>
              {/* fuselage */}
              <path d="M20 46 C40 40 80 39 150 39 L262 40 C285 41 300 47 306 55 C300 62 286 66 262 67 L150 68 C90 68 48 66 30 60 L14 50 Z" fill="url(#fuse)"/>
              {/* belly shade */}
              <path d="M40 62 C80 67 200 67 262 66 C280 65 294 62 302 58 C292 66 280 67 262 68 L150 69 C90 69 52 67 40 62 Z" fill="#9aa6b5" opacity=".6"/>
              {/* cheatline */}
              <path d="M44 55 L270 55" stroke="#2f6fd0" strokeWidth="2.4" opacity=".85"/>
              {/* tail fin */}
              <path d="M18 47 L2 6 L22 6 L62 42 Z" fill="url(#tail)"/>
              <path d="M8 10 L20 10 L40 30 Z" fill="#ffffff" opacity=".25"/>
              {/* windows */}
              <g fill="#38475b" data-windows></g>
              {/* cockpit */}
              <path d="M276 46 L292 47 C296 49 298 51 299 52 L280 51 Z" fill="#1e2a3a"/>
              {/* near wing */}
              <path d="M128 60 L196 60 L120 112 L100 112 Z" fill="url(#wing)"/>
              <path d="M100 112 L120 112 L124 108 L104 108 Z" fill="#7d8a9a"/>
              {/* engines */}
              <g>
                <rect x="152" y="70" width="44" height="16" rx="8" fill="url(#eng)"/>
                <ellipse cx="196" cy="78" rx="4" ry="8" fill="#2a3442"/>
                <rect x="152" y="73" width="6" height="10" rx="3" fill="#7f8b99"/>
              </g>
              <g>
                <rect x="118" y="92" width="36" height="13" rx="6.5" fill="url(#eng)"/>
                <ellipse cx="154" cy="98.5" rx="3.2" ry="6.5" fill="#2a3442"/>
              </g>
              {/* near stabiliser */}
              <path d="M44 56 L14 74 L26 75 L66 58 Z" fill="#d7dee6"/>
              {/* strobe */}
              <circle className="plane__strobe" cx="112" cy="110" r="3" fill="#ff5a4f"/>
              <circle className="plane__strobe plane__strobe--w" cx="4" cy="8" r="2.4" fill="#ffffff"/>
            </svg>
          </div>

          <div className="globe" data-globe>
            <div className="globe__halo"></div>
            <canvas className="globe__canvas" data-globe-canvas></canvas>
            <div className="globe__gloss"></div>
            <svg className="globe__ring" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0"/>
                  <stop offset=".35" stopColor="#ffffff" stopOpacity=".9"/>
                  <stop offset=".7" stopColor="#fff2c4" stopOpacity=".8"/>
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <mask id="ringMask" maskUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240">
                <rect x="-20" y="-20" width="240" height="240" fill="#fff"/>
                {/* hide the half of the orbit that passes behind the globe */}
                <path d="M19.4 100 A80.6 80.6 0 0 1 180.6 100 Z" fill="#000" transform="rotate(14 100 100)"/>
              </mask>
              <g mask="url(#ringMask)">
              <ellipse className="globe__ring-path" cx="100" cy="100" rx="104" ry="30" fill="none" stroke="url(#ringGrad)" strokeWidth="1.6" transform="rotate(14 100 100)"/>
              <ellipse className="globe__ring-path globe__ring-path--2" cx="100" cy="100" rx="100" ry="26" fill="none" stroke="url(#ringGrad)" strokeWidth=".8" transform="rotate(14 100 100)"/>
              </g>
            </svg>
          </div>

          <canvas className="sea sea--back" data-sea-back></canvas>

          <div className="ship" data-ship>
            <svg className="ship__svg" viewBox="0 0 1000 300" data-ship-svg>
              <defs>
                <linearGradient id="hull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2d5fae"/>
                  <stop offset=".45" stopColor="#173f86"/>
                  <stop offset="1" stopColor="#0c2457"/>
                </linearGradient>
                <linearGradient id="hullShine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0"/>
                  <stop offset=".7" stopColor="#ffffff" stopOpacity=".0"/>
                  <stop offset=".92" stopColor="#ffffff" stopOpacity=".22"/>
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="keel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#e2343a"/>
                  <stop offset="1" stopColor="#9e1620"/>
                </linearGradient>
                <linearGradient id="house" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#d9dfe7"/>
                  <stop offset=".5" stopColor="#ffffff"/>
                  <stop offset="1" stopColor="#cbd3dd"/>
                </linearGradient>
                <pattern id="corr" width="4" height="10" patternUnits="userSpaceOnUse">
                  <rect width="4" height="10" fill="transparent"/>
                  <rect width="1.2" height="10" fill="#000" opacity=".16"/>
                </pattern>
                <clipPath id="hullClip">
                  <path d="M30 142 L986 128 C980 180 964 230 938 274 L74 274 C52 262 38 238 34 200 Z"/>
                </clipPath>
              </defs>

              {/* containers (generated) */}
              <g data-containers></g>

              {/* superstructure */}
              <g>
                <rect x="74" y="44" width="104" height="100" fill="url(#house)"/>
                <rect x="60" y="40" width="132" height="12" fill="#f4f7fb"/>
                <g fill="#26364d" data-house-windows></g>
                <rect x="112" y="10" width="34" height="32" fill="#ffffff"/>
                <rect x="112" y="10" width="34" height="9" fill="#1d1d1f"/>
                <rect x="112" y="22" width="34" height="5" fill="#e0a53c"/>
                <path d="M178 52 L196 52 L196 60 L178 60 Z" fill="#dfe5ec"/>
                <line x1="96" y1="40" x2="96" y2="8" stroke="#e9eef4" strokeWidth="2"/>
                <line x1="88" y1="16" x2="104" y2="16" stroke="#e9eef4" strokeWidth="2"/>
              </g>

              {/* hull */}
              <g>
                <path d="M30 142 L986 128 C980 180 964 230 938 274 L74 274 C52 262 38 238 34 200 Z" fill="url(#hull)"/>
                <g clipPath="url(#hullClip)">
                  <rect x="0" y="226" width="1000" height="60" fill="url(#keel)"/>
                  <rect x="0" y="222" width="1000" height="4" fill="#ffffff" opacity=".85"/>
                  <rect x="0" y="120" width="1000" height="160" fill="url(#hullShine)"/>
                  <rect x="0" y="140" width="1000" height="6" fill="#ffffff" opacity=".18"/>
                </g>
                {/* rail */}
                <path d="M30 142 L986 128" stroke="#ffffff" strokeWidth="2.5" opacity=".9"/>
                <g stroke="#ffffff" strokeWidth="1" opacity=".55" data-rail></g>
                {/* portholes */}
                <g fill="#e8eef6" opacity=".8">
                  <circle cx="860" cy="152" r="2.6"/><circle cx="880" cy="151" r="2.6"/><circle cx="900" cy="151" r="2.6"/><circle cx="920" cy="150" r="2.6"/>
                </g>
                {/* name */}
                <text x="740" y="190" fill="#ffffff" fontFamily="Georgia, 'Times New Roman', serif" fontSize="30" letterSpacing="6" fontWeight="700" opacity=".95">DAWA</text>
                {/* anchor */}
                <g transform="translate(944 160)" fill="#c49a3d">
                  <rect x="-2" y="-12" width="4" height="22"/>
                  <path d="M-12 6 Q0 20 12 6 L9 6 Q0 15 -9 6 Z"/>
                  <rect x="-7" y="-9" width="14" height="3"/>
                </g>
              </g>

              {/* foremast */}
              <g stroke="#f3f6fa" strokeWidth="3" strokeLinecap="round">
                <line x1="930" y1="130" x2="930" y2="20"/>
                <line x1="914" y1="46" x2="946" y2="46"/>
                <line x1="918" y1="70" x2="942" y2="70"/>
              </g>
              <circle className="ship__light" cx="930" cy="18" r="4" fill="#fff6c8"/>
            </svg>
          </div>

          <canvas className="sea sea--front" data-sea-front></canvas>
          <div className="hero__vignette"></div>
          <div className="hero__scrim"></div>
        </div>

        <div className="hero__content" data-hero-content>
          <p className="eyebrow">
            <span className="eyebrow__dot"></span>
            Global wholesale distribution
          </p>
          <h1 className="hero__title">Premium goods,<br /><span className="gold-text">delivered worldwide.</span></h1>
          <p className="hero__lead">
            DAWA supplies precious metals and solid-gold accessories to trade partners — sourced from
            trusted refiners and goldsmiths, fully insured and shipped by air and sea. Then we invite you to
            experience them first-hand, with a glass of DAWA Wine.
          </p>
          <div className="hero__ctas">
            <a className="btn btn--gold" href="#contact">Become a partner</a>
            <a className="btn btn--glass" href="#events">Partner events</a>
          </div>
        </div>

        <a className="hero__scroll" href="#main" aria-label="Scroll to content">
          <span></span>
        </a>
      </section>
    </div>
  );
});

/**
 * Imperative canvas/SVG engine for the hero scene. Returns a cleanup function.
 */
function mountHero(root, landRings) {
  const hero = root.querySelector('[data-hero]');
  if (!hero) return () => {};
  'use strict';

  const scene = hero.querySelector('[data-scene]');
  if (!scene) return () => {};
  const cleanups = [];
  const listen = (target, type, fn) => { target.addEventListener(type, fn); cleanups.push(() => target.removeEventListener(type, fn)); };

  const $ = (sel) => scene.querySelector(sel);
  const content = hero.querySelector('[data-hero-content]');
  const globeEl = $('[data-globe]');
  const globeCanvas = $('[data-globe-canvas]');
  const seaBack = $('[data-sea-back]');
  const seaFront = $('[data-sea-front]');
  const shipEl = $('[data-ship]');
  const planeEl = $('[data-plane]');
  const skylineEl = $('[data-skyline]');
  const sparklesEl = $('[data-sparkles]');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const TAU = Math.PI * 2;

  /* Deterministic PRNG so the skyline / containers look the same every visit */
  const rng = (seed) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const svgEl = (tag, attrs) => {
    const el = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* ---------------------------------------------------------
     Layout — one composition for wide screens, one for portrait
     --------------------------------------------------------- */
  let W = 0, H = 0;
  const L = {};

  function computeLayout() {
    W = hero.clientWidth;
    H = hero.clientHeight;
    const portrait = W <= 760 || W / H < 1;
    L.portrait = portrait;
    L.s = Math.min(W, H) / 800; // general size unit

    if (portrait) {
      // Text sits in the sky; the globe, skyline and sea fill the rest (like the source art)
      const top = content ? content.offsetTop + content.offsetHeight + 12 : H * 0.35;
      const seaH = Math.max(H * 0.2, 150);
      L.horizon = H - seaH;
      L.gd = Math.min(W * 0.8, 640, (L.horizon - top) / 0.88);
      L.gd = Math.max(L.gd, 150);
      L.gy = L.horizon - L.gd * 0.38;
      L.gx = W * 0.5;
      L.shipW = Math.min(W * 0.8, L.gd * 1.3, 620);
      L.shipX = W * 0.6;
      L.planeW = clamp(W * 0.34, 110, 240);
    } else {
      L.gd = Math.min(H * 0.56, W * 0.38);
      L.gx = W * 0.67;
      L.gy = H * 0.47;
      L.horizon = L.gy + L.gd * 0.4;
      L.shipW = Math.min(W * 0.42, L.gd * 1.4);
      L.shipX = L.gx + L.gd * 0.2;
      L.planeW = clamp(W * 0.16, 140, 300);
    }
    L.sunX = L.gx;
    L.sunY = L.gy - L.gd * 0.18;
    L.span = H - L.horizon;

    const st = scene.style;
    st.setProperty('--globe-x', L.gx + 'px');
    st.setProperty('--globe-y', L.gy + 'px');
    st.setProperty('--globe-d', L.gd + 'px');
    st.setProperty('--sun-x', L.sunX + 'px');
    st.setProperty('--sun-y', L.sunY + 'px');
    st.setProperty('--horizon', (L.horizon / H) * 100 + '%');

    shipEl.style.width = L.shipW + 'px';
    shipEl.style.transformOrigin = '50% 80%';
    planeEl.style.width = L.planeW + 'px';
  }

  /* ---------------------------------------------------------
     Sparkles around the sun
     --------------------------------------------------------- */
  function buildSparkles() {
    sparklesEl.textContent = '';
    const r = rng(7);
    const n = L.portrait ? 9 : 14;
    for (let i = 0; i < n; i++) {
      const a = r() * TAU;
      const dist = L.gd * (0.6 + r() * 1.1);
      const x = L.sunX + Math.cos(a) * dist * (L.portrait ? 0.9 : 1.4);
      const y = L.sunY + Math.sin(a) * dist * 0.75;
      if (y > L.horizon - 10 || y < 40) continue;
      const s = document.createElement('i');
      s.className = 'sparkle';
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--s', 10 + r() * 26 + 'px');
      s.style.setProperty('--d', 2.5 + r() * 4 + 's');
      s.style.setProperty('--delay', -r() * 6 + 's');
      s.style.setProperty('--o', 0.6 + r() * 0.4);
      sparklesEl.appendChild(s);
    }
  }

  /* ---------------------------------------------------------
     Golden skyline (procedural SVG)
     --------------------------------------------------------- */
  function buildSkyline() {
    const h = Math.round(L.gd * 0.62 + H * 0.06);
    skylineEl.setAttribute('viewBox', `0 0 ${W} ${h}`);
    skylineEl.textContent = '';

    const defs = svgEl('defs', {});
    const grads = [
      ['bA', '#fbe3a4', '#e7b45a', '#c1872c'],
      ['bB', '#f6d68a', '#d9a347', '#a8701f'],
      ['bC', '#fff0c4', '#efc976', '#d29a32'],
    ];
    for (const [id, a, b, c] of grads) {
      const g = svgEl('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 0 });
      g.append(svgEl('stop', { offset: 0, 'stop-color': a }),
               svgEl('stop', { offset: 0.45, 'stop-color': b }),
               svgEl('stop', { offset: 1, 'stop-color': c }));
      defs.append(g);
    }
    const haze = svgEl('linearGradient', { id: 'skyHaze', x1: 0, y1: 0, x2: 0, y2: 1 });
    haze.append(svgEl('stop', { offset: 0, 'stop-color': '#fff6dc', 'stop-opacity': 0 }),
                svgEl('stop', { offset: 0.7, 'stop-color': '#fff6dc', 'stop-opacity': 0.55 }),
                svgEl('stop', { offset: 1, 'stop-color': '#ffffff', 'stop-opacity': 0.95 }));
    const pat = svgEl('pattern', { id: 'winPat', width: 6, height: 9, patternUnits: 'userSpaceOnUse' });
    pat.append(svgEl('rect', { x: 1, y: 2, width: 3, height: 5, fill: '#8a5a12', opacity: 0.22 }));
    defs.append(haze, pat);
    skylineEl.append(defs);

    const r = rng(42);
    const layer = (opacity, minH, maxH, density) => {
      const g = svgEl('g', { opacity });
      let x = -10;
      while (x < W + 10) {
        const bw = (14 + r() * 34) * clamp(L.s * 1.2, 0.6, 1.4) * density;
        // taller towers at the edges, lower in the middle behind the globe
        const edge = Math.abs(x / W - 0.5) * 2;
        const centerDip = L.portrait ? 0.45 + edge * 0.75 : (x < W * 0.5 ? 0.5 : 0.55 + edge * 0.55);
        const bh = h * (minH + r() * (maxH - minH)) * centerDip;
        const y = h - bh;
        const fill = `url(#b${'ABC'[(r() * 3) | 0]})`;
        g.append(svgEl('rect', { x, y, width: bw, height: bh, fill }));
        g.append(svgEl('rect', { x: x + 2, y: y + 4, width: Math.max(0, bw - 4), height: bh, fill: 'url(#winPat)' }));
        const crown = r();
        if (crown < 0.3) {
          // spire
          const sh = bh * (0.12 + r() * 0.18);
          g.append(svgEl('path', { d: `M${x} ${y} L${x + bw / 2} ${y - sh} L${x + bw} ${y} Z`, fill }));
          g.append(svgEl('rect', { x: x + bw / 2 - 0.75, y: y - sh - bh * 0.08, width: 1.5, height: bh * 0.08, fill: '#e9c06b' }));
        } else if (crown < 0.55) {
          // stepped crown
          const sw = bw * 0.6, sh = bh * 0.08;
          g.append(svgEl('rect', { x: x + (bw - sw) / 2, y: y - sh, width: sw, height: sh, fill }));
          g.append(svgEl('rect', { x: x + (bw - sw * 0.5) / 2, y: y - sh * 2, width: sw * 0.5, height: sh, fill }));
        } else if (crown < 0.7) {
          g.append(svgEl('rect', { x: x + bw * 0.3, y: y - bh * 0.1, width: 1.4, height: bh * 0.1, fill: '#e9c06b' }));
        }
        // glinting windows
        if (r() < 0.55) {
          const n = 1 + ((r() * 3) | 0);
          for (let i = 0; i < n; i++) {
            const w = svgEl('rect', {
              class: 'win', x: x + 2 + r() * (bw - 6), y: y + 6 + r() * bh * 0.7,
              width: 3, height: 4, fill: '#fffbe6',
            });
            w.style.animationDelay = (-r() * 7).toFixed(2) + 's';
            w.style.animationDuration = (4 + r() * 6).toFixed(2) + 's';
            g.append(w);
          }
        }
        x += bw + (r() < 0.3 ? r() * 8 : 1);
      }
      return g;
    };

    skylineEl.append(layer(0.55, 0.45, 1.0, 1.1));
    skylineEl.append(layer(0.95, 0.2, 0.75, 1));
    skylineEl.append(svgEl('rect', { x: 0, y: 0, width: W, height: h, fill: 'url(#skyHaze)' }));
  }

  /* ---------------------------------------------------------
     Ship details (containers, windows, railings)
     --------------------------------------------------------- */
  function buildShip() {
    const g = shipEl.querySelector('[data-containers]');
    if (g.childElementCount) return;
    const r = rng(11);
    const colors = ['#c8462f', '#2f6fb2', '#e0913a', '#e9e6df', '#3b8fa0', '#23446d', '#b7342b', '#4b86c9', '#d9b23c', '#9aa5b1'];
    const cw = 34, ch = 18;
    const deckY = (x) => 141 - (x - 30) * (14 / 956); // follows the sheer line
    for (let x = 202; x < 900; x += cw + 1) {
      const bay = (x - 202) / 700;
      const tiers = Math.round(4 + Math.sin(bay * Math.PI) * 2.6 + (r() - 0.5) * 1.4) - (x > 860 ? 2 : 0);
      for (let t = 0; t < tiers; t++) {
        const y = deckY(x) - (t + 1) * (ch + 1);
        const col = colors[(r() * colors.length) | 0];
        g.append(svgEl('rect', { x, y, width: cw, height: ch, fill: col }));
        g.append(svgEl('rect', { x, y, width: cw, height: ch, fill: 'url(#corr)' }));
        g.append(svgEl('rect', { x, y, width: cw, height: 2, fill: '#fff', opacity: 0.25 }));
      }
    }
    const hw = shipEl.querySelector('[data-house-windows]');
    for (let row = 0; row < 4; row++) {
      for (let c = 0; c < 6; c++) {
        hw.append(svgEl('rect', { x: 82 + c * 16, y: 58 + row * 20, width: 10, height: 6, rx: 1 }));
      }
    }
    hw.append(svgEl('rect', { x: 64, y: 43, width: 124, height: 6, fill: '#1f2c40' }));
    const rail = shipEl.querySelector('[data-rail]');
    for (let x = 40; x < 980; x += 14) {
      const y = 142 - (x - 30) * (14 / 956);
      rail.append(svgEl('line', { x1: x, y1: y, x2: x, y2: y - 6 }));
    }
    const win = planeEl.querySelector('[data-windows]');
    for (let x = 96; x < 262; x += 8.5) win.append(svgEl('rect', { x, y: 47, width: 4, height: 4.4, rx: 1.6 }));
  }

  /* ---------------------------------------------------------
     Globe — per-pixel orthographic renderer of a gold/blue
     equirectangular texture built from Natural Earth land data
     --------------------------------------------------------- */
  const TW = 2048, TH = 1024;
  const globe = {
    ctx: globeCanvas.getContext('2d'),
    tex: null, size: 0, img: null,
    idx: null, lu: null, lv: null, mul: null, add: null,
    lon0: -38, // Atlantic facing the viewer, as in the artwork
    speed: 360 / 60, // degrees per second

    buildTexture(rings) {
      const c = document.createElement('canvas');
      c.width = TW; c.height = TH;
      const x = c.getContext('2d');
      const ocean = x.createLinearGradient(0, 0, 0, TH);
      ocean.addColorStop(0, '#2a6fcf');
      ocean.addColorStop(0.5, '#1f86e6');
      ocean.addColorStop(1, '#2a6fcf');
      x.fillStyle = ocean;
      x.fillRect(0, 0, TW, TH);

      if (rings) {
        const land = new Path2D();
        const px = (lon) => ((lon + 180) / 360) * TW;
        const py = (lat) => ((90 - lat) / 180) * TH;
        for (const ring of rings) {
          // unwrap longitudes so antimeridian-crossing rings stay continuous
          const pts = [];
          let prev = ring[0], off = 0;
          for (let i = 0; i < ring.length; i += 2) {
            let lon = ring[i];
            if (i && lon - prev > 180) off -= 360;
            else if (i && prev - lon > 180) off += 360;
            prev = lon;
            pts.push(lon + off, ring[i + 1]);
          }
          for (const shift of [-360, 0, 360]) {
            land.moveTo(px(pts[0] + shift), py(pts[1]));
            for (let i = 2; i < pts.length; i += 2) land.lineTo(px(pts[i] + shift), py(pts[i + 1]));
            land.closePath();
          }
        }

        // shallow-water glow around coasts
        x.save();
        x.shadowColor = 'rgba(140, 225, 255, .9)';
        x.shadowBlur = 22;
        x.fillStyle = '#58b9f2';
        x.fill(land, 'evenodd');
        x.restore();

        // gold land
        const gold = x.createLinearGradient(0, 0, 0, TH);
        gold.addColorStop(0, '#f3d27e');
        gold.addColorStop(0.35, '#e6b552');
        gold.addColorStop(0.55, '#f0c568');
        gold.addColorStop(1, '#c89032');
        x.fillStyle = gold;
        x.fill(land, 'evenodd');

        // bevel: light inner edge (top-left) and dark inner edge (bottom-right)
        const outside = new Path2D();
        outside.rect(-100, -100, TW + 200, TH + 200);
        outside.addPath(land);
        const bevel = (color, dx, dy, blur) => {
          x.save();
          x.clip(land, 'evenodd');
          x.shadowColor = color;
          x.shadowBlur = blur;
          x.shadowOffsetX = dx;
          x.shadowOffsetY = dy;
          x.fillStyle = '#000';
          x.fill(outside, 'evenodd');
          x.restore();
        };
        bevel('rgba(255, 246, 205, .95)', 3, 3, 4);
        bevel('rgba(120, 72, 10, .55)', -3, -3, 5);
        x.lineWidth = 1.2;
        x.strokeStyle = 'rgba(255, 240, 190, .55)';
        x.stroke(land);
      }

      // subtle grain so flat colours shimmer as they rotate
      const id = x.getImageData(0, 0, TW, TH);
      const d = id.data;
      const r = rng(3);
      for (let i = 0; i < d.length; i += 4) {
        const n = (r() - 0.5) * 14;
        d[i] += n; d[i + 1] += n; d[i + 2] += n;
      }
      this.tex = d;
    },

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const S = Math.round(clamp(L.gd * dpr, 120, L.portrait ? 640 : 760));
      if (S === this.size && this.img) return;
      this.size = S;
      globeCanvas.width = S;
      globeCanvas.height = S;
      this.img = this.ctx.createImageData(S, S);

      // Precompute everything that does not change as the globe spins
      const tilt = (18 * Math.PI) / 180;   // look slightly down on the north
      const roll = (-12 * Math.PI) / 180;  // axial lean
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      const cr = Math.cos(roll), sr = Math.sin(roll);
      let lx = -0.5, ly = 0.55, lz = 0.67;
      const ll = Math.hypot(lx, ly, lz); lx /= ll; ly /= ll; lz /= ll;
      let hx = lx, hy = ly, hz = lz + 1;
      const hl = Math.hypot(hx, hy, hz); hx /= hl; hy /= hl; hz /= hl;

      const R = S / 2;
      const idx = [], lu = [], lv = [], mul = [], add = [];
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const nx = (x + 0.5 - R) / R;
          const ny = -(y + 0.5 - R) / R;
          const r2 = nx * nx + ny * ny;
          const r = Math.sqrt(r2);
          if (r > 1 + 1 / R) continue;
          const nz = Math.sqrt(Math.max(0, 1 - r2));
          // view -> body frame
          const x1 = nx * cr + ny * sr;
          const y1 = -nx * sr + ny * cr;
          const y2 = y1 * ct + nz * st;
          const z2 = -y1 * st + nz * ct;
          const lat = Math.asin(clamp(y2, -1, 1));
          const lon = Math.atan2(x1, z2);
          idx.push((y * S + x) * 4);
          lu.push((lon / TAU + 0.5) * TW);
          lv.push(clamp(Math.floor((0.5 - lat / Math.PI) * TH), 0, TH - 1) * TW);

          const diff = Math.max(0, nx * lx + ny * ly + nz * lz);
          const spec = Math.pow(Math.max(0, nx * hx + ny * hy + nz * hz), 36);
          const rim = Math.pow(1 - nz, 2.6);
          const edge = clamp((1 - r) * R + 0.5, 0, 1);
          mul.push(0.5 + 0.72 * diff);
          add.push(
            spec * 190 + rim * 150,
            spec * 185 + rim * 205,
            spec * 170 + rim * 255,
            edge * 255
          );
        }
      }
      this.idx = Int32Array.from(idx);
      this.lu = Float32Array.from(lu);
      this.lv = Int32Array.from(lv);
      this.mul = Float32Array.from(mul);
      this.add = Float32Array.from(add);
    },

    draw(t) {
      if (!this.tex || !this.img) return;
      const { idx, lu, lv, mul, add, tex } = this;
      const out = this.img.data;
      const lon = this.lon0 - t * this.speed; // surface moves west -> east
      let off = ((lon / 360) * TW) % TW;
      if (off < 0) off += TW;
      for (let k = 0, n = idx.length; k < n; k++) {
        let u = lu[k] + off;
        if (u >= TW) u -= TW;
        const ti = (lv[k] + (u | 0)) << 2;
        const o = idx[k];
        const m = mul[k];
        const a = k << 2;
        out[o] = tex[ti] * m + add[a];
        out[o + 1] = tex[ti + 1] * m + add[a + 1];
        out[o + 2] = tex[ti + 2] * m + add[a + 2];
        out[o + 3] = add[a + 3];
      }
      this.ctx.putImageData(this.img, 0, 0);
    },
  };

  /* ---------------------------------------------------------
     Sea — layered sine swells, foam, sun glitter and spray
     --------------------------------------------------------- */
  const bctx = seaBack.getContext('2d');
  const fctx = seaFront.getContext('2d');
  let seaDpr = 1;

  // f: depth below horizon (fraction of sea span), a: amplitude, k: wavelength, v: speed
  const LAYERS = [
    { f: 0.0, a: 2.5, k: 110, v: 14, c: ['#e2f3fc', '#9fd0f0'], foam: 0.35, canvas: 'back' },
    { f: 0.08, a: 6, k: 230, v: 22, c: ['#7cc2f0', '#2f87d8'], foam: 0.6, canvas: 'back', swell: true },
    { f: 0.2, a: 9, k: 300, v: 34, c: ['#46a4ea', '#1560bd'], foam: 0.75, canvas: 'back' },
    { f: 0.34, a: 10, k: 360, v: 48, c: ['#4fb1ef', '#1257b3'], foam: 0.9, canvas: 'front', ship: true },
    { f: 0.64, a: 14, k: 460, v: 70, c: ['#a9dcf9', '#3d95df'], foam: 1, canvas: 'front' },
  ];

  function swellAt(x, t) {
    // big breaking wave on the left and a smaller one on the right, as in the artwork
    const s = L.s;
    const breathe = 0.85 + 0.15 * Math.sin(t * 0.55);
    const c1 = L.portrait ? W * 0.06 : W * 0.04;
    const wl = L.portrait ? W * 0.32 : W * 0.2, wr = L.portrait ? W * 0.2 : W * 0.12;
    const d1 = (x - c1) / (x < c1 ? wl : wr);
    const h1 = L.gd * (L.portrait ? 0.42 : 0.24) * breathe * Math.exp(-d1 * d1);
    const c2 = W * 0.97;
    const d2 = (x - c2) / (W * 0.1);
    const h2 = L.gd * 0.12 * (0.8 + 0.2 * Math.sin(t * 0.8 + 1)) * Math.exp(-d2 * d2);
    return (h1 + h2) * (s > 0 ? 1 : 0);
  }

  function surface(layer, x, t) {
    const s = clamp(L.s, 0.55, 1.6);
    const A = layer.a * s;
    const k = TAU / (layer.k * s);
    const w = layer.v * k * s;
    const base = L.horizon + L.span * layer.f;
    let y = base
      - A * (0.6 * Math.sin(k * x + w * t + layer.f * 10)
           + 0.3 * Math.sin(k * 1.9 * x - w * 0.6 * t + 1.3)
           + 0.1 * Math.sin(k * 4.3 * x + w * 1.7 * t + 2.1));
    if (layer.swell) y -= swellAt(x, t);
    return y;
  }

  const particles = [];
  function spawn(x, y, vx, vy, size, life, canvas) {
    if (particles.length > 260) return;
    particles.push({ x, y, vx, vy, size, life, max: life, canvas });
  }

  function drawLayer(ctx, layer, t, step) {
    const pts = [];
    for (let x = -step; x <= W + step; x += step) pts.push(x, surface(layer, x, t));
    let top = Infinity;
    for (let i = 1; i < pts.length; i += 2) if (pts[i] < top) top = pts[i];

    const g = ctx.createLinearGradient(0, top, 0, H);
    g.addColorStop(0, layer.c[0]);
    g.addColorStop(0.35, layer.c[1]);
    g.addColorStop(1, layer.c[1]);
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.lineTo(W + step, H + 2);
    ctx.lineTo(-step, H + 2);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();

    // inner water streaks following the crest
    const s = clamp(L.s, 0.55, 1.6);
    ctx.lineWidth = 1.2 * s;
    for (let j = 1; j <= 2; j++) {
      ctx.beginPath();
      const dy = layer.a * s * (0.9 + j * 0.9);
      for (let i = 0; i < pts.length; i += 2) {
        const x = pts[i];
        const y = pts[i + 1] + dy + Math.sin(x * 0.02 + t * (1 + j) + j) * 2 * s;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.16 / j})`;
      ctx.stroke();
    }

    // foam crest
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.lineWidth = (5 + layer.foam * 6) * s;
    ctx.strokeStyle = `rgba(255,255,255,${0.12 + layer.foam * 0.12})`;
    ctx.stroke();
    ctx.lineWidth = (1.2 + layer.foam * 1.8) * s;
    ctx.strokeStyle = `rgba(255,255,255,${0.35 + layer.foam * 0.5})`;
    ctx.stroke();

    // whitecaps on the peaks
    ctx.fillStyle = `rgba(255,255,255,${0.55 * layer.foam})`;
    for (let i = 3; i < pts.length - 2; i += 2) {
      const y = pts[i];
      if (y < pts[i - 2] && y <= pts[i + 2]) {
        const x = pts[i - 1];
        ctx.beginPath();
        ctx.ellipse(x, y + 1.5 * s, (8 + layer.foam * 14) * s, (2 + layer.foam * 2.5) * s, 0, 0, TAU);
        ctx.fill();
        if (Math.random() < 0.04 * layer.foam && !reduceMotion.matches) {
          spawn(x, y, (Math.random() - 0.6) * 30 * s, -(20 + Math.random() * 30) * s, (1 + Math.random() * 2) * s, 0.9, layer.canvas);
        }
      }
    }

    // breaking curl: dense whitewater + spray on the big swell
    if (layer.swell) {
      const c1 = L.portrait ? W * 0.06 : W * 0.04;
      const crestX = c1 + (L.portrait ? W * 0.05 : W * 0.04);
      const cy = surface(layer, crestX, t);
      const rad = L.gd * 0.22;
      const grad = ctx.createRadialGradient(crestX, cy + rad * 0.2, 0, crestX, cy + rad * 0.2, rad * 1.6);
      grad.addColorStop(0, 'rgba(255,255,255,.85)');
      grad.addColorStop(0.4, 'rgba(225,245,255,.35)');
      grad.addColorStop(1, 'rgba(225,245,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(crestX, cy + rad * 0.25, rad * 1.6, rad * 0.9, -0.2, 0, TAU);
      ctx.fill();
      // curling lip lines
      ctx.lineCap = 'round';
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        const phase = t * 1.4 + j * 1.3;
        const ox = Math.sin(phase) * 6 * s;
        for (let x = crestX - rad * 2.4; x < crestX + rad * 1.1; x += 6) {
          const y = surface(layer, x, t) + j * 7 * s + Math.sin(x * 0.03 + phase) * 3 * s;
          x === crestX - rad * 2.4 ? ctx.moveTo(x + ox, y) : ctx.lineTo(x + ox, y);
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.5 - j * 0.08})`;
        ctx.lineWidth = (3 - j * 0.4) * s;
        ctx.stroke();
      }
      ctx.lineCap = 'butt';
      if (!reduceMotion.matches) {
        for (let i = 0; i < 3; i++) {
          const x = crestX - Math.random() * rad * 1.8;
          spawn(x, surface(layer, x, t), (20 + Math.random() * 60) * s, -(30 + Math.random() * 70) * s,
            (1.2 + Math.random() * 2.8) * s, 1 + Math.random() * 0.8, 'back');
        }
      }
    }
  }

  function drawGlitter(ctx, t) {
    // sunlight sparkling on the water beneath the sun
    const s = clamp(L.s, 0.55, 1.6);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 46; i++) {
      const fx = Math.sin(i * 12.9898) * 43758.5453;
      const r1 = fx - Math.floor(fx);
      const fy = Math.sin(i * 78.233) * 12345.6789;
      const r2 = fy - Math.floor(fy);
      const depth = r2 * 0.32;
      const spread = W * (0.08 + depth * 0.9);
      const x = L.sunX + (r1 - 0.5) * 2 * spread;
      const y = L.horizon + L.span * depth + 2;
      const a = Math.max(0, Math.sin(t * (2 + r1 * 3) + i * 1.7));
      if (a < 0.2) continue;
      ctx.globalAlpha = a * 0.9;
      ctx.fillRect(x, y, (6 + r2 * 18) * s * a, 1.3 * s);
    }
    ctx.globalAlpha = 1;
  }

  function drawParticles(ctx, which, dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.canvas !== which) continue;
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.vy += 90 * clamp(L.s, 0.55, 1.6) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const a = p.life / p.max;
      ctx.globalAlpha = a * 0.9;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.4 - a * 0.4), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------------------------------------------------------
     Ship riding the front swell
     --------------------------------------------------------- */
  const ship = { y: null, rot: 0, x: 0 };
  const shipLayer = LAYERS.find((l) => l.ship);

  function updateShip(t) {
    const shipH = L.shipW * 0.3;
    const cx = L.shipX + Math.sin(t * 0.09) * W * 0.012;
    const half = L.shipW * 0.4;
    const ys = surface(shipLayer, cx - half, t);
    const yb = surface(shipLayer, cx + half, t);
    const ym = surface(shipLayer, cx, t);
    const targetY = (ys + yb + ym * 2) / 4 + shipH * 0.06;
    const targetRot = Math.atan2(yb - ys, half * 2) * 0.75;
    if (ship.y === null) { ship.y = targetY; ship.rot = targetRot; }
    ship.y += (targetY - ship.y) * 0.12;
    ship.rot += (targetRot - ship.rot) * 0.08;
    ship.x = cx;
    const tx = cx - L.shipW / 2;
    const ty = ship.y - shipH * 0.8;
    shipEl.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotate(${(ship.rot * 180 / Math.PI).toFixed(2)}deg)`;
  }

  function drawShipWater(ctx, t, dt) {
    // bow wave and wake drawn in front of the hull
    const s = clamp(L.s, 0.55, 1.6);
    const sc = L.shipW / 1000;
    const cos = Math.cos(ship.rot), sin = Math.sin(ship.rot);
    const toWorld = (sx, sy) => {
      const dx = (sx - 500) * sc, dy = (sy - 240) * sc;
      return [ship.x + dx * cos - dy * sin, ship.y + dx * sin + dy * cos];
    };
    const [bx, by] = toWorld(960, 248);
    const [sx, sy] = toWorld(60, 246);

    // bow cushion
    const pulse = 0.8 + 0.2 * Math.sin(t * 3);
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, 60 * sc * 10 * 0.12 * pulse);
    g.addColorStop(0, 'rgba(255,255,255,.95)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(bx - 10 * sc, by, 90 * sc * pulse, 26 * sc, ship.rot, 0, TAU);
    ctx.fill();

    // foam line along the hull
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const [x, y] = toWorld(60 + i * 45, 244 + Math.sin(i * 1.3 + t * 4) * 3);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 4 * s;
    ctx.stroke();

    // wake trailing behind the stern
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      const len = L.shipW * (0.35 + j * 0.12);
      for (let x = 0; x <= len; x += 6) {
        const wx = sx - x;
        const y = sy + j * 4 * s + Math.sin(x * 0.05 - t * 4 + j) * 2 * s + x * 0.02 * j;
        x ? ctx.lineTo(wx, y) : ctx.moveTo(wx, y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.55 - j * 0.15})`;
      ctx.lineWidth = (3 - j * 0.6) * s;
      ctx.stroke();
    }

    if (!reduceMotion.matches && dt > 0) {
      for (let i = 0; i < 2; i++) {
        spawn(bx + (Math.random() - 0.5) * 12 * sc * 10 * 0.2, by - 4 * s,
          (10 + Math.random() * 50) * s, -(30 + Math.random() * 60) * s,
          (1 + Math.random() * 2.4) * s, 0.7 + Math.random() * 0.5, 'front');
      }
    }
  }

  /* ---------------------------------------------------------
     Plane on a climbing bezier flight path (behind the globe)
     --------------------------------------------------------- */
  const PLANE_FLIGHT = 17;
  const PLANE_GAP = 4;

  function bezier(p, a, b, c, d) {
    const u = 1 - p;
    return u * u * u * a + 3 * u * u * p * b + 3 * u * p * p * c + p * p * p * d;
  }

  function updatePlane(t) {
    const cycle = PLANE_FLIGHT + PLANE_GAP;
    const ct = (t + 3) % cycle;
    if (ct > PLANE_FLIGHT) { planeEl.style.opacity = '0'; return; }
    const p = ct / PLANE_FLIGHT;
    // on wide screens the plane emerges from the haze rather than crossing the headline
    planeEl.style.opacity = L.portrait ? '1' : String(clamp(p / 0.12, 0, 1));
    let P;
    if (L.portrait) {
      const top = L.gy - L.gd * 0.5;
      P = [[-0.45 * W, top + L.gd * 0.3], [0.2 * W, top - L.gd * 0.05], [0.65 * W, top - L.gd * 0.25], [1.4 * W, top - L.gd * 0.55]];
    } else {
      P = [[0.47 * W, H * 0.44], [0.5 * W, H * 0.2], [0.7 * W, H * 0.06], [1.15 * W, H * 0.04]];
    }
    const x = bezier(p, P[0][0], P[1][0], P[2][0], P[3][0]);
    const y = bezier(p, P[0][1], P[1][1], P[2][1], P[3][1]);
    const e = 0.002;
    const x2 = bezier(p + e, P[0][0], P[1][0], P[2][0], P[3][0]);
    const y2 = bezier(p + e, P[0][1], P[1][1], P[2][1], P[3][1]);
    const ang = Math.atan2(y2 - y, x2 - x) * 0.85;
    const scale = L.portrait ? 1.05 - p * 0.5 : 0.75 + p * 0.35; // portrait: flying away; wide: banking toward us
    const ph = L.planeW * 0.375;
    planeEl.style.transform =
      `translate3d(${(x - L.planeW / 2).toFixed(1)}px, ${(y - ph / 2).toFixed(1)}px, 0) rotate(${(ang * 180 / Math.PI).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  }

  /* ---------------------------------------------------------
     Main loop
     --------------------------------------------------------- */
  let raf = 0, last = 0, time = 0, inView = true;

  function resizeCanvases() {
    seaDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    for (const c of [seaBack, seaFront]) {
      c.width = Math.round(W * seaDpr);
      c.height = Math.round(H * seaDpr);
    }
  }

  function render(t, dt) {
    globe.draw(t);

    const step = Math.max(5, Math.round(W / 220));
    bctx.setTransform(seaDpr, 0, 0, seaDpr, 0, 0);
    bctx.clearRect(0, 0, W, H);
    // horizon glow line where sea meets sky
    const hg = bctx.createLinearGradient(0, L.horizon - 30, 0, L.horizon + 10);
    hg.addColorStop(0, 'rgba(255,255,255,0)');
    hg.addColorStop(1, 'rgba(255,255,255,.8)');
    bctx.fillStyle = hg;
    bctx.fillRect(0, L.horizon - 30, W, 40);
    for (const layer of LAYERS) if (layer.canvas === 'back') drawLayer(bctx, layer, t, step);
    drawGlitter(bctx, t);
    bctx.fillStyle = '#fff';
    drawParticles(bctx, 'back', dt);

    updateShip(t);

    fctx.setTransform(seaDpr, 0, 0, seaDpr, 0, 0);
    fctx.clearRect(0, 0, W, H);
    for (const layer of LAYERS) {
      if (layer.canvas !== 'front') continue;
      drawLayer(fctx, layer, t, step);
      if (layer.ship) drawShipWater(fctx, t, dt);
    }
    // bright surf mist at the bottom edge, as in the artwork
    const mist = fctx.createLinearGradient(0, H * 0.86, 0, H);
    mist.addColorStop(0, 'rgba(255,255,255,0)');
    mist.addColorStop(1, 'rgba(255,255,255,.85)');
    fctx.fillStyle = mist;
    fctx.fillRect(0, H * 0.86, W, H * 0.14);
    fctx.fillStyle = '#fff';
    drawParticles(fctx, 'front', dt);

    updatePlane(t);
  }

  function frame(now) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    time += dt;
    render(time, dt);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf || reduceMotion.matches || !inView || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  function still() {
    // a single composed frame for reduced-motion users
    stop();
    particles.length = 0;
    ship.y = null;
    time = 7.5;
    render(time, 0);
  }

  function setup() {
    computeLayout();
    resizeCanvases();
    globe.resize();
    buildSkyline();
    buildSparkles();
    ship.y = null;
    particles.length = 0;
    if (reduceMotion.matches) still();
    else render(time, 0);
  }

  let resizeTimer = 0, lastW = 0;
  listen(window, 'resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // ignore pure height jitter from mobile browser toolbars
      if (hero.clientWidth === lastW && Math.abs(hero.clientHeight - H) < 80) return;
      lastW = hero.clientWidth;
      setup();
    }, 150);
  });

  listen(document, 'visibilitychange', () => (document.hidden ? stop() : start()));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      inView ? start() : stop();
    });
    io.observe(hero);
    cleanups.push(() => io.disconnect());
  }
  const onMotionChange = () => (reduceMotion.matches ? still() : start());
  listen(reduceMotion, 'change', onMotionChange);

  // Boot: ocean-only globe first, then gold continents as soon as the data arrives
  buildShip();
  globe.buildTexture(null);
  lastW = hero.clientWidth;
  setup();
  start();
  globe.buildTexture(landRings);
  if (reduceMotion.matches) still();

  return () => {
    stop();
    clearTimeout(resizeTimer);
    cleanups.forEach((fn) => fn());
  };

}

/* ------------------------------------------------------------------ ASSETS */
const LOGO = 'data:image/webp;base64,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';

/** Natural Earth land rings (lon, lat pairs) for the globe texture. */
const LAND_RINGS = [[-59.6,-80,-59.9,-80.5,-60.2,-81,-62.3,-80.9,-64.5,-80.9,-65.7,-80.6,-65.7,-80.5,-66.3,-80.3,-64,-80.3,-61.9,-80.4,-61.1,-80,-60.6,-79.6,-59.6,-80],[-159.2,-79.5,-161.1,-79.6,-162.4,-79.3,-163,-78.9,-163.1,-78.9,-163.7,-78.6,-163.1,-78.2,-161.2,-78.4,-160.2,-78.7,-159.5,-79,-159.2,-79.5],[-45.2,-78,-43.9,-78.5,-43.5,-79.1,-43.4,-79.5,-43.3,-80,-44.9,-80.3,-46.5,-80.6,-48.4,-80.8,-50.5,-81,-52.9,-81,-54.2,-80.6,-54,-80.2,-51.9,-79.9,-51,-79.6,-50.4,-79.2,-49.9,-78.8,-49.3,-78.5,-48.7,-78,-48.2,-78,-46.7,-77.8,-45.2,-78],[-121.2,-73.5,-119.9,-73.7,-118.7,-73.5,-119.3,-73.8,-120.2,-74.1,-121.6,-74,-122.6,-73.7,-122.4,-73.3,-121.2,-73.5],[-125.6,-73.5,-124,-73.9,-124.6,-73.8,-125.9,-73.7,-127.3,-73.5,-126.6,-73.2,-125.6,-73.5],[-99,-71.9,-97.9,-72.1,-96.8,-72,-96.2,-72.5,-97,-72.4,-98.2,-72.5,-99.4,-72.4,-100.8,-72.5,-101.8,-72.3,-102.3,-71.9,-101.7,-71.7,-100.4,-71.9,-99,-71.9],[-68.5,-71,-68.3,-71.4,-68.5,-71.8,-68.8,-72.2,-70,-72.3,-71.1,-72.5,-72.4,-72.5,-71.9,-72.1,-73.1,-72.2,-74.2,-72.4,-75,-72.1,-75,-71.7,-73.9,-71.3,-73.2,-71.2,-72.1,-71.2,-71.8,-70.7,-71.7,-70.3,-71.7,-69.5,-71.2,-69,-70.3,-68.9,-69.7,-69.3,-69.5,-69.6,-69.1,-70.1,-68.7,-70.5,-68.5,-71],[-180,-84.7,-179.9,-84.7,-179.1,-84.1,-177.3,-84.5,-177.1,-84.4,-176.9,-84.3,-176.5,-84.2,-176.2,-84.1,-176.1,-84.1,-175.9,-84.1,-175.8,-84.1,-174.4,-84.5,-173.1,-84.1,-172.9,-84.1,-170,-83.9,-169,-84.1,-168.5,-84.2,-167,-84.6,-164.2,-84.8,-161.9,-85.1,-158.1,-85.4,-155.2,-85.1,-150.9,-85.3,-148.5,-85.6,-145.9,-85.3,-143.1,-85,-142.9,-84.6,-146.8,-84.5,-150.1,-84.3,-150.9,-83.9,-153.6,-83.7,-153.4,-83.2,-153,-82.8,-152.7,-82.5,-152.9,-82,-154.5,-81.8,-155.3,-81.4,-156.8,-81.1,-154.4,-81.2,-152.1,-81,-150.6,-81.3,-148.9,-81,-147.2,-80.7,-146.4,-80.3,-146.8,-79.9,-148.1,-79.7,-149.5,-79.4,-151.6,-79.3,-153.4,-79.2,-155.3,-79.1,-156,-78.7,-157.3,-78.4,-158.1,-78,-158.4,-76.9,-157.9,-77,-157,-77.3,-155.3,-77.2,-153.7,-77.1,-152.9,-77.5,-151.3,-77.4,-150,-77.2,-148.7,-76.9,-147.6,-76.6,-146.1,-76.5,-146.1,-76.1,-146.5,-75.7,-146.2,-75.4,-144.9,-75.2,-144.3,-75.5,-142.8,-75.3,-141.6,-75.1,-140.2,-75.1,-138.9,-75,-137.5,-74.7,-136.4,-74.5,-135.2,-74.3,-134.4,-74.4,-133.7,-74.4,-132.3,-74.3,-130.9,-74.5,-129.6,-74.5,-128.2,-74.3,-126.9,-74.4,-125.4,-74.5,-124,-74.5,-122.6,-74.5,-121.1,-74.5,-119.7,-74.5,-118.7,-74.2,-117.5,-74,-116.2,-74.2,-115,-74.1,-113.9,-73.7,-113.3,-74,-112.9,-74.4,-112.3,-74.7,-111.3,-74.4,-110.1,-74.8,-108.7,-74.9,-107.6,-75.2,-106.1,-75.1,-104.9,-74.9,-103.4,-75,-102,-75.1,-100.6,-75.3,-100.1,-74.9,-100.8,-74.5,-101.3,-74.2,-102.5,-74.1,-103.1,-73.7,-103.3,-73.4,-103.7,-72.6,-102.9,-72.8,-101.6,-72.8,-100.3,-72.8,-99.1,-72.9,-98.1,-73.2,-97.7,-73.6,-96.3,-73.6,-95,-73.5,-93.7,-73.3,-92.4,-73.2,-91.4,-73.4,-90.1,-73.3,-89.2,-72.6,-88.4,-73,-87.3,-73.2,-86,-73.1,-85.2,-73.5,-83.9,-73.5,-82.7,-73.6,-81.5,-73.9,-80.7,-73.5,-80.3,-73.1,-79.3,-73.5,-77.9,-73.4,-76.9,-73.6,-76.2,-74,-74.9,-73.9,-73.9,-73.7,-72.8,-73.4,-71.6,-73.3,-70.2,-73.1,-68.9,-73,-68,-72.8,-67.4,-72.5,-67.1,-72,-67.3,-71.6,-67.6,-71.2,-67.9,-70.9,-68.2,-70.5,-68.5,-70.1,-68.5,-69.7,-68.4,-69.3,-68,-69,-67.6,-68.5,-67.4,-68.2,-67.6,-67.7,-67.7,-67.3,-67.3,-66.9,-66.7,-66.6,-66.1,-66.2,-65.4,-65.9,-64.6,-65.6,-64.2,-65.2,-63.6,-64.9,-63,-64.6,-62,-64.6,-61.4,-64.3,-60.7,-64.1,-59.9,-64,-59.2,-63.7,-58.6,-63.4,-57.8,-63.3,-57.2,-63.5,-57.6,-63.9,-58.6,-64.2,-59,-64.4,-59.8,-64.2,-60.6,-64.3,-61.3,-64.5,-62,-64.8,-62.5,-65.1,-62.6,-65.5,-62.6,-65.9,-62.1,-66.2,-62.8,-66.4,-63.7,-66.5,-64.3,-66.8,-64.9,-67.1,-65.5,-67.6,-65.7,-68,-65.3,-68.4,-64.8,-68.7,-64,-68.9,-63.2,-69.2,-62.8,-69.6,-62.6,-70,-62.3,-70.4,-61.8,-70.7,-61.5,-71.1,-61.4,-72,-61.1,-72.4,-61,-72.8,-60.7,-73.2,-60.8,-73.7,-61.4,-74.1,-62,-74.4,-63.3,-74.6,-63.7,-74.9,-64.4,-75.3,-65.9,-75.6,-67.2,-75.8,-68.4,-76,-69.8,-76.2,-70.6,-76.6,-72.2,-76.7,-74,-76.6,-75.6,-76.7,-77.2,-76.7,-76.9,-77.1,-75.4,-77.3,-74.3,-77.6,-73.7,-77.9,-74.8,-78.2,-76.5,-78.1,-77.9,-78.4,-78,-78.8,-78,-79.2,-76.8,-79.5,-76.6,-79.9,-75.4,-80.3,-73.2,-80.4,-71.4,-80.7,-70,-81,-68.2,-81.3,-65.7,-81.5,-63.3,-81.7,-61.6,-82,-59.7,-82.4,-58.7,-82.8,-58.2,-83.2,-57,-82.9,-55.4,-82.6,-53.6,-82.3,-51.5,-82,-49.8,-81.7,-47.3,-81.7,-44.8,-81.8,-42.8,-82.1,-42.2,-81.7,-40.8,-81.4,-38.2,-81.3,-36.3,-81.1,-34.4,-80.9,-32.3,-80.8,-30.1,-80.6,-28.6,-80.3,-29.3,-80,-29.7,-79.6,-29.7,-79.3,-31.6,-79.3,-33.7,-79.5,-35.6,-79.5,-35.9,-79.1,-35.8,-78.3,-35.3,-78.1,-33.9,-77.9,-32.2,-77.7,-31,-77.4,-29.8,-77.1,-28.9,-76.7,-27.5,-76.5,-26.2,-76.4,-25.5,-76.3,-23.9,-76.2,-22.5,-76.1,-21.2,-75.9,-20,-75.7,-18.9,-75.4,-17.5,-75.1,-16.6,-74.8,-15.7,-74.5,-15.4,-74.1,-16.5,-73.9,-16.1,-73.5,-15.4,-73.1,-14.4,-73,-13.3,-72.7,-12.3,-72.4,-11.5,-72,-11,-71.5,-10.3,-71.3,-9.1,-71.3,-8.6,-71.7,-7.4,-71.7,-7.4,-71.3,-6.9,-70.9,-5.8,-71,-5.5,-71.4,-4.3,-71.5,-3,-71.3,-1.8,-71.2,-0.7,-71.2,-0.2,-71.6,0.9,-71.3,1.9,-71.1,3,-71,4.1,-70.9,5.2,-70.6,6.3,-70.5,7.1,-70.2,7.7,-69.9,8.5,-70.1,9.5,-70,10.3,-70.5,10.8,-70.8,12,-70.6,12.4,-70.2,13.4,-70,14.7,-70,15.1,-70.4,15.9,-70,17,-69.9,18.2,-69.9,19.3,-69.9,20.4,-70,21.5,-70.1,21.9,-70.4,22.6,-70.7,23.7,-70.5,24.8,-70.5,26,-70.5,27.1,-70.5,28.1,-70.3,29.2,-70.2,30,-69.9,31,-69.8,32,-69.7,32.8,-69.4,33.3,-68.8,33.9,-68.5,34.9,-68.7,35.3,-69,36.2,-69.2,37.2,-69.2,37.9,-69.5,38.6,-69.8,39.7,-69.5,40,-69.1,40.9,-68.9,42,-68.6,42.9,-68.5,44.1,-68.3,44.9,-68.1,45.7,-67.8,46.5,-67.6,47.4,-67.7,48.3,-67.4,49,-67.1,49.9,-67.1,50.8,-66.9,50.9,-66.5,51.8,-66.2,52.6,-66.1,53.6,-65.9,54.5,-65.8,55.4,-65.9,56.4,-66,57.2,-66.2,57.3,-66.7,58.1,-67,58.7,-67.3,59.9,-67.4,60.6,-67.7,61.4,-68,62.4,-68,63.2,-67.8,64.1,-67.4,65,-67.6,66,-67.7,66.9,-67.9,67.9,-67.9,68.9,-67.9,69.7,-69,69.7,-69.2,69.6,-69.7,68.6,-69.9,67.8,-70.3,67.9,-70.7,69.1,-70.7,68.9,-71.1,68.4,-71.4,67.9,-71.9,68.7,-72.2,69.9,-72.3,71,-72.1,71.6,-71.7,71.9,-71.3,72.5,-71,73.1,-70.7,73.3,-70.4,73.9,-69.9,74.5,-69.8,75.6,-69.7,76.6,-69.6,77.6,-69.5,78.1,-69.1,78.4,-68.7,79.1,-68.3,80.1,-68.1,80.9,-67.9,81.5,-67.5,82.1,-67.4,82.8,-67.2,83.8,-67.3,84.7,-67.2,85.7,-67.1,86.8,-67.1,87.5,-66.9,88,-66.2,88.4,-66.5,88.8,-67,89.7,-67.1,90.6,-67.2,91.6,-67.1,92.6,-67.2,93.5,-67.2,94.2,-67.1,95,-67.2,95.8,-67.4,96.7,-67.2,97.8,-67.2,98.7,-67.1,99.7,-67.2,100.4,-66.9,100.9,-66.6,101.6,-66.3,102.8,-65.6,103.5,-65.7,104.2,-66,104.9,-66.3,106.2,-66.9,107.2,-67,108.1,-67,109.2,-66.8,110.2,-66.7,111.1,-66.4,111.7,-66.1,112.9,-66.1,113.6,-65.9,114.4,-66.1,114.9,-66.4,115.6,-66.7,116.7,-66.7,117.4,-66.9,118.6,-67.2,119.8,-67.3,120.9,-67.2,121.7,-66.9,122.3,-66.6,123.2,-66.5,124.1,-66.6,125.2,-66.7,126.1,-66.6,127,-66.6,127.9,-66.7,128.8,-66.8,129.7,-66.6,130.8,-66.4,131.8,-66.4,132.9,-66.4,133.9,-66.3,134.8,-66.2,135,-65.7,135.1,-65.3,135.7,-65.6,135.9,-66,136.2,-66.4,136.6,-66.8,137.5,-67,138.6,-66.9,139.9,-66.9,140.8,-66.8,142.1,-66.8,143.1,-66.8,144.4,-66.8,145.5,-66.9,146.2,-67.2,146,-67.6,146.6,-67.9,147.7,-68.1,148.8,-68.4,150.1,-68.6,151.5,-68.7,152.5,-68.9,153.6,-68.9,154.3,-68.6,155.2,-68.8,155.9,-69.1,156.8,-69.4,158,-69.5,159.2,-69.6,159.7,-70,160.8,-70.2,161.6,-70.6,162.7,-70.7,163.8,-70.7,164.9,-70.8,166.1,-70.8,167.3,-70.8,168.4,-71,169.5,-71.2,170.5,-71.4,171.2,-71.7,171.1,-72.1,170.6,-72.4,170.1,-72.9,169.8,-73.2,169.3,-73.7,168,-73.8,167.4,-74.2,166.1,-74.4,165.6,-74.8,165,-75.1,164.2,-75.5,163.8,-75.9,163.6,-76.2,163.5,-76.7,163.5,-77.1,164.1,-77.5,164.3,-77.8,164.7,-78.2,166.6,-78.3,167,-78.8,165.2,-78.9,163.7,-79.1,161.8,-79.2,160.9,-79.7,160.7,-80.2,160.3,-80.6,159.8,-80.9,161.1,-81.3,161.6,-81.7,162.5,-82.1,163.7,-82.4,165.1,-82.7,166.6,-83,168.9,-83.3,169.4,-83.8,172.3,-84,172.5,-84.1,173.2,-84.4,176,-84.2,178.3,-84.5,-180,-84.7],[-67.8,-53.8,-66.5,-54.5,-65.1,-54.7,-65.5,-55.2,-66.5,-55.2,-67,-54.9,-67.3,-55.3,-68.1,-55.6,-69.2,-55.5,-70,-55.2,-71,-55.1,-72.3,-54.5,-73.3,-54,-74.7,-52.8,-73.8,-53,-72.4,-53.7,-71.1,-54.1,-70.6,-53.6,-70.3,-52.9,-69.3,-52.5,-68.6,-52.6,-68.3,-53.1,-67.8,-53.8],[-58.5,-51.1,-57.7,-51.5,-58,-51.9,-59.4,-52.2,-59.8,-51.8,-60.7,-52.3,-61.2,-51.8,-60,-51.3,-59.2,-51.5,-58.5,-51.1],[70.3,-49.7,68.7,-49.8,68.7,-49.2,68.9,-48.8,68.9,-48.6,69.6,-48.9,70.5,-49.1,70.6,-49.3,70.3,-49.7],[145.4,-40.8,146.4,-41.1,146.9,-41,147.7,-40.8,148.3,-40.9,148.4,-42.1,148,-42.4,147.9,-43.2,147.6,-42.9,146.9,-43.6,146.7,-43.6,146,-43.5,145.4,-42.7,145.3,-42,144.7,-41.2,144.7,-40.7,145.4,-40.8],[173,-40.9,173.2,-41.3,174,-40.9,174.2,-41.3,174.2,-41.8,173.9,-42.2,173.2,-43,172.7,-43.4,173.1,-43.9,172.3,-43.9,171.5,-44.2,171.2,-44.9,170.6,-45.9,169.8,-46.4,169.3,-46.6,168.4,-46.6,167.8,-46.3,166.7,-46.2,166.5,-45.9,167,-45.1,168.3,-44.1,168.9,-43.9,169.7,-43.6,170.5,-43,171.1,-42.5,171.6,-41.8,172,-41.5,172.1,-41,172.8,-40.5,173,-40.9],[174.6,-36.2,175.3,-37.2,175.4,-36.5,175.8,-36.8,176,-37.6,176.8,-37.9,177.4,-38,178,-37.6,178.5,-37.7,178.3,-38.6,178,-39.2,177.2,-39.1,176.9,-39.4,177,-39.9,176.9,-40.1,176.5,-40.6,176,-41.3,175.2,-41.7,175.1,-41.4,174.7,-41.3,175.2,-40.5,174.9,-39.9,173.8,-39.5,173.9,-39.1,174.6,-38.8,174.7,-38,174.7,-37.4,174.3,-36.7,174.3,-36.5,173.8,-36.1,173.1,-35.2,172.6,-34.5,173,-34.5,173.6,-35,174.3,-35.3,174.6,-36.2],[167.1,-22.2,166.7,-22.4,166.2,-22.1,165.5,-21.7,164.8,-21.1,164.2,-20.4,164,-20.1,164.5,-20.1,165,-20.5,165.5,-20.8,165.8,-21.1,166.6,-21.7,167.1,-22.2],[178.4,-17.3,178.7,-17.6,178.6,-18.2,177.9,-18.3,177.4,-18.2,177.3,-17.7,177.7,-17.4,178.1,-17.5,178.4,-17.3],[-180,-16.6,179.4,-16.8,178.7,-17,178.6,-16.6,179.1,-16.4,179.4,-16.4,-180,-16.1,-179.8,-16,-179.9,-16.5,-180,-16.6],[167.8,-16.5,167.5,-16.6,167.2,-16.2,167.2,-15.9,167.8,-16.5],[167.1,-14.9,167.3,-15.7,167,-15.6,166.8,-15.7,166.7,-15.4,166.6,-14.6,167.1,-14.9],[50.1,-13.6,50.2,-14.8,50.5,-15.2,50.4,-15.7,50.2,-16,49.9,-15.4,49.7,-15.7,49.9,-16.5,49.8,-16.9,49.5,-17.1,49.4,-18,49,-19.1,48.5,-20.5,47.9,-22.4,47.5,-23.8,47.1,-24.9,46.3,-25.2,45.4,-25.6,44.8,-25.3,44,-25,43.8,-24.5,43.7,-23.6,43.3,-22.8,43.3,-22.1,43.4,-21.3,43.9,-21.2,43.9,-20.8,44.4,-20.1,44.5,-19.4,44.2,-19,44,-18.3,44,-17.4,44.3,-16.9,44.4,-16.2,44.9,-16.2,45.5,-16,45.9,-15.8,46.3,-15.8,46.9,-15.2,47.7,-14.6,48,-14.1,47.9,-13.7,48.3,-13.8,48.8,-13.1,48.9,-12.5,49.2,-12,49.5,-12.5,49.8,-12.9,50.1,-13.6],[143.6,-13.8,143.9,-14.5,144.6,-14.2,144.9,-14.6,145.4,-15,145.3,-15.4,145.5,-16.3,145.6,-16.8,145.9,-16.9,146.2,-17.8,146.1,-18.3,146.4,-19,147.5,-19.5,148.2,-20,148.8,-20.4,148.7,-20.6,149.3,-21.3,149.7,-22.3,150.1,-22.1,150.5,-22.6,150.7,-22.4,150.9,-23.5,151.6,-24.1,152.1,-24.5,152.9,-25.3,153.1,-26.1,153.2,-26.6,153.1,-27.3,153.6,-28.1,153.5,-29,153.3,-29.5,153.1,-30.4,153.1,-30.9,152.9,-31.6,152.4,-32.6,151.7,-33,151.3,-33.8,151,-34.3,150.7,-35.2,150.3,-35.7,150.1,-36.4,149.9,-37.1,150,-37.4,149.4,-37.8,148.3,-37.8,147.4,-38.2,146.9,-38.6,146.3,-39,145.5,-38.6,144.9,-38.4,145,-37.9,144.5,-38.1,143.6,-38.8,142.7,-38.5,142.2,-38.4,141.6,-38.3,140.6,-38,140,-37.4,139.8,-36.6,139.6,-36.1,139.1,-35.7,138.1,-35.6,138.4,-35.1,138.2,-34.4,137.7,-35.1,136.8,-35.3,137.4,-34.7,137.5,-34.1,137.9,-33.6,137.8,-32.9,137,-33.8,136.4,-34.1,136,-34.9,135.2,-34.5,135.2,-33.9,134.6,-33.2,134.1,-32.8,134.3,-32.6,133,-32,132.3,-32,131.3,-31.5,129.5,-31.6,128.2,-31.9,127.1,-32.3,126.1,-32.2,125.1,-32.7,124.2,-33,124,-33.5,123.7,-33.9,122.8,-33.9,122.2,-34,121.3,-33.8,120.6,-33.9,119.9,-34,119.3,-34.5,119,-34.5,118.5,-34.7,118,-35.1,117.3,-35,116.6,-35,115.6,-34.4,115,-34.2,115,-33.6,115.5,-33.5,115.7,-33.3,115.7,-32.9,115.8,-32.2,115.7,-31.6,115.2,-30.6,115,-30,115,-29.5,114.6,-28.8,114.6,-28.5,114.2,-28.1,114,-27.3,113.5,-26.5,113.3,-26.1,113.8,-26.5,113.4,-25.6,113.9,-25.9,114.2,-26.3,114.2,-25.8,113.7,-25,113.6,-24.7,113.4,-24.4,113.5,-23.8,113.7,-23.6,113.8,-23.1,113.7,-22.5,114.1,-21.8,114.2,-22.5,114.6,-21.8,115.5,-21.5,115.9,-21.1,116.7,-20.7,117.2,-20.6,117.4,-20.7,118.2,-20.4,118.8,-20.3,119,-20,119.3,-20,119.8,-20,120.9,-19.7,121.4,-19.2,121.7,-18.7,122.2,-18.2,122.3,-17.8,122.3,-17.3,123,-16.4,123.4,-17.3,123.9,-17.1,123.5,-16.6,123.8,-16.1,124.3,-16.3,124.4,-15.6,124.9,-15.1,125.2,-14.7,125.7,-14.5,125.7,-14.2,126.1,-14.3,126.1,-14.1,126.6,-14,127.1,-13.8,127.8,-14.3,128.4,-14.9,129,-14.9,129.6,-15,129.4,-14.4,129.9,-13.6,130.3,-13.4,130.2,-13.1,130.6,-12.5,131.2,-12.2,131.7,-12.3,132.6,-12.1,132.6,-11.6,131.8,-11.3,132.4,-11.1,133,-11.4,133.6,-11.8,134.4,-12,134.7,-11.9,135.3,-12.2,135.9,-12,136.3,-12,136.5,-11.9,137,-12.4,136.7,-12.9,136.3,-13.3,136,-13.3,136.1,-13.7,135.8,-14.2,135.4,-14.7,135.5,-15,136.3,-15.6,137.1,-15.9,137.6,-16.2,138.3,-16.8,138.6,-16.8,139.1,-17.1,139.3,-17.4,140.2,-17.7,140.9,-17.4,141.1,-16.8,141.3,-16.4,141.4,-15.8,141.7,-15,141.6,-14.6,141.6,-14.3,141.5,-13.7,141.7,-12.9,141.8,-12.7,141.7,-12.4,141.9,-11.9,142.1,-11.3,142.1,-11,142.5,-10.7,142.8,-11.2,142.9,-11.8,143.1,-11.9,143.2,-12.3,143.5,-12.8,143.6,-13.4,143.6,-13.8],[162.1,-10.5,162.4,-10.8,161.7,-10.8,161.3,-10.2,161.9,-10.4,162.1,-10.5],[120.7,-10.2,120.3,-10.3,119,-9.6,119.9,-9.4,120.4,-9.7,120.8,-10,120.7,-10.2],[160.9,-9.9,160.5,-9.9,159.9,-9.8,159.6,-9.6,159.7,-9.2,160.4,-9.4,160.7,-9.6,160.9,-9.9],[161.7,-9.6,161.5,-9.8,160.8,-8.9,160.6,-8.3,160.9,-8.3,161.3,-9.1,161.7,-9.6],[124.4,-10.1,123.6,-10.4,123.5,-10.2,123.6,-9.9,124,-9.3,125,-8.9,125.1,-8.7,125.9,-8.4,126.6,-8.4,127,-8.3,127.3,-8.4,127,-8.7,125.9,-9.1,125.1,-9.4,124.4,-10.1],[117.9,-8.1,118.3,-8.4,118.9,-8.3,119.1,-8.7,118,-8.9,117.3,-9,116.7,-9,117.1,-8.5,117.6,-8.4,117.9,-8.1],[122.9,-8.1,122.8,-8.7,121.3,-8.9,119.9,-8.8,119.9,-8.4,120.7,-8.2,121.3,-8.5,122,-8.5,122.9,-8.1],[159.9,-8.3,159.9,-8.5,159.1,-8.1,158.6,-7.8,158.2,-7.4,158.4,-7.3,158.8,-7.6,159.6,-8,159.9,-8.3],[157.5,-7.3,157.3,-7.4,156.9,-7.2,156.5,-6.8,156.5,-6.6,157.1,-7,157.5,-7.3],[108.6,-6.8,110.5,-6.9,110.8,-6.5,112.6,-6.9,113,-7.6,114.5,-7.8,115.7,-8.4,114.6,-8.8,113.5,-8.3,112.6,-8.4,111.5,-8.3,110.6,-8.1,109.4,-7.7,108.7,-7.6,108.3,-7.8,106.5,-7.4,106.3,-6.9,105.4,-6.9,106.1,-5.9,107.3,-6,108.1,-6.3,108.5,-6.4,108.6,-6.8],[134.7,-6.2,134.2,-6.9,134.1,-6.1,134.3,-5.8,134.5,-5.4,134.7,-5.7,134.7,-6.2],[155.9,-6.8,155.6,-6.9,155.2,-6.5,154.7,-5.9,154.5,-5.1,154.7,-5,154.8,-5.3,155.1,-5.6,155.5,-6.2,156,-6.5,155.9,-6.8],[152,-5.5,151.5,-5.6,151.3,-5.8,150.8,-6.1,150.2,-6.3,149.7,-6.3,148.9,-6,148.3,-5.7,148.4,-5.4,149.3,-5.6,149.8,-5.5,150,-5,150.1,-5,150.2,-5.5,150.8,-5.5,151.1,-5.1,151.6,-4.8,151.5,-4.2,152.1,-4.1,152.3,-4.3,152.3,-4.9,152,-5.5],[127.2,-3.5,126.9,-3.8,126.2,-3.6,126,-3.2,127,-3.1,127.2,-3.5],[130.5,-3.1,130.8,-3.9,130,-3.4,129.2,-3.4,128.6,-3.4,127.9,-3.4,128.1,-2.8,129.4,-2.8,130.5,-3.1],[153.1,-4.5,152.8,-4.8,152.6,-4.2,152.4,-3.8,152,-3.5,151.4,-3,150.7,-2.7,150.9,-2.5,151.5,-2.8,151.8,-3,152.2,-3.2,152.6,-3.7,153,-4,153.1,-4.5],[134.1,-1.2,134.4,-2.8,135.5,-3.4,136.3,-2.3,137.4,-1.7,138.3,-1.7,139.2,-2.1,139.9,-2.4,141,-2.6,142.7,-3.3,144.6,-3.9,145.3,-4.4,145.8,-4.9,146,-5.5,147.6,-6.1,147.9,-6.6,147,-6.7,147.2,-7.4,148.1,-8,148.7,-9.1,149.3,-9.1,149.3,-9.5,150,-9.7,149.7,-9.9,150.8,-10.3,150.7,-10.6,150,-10.7,149.8,-10.4,148.9,-10.3,147.9,-10.1,147.1,-9.5,146.6,-8.9,146,-8.1,144.7,-7.6,143.9,-7.9,143.3,-8.2,143.4,-9,142.6,-9.3,142.1,-9.2,141,-9.1,140.1,-8.3,139.1,-8.1,138.9,-8.4,137.6,-8.4,138,-7.6,138.7,-7.3,138.4,-6.2,137.9,-5.4,136,-4.5,135.2,-4.5,133.7,-3.5,133.4,-4,133,-4.1,132.8,-3.7,132.8,-3.3,132,-2.8,133.1,-2.5,133.8,-2.5,133.7,-2.2,132.2,-2.2,131.8,-1.6,130.9,-1.4,130.5,-0.9,131.9,-0.7,132.4,-0.4,134,-0.8,134.1,-1.2],[125.2,1.4,124.4,0.4,123.7,0.2,122.7,0.4,121.1,0.4,120.2,0.2,120,-0.5,120.9,-1.4,121.5,-1,123.3,-0.6,123.3,-1.1,122.8,-0.9,122.4,-1.5,121.5,-1.9,122.5,-3.2,122.3,-3.5,123.2,-4.7,123.2,-5.3,122.6,-5.6,122.2,-5.3,122.7,-4.5,121.7,-4.9,121.5,-4.6,121.6,-4.2,120.9,-3.6,121,-2.6,120.3,-2.9,120.4,-4.1,120.4,-5.5,119.8,-5.7,119.4,-5.4,119.7,-4.5,119.5,-3.5,119.1,-3.5,118.8,-2.8,119.2,-2.1,119.3,-1.4,119.8,0.2,120,0.6,120.9,1.3,121.7,1,122.9,0.9,124.1,0.9,125.1,1.6,125.2,1.4],[128.7,1.1,128.6,0.3,128.1,0.4,128,-0.3,128.4,-0.8,128.1,-0.9,127.7,-0.3,127.4,1,127.6,1.8,127.9,2.2,128,1.6,128.6,1.5,128.7,1.1],[105.8,-5.9,104.7,-5.9,103.9,-5,102.6,-4.2,102.2,-3.6,101.4,-2.8,100.9,-2.1,100.1,-0.7,99.3,0.2,99,1,98.6,1.8,97.7,2.5,97.2,3.3,96.4,3.9,95.4,5,95.3,5.5,95.9,5.4,97.5,5.2,98.4,4.3,99.1,3.6,99.7,3.2,100.6,2.1,101.7,2.1,102.5,1.4,103.1,0.6,103.8,0.1,103.4,-0.7,104,-1.1,104.4,-1.1,104.5,-1.8,104.9,-2.3,105.6,-2.4,106.1,-3.1,105.9,-4.3,105.8,-5.9],[117.9,1.8,119,0.9,117.8,0.8,117.5,0.1,117.5,-0.8,116.6,-1.5,116.5,-2.5,116.1,-4,116,-3.7,114.9,-4.1,114.5,-3.5,113.8,-3.4,113.3,-3.1,112.1,-3.5,111.7,-3,111,-3,110.2,-2.9,110.1,-1.6,109.6,-1.3,109.1,-0.5,109,0.4,109.1,1.3,109.7,2,110.4,1.7,111.2,1.9,111.4,2.7,111.8,2.9,113,3.1,113.7,3.9,114.2,4.5,114.6,4.9,115.5,5.4,116.2,6.1,116.7,6.9,117.1,6.9,117.6,6.4,117.7,6,118.3,5.7,119.2,5.4,119.1,5,118.4,5,118.6,4.5,117.9,4.1,117.3,3.2,118,2.3,117.9,1.8],[126.4,8.4,126.5,7.8,126.5,7.2,126.2,6.3,125.8,7.3,125.4,6.8,125.7,6,125.4,5.6,124.2,6.2,123.9,6.9,124.2,7.4,123.6,7.8,123.3,7.4,122.8,7.5,122.1,6.9,121.9,7.2,122.3,8,122.9,8.3,123.5,8.7,123.8,8.2,124.6,8.5,124.8,9,125.5,9,125.4,9.8,126.2,9.3,126.3,8.8,126.4,8.4],[81.2,6.2,80.3,6,79.9,6.8,79.7,8.2,80.1,9.8,80.8,9.3,81.3,8.6,81.8,7.5,81.6,6.5,81.2,6.2],[-60.9,10.1,-61.8,10,-62,10.1,-61.7,10.4,-61.7,10.8,-61.1,10.9,-60.9,10.9,-60.9,10.1],[124,10.3,123.6,9.9,123.3,9.3,123,9,122.4,9.7,122.6,10,122.8,10.3,122.9,10.9,123.5,10.9,123.3,10.3,124.1,11.2,124,10.3],[118.5,9.3,117.2,8.4,117.7,9.1,118.4,9.7,119,10.4,119.5,11.4,119.7,10.6,119,10,118.5,9.3],[121.9,11.9,122.5,11.6,123.1,11.6,123.1,11.2,122.6,10.7,122,10.4,122,10.9,122,11.4,121.9,11.9],[125.5,12.2,125.8,11,125,11.3,125,11,125.3,10.4,124.8,10.1,124.8,10.8,124.5,10.9,124.3,11.5,124.9,11.4,124.9,11.8,124.3,12.6,125.2,12.5,125.5,12.2],[121.5,13.1,121.3,12.2,120.8,12.7,120.3,13.5,121.2,13.4,121.5,13.1],[121.3,18.5,121.9,18.2,122.2,18.5,122.3,18.2,122.2,17.8,122.5,17.1,122.3,16.3,121.7,15.9,121.5,15.1,121.7,14.3,122.3,14.2,122.7,14.3,124,13.8,123.9,13.2,124.2,13,124.1,12.5,123.3,13,122.9,13.6,122.7,13.2,122,13.8,121.1,13.6,120.6,13.9,120.7,14.3,121,14.5,120.7,14.8,120.6,14.4,120.1,15,119.9,15.4,119.9,16.4,120.3,16,120.4,17.6,120.7,18.5,121.3,18.5],[-65.6,18.2,-65.8,18,-66.6,18,-67.2,17.9,-67.2,18.4,-67.1,18.5,-66.3,18.5,-65.8,18.4,-65.6,18.2],[-76.9,17.9,-77.2,17.7,-77.8,17.9,-78.3,18.2,-78.2,18.5,-77.8,18.5,-77.6,18.5,-76.9,18.4,-76.4,18.2,-76.2,17.9,-76.9,17.9],[-72.6,19.9,-71.7,19.7,-71.6,19.9,-70.8,19.9,-70.2,19.6,-70,19.6,-69.8,19.3,-69.2,19.3,-69.3,19,-68.8,19,-68.3,18.6,-68.7,18.2,-69.2,18.4,-69.6,18.4,-70,18.4,-70.1,18.2,-70.5,18.2,-70.7,18.4,-71,18.3,-71.4,17.6,-71.7,17.8,-71.7,18,-72.4,18.2,-72.8,18.1,-73.5,18.2,-73.9,18,-74.5,18.3,-74.4,18.7,-73.4,18.5,-72.7,18.4,-72.3,18.7,-72.8,19.1,-72.8,19.5,-73.4,19.6,-73.2,19.9,-72.6,19.9],[110.3,18.7,109.5,18.2,108.7,18.5,108.6,19.4,109.1,19.8,110.2,20.1,110.8,20.1,111,19.7,110.6,19.3,110.3,18.7],[-155.5,19.1,-155.7,18.9,-155.9,19.1,-155.9,19.3,-156.1,19.7,-156,19.8,-155.9,20,-155.9,20.2,-155.9,20.3,-155.8,20.2,-155.4,20.1,-155.2,20,-155.1,19.9,-154.8,19.5,-155.2,19.2,-155.5,19.1],[-156.1,20.6,-156.4,20.6,-156.6,20.8,-156.7,20.9,-156.6,21,-156.3,20.9,-156,20.8,-156.1,20.6],[-156.8,21.2,-156.8,21.1,-157.3,21.1,-157.3,21.2,-156.8,21.2],[-157.7,21.3,-157.8,21.3,-158.1,21.3,-158.3,21.5,-158.3,21.6,-158,21.7,-157.9,21.7,-157.7,21.3],[-159.3,22,-159.5,21.9,-159.8,22.1,-159.7,22.1,-159.6,22.2,-159.4,22.2,-159.3,22],[-79.7,22.8,-79.3,22.4,-78.3,22.5,-78,22.3,-77.1,21.7,-76.5,21.2,-76.2,21.2,-75.6,21,-75.7,20.7,-74.9,20.7,-74.2,20.3,-74.3,20.1,-75,19.9,-75.6,19.9,-76.3,20,-77.8,19.9,-77.1,20.4,-77.5,20.7,-78.1,20.7,-78.5,21,-78.7,21.6,-79.3,21.6,-80.2,21.8,-80.5,22,-81.8,22.2,-82.2,22.4,-81.8,22.6,-82.8,22.7,-83.5,22.2,-83.9,22.2,-84.1,21.9,-84.5,21.8,-85,21.9,-84.4,22.2,-84.2,22.6,-83.8,22.8,-83.3,23,-82.5,23.1,-82.3,23.2,-81.4,23.1,-80.6,23.1,-79.7,22.8],[-77.5,23.8,-77.8,23.7,-78,24.3,-78.4,24.6,-78.2,25.2,-77.9,25.2,-77.5,24.3,-77.5,23.8],[121.2,22.8,120.7,22,120.2,22.8,120.1,23.6,120.7,24.5,121.5,25.3,122,25,121.8,24.4,121.2,22.8],[-77.8,26.6,-78.9,26.4,-79,26.8,-78.5,26.9,-77.8,26.8,-77.8,26.6],[-77,26.6,-77.2,25.9,-77.4,26,-77.3,26.5,-77.8,26.9,-77.8,27,-77,26.6],[134.6,34.1,134.8,33.8,134.2,33.2,133.8,33.5,133.3,33.3,133,32.7,132.4,33,132.4,33.5,132.9,34.1,133.5,33.9,133.9,34.4,134.6,34.1],[34.6,35.7,33.9,35.2,34,35.1,34,35,33,34.6,32.5,34.7,32.3,35.1,32.7,35.1,32.8,35.1,32.9,35.4,33.7,35.4,34.6,35.7],[23.7,35.7,24.2,35.4,25,35.4,25.8,35.4,25.7,35.2,26.3,35.3,26.2,35,24.7,34.9,24.7,35.1,23.5,35.3,23.7,35.7],[15.5,38.2,15.2,37.4,15.3,37.1,15.1,36.6,14.3,37,13.8,37.1,12.4,37.6,12.6,38.1,13.7,38,14.8,38.1,15.5,38.2],[9.2,41.2,9.8,40.5,9.7,39.2,9.2,39.2,8.8,38.9,8.4,39.2,8.4,40.4,8.2,41,8.7,40.9,9.2,41.2],[141,37.1,140.6,36.3,140.8,35.8,140.3,35.1,139,34.7,137.2,34.6,135.8,33.5,135.1,33.8,135.1,34.6,133.3,34.4,132.2,33.9,131,33.9,132,33.1,131.3,31.5,130.7,31,130.2,31.4,130.4,32.3,129.8,32.6,129.4,33.3,130.4,33.6,130.9,34.2,131.9,34.8,132.6,35.4,134.6,35.7,135.7,35.5,136.7,37.3,137.4,36.8,138.9,37.8,139.4,38.2,140.1,39.4,139.9,40.6,140.3,41.2,141.4,41.4,141.9,40,141.9,39.2,141,38.2,141,37.1],[9.6,42.2,9.2,41.4,8.8,41.6,8.5,42.3,8.7,42.6,9.4,43,9.6,42.2],[143.9,44.2,144.6,44,145.3,44.4,145.5,43.3,144.1,43,143.2,42,141.6,42.7,141.1,41.6,140,41.6,139.8,42.6,140.3,43.3,141.4,43.4,141.7,44.8,142,45.6,143.1,44.5,143.9,44.2],[-63.7,46.5,-62.9,46.4,-62,46.4,-62.5,46,-62.9,46,-64.1,46.4,-64.4,46.7,-64,47,-63.7,46.5],[-61.8,49.1,-62.3,49.1,-63.6,49.4,-64.5,49.9,-64.2,50,-62.9,49.7,-61.8,49.3,-61.8,49.1],[-123.5,48.5,-124,48.4,-125.7,48.8,-126,49.2,-126.8,49.5,-127,49.8,-128.1,50,-128.4,50.5,-128.4,50.8,-127.3,50.6,-126.7,50.4,-125.8,50.3,-125.4,49.9,-124.9,49.5,-123.9,49.1,-123.5,48.5],[-56.1,50.7,-56.8,49.8,-56.1,50.1,-55.5,49.9,-55.8,49.6,-54.9,49.3,-54.5,49.6,-53.5,49.2,-53.8,48.5,-53.1,48.7,-53,48.2,-52.6,47.5,-53.1,46.7,-53.5,46.6,-54.2,46.8,-54,47.6,-54.2,47.8,-55.4,46.9,-56,46.9,-55.3,47.4,-56.3,47.6,-57.3,47.6,-59.3,47.6,-59.4,47.9,-58.8,48.3,-59.2,48.5,-58.4,49.1,-57.4,50.7,-56.7,51.3,-55.9,51.6,-55.4,51.6,-55.6,51.3,-56.1,50.7],[-132.7,54,-131.7,54.1,-132.1,53,-131.2,52.2,-131.6,52.2,-132.2,52.6,-132.6,53.1,-133.1,53.4,-133.2,53.9,-133.2,54.2,-132.7,54],[143.6,50.7,144.7,49,143.2,49.3,142.6,47.9,143.5,46.8,143.5,46.1,142.7,46.7,142.1,46,141.9,46.8,142,47.8,141.9,48.9,142.1,49.6,142.2,51,141.6,51.9,141.7,53.3,142.6,53.8,142.2,54.2,142.7,54.4,142.9,53.7,143.3,52.7,143.2,51.8,143.6,50.7],[-6.8,52.3,-8.6,51.7,-10,51.8,-9.2,52.9,-9.7,53.9,-8.3,54.7,-7.6,55.1,-6.7,55.2,-5.7,54.6,-6.2,53.9,-6,53.2,-6.8,52.3],[12.7,55.6,12.1,54.8,11,55.4,10.9,55.8,12.4,56.1,12.7,55.6],[-153,57.1,-154,56.7,-154.5,57,-154.7,57.5,-153.8,57.8,-153.2,58,-152.6,57.9,-152.1,57.6,-153,57.1],[-3,58.6,-4.1,57.6,-3.1,57.7,-2,57.7,-2.2,56.9,-3.1,56,-2.1,55.9,-1.1,54.6,-0.4,54.5,0.2,53.3,0.5,52.9,1.7,52.7,1.6,52.1,1,51.8,1.4,51.3,0.5,50.8,-0.8,50.8,-2.5,50.5,-3,50.7,-3.6,50.2,-4.5,50.3,-5.2,50,-5.8,50.2,-4.3,51.2,-3.4,51.4,-5,51.6,-5.3,52,-4.2,52.3,-4.8,52.8,-4.6,53.5,-3.1,53.4,-2.9,54,-3.6,54.6,-4.8,54.8,-5.1,55.1,-4.7,55.5,-5,55.8,-5.6,55.3,-5.6,56.3,-6.2,56.8,-5.8,57.8,-5,58.6,-4.2,58.6,-3,58.6],[-165.6,59.9,-166.2,59.8,-166.8,59.9,-167.5,60.2,-166.5,60.4,-165.7,60.3,-165.6,59.9],[-79.3,62.2,-79.7,61.6,-80.1,61.7,-80.4,62,-80.3,62.1,-79.9,62.4,-79.5,62.4,-79.3,62.2],[-81.9,62.7,-83.1,62.2,-83.8,62.2,-84,62.5,-83.2,62.9,-81.9,62.9,-81.9,62.7],[-171.7,63.8,-171.1,63.6,-170.5,63.7,-169.7,63.4,-168.7,63.3,-168.8,63.2,-169.5,63,-170.3,63.2,-170.7,63.4,-171.6,63.3,-171.8,63.4,-171.7,63.8],[-85.2,65.7,-85,65.2,-84.5,65.4,-83.9,65.1,-82.8,64.8,-81.6,64.5,-81.6,64,-80.8,64.1,-80.1,63.7,-81,63.4,-82.5,63.7,-83.1,64.1,-84.1,63.6,-85.5,63.1,-85.9,63.6,-87.2,63.5,-86.4,64,-86.2,64.8,-85.9,65.7,-85.2,65.7],[-14.5,66.5,-14.7,65.8,-13.6,65.1,-14.9,64.4,-17.8,63.7,-18.7,63.5,-20,63.6,-22.8,64,-21.8,64.4,-24,64.9,-22.2,65.1,-22.2,65.4,-24.3,65.6,-23.7,66.3,-22.1,66.4,-20.6,65.7,-19.1,66.3,-17.8,66,-16.2,66.5,-14.5,66.5],[-75.9,67.1,-77,67.1,-77.2,67.6,-76.8,68.1,-75.9,68.3,-75.1,68,-75.1,67.6,-75.2,67.4,-75.9,67.1],[-180,69,-177.5,68.2,-174.9,67.2,-175,66.6,-174.3,66.3,-174.6,67.1,-171.9,66.9,-169.9,66,-170.9,65.5,-172.5,65.4,-172.6,64.5,-173,64.3,-173.9,64.3,-174.7,64.6,-176,64.9,-176.2,65.4,-177.2,65.5,-178.4,65.4,-178.9,65.7,-178.7,66.1,-179.9,65.9,-179.4,65.4,-180,65,180,65,178.7,64.5,177.4,64.6,178.3,64.1,178.9,63.3,179.4,63,179.5,62.6,179.2,62.3,177.4,62.5,174.6,61.8,173.7,61.7,172.1,60.9,170.7,60.3,170.3,59.9,168.9,60.6,166.3,59.8,165.8,60.2,164.9,59.7,163.5,59.9,163.2,59.2,162,58.2,162.1,57.8,163.2,57.6,163.1,56.2,162.1,56.1,161.7,55.3,162.1,54.9,160.4,54.3,160,53.2,158.5,53,158.2,51.9,156.8,51,156.4,51.7,156,53.2,155.4,55.4,155.9,56.8,156.8,57.4,156.8,57.8,158.4,58.1,160.1,59.3,161.9,60.3,163.7,61.1,164.5,62.6,163.3,62.5,162.7,61.6,160.1,60.5,159.3,61.8,156.7,61.4,154.2,59.8,155,59.1,152.8,58.9,151.3,58.8,151.3,59.5,149.8,59.7,148.5,59.2,145.5,59.3,142.2,59,139,57.1,135.1,54.7,136.7,54.6,137.2,54,138.2,53.8,138.8,54.3,139.9,54.2,141.3,53.1,141.4,52.2,140.6,51.2,140.5,50,140.1,48.4,138.6,47,138.2,46.3,136.9,45.1,135.5,44,134.9,43.4,133.5,42.8,132.9,42.8,132.3,43.3,130.9,42.6,130.8,42.2,130.4,42.3,130,41.9,129.7,41.6,129.7,40.9,129.2,40.7,129,40.5,128.6,40.2,128,40,127.5,39.8,127.5,39.3,127.4,39.2,127.8,39.1,128.4,38.6,129.2,37.4,129.5,36.8,129.5,35.6,129.1,35.1,128.2,34.9,127.4,34.5,126.5,34.4,126.4,34.9,126.6,35.7,126.1,36.7,126.9,36.9,126.2,37.7,125.7,37.9,125.6,37.8,125.3,37.7,125.2,37.9,125,37.9,124.7,38.1,125,38.5,125.2,38.7,125.1,38.8,125.4,39.4,125.3,39.6,124.7,39.7,124.3,39.9,122.9,39.6,122.1,39.2,121.1,38.9,121.6,39.4,121.4,39.8,122.2,40.4,121.6,40.9,120.8,40.6,119.6,39.9,119,39.3,118,39.2,117.5,38.7,118.1,38.1,118.9,37.9,118.9,37.4,119.7,37.2,120.8,37.9,121.7,37.5,122.4,37.5,122.5,36.9,121.1,36.7,120.6,36.1,119.7,35.6,119.2,34.9,120.2,34.4,120.6,33.4,121.2,32.5,121.9,31.7,121.9,30.9,121.3,30.7,121.5,30.1,122.1,29.8,121.9,29,121.7,28.2,121.1,28.1,120.4,27.1,119.6,25.7,118.7,24.5,117.3,23.6,115.9,22.8,114.8,22.7,114.2,22.2,113.8,22.5,113.2,22.1,111.8,21.6,110.8,21.4,110.4,20.3,109.9,20.3,109.6,21,109.9,21.4,108.5,21.7,108,21.6,106.7,20.7,105.9,19.8,105.7,19.1,106.4,18,107.4,16.7,108.3,16.1,108.9,15.3,109.3,13.4,109.2,11.7,108.4,11,107.2,10.4,106.4,9.5,105.2,8.6,104.8,9.2,105.1,9.9,104.3,10.5,103.5,10.6,103.1,11.2,102.6,12.2,101.7,12.6,100.8,12.6,101,13.4,100.1,13.4,100,12.3,99.5,10.8,99.2,10,99.2,9.2,99.9,9.2,100.3,8.3,100.5,7.4,101,6.9,101.6,6.7,102.1,6.2,102.4,6.1,103,5.5,103.4,4.9,103.4,4.2,103.3,3.7,103.4,3.4,103.5,2.8,103.9,2.5,104.2,1.6,104.2,1.3,103.5,1.2,102.6,2,101.4,2.8,101.3,3.3,100.7,3.9,100.6,4.8,100.2,5.3,100.3,6,100.1,6.5,99.7,6.8,99.5,7.3,99,7.9,98.5,8.4,98.3,7.8,98.1,8.3,98.3,9,98.6,9.9,98.5,10.7,98.8,11.4,98.4,12,98.5,13.1,98.1,13.6,97.8,14.8,97.6,16.1,97.2,16.9,96.5,16.4,95.4,15.7,94.8,15.8,94.2,16,94.5,17.3,94.3,18.2,93.5,19.4,93.7,19.7,93.1,19.9,92.4,20.7,92.1,21.2,92,21.7,91.8,22.2,91.4,22.8,90.5,22.8,90.6,22.4,90.3,21.8,89.8,22,89.7,21.9,89.4,22,89,22.1,88.9,21.7,88.2,21.7,87,21.5,87,20.7,86.5,20.2,85.1,19.5,83.9,18.3,83.2,17.7,82.2,17,82.2,16.6,81.7,16.3,80.8,16,80.3,15.9,80,15.1,80.2,13.8,80.3,13,79.9,12.1,79.9,10.4,79.3,10.3,78.9,9.5,79.2,9.2,78.3,8.9,77.9,8.3,77.5,8,76.6,8.9,76.1,10.3,75.7,11.3,75.4,11.8,74.9,12.7,74.6,14,74.4,14.6,73.5,16,73.1,17.9,72.8,19.2,72.8,20.4,72.6,21.4,71.2,20.8,70.5,20.9,69.2,22.1,69.6,22.5,69.3,22.8,68.2,23.7,67.4,23.9,67.1,24.7,66.4,25.4,64.5,25.2,62.9,25.2,61.5,25.1,59.6,25.4,58.5,25.6,57.4,25.7,57,27,56.5,27.1,55.7,27,54.7,26.5,53.5,26.8,52.5,27.6,51.5,27.9,50.9,28.8,50.1,30.1,49.6,30,48.9,30.3,48.6,29.9,48,30,48.2,29.5,48.1,29.3,48.4,28.6,48.8,27.7,49.3,27.5,49.5,27.1,50.2,26.7,50.2,26.3,50.1,25.9,50.2,25.6,50.5,25.3,50.7,25,50.8,24.8,50.7,25.5,51,26,51.3,26.1,51.6,25.8,51.6,25.2,51.4,24.6,51.6,24.2,51.8,24.3,51.8,24,52.6,24.2,53.4,24.2,54,24.1,54.7,24.8,55.4,25.4,56.1,26.1,56.4,26.4,56.5,26.3,56.4,25.9,56.3,25.7,56.4,24.9,56.8,24.2,57.4,23.9,58.1,23.7,58.7,23.6,59.2,23,59.4,22.7,59.8,22.5,59.8,22.3,59.4,21.7,59.3,21.4,58.9,21.1,58.5,20.4,58,20.5,57.8,20.2,57.7,19.7,57.8,19.1,57.7,18.9,57.2,18.9,56.6,18.6,56.5,18.1,56.3,17.9,55.7,17.9,55.3,17.6,55.3,17.2,54.8,16.9,54.2,17,53.6,16.7,53.1,16.7,52.4,16.4,52.2,15.9,52.2,15.6,51.2,15.2,49.6,14.7,48.7,14,48.2,13.9,47.9,14,47.4,13.6,46.7,13.4,45.9,13.3,45.6,13.3,45.4,13,45.1,13,45,12.7,44.5,12.7,44.2,12.6,43.5,12.6,43.2,13.2,43.3,13.8,43.1,14.1,42.9,14.8,42.6,15.2,42.8,15.3,42.7,15.7,42.8,15.9,42.8,16.3,42.7,16.8,42.3,17.1,42.3,17.5,41.8,17.8,41.2,18.7,40.9,19.5,40.2,20.2,39.8,20.3,39.1,21.3,39,22,39.1,22.6,38.5,23.7,38,24.1,37.5,24.3,37.2,24.9,37.2,25.1,36.9,25.6,36.6,25.8,36.3,26.6,35.6,27.4,35.1,28.1,34.6,28.1,34.8,28.6,34.8,29,35,29.4,34.9,29.5,34.6,29.1,34.4,28.3,34.2,27.8,33.9,27.6,33.6,28,33.1,28.4,32.4,29.9,32.3,29.8,32.7,28.7,33.3,27.7,34.1,26.1,34.5,25.6,34.8,25,35.7,23.9,35.5,23.8,35.5,23.1,36.7,22.2,36.9,22,37.2,21,37,20.8,37.1,19.8,37.5,18.6,37.9,18.4,38.4,18,39,16.8,39.3,15.9,39.8,15.4,41.2,14.5,41.7,13.9,42.3,13.3,42.6,13,43.1,12.7,43.3,12.4,43.3,12,42.7,11.7,43.1,11.5,43.5,11.3,43.7,10.9,44.1,10.4,44.6,10.4,45.6,10.7,46.6,10.8,47.5,11.1,48,11.2,48.4,11.4,48.9,11.4,49.3,11.4,49.7,11.6,50.3,11.7,50.7,12,51.1,12,51.1,11.7,51,11.2,51,10.6,50.8,10.3,50.6,9.2,50.1,8.1,49.5,6.8,48.6,5.3,47.7,4.2,46.6,2.9,45.6,2,44.1,1.1,43.1,0.3,42,-0.9,41.8,-1.4,41.6,-1.7,40.9,-2.1,40.6,-2.5,40.3,-2.6,40.1,-3.3,39.8,-3.7,39.6,-4.3,39.2,-4.7,38.7,-5.9,38.8,-6.5,39.4,-6.8,39.5,-7.1,39.2,-7.7,39.3,-8,39.2,-8.5,39.5,-9.1,40,-10.1,40.3,-10.3,40.5,-10.8,40.4,-11.8,40.6,-12.6,40.6,-14.2,40.8,-14.7,40.5,-15.4,40.1,-16.1,39.5,-16.7,38.5,-17.1,37.4,-17.6,36.3,-18.7,35.9,-18.8,35.2,-19.6,34.8,-19.8,34.7,-20.5,35.2,-21.3,35.4,-21.8,35.4,-22.1,35.6,-22.1,35.5,-23.1,35.4,-23.5,35.6,-23.7,35.5,-24.1,35,-24.5,34.2,-24.8,33,-25.4,32.6,-25.7,32.7,-26.1,32.9,-26.2,32.8,-26.7,32.6,-27.5,32.5,-28.3,32.2,-28.8,31.5,-29.3,31.3,-29.4,30.9,-29.9,30.6,-30.4,30.1,-31.1,28.9,-32.2,28.2,-32.8,27.5,-33.2,26.4,-33.6,25.9,-33.7,25.8,-33.9,25.2,-33.8,24.7,-34,23.6,-33.8,23,-33.9,22.6,-33.9,21.5,-34.3,20.7,-34.4,20.1,-34.8,19.6,-34.8,19.2,-34.5,18.9,-34.4,18.4,-34,18.4,-34.1,18.2,-33.9,18.3,-33.3,17.9,-32.6,18.2,-32.4,18.2,-31.7,17.6,-30.7,17.1,-29.9,16.3,-28.6,15.6,-27.8,15.2,-27.1,15,-26.1,14.7,-25.4,14.4,-23.9,14.4,-22.7,14.3,-22.1,13.9,-21.7,13.4,-20.9,12.8,-19.7,12.6,-19,11.8,-18.1,11.7,-17.3,11.6,-16.7,11.8,-15.8,12.1,-14.9,12.2,-14.4,12.5,-13.5,12.7,-13.1,13.3,-12.5,13.6,-12,13.7,-11.3,13.7,-10.7,13.4,-10.4,13.1,-9.8,12.9,-9.2,12.9,-9,13.2,-8.6,12.9,-7.6,12.7,-6.9,12.2,-6.3,12.3,-6.1,12.2,-5.8,11.9,-5,11.1,-4,10.1,-3,9.4,-2.1,8.8,-1.1,8.8,-0.8,9,-0.5,9.3,0.3,9.5,1,9.3,1.2,9.6,2.3,9.8,3.1,9.4,3.7,8.9,3.9,8.7,4.4,8.5,4.5,8.5,4.8,7.5,4.4,7.1,4.5,6.7,4.2,5.9,4.3,5.4,4.9,5,5.6,4.3,6.3,3.6,6.3,2.7,6.3,1.9,6.1,1.1,5.9,-0.5,5.3,-1.1,5,-2,4.7,-2.9,5,-3.3,5,-4,5.2,-4.6,5.2,-5.8,5,-6.5,4.7,-7.5,4.3,-7.7,4.4,-8,4.4,-9,4.8,-9.9,5.6,-10.8,6.1,-11.4,6.8,-11.7,6.9,-12.4,7.3,-12.9,7.8,-13.1,8.2,-13.2,8.9,-13.7,9.5,-14.1,9.9,-14.3,10,-14.6,10.2,-14.7,10.7,-14.8,10.9,-15.1,11,-15.7,11.5,-16.1,11.5,-16.3,11.8,-16.3,12,-16.6,12.2,-16.7,12.4,-16.8,13.2,-16.7,13.6,-17.1,14.4,-17.6,14.7,-17.2,14.9,-16.7,15.6,-16.5,16.1,-16.6,16.7,-16.3,17.2,-16.1,18.1,-16.3,19.1,-16.4,19.6,-16.3,20.1,-16.5,20.6,-17.1,21,-17,21.4,-17,21.9,-16.6,22.2,-16.3,22.7,-16.3,23,-16,23.7,-15.4,24.4,-15.1,24.5,-14.8,25.1,-14.8,25.6,-14.4,26.3,-13.8,26.6,-13.1,27.6,-12.6,28,-11.7,28.1,-10.9,28.8,-10.4,29.1,-9.6,29.9,-9.8,31.2,-9.4,32,-9.3,32.6,-8.7,33.2,-7.7,33.7,-6.9,34.1,-6.2,35.1,-5.9,35.8,-5.2,35.8,-4.6,35.3,-3.6,35.4,-2.6,35.2,-2.2,35.2,-1.2,35.7,-0.1,35.9,0.5,36.3,1.5,36.6,3.2,36.8,4.8,36.9,5.3,36.7,6.3,37.1,7.3,37.1,7.7,36.9,8.4,36.9,9.5,37.4,10.2,37.2,10.2,36.7,11,37.1,11.1,36.9,10.6,36.4,10.6,35.9,10.9,35.7,10.8,34.8,10.2,34.3,10.3,33.8,10.9,33.8,11.1,33.3,11.5,33.1,12.7,32.8,13.1,32.9,13.9,32.7,15.2,32.3,15.7,31.4,16.6,31.2,18,30.8,19.1,30.3,19.6,30.5,20.1,31,19.8,31.8,20.1,32.2,20.9,32.7,21.5,32.8,22.9,32.6,23.2,32.2,23.6,32.2,23.9,32,24.9,31.9,25.2,31.6,26.5,31.6,27.5,31.3,28.4,31,28.9,30.9,29.7,31.2,30.1,31.5,31,31.6,31.7,31.4,32,30.9,32.2,31.3,33,31,33.8,31,34.3,31.2,34.6,31.5,34.5,31.6,34.8,32.1,35,32.8,35.1,33.1,35.5,33.9,36,34.6,35.9,35.4,36.1,35.8,35.8,36.3,36.2,36.7,35.6,36.6,34.7,36.8,34,36.2,32.5,36.1,31.7,36.6,30.6,36.7,30.4,36.3,29.7,36.1,28.7,36.7,27.6,36.7,27,37.7,26.3,38.2,26.8,39,26.2,39.5,27.3,40.4,28.8,40.5,29.2,41.2,31.1,41.1,32.3,41.7,33.5,42,35.2,42,36.9,41.3,38.3,40.9,39.5,41.1,40.4,41,41.6,41.5,41.7,42,41.5,42.6,40.9,43,40.3,43.1,40,43.4,38.7,44.3,37.5,44.7,36.7,45.2,37.4,45.4,38.2,46.2,37.7,46.6,39.1,47,39.1,47.3,38.2,47.1,37.4,47,36.8,46.7,35.8,46.6,35,46.3,35,45.7,35.5,45.4,36.5,45.5,36.3,45.1,35.2,44.9,33.9,44.4,33.3,44.6,33.5,45,32.5,45.3,32.6,45.5,33.6,45.9,33.3,46.1,31.7,46.3,31.7,46.7,30.7,46.6,30.4,46,29.6,45.3,29.6,45,29.1,44.8,28.8,44.9,28.6,43.7,28,43.3,27.7,42.6,28,42,28.1,41.6,29,41.3,28.8,41.1,27.6,41,27.2,40.7,26.4,40.2,26,40.6,26.1,40.8,25.4,40.9,24.9,40.9,23.7,40.7,24.4,40.1,23.9,40,23.3,40,22.8,40.5,22.6,40.3,22.9,39.7,23.4,39.2,23,39,23.5,38.5,24,38.2,24,37.7,23.1,37.9,23.4,37.4,22.8,37.3,23.2,36.4,22.5,36.4,21.7,36.8,21.3,37.6,21.1,38.3,20.7,38.8,20.2,39.3,20.2,39.6,20,39.7,20,39.9,19.4,40.3,19.3,40.7,19.4,41.4,19.5,41.7,19.4,41.9,19.2,42,18.9,42.3,18.4,42.5,17.5,42.8,16.9,43.2,16,43.5,15.2,44.2,15.4,44.3,14.9,44.7,14.9,45.1,14.3,45.2,14,44.8,13.7,45.1,13.7,45.5,13.9,45.6,13.1,45.7,12.3,45.4,12.4,44.9,12.3,44.6,12.6,44.1,13.5,43.6,14,42.8,15.1,42,15.9,42,16.2,41.7,15.9,41.5,16.8,41.2,17.5,40.9,18.4,40.4,18.5,40.2,18.3,39.8,17.7,40.3,16.9,40.4,16.5,39.8,17.2,39.4,17.1,38.9,16.6,38.8,16.1,38,15.7,37.9,15.7,38.2,15.9,38.8,16.1,39,15.7,39.5,15.4,40,15,40.2,14.7,40.6,14.1,40.8,13.6,41.2,12.9,41.3,12.1,41.7,11.2,42.4,10.5,42.9,10.2,43.9,9.7,44,8.9,44.4,8.4,44.2,7.8,43.8,7.4,43.7,6.5,43.1,4.6,43.4,3.1,43.1,3,42.5,3,41.9,2.1,41.2,0.8,41,0.7,40.7,0.1,40.1,-0.3,39.3,0.1,38.7,-0.5,38.3,-0.7,37.6,-1.4,37.4,-2.1,36.7,-3.4,36.7,-4.4,36.7,-5,36.3,-5.4,35.9,-5.9,36,-6.2,36.4,-6.5,36.9,-7.5,37.1,-7.9,36.8,-8.4,37,-8.9,36.9,-8.7,37.7,-8.8,38.3,-9.3,38.4,-9.5,38.7,-9.4,39.4,-9,39.8,-9,40.2,-8.8,40.8,-8.8,41.2,-9,41.5,-9,41.9,-9,42.6,-9.4,43,-8,43.7,-6.8,43.6,-5.4,43.6,-4.3,43.4,-3.5,43.5,-1.9,43.4,-1.4,44,-1.2,46,-2.2,47.1,-3,47.6,-4.5,48,-4.6,48.7,-3.3,48.9,-1.6,48.6,-1.9,49.8,-1,49.3,1.3,50.1,1.6,50.9,2.5,51.1,3.3,51.3,3.8,51.6,4.7,53.1,6.1,53.5,6.9,53.5,7.1,53.7,7.9,53.7,8.1,53.5,8.8,54,8.6,54.4,8.5,55,8.1,55.5,8.1,56.5,8.3,56.8,8.5,57.1,9.4,57.2,9.8,57.4,10.6,57.7,10.5,57.2,10.3,56.9,10.4,56.6,10.9,56.5,10.7,56.1,10.4,56.2,9.6,55.5,9.9,55,9.9,54.6,10.9,54.4,10.9,54,12,54.2,12.5,54.5,13.6,54.1,14.1,53.8,14.8,54.1,16.4,54.5,17.6,54.9,18.6,54.7,18.7,54.4,19.7,54.4,19.9,54.9,21.3,55.2,21.1,56,21.1,56.8,21.6,57.4,22.5,57.8,23.3,57,24.1,57,24.3,57.8,24.4,58.4,24.1,58.3,23.4,58.6,23.3,59.2,24.6,59.5,25.9,59.6,26.9,59.4,28,59.5,29.1,60,28.1,60.5,26.3,60.4,24.5,60.1,22.9,59.8,22.3,60.4,21.3,60.7,21.5,61.7,21.1,62.6,21.5,63.2,22.4,63.8,24.7,64.9,25.4,65.1,25.3,65.5,23.9,66,22.2,65.7,21.2,65,21.4,64.4,19.8,63.6,17.8,62.7,17.1,61.3,17.8,60.6,18.8,60.1,17.9,59,16.8,58.7,16.4,57,15.9,56.1,14.7,56.2,14.1,55.4,12.9,55.4,12.6,56.3,11.8,57.4,11,58.9,10.4,59.5,8.4,58.3,7.1,58.1,5.7,58.6,5.3,59.7,5,62,5.9,62.6,8.6,63.5,10.5,64.5,12.4,65.9,14.8,67.8,16.4,68.6,19.2,69.8,21.4,70.3,23,70.2,24.5,71,26.4,71,28.2,71.2,31.3,70.5,30,70.2,31.1,69.6,32.1,69.9,33.8,69.3,36.5,69.1,40.3,67.9,41.1,67.5,41.1,66.8,40,66.3,38.4,66,33.9,66.8,33.2,66.6,34.8,65.9,34.9,64.4,36.2,64.1,37,63.9,37.1,64.3,36.5,64.8,37.2,65.1,39.6,64.5,40.4,64.8,39.8,65.5,42.1,66.5,43,66.4,44,66.1,44.5,66.8,43.7,67.4,44.2,68,43.5,68.6,46.3,68.2,46.8,67.7,45.6,67.6,45.6,67,46.3,66.7,47.9,66.9,48.1,67.5,50.2,68,53.7,68.9,54.5,68.8,53.5,68.2,54.7,68.1,55.4,68.4,57.3,68.5,58.8,68.9,59.9,68.3,61.1,68.9,60,69.5,60.6,69.9,63.5,69.5,64.9,69.2,68.5,68.1,69.2,68.6,68.2,69.1,68.1,69.4,66.9,69.5,67.3,69.9,66.7,70.7,66.7,71,68.5,71.9,69.2,72.8,69.9,73,72.6,72.8,72.8,72.2,71.8,71.4,72.5,71.1,72.8,70.4,72.6,69,73.7,68.4,73.2,67.7,71.3,66.3,72.4,66.2,72.8,66.5,73.9,66.8,74.2,67.3,75.1,67.8,74.5,68.3,74.9,69,73.8,69.1,73.6,69.6,74.4,70.6,73.1,71.4,74.9,72.1,74.7,72.8,75.2,72.9,75.7,72.3,75.3,71.3,76.4,71.2,75.9,71.9,77.6,72.3,79.7,72.3,81.5,71.7,80.6,72.6,80.5,73.6,82.3,73.9,84.7,73.8,86.8,73.9,86,74.5,87.2,75.1,88.3,75.1,90.3,75.6,92.9,75.8,93.2,76,95.9,76.1,96.7,75.9,98.9,76.4,100.8,76.4,101,76.9,102,77.3,104.4,77.7,106.1,77.4,104.7,77.1,107,77,107.2,76.5,108.2,76.7,111.1,76.7,113.3,76.2,114.1,75.8,113.9,75.3,112.8,75,110.2,74.5,109.4,74.2,110.6,74,112.1,73.8,113,74,113.5,73.3,114,73.6,115.6,73.8,118.8,73.6,119,73.1,123.2,73,123.3,73.7,125.4,73.6,127,73.6,128.6,73,129.1,72.4,128.5,72,129.7,71.2,131.3,70.8,132.3,71.8,133.9,71.4,135.6,71.7,137.5,71.3,138.2,71.6,139.9,71.5,139.1,72.4,140.5,72.8,149.5,72.2,150.4,71.6,153,70.8,157,71,159,70.9,159.8,70.5,159.7,69.7,160.9,69.4,162.3,69.6,164.1,69.7,165.9,69.5,167.8,69.6,169.6,68.7,170.8,69,170,69.7,170.5,70.1,173.6,69.8,175.7,69.9,178.6,69.4,-180,69],[49.1,41.3,49.6,40.6,50.1,40.5,50.4,40.3,49.6,40.2,49.4,39.4,49.2,39,48.9,38.8,48.9,38.3,49.2,37.6,50.1,37.4,50.8,36.9,52.3,36.7,53.8,37,53.9,37.2,53.7,37.9,53.9,39,53.1,39.3,53.4,40,52.7,40,52.9,40.9,53.9,40.6,54.7,41,54,41.6,53.7,42.1,52.9,41.9,52.8,41.1,52.5,41.8,52.4,42,52.7,42.4,52.5,42.8,51.3,43.1,50.9,44,50.3,44.3,50.3,44.6,51.3,44.5,51.3,45.2,52.2,45.4,53,45.3,53.2,46.2,53,46.9,52,46.8,51.2,47,50,46.6,49.1,46.4,48.6,45.8,47.7,45.6,46.7,44.6,47.6,43.7,47.5,43,48.6,41.8,49.1,41.3],[-95.6,69.1,-96.3,68.8,-97.6,69.1,-98.4,69,-99.8,69.4,-98.9,69.7,-98.2,70.1,-97.2,69.9,-96.6,69.7,-96.3,69.5,-95.6,69.1],[-180,71.5,180,70.8,178.9,70.8,178.7,71.1,-180,71.5],[-180,71.5,-179.9,71.6,-179,71.6,-177.6,71.3,-177.7,71.1,-178.7,70.9,-180,70.8,-180,71.5],[-90.5,69.5,-90.5,68.5,-89.2,69.3,-88,68.6,-88.3,67.9,-87.3,67.2,-86.3,67.9,-85.6,68.8,-85.5,69.9,-84.1,69.8,-82.6,69.7,-81.3,69.2,-81.2,68.7,-82,68.1,-81.3,67.6,-81.4,67.1,-83.3,66.4,-84.7,66.3,-85.8,66.6,-86.1,66.1,-87,65.2,-87.3,64.8,-88.5,64.1,-89.9,64,-90.7,63.6,-90.8,63,-91.9,62.8,-93.2,62,-94.2,60.9,-94.6,60.1,-94.7,58.9,-93.2,58.8,-92.8,57.8,-92.3,57.1,-90.9,57.3,-89,56.9,-88,56.5,-87.3,56,-86.1,55.7,-85,55.3,-83.4,55.2,-82.3,55.1,-82.4,54.3,-82.1,53.3,-81.4,52.2,-79.9,51.2,-79.1,51.5,-78.6,52.6,-79.1,54.1,-79.8,54.7,-78.2,55.1,-77.1,55.8,-76.5,56.5,-76.6,57.2,-77.3,58.1,-78.5,58.8,-77.3,59.9,-77.8,60.8,-78.1,62.3,-77.4,62.6,-75.7,62.3,-74.7,62.2,-73.8,62.4,-72.9,62.1,-71.7,61.5,-71.4,61.1,-69.6,61.1,-69.6,60.2,-69.3,59,-68.4,58.8,-67.7,58.2,-66.2,58.8,-65.2,59.9,-64.6,60.3,-63.8,59.4,-62.5,58.2,-61.4,57,-61.8,56.3,-60.5,55.8,-59.6,55.2,-58,54.9,-57.3,54.6,-56.9,53.8,-56.2,53.6,-55.8,53.3,-55.7,52.1,-56.4,51.8,-57.1,51.4,-58.8,51.1,-60,50.2,-61.7,50.1,-63.9,50.3,-65.4,50.3,-66.4,50.2,-67.2,49.5,-68.5,49.1,-70,47.7,-71.1,46.8,-70.3,47,-68.7,48.3,-66.6,49.1,-65.1,49.2,-64.2,48.7,-65.1,48.1,-64.8,47,-64.5,46.2,-63.2,45.7,-61.5,45.9,-60.5,47,-60.5,46.3,-59.8,45.9,-61,45.3,-63.3,44.7,-64.2,44.3,-65.4,43.5,-66.1,43.6,-66.2,44.5,-64.4,45.3,-66,45.3,-67.1,45.1,-67,44.8,-68,44.3,-69.1,44,-70.1,43.7,-70.7,43,-70.8,42.9,-70.8,42.3,-70.5,41.8,-70.1,41.8,-70.2,42.1,-69.9,41.9,-70,41.6,-70.6,41.5,-71.1,41.5,-71.9,41.3,-72.3,41.3,-72.9,41.2,-73.7,40.9,-72.2,41.1,-71.9,40.9,-73.3,40.6,-74,40.6,-74,40.8,-74.3,40.5,-74,40.4,-74.2,39.7,-74.9,38.9,-75,39.2,-75.2,39.2,-75.5,39.5,-75.3,39,-75.1,38.8,-75.1,38.4,-75.4,38,-75.9,37.2,-76,37.3,-75.7,37.9,-76.2,38.3,-76.4,39.1,-76.5,38.7,-76.3,38.1,-77,38.2,-76.3,37.9,-76.3,37,-76,36.9,-75.9,36.6,-75.7,35.6,-76.4,34.8,-77.4,34.5,-78.1,33.9,-78.6,33.9,-79.1,33.5,-79.2,33.2,-80.3,32.5,-80.9,32,-81.3,31.4,-81.5,30.7,-81.3,30,-81,29.2,-80.5,28.5,-80.5,28,-80.1,26.9,-80.1,26.2,-80.1,25.8,-80.4,25.2,-80.7,25.1,-81.2,25.2,-81.3,25.6,-81.7,25.9,-82.2,26.7,-82.7,27.5,-82.9,27.9,-82.7,28.6,-82.9,29.1,-83.7,29.9,-84.1,30.1,-85.1,29.6,-85.3,29.7,-85.8,30.2,-86.4,30.4,-87.5,30.3,-88.4,30.4,-89.2,30.3,-89.6,30.2,-89.4,29.9,-89.4,29.5,-89.2,29.3,-89.4,29.2,-89.8,29.3,-90.2,29.1,-90.9,29.1,-91.6,29.7,-92.5,29.6,-93.2,29.8,-93.8,29.7,-94.7,29.5,-95.6,28.7,-96.6,28.3,-97.1,27.8,-97.4,27.4,-97.4,26.7,-97.3,26.2,-97.1,25.9,-97.5,25,-97.7,24.3,-97.8,22.9,-97.9,22.4,-97.7,21.9,-97.4,21.4,-97.2,20.6,-96.5,19.9,-96.3,19.3,-95.9,18.8,-94.8,18.6,-94.4,18.1,-93.5,18.4,-92.8,18.5,-92,18.7,-91.4,18.9,-90.8,19.3,-90.5,19.9,-90.5,20.7,-90.3,21,-89.6,21.3,-88.5,21.5,-87.7,21.5,-87.1,21.5,-86.8,21.3,-86.8,20.8,-87.4,20.3,-87.6,19.6,-87.4,19.5,-87.6,19,-87.8,18.3,-88.1,18.5,-88.3,18.5,-88.3,18.4,-88.1,18.3,-88.1,18.1,-88.3,17.6,-88.2,17.5,-88.3,17.1,-88.2,17,-88.4,16.5,-88.6,16.3,-88.7,16.2,-88.9,15.9,-88.6,15.7,-88.5,15.9,-88.2,15.7,-88.1,15.7,-87.9,15.9,-87.6,15.9,-87.5,15.8,-87.4,15.8,-86.9,15.8,-86.4,15.8,-86.1,15.9,-86,16,-85.7,16,-85.4,15.9,-85.2,15.9,-85,16,-84.5,15.9,-84.4,15.8,-84.1,15.6,-83.8,15.4,-83.4,15.3,-83.1,15,-83.2,14.9,-83.3,14.7,-83.2,14.3,-83.4,14,-83.5,13.6,-83.6,13.1,-83.5,12.9,-83.5,12.4,-83.6,12.3,-83.7,11.9,-83.7,11.6,-83.9,11.4,-83.8,11.1,-83.7,10.9,-83.4,10.4,-83,10,-82.5,9.6,-82.2,9.2,-82.2,9,-81.8,9,-81.7,9,-81.4,8.8,-80.9,8.9,-80.5,9.1,-79.9,9.3,-79.6,9.6,-79,9.6,-79.1,9.5,-78.5,9.4,-78.1,9.2,-77.7,8.9,-77.4,8.7,-76.8,8.6,-76.1,9.3,-75.7,9.4,-75.7,9.8,-75.5,10.6,-74.9,11.1,-74.3,11.1,-74.2,11.3,-73.4,11.2,-72.6,11.7,-72.2,12,-71.8,12.4,-71.4,12.4,-71.1,12.1,-71.3,11.8,-71.4,11.5,-71.9,11.4,-71.6,11,-71.6,10.4,-72.1,9.9,-71.7,9.1,-71.3,9.1,-71,9.9,-71.4,10.2,-71.4,11,-70.2,11.4,-70.3,11.8,-69.9,12.2,-69.6,11.5,-68.9,11.4,-68.2,10.9,-68.2,10.6,-67.3,10.5,-66.2,10.6,-65.7,10.2,-64.9,10.1,-64.3,10.4,-64.3,10.6,-63.1,10.7,-61.9,10.7,-62.7,10.4,-62.4,9.9,-61.6,9.9,-60.8,9.4,-60.7,8.6,-60.2,8.6,-59.8,8.4,-59.1,8,-58.5,7.3,-58.5,6.8,-58.1,6.8,-57.5,6.3,-57.1,6,-55.9,5.8,-55.8,6,-55,6,-54,5.8,-53.6,5.6,-52.9,5.4,-51.8,4.6,-51.7,4.2,-51.3,4.2,-51.1,3.6,-50.5,1.9,-50,1.7,-49.9,1,-50.7,0.2,-50.4,-0.1,-48.6,-0.2,-48.6,-1.2,-47.8,-0.6,-46.6,-0.9,-44.9,-1.6,-44.4,-2.1,-44.6,-2.7,-43.4,-2.4,-41.5,-2.9,-40,-2.9,-38.5,-3.7,-37.2,-4.8,-36.5,-5.1,-35.6,-5.1,-35.2,-5.5,-34.9,-6.7,-34.7,-7.3,-35.1,-9,-35.6,-9.6,-37,-11,-37.7,-12.2,-38.4,-13,-38.7,-13.1,-39,-13.8,-38.9,-15.7,-39.2,-17.2,-39.3,-17.9,-39.6,-18.3,-39.8,-19.6,-40.8,-20.9,-40.9,-21.9,-41.8,-22.4,-42,-23,-43.1,-23,-44.6,-23.4,-45.4,-23.8,-46.5,-24.1,-47.6,-24.9,-48.5,-25.9,-48.6,-26.6,-48.5,-27.2,-48.7,-28.2,-48.9,-28.7,-49.6,-29.2,-50.7,-31,-51.6,-31.8,-52.3,-32.2,-52.7,-33.2,-53.4,-33.8,-53.8,-34.4,-54.9,-35,-55.7,-34.8,-56.2,-34.9,-57.1,-34.4,-57.8,-34.5,-58.4,-33.9,-58.5,-34.4,-57.2,-35.3,-57.4,-36,-56.7,-36.4,-56.8,-36.9,-57.7,-38.2,-59.2,-38.7,-61.2,-38.9,-62.3,-38.8,-62.1,-39.4,-62.3,-40.2,-62.1,-40.7,-62.7,-41,-63.8,-41.2,-64.7,-40.8,-65.1,-41.1,-65,-42.1,-64.3,-42.4,-63.8,-42,-63.5,-42.6,-64.4,-42.9,-65.2,-43.5,-65.3,-44.5,-65.6,-45,-66.5,-45,-67.3,-45.6,-67.6,-46.3,-66.6,-47,-65.6,-47.2,-66,-48.1,-67.2,-48.7,-67.8,-49.9,-68.7,-50.3,-69.1,-50.7,-68.8,-51.8,-68.2,-52.4,-68.6,-52.3,-69.5,-52.3,-69.9,-52.5,-70.8,-52.9,-71,-53.8,-71.4,-53.9,-72.6,-53.5,-73.7,-52.8,-74.9,-52.3,-75.3,-51.6,-75,-51,-75.5,-50.4,-75.6,-48.7,-75.2,-47.7,-74.1,-46.9,-75.6,-46.6,-74.7,-45.8,-74.4,-44.1,-73.2,-44.5,-72.7,-42.4,-73.4,-42.1,-73.7,-43.4,-74.3,-43.2,-74,-41.8,-73.7,-39.9,-73.2,-39.3,-73.5,-38.3,-73.6,-37.2,-73.2,-37.1,-72.6,-35.5,-71.9,-33.9,-71.4,-32.4,-71.7,-30.9,-71.4,-30.1,-71.5,-28.9,-70.9,-27.6,-70.7,-25.7,-70.4,-23.6,-70.1,-21.4,-70.2,-19.8,-70.4,-18.3,-71.4,-17.8,-71.5,-17.4,-73.4,-16.4,-75.2,-15.3,-76,-14.6,-76.4,-13.8,-76.3,-13.5,-77.1,-12.2,-78.1,-10.4,-79,-8.4,-79.4,-7.9,-79.8,-7.2,-80.5,-6.5,-81.3,-6.1,-80.9,-5.7,-81.4,-4.7,-81.1,-4,-80.3,-3.4,-79.8,-2.7,-80,-2.2,-80.4,-2.7,-81,-2.2,-80.8,-2,-80.9,-1.1,-80.6,-0.9,-80.4,-0.3,-80,0.4,-80.1,0.8,-79.5,1,-78.9,1.4,-79,1.7,-78.6,1.8,-78.7,2.3,-78.4,2.6,-77.9,2.7,-77.5,3.3,-77.1,3.8,-77.5,4.1,-77.3,4.7,-77.5,5.6,-77.3,5.8,-77.5,6.7,-77.9,7.2,-78.2,7.5,-78.4,8.1,-78.2,8.3,-78.4,8.4,-78.6,8.7,-79.1,9,-79.6,8.9,-79.8,8.6,-80.2,8.3,-80.4,8.3,-80.5,8.1,-80,7.5,-80.3,7.4,-80.4,7.3,-80.9,7.2,-81.1,7.8,-81.2,7.6,-81.5,7.7,-81.7,8.1,-82.1,8.2,-82.4,8.3,-82.8,8.3,-82.8,8.1,-83,8.2,-83.5,8.4,-83.7,8.7,-83.6,8.8,-83.6,9.1,-83.9,9.3,-84.3,9.5,-84.6,9.6,-84.7,9.9,-85,10.1,-84.9,9.8,-85.1,9.6,-85.3,9.8,-85.7,9.9,-85.8,10.1,-85.8,10.4,-85.7,10.8,-85.9,10.9,-85.7,11.1,-86.1,11.4,-86.5,11.8,-86.7,12.1,-87.2,12.5,-87.7,12.9,-87.6,13.1,-87.4,12.9,-87.3,13,-87.5,13.3,-87.8,13.4,-87.9,13.1,-88.5,13.2,-88.8,13.3,-89.3,13.5,-89.8,13.5,-90.1,13.7,-90.6,13.9,-91.2,13.9,-91.7,14.1,-92.2,14.5,-93.4,15.6,-93.9,15.9,-94.7,16.2,-95.3,16.1,-96.1,15.8,-96.6,15.7,-97.3,15.9,-98,16.1,-98.9,16.6,-99.7,16.7,-100.8,17.2,-101.7,17.6,-101.9,17.9,-102.5,18,-103.5,18.3,-103.9,18.7,-105,19.3,-105.5,19.9,-105.7,20.4,-105.4,20.5,-105.5,20.8,-105.3,21.1,-105.3,21.4,-105.6,21.9,-105.7,22.3,-106,22.8,-106.9,23.8,-107.9,24.5,-108.4,25.2,-109.3,25.6,-109.4,25.8,-109.3,26.4,-109.8,26.7,-110.4,27.2,-110.6,27.9,-111.2,27.9,-111.8,28.5,-112.2,29,-112.3,29.3,-112.8,30,-113.2,30.8,-113.1,31.2,-113.9,31.6,-114.2,31.5,-114.8,31.8,-114.9,31.4,-114.8,30.9,-114.7,30.2,-114.3,29.8,-113.6,29.1,-113.4,28.8,-113.3,28.8,-113.1,28.4,-113,28.4,-112.8,27.8,-112.5,27.5,-112.2,27.2,-111.6,26.7,-111.3,25.7,-111,25.3,-110.7,24.8,-110.7,24.3,-110.2,24.3,-109.8,23.8,-109.4,23.4,-109.4,23.2,-109.9,22.8,-110,22.8,-110.3,23.4,-111,24,-111.7,24.5,-112.2,24.7,-112.2,25.5,-112.3,26,-112.8,26.3,-113.5,26.8,-113.6,26.6,-113.8,26.9,-114.5,27.1,-115.1,27.7,-115,27.8,-114.6,27.7,-114.2,28.1,-114.2,28.6,-114.9,29.3,-115.5,29.6,-115.9,30.2,-116.3,30.8,-116.7,31.6,-117.1,32.5,-117.3,33,-117.9,33.6,-118.4,33.7,-118.5,34,-119.1,34.1,-119.4,34.3,-120.4,34.4,-120.6,34.6,-120.7,35.2,-121.7,36.2,-122.5,37.6,-122.5,37.8,-123,38.1,-123.7,39,-123.9,39.8,-124.4,40.3,-124.2,41.1,-124.2,42,-124.5,42.8,-124.1,43.7,-123.9,45.5,-124.1,46.9,-124.4,47.7,-124.7,48.2,-124.6,48.4,-123.1,48,-122.6,47.1,-122.3,47.4,-122.5,48.2,-122.8,49,-123,49,-124.9,50,-125.6,50.4,-127.4,50.8,-128,51.7,-127.8,52.3,-129.1,52.8,-129.3,53.6,-130.5,54.3,-130.5,54.8,-131.1,55.2,-132,55.5,-132.2,56.4,-133.5,57.2,-134.1,58.1,-135,58.2,-136.6,58.2,-137.8,58.5,-139.9,59.5,-140.8,59.7,-142.6,60.1,-144,60,-145.9,60.5,-147.1,60.9,-148.2,60.7,-148,60,-148.6,59.9,-149.7,59.7,-150.6,59.4,-151.7,59.2,-151.9,59.7,-151.4,60.7,-150.3,61,-150.6,61.3,-151.9,60.7,-152.6,60.1,-154,59.4,-153.3,58.9,-154.2,58.1,-155.3,57.7,-156.3,57.4,-156.6,57,-158.1,56.5,-158.4,56,-159.6,55.6,-160.3,55.6,-161.2,55.4,-162.2,55,-163.1,54.7,-164.8,54.4,-164.9,54.6,-163.8,55,-162.9,55.3,-161.8,55.9,-160.6,56,-160.1,56.4,-158.7,57,-158.5,57.2,-157.7,57.6,-157.6,58.3,-157,58.9,-158.2,58.6,-158.5,58.8,-159.1,58.4,-159.7,58.9,-160,58.6,-160.4,59.1,-161.4,58.7,-162,58.7,-162.1,59.3,-161.9,59.6,-162.5,60,-163.8,59.8,-164.7,60.3,-165.3,60.5,-165.4,61.1,-166.1,61.5,-165.7,62.1,-164.9,62.6,-164.6,63.1,-163.8,63.2,-163.1,63.1,-162.3,63.5,-161.5,63.5,-160.8,63.8,-161,64.2,-161.5,64.4,-160.8,64.8,-161.4,64.8,-162.5,64.6,-162.8,64.3,-163.5,64.6,-165,64.4,-166.4,64.7,-166.8,65.1,-168.1,65.7,-166.7,66.1,-164.5,66.6,-163.7,66.6,-163.8,66.1,-161.7,66.1,-162.5,66.7,-163.7,67.1,-164.4,67.6,-165.4,68,-166.8,68.4,-166.2,68.9,-164.4,68.9,-163.2,69.4,-162.9,69.9,-161.9,70.3,-160.9,70.4,-159,70.9,-158.1,70.8,-156.6,71.4,-155.1,71.1,-154.3,70.7,-153.9,70.9,-152.2,70.8,-152.3,70.6,-150.7,70.4,-149.7,70.5,-147.6,70.2,-145.7,70.1,-144.9,70,-143.6,70.2,-142.1,69.9,-141,69.7,-139.1,69.5,-137.5,69,-136.5,68.9,-135.6,69.3,-134.4,69.6,-132.9,69.5,-131.4,69.9,-129.8,70.2,-129.1,69.8,-128.4,70,-128.1,70.5,-127.4,70.4,-125.8,69.5,-124.4,70.2,-124.3,69.4,-123.1,69.6,-122.7,69.9,-121.5,69.8,-119.9,69.4,-117.6,69,-116.2,68.8,-115.2,68.9,-113.9,68.4,-115.3,67.9,-113.5,67.7,-110.8,67.8,-109.9,68,-108.9,67.4,-107.8,67.9,-108.8,68.3,-108.2,68.7,-107,68.7,-106.1,68.8,-105.3,68.6,-104.3,68,-103.2,68.1,-101.5,67.6,-99.9,67.8,-98.4,67.8,-98.6,68.4,-97.7,68.6,-96.1,68.2,-96.1,67.3,-95.5,68.1,-94.7,68.1,-94.2,69.1,-95.3,69.7,-96.5,70.1,-96.4,71.2,-95.2,71.9,-93.9,71.8,-92.9,71.3,-91.5,70.2,-92.4,69.7,-90.5,69.5],[-114.2,73.1,-114.7,72.7,-112.4,73,-111.1,72.5,-109.9,73,-109,72.6,-108.2,71.7,-107.7,72.1,-108.4,73.1,-107.5,73.2,-106.5,73.1,-105.4,72.7,-104.8,71.7,-104.5,71,-102.8,70.5,-101,70,-101.1,69.6,-102.7,69.5,-102.1,69.1,-102.4,68.8,-104.2,68.9,-106,69.2,-107.1,69.1,-109,68.8,-112,68.6,-113.3,68.5,-113.9,69,-115.2,69.3,-116.1,69.2,-117.3,70,-116.7,70.1,-115.1,70.2,-113.7,70.2,-112.4,70.4,-114.3,70.6,-116.5,70.5,-117.9,70.5,-118.4,70.9,-116.1,71.3,-117.7,71.3,-119.4,71.6,-118.6,72.3,-117.9,72.7,-115.2,73.3,-114.2,73.1],[-104.5,73.4,-105.4,72.8,-106.9,73.5,-106.6,73.6,-105.3,73.6,-104.5,73.4],[-76.3,73.1,-76.3,72.8,-77.3,72.9,-78.4,72.9,-79.5,72.7,-79.8,72.8,-80.9,73.3,-80.8,73.7,-80.4,73.8,-78.1,73.7,-76.3,73.1],[-86.6,73.2,-85.8,72.5,-84.9,73.3,-82.3,73.8,-80.6,72.7,-80.8,72.1,-78.8,72.4,-77.8,72.8,-75.6,72.2,-74.2,71.8,-74.1,71.3,-72.2,71.6,-71.2,70.9,-68.8,70.5,-67.9,70.1,-67,69.2,-68.8,68.7,-66.5,68.1,-64.9,67.8,-63.4,66.9,-61.9,66.9,-62.2,66.2,-63.9,65,-65.1,65.4,-66.7,66.4,-68,66.3,-68.1,65.7,-67.1,65.1,-65.7,64.6,-65.3,64.4,-64.7,63.4,-65,62.7,-66.3,62.9,-68.8,63.7,-67.4,62.9,-66.3,62.3,-66.2,61.9,-68.9,62.3,-71,62.9,-72.2,63.4,-71.9,63.7,-73.4,64.2,-74.8,64.7,-74.8,64.4,-77.7,64.2,-78.6,64.6,-77.9,65.3,-76,65.3,-74,65.5,-74.3,65.8,-73.9,66.3,-72.7,67.3,-72.9,67.7,-73.3,68.1,-74.8,68.6,-76.9,68.9,-76.2,69.1,-77.3,69.8,-78.2,69.8,-79,70.2,-79.5,69.9,-81.3,69.7,-84.9,70,-87.1,70.3,-88.7,70.4,-89.5,70.8,-88.5,71.2,-89.9,71.2,-90.2,72.2,-89.4,73.1,-88.4,73.5,-85.8,73.8,-86.6,73.2],[-100.4,73.8,-99.2,73.6,-97.4,73.8,-97.1,73.5,-98.1,73,-96.5,72.6,-96.7,71.7,-98.4,71.3,-99.3,71.4,-100,71.7,-102.5,72.5,-102.5,72.8,-100.4,72.7,-101.5,73.4,-100.4,73.8],[143.6,73.2,142.1,73.2,140,73.3,139.9,73.4,140.8,73.8,142.1,73.9,143.5,73.5,143.6,73.2],[-93.2,72.8,-94.3,72,-95.4,72.1,-96,72.9,-96,73.4,-95.5,73.9,-94.5,74.1,-92.4,74.1,-90.5,73.9,-92,73,-93.2,72.8],[-120.5,71.4,-123.1,70.9,-123.6,71.3,-125.9,71.9,-125.6,72.2,-124.8,73,-123.9,73.7,-124.9,74.3,-121.5,74.4,-120.1,74.2,-117.6,74.2,-116.6,73.9,-115.5,73.5,-116.8,73.2,-119.2,72.5,-120.5,71.8,-120.5,71.4],[150.7,75.1,149.6,74.7,148,74.8,146.1,75.2,146.4,75.5,148.2,75.3,150.7,75.1],[-93.6,75,-94.2,74.6,-95.6,74.7,-96.8,74.9,-96.3,75.4,-94.9,75.6,-94,75.3,-93.6,75],[145.1,75.6,144.3,74.8,140.6,74.8,139,74.6,137,75.3,137.5,75.9,138.8,76.1,141.5,76.1,145.1,75.6],[-98.5,76.7,-97.7,76.3,-97.7,75.7,-98.2,75,-99.8,74.9,-100.9,75.1,-100.9,75.6,-102.5,75.6,-102.6,76.3,-101.5,76.3,-100,76.6,-98.6,76.6,-98.5,76.7],[-108.2,76.2,-107.8,75.8,-106.9,76,-105.9,76,-105.7,75.5,-106.3,75,-109.7,74.9,-112.2,74.4,-113.7,74.4,-113.9,74.7,-111.8,75.2,-116.3,75,-117.7,75.2,-116.3,76.2,-115.4,76.5,-112.6,76.1,-110.8,75.5,-109.1,75.5,-110.5,76.4,-109.6,76.8,-108.6,76.7,-108.2,76.2],[57.5,70.7,56.9,70.6,53.7,70.8,53.4,71.2,51.6,71.5,51.5,72,52.5,72.2,52.4,72.8,54.4,73.6,53.5,73.8,55.9,74.6,55.6,75.1,57.9,75.6,61.2,76.3,64.5,76.4,66.2,76.8,68.2,76.9,68.9,76.5,68.2,76.2,64.6,75.7,61.6,75.3,58.5,74.3,57,73.3,55.4,72.4,55.6,71.5,57.5,70.7],[-94.7,77.1,-93.6,76.8,-91.6,76.8,-90.7,76.5,-91,76.1,-89.8,75.8,-89.2,75.6,-87.8,75.6,-86.4,75.5,-84.8,75.7,-82.8,75.8,-81.1,75.7,-80.1,75.3,-79.8,74.9,-80.5,74.7,-81.9,74.4,-83.2,74.6,-86.1,74.4,-88.1,74.4,-89.8,74.5,-92.4,74.8,-92.8,75.4,-92.9,75.9,-93.9,76.3,-96,76.4,-97.1,76.8,-96.7,77.2,-94.7,77.1],[-116.2,77.6,-116.3,76.9,-117.1,76.5,-118,76.5,-119.9,76.1,-121.5,75.9,-122.9,76.1,-121.2,76.9,-119.1,77.5,-117.6,77.5,-116.2,77.6],[-93.8,77.5,-94.3,77.5,-96.2,77.6,-96.4,77.8,-94.4,77.8,-93.7,77.6,-93.8,77.5],[-110.2,77.7,-112.1,77.4,-113.5,77.7,-112.7,78.1,-111.3,78.2,-109.9,78,-110.2,77.7],[24.7,77.9,22.5,77.4,20.7,77.7,21.4,77.9,20.8,78.3,22.9,78.5,23.3,78.1,24.7,77.9],[-109.7,78.6,-110.9,78.4,-112.5,78.4,-112.5,78.6,-111.5,78.9,-111,78.8,-109.7,78.6],[-95.8,78.1,-97.3,77.8,-98.1,78.1,-98.6,78.5,-98.6,78.9,-97.3,78.8,-96.8,78.8,-95.6,78.4,-95.8,78.1],[-100.1,78.3,-99.7,77.9,-101.3,78,-102.9,78.3,-105.2,78.4,-104.2,78.7,-105.4,78.9,-105.5,79.3,-103.5,79.2,-100.8,78.8,-100.1,78.3],[105.1,78.3,99.4,77.9,101.3,79.2,102.1,79.3,102.8,79.3,105.4,78.7,105.1,78.3],[18.3,79.7,21.5,79,19,78.6,18.5,77.8,17.6,77.6,17.1,76.8,15.9,76.8,13.8,77.4,14.7,77.7,13.2,78,11.2,78.9,10.4,79.7,13.2,80,13.7,79.7,15.1,79.7,15.5,80,17,80.1,18.3,79.7],[25.4,80.4,27.4,80.1,25.9,79.5,23,79.4,20.1,79.6,19.9,79.8,18.5,79.9,17.4,80.3,20.5,80.6,21.9,80.4,22.9,80.7,25.4,80.4],[51.1,80.5,49.8,80.4,48.9,80.3,48.8,80.2,47.6,80,46.5,80.2,47.1,80.6,44.8,80.6,46.8,80.8,48.3,80.8,48.5,80.5,49.1,80.8,50,80.9,51.5,80.7,51.1,80.5],[99.9,78.9,97.8,78.8,95,79,93.3,79.4,92.5,80.1,91.2,80.3,93.8,81,95.9,81.3,97.9,80.7,100.2,79.8,99.9,78.9],[-87,79.7,-85.8,79.3,-87.2,79,-89,78.3,-90.8,78.2,-92.9,78.3,-94,78.8,-93.9,79.1,-93.1,79.4,-95,79.4,-96.1,79.7,-96.7,80.2,-96,80.6,-95.3,80.9,-94.3,81,-94.7,81.2,-92.4,81.3,-91.1,80.7,-89.4,80.5,-87.8,80.3,-87,79.7],[-68.5,83.1,-65.8,83,-63.7,82.9,-61.9,82.6,-61.9,82.4,-64.3,81.9,-66.8,81.7,-67.7,81.5,-65.5,81.5,-67.8,80.9,-69.5,80.6,-71.2,79.8,-73.2,79.6,-73.9,79.4,-76.9,79.3,-75.5,79.2,-76.2,79,-75.4,78.5,-76.3,78.2,-77.9,77.9,-78.4,77.5,-79.8,77.2,-79.6,77,-77.9,77,-77.9,76.8,-80.6,76.2,-83.2,76.5,-86.1,76.3,-87.6,76.4,-89.5,76.5,-89.6,77,-87.8,77.2,-88.3,77.9,-87.6,78,-85,77.5,-86.3,78.2,-88,78.4,-87.2,78.8,-85.4,79,-85.1,79.3,-86.5,79.7,-86.9,80.3,-84.2,80.2,-83.4,80.1,-81.8,80.5,-84.1,80.6,-87.6,80.5,-89.4,80.9,-90.2,81.3,-91.4,81.6,-91.6,81.9,-90.1,82.1,-88.9,82.1,-87,82.3,-85.5,82.7,-84.3,82.6,-83.2,82.3,-82.4,82.9,-81.1,83,-79.3,83.1,-76.3,83.2,-75.7,83.1,-72.8,83.2,-70.7,83.2,-68.5,83.1],[-27.1,83.5,-20.8,82.7,-22.7,82.3,-26.5,82.3,-31.9,82.2,-31.4,82,-27.9,82.1,-24.8,81.8,-22.9,82.1,-22.1,81.7,-23.2,81.2,-20.6,81.5,-15.8,81.9,-12.8,81.7,-12.2,81.3,-16.3,80.6,-16.8,80.3,-20,80.2,-17.7,80.1,-18.9,79.4,-19.7,78.8,-19.7,77.6,-18.5,77,-20,76.9,-21.7,76.6,-19.8,76.1,-19.6,75.2,-20.7,75.2,-19.4,74.3,-21.6,74.2,-20.4,73.8,-20.8,73.5,-22.2,73.3,-23.6,73.3,-22.3,72.6,-22.3,72.2,-24.3,72.6,-24.8,72.3,-23.4,72.1,-22.1,71.5,-21.8,70.7,-23.5,70.5,-24.3,70.9,-25.5,71.4,-25.2,70.8,-26.4,70.2,-23.7,70.2,-22.3,70.1,-25,69.3,-27.7,68.5,-30.7,68.1,-31.8,68.1,-32.8,67.7,-34.2,66.7,-36.4,66,-37,65.9,-38.4,65.7,-39.8,65.5,-40.7,64.8,-40.7,64.1,-41.2,63.5,-42.8,62.7,-42.4,61.9,-42.9,61.1,-43.4,60.1,-44.8,60,-46.3,60.9,-48.3,60.9,-49.2,61.4,-49.9,62.4,-51.6,63.6,-52.1,64.3,-52.3,65.2,-53.7,66.1,-53.3,66.8,-54,67.2,-53,68.4,-51.5,68.7,-51.1,69.1,-50.9,69.9,-52,69.6,-52.6,69.4,-53.5,69.3,-54.7,69.6,-54.8,70.3,-54.4,70.8,-53.4,70.8,-51.4,70.6,-53.1,71.2,-54,71.5,-55,71.4,-55.8,71.7,-54.7,72.6,-55.3,73,-56.1,73.7,-57.3,74.7,-58.6,75.1,-58.6,75.5,-61.3,76.1,-63.4,76.2,-66.1,76.1,-68.5,76.1,-69.7,76.4,-71.4,77,-68.8,77.3,-66.8,77.4,-71,77.6,-73.3,78,-73.2,78.4,-69.4,78.9,-65.7,79.4,-65.3,79.8,-68,80.1,-67.1,80.5,-63.7,81.2,-62.2,81.3,-62.6,81.8,-60.3,82,-57.2,82.2,-54.1,82.2,-53,81.9,-50.4,82.4,-48,82.1,-46.6,82,-44.5,81.7,-46.9,82.2,-46.8,82.6,-43.4,83.2,-39.9,83.2,-38.6,83.5,-35.1,83.6,-27.1,83.5]];

const CSS = `
/* =========================================================
   DAWA — Precious Metals Distribution
   ========================================================= */

:root {
  --navy-950: #061738;
  --navy-900: #0b2a63;
  --navy-800: #123a80;
  --navy-700: #1a4ea3;
  --blue-500: #2f7fe0;
  --gold-50: #fff8e1;
  --gold-100: #fbeac0;
  --gold-300: #f2cf7c;
  --gold-400: #e6b54f;
  --gold-500: #d29a32;
  --gold-700: #9b6516;
  --cream: #fbf6ea;
  --ink: #0e1a2f;
  --ink-soft: #46546a;
  --white: #ffffff;
  --gold-grad: linear-gradient(135deg, #fff1b8 0%, #f0c665 30%, #d29a32 60%, #f6dc8f 85%, #b27a22 100%);
  --radius: 18px;
  --shadow: 0 20px 50px -20px rgba(6, 23, 56, .35);
  --nav-h: 72px;
  --font-display: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }

html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }

body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--ink);
  background: var(--white);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

img, svg, canvas { display: block; }
a { color: inherit; }
h1, h2, h3 { font-family: var(--font-display); line-height: 1.1; margin: 0 0 .5em; letter-spacing: -.01em; }
h2 { font-size: clamp(2rem, 4vw, 3rem); }
h3 { font-size: 1.35rem; }
p { margin: 0 0 1em; }

.skip-link {
  position: absolute; left: 1rem; top: -100px; z-index: 100;
  background: var(--gold-400); color: var(--ink); padding: .6rem 1rem; border-radius: 8px;
}
.skip-link:focus { top: 1rem; }

.container { width: min(1200px, 100% - 2.5rem); margin-inline: auto; }

.gold-text {
  background: var(--gold-grad);
  background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
  animation: goldShift 6s ease-in-out infinite alternate;
}
@keyframes goldShift { to { background-position: 100% 0; } }

/* ---------- Buttons ---------- */
.btn {
  --pad: .95rem 1.6rem;
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: var(--pad);
  border-radius: 999px; border: 0;
  font: 600 1rem/1 var(--font-body);
  text-decoration: none; cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;
  white-space: nowrap;
}
.btn svg { width: 18px; height: 18px; }
.btn:hover { transform: translateY(-2px); }
.btn:focus-visible { outline: 3px solid var(--gold-300); outline-offset: 3px; }
.btn--sm { --pad: .65rem 1.1rem; font-size: .9rem; }
.btn--block { width: 100%; }
.btn--gold {
  color: #3b2603;
  background: var(--gold-grad); background-size: 200% 100%;
  box-shadow: 0 10px 30px -10px rgba(210, 154, 50, .8), inset 0 1px 0 rgba(255, 255, 255, .6);
  position: relative; overflow: hidden;
}
.btn--gold::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.65) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: shine 4.5s ease-in-out infinite;
}
@keyframes shine { 0%, 60% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }
.btn--glass {
  color: var(--white);
  background: rgba(255, 255, 255, .14);
  border: 1px solid rgba(255, 255, 255, .45);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
}
.btn--ghost {
  color: var(--white);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, .45);
}

/* ---------- Navigation ---------- */
.nav {
  position: fixed; inset: 0 0 auto; z-index: 50;
  height: var(--nav-h);
  padding: env(safe-area-inset-top) max(1.25rem, env(safe-area-inset-right)) 0 max(1.25rem, env(safe-area-inset-left));
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  color: var(--white);
  transition: background-color .3s ease, box-shadow .3s ease, height .3s ease;
}
.nav.is-scrolled {
  background: rgba(8, 30, 72, .82);
  -webkit-backdrop-filter: blur(14px) saturate(140%); backdrop-filter: blur(14px) saturate(140%);
  box-shadow: 0 8px 30px -12px rgba(0, 0, 0, .4);
}
.brand { display: inline-flex; align-items: center; gap: .65rem; text-decoration: none; }
.brand { flex-direction: column; align-items: flex-start; gap: .3rem; }
.brand picture { display: block; }
.brand__logo {
  height: 34px; width: auto;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, .35));
}
.brand__tagline {
  font: 600 .58rem/1 var(--font-body); letter-spacing: .32em; text-transform: uppercase;
  color: var(--gold-100); opacity: .85;
  padding-left: .1rem;
}
.nav__links { display: flex; gap: 1.75rem; }
.nav__links a {
  text-decoration: none; font-weight: 500; font-size: .95rem; opacity: .9;
  position: relative; padding: .25rem 0;
}
.nav__links a::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -2px; height: 2px;
  background: var(--gold-400); transform: scaleX(0); transform-origin: left; transition: transform .25s ease;
}
.nav__links a:hover::after, .nav__links a:focus-visible::after { transform: scaleX(1); }
.nav__actions { display: flex; align-items: center; gap: .6rem; }
.nav__toggle {
  display: none; width: 44px; height: 44px; border: 0; background: transparent; cursor: pointer;
  flex-direction: column; justify-content: center; align-items: center; gap: 5px; padding: 0;
}
.nav__toggle span { width: 22px; height: 2px; background: currentColor; border-radius: 2px; transition: transform .3s, opacity .3s; color: var(--white); }
.nav__toggle[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav__toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
.nav__toggle[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

@media (max-width: 1100px) {
  .nav__toggle { display: inline-flex; }
  .nav__cta { display: none; }
  .nav__links {
    position: fixed; inset: var(--nav-h) 0 auto; flex-direction: column; gap: 0;
    background: rgba(8, 30, 72, .96);
    -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
    padding: .5rem 1.25rem 1.25rem;
    transform: translateY(-12px); opacity: 0; visibility: hidden;
    transition: transform .3s ease, opacity .3s ease, visibility .3s;
  }
  .nav__links.is-open { transform: none; opacity: 1; visibility: visible; }
  .nav__links a { padding: .9rem 0; border-bottom: 1px solid rgba(255,255,255,.1); font-size: 1.05rem; }
  .nav__links a::after { display: none; }
}
@media (max-width: 420px) {
  .brand__tagline { display: none; }
  .brand__logo { height: 26px; }
  .nav [data-install] { padding: .6rem .8rem; }
}

/* =========================================================
   HERO SCENE
   ========================================================= */
.hero {
  position: relative;
  height: 100vh; height: 100svh;
  min-height: 640px;
  overflow: hidden;
  color: var(--white);
  isolation: isolate;
  background: var(--navy-900);
}
@media (orientation: portrait) {
  .hero { min-height: 700px; max-height: 1400px; }
}

.scene {
  position: absolute; inset: 0;
  --sun-x: 60%; --sun-y: 45%;
  --globe-x: 60%; --globe-y: 48%; --globe-d: 420px;
  --horizon: 78%;
}
.scene > * { position: absolute; }

.sky {
  inset: 0;
  background:
    radial-gradient(120% 60% at var(--sun-x) calc(var(--horizon) - 5%), rgba(255, 244, 214, .95) 0%, rgba(255, 226, 160, .75) 18%, rgba(255, 210, 140, 0) 45%),
    linear-gradient(180deg, #072359 0%, #0d3d8b 22%, #1a63bf 42%, #4e97da 56%, #b9d4e8 68%, #f7dfa6 80%, #fff1d0 100%);
}

/* ---- Sun & rays ---- */
.sun {
  left: var(--sun-x); top: var(--sun-y);
  width: 0; height: 0;
}
.sun__rays {
  position: absolute; left: 50%; top: 50%;
  width: 150vmax; height: 150vmax;
  margin: -75vmax 0 0 -75vmax;
  border-radius: 50%;
  will-change: transform, opacity;
  -webkit-mask-image: radial-gradient(circle closest-side, #000 0%, rgba(0,0,0,.85) 14%, rgba(0,0,0,.35) 40%, transparent 82%);
  mask-image: radial-gradient(circle closest-side, #000 0%, rgba(0,0,0,.85) 14%, rgba(0,0,0,.35) 40%, transparent 82%);
}
.sun__rays--a {
  background: repeating-conic-gradient(from 0deg,
    rgba(255, 252, 235, 0) 0deg 4deg,
    rgba(255, 252, 235, .55) 5deg,
    rgba(255, 252, 235, 0) 6.5deg 11deg,
    rgba(255, 245, 210, .3) 12deg,
    rgba(255, 245, 210, 0) 13deg 17deg);
  animation: raySpin 140s linear infinite, rayPulse 6s ease-in-out infinite;
}
.sun__rays--b {
  background: repeating-conic-gradient(from 7deg,
    rgba(255, 255, 255, 0) 0deg 7deg,
    rgba(255, 255, 255, .45) 8deg,
    rgba(255, 255, 255, 0) 9deg 23deg);
  animation: raySpin 200s linear infinite reverse, rayPulse 4.2s ease-in-out -2s infinite;
}
.sun__rays--c {
  background: repeating-conic-gradient(from 3deg,
    rgba(255, 236, 180, 0) 0deg 2deg,
    rgba(255, 236, 180, .35) 2.6deg,
    rgba(255, 236, 180, 0) 3.4deg 9deg);
  -webkit-mask-image: radial-gradient(circle closest-side, #000 0%, rgba(0,0,0,.6) 10%, transparent 40%);
  mask-image: radial-gradient(circle closest-side, #000 0%, rgba(0,0,0,.6) 10%, transparent 40%);
  animation: raySpin 90s linear infinite, rayPulse 3s ease-in-out -1s infinite;
}
@keyframes raySpin { to { transform: rotate(360deg); } }
@keyframes rayPulse { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }

.sun__core {
  position: absolute; left: 50%; top: 50%;
  width: calc(var(--globe-d) * 1.9); height: calc(var(--globe-d) * 1.9);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,250,1) 0%, rgba(255,246,214,.9) 14%, rgba(255,226,150,.45) 34%, rgba(255,214,130,0) 62%);
  animation: corePulse 5s ease-in-out infinite;
}
@keyframes corePulse { 0%, 100% { transform: translate(-50%, -50%) scale(.94); opacity: .85; } 50% { transform: translate(-50%, -50%) scale(1.06); opacity: 1; } }

.sparkles { inset: 0; pointer-events: none; }
.sparkle {
  position: absolute; width: var(--s, 16px); height: var(--s, 16px);
  margin: calc(var(--s, 16px) / -2) 0 0 calc(var(--s, 16px) / -2);
  background:
    radial-gradient(circle, #fff 0 12%, transparent 30%),
    linear-gradient(90deg, transparent 47%, #fff 50%, transparent 53%),
    linear-gradient(0deg, transparent 47%, #fff 50%, transparent 53%);
  -webkit-mask-image: radial-gradient(circle, #000 20%, transparent 70%);
  mask-image: radial-gradient(circle, #000 20%, transparent 70%);
  opacity: 0;
  animation: twinkle var(--d, 4s) ease-in-out var(--delay, 0s) infinite;
}
@keyframes twinkle {
  0%, 100% { opacity: 0; transform: scale(.3) rotate(0deg); }
  50% { opacity: var(--o, 1); transform: scale(1) rotate(45deg); }
}

/* ---- Skyline ---- */
.skyline {
  left: 0; width: 100%;
  bottom: calc(100% - var(--horizon));
  height: calc(var(--globe-d) * .62 + 6vh);
  overflow: visible;
}
.skyline .win { animation: winGlint 7s ease-in-out infinite; }
@keyframes winGlint { 0%, 100% { opacity: .15; } 50% { opacity: .65; } }

/* ---- Globe ---- */
.globe {
  left: var(--globe-x); top: var(--globe-y);
  width: var(--globe-d); height: var(--globe-d);
  transform: translate(-50%, -50%);
}
.globe__canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.globe__halo {
  position: absolute; inset: -14%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0) 52%, rgba(255, 250, 225, .75) 60%, rgba(255, 238, 190, .25) 66%, rgba(255, 230, 170, 0) 72%);
  animation: haloPulse 4s ease-in-out infinite;
}
@keyframes haloPulse { 0%, 100% { opacity: .7; transform: scale(.98); } 50% { opacity: 1; transform: scale(1.02); } }
.globe__gloss {
  position: absolute; inset: 0; border-radius: 50%;
  background:
    radial-gradient(60% 45% at 38% 26%, rgba(255,255,255,.38) 0%, rgba(255,255,255,0) 60%),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 64%, rgba(255,255,255,.3) 70%, rgba(255,255,255,0) 71%);
  mix-blend-mode: screen;
  pointer-events: none;
}
.globe__ring {
  position: absolute; left: -12%; top: -12%; width: 124%; height: 124%;
  overflow: visible;
}
.globe__ring-path {
  stroke-dasharray: 220 440;
  animation: ringRun 7s linear infinite;
  filter: drop-shadow(0 0 3px rgba(255,255,255,.9));
}
.globe__ring-path--2 { stroke-dasharray: 120 520; animation-duration: 11s; animation-direction: reverse; opacity: .7; }
@keyframes ringRun { to { stroke-dashoffset: -660; } }

/* ---- Plane ---- */
.plane {
  left: 0; top: 0;
  width: clamp(130px, 17vw, 300px);
  transform-origin: 50% 50%;
  will-change: transform;
}
.plane__svg { width: 100%; height: auto; overflow: visible; filter: drop-shadow(0 6px 10px rgba(10, 40, 90, .25)); }
.plane__trail {
  position: absolute; right: 70%; top: 38%;
  width: 260%; height: 7%;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55) 70%, rgba(255,255,255,.85));
  border-radius: 999px;
  filter: blur(2px);
  transform-origin: right center;
}
.plane__trail::after {
  content: ""; position: absolute; left: 25%; right: -15%; top: 330%; height: 80%;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.45));
  border-radius: 999px;
}
.plane__strobe { animation: strobe 1.4s steps(1) infinite; }
.plane__strobe--w { animation-delay: .7s; }
@keyframes strobe { 0% { opacity: 1; } 12% { opacity: 0; } 100% { opacity: 0; } }

/* ---- Sea ---- */
.sea { left: 0; top: 0; width: 100%; height: 100%; pointer-events: none; }

/* ---- Ship ---- */
.ship {
  left: 0; top: 0;
  width: 600px;
  transform-origin: 50% 88%;
  will-change: transform;
}
.ship__svg { width: 100%; height: auto; overflow: visible; filter: drop-shadow(0 12px 16px rgba(6, 30, 70, .25)); }
.ship__light { animation: strobe 2s steps(1) infinite; }

.hero__scrim {
  inset: 0; pointer-events: none;
  background:
    radial-gradient(70% 75% at 12% 42%, rgba(6, 28, 74, .72) 0%, rgba(6, 28, 74, .45) 45%, rgba(6, 28, 74, 0) 75%);
}
@media (orientation: portrait), (max-width: 760px) {
  .hero__scrim { background: linear-gradient(180deg, rgba(6, 28, 74, .35) 0%, rgba(6, 28, 74, 0) 45%); }
}
.hero__vignette {
  inset: 0; pointer-events: none;
  background:
    linear-gradient(180deg, rgba(5, 20, 55, .55) 0%, rgba(5, 20, 55, 0) 22%),
    linear-gradient(0deg, rgba(255, 255, 255, .55) 0%, rgba(255, 255, 255, 0) 12%);
}

/* ---- Hero content ---- */
.hero__content {
  position: absolute; z-index: 2;
  left: max(6vw, 1.25rem);
  top: calc(var(--nav-h) + 7vh);
  width: min(640px, 46vw);
  text-shadow: 0 2px 18px rgba(4, 22, 64, .45);
}
.eyebrow {
  display: inline-flex; align-items: center; gap: .6rem;
  margin: 0 0 1.25rem;
  padding: .45rem .9rem;
  border-radius: 999px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.28);
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  font-size: .78rem; font-weight: 600; letter-spacing: .18em; text-transform: uppercase;
  text-shadow: none;
}
.eyebrow__dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--gold-400);
  box-shadow: 0 0 0 0 rgba(230, 181, 79, .8);
  animation: ping 2s ease-out infinite;
}
@keyframes ping { to { box-shadow: 0 0 0 10px rgba(230, 181, 79, 0); } }
.hero__title {
  font-size: clamp(2.4rem, 5.2vw, 4.8rem);
  font-weight: 700;
  margin-bottom: 1.25rem;
}
.hero__title .gold-text { filter: drop-shadow(0 2px 2px rgba(4, 22, 64, .55)) drop-shadow(0 4px 16px rgba(4, 22, 64, .45)); text-shadow: none; }
.hero__lead { font-size: clamp(1rem, 1.25vw, 1.15rem); opacity: .95; max-width: 36em; margin-bottom: 2rem; }
.hero__ctas { display: flex; flex-wrap: wrap; gap: .8rem; }

.hero__content > * { opacity: 0; transform: translateY(18px); animation: rise .9s cubic-bezier(.2,.7,.2,1) forwards; }
.hero__content > :nth-child(2) { animation-delay: .12s; }
.hero__content > :nth-child(3) { animation-delay: .24s; }
.hero__content > :nth-child(4) { animation-delay: .36s; }
@keyframes rise { to { opacity: 1; transform: none; } }

.hero__scroll {
  position: absolute; z-index: 2; left: 50%; bottom: max(1.25rem, env(safe-area-inset-bottom));
  width: 28px; height: 44px; margin-left: -14px;
  border: 2px solid rgba(14, 50, 110, .55); border-radius: 999px;
}
.hero__scroll span {
  position: absolute; left: 50%; top: 8px; width: 4px; height: 8px; margin-left: -2px;
  border-radius: 2px; background: rgba(14, 50, 110, .75);
  animation: scrollDot 1.8s ease-in-out infinite;
}
@keyframes scrollDot { 0% { transform: translateY(0); opacity: 1; } 70% { transform: translateY(14px); opacity: 0; } 100% { opacity: 0; } }

/* Portrait (phones / tablets): text on top, globe below — like the source artwork */
@media (orientation: portrait), (max-width: 760px) {
  .hero__content {
    left: 0; right: 0; width: auto;
    top: calc(var(--nav-h) + env(safe-area-inset-top) + 2vh);
    padding-inline: 1.25rem;
    text-align: center;
    margin-inline: auto;
    max-width: 640px;
  }
  .hero__title { font-size: clamp(2.2rem, 8.4vw, 4rem); margin-bottom: .9rem; }
  .hero__lead { margin-inline: auto; margin-bottom: 1.4rem; font-size: clamp(.95rem, 2.4vw, 1.1rem); }
  .hero__ctas { justify-content: center; }
  .eyebrow { margin-bottom: .9rem; }
}
@media (max-width: 380px), (max-height: 720px) and (orientation: portrait) {
  .hero__lead { display: none; }
}
@media (max-height: 560px) and (orientation: landscape) {
  .hero__lead { display: none; }
  .hero__content { top: calc(var(--nav-h) + 2vh); }
}

/* Reduced motion: freeze CSS loops (JS renders a still frame) */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  .sparkle { opacity: .8; }
}

/* =========================================================
   CONTENT SECTIONS
   ========================================================= */
.marquee {
  overflow: hidden;
  background: var(--navy-950);
  color: var(--gold-300);
  border-block: 1px solid rgba(230, 181, 79, .3);
}
.marquee__track {
  display: flex; width: max-content;
  animation: marquee 40s linear infinite;
}
.marquee__track span {
  padding: 1rem 2rem;
  font: 600 .85rem/1 var(--font-body); letter-spacing: .3em; text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 2rem;
}
.marquee__track span::after { content: "◆"; font-size: .55rem; color: var(--gold-500); }
@keyframes marquee { to { transform: translateX(-50%); } }

.section { padding: clamp(4rem, 9vw, 7.5rem) 0; position: relative; }
.section--navy {
  background:
    radial-gradient(80% 60% at 85% 0%, rgba(47, 127, 224, .35), transparent 60%),
    radial-gradient(60% 50% at 0% 100%, rgba(210, 154, 50, .18), transparent 60%),
    var(--navy-900);
  color: var(--white);
}
.section--cream { background: var(--cream); }
.section__head { max-width: 680px; margin: 0 auto 3rem; text-align: center; }
.section__head p { color: var(--ink-soft); font-size: 1.08rem; }
.section--navy .section__head p { color: rgba(255,255,255,.78); }
.section__head--left { text-align: left; margin: 0; }
.kicker {
  font: 700 .78rem/1 var(--font-body) !important; letter-spacing: .28em; text-transform: uppercase;
  color: var(--gold-500) !important; margin-bottom: 1rem;
}
.section--navy .kicker { color: var(--gold-300) !important; }

.stats { padding: 3.5rem 0; background: linear-gradient(180deg, #fff 0%, var(--cream) 100%); }
.stats__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
.stat { text-align: center; padding: 1rem; }
.stat strong {
  display: block; font: 700 clamp(2.2rem, 4vw, 3.2rem)/1 var(--font-display);
  background: var(--gold-grad); -webkit-background-clip: text; background-clip: text; color: transparent;
  margin-bottom: .5rem;
}
.stat span { color: var(--ink-soft); font-size: .95rem; }

.cards { display: grid; gap: 1.5rem; }
.cards--2 { grid-template-columns: repeat(2, 1fr); }

/* ---- Divisions ---- */
.divisions { display: grid; grid-template-columns: 1fr 1fr; gap: 1.75rem; }
.division {
  display: flex; flex-direction: column;
  border-radius: calc(var(--radius) + 6px);
  overflow: hidden;
  background: var(--white);
  box-shadow: var(--shadow);
  border: 1px solid rgba(14, 26, 47, .06);
  transition: transform .35s ease, box-shadow .35s ease;
}
.division:hover { transform: translateY(-6px); box-shadow: 0 34px 70px -28px rgba(6, 23, 56, .5); }
.division__visual {
  position: relative; height: 220px;
  display: grid; place-items: center;
  overflow: hidden;
}
.division--metals .division__visual {
  background: radial-gradient(80% 90% at 50% 100%, #1f5fb8 0%, #0b2a63 70%);
}
.division--accessories .division__visual {
  background: radial-gradient(80% 90% at 50% 100%, #4a3415 0%, #140d06 75%);
}
.division__visual::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,.22) 50%, transparent 65%);
  transform: translateX(-120%);
  transition: transform 1s ease;
}
.division:hover .division__visual::after { transform: translateX(120%); }
.division__body { padding: 1.75rem 1.75rem 2rem; }
.division__tag { font: 700 .75rem/1 var(--font-body); letter-spacing: .24em; text-transform: uppercase; color: var(--gold-500); margin-bottom: .75rem; }
.division h3 { font-size: 1.8rem; }
.division p { color: var(--ink-soft); }

.bars { display: grid; grid-template-columns: repeat(4, 1fr); gap: .7rem; width: min(84%, 360px); }
.bar {
  display: grid; place-items: center; height: 58px;
  background: linear-gradient(160deg, var(--m1) 0%, var(--m2) 45%, var(--m3) 100%);
  clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
  font: 700 1.15rem/1 var(--font-display); color: rgba(0,0,0,.3);
  animation: float 6s ease-in-out infinite;
}
.bar:nth-child(2) { animation-delay: -1.5s; }
.bar:nth-child(3) { animation-delay: -3s; }
.bar:nth-child(4) { animation-delay: -4.5s; }

.accessories { width: min(90%, 352px); height: auto; overflow: visible; filter: drop-shadow(0 18px 22px rgba(0, 0, 0, .55)); }
.acc { transform-box: fill-box; transform-origin: 50% 100%; animation: accFloat 6s ease-in-out infinite; }
.acc--chalice { animation-delay: -2s; }
.acc--papers { animation-delay: -4s; }
@keyframes accFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.acc-steam path { opacity: 0; animation: steam 3.6s ease-out infinite; }
.acc-steam path:nth-child(2) { animation-delay: -1.2s; }
.acc-steam path:nth-child(3) { animation-delay: -2.4s; }
@keyframes steam { 0% { opacity: 0; transform: translateY(6px); } 30% { opacity: .7; } 100% { opacity: 0; transform: translateY(-14px); } }
.acc-leaf { animation: leafGlint 4s ease-in-out infinite; }
@keyframes leafGlint { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.18); } }
.acc-spark { transform-box: fill-box; transform-origin: center; animation: twinkle 3.2s ease-in-out infinite; }
.acc-spark:nth-child(2) { animation-delay: -1.1s; }
.acc-spark:nth-child(3) { animation-delay: -2.2s; }

.chips { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: .45rem; }
.chips li { font-size: .82rem; font-weight: 600; padding: .35rem .75rem; border-radius: 999px; background: var(--gold-50); color: var(--gold-700); }

/* ---- Partner events ---- */
.events {
  color: var(--white);
  background:
    radial-gradient(60% 60% at 15% 10%, rgba(230, 181, 79, .22), transparent 60%),
    radial-gradient(50% 60% at 90% 90%, rgba(122, 74, 34, .45), transparent 60%),
    linear-gradient(180deg, #1a1208 0%, #24180c 100%);
  overflow: hidden;
}
.events .section__head p { color: rgba(255,255,255,.75); }
.events .kicker { color: var(--gold-300) !important; }
.cards--3 { grid-template-columns: repeat(3, 1fr); }
.event {
  position: relative;
  padding: 2rem 1.75rem;
  border-radius: var(--radius);
  background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02));
  border: 1px solid rgba(242, 207, 124, .22);
  transition: transform .3s ease, border-color .3s ease;
}
.event:hover { transform: translateY(-6px); border-color: rgba(242, 207, 124, .6); }
.event__icon {
  width: 56px; height: 56px; border-radius: 50%; margin-bottom: 1.25rem;
  display: grid; place-items: center;
  color: #3b2603; background: var(--gold-grad);
  box-shadow: 0 10px 30px -8px rgba(230, 181, 79, .6);
}
.event__icon svg { width: 26px; height: 26px; }
.event p { color: rgba(255,255,255,.72); margin: 0; }
/* ---- DAWA Wine ---- */
.wine {
  position: relative;
  margin-top: 3rem;
  display: grid; grid-template-columns: .9fr 1.1fr; align-items: center; gap: clamp(1.5rem, 4vw, 4rem);
  padding: clamp(1.75rem, 4vw, 3.5rem);
  border-radius: calc(var(--radius) + 8px);
  overflow: hidden;
  background:
    radial-gradient(70% 90% at 20% 60%, rgba(155, 28, 42, .55), transparent 65%),
    radial-gradient(50% 60% at 100% 0%, rgba(230, 181, 79, .18), transparent 60%),
    linear-gradient(135deg, #2a070c 0%, #160406 100%);
  border: 1px solid rgba(242, 207, 124, .3);
  box-shadow: 0 40px 80px -40px rgba(0, 0, 0, .8);
}
.wine::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(115deg, rgba(242, 207, 124, .04) 0 2px, transparent 2px 14px);
}
.wine__visual { position: relative; height: 380px; display: flex; align-items: flex-end; justify-content: center; gap: .5rem; }
.wine__glow {
  position: absolute; left: 50%; top: 50%; width: 320px; height: 320px; transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(242, 180, 110, .45) 0%, rgba(155, 28, 42, .25) 40%, transparent 70%);
  animation: corePulse 5s ease-in-out infinite;
}
.wine__bottle { position: relative; height: 100%; width: auto; filter: drop-shadow(0 30px 30px rgba(0, 0, 0, .6)); animation: bottleFloat 7s ease-in-out infinite; }
.wine__glass { position: relative; height: 46%; width: auto; margin-bottom: 4px; filter: drop-shadow(0 10px 14px rgba(0,0,0,.5)); }
.wine__sheen { animation: sheen 6s ease-in-out infinite; }
.wine__liquid { animation: swirl 5s ease-in-out infinite; transform-origin: 50% 50%; }
@keyframes bottleFloat { 0%, 100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
@keyframes sheen { 0%, 40% { transform: translateX(0); } 100% { transform: translateX(260px); } }
@keyframes swirl { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-2px) rotate(3deg); } }

.wine__body { position: relative; }
.wine__title {
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  background: var(--gold-grad); background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: goldShift 6s ease-in-out infinite alternate;
}
.wine__lead { color: rgba(255, 255, 255, .85); font-size: 1.08rem; max-width: 34em; }
.wine__facts { list-style: none; padding: 0; margin: 1.75rem 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.wine__facts li { padding: 1rem; border-radius: 14px; background: rgba(255, 255, 255, .05); border: 1px solid rgba(242, 207, 124, .2); text-align: center; }
.wine__facts strong { display: block; font: 700 2rem/1 var(--font-display); color: var(--gold-300); margin-bottom: .35rem; }
.wine__facts span { font-size: .82rem; color: rgba(255, 255, 255, .7); }
.wine__note { margin: 0; font-size: .82rem; color: rgba(255, 255, 255, .55); font-style: italic; }

@media (max-width: 860px) {
  .wine { grid-template-columns: 1fr; text-align: center; }
  .wine__visual { height: 300px; }
  .wine__lead { margin-inline: auto; }
}
@media (max-width: 420px) {
  .wine__facts { gap: .5rem; }
  .wine__facts li { padding: .75rem .4rem; }
}

.events__cta {
  margin-top: 2.5rem;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.25rem;
  padding: 1.5rem 1.75rem;
  border-radius: var(--radius);
  background: rgba(242, 207, 124, .08);
  border: 1px solid rgba(242, 207, 124, .25);
}
.events__cta p { margin: 0; max-width: 46em; color: rgba(255,255,255,.85); }

.split { display: grid; grid-template-columns: 1fr 1.15fr; gap: clamp(2rem, 5vw, 5rem); align-items: center; }
.split--reverse { grid-template-columns: 1fr 1fr; }

.feature {
  padding: 1.6rem;
  border-radius: var(--radius);
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  transition: background-color .3s ease, transform .3s ease;
}
.feature:hover { background: rgba(255,255,255,.1); transform: translateY(-4px); }
.feature__icon {
  width: 52px; height: 52px; border-radius: 14px; margin-bottom: 1rem;
  display: grid; place-items: center;
  background: linear-gradient(135deg, rgba(242, 207, 124, .25), rgba(210, 154, 50, .1));
  color: var(--gold-300);
  border: 1px solid rgba(242, 207, 124, .35);
}
.feature__icon svg { width: 26px; height: 26px; }
.feature p { color: rgba(255,255,255,.75); margin: 0; font-size: .96rem; }

.steps { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; counter-reset: s; position: relative; }
.steps::before {
  content: ""; position: absolute; left: 6%; right: 6%; top: 28px; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold-300), var(--gold-500), var(--gold-300), transparent);
}
.step { position: relative; text-align: center; padding: 0 .5rem; }
.step__n {
  position: relative; display: grid; place-items: center;
  width: 56px; height: 56px; margin: 0 auto 1.25rem; border-radius: 50%;
  font: 700 1.05rem/1 var(--font-display);
  color: #3b2603; background: var(--gold-grad);
  box-shadow: 0 0 0 8px var(--cream), 0 12px 24px -8px rgba(210, 154, 50, .7);
}
.step p { color: var(--ink-soft); font-size: .96rem; }

.trust-visual { position: relative; height: 340px; perspective: 900px; }
.ingot {
  position: absolute; width: 58%; height: 26%;
  background: linear-gradient(160deg, #fff4c6 0%, #edc463 30%, #c98d2a 65%, #8f5c14 100%);
  clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
  box-shadow: 0 30px 40px -20px rgba(80, 50, 0, .5);
  animation: float 6s ease-in-out infinite;
}
.ingot::after {
  content: "DAWA · 999.9"; position: absolute; inset: 0; display: grid; place-items: center;
  font: 700 clamp(.8rem, 1.6vw, 1.05rem)/1 var(--font-display); letter-spacing: .2em; color: rgba(90, 55, 5, .45);
}
.ingot--1 { left: 4%; top: 52%; }
.ingot--2 { left: 38%; top: 46%; animation-delay: -2s; z-index: 1; }
.ingot--3 { left: 20%; top: 18%; animation-delay: -4s; }
@keyframes float { 0%, 100% { transform: translateY(0) rotateX(18deg); } 50% { transform: translateY(-14px) rotateX(18deg); } }

.checks { list-style: none; padding: 0; margin: 1.5rem 0 0; display: grid; gap: .9rem; }
.checks li { position: relative; padding-left: 2.1rem; color: var(--ink-soft); }
.checks li::before {
  content: ""; position: absolute; left: 0; top: .15em; width: 1.35rem; height: 1.35rem; border-radius: 50%;
  background: var(--gold-grad);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12'/%3E%3C/svg%3E") center/contain;
}
.checks li::after {
  content: ""; position: absolute; left: .45rem; top: .45em; width: .45rem; height: .7rem;
  border: solid #3b2603; border-width: 0 2px 2px 0; transform: rotate(45deg);
}

.contact-list { margin: 2rem 0 0; display: grid; gap: 1rem; }
.contact-list div { display: grid; gap: .1rem; }
.contact-list dt { font-size: .78rem; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-300); }
.contact-list dd { margin: 0; font-size: 1.05rem; }
.contact-list a { text-decoration-color: rgba(242, 207, 124, .6); text-underline-offset: 4px; }

.form {
  display: grid; gap: 1rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border-radius: var(--radius);
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.14);
}
.form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form label { display: grid; gap: .4rem; font-size: .85rem; font-weight: 600; color: rgba(255,255,255,.85); }
.form input, .form select, .form textarea {
  width: 100%; font: 400 1rem/1.4 var(--font-body);
  padding: .8rem .95rem; border-radius: 12px;
  color: var(--white); background: rgba(4, 18, 46, .45);
  border: 1px solid rgba(255,255,255,.18);
  transition: border-color .2s ease, box-shadow .2s ease;
}
.form select option { color: var(--ink); }
.form input:focus, .form select:focus, .form textarea:focus {
  outline: none; border-color: var(--gold-400); box-shadow: 0 0 0 3px rgba(230, 181, 79, .25);
}
.form [aria-invalid="true"] { border-color: #ff8a80; }
.form textarea { resize: vertical; }
.form__status { margin: 0; min-height: 1.5em; font-size: .92rem; color: var(--gold-300); }

.footer { background: var(--navy-950); color: rgba(255,255,255,.7); padding: 2.5rem 0 calc(2.5rem + env(safe-area-inset-bottom)); font-size: .9rem; }
.footer__inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
.footer p { margin: 0; }
.brand--footer { color: var(--white); }
.brand--footer .brand__logo { height: 34px; }
.footer__note { width: 100%; font-size: .8rem; opacity: .6; }

.toast {
  position: fixed; left: 50%; bottom: calc(1.25rem + env(safe-area-inset-bottom)); z-index: 60;
  transform: translateX(-50%);
  background: var(--navy-950); color: var(--white);
  padding: .85rem 1.25rem; border-radius: 12px;
  border: 1px solid rgba(230, 181, 79, .4);
  box-shadow: var(--shadow);
  font-size: .95rem;
  max-width: calc(100% - 2rem);
}

/* Reveal on scroll */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1); }
.reveal.is-visible { opacity: 1; transform: none; }
.no-js .reveal { opacity: 1; transform: none; }

/* ---------- Responsive content ---------- */
@media (max-width: 960px) {
  .divisions, .cards--3 { grid-template-columns: 1fr; }
  .cards--3 { max-width: 560px; margin-inline: auto; }
}
@media (max-width: 860px) {
  .split, .split--reverse { grid-template-columns: 1fr; }
  .steps { grid-template-columns: repeat(2, 1fr); row-gap: 2.5rem; }
  .steps::before { display: none; }
  .stats__grid { grid-template-columns: repeat(2, 1fr); }
  .trust-visual { height: 260px; order: 2; }
}
@media (max-width: 560px) {
  .cards--2, .steps { grid-template-columns: 1fr; }
  .division__visual { height: 180px; }
  .form__row { grid-template-columns: 1fr; }
  .stats__grid { gap: .5rem; }
}
`;
