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

  // Product photo slideshows
  useEffect(() => {
    const unmount = [...rootRef.current.querySelectorAll('[data-gallery]')].map(mountGallery);
    return () => unmount.forEach((fn) => fn());
  }, []);

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
                <div className="division__visual division__visual--gallery">
                  <div className="gallery" data-gallery role="region" aria-roledescription="carousel" aria-label="Gold smoking accessories photos">
                    <figure className="gallery__slide is-active" style={{ '--slide-bg': '#2a1f0a' }} role="group" aria-roledescription="slide" aria-label="1 of 4">
                      <img className="gallery__backdrop" src={GALLERY['steam-chalice']} alt="" aria-hidden="true" />
                      <img className="gallery__img" src={GALLERY['steam-chalice']} alt="Gold steam chalice with engraved sun emblem, coals and a white hose with gold wraps" width="720" height="720" decoding="async" />
                      <figcaption><strong>Gold steam chalice</strong><span>Engraved sun emblem · gold-wrapped hose</span></figcaption>
                    </figure>
                    <figure className="gallery__slide" style={{ '--slide-bg': '#ffffff' }} role="group" aria-roledescription="slide" aria-label="2 of 4" aria-hidden="true">
                      <img className="gallery__img" src={GALLERY['gold-trim-pipe']} alt="Churchwarden pipe with a gold rim and gold band, shown with its spare stem" width="720" height="720" loading="lazy" decoding="async" />
                      <figcaption><strong>Churchwarden pipe</strong><span>Gold-trimmed rim and band</span></figcaption>
                    </figure>
                    <figure className="gallery__slide" style={{ '--slide-bg': '#e4e4e4' }} role="group" aria-roledescription="slide" aria-label="3 of 4" aria-hidden="true">
                      <img className="gallery__img" src={GALLERY['gold-papers-pack']} alt="Six-sheet king-size pack of 24K gold rolling papers with a window showing the gold leaf" width="720" height="720" loading="lazy" decoding="async" />
                      <figcaption><strong>24K gold rolling papers</strong><span>6-sheet king-size pack</span></figcaption>
                    </figure>
                    <figure className="gallery__slide" style={{ '--slide-bg': '#e4e4e4' }} role="group" aria-roledescription="slide" aria-label="4 of 4" aria-hidden="true">
                      <img className="gallery__img" src={GALLERY['gold-cone']} alt="Pre-rolled cone made of 24K gold-leaf paper" width="720" height="720" loading="lazy" decoding="async" />
                      <figcaption><strong>24K gold-leaf cone</strong><span>Pre-rolled, king size</span></figcaption>
                    </figure>
                    <button type="button" className="gallery__nav gallery__nav--prev" aria-label="Previous image">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button type="button" className="gallery__nav gallery__nav--next" aria-label="Next image">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <div className="gallery__dots">
                    <button type="button" className="gallery__dot" aria-label="Show image 1: Gold steam chalice" aria-current="true"></button>
                    <button type="button" className="gallery__dot" aria-label="Show image 2: Churchwarden pipe"></button>
                    <button type="button" className="gallery__dot" aria-label="Show image 3: 24K gold rolling papers"></button>
                    <button type="button" className="gallery__dot" aria-label="Show image 4: 24K gold-leaf cone"></button>
                    </div>
                  </div>
                </div>
                <div className="division__body">
                  <p className="division__tag">Division 02</p>
                  <h3>Gold smoking accessories</h3>
                  <p>Steam chalices, pipes, 24K gold rolling papers and more, finished in genuine 18K to 24K
                    gold. Statement pieces for luxury retailers, lounges and collectors.</p>
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

/* ------------------------------------------------------------------ SLIDESHOW */
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

/* ------------------------------------------------------------------ ASSETS */
const LOGO = 'data:image/webp;base64,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';

/** Product photos for the slideshow. */
const GALLERY = {
  'gold-cone': 'data:image/webp;base64,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',
  'gold-papers-pack': 'data:image/webp;base64,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',
  'gold-trim-pipe': 'data:image/webp;base64,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',
  'steam-chalice': 'data:image/webp;base64,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',
};

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
  position: relative; height: 360px;
  display: grid; place-items: center;
  overflow: hidden;
}
.division--metals .division__visual {
  background: radial-gradient(80% 90% at 50% 100%, #1f5fb8 0%, #0b2a63 70%);
}
/* ---- Product photo slideshow ---- */
.division__visual--gallery { height: 360px; display: block; background: #140d06; }
.division__visual--gallery::after { display: none; }
.gallery { position: absolute; inset: 0; outline: none; touch-action: pan-y; }
.gallery:focus-visible { box-shadow: inset 0 0 0 3px var(--gold-300); }
.gallery__slide {
  position: absolute; inset: 0; margin: 0;
  background: var(--slide-bg, #140d06);
  opacity: 0; visibility: hidden;
  transition: opacity .8s ease, visibility 0s linear .8s;
}
.gallery__slide.is-active { opacity: 1; visibility: visible; transition: opacity .8s ease; }
/* photo area above, caption strip below */
.gallery { --strip: 76px; }
.gallery__img, .gallery__backdrop {
  position: absolute; left: 0; top: 0; width: 100%; height: calc(100% - var(--strip)); max-width: none;
}
.gallery__img { object-fit: contain; padding: 1rem; }
.gallery__backdrop { object-fit: cover; filter: blur(18px) brightness(.8) saturate(1.1); transform: scale(1.15); }
.gallery__slide.is-active .gallery__img { animation: kenburns 7s ease-out both; }
@keyframes kenburns { from { transform: scale(1.05); } to { transform: scale(1); } }
.gallery__slide figcaption {
  position: absolute; left: 0; right: 0; bottom: 0; height: var(--strip);
  padding: 0 7.5rem 0 1.25rem;
  display: flex; flex-direction: column; justify-content: center; gap: .15rem;
  color: #fff; background: #140d06;
  border-top: 1px solid rgba(242, 207, 124, .25);
}
.gallery__slide figcaption strong { font: 700 1.1rem/1.2 var(--font-display); }
.gallery__slide figcaption span { font-size: .84rem; color: var(--gold-100); }
.gallery__nav {
  position: absolute; top: calc((100% - var(--strip)) / 2); z-index: 2;
  width: 40px; height: 40px; margin-top: -20px; padding: 0;
  display: grid; place-items: center;
  border: 1px solid rgba(255, 255, 255, .5); border-radius: 50%;
  color: #fff; background: rgba(10, 6, 2, .45);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  cursor: pointer; transition: background-color .2s ease, transform .2s ease;
}
.gallery__nav:hover { background: rgba(10, 6, 2, .7); transform: scale(1.06); }
.gallery__nav:focus-visible { outline: 3px solid var(--gold-300); outline-offset: 2px; }
.gallery__nav svg { width: 20px; height: 20px; }
.gallery__nav--prev { left: .75rem; }
.gallery__nav--next { right: .75rem; }
.gallery__dots { position: absolute; z-index: 2; right: 1.25rem; bottom: calc(var(--strip) / 2 - 4.5px); display: flex; gap: .45rem; }
.gallery__dot {
  width: 9px; height: 9px; padding: 0; border-radius: 999px; border: 0;
  background: rgba(255, 255, 255, .45); cursor: pointer;
  transition: width .3s ease, background-color .3s ease;
}
.gallery__dot[aria-current="true"] { width: 24px; background: var(--gold-300); }
.gallery__dot:focus-visible { outline: 2px solid var(--gold-300); outline-offset: 3px; }

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

.bars { display: grid; grid-template-columns: repeat(4, 1fr); gap: .8rem; width: min(86%, 420px); }
.bar {
  display: grid; place-items: center; height: 84px;
  background: linear-gradient(160deg, var(--m1) 0%, var(--m2) 45%, var(--m3) 100%);
  clip-path: polygon(10% 0, 90% 0, 100% 100%, 0 100%);
  font: 700 1.15rem/1 var(--font-display); color: rgba(0,0,0,.3);
  animation: float 6s ease-in-out infinite;
}
.bar:nth-child(2) { animation-delay: -1.5s; }
.bar:nth-child(3) { animation-delay: -3s; }
.bar:nth-child(4) { animation-delay: -4.5s; }

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
  .division__visual { height: 220px; }
  .division__visual--gallery { height: 340px; }
  .form__row { grid-template-columns: 1fr; }
  .stats__grid { gap: .5rem; }
}
`;
