// Live app status from the problem-status DB (worker /api/status): the same rows the progress page shows.
// solved: a design round finished; solving: a round is running; queued: waiting to run; open: not started.
// Pages start from the state baked in at build (a.s, data-st) and switch to the DB as soon as it answers.
export const LABEL = { solved:'Solved', solving:'Solving', queued:'Queued', open:'' };
export const stateOf = (a, live) => live ? (live[a.pk] || 'open') : (a.s || 'open');
export async function live(){
  try { const r = await fetch('/api/status', { cache:'no-store' }); return r.ok ? await r.json() : null; } catch { return null; }
}
// tiles carry data-st (baked state) and data-pk; set class s-<state> and the label under the name
export function paint(els, map){
  if (!map) return;
  els.forEach(el => {
    const s = stateOf({ pk:el.dataset.pk }, map), lab = el.querySelector('.sl');
    el.classList.remove('s-solved', 's-solving', 's-queued', 's-open'); el.classList.add('s-' + s); el.dataset.st = s;
    if (lab) lab.textContent = LABEL[s];
  });
}
// re-read every minute so an open page follows the runs
export function follow(fn){ const go = async () => fn(await live()); go(); setInterval(go, 6e4); }
