// About page, versions 10-13 (?v=10..13): each layer is a scene of things acting on each other, never one object.
// physics   3 molecules face to face, atom by atom, each in its electron cloud (guaiacol, caffeine, water)
// chemistry many molecules of several kinds: the host with guaiacol inside, caffeine, quinic acid, water, ions around
// biology   2 proteins bound (barnase and barstar, real complex), small molecules and ions around them
// All coordinates are real (decaf GFN2 poses, barnase-barstar PDB); scenes grow left to right.
// Drawn as 3D graphs (atoms and bonds), the site's own language.
// 10 · ink graphs   11 · a light patch where the designed piece touches its partner   12 · the designed piece in white   13 · scenes turning slowly
(async () => {
const V = +(new URLSearchParams(location.search).get('v') || 1);
if (V < 10 || V > 17) return;   // 18+: art5.js
document.body.classList.add('nv', 'nv3', 'v' + V);
document.querySelector('h1').textContent = { 10:'Molecular intelligence, broken into solvable pieces.', 11:'What is K14?',
  12:'Molecular intelligence, broken into solvable pieces.', 13:'What is K14?', 14:'Molecular intelligence, broken into solvable pieces.',
  15:'What is K14?', 16:'Molecular intelligence, broken into solvable pieces.', 17:'What is K14?' }[V];
document.querySelector('.us h2').remove(); document.querySelector('.join').remove();

const COL = ['#B9A6FF', '#8CC8FF', 'linear-gradient(90deg, #8FCB72, #FFC46B)'], TXT = ['#B9A6FF', '#8CC8FF', '#A9D67F'];
const ROWS = [
  ['Atoms', ['1–300', '10²–10⁶', '10³–10⁸']],
  ['Size', ['1–20 Å', '10–200 Å', '10–10⁴ Å']],
  ['Time', ['10⁻¹⁵–10⁻¹⁰ s', '10⁻¹⁵–10⁻⁷ s', '10⁻¹²–10⁻³ s']],
];
const cell = (t, j, art) => `<div class="c" style="--cb:${COL[j]}; --c:${TXT[j]}">${art ? `<canvas class="art2" data-l="${j + 1}"></canvas>` : ''}<b>${t}</b></div>`;
document.querySelector('.grid').innerHTML = '<span class="rl">Layer</span>' + ['Physics', 'Chemistry', 'Biology'].map((t, j) => cell(t, j, true)).join('')
  + ROWS.map(([lab, v]) => `<span class="rl">${lab}</span>` + v.map((t, j) => cell(t, j)).join('')).join('');

const M = await fetch('mols.json').then(r => r.json());
let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const atoms = m => m.e.map((e, i) => ({ e, p: [m.x[3 * i], m.x[3 * i + 1], m.x[3 * i + 2]] }));
const rot = (p, a, b) => { const x1 = p[0] * Math.cos(a) + p[2] * Math.sin(a), z1 = -p[0] * Math.sin(a) + p[2] * Math.cos(a);
  return [x1, p[1] * Math.cos(b) - z1 * Math.sin(b), p[1] * Math.sin(b) + z1 * Math.cos(b)]; };
const centred = A => { const c = [0, 1, 2].map(k => A.reduce((s, a) => s + a.p[k], 0) / A.length); return A.map(a => ({ ...a, p: a.p.map((v, k) => v - c[k]) })); };
// put a molecule into a scene: random turn, then shift to (x, y) Å
const place = (A, x, y) => { const a = rnd() * 6.3, b = rnd() * 6.3; return centred(A).map(t => { const q = rot(t.p, a, b); return { ...t, p: [q[0] + x, q[1] + y, q[2]] }; }); };
const bondsOf = A => { const R = { H:.31, C:.76, N:.71, O:.66 }, out = [];
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) { const d = Math.hypot(...A[i].p.map((v, k) => v - A[j].p[k]));
    if (d < 1.2 * ((R[A[i].e] || .8) + (R[A[j].e] || .8))) out.push([i, j]); } return out; };
const WATER = [{ e:'O', p:[0, 0, 0] }, { e:'H', p:[.76, .59, 0] }, { e:'H', p:[-.76, .59, 0] }], ION = [{ e:'Na', p:[0, 0, 0] }];

// ---- the three scenes. item: atoms, how to draw (cloud: nested electron-density lines; surf: one smooth outline;
//      sticks: bonds; dot: one small circle), key: the designed piece
// ---- scenes (Å). Each item: atoms, bonds, key = the piece we design
const CD = atoms(M.cd), G = new Set(M.cd.g), guest = CD.filter((a, i) => G.has(i)), host = CD.filter((a, i) => !G.has(i));
const flat = (A, x, y, a = 0) => centred(A).map(t => { const q = rot(t.p, a, 0); return { ...t, p: [q[0] + x, q[1] + y, q[2]] }; });
const item = (A, o = {}) => ({ A, b: o.b || bondsOf(A), ...o });
function scenes(){
  seed = 11;
  // physics: guaiacol and caffeine face to face, a water on the OH: electrons of 3 molecules meeting
  const phys = [item(flat(atoms(M.phys), -3.4, .3), { key: true, cloud: true }), item(flat(atoms(M.caf), 3.9, -.4, .5), { cloud: true }),
                item(flat(WATER, -6.9, 3.2), { cloud: true })];
  // chemistry: the host holding guaiacol, in a crowd of other kinds: caffeine, quinic acid, water, sodium
  const chem = [item(host, { pair: true }), item(guest, { key: true, pair: true })];
  for (const [m, x, y] of [[M.caf, 16, 8], [M.qui, -16, -7], [M.caf, -14, 10], [M.qui, 15, -9]]) chem.push(item(place(atoms(m), x, y)));
  for (const [x, y] of [[9, 13], [-5, -13], [20, 0], [-21, 2], [3, -14], [-3, 14], [11, -15]]) chem.push(item(place(WATER, x, y)));
  for (const [x, y] of [[-10, -15], [19, 13], [-20, -12]]) chem.push(item(place(ION, x, y)));
  // biology: barstar bound to barnase (real complex), small molecules and ions around them
  const B = atoms(M.bio), idx = k => M.bio.c.map((c, i) => c === k ? i : -1).filter(i => i >= 0);
  const chain = k => { const I = idx(k), map = new Map(I.map((g, j) => [g, j]));
    return item(I.map(i => ({ ...B[i], bb: M.bio.k[i] })), { b: M.bio.b.filter(([i, j]) => map.has(i) && map.has(j)).map(([i, j]) => [map.get(i), map.get(j)]), pair: true, key: k === 1 }); };
  const bio = [chain(0), chain(1)];
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.3 + rnd() * .4, r = 33 + rnd() * 8; bio.push(item(place(atoms(k % 2 ? M.caf : M.qui), Math.cos(a) * r * 1.25, Math.sin(a) * r * .75))); }
  for (let k = 0; k < 16; k++) { const a = rnd() * 6.3, r = 30 + rnd() * 14; bio.push(item(place(k % 3 ? WATER : ION, Math.cos(a) * r * 1.3, Math.sin(a) * r * .8))); }
  const mid = k => [0, 1, 2].map(j => idx(k).reduce((t, i) => t + B[i].p[j], 0) / idx(k).length), d = mid(1).map((v, j) => v - mid(0)[j]);
  return { 1: [phys, 0, .35], 2: [chem, .3, .5], 3: [bio, Math.atan2(d[2], d[0]), .25] };
}
const SC = scenes();
const SHARE = { 1:.5, 2:.76, 3:1 };   // scene height per layer on one baseline: bigger and busier left to right
// contact atoms: where the designed piece touches its partner (version 11)
for (const [scene] of Object.values(SC)) {
  const k = scene.find(it => it.key), others = scene.filter(it => it !== k && (it.pair || it.cloud)).flatMap(it => it.A);
  k.touch = k.A.map(a => others.some(o => (a.p[0] - o.p[0]) ** 2 + (a.p[1] - o.p[1]) ** 2 + (a.p[2] - o.p[2]) ** 2 < 20));
}

function fit(cv){
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
  c.lineCap = c.lineJoin = 'round'; return [c, w, h];
}
// density field of points (px, radius px) on a 1 px grid; contour lines and optional fill
function field(P){
  const x0 = Math.floor(Math.min(...P.map(p => p.x - 2.2 * p.r))), x1 = Math.ceil(Math.max(...P.map(p => p.x + 2.2 * p.r)));
  const y0 = Math.floor(Math.min(...P.map(p => p.y - 2.2 * p.r))), y1 = Math.ceil(Math.max(...P.map(p => p.y + 2.2 * p.r)));
  const nx = x1 - x0, ny = y1 - y0, F = new Float32Array((nx + 1) * (ny + 1));
  for (const p of P) { const R = 2.2 * p.r, i0 = Math.max(0, Math.floor(p.x - R - x0)), i1 = Math.min(nx, Math.ceil(p.x + R - x0));
    const j0 = Math.max(0, Math.floor(p.y - R - y0)), j1 = Math.min(ny, Math.ceil(p.y + R - y0)), r2 = p.r * p.r;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const dx = x0 + i - p.x, dy = y0 + j - p.y; F[j * (nx + 1) + i] += Math.exp(-(dx * dx + dy * dy) / r2); } }
  return { F, x0, y0, nx, ny };
}
function contour(c, f, iso){
  const { F, x0, y0, nx } = f, at = (i, j) => F[j * (nx + 1) + i] - iso; c.beginPath();
  for (let j = 0; j < f.ny; j++) for (let i = 0; i < nx; i++) {
    const v = [at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)], q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], e = [];
    for (let k = 0; k < 4; k++) { const a = v[k], b = v[(k + 1) % 4]; if ((a > 0) !== (b > 0)) { const t = a / (a - b), A = q[k], B = q[(k + 1) % 4];
      e.push([x0 + A[0] + (B[0] - A[0]) * t, y0 + A[1] + (B[1] - A[1]) * t]); } }
    for (let k = 0; k + 1 < e.length; k += 2) { c.moveTo(...e[k]); c.lineTo(...e[k + 1]); }
  }
  c.stroke();
}
const RAD = { H:1.1, C:1.6, N:1.55, O:1.5, Na:1.8 };
function draw(cv, spin = 0){
  const L = +cv.dataset.l, [scene, a0, b] = SC[L], [c, w, h] = fit(cv), a = a0 + spin;
  const ink = [20, 22, 26], key = V === 12 ? [255, 255, 255] : ink;
  const items = scene.map(it => ({ ...it, Q: it.A.map(t => rot(t.p, a, b)) })), all = items.flatMap(it => it.Q);
  const X = all.map(q => q[0]), Y = all.map(q => q[1]), Z = all.map(q => q[2]), mg = L === 1 ? 2.6 : 1.5;
  const H = (h - 10) * SHARE[L], s = Math.min(H / (Math.max(...Y) - Math.min(...Y) + 2 * mg), (w - 14) / (Math.max(...X) - Math.min(...X) + 2 * mg));
  const cx = w / 2 - (Math.max(...X) + Math.min(...X)) / 2 * s, by = h - 5 + (Math.min(...Y) - mg) * s, z0 = Math.min(...Z), zr = Math.max(...Z) - z0 || 1;
  const P = it => it.Q.map((q, i) => ({ x: cx + q[0] * s, y: by - q[1] * s, t: (q[2] - z0) / zr, e: it.A[i].e, bb: it.A[i].bb, r: (RAD[it.A[i].e] || 1.6) * s }));
  const rgba = (col, al) => `rgba(${col.join(',')},${al})`;
  // physics: each molecule's electron cloud, nested lines
  if (L === 1) for (const it of items) if (it.cloud) { const f = field(P(it)); c.lineWidth = .8;
    for (const [iso, al] of [[.2, .22], [.55, .4], [1.1, .6]]) { c.strokeStyle = rgba(it.key ? key : ink, al); contour(c, f, iso); } }
  // version 11: a light patch where the designed piece touches its partner
  if (V === 11) { const k = items.find(it => it.key), pk = P(k).filter((p, i) => k.touch[i]);
    if (pk.length) { const f = field(pk.map(p => ({ ...p, r: p.r * 1.3 }))); const { F, x0, y0, nx, ny } = f, off = document.createElement('canvas');
      off.width = nx + 1; off.height = ny + 1; const o = off.getContext('2d'), img = o.createImageData(nx + 1, ny + 1);
      for (let i = 0; i < F.length; i++) if (F[i] > .4) img.data.set([255, 255, 255, 200], 4 * i);
      o.putImageData(img, 0, 0); c.drawImage(off, x0, y0); } }
  // bonds back to front; the protein's backbone strong, side chains faint; atoms as dots except hydrogens
  const lw = { 1:1.5, 2:1.05, 3:.55 }[L], seg = [];
  for (const it of items) { const p = P(it), col = it.key ? key : ink, crowd = !it.key && !it.pair && L > 1;
    for (const [i, j] of it.b) { const bb = p[i].bb && p[j].bb, hy = p[i].e === 'H' || p[j].e === 'H';
      seg.push([p[i], p[j], (p[i].t + p[j].t) / 2, col, (L === 3 ? (bb ? 1 : .35) : hy ? .5 : 1) * (crowd ? .6 : 1), bb ? 1.9 : 1]); }
    if (it.b.length === 0) seg.push([p[0], p[0], p[0].t, col, crowd ? .6 : 1, 1, true]); }
  seg.sort((u, v) => u[2] - v[2]);
  for (const [p, q, t, col, k, wmul, ion] of seg) {
    c.strokeStyle = c.fillStyle = rgba(col, (.3 + .7 * t) * k);
    if (ion) { c.lineWidth = 1; c.beginPath(); c.arc(p.x, p.y, Math.max(1.8, p.r * .6), 0, 7); c.stroke(); continue; }
    c.lineWidth = lw * (.7 + .6 * t) * wmul; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
  }
  if (L < 3) for (const it of items) { const col = it.key ? key : ink, crowd = !it.key && !it.pair && L > 1;
    for (const p of P(it)) { if (p.e === 'H' || it.b.length === 0) continue; c.fillStyle = rgba(col, (.35 + .65 * p.t) * (crowd ? .6 : 1));
      c.beginPath(); c.arc(p.x, p.y, (L === 1 ? 2.2 : 1.4) * (p.e === 'C' ? .8 : 1.1) * (.7 + .5 * p.t), 0, 7); c.fill(); } }
}
// ---- flat 2D (versions 14-17): no depth. 14 skeletal formulas with electron halos · 15 filled silhouettes ·
//      16 one dot per atom (more dots = more atoms) · 17 skeletal, the designed piece white on a white halo
function fillField(c, f, iso, rgb, al){
  const { F, x0, y0, nx, ny } = f, off = document.createElement('canvas'); off.width = nx + 1; off.height = ny + 1;
  const o = off.getContext('2d'), img = o.createImageData(nx + 1, ny + 1);
  for (let i = 0; i < F.length; i++) if (F[i] > iso) img.data.set([...rgb, 255 * al], 4 * i);
  o.putImageData(img, 0, 0); c.drawImage(off, x0, y0);
}
function flat2d(cv){
  const L = +cv.dataset.l, [scene, a, b] = SC[L], [c, w, h] = fit(cv), INK = [20, 22, 26], WH = [255, 255, 255];
  const items = scene.map(it => ({ ...it, Q: it.A.map(t => rot(t.p, a, b)) })), all = items.flatMap(it => it.Q);
  const X = all.map(q => q[0]), Y = all.map(q => q[1]), mg = L === 1 ? 2.6 : 1.5;
  const H = (h - 10) * SHARE[L], s = Math.min(H / (Math.max(...Y) - Math.min(...Y) + 2 * mg), (w - 14) / (Math.max(...X) - Math.min(...X) + 2 * mg));
  const cx = w / 2 - (Math.max(...X) + Math.min(...X)) / 2 * s, by = h - 5 + (Math.min(...Y) - mg) * s;
  const P = it => it.Q.map((q, i) => ({ x: cx + q[0] * s, y: by - q[1] * s, e: it.A[i].e, r: (RAD[it.A[i].e] || 1.6) * s }));
  const rgba = (col, al) => `rgba(${col.join(',')},${al})`, crowd = it => !it.key && !it.pair && L > 1;
  const tone = it => V === 17 && it.key ? WH : INK, alpha = it => it.key ? 1 : crowd(it) ? .45 : it.pair ? .75 : .8;
  // order: partners first, the designed piece on top
  const order = [...items].sort((u, v) => (u.key ? 2 : u.pair ? 1 : 0) - (v.key ? 2 : v.pair ? 1 : 0));
  for (const it of order) {
    const p = P(it), col = tone(it), al = alpha(it);
    if (V === 15 || (L === 3 && it.pair && V !== 16)) {   // silhouettes (version 15; proteins in 14 and 17)
      fillField(c, field(L === 3 && it.pair ? p.filter((q, i) => i % 2 === 0).map(q => ({ ...q, r: q.r * 1.7 })) : p), L === 3 && it.pair ? .7 : .5,
                V === 17 && it.key ? WH : INK, it.key ? .9 : crowd(it) ? .3 : .5);
      continue;
    }
    if (V === 16) { c.fillStyle = rgba(it.key ? WH : INK, it.key ? 1 : crowd(it) ? .45 : .8);   // one dot per atom
      for (const q of p) { c.beginPath(); c.arc(q.x, q.y, Math.max(.7, q.r * (q.e === 'H' ? .32 : .45)), 0, 7); c.fill(); } continue; }
    // skeletal formula: bonds as lines, O and N as small rings, electron halo behind physics molecules
    if (L === 1) fillField(c, field(p), .5, col === WH ? WH : INK, col === WH ? .55 : .12);
    if (V === 17 && it.key && L === 2) fillField(c, field(p), .5, WH, .6);
    c.strokeStyle = rgba(col, al); c.lineWidth = { 1:1.6, 2:1.1, 3:.8 }[L];
    if (!it.b.length) { c.beginPath(); c.arc(p[0].x, p[0].y, Math.max(1.8, p[0].r * .55), 0, 7); c.stroke(); continue; }
    c.beginPath(); for (const [i, j] of it.b) { if (p[i].e === 'H' || p[j].e === 'H') continue; c.moveTo(p[i].x, p[i].y); c.lineTo(p[j].x, p[j].y); } c.stroke();
    if (L < 3) for (const q of p) if (q.e === 'O' || q.e === 'N') { c.fillStyle = rgba(col, al); c.beginPath(); c.arc(q.x, q.y, L === 1 ? 2.6 : 1.7, 0, 7); c.fill(); }
  }
}
const cvs = [...document.querySelectorAll('.art2')];
if (V >= 14) { const all = () => cvs.forEach(flat2d); addEventListener('resize', all); all(); }
else if (V === 13 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const t0 = performance.now(); (function loop(t){ cvs.forEach(cv => draw(cv, (t - t0) / 1000 * .22)); requestAnimationFrame(loop); })(t0);
} else { const all = () => cvs.forEach(cv => draw(cv)); addEventListener('resize', all); all(); }
})();
