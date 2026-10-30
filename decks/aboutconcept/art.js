// About page, layer row: one abstract picture per layer (physics, chemistry, biology). Three concepts, ?v=1|2|3.
// 1 · line art, zoom chain: each picture marks the piece the layer to its left zooms into
// 2 · dots: the same dot, more of them and smaller as the scale grows (1 atom, 13 atoms, ~200 + a membrane)
// 3 · lit spheres on dark tiles, like the machines on the homepage
(() => {
const V = +(new URLSearchParams(location.search).get('v') || 1);
if (V > 3) return;   // 4-6: art2.js
document.body.classList.add('v' + V);
const INK = '#14161A';
// seeded random, so the pictures are the same on every load
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

// small molecule: two fused rings, a C=O, an N with a methyl (13 heavy atoms), in Å
const MOL = (() => {
  const a = [], b = [], r = 1.4, at = (x, y, e) => (a.push({ x, y, e }), a.length - 1);
  const h1 = [...Array(6)].map((_, k) => at(r * Math.cos((30 + 60 * k) * Math.PI / 180), r * Math.sin((30 + 60 * k) * Math.PI / 180), 'C'));
  for (let k = 0; k < 6; k++) b.push([h1[k], h1[(k + 1) % 6]]);
  const cx = 2 * r * Math.cos(Math.PI / 6), h2 = [h1[0]];
  for (const g of [90, 30, 330, 270]) h2.push(at(cx + r * Math.cos(g * Math.PI / 180), r * Math.sin(g * Math.PI / 180), g === 30 ? 'N' : 'C'));
  h2.push(h1[5]); for (let k = 0; k < 5; k++) b.push([h2[k], h2[k + 1]]);
  const o = at(1.2 * Math.cos(150 * Math.PI / 180) * 2.05, 1.2 * Math.sin(150 * Math.PI / 180) * 2.05, 'O'); b.push([h1[2], o]);
  const n = h2[2], m = at(a[n].x + 1.45, a[n].y, 'C'); b.push([n, m]);
  const o2 = at(a[h1[4]].x, a[h1[4]].y - 1.3, 'O'); b.push([h1[4], o2]);
  return { a, b };
})();

// protein: a chain of 220 beads that keeps its heading (smooth coils) and is pulled back into a ball when it strays
const PROT = (() => {
  const N = 220, R = 4.6, P = [[0, 0, 0]]; let d = [1, 0, 0];
  for (let i = 1; i < N; i++) {
    const p = P[i - 1], l = Math.hypot(...p), pull = l > R ? 1.4 * (l - R + .5) : 0;
    d = d.map((x, j) => 1.5 * x + .9 * gauss() - (l ? pull * p[j] / l : 0));
    const n = Math.hypot(...d); d = d.map(x => x / n);
    P.push(p.map((x, j) => x + .75 * d[j]));
  }
  return P;
})();

function fit(cv){
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
  return [c, w, h];
}
const ball = (c, x, y, r, col, a = 1) => { c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.globalAlpha = 1; };
function lit(c, x, y, r, col){   // shaded sphere, light from the top left
  const g = c.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
  g.addColorStop(0, '#fff'); g.addColorStop(.25, col); g.addColorStop(1, shade(col, -.55));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
}
function shade(hex, t){ const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return `rgb(${v.map(x => Math.round(t < 0 ? x * (1 + t) : x + (255 - x) * t)).join(',')})`; }
// project the protein: slow turn, orthographic; returns [{x, y, z}] in px
function protein(cx, cy, s, th = .5){
  const c = Math.cos(th), sn = Math.sin(th);
  return PROT.map(([x, y, z]) => ({ x: cx + (c * x + sn * z) * s, y: cy + y * s, z: -sn * x + c * z }));
}
function membrane(c, x0, x1, h, r, style){   // a piece of a cell: two rows of lipid heads on a wide arc, tails meeting inside
  const gap = r * 6.4, R = (x1 - x0) * 1.15, cx = (x0 + x1) / 2, cy = h * .2 + R, a0 = Math.asin((x1 - cx) / R);
  for (let a = -a0; a <= a0 + 1e-6; a += r * 2.3 / R) {
    const ux = Math.sin(a), uy = -Math.cos(a);
    for (const [rr, d] of [[R, -1], [R - gap, 1]]) {   // d: tails point inward (-1) on the outer row, outward on the inner
      const x = cx + ux * rr, y = cy + uy * rr, t = gap / 2 - r - .5, tx = x + ux * d * (r + t), ty = y + uy * d * (r + t);
      if (style === 'line') { c.strokeStyle = INK; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x + ux * d * r, y + uy * d * r); c.lineTo(tx, ty); c.stroke(); }
      else if (style === 'dot') { ball(c, x, y, r, INK); ball(c, (x + tx) / 2 + ux * d * r * .4, (y + ty) / 2 + uy * d * r * .4, r * .45, INK, .5); }
      else { c.strokeStyle = 'rgba(255,196,107,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(tx, ty); c.stroke(); lit(c, x, y, r, '#FFC46B'); }
    }
  }
}
function zoomMark(c, x, y, s, toX, h){   // small square plus two thin lines to the left edge: "the layer to the left is inside this"
  c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x - s / 2, y - s / 2, s, s);
  c.globalAlpha = .35; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(x - s / 2, y - s / 2); c.lineTo(toX, 2); c.moveTo(x - s / 2, y + s / 2); c.lineTo(toX, h - 2); c.stroke();
  c.setLineDash([]); c.globalAlpha = 1;
}

function physics(cv){
  const [c, w, h] = fit(cv), x = w / 2, y = h / 2;
  if (V === 1) {   // nucleus and three orbitals
    c.strokeStyle = INK; c.lineWidth = 1;
    for (const a of [0, 60, 120]) { c.beginPath(); c.ellipse(x, y, h * .44, h * .16, a * Math.PI / 180, 0, 7); c.stroke(); }
    ball(c, x, y, 3.2, INK);
  } else if (V === 2) {   // electron cloud as dots, densest near the nucleus
    for (let i = 0; i < 420; i++) { const r = Math.abs(gauss()) * h * .17, t = rnd() * 7; ball(c, x + r * Math.cos(t) * 1.15, y + r * Math.sin(t), .8, INK, .55); }
    ball(c, x, y, 3, INK);
  } else {   // lavender cloud around a bright nucleus
    const g = c.createRadialGradient(x, y, 0, x, y, h * .46);
    g.addColorStop(0, 'rgba(185,166,255,.95)'); g.addColorStop(.45, 'rgba(185,166,255,.45)'); g.addColorStop(1, 'rgba(185,166,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, h * .46, 0, 7); c.fill();
    lit(c, x, y, 4.5, '#ECEDEE');
  }
}
function chemistry(cv){
  const [c, w, h] = fit(cv), A = MOL.a, xs = A.map(p => p.x), ys = A.map(p => p.y);
  const s = Math.min((w - 20) / (Math.max(...xs) - Math.min(...xs)), (h - 14) / (Math.max(...ys) - Math.min(...ys)));
  const ox = w / 2 - (Math.max(...xs) + Math.min(...xs)) / 2 * s, oy = h / 2 - (Math.max(...ys) + Math.min(...ys)) / 2 * s;
  const P = A.map(p => ({ x: ox + p.x * s, y: oy - p.y * s, e: p.e }));
  if (V === 1) {   // skeletal lines, heteroatoms as open circles, one atom marked
    c.strokeStyle = INK; c.lineWidth = 1.3; c.lineCap = 'round';
    for (const [i, j] of MOL.b) { c.beginPath(); c.moveTo(P[i].x, P[i].y); c.lineTo(P[j].x, P[j].y); c.stroke(); }
    for (const p of P) if (p.e !== 'C') { c.fillStyle = '#8CC8FF'; c.beginPath(); c.arc(p.x, p.y, 3.6, 0, 7); c.fill(); c.stroke(); }
    zoomMark(c, P[0].x, P[0].y, 9, 0, h);
  } else if (V === 2) {   // 13 balls on thin bonds
    c.strokeStyle = INK; c.lineWidth = 1.2;
    for (const [i, j] of MOL.b) { c.beginPath(); c.moveTo(P[i].x, P[i].y); c.lineTo(P[j].x, P[j].y); c.stroke(); }
    for (const p of P) ball(c, p.x, p.y, p.e === 'C' ? 4.2 : 5, INK);
  } else {   // lit ball and stick: carbon light grey, oxygen red, nitrogen blue
    c.strokeStyle = '#6A7286'; c.lineWidth = 2.2;
    for (const [i, j] of MOL.b) { c.beginPath(); c.moveTo(P[i].x, P[i].y); c.lineTo(P[j].x, P[j].y); c.stroke(); }
    for (const p of P) lit(c, p.x, p.y, p.e === 'C' ? 4.6 : 5.2, { C: '#CDD2DC', O: '#FF5A4F', N: '#8CC8FF' }[p.e]);
  }
}
function biology(cv){
  const [c, w, h] = fit(cv), s = h * .085, px = w * .29, py = h * .5;
  const B = protein(px, py, s).sort((a, b) => a.z - b.z);
  if (V === 1) {   // backbone trace, membrane, one spot marked
    const P = protein(px, py, s);   // smooth trace through the bead midpoints
    c.strokeStyle = INK; c.lineWidth = 1.1; c.lineJoin = c.lineCap = 'round'; c.beginPath(); c.moveTo(P[0].x, P[0].y);
    for (let i = 1; i < P.length - 1; i++) c.quadraticCurveTo(P[i].x, P[i].y, (P[i].x + P[i + 1].x) / 2, (P[i].y + P[i + 1].y) / 2);
    c.stroke();
    membrane(c, w * .58, w - 10, h, 2.6, 'line');
    zoomMark(c, P[60].x, P[60].y, 10, 0, h);
  } else if (V === 2) {   // ~200 small dots, depth by shade, then a membrane of dots
    for (const p of B) ball(c, p.x, p.y, 1.9, INK, .3 + .6 * Math.min(1, Math.max(0, (p.z + 5) / 10)));
    membrane(c, w * .58, w - 10, h, 2.1, 'dot');
  } else {   // space-filling protein of lit green spheres, amber membrane
    for (const p of B) lit(c, p.x, p.y, 3.3, '#8FCB72');
    membrane(c, w * .58, w - 10, h, 2.8, 'lit');
  }
}
const draw = () => { seed = 7;
  document.querySelectorAll('.art').forEach(cv => ({ 1: physics, 2: chemistry, 3: biology })[cv.dataset.l](cv)); };
addEventListener('resize', draw); draw();
})();
