// Deck control box: shared by every deck; see rail.css.
(()=>{if(document.querySelector('.u-rail'))return;const H=document.documentElement,q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const shared=location.pathname.startsWith('/share/');   // shared copies carry no links (Koosh 2026-10-21)
const old=q('nav.alldecks'),links=shared?[]:old?[...old.querySelectorAll('a')].filter(a=>{const h=a.getAttribute('href')||'';return h&&h!=='#'}).map(a=>[a.getAttribute('href'),a.textContent.trim()]):[['/decks/','Decks'],['/decks/opportunities/','Spinoffs'],['/decks/progress/','Progress']];
const R=document.createElement('div');R.className='u-rail';
R.innerHTML='<div class="u-box u-set"></div><nav class="u-box u-links" aria-label="Links">'+links.map(([h,t])=>`<a href="${h}">${t}</a>`).join('')+(shared?'':'<button type="button" class="u-sh">Share</button>')+'</nav>';
const set=R.querySelector('.u-set'),th=q('#thm'),sty=qa('.thm .sty');
if(th){th.className='u-th';set.appendChild(th)}else set.insertAdjacentHTML('beforeend','<button class="u-th" disabled aria-label="Dark or light">◐</button>');
const modes=qa('.nav .modes button').slice(0,2);qa('.nav .modes button').slice(2).forEach(b=>b.remove());if(sty.length)sty.slice(0,2).forEach(b=>set.appendChild(b));else if(modes.length){modes.forEach(b=>set.appendChild(b));qa('.nav .modes').forEach(e=>e.remove())}else set.insertAdjacentHTML('beforeend','<button class="on" disabled>1</button><button disabled>2</button>');
const IC=['<svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><rect x="1.0" y="1.0" width="14" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>','<svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><rect x="4.0" y="3.0" width="8" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>'],NM=['Large','Small'];[...set.querySelectorAll('button:not(.u-th)')].slice(0,2).forEach((b,i)=>{b.innerHTML=IC[i];b.setAttribute('aria-label',NM[i]);b.title=NM[i]});qa('body > nav.alldecks, body > .thm, #fbx, #fsb').forEach(e=>e.remove());qa('body > a').forEach(a=>{if(/all decks/i.test(a.textContent))a.remove()});
document.body.appendChild(R);// the deck's own pager (← n/N →), whatever its markup: nav.nav, div.nav, or the parent of #prev / #pv
let pager=q('nav.nav, div.nav');if(!pager){const b=q('#prev, #pv');pager=b&&b.parentElement}if(pager){pager.classList.add('nav');R.appendChild(pager)}
// decks drawn on a fixed 1600×900 stage scaled to the window (customers, tech): keep it clear of the box
const st=document.getElementById('stage');if(st&&getComputedStyle(st).position==='absolute'&&getComputedStyle(st).width==='1600px'){
 let mine='';const refit=()=>{if(innerWidth<=700||H.classList.contains('fb'))return;const W=innerWidth-160,ow=st.offsetWidth,oh=st.offsetHeight,s=Math.min(W/(ow+40),innerHeight/(oh+40));
  mine=`scale(${s}) translate(${-ow/2}px,${-oh/2}px)`;st.style.left=(W/2)+'px';st.style.transform=mine};
 // the deck refits itself on load and resize; put it back in the space left of the box each time
 new MutationObserver(()=>{if(st.style.transform!==mine)refit()}).observe(st,{attributes:true,attributeFilter:['style']});refit()}
const x=document.createElement('button');x.id='u-x';x.textContent='✕';x.setAttribute('aria-label','Exit full screen');document.body.appendChild(x);
const fs=v=>{H.classList.toggle('fb',v);try{localStorage.setItem('97a-fb','0')}catch(e){}};x.onclick=()=>fs(false);addEventListener('keydown',e=>{if(e.key==='Escape')fs(false)});
const sh=R.querySelector('.u-sh');if(sh)sh.onclick=async()=>{const deck=location.pathname.replace(/^\/decks\//,'').replace(/\/(index\.html|deck\.html)?$/,'').replace(/\/$/,'');sh.textContent='…';
 try{const r=await fetch('/decks/_share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({deck})});const j=await r.json();if(!j.ok)throw 0;
 try{await navigator.clipboard.writeText(j.url);sh.textContent='Link copied'}catch(_){prompt('Share link',j.url);sh.textContent='Share'}}catch(_){sh.textContent='Share failed'}setTimeout(()=>sh.textContent='Share',2500)};})();
