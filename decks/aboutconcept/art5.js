// About page, versions 18-21 (?v=18..21): four different ideas, flat 2D. Each layer = more things, more kinds, bigger.
// 18 · real crowd: 2 molecules touching → a liquid of 5 kinds → a piece of cell (membrane, proteins, small molecules)
// 19 · one motif nested: 2 units → a cluster of units → a structure of clusters (each layer is built from the last)
// 20 · circle packing: 2 molecules of atoms → many molecules of 4 sizes → proteins, each packed with atoms, among molecules
// 21 · interaction network: dashed lines are forces between things; their number grows with the layer
(async () => {
const V = +(new URLSearchParams(location.search).get('v') || 1);
if (V < 18 || V > 21) return;
document.body.classList.add('nv', 'nv3', 'v' + V);
document.querySelector('h1').textContent = V % 2 ? 'What is K14?' : 'Molecular intelligence, broken into solvable pieces.';
document.querySelector('.us h2').remove(); document.querySelector('.join').remove();
const COL = ['#B9A6FF', '#8CC8FF', 'linear-gradient(90deg, #8FCB72, #FFC46B)'];
const ROWS = [['Atoms', ['1–300', '10²–10⁶', '10³–10⁸']], ['Size', ['1–20 Å', '10–200 Å', '10–10⁴ Å']], ['Time', ['10⁻¹⁵–10⁻¹⁰ s', '10⁻¹⁵–10⁻⁷ s', '10⁻¹²–10⁻³ s']]];
const cell = (t, j, art) => `<div class="c" style="--cb:${COL[j]}">${art ? `<canvas class="art2" data-l="${j + 1}"></canvas>` : ''}<b>${t}</b></div>`;
document.querySelector('.grid').innerHTML = '<span class="rl">Layer</span>' + ['Physics', 'Chemistry', 'Biology'].map((t, j) => cell(t, j, true)).join('')
  + ROWS.map(([lab, v]) => `<span class="rl">${lab}</span>` + v.map((t, j) => cell(t, j)).join('')).join('');

const M = await fetch('mols.json?v=dd5edaea').then(r => r.json());
const INK = '20,22,26', WH = '255,255,255';
let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const SHARE = { 1:.55, 2:.8, 3:1 };   // drawing height per layer, one baseline: bigger left to right
function fit(cv){
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h); c.lineCap = c.lineJoin = 'round';
  const H = (h - 10) * SHARE[+cv.dataset.l];
  return { c, w, h, box: { x0: 8, x1: w - 8, y0: h - 5 - H, y1: h - 5 } };   // the area this layer may fill
}
const col = (rgb, a = 1) => `rgba(${rgb},${a})`;
const dot = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
const ring = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); };
// molecule as flat 2D: atoms (x, y in Å, centred) and bonds, turned by angle t
const flat = (m, t = 0) => { const n = m.e.length, X = [], Y = [];
  for (let i = 0; i < n; i++) { X.push(m.x[3 * i]); Y.push(m.x[3 * i + 1]); }
  const mx = X.reduce((a, b) => a + b) / n, my = Y.reduce((a, b) => a + b) / n;
  return { A: m.e.map((e, i) => { const x = X[i] - mx, y = Y[i] - my; return { e, x: x * Math.cos(t) - y * Math.sin(t), y: x * Math.sin(t) + y * Math.cos(t) }; }), b: m.b }; };
const WATER = { A: [{ e:'O', x:0, y:0 }, { e:'H', x:.76, y:.59 }, { e:'H', x:-.76, y:.59 }], b: [[0, 1], [0, 2]] };
const span = F => { const r = Math.max(...F.A.map(a => Math.hypot(a.x, a.y))); return r; };
function skeletal(c, F, ox, oy, s, rgb, a, lw){   // bonds as lines (hydrogens left out), O and N as dots
  c.strokeStyle = col(rgb, a); c.fillStyle = col(rgb, a); c.lineWidth = lw; c.beginPath();
  for (const [i, j] of F.b) { const p = F.A[i], q = F.A[j]; if (p.e === 'H' || q.e === 'H') continue; c.moveTo(ox + p.x * s, oy - p.y * s); c.lineTo(ox + q.x * s, oy - q.y * s); }
  c.stroke(); for (const p of F.A) if (p.e === 'O' || p.e === 'N') dot(c, ox + p.x * s, oy - p.y * s, lw * 1.4);
}
// scatter n discs of radius r(k) in the box without overlap (rejection sampling)
function scatter(box, list, keep = []){
  const out = [...keep];
  for (const it of list) for (let t = 0; t < 300; t++) {
    const x = box.x0 + it.r + rnd() * (box.x1 - box.x0 - 2 * it.r), y = box.y0 + it.r + rnd() * (box.y1 - box.y0 - 2 * it.r);
    if (out.every(o => Math.hypot(o.x - x, o.y - y) > o.r + it.r + 1.5)) { out.push({ ...it, x, y }); break; }
  }
  return out.slice(keep.length);
}

// ---- 18 · real crowd
function crowd(L, c, box){
  const W = box.x1 - box.x0, Hh = box.y1 - box.y0, cy = (box.y0 + box.y1) / 2, cx = (box.x0 + box.x1) / 2;
  if (L === 1) {   // guaiacol and caffeine touching; their electron halos overlap
    const g = flat(M.phys, .3), k = flat(M.caf, 1.9), s = Math.min(W / 13, Hh / 7.5);
    const pg = [cx - 2.9 * s, cy + .2 * s], pk = [cx + 3.1 * s, cy - .2 * s];
    for (const [F, p] of [[g, pg], [k, pk]]) { c.fillStyle = col(INK, .12); c.beginPath();   // one halo per molecule (union of atom discs)
      for (const a of F.A) { c.moveTo(p[0] + a.x * s + 1.9 * s, p[1] - a.y * s); c.arc(p[0] + a.x * s, p[1] - a.y * s, 1.9 * s, 0, 7); } c.fill(); }
    skeletal(c, g, ...pg, s, WH, 1, 1.6); skeletal(c, k, ...pk, s, INK, 1, 1.6);
    return;
  }
  if (L === 2) {   // a liquid: the host holding its guest, caffeine, quinic acid, water, sodium
    const s = Math.min(W, Hh) / 34, hostF = flat(M.cd), G = new Set(M.cd.g);
    const host = { A: hostF.A, b: M.cd.b.filter(([i, j]) => !G.has(i) && !G.has(j)) }, guest = { A: hostF.A, b: M.cd.b.filter(([i, j]) => G.has(i) && G.has(j)) };
    const keep = [{ x: cx, y: cy, r: span(host) * s }];
    const parts = [...Array(3)].map(() => ({ F: flat(M.caf, rnd() * 6.3), r: 5 * s })).concat([...Array(3)].map(() => ({ F: flat(M.qui, rnd() * 6.3), r: 4.6 * s })),
      [...Array(16)].map(() => ({ F: { A: WATER.A.map(a => ({ ...a })), b: WATER.b }, r: 1.6 * s, t: rnd() * 6.3 })), [...Array(6)].map(() => ({ ion: true, r: 1.4 * s })));
    skeletal(c, host, cx, cy, s, INK, 1, 1); skeletal(c, guest, cx, cy, s, WH, 1, 1.3);
    for (const p of scatter(box, parts, keep)) { if (p.ion) { c.strokeStyle = col(INK, .8); c.lineWidth = 1; ring(c, p.x, p.y, .9 * s); continue; }
      const F = p.t != null ? flat({ e: p.F.A.map(a => a.e), x: p.F.A.flatMap(a => [a.x, a.y, 0]), b: p.F.b }, p.t) : p.F;
      skeletal(c, F, p.x, p.y, s, INK, .75, .9); }
    return;
  }
  // biology: a piece of cell. Membrane across the bottom with 2 proteins in it; proteins and small molecules above
  const r = Math.max(1.6, Hh / 60), y1 = box.y1 - 4 * r, y2 = y1 - 7 * r;
  const prot = (m, k, ox, oy, sc, rgb, a) => { const F = flat(m, k); c.fillStyle = col(rgb, a);
    F.A.forEach((p, i) => { if (i % 3 === 0) dot(c, ox + p.x * sc, oy - p.y * sc, 2.3 * sc); }); };
  const B = M.bio, chain = k => ({ e: B.e.filter((e, i) => B.c[i] === k), x: B.x.filter((v, i) => B.c[Math.floor(i / 3)] === k), b: [] });
  const sc = Hh / 95;
  prot(chain(0), .4, box.x0 + W * .3, (y1 + y2) / 2 - 3 * r, sc, INK, .85);
  prot(chain(1), 2.1, box.x0 + W * .72, (y1 + y2) / 2 - 2 * r, sc * .95, INK, .85);
  c.strokeStyle = col(INK, .8); c.lineWidth = 1;
  for (let x = box.x0 + r; x < box.x1 - r; x += 2.5 * r) for (const [y, d] of [[y1, -1], [y2, 1]]) {
    if ([.3, .72].some(f => Math.abs(x - (box.x0 + W * f)) < 15 * sc)) continue;   // the proteins pass through
    ring(c, x, y, r); c.beginPath(); c.moveTo(x, y + d * r); c.lineTo(x, y + d * 3.2 * r); c.stroke(); }
  prot(chain(1), 4.2, box.x0 + W * .5, box.y0 + Hh * .26, sc * .8, WH, .95);   // the designed binder, free in the cell
  const above = { ...box, y1: y2 - 3 * r }, ks = [{ x: box.x0 + W * .5, y: box.y0 + Hh * .26, r: 17 * sc * .8 }];
  for (const p of scatter(above, [...Array(40)].map((_, k) => ({ r: k % 4 ? 1.6 : 3.2 })), ks)) {
    c.fillStyle = col(INK, .7); if (p.r > 2) { c.strokeStyle = col(INK, .7); ring(c, p.x, p.y, p.r * .8); } else dot(c, p.x, p.y, p.r * .7); }
}

// ---- 19 · one motif nested: unit = a 6-ring with a tail (a small molecule)
const UNIT = [...Array(6)].map((_, k) => [Math.cos(k * Math.PI / 3), Math.sin(k * Math.PI / 3)]).concat([[2, 0]]);
function unit(c, x, y, s, t, rgb, a){
  const P = UNIT.map(([u, v]) => [x + (u * Math.cos(t) - v * Math.sin(t)) * s, y + (u * Math.sin(t) + v * Math.cos(t)) * s]);
  c.strokeStyle = col(rgb, a); c.fillStyle = col(rgb, a); c.lineWidth = Math.max(.7, s * .22); c.beginPath();
  for (let k = 0; k < 6; k++) { c.moveTo(...P[k]); c.lineTo(...P[(k + 1) % 6]); } c.moveTo(...P[0]); c.lineTo(...P[6]); c.stroke();
  P.forEach(p => dot(c, ...p, Math.max(.8, s * .3)));
  return P[6];
}
function cluster(c, x, y, R, rgb, a, key){   // 9 units on a loose ring, 2 inside, linked tail to neighbour
  const s = R / 5.2, tails = [];
  for (let k = 0; k < 9; k++) { const t = k / 9 * 6.28; tails.push(unit(c, x + Math.cos(t) * R * .72, y + Math.sin(t) * R * .72, s, t + 1.6, k === 0 && key ? WH : rgb, a)); }
  unit(c, x - R * .18, y, s, .4, rgb, a); unit(c, x + R * .2, y + R * .1, s, 2.4, rgb, a);
  c.setLineDash([2, 2]); c.strokeStyle = col(rgb, a * .7); c.lineWidth = .8; c.beginPath();
  for (let k = 0; k < 9; k++) { const p = tails[k], q = tails[(k + 1) % 9]; c.moveTo(...p); c.lineTo(...q); } c.stroke(); c.setLineDash([]);
}
function nested(L, c, box){
  const W = box.x1 - box.x0, Hh = box.y1 - box.y0, cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
  if (L === 1) { const s = Math.min(W / 9, Hh / 4.2);
    const p = unit(c, cx - 2.6 * s, cy, s, .2, WH, 1), q = unit(c, cx + 2.4 * s, cy + .3 * s, s, Math.PI + .3, INK, 1);
    c.setLineDash([3, 3]); c.strokeStyle = col(INK, .8); c.lineWidth = 1; c.beginPath(); c.moveTo(...p); c.lineTo(...q); c.stroke(); c.setLineDash([]); return; }
  if (L === 2) { cluster(c, cx, cy, Math.min(W, Hh) * .46, INK, 1, true); return; }
  const R = Math.min(W / 6.4, Hh / 4.2), pos = [[-2.2, -.9], [-.75, -1.05], [.75, -.95], [2.2, -.8], [-1.45, .85], [0, .95], [1.45, .8]];
  pos.forEach(([u, v], k) => cluster(c, cx + u * R * 1.05, cy + v * R * 1.05, R * .95, INK, k === 5 ? 1 : .8, k === 5));
}

// ---- 20 · circle packing: circles are things; inside a circle, its parts
function packIn(c, x, y, R, n, r, rgb, a){   // n small discs inside a circle
  const list = scatter({ x0: x - R, x1: x + R, y0: y - R, y1: y + R }, [...Array(n * 3)].map(() => ({ r })))
    .filter(p => Math.hypot(p.x - x, p.y - y) < R - r).slice(0, n);
  c.fillStyle = col(rgb, a); list.forEach(p => dot(c, p.x, p.y, r * .8));
}
function packing(L, c, box){
  const W = box.x1 - box.x0, Hh = box.y1 - box.y0, cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
  c.lineWidth = 1.1;
  if (L === 1) { const R = Math.min(W / 4.4, Hh / 2.3);   // 2 molecules overlapping: shared electrons where they meet
    c.fillStyle = col(INK, .14); c.save(); c.beginPath(); c.arc(cx - R * .8, cy, R, 0, 7); c.clip(); dot(c, cx + R * .8, cy, R); c.restore();
    c.strokeStyle = col(WH, 1); ring(c, cx - R * .8, cy, R); c.strokeStyle = col(INK, 1); ring(c, cx + R * .8, cy, R);
    packIn(c, cx - R * .8, cy, R, 6, R * .2, WH, 1); packIn(c, cx + R * .8, cy, R, 9, R * .17, INK, 1); return; }
  if (L === 2) { const u = Math.min(W, Hh) / 20, kinds = [[3.2, 2], [2.2, 6], [1.4, 10], [.8, 24]];
    const list = scatter(box, kinds.flatMap(([r, n]) => [...Array(n)].map(() => ({ r: r * u }))));
    list.forEach((p, k) => { const key = k === 0; c.strokeStyle = col(key ? WH : INK, key ? 1 : .85); ring(c, p.x, p.y, p.r);
      if (p.r > 1.2 * u) packIn(c, p.x, p.y, p.r, Math.round(p.r / u * 3), u * .32, key ? WH : INK, key ? 1 : .7); });
    return; }
  const u = Math.min(W, Hh) / 26, big = scatter(box, [[5.4, 1], [4.6, 2], [3.6, 3]].flatMap(([r, n]) => [...Array(n)].map(() => ({ r: r * u }))));
  big.forEach((p, k) => { const key = k === 0; c.strokeStyle = col(key ? WH : INK, 1); ring(c, p.x, p.y, p.r); packIn(c, p.x, p.y, p.r, Math.round(p.r * p.r / u / u * 1.4), u * .28, key ? WH : INK, key ? 1 : .75); });
  scatter(box, [...Array(60)].map((_, k) => ({ r: (k % 5 ? .7 : 1.4) * u })), big).forEach(p => { c.strokeStyle = col(INK, .7); ring(c, p.x, p.y, p.r * .8); });
}

// ---- 21 · interaction network: things as small graphs, forces as dashed lines between near neighbours
function network(L, c, box){
  const W = box.x1 - box.x0, Hh = box.y1 - box.y0, cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
  const forces = (pts, d, rgb, a) => { c.setLineDash([2, 3]); c.strokeStyle = col(rgb, a); c.lineWidth = .8; c.beginPath();
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) if (pts[i].g !== pts[j].g && Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) < d) { c.moveTo(pts[i].x, pts[i].y); c.lineTo(pts[j].x, pts[j].y); }
    c.stroke(); c.setLineDash([]); };
  const atomsOf = (F, ox, oy, s, g) => F.A.filter(a => a.e !== 'H').map(a => ({ x: ox + a.x * s, y: oy - a.y * s, g }));
  if (L === 1) { const g = flat(M.phys, .3), k = flat(M.caf, 1.9), s = Math.min(W / 12.5, Hh / 7);
    const pg = [cx - 2.6 * s, cy], pk = [cx + 3 * s, cy];
    forces([...atomsOf(g, ...pg, s, 0), ...atomsOf(k, ...pk, s, 1)], 3.6 * s, INK, .7);
    skeletal(c, g, ...pg, s, WH, 1, 1.6); skeletal(c, k, ...pk, s, INK, 1, 1.6); return; }
  if (L === 2) { const s = Math.min(W, Hh) / 30, list = scatter(box, [...Array(12)].map((_, k) => ({ r: (k % 3 ? 3.4 : 4.4) * s, F: flat(k % 3 ? M.phys : M.caf, rnd() * 6.3) })));
    forces(list.map((p, g) => ({ ...p, g })), 11 * s, INK, .6);
    list.forEach((p, k) => skeletal(c, p.F, p.x, p.y, s, k === 0 ? WH : INK, k === 0 ? 1 : .85, 1)); return; }
  // biology: proteins as backbone traces (every residue a node), small molecules around, forces between
  const B = M.bio, s = Hh / 82, pts = [];
  const trace = (k, t, ox, oy, sc, rgb, a, g) => { const I = B.e.map((e, i) => i).filter(i => B.c[i] === k && B.k[i]).filter((_, j) => j % 3 === 1);
    const P = I.map(i => { const x = B.x[3 * i], y = B.x[3 * i + 1]; return { x: ox + (x * Math.cos(t) - y * Math.sin(t)) * sc, y: oy - (x * Math.sin(t) + y * Math.cos(t)) * sc, g }; });
    c.strokeStyle = col(rgb, a); c.lineWidth = 1; c.beginPath(); P.forEach((p, j) => j ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.stroke();
    c.fillStyle = col(rgb, a); P.forEach(p => dot(c, p.x, p.y, 1.1)); pts.push(...P); };
  trace(0, .3, cx - W * .13, cy, s, INK, .9, 0); trace(1, 2.2, cx + W * .17, cy - Hh * .05, s, WH, 1, 1);
  const small = scatter(box, [...Array(18)].map(() => ({ r: 3.2 })), [{ x: cx - W * .13, y: cy, r: 22 * s }, { x: cx + W * .17, y: cy - Hh * .05, r: 18 * s }]);
  small.forEach((p, k) => { c.fillStyle = col(INK, .8); dot(c, p.x, p.y, 1.6); pts.push({ ...p, g: 2 + k }); });
  forces(pts.filter((p, k) => k % 2 === 0 || p.g > 1), 12, INK, .45);
}

const DRAW = { 18: crowd, 19: nested, 20: packing, 21: network };
const all = () => { document.querySelectorAll('.art2').forEach(cv => { seed = 5 + +cv.dataset.l; const { c, box } = fit(cv); DRAW[V](+cv.dataset.l, c, box); }); };
addEventListener('resize', all); all();
})();
