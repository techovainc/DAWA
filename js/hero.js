/* =========================================================
   DAWA hero scene
   A layered, fully animated recreation of the hero artwork:
   sun rays, a spinning gold-continent globe, a plane in flight,
   a golden skyline, moving sea and a container ship riding the swell.
   ========================================================= */
(() => {
  'use strict';

  const hero = document.querySelector('[data-hero]');
  const scene = document.querySelector('[data-scene]');
  if (!hero || !scene) return;

  const $ = (sel) => scene.querySelector(sel);
  const content = document.querySelector('[data-hero-content]');
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
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // ignore pure height jitter from mobile browser toolbars
      if (hero.clientWidth === lastW && Math.abs(hero.clientHeight - H) < 80) return;
      lastW = hero.clientWidth;
      setup();
    }, 150);
  });

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      inView ? start() : stop();
    }).observe(hero);
  }
  const onMotionChange = () => (reduceMotion.matches ? still() : start());
  reduceMotion.addEventListener ? reduceMotion.addEventListener('change', onMotionChange) : reduceMotion.addListener(onMotionChange);

  // Boot: ocean-only globe first, then gold continents as soon as the data arrives
  buildShip();
  globe.buildTexture(null);
  lastW = hero.clientWidth;
  setup();
  start();
  fetch('assets/data/land.json')
    .then((r) => r.json())
    .then((rings) => {
      globe.buildTexture(rings);
      if (reduceMotion.matches) still();
    })
    .catch(() => { /* globe stays as an ocean sphere */ });
})();
