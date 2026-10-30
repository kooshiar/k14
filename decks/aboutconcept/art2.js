// About page, versions 4-6 (?v=4|5|6): one-line title, more air on top, a minimal K14 panel (numbers only, a Types row),
// and line drawings that grow with the layer: physics small (2 molecules in their electron clouds), chemistry bigger
// (bonds), biology biggest (a folded protein next to a piece of cell wall).
// 4 · drawings inside the colour cells   5 · drawings on the dark panel above the cells   6 · no boxes, colour text only
(() => {
const V = +(new URLSearchParams(location.search).get('v') || 1);
if (V < 4) return;
document.body.classList.add('nv', 'v' + V);
const TITLE = { 4:'Khayyam split the cubic. We split the molecule.', 5:'Split it right, and every piece has an answer.', 6:'Solve the pieces, and the whole follows.' };
document.querySelector('h1').textContent = TITLE[V];
document.querySelector('.us h2').remove(); document.querySelector('.join').remove();

const COL = ['#B9A6FF', '#8CC8FF', '#8FCB72', '#FFC46B'], BIO = 'linear-gradient(90deg, #8FCB72, #FFC46B)';
const ROWS = [
  ['Types', ['2', '118', '20,000']],
  ['Size', ['1 Å', '10 Å', '100 Å', '1,000 Å']],
  ['Atoms', ['10', '10²', '10⁴', '10⁶']],
  ['Time', ['10⁻¹⁵ s', '10⁻¹² s', '10⁻⁹ s', '10⁻⁶ s']],
];
const cell = (txt, j, n, art) => {
  const span = n === 3 && j === 2, bg = span ? BIO : COL[j];
  return `<div class="c${span ? ' span2' : ''}" style="--c:${span ? COL[2] : COL[j]}; --cb:${bg}">${art != null ? `<canvas class="art2" data-l="${art}"></canvas>` : ''}<b>${txt}</b></div>`;
};
const strip = V === 5 ? `<span></span>${[0, 1, 2].map(j => `<canvas class="art2${j === 2 ? ' span2' : ''}" data-l="${j + 1}"></canvas>`).join('')}` : '';
document.querySelector('.grid').innerHTML = strip
  + `<span class="rl">Layer</span>` + ['Physics', 'Chemistry', 'Biology'].map((t, j) => cell(t, j, 3, V === 5 ? null : j + 1)).join('')
  + ROWS.map(([lab, v]) => `<span class="rl">${lab}</span>` + v.map((t, j) => cell(t, j, v.length)).join('')).join('');

// ---- drawings
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const PROT = (() => {   // protein: a chain that keeps its heading (smooth coils), pulled back into a ball when it strays
  const N = 220, R = 4.6, P = [[0, 0, 0]]; let d = [1, 0, 0];
  for (let i = 1; i < N; i++) {
    const p = P[i - 1], l = Math.hypot(...p), pull = l > R ? 1.4 * (l - R + .5) : 0;
    d = d.map((x, j) => 1.5 * x + .9 * gauss() - (l ? pull * p[j] / l : 0));
    const n = Math.hypot(...d); d = d.map(x => x / n); P.push(p.map((x, j) => x + .75 * d[j]));
  }
  return P;
})();
// chemistry: two fused rings, C=O, N-methyl, a side O (13 heavy atoms), Å
const MOL = (() => {
  const a = [], b = [], r = 1.4, at = (x, y, e) => (a.push({ x, y, e }), a.length - 1), rad = g => g * Math.PI / 180;
  const h1 = [...Array(6)].map((_, k) => at(r * Math.cos(rad(30 + 60 * k)), r * Math.sin(rad(30 + 60 * k)), 'C'));
  for (let k = 0; k < 6; k++) b.push([h1[k], h1[(k + 1) % 6]]);
  const cx = 2 * r * Math.cos(Math.PI / 6), h2 = [h1[0]];
  for (const g of [90, 30, 330, 270]) h2.push(at(cx + r * Math.cos(rad(g)), r * Math.sin(rad(g)), g === 30 ? 'N' : 'C'));
  h2.push(h1[5]); for (let k = 0; k < 5; k++) b.push([h2[k], h2[k + 1]]);
  const o = at(-2.1, 1.25, 'O'); b.push([h1[2], o]);
  const m = at(a[h2[2]].x + 1.45, a[h2[2]].y, 'C'); b.push([h2[2], m]);
  const o2 = at(a[h1[4]].x, a[h1[4]].y - 1.3, 'O'); b.push([h1[4], o2]);
  return { a, b };
})();
// physics: water and carbon dioxide, nuclei (Å) and how far each atom's electrons reach
const SMALL = [
  [{ x: 0, y: 0, r: 1.0, z: 2 }, { x: -.76, y: -.59, r: .62, z: 1 }, { x: .76, y: -.59, r: .62, z: 1 }],
  [{ x: 0, y: 0, r: .85, z: 2 }, { x: -1.16, y: 0, r: .95, z: 2 }, { x: 1.16, y: 0, r: .95, z: 2 }],
];

function fit(cv){
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
  c.lineCap = c.lineJoin = 'round'; return [c, w, h];
}
// electron cloud outline: one level of a sum of gaussians (marching squares)
function cloud(c, A, s, ox, oy, iso = .5, step = .7){
  const f = (x, y) => A.reduce((t, p) => t + Math.exp(-((x - p.x) ** 2 + (y - p.y) ** 2) / (p.r * p.r)), 0);
  const x0 = Math.min(...A.map(p => p.x - 2.6 * p.r)), x1 = Math.max(...A.map(p => p.x + 2.6 * p.r));
  const y0 = Math.min(...A.map(p => p.y - 2.6 * p.r)), y1 = Math.max(...A.map(p => p.y + 2.6 * p.r));
  const d = step / s, nx = Math.ceil((x1 - x0) / d), ny = Math.ceil((y1 - y0) / d), F = [];
  for (let j = 0; j <= ny; j++) { F.push([]); for (let i = 0; i <= nx; i++) F[j].push(f(x0 + i * d, y0 + j * d) - iso); }
  const P = (i, j) => [ox + (x0 + i * d) * s, oy - (y0 + j * d) * s], lerp = (a, b, va, vb) => { const t = va / (va - vb); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; };
  c.beginPath();
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v = [F[j][i], F[j][i + 1], F[j + 1][i + 1], F[j + 1][i]], q = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], e = [];
    for (let k = 0; k < 4; k++) { const a = v[k], b = v[(k + 1) % 4]; if ((a > 0) !== (b > 0)) e.push(lerp(q[k], q[(k + 1) % 4], a, b)); }
    for (let k = 0; k + 1 < e.length; k += 2) { c.moveTo(...e[k]); c.lineTo(...e[k + 1]); }
  }
  c.stroke();
}
const dot = (c, x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
// each layer gets a height share of the canvas, all on one baseline: complexity and size grow left to right
const SHARE = { 1:.4, 2:.66, 3:1 };
function draw(cv){
  const L = +cv.dataset.l, [c, w, h] = fit(cv), ink = getComputedStyle(cv).color, base = h - 4, H = (h - 8) * SHARE[L];
  c.strokeStyle = c.fillStyle = ink; c.lineWidth = 1.1;
  if (L === 1) {   // two small molecules, bonds inside nested electron-density outlines
    const s = H / 4.4, turn = [.35, -.5];
    SMALL.forEach((A0, k) => {
      const t = turn[k], A = A0.map(p => ({ ...p, x: p.x * Math.cos(t) - p.y * Math.sin(t), y: p.x * Math.sin(t) + p.y * Math.cos(t) }));
      const ox = w / 2 + (k ? 1.55 : -1.45) * s, oy = base - H / 2 + (k ? -.7 : .55) * s;
      c.lineWidth = .9; for (const iso of [.25, .8]) { c.globalAlpha = iso < .5 ? .45 : 1; cloud(c, A, s, ox, oy, iso); } c.globalAlpha = 1;
      c.lineWidth = 1.1; c.beginPath(); A.slice(1).forEach(p => { c.moveTo(ox + A[0].x * s, oy - A[0].y * s); c.lineTo(ox + p.x * s, oy - p.y * s); }); c.stroke();
      A.forEach(p => dot(c, ox + p.x * s, oy - p.y * s, p.z > 1 ? 1.9 : 1.3));
    });
  } else if (L === 2) {   // skeletal molecule, heteroatoms as open circles
    const A = MOL.a, xs = A.map(p => p.x), ys = A.map(p => p.y), s = H / (Math.max(...ys) - Math.min(...ys) + .8);
    const ox = w / 2 - (Math.max(...xs) + Math.min(...xs)) / 2 * s, oy = base - .4 * s + Math.min(...ys) * s;
    const P = A.map(p => [ox + p.x * s, oy - p.y * s]);
    c.beginPath(); for (const [i, j] of MOL.b) { c.moveTo(...P[i]); c.lineTo(...P[j]); } c.stroke();
    A.forEach((p, i) => { if (p.e === 'C') return; c.save(); c.globalCompositeOperation = 'destination-out'; dot(c, ...P[i], 3.6); c.restore();
      c.beginPath(); c.arc(...P[i], 3, 0, 7); c.stroke(); });
  } else {   // folded protein (smooth trace) and a piece of cell wall
    const s = H / 10.4, th = .5, cs = Math.cos(th), sn = Math.sin(th), px = w * .3, py = base - H / 2;
    const P = PROT.map(([x, y, z]) => [px + (cs * x + sn * z) * s, py + y * s]);
    c.lineWidth = 1; c.beginPath(); c.moveTo(...P[0]);
    for (let i = 1; i < P.length - 1; i++) c.quadraticCurveTo(...P[i], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2);
    c.stroke();
    const x0 = w * .58, x1 = w - 10, r = Math.max(1.8, H / 32), gap = r * 6.4, R = (x1 - x0) * 1.15, cx = (x0 + x1) / 2, cy = base - H * .78 + R, a0 = Math.asin((x1 - cx) / R);
    for (let a = -a0; a <= a0 + 1e-6; a += r * 2.4 / R) {
      const ux = Math.sin(a), uy = -Math.cos(a);
      for (const [rr, d] of [[R, -1], [R - gap, 1]]) {
        const x = cx + ux * rr, y = cy + uy * rr, t = gap / 2 - r - .5;
        c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke();
        c.beginPath(); c.moveTo(x + ux * d * r, y + uy * d * r); c.lineTo(x + ux * d * (r + t), y + uy * d * (r + t)); c.stroke();
      }
    }
  }
}
const all = () => { seed = 7; document.querySelectorAll('.art2').forEach(draw); };
addEventListener('resize', all); requestAnimationFrame(all);
})();
