#!/usr/bin/env python3
"""Generate react/DawaLanding.jsx — a single, self-contained React component of the
whole landing page — from index.html, css/styles.css, js/hero.js and the assets.

Run from the repo root after changing the static site:
    python3 tools/build-jsx.py
"""
import base64
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text()
css = (ROOT / 'css/styles.css').read_text()
hero_js = (ROOT / 'js/hero.js').read_text()
logo_b64 = base64.b64encode((ROOT / 'assets/logo/dawa-logo.webp').read_bytes()).decode()
land = json.loads((ROOT / 'assets/data/land.json').read_text())
gallery_js = (ROOT / 'js/gallery.js').read_text()
gallery_imgs = {f.stem: base64.b64encode(f.read_bytes()).decode()
                for f in sorted((ROOT / 'assets/gallery').glob('*.webp'))}


def must_replace(src, old, new, count=1):
    assert old in src, f'pattern not found: {old[:70]!r}'
    return src.replace(old, new, count)


# ---------------------------------------------------------------- HTML -> JSX
body = html[html.index('<header class="nav"'):html.index('  <div class="toast"')]

# Interactive pieces become React-driven
body = must_replace(body, '<nav class="nav__links" id="nav-links" aria-label="Primary">',
                    '<nav className={`nav__links${menuOpen ? " is-open" : ""}`} id="nav-links" aria-label="Primary" onClick={(e) => e.target.closest("a") && setMenuOpen(false)}>')
body = must_replace(body, '<button class="btn btn--ghost btn--sm" type="button" data-install hidden>',
                    '<button class="btn btn--ghost btn--sm" type="button" hidden={!installPrompt} onClick={install}>')
body = must_replace(body, '<button class="nav__toggle" type="button" aria-controls="nav-links" aria-expanded="false" aria-label="Open menu" data-nav-toggle>',
                    '<button class="nav__toggle" type="button" aria-controls="nav-links" aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((o) => !o)}>')
body = must_replace(body, '<header class="nav" data-nav>',
                    '<header className={`nav${scrolled || menuOpen ? " is-scrolled" : ""}`}>')
body = must_replace(body, 'data-enquiry="Partner event invitation"',
                    'onClick={() => setEnquiry("Partner event invitation")}')
body = must_replace(body, '<form class="form reveal" data-form novalidate>',
                    '<form class="form reveal" noValidate onSubmit={submit}>')
body = must_replace(body, '<select name="enquiry" data-enquiry-select>',
                    '<select name="enquiry" value={enquiry} onChange={(e) => setEnquiry(e.target.value)}>')
body = must_replace(body, '<p class="form__status" role="status" aria-live="polite" data-form-status></p>',
                    '<p class="form__status" role="status" aria-live="polite">{status}</p>')
body = must_replace(body, '<span data-year>2026</span>', '{new Date().getFullYear()}')
body = re.sub(r'<input name="(name|email)"([^>]*?) required>',
              r'<input name="\1"\2 required aria-invalid={invalid.\1 ? "true" : undefined}>', body)

# Split the hero out so it can be a memoised, never-re-rendering subtree
hero_start = body.index('  <!-- ============ HERO')
hero_end = body.index('  </section>', hero_start) + len('  </section>')
hero_html = body[hero_start:hero_end]
page_html = body[:hero_start] + '  <Hero />' + body[hero_end:]

ATTRS = {
    'class': 'className', 'for': 'htmlFor', 'novalidate': 'noValidate', 'autocomplete': 'autoComplete',
    'srcset': 'srcSet', 'stop-color': 'stopColor', 'stop-opacity': 'stopOpacity', 'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'stroke-opacity': 'strokeOpacity',
    'fill-opacity': 'fillOpacity', 'clip-path': 'clipPath', 'font-family': 'fontFamily', 'font-size': 'fontSize',
    'font-weight': 'fontWeight', 'letter-spacing': 'letterSpacing', 'text-anchor': 'textAnchor',
    'stroke-dasharray': 'strokeDasharray',
}
VOID = ('img', 'input', 'source', 'br', 'stop', 'rect', 'circle', 'ellipse', 'path', 'line')


def to_jsx(s):
    s = re.sub(r'<!--(.*?)-->', lambda m: '{/*' + m.group(1) + '*/}', s, flags=re.S)
    for a, b in ATTRS.items():
        s = re.sub(r'(?<=[\s<])' + re.escape(a) + r'=', b + '=', s)
    # style="--a:1;--b:2" -> style={{ '--a': '1', '--b': '2' }}
    def style(m):
        parts = [p.split(':', 1) for p in m.group(1).split(';') if p.strip()]
        return 'style={{ ' + ', '.join(f"'{k.strip()}': '{v.strip()}'" for k, v in parts) + ' }}'
    s = re.sub(r'style="([^"]*)"', style, s)
    s = re.sub(r'\s(hidden|required|defer)(?=[\s>])', r' \1', s)
    # self-close void / leaf elements written without a closing tag
    s = re.sub(r'<(img|input|source|br)\b([^>]*?)\s*/?>', r'<\1\2 />', s)
    s = s.replace('<br />', '<br />')
    return s


hero_jsx = to_jsx(hero_html)
page_jsx = to_jsx(page_html)
# the logo comes from the embedded data URI so the component is fully standalone
for src in ('srcSet="assets/logo/dawa-logo.webp"', 'src="assets/logo/dawa-logo.png"'):
    attr = src.split('=')[0]
    page_jsx = page_jsx.replace(src, f'{attr}={{LOGO}}')
page_jsx = re.sub(r'\s*<source srcSet=\{LOGO\} type="image/webp" />', '', page_jsx)
# product photos are embedded as data URIs too
page_jsx = re.sub(r'src="assets/gallery/([\w-]+)\.webp"', r"src={GALLERY['\1']}", page_jsx)
assert 'assets/gallery' not in page_jsx

# ------------------------------------------------------------- slideshow engine
gallery_fn = gallery_js[gallery_js.index('function mountGallery'):gallery_js.index("document.querySelectorAll('[data-gallery]')")].rstrip()
page_jsx = re.sub(r'\s*</?picture>', '', page_jsx)

# ------------------------------------------------------------- hero engine
engine = hero_js[hero_js.index("  'use strict';"):hero_js.rindex('})();')]
engine = must_replace(engine, "  const hero = document.querySelector('[data-hero]');\n", '')
engine = must_replace(engine, "  const scene = document.querySelector('[data-scene]');\n  if (!hero || !scene) return;",
                      "  const scene = hero.querySelector('[data-scene]');\n  if (!scene) return () => {};\n  const cleanups = [];\n  const listen = (target, type, fn) => { target.addEventListener(type, fn); cleanups.push(() => target.removeEventListener(type, fn)); };")
engine = must_replace(engine, "document.querySelector('[data-hero-content]')", "hero.querySelector('[data-hero-content]')")
engine = must_replace(engine, "  window.addEventListener('resize', () => {", "  listen(window, 'resize', () => {")
engine = must_replace(engine, "  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));",
                      "  listen(document, 'visibilitychange', () => (document.hidden ? stop() : start()));")
engine = must_replace(engine, """    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      inView ? start() : stop();
    }).observe(hero);""", """    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      inView ? start() : stop();
    });
    io.observe(hero);
    cleanups.push(() => io.disconnect());""")
engine = must_replace(engine, "  reduceMotion.addEventListener ? reduceMotion.addEventListener('change', onMotionChange) : reduceMotion.addListener(onMotionChange);",
                      "  listen(reduceMotion, 'change', onMotionChange);")
engine = engine[:engine.index("  fetch('assets/data/land.json')")] + """  globe.buildTexture(landRings);
  if (reduceMotion.matches) still();

  return () => {
    stop();
    clearTimeout(resizeTimer);
    cleanups.forEach((fn) => fn());
  };
"""
engine = '\n'.join(line[2:] if line.startswith('  ') else line for line in engine.split('\n'))

# ------------------------------------------------------------- assemble
assert '`' not in css and '${' not in css
indent = lambda s, n: '\n'.join((' ' * n + l) if l.strip() else l for l in s.split('\n'))

out = f"""/**
 * DAWA — Wholesale Distribution landing page (single-file React component)
 *
 * Everything the page needs is in this file: markup, styles, the animated hero
 * engine (sun rays, spinning gold globe, plane, sea, ship), the official logo and
 * the coastline data for the globe. Drop it into any React 18+ app:
 *
 *   import DawaLanding from './DawaLanding';
 *   export default function App() {{ return <DawaLanding />; }}
 *
 * Generated from the static site by tools/build-jsx.py — edit the site, then re-run it.
 * The installable PWA (manifest + service worker) lives in the static site.
 */
import React, {{ memo, useEffect, useRef, useState }} from 'react';

export default function DawaLanding() {{
  const rootRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [enquiry, setEnquiry] = useState('Precious metals');
  const [status, setStatus] = useState('');
  const [invalid, setInvalid] = useState({{}});
  const [toast, setToast] = useState('');

  // Product photo slideshows
  useEffect(() => {{
    const unmount = [...rootRef.current.querySelectorAll('[data-gallery]')].map(mountGallery);
    return () => unmount.forEach((fn) => fn());
  }}, []);

  // Nav background once the page scrolls; Escape closes the mobile menu
  useEffect(() => {{
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    onScroll();
    window.addEventListener('scroll', onScroll, {{ passive: true }});
    document.addEventListener('keydown', onKey);
    return () => {{
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKey);
    }};
  }}, []);

  // "Install app" button (shown when the browser offers PWA installation)
  useEffect(() => {{
    const onPrompt = (e) => {{ e.preventDefault(); setInstallPrompt(e); }};
    const onInstalled = () => {{ setInstallPrompt(null); setToast('DAWA was installed on your device.'); }};
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {{
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    }};
  }}, []);
  const install = async () => {{
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {{}});
    setInstallPrompt(null);
  }};

  useEffect(() => {{
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }}, [toast]);

  // Reveal-on-scroll with staggered siblings and count-up figures
  useEffect(() => {{
    const root = rootRef.current;
    const els = root.querySelectorAll('.reveal');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const countUp = (el) => {{
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduce) {{ el.textContent = target + suffix; return; }}
      const t0 = performance.now();
      const tick = (now) => {{
        const p = Math.min(1, (now - t0) / 1400);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }};
      requestAnimationFrame(tick);
    }};
    if (!('IntersectionObserver' in window)) {{
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }}
    const io = new IntersectionObserver((entries) => {{
      for (const entry of entries) {{
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
        el.style.transitionDelay = Math.max(0, siblings.indexOf(el)) * 90 + 'ms';
        el.classList.add('is-visible');
        const counter = el.querySelector('[data-count]');
        if (counter) countUp(counter);
        io.unobserve(el);
      }}
    }}, {{ threshold: 0.15, rootMargin: '0px 0px -40px 0px' }});
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }}, []);

  // Contact form: validates, then opens the visitor's email app (wire to your CRM for production)
  const submit = (e) => {{
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const bad = {{
      name: !data.name.trim(),
      email: !form.elements.email.checkValidity() || !data.email.trim(),
    }};
    setInvalid(bad);
    if (bad.name || bad.email) {{
      setStatus('Please fill in your name and a valid email.');
      form.elements[bad.name ? 'name' : 'email'].focus();
      return;
    }}
    const body = encodeURIComponent(
      `Name: ${{data.name}}\\nCompany: ${{data.company}}\\nEmail: ${{data.email}}\\nEnquiry: ${{data.enquiry}}\\n\\n${{data.message}}`
    );
    setStatus("Thank you. Your email app should open with the enquiry ready to send. If it doesn't, email trade@dawa.example.");
    window.location.href = `mailto:trade@dawa.example?subject=${{encodeURIComponent('Enquiry — ' + data.enquiry)}}&body=${{body}}`;
    form.reset();
    setEnquiry('Precious metals');
  }};

  return (
    <div ref={{rootRef}}>
      <style>{{CSS}}</style>
      <a className="skip-link" href="#main">Skip to content</a>

{indent(page_jsx, 4)}

      <div className="toast" role="status" aria-live="polite" hidden={{!toast}}>{{toast}}</div>
    </div>
  );
}}

/* ------------------------------------------------------------------ HERO */
const Hero = memo(function Hero() {{
  const ref = useRef(null);
  useEffect(() => mountHero(ref.current, LAND_RINGS), []);
  return (
    <div ref={{ref}} style={{{{ display: 'contents' }}}}>
{indent(hero_jsx, 4)}
    </div>
  );
}});

/**
 * Imperative canvas/SVG engine for the hero scene. Returns a cleanup function.
 */
function mountHero(root, landRings) {{
  const hero = root.querySelector('[data-hero]');
  if (!hero) return () => {{}};
{indent(engine, 2)}
}}

/* ------------------------------------------------------------------ SLIDESHOW */
{gallery_fn}

/* ------------------------------------------------------------------ ASSETS */
const LOGO = 'data:image/webp;base64,{logo_b64}';

/** Product photos for the slideshow. */
const GALLERY = {{
{chr(10).join(f"  '{k}': 'data:image/webp;base64,{v}'," for k, v in gallery_imgs.items())}
}};

/** Natural Earth land rings (lon, lat pairs) for the globe texture. */
const LAND_RINGS = {json.dumps(land, separators=(',', ':'))};

const CSS = `
{css}`;
"""

# class= inside the generated JSX must be className; data-hero attribute stays for the engine
out = out.replace(' class=', ' className=')
dest = ROOT / 'react' / 'DawaLanding.jsx'
dest.parent.mkdir(exist_ok=True)
dest.write_text(out)
print(f'wrote {dest.relative_to(ROOT)} ({len(out) // 1024} KB)')
