const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);

/* ---------- ANTI-COPY: blokir seleksi & menu konteks ---------- */
['copy','cut','contextmenu','selectstart'].forEach(ev =>
  document.addEventListener(ev, e => e.preventDefault())
);
document.addEventListener('dragstart', e => e.preventDefault());

/* ---------- preloader: boot sequence ---------- */
(function(){
  const loader = $('#loader'), lns = [...loader.querySelectorAll('.ln')];
  let fb = null;
  function finish(){
    clearTimeout(fb);
    loader.classList.add('done');
    document.body.classList.add('ready');
    setTimeout(() => document.querySelectorAll('.hero .glitch')
      .forEach((el,i) => setTimeout(() => el.classList.add('on'), 200 + i*260)), 350);
  }
  if (reduced){ finish(); return; }
  let i = 0;
  (function next(){
    if (i >= lns.length){ setTimeout(finish, 420); return; }
    lns[i++].classList.add('on');
    setTimeout(next, i === 1 ? 350 : 300);
  })();
  fb = setTimeout(finish, 4000);
})();

/* ---------- uptime counter (sejak Feb 10 2022) ---------- */
(function(){
  const el = $('#uptime'), t0 = new Date('2022-02-10T00:00:00+07:00');
  function tick(){
    const d = Math.floor((Date.now() - t0) / 864e5);
    el.textContent = d.toLocaleString('en-US') + ' DAYS';
  }
  tick(); setInterval(tick, 60000);
})();

/* ---------- typewriter terminal ---------- */
(function(){
  const el = $('#typer');
  const lines = [
    'uname -a → Linux aether 6.6-aether aarch64 GNU/Linux',
    'aetherbox --version → checking releases…',
    'whoami → sharp (boy ✧, not a girl)',
    'cat /etc/motd → stay sharp, stay crystal. wolf pack 🐺'
  ];
  if (reduced){ el.textContent = lines[0]; return; }
  let li = 0, ci = 0, del = false;
  (function type(){
    const s = lines[li];
    el.textContent = s.slice(0, ci);
    if (!del){
      ci++;
      if (ci > s.length){ del = true; return setTimeout(type, 2400); }
      return setTimeout(type, 26 + Math.random()*40);
    } else {
      ci -= 3;
      if (ci <= 0){ ci = 0; del = false; li = (li+1) % lines.length; }
      return setTimeout(type, 12);
    }
  })();
})();

/* ---------- ticker: klon 2x biar loop mulus ---------- */
(function(){
  const t = $('#ticker-track');
  t.innerHTML += t.innerHTML;
})();

/* ---------- dust particles (lebih sedikit di HP) ---------- */
const c = $('#dust'), x = c.getContext('2d'); let W, H, P = [];
function rs(){
  W = c.width = innerWidth; H = c.height = innerHeight;
  const isMobile = Math.min(W, H) < 768;
  const n = isMobile ? 30 : Math.max(35, Math.min(90, Math.round(W*H/22000)));
  P = Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.3+.4,
    vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,o:Math.random()*.45+.1,
    tw:Math.random()*Math.PI*2}));
}
rs(); addEventListener('resize', () => { rs(); if (reduced) drawStatic(); });
function drawStatic(){
  x.clearRect(0,0,W,H); x.globalAlpha = 1;
  for(const p of P){ x.globalAlpha = p.o; x.fillStyle = '#cfcfd8';
    x.beginPath(); x.arc(p.x,p.y,p.r,0,7); x.fill(); }
  x.globalAlpha = 1;
}
if (!reduced){
  (function loop(){
    x.clearRect(0,0,W,H);
    for(const p of P){
      p.x += p.vx; p.y += p.vy; p.tw += .02;
      if(p.x<-4)p.x=W+4; if(p.x>W+4)p.x=-4; if(p.y<-4)p.y=H+4; if(p.y>H+4)p.y=-4;
      x.globalAlpha = p.o*(0.7+0.3*Math.sin(p.tw));
      x.fillStyle = '#cfcfd8'; x.beginPath(); x.arc(p.x,p.y,p.r,0,7); x.fill();
    }
    x.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();
} else drawStatic();

/* ---------- GLITCH ENGINE: burst random tiap 2,5–5 detik ---------- */
(function(){
  if (reduced) return;
  const targets = () => [...document.querySelectorAll('.glitch')];
  function burst(){
    const els = targets();
    if (!els.length) return;
    const el = els[Math.floor(Math.random()*els.length)];
    if (!el.classList.contains('on')){
      el.classList.add('on');
      setTimeout(() => el.classList.remove('on'), 450);
    }
    setTimeout(burst, 2500 + Math.random()*2500);
  }
  setTimeout(burst, 3000);
})();

/* ---------- spotlight kursor (desktop saja) ---------- */
if (!reduced && matchMedia('(pointer:fine)').matches){
  let raf = null;
  addEventListener('pointermove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty('--mx', e.clientX + 'px');
      document.documentElement.style.setProperty('--my', e.clientY + 'px');
      raf = null;
    });
  }, {passive:true});
}

/* ---------- scroll progress + nav state + active link ---------- */
const prog = $('#progress'), nav = $('#nav'), pctEl = $('#pct');
const secs = [...document.querySelectorAll('section, header.hero')];
const links = [...document.querySelectorAll('nav .links a')];
addEventListener('scroll', () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? Math.round(h.scrollTop / max * 100) : 0;
  prog.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  nav.classList.toggle('scrolled', scrollY > 40);
  let cur = 'home';
  for (const s of secs){ if (scrollY >= s.offsetTop - 140) cur = s.id; }
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}, {passive:true});

/* ---------- glitch reveal lama (.gl) pas masuk viewport ---------- */
const gio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('fx'); gio.unobserve(e.target); }
}), {threshold:.4});
document.querySelectorAll('.gl').forEach(el => gio.observe(el));

/* ---------- scroll reveal umum + fallback anti-elemen-hilang ---------- */
const rio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add('in'); rio.unobserve(e.target); }
}), {threshold:.08, rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('[data-rv]').forEach(el => rio.observe(el));
setTimeout(() => document.querySelectorAll('[data-rv]:not(.in), .sec-label:not(.in)')
  .forEach(el => el.classList.add('in')), 3000);

/* ---------- magnetic buttons (desktop saja) ---------- */
if (!reduced && matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px, ${(e.clientY-r.top-r.height/2)*.2}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ---------- tilt halus di download cards (desktop saja) ---------- */
if (!reduced && matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.dl-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - .5) * -5;
      const ry = ((e.clientX - r.left) / r.width - .5) * 5;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ---------- auto-update versi dari GitHub API + cache ---------- */
async function syncRelease(repo, verEl, dateEl, btnEl, stEl){
  const key = 'ab_rel_' + repo;
  const apply = (d, cached) => {
    if (d.tag){ verEl.textContent = 'v' + d.tag.replace(/^v/i,''); }
    if (d.date){ dateEl.textContent = new Date(d.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
    if (d.apk){ btnEl.href = d.apk; }
    else if (d.url){ btnEl.href = d.url; }
    stEl.textContent = cached ? 'CACHED' : 'LIVE';
    stEl.classList.toggle('cached', cached);
    stEl.classList.toggle('live', !cached);
  };
  try {
    const r = await fetch(`https://api.github.com/repos/AidansQwert/${repo}/releases/latest`);
    if (!r.ok) throw 0;
    const j = await r.json();
    const apk = (j.assets || []).find(a => /\.apk$/i.test(a.name));
    const data = {
      tag: j.tag_name || '',
      date: j.published_at || '',
      apk: apk ? apk.browser_download_url : '',
      url: j.html_url || ''
    };
    try { localStorage.setItem(key, JSON.stringify({...data, ts: Date.now()})); } catch(_){}
    apply(data, false);
  } catch(e) {
    try {
      const old = JSON.parse(localStorage.getItem(key) || 'null');
      if (old) apply(old, true);
      else { stEl.textContent = 'OFFLINE'; stEl.classList.add('cached'); }
    } catch(_){ stEl.textContent = 'OFFLINE'; stEl.classList.add('cached'); }
  }
}
syncRelease('AetherBox',     $('#ver-root'), $('#date-root'), $('#dl-root'), $('#st-root'));
syncRelease('AetherBox-Lite',$('#ver-lite'), $('#date-lite'), $('#dl-lite'), $('#st-lite'));

/* ---------- copy guns.lol link (tetap jalan walau anti-copy aktif) ---------- */
(function(){
  const chip = $('#copy-link');
  chip.addEventListener('click', async () => {
    const url = 'https://guns.lol/crystalsharp';
    try { await navigator.clipboard.writeText(url); }
    catch(e){
      const t = document.createElement('textarea');
      t.value = url; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch(_){}
      t.remove();
    }
    chip.textContent = '✓ COPIED'; chip.classList.add('ok');
    setTimeout(() => { chip.textContent = '⧉ COPY GUNS.LOL LINK'; chip.classList.remove('ok'); }, 1600);
  });
})();

/* ---------- cursor glow di cards & bio (desktop saja) ---------- */
if (matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.dl-card,.bio').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  });
}

/* ---------- tahun footer ---------- */
$('#yr').textContent = new Date().getFullYear();
