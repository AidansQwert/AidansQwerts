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

/* ============================================================
   GALAXY ENGINE — starfield + rasi bintang DRACO (garis IAU)
   data: RA/Dec J2000, asterism IAU/Sky&Tel
   ============================================================ */
const c = $('#dust'), x = c.getContext('2d'); let W, H;

/* DRACO: [raDeg, decDeg, mag, nama] — urutan node & garis dari data IAU */
const DRACO = {
  nodes: [
    [268.382, 56.873, 3.8, 'GRUMIUM'],   // ξ — kepala
    [269.152, 51.489, 2.2, 'ELTANIN'],   // γ — mata naga (paling terang)
    [262.608, 52.301, 2.8, 'RASTABAN'],  // β — mata naga
    [263.067, 55.173, 4.9, 'KUMA'],      // ν
    [288.139, 67.662, 3.1, 'ALTAIS'],    // δ
    [275.189, 71.338, 4.2, ''],          // φ
    [257.197, 65.715, 3.2, 'ALDHIBAH'],  // ζ
    [245.998, 61.514, 2.7, 'ATHEBYNE'],  // η
    [240.472, 58.565, 4.1, ''],          // θ
    [231.232, 58.966, 3.3, 'EDASICH'],   // ι
    [211.097, 64.376, 3.7, 'THUBAN'],    // α — mantan bintang kutub
    [188.371, 69.788, 3.9, ''],          // κ
    [172.851, 69.331, 4.0, 'GIAUSAR'],   // λ — ujung ekor
    [275.264, 72.733, 4.6, ''],
    [297.043, 70.268, 4.7, '']
  ],
  lines: [[0,1,2,3,0,4,5,6,7,8,9,10,11,12],[5,13],[4,14]]
};

/* proyeksi sederahkan RA/Dec → layar */
const DRA = { ra: 235, dec: 62, k: Math.cos(62 * Math.PI / 180) };
function dracoScale(){
  const s = Math.min(W / 72, H / 40);
  return (Math.min(W, H) < 768) ? s * 1.8 : s;
}
function project(node){
  const s = dracoScale();
  const cx = W * (Math.min(W,H) < 768 ? .5 : .5);
  const cy = H * (Math.min(W,H) < 768 ? .26 : .38);
  const parX = (DRA.mx || 0), parY = (DRA.my || 0) + (DRA.sy || 0);
  return [
    cx + (node[0] - DRA.ra) * DRA.k * s + parX,
    cy - (node[1] - DRA.dec) * s + parY
  ];
}

/* bintang ambient */
let STARS = [];
function makeStars(){
  const n = Math.min(W, H) < 768 ? 110 : 220;
  STARS = Array.from({length: n}, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.2 + .3,
    o: Math.random() * .5 + .12,
    tw: Math.random() * Math.PI * 2,
    sp: Math.random() * .015 + .004,
    hue: Math.random() < .12 ? (Math.random() < .5 ? '139,92,246' : '34,211,238') : '220,222,235'
  }));
}

/* meteor */
let meteors = [], nextMeteor = 4000 + Math.random() * 5000;
function spawnMeteor(){
  const fromX = Math.random() * W * .8 + W * .1;
  meteors.push({ x: fromX, y: -10, vx: (Math.random() - .5) * 3, vy: 5 + Math.random() * 4, life: 1 });
}

function drawDraco(t){
  /* garis rasi */
  x.lineJoin = 'round';
  for (const line of DRACO.lines){
    /* glow lebar tipis */
    x.beginPath();
    line.forEach((ni, i) => { const p = project(DRACO.nodes[ni]); i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); });
    x.strokeStyle = 'rgba(139,92,246,.07)';
    x.lineWidth = 5;
    x.stroke();
    /* garis utama */
    x.beginPath();
    line.forEach((ni, i) => { const p = project(DRACO.nodes[ni]); i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); });
    const shimmer = .24 + .08 * Math.sin(t / 1400);
    x.strokeStyle = 'rgba(178,168,255,' + shimmer + ')';
    x.lineWidth = 1.1;
    x.stroke();
  }
  /* bintang2 rasi */
  const showLabels = W > 700;
  x.font = '9px "JetBrains Mono", monospace';
  for (const node of DRACO.nodes){
    const p = project(node);
    if (p[0] < -60 || p[0] > W + 60 || p[1] < -60 || p[1] > H + 60) continue;
    const r = Math.max((5.4 - node[2]) * .85, 1.1);
    const tw = .75 + .25 * Math.sin(t / 700 + node[0]);
    /* halo */
    x.globalAlpha = .14 * tw;
    x.fillStyle = '#b9a8ff';
    x.beginPath(); x.arc(p[0], p[1], r * 3.2, 0, 7); x.fill();
    /* inti */
    x.globalAlpha = .95 * tw;
    x.fillStyle = '#f2f0ff';
    x.beginPath(); x.arc(p[0], p[1], r, 0, 7); x.fill();
    /* flare utk bintang terang */
    if (node[2] < 3.3){
      x.globalAlpha = .35 * tw;
      x.strokeStyle = '#cfc4ff'; x.lineWidth = .8;
      x.beginPath();
      x.moveTo(p[0] - r * 4, p[1]); x.lineTo(p[0] + r * 4, p[1]);
      x.moveTo(p[0], p[1] - r * 4); x.lineTo(p[0], p[1] + r * 4);
      x.stroke();
    }
    /* label nama */
    if (showLabels && node[3]){
      x.globalAlpha = .4;
      x.fillStyle = '#9d97b8';
      x.fillText(node[3], p[0] + 9, p[1] - 7);
    }
    x.globalAlpha = 1;
  }
}

function drawScene(t){
  x.clearRect(0, 0, W, H);
  /* ambient stars */
  for (const s of STARS){
    s.tw += s.sp;
    x.globalAlpha = s.o * (.6 + .4 * Math.sin(s.tw));
    x.fillStyle = 'rgb(' + s.hue + ')';
    x.beginPath(); x.arc(s.x, s.y, s.r, 0, 7); x.fill();
  }
  x.globalAlpha = 1;
  drawDraco(t);
  /* meteor */
  for (const m of meteors){
    const g = x.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
    g.addColorStop(0, 'rgba(230,228,255,' + (.7 * m.life) + ')');
    g.addColorStop(1, 'rgba(139,92,246,0)');
    x.strokeStyle = g; x.lineWidth = 1.4;
    x.beginPath(); x.moveTo(m.x, m.y); x.lineTo(m.x - m.vx * 14, m.y - m.vy * 14); x.stroke();
  }
}

function rs(){
  W = c.width = innerWidth; H = c.height = innerHeight;
  makeStars();
}
rs();
addEventListener('resize', () => { rs(); if (reduced) drawScene(0); });

/* parallax: kursor (desktop) + scroll */
DRA.mx = 0; DRA.my = 0; DRA.sy = 0;
if (!reduced && matchMedia('(pointer:fine)').matches){
  addEventListener('pointermove', e => {
    DRA.mx = (e.clientX / W - .5) * -14;
    DRA.my = (e.clientY / H - .5) * -10;
  }, {passive: true});
}
addEventListener('scroll', () => { DRA.sy = Math.min(scrollY * .045, H * .18); }, {passive: true});

if (!reduced){
  let last = performance.now();
  (function loop(now){
    const dt = Math.min((now - last) / 16.7, 3); last = now;
    /* update meteor */
    nextMeteor -= dt * 16.7;
    if (nextMeteor <= 0){ spawnMeteor(); nextMeteor = 8000 + Math.random() * 9000; }
    for (let i = meteors.length - 1; i >= 0; i--){
      const m = meteors[i];
      m.x += m.vx * dt; m.y += m.vy * dt; m.life -= .018 * dt;
      if (m.life <= 0 || m.y > H + 40) meteors.splice(i, 1);
    }
    drawScene(now);
    requestAnimationFrame(loop);
  })(performance.now());
} else drawScene(0);

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
  const chip = $('#copy-link'); if (!chip) return;
  const LABEL = chip.textContent;
  chip.addEventListener('click', async () => {
    const url = 'https://guns.lol/crystalsharp';
    let ok = true;
    try { await navigator.clipboard.writeText(url); }
    catch(e){
      const t = document.createElement('textarea');
      t.value = url; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { ok = document.execCommand('copy'); } catch(_){ ok = false; }
      t.remove();
    }
    chip.textContent = ok ? '✓ COPIED' : '✕ COPY FAILED';
    chip.classList.toggle('ok', ok);
    if (ok && typeof toast === 'function') toast('✓ LINK COPIED — guns.lol/crystalsharp');
    setTimeout(() => { chip.textContent = LABEL; chip.classList.remove('ok'); }, 1600);
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


/* ============================================================
   v9 — TOAST · BURGER · TO-TOP · DISCORD PRESENCE (Lanyard)
   ============================================================ */

/* ---------- toast ---------- */
function toast(msg){
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- burger / mobile menu ---------- */
(function(){
  const b = $('#burger'), l = $('#nav-links'); if (!b) return;
  function setOpen(open){
    l.classList.toggle('open', open);
    b.classList.toggle('open', open);
    b.setAttribute('aria-expanded', open);
    document.body.classList.toggle('no-scroll', open);
  }
  b.addEventListener('click', () => setOpen(!l.classList.contains('open')));
  addEventListener('scroll', () => { if (l.classList.contains('open')) setOpen(false); }, {passive:true});
  l.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    l.classList.remove('open'); b.classList.remove('open');
    b.setAttribute('aria-expanded', 'false');
  }));
})();

/* ---------- back to top ---------- */
(function(){
  const b = $('#totop'); if (!b) return;
  addEventListener('scroll', () => b.classList.toggle('show', scrollY > innerHeight * .8), {passive:true});
  b.addEventListener('click', () => scrollTo({top:0, behavior: reduced ? 'auto' : 'smooth'}));
})();

/* ---------- stack marquee: klon biar loop mulus ---------- */
(function(){
  const t = $('#sm-track'); if (t) t.innerHTML += t.innerHTML;
})();

/* ---------- cursor glow di discord card ---------- */
if (matchMedia('(pointer:fine)').matches){
  const dc = $('#dc-card');
  if (dc) dc.addEventListener('pointermove', e => {
    const r = dc.getBoundingClientRect();
    dc.style.setProperty('--gx', (e.clientX - r.left) + 'px');
    dc.style.setProperty('--gy', (e.clientY - r.top) + 'px');
  });
}

/* ============================================================
   DISCORD PRESENCE — via Lanyard (api.lanyard.rest)
   ▸ CARA PAKAI:
     1. Isi DISCORD_ID di bawah dengan user ID Discord kamu.
        (Discord → Settings → Advanced → Developer Mode ON,
         lalu klik kanan profilmu → Copy User ID)
     2. JOIN server discord Lanyard dulu (discord.gg/lanyard) —
        wajib, karena presence di-track dari server itu.
     3. Selesai. Status online/idle/dnd/offline + aktivitas
        (termasuk Spotify) auto-update tiap 30 detik.
   ============================================================ */
const DISCORD_ID = '941358133987643423';
const DISCORD_FALLBACK_HANDLE = 'crystalsharp';

(function(){
  const card = $('#dc-card');
  if (!card) return;
  if (!/^\d{15,22}$/.test(DISCORD_ID)){ card.classList.add('hidden'); return; }

  const av = $('#dc-avatar'), name = $('#dc-name'), handle = $('#dc-handle'),
        dot = $('#dc-dot'), state = $('#dc-state'), act = $('#dc-activity'),
        copyBtn = $('#dc-copy'), openBtn = $('#dc-open');

  const STATE = { online:'ONLINE', idle:'IDLE', dnd:'DO NOT DISTURB', offline:'OFFLINE' };

  function esc(s){ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  async function sync(){
    try {
      const r = await fetch('https://api.lanyard.rest/v1/users/' + DISCORD_ID);
      const j = await r.json();
      if (!j.success) throw 0;
      const d = j.data, u = d.discord_user;

      const uname = u.global_name || u.username;
      name.textContent = uname;
      handle.textContent = '@' + u.username;
      copyBtn.dataset.user = u.username;
      openBtn.href = 'https://discord.com/users/' + DISCORD_ID;

      av.src = u.avatar
        ? 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.png?size=128'
        : 'https://cdn.discordapp.com/embed/avatars/' + ((Number(u.id) >> 22) % 6) + '.png';

      const st = d.discord_status || 'offline';
      dot.className = 'dc-dot ' + st;
      state.textContent = STATE[st] || st.toUpperCase();

      let txt = '—';
      if (d.listening_to_spotify && d.spotify)
        txt = '♪ <b>' + esc(d.spotify.song) + '</b> — ' + esc(d.spotify.artist);
      else if (d.activities && d.activities.length){
        const c = d.activities.find(a => a.type === 4);
        txt = c && c.state ? esc(c.state) : esc(d.activities[0].name);
      } else if (st === 'offline') txt = 'offline — tap profile to message me';
      act.innerHTML = txt;
    } catch(e){
      dot.className = 'dc-dot offline';
      state.textContent = 'OFFLINE';
      act.textContent = 'presence unreachable right now';
    }
  }

  copyBtn.addEventListener('click', async () => {
    const u = copyBtn.dataset.user || DISCORD_FALLBACK_HANDLE;
    try { await navigator.clipboard.writeText(u); }
    catch(e){
      const t = document.createElement('textarea');
      t.value = u; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch(_){}
      t.remove();
    }
    toast('✓ COPIED — ' + u);
  });

  sync(); setInterval(sync, 30000);
})();

/* ============================================================
   v11 — SECTION DOTS · RAIL INDEX · COUNTERS · LIVE REPOS
   ============================================================ */

/* ---------- section dots + rail index ---------- */
(function(){
  const wrap = $('#dots'), railIdx = $('#rail-idx');
  const items = [...document.querySelectorAll('header.hero, section')]
    .map((el, i) => ({ el, id: el.id, num: '.' + String(i).padStart(3, '0'), label: el.id.toUpperCase() }));
  if (wrap){
    wrap.innerHTML = items.map(s =>
      `<a href="#${s.id}" data-id="${s.id}"><span>${s.num} ${s.label}</span><i></i></a>`).join('');
  }
  const dots = wrap ? [...wrap.querySelectorAll('a')] : [];
  function current(){
    let cur = items[0];
    for (const s of items){ if (scrollY >= s.el.offsetTop - 160) cur = s; }
    return cur;
  }
  function paint(){
    const cur = current();
    dots.forEach(a => a.classList.toggle('on', a.dataset.id === cur.id));
    if (railIdx) railIdx.textContent = cur.num;
  }
  paint();
  addEventListener('scroll', paint, {passive:true});
})();

/* ---------- count-up angka di facts strip ---------- */
(function(){
  const nums = [...document.querySelectorAll('.fact .n')];
  if (!nums.length) return;
  const run = el => {
    const target = Number(el.dataset.count) || 0, suffix = el.dataset.suffix || '';
    if (reduced){ el.textContent = target + suffix; return; }
    const t0 = performance.now(), dur = 1100;
    (function step(now){
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ run(e.target); io.unobserve(e.target); }
  }), {threshold:.5});
  nums.forEach(el => io.observe(el));
})();

/* ---------- repositories: live dari GitHub API + cache ---------- */
(function(){
  const grid = $('#repo-grid'); if (!grid) return;
  const KEY = 'sh_repos_v1', MAX = 6;

  const esc = s => { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; };
  const ago = iso => {
    const d = Math.floor((Date.now() - new Date(iso)) / 864e5);
    if (d <= 0) return 'TODAY';
    if (d < 30) return d + 'D AGO';
    if (d < 365) return Math.floor(d / 30) + 'MO AGO';
    return Math.floor(d / 365) + 'Y AGO';
  };

  const card = r => `
    <a class="repo" href="${esc(r.url)}" target="_blank" rel="noopener">
      <div class="rname">${esc(r.name)}<span class="ar">↗</span></div>
      <div class="rdesc">${esc(r.desc) || 'no description yet.'}</div>
      <div class="rtopics">${(r.topics || []).slice(0,3).map(t => `<span>${esc(t)}</span>`).join('')}</div>
      <div class="rmeta">
        ${r.lang ? `<span class="lang">${esc(r.lang)}</span>` : ''}
        <span>★ ${r.stars}</span><span>⑂ ${r.forks}</span><span>↻ ${ago(r.pushed)}</span>
      </div>
    </a>`;

  const render = list => { grid.innerHTML = list.map(card).join(''); };

  const SEED = [
    { name:'AetherBox', desc:'run full Linux distros natively on Android — tiny musl-static container runtime. needs root.',
      url:'https://github.com/AidansQwert/AetherBox', lang:'C', stars:'—', forks:'—', pushed:new Date().toISOString(),
      topics:['android','linux','container'] },
    { name:'AetherBox-Lite', desc:'no-root companion — Termux + proot-distro / Omarchy, same UI shape as the full app.',
      url:'https://github.com/AidansQwert/AetherBox-Lite', lang:'Shell', stars:'—', forks:'—', pushed:new Date().toISOString(),
      topics:['android','termux','proot'] },
    { name:'AidansQwerts', desc:'this website — hand-built, no frameworks, pure HTML/CSS/JS.',
      url:'https://github.com/AidansQwert/AidansQwerts', lang:'CSS', stars:'—', forks:'—', pushed:new Date().toISOString(),
      topics:['website','portfolio'] }
  ];

  const cached = (() => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(_){ return null; } })();
  if (cached && cached.list) render(cached.list);

  fetch('https://api.github.com/users/AidansQwert/repos?per_page=100&sort=pushed')
    .then(r => r.ok ? r.json() : Promise.reject(0))
    .then(j => {
      const list = j.filter(r => !r.fork).slice(0, MAX).map(r => ({
        name: r.name, desc: r.description, url: r.html_url, lang: r.language,
        stars: r.stargazers_count, forks: r.forks_count, pushed: r.pushed_at, topics: r.topics
      }));
      if (!list.length) throw 0;
      render(list);
      try { localStorage.setItem(KEY, JSON.stringify({ list, ts: Date.now() })); } catch(_){}
    })
    .catch(() => {
      if (cached && cached.list) return;
      render(SEED);
      grid.insertAdjacentHTML('beforeend',
        '<div class="repo-err">GitHub API unreachable — showing the pinned set. everything else lives at <a href="https://github.com/AidansQwert" target="_blank" rel="noopener">github.com/AidansQwert ↗</a></div>');
    });
})();

/* ===================== v12 — MOTION LAYER ===================== */
const fine = !reduced && matchMedia('(pointer:fine)').matches;

/* stagger anak grid + sweep judul section */
(function(){
  document.querySelectorAll('.facts, .tool-grid, .repo-grid, .socs').forEach(g => {
    g.classList.add('anim-stag');
    [...g.children].forEach((c, i) => c.style.setProperty('--stag', (i * 70) + 'ms'));
  });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in', 'swept');
    io.unobserve(e.target);
  }), {threshold:.18});
  document.querySelectorAll('.anim-stag, .sec-title').forEach(el => io.observe(el));

  /* repo-grid diisi ulang oleh loader API — pasang stagger lagi */
  const grid = $('#repo-grid');
  if (grid) new MutationObserver(() => {
    [...grid.children].forEach((c, i) => c.style.setProperty('--stag', (i * 70) + 'ms'));
    grid.classList.add('in');
  }).observe(grid, {childList:true});
})();

/* tilt 3d + kilau ngikut kursor */
if (fine) (function(){
  document.querySelectorAll('.dl-card, .repo, .soc, .dc-card').forEach(card => {
    card.classList.add('tilt', 'sheen');
    let raf = 0;
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        card.classList.add('live');
        card.style.setProperty('--ry', ((px - .5) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((.5 - py) * 7).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('live');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();

/* tombol magnetik */
if (fine) (function(){
  document.querySelectorAll('.btn, .rail-ico').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.transform = `translate(${(dx * 10).toFixed(1)}px, ${(dy * 8).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();

/* ripple di tombol */
if (!reduced) document.addEventListener('pointerdown', e => {
  const t = e.target.closest('.btn, .dl-card>a, .dc-actions a, .dc-actions button');
  if (!t) return;
  const r = t.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
  const s = document.createElement('span');
  s.className = 'rip';
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px`;
  t.appendChild(s);
  setTimeout(() => s.remove(), 620);
});

/* parallax lembut di hero pas scroll */
if (!reduced) (function(){
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const layers = [...hero.querySelectorAll('.quote, .hero-cta, .scrollhint')];
  let raf = 0;
  addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const y = Math.min(scrollY, innerHeight);
      layers.forEach((el, i) => { el.style.transform = `translateY(${(y * (0.05 + i * 0.03)).toFixed(1)}px)`; });
      hero.style.opacity = String(Math.max(1 - y / (innerHeight * 0.9), 0.25));
    });
  }, {passive:true});
})();

/* angka fact "pop" setelah selesai menghitung */
(function(){
  document.querySelectorAll('.fact .n').forEach(n => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(n);
      setTimeout(() => n.classList.add('done'), reduced ? 0 : 1150);
    }), {threshold:.5});
    io.observe(n);
  });
})();
