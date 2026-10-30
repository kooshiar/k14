// About page, versions 7-9 (?v=7|8|9): layout of version 4, one column per layer, numbers as ranges.
// Pictures are real 3D graphs (atoms and bonds, mols.json from build_mols.py), the same language growing left to right:
// physics = guaiacol (17 atoms) in its electron cloud, chemistry = that molecule inside beta-cyclodextrin (164),
// biology = barnase with barstar bound (1,594 heavy atoms).
// 7 · still graphs, depth by shade   8 · the designed part dark, the rest light   9 · graphs turning slowly
(async () => {
const V = +(new URLSearchParams(location.search).get('v') || 1);
if (V < 7 || V > 9) return;   // 10+: art4.js
document.body.classList.add('nv', 'nv3', 'v' + V);
document.querySelector('h1').textContent = 'Khayyam split the cubic. We split the molecule.';
document.querySelector('.us h2').remove(); document.querySelector('.join').remove();

const COL = ['#B9A6FF', '#8CC8FF', 'linear-gradient(90deg, #8FCB72, #FFC46B)'];
// what each layer's models handle today. Physics: DFT; chemistry: machine-learned and classical force fields;
// biology: all-atom and coarse-grained protein and cell models
const ROWS = [
  ['Atoms', ['1–300', '10²–10⁶', '10³–10⁸']],
  ['Size', ['1–20 Å', '10–200 Å', '10–10⁴ Å']],
  ['Time', ['10⁻¹⁵–10⁻¹⁰ s', '10⁻¹⁵–10⁻⁷ s', '10⁻¹²–10⁻³ s']],
];
const cell = (t, j, art) => `<div class="c" style="--cb:${COL[j]}">${art ? `<canvas class="art2" data-l="${j + 1}"></canvas>` : ''}<b>${t}</b></div>`;
document.querySelector('.grid').innerHTML = '<span class="rl">Layer</span>' + ['Physics', 'Chemistry', 'Biology'].map((t, j) => cell(t, j, true)).join('')
  + ROWS.map(([lab, v]) => `<span class="rl">${lab}</span>` + v.map((t, j) => cell(t, j)).join('')).join('');

const M = await fetch('mols.json?v=dd5edaea').then(r => r.json());
const MOL = { 1: M.phys, 2: M.chem, 3: M.bio };
// dark (designed) part per layer for version 8: the molecule, the molecule in its host, the barstar chain
const HI = { 1: () => true, 2: i => M.chem.g.includes(i), 3: i => M.bio.c[i] === 1 };
const SHARE = { 1:.46, 2:.74, 3:1 };   // picture height per layer, all on one baseline
const RAD = { H:1.1, C:1.6, N:1.55, O:1.5, S:1.8 };   // reach of each atom's electrons for the cloud outline, Å

function fit(cv){
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
  c.lineCap = c.lineJoin = 'round'; return [c, w, h];
}
const turn = (x, y, z, a, b) => { const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
  return [x1, y * Math.cos(b) - z1 * Math.sin(b), y * Math.sin(b) + z1 * Math.cos(b)]; };
// electron cloud: outline of a sum of gaussians on the projected atoms (marching squares), px
function cloud(c, P, iso){
  const x0 = Math.min(...P.map(p => p.x - 2.4 * p.r)), x1 = Math.max(...P.map(p => p.x + 2.4 * p.r));
  const y0 = Math.min(...P.map(p => p.y - 2.4 * p.r)), y1 = Math.max(...P.map(p => p.y + 2.4 * p.r)), d = 1;
  const nx = Math.ceil((x1 - x0) / d), ny = Math.ceil((y1 - y0) / d), F = [];
  for (let j = 0; j <= ny; j++) { const row = []; const y = y0 + j * d;
    for (let i = 0; i <= nx; i++) { const x = x0 + i * d; let f = 0; for (const p of P) f += Math.exp(-((x - p.x) ** 2 + (y - p.y) ** 2) / (p.r * p.r)); row.push(f - iso); }
    F.push(row); }
  c.beginPath();
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v = [F[j][i], F[j][i + 1], F[j + 1][i + 1], F[j + 1][i]], q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], e = [];
    for (let k = 0; k < 4; k++) { const a = v[k], b = v[(k + 1) % 4]; if ((a > 0) !== (b > 0)) { const t = a / (a - b), A = q[k], B = q[(k + 1) % 4];
      e.push([x0 + (A[0] + (B[0] - A[0]) * t) * d, y0 + (A[1] + (B[1] - A[1]) * t) * d]); } }
    for (let k = 0; k + 1 < e.length; k += 2) { c.moveTo(...e[k]); c.lineTo(...e[k + 1]); }
  }
  c.stroke();
}
function draw(cv, a){
  const L = +cv.dataset.l, m = MOL[L], [c, w, h] = fit(cv), ink = getComputedStyle(cv).color, n = m.e.length;
  const T = []; for (let i = 0; i < n; i++) T.push(turn(m.x[3 * i], m.x[3 * i + 1], m.x[3 * i + 2], a, .42));
  const xs = T.map(p => p[0]), ys = T.map(p => p[1]), zs = T.map(p => p[2]);
  const mg = L === 1 ? 2.6 : 0;   // room for the electron cloud, Å
  const H = (h - 10) * SHARE[L], ext = Math.max((Math.max(...ys) - Math.min(...ys) + 2 * mg) / H, (Math.max(...xs) - Math.min(...xs) + 2 * mg) / (w - 16));
  const s = 1 / ext, z0 = Math.min(...zs), zr = Math.max(...zs) - z0 || 1;
  const cx = w / 2 - (Math.max(...xs) + Math.min(...xs)) / 2 * s, by = h - 5 + (Math.min(...ys) - mg) * s;
  const P = T.map(([x, y, z], i) => ({ x: cx + x * s, y: by - y * s, t: (z - z0) / zr, e: m.e[i] }));
  const hi = V === 8 ? HI[L] : () => true;
  c.strokeStyle = c.fillStyle = ink;
  if (L === 1 || (L === 2 && V === 8)) {   // electron cloud around the small molecule (and around it inside its host)
    const pts = P.filter((p, i) => L === 1 || hi(i)).map(p => ({ ...p, r: RAD[p.e] * s }));
    c.lineWidth = .8;
    for (const [iso, al] of L === 1 ? [[.18, .3], [.55, .55], [1.1, .8]] : [[.35, .5]]) { c.globalAlpha = al; cloud(c, pts, iso); }
    c.globalAlpha = 1;
  }
  const lw = { 1:1.4, 2:1.05, 3:.6 }[L];
  const B = m.b.map(([i, j]) => [i, j, (P[i].t + P[j].t) / 2]).sort((u, v) => u[2] - v[2]);
  for (const [i, j, t] of B) {
    const on = hi(i) && hi(j), bb = L === 3 && m.k[i] && m.k[j], hy = m.e[i] === 'H' || m.e[j] === 'H';
    // protein: backbone strong, side chains faint, so the folds read; hydrogens faint
    const k = L === 3 ? (bb ? 1 : .4) : hy ? .55 : 1;
    c.globalAlpha = (on ? .3 + .7 * t : .1 + .2 * t) * k; c.lineWidth = lw * (.7 + .6 * t) * (bb ? 1.9 : 1);
    c.beginPath(); c.moveTo(P[i].x, P[i].y); c.lineTo(P[j].x, P[j].y); c.stroke();
  }
  if (V !== 9) {   // atoms as dots (hydrogens left as bond ends); the protein shows only its bonds
    const nr = { 1:2.3, 2:1.5, 3:0 }[L];
    if (nr) P.forEach((p, i) => { if (p.e === 'H') return; c.globalAlpha = hi(i) ? .35 + .65 * p.t : .15;
      c.beginPath(); c.arc(p.x, p.y, nr * (p.e === 'C' ? .8 : 1.1) * (.7 + .5 * p.t), 0, 7); c.fill(); });
  }
  c.globalAlpha = 1;
}
const cvs = [...document.querySelectorAll('.art2')], A0 = { 1:.9, 2:.5, 3:.35 };
if (V === 9 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const t0 = performance.now();
  (function loop(t){ cvs.forEach(cv => draw(cv, A0[cv.dataset.l] + (t - t0) / 1000 * .25)); requestAnimationFrame(loop); })(t0);
} else {
  const all = () => cvs.forEach(cv => draw(cv, A0[cv.dataset.l]));
  addEventListener('resize', all); all();
}
})();
