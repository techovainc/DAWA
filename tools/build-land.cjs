// Regenerates assets/data/land.json (compact land rings, [lon,lat,lon,lat,...])
// from Natural Earth via world-atlas. Usage:
//   npm i -D world-atlas@2 topojson-client@3
//   node tools/build-land.cjs node_modules/world-atlas/land-110m.json 0.1 assets/data/land.json
const fs = require('fs');
const { feature } = require('topojson-client');

const [src, step, out] = process.argv.slice(2);
const topo = JSON.parse(fs.readFileSync(src));
const land = feature(topo, topo.objects.land);
const geoms = land.features ? land.features.map((f) => f.geometry) : [land.geometry];
const rings = [];

for (const g of geoms) {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const poly of polys) {
    for (const ring of poly) {
      const o = [];
      let pl, pa;
      for (const [lon, lat] of ring) {
        const L = Math.round(lon / step) * step;
        const A = Math.round(lat / step) * step;
        if (L === pl && A === pa) continue;
        o.push(+L.toFixed(2), +A.toFixed(2));
        pl = L; pa = A;
      }
      if (o.length >= 6) rings.push(o);
    }
  }
}

fs.writeFileSync(out, JSON.stringify(rings));
console.log(`${rings.length} rings -> ${out}`);
