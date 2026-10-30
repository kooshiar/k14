// Live app status from the problem-status DB (worker /api/status, same rows as the progress page).
// solved: a design round finished (or the first runs, baked in as st >= 2); solving: a round is running; queued: waiting; open: not started.
export const LABEL = { solved:'Solved', solving:'Solving', queued:'Queued', open:'' };
export const stateOf = (a, live = {}) => (a.st || 1) >= 2 || live[a.pk] === 'solved' ? 'solved' : live[a.pk] || 'open';
export async function live(){
  try { const r = await fetch('/api/status', { cache:'no-store' }); return r.ok ? await r.json() : {}; } catch { return {}; }
}
// tiles carry data-pk and data-st; set class s-<state> and the label under the name
export function paint(els, map){
  els.forEach(el => {
    const s = stateOf({ st:+el.dataset.st || 1, pk:el.dataset.pk }, map), lab = el.querySelector('.sl');
    el.classList.remove('s-solved', 's-solving', 's-queued', 's-open'); el.classList.add('s-' + s);
    if (lab) lab.textContent = LABEL[s];
  });
}
// re-read every minute so an open page follows the runs
export function follow(fn){ const go = async () => fn(await live()); go(); setInterval(go, 6e4); }
