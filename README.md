# DAWA — Wholesale Distribution PWA landing page

Static, dependency-free Progressive Web App landing page for DAWA, a wholesale distributor of
precious metals and tobacco that also hosts trade-only partner events.

Sections: animated hero · trade hubs · key figures · product divisions (precious metals, tobacco) ·
logistics · partner events (incl. DAWA Wine, the events-only signature tonic) · how it works · compliance · contact.

## Animated hero
The hero artwork is rebuilt from layers so every element moves on its own and the scene
recomposes for wide desktop screens and for portrait phones/tablets:

| Element | How it's animated |
| --- | --- |
| Sun rays | Three counter-rotating, pulsing conic-gradient ray layers, glowing core and twinkling sparkles (CSS) |
| Globe | Per-pixel orthographic renderer on `<canvas>` (`js/hero.js`), spinning a gold-continent texture built at runtime from Natural Earth data (`assets/data/land.json`) with lighting, specular and atmosphere rim; orbit ring wraps around it |
| Plane | Flies a climbing bezier path (passing behind the globe), banked to its heading, contrail and strobe lights |
| Sea | Five layered swells on two canvases, a breaking wave with spray, whitecaps and sun glitter |
| Ship | Rides the front swell — heave and pitch follow the actual wave surface — with bow wave, hull foam and wake |
| Skyline | Procedurally generated golden towers with glinting windows |

Animation pauses when the hero is off-screen or the tab is hidden, and `prefers-reduced-motion`
gets a single composed still frame.

## PWA
`manifest.webmanifest`, `sw.js` (offline app shell; network-first pages, stale-while-revalidate
assets), install button via `beforeinstallprompt`, maskable and Apple touch icons.

## Run locally
Any static server works (service workers need `http://localhost` or HTTPS):

```sh
python3 -m http.server 8000
```

Bump `VERSION` in `sw.js` when you deploy changes so clients pick up the new files.

## Placeholder content
Company figures, the email address (`trade@dawa.example`) and copy are placeholders. Review the
tobacco wording (trade-only, legal age, health warning) against the rules in each market you serve. The contact
form opens the visitor's email client; connect it to your backend/CRM for production.
`tools/build-land.cjs` regenerates the coastline data from `world-atlas`.
