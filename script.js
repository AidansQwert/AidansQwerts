const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s);

/* ---------- ANTI-COPY: blokir seleksi & menu konteks ---------- */
['copy','cut','contextmenu','selectstart'].forEach(ev =>
  document.addEventListener(ev, e => {
    if (e.target.closest('input, textarea')) return; /* field tetap bisa dipakai */
    e.preventDefault();
  })
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
      .forEach((el,i) => setTimeout(() => {
        el.classList.add('on');
        setTimeout(() => el.classList.remove('on'), 480);
      }, 200 + i*260)), 350);
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
  const KEY = 'sh_repos_v3', MAX = 12;

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

  const render = list => {
    grid.innerHTML = list.length
      ? list.map(card).join('')
      : '<div class="repo-err">no repo matches that filter.</div>';
  };
  /* dipakai lagi oleh filter v20 */
  window.SHRP_REPOS = { render, list: [] };
  const publish = list => {
    window.SHRP_REPOS.list = list;
    dispatchEvent(new CustomEvent('repos:ready'));
  };

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
  if (cached && cached.list){ render(cached.list); publish(cached.list); }

  fetch('https://api.github.com/users/AidansQwert/repos?per_page=100&sort=pushed')
    .then(r => r.ok ? r.json() : Promise.reject(0))
    .then(j => {
      const list = j.filter(r => !r.fork).slice(0, MAX).map(r => ({
        name: r.name, desc: r.description, url: r.html_url, lang: r.language,
        stars: r.stargazers_count, forks: r.forks_count, pushed: r.pushed_at, topics: r.topics,
        size: r.size
      }));
      if (!list.length) throw 0;
      render(list);
      publish(list);
      try { localStorage.setItem(KEY, JSON.stringify({ list, ts: Date.now() })); } catch(_){}
    })
    .catch(() => {
      if (cached && cached.list) return;
      render(SEED);
      publish(SEED);
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

/* ============================================================
   v16 — SMOOTH MOTION: stagger reveal, magnetic button,
   spotlight kursor, dan smooth anchor scroll.
   ============================================================ */
(function(){
  if (reduced) return;

  /* stagger: tiap grid mengisi delay anaknya */
  document.querySelectorAll('.repo-grid, .dl-cards, .tool-grid, .socs, .rows, .facts').forEach(grid => {
    grid.classList.add('anim-stag');
    [...grid.children].forEach((child, i) => child.style.setProperty('--sd', (i * 70) + 'ms'));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      grid.classList.add('in');
      io.unobserve(grid);
    }), {threshold:.15});
    io.observe(grid);
  });

  /* label section ikut reveal */
  const lio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    lio.unobserve(e.target);
  }), {threshold:.4});
  document.querySelectorAll('.sec-label').forEach(el => lio.observe(el));

  /* magnetic hover untuk tombol (pointer halus saja) */
  if (matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.btn, .chip, #totop').forEach(btn => {
      btn.classList.add('mag');
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.setProperty('--mgx', (dx * 10).toFixed(1) + 'px');
        btn.style.setProperty('--mgy', (dy * 8).toFixed(1) + 'px');
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.setProperty('--mgx', '0px');
        btn.style.setProperty('--mgy', '0px');
      });
    });

    /* spotlight lembut di kartu */
    document.querySelectorAll('.dl-card, .repo, .soc, .dc-card, .bio').forEach(card => {
      card.classList.add('glow16');
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* anchor scroll dengan easing sendiri (lebih halus dari default) */
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const start = scrollY;
      const end = target.getBoundingClientRect().top + start - 70;
      const dur = Math.min(900, Math.max(450, Math.abs(end - start) * .55));
      let t0 = 0;
      requestAnimationFrame(function step(ts){
        if (!t0) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        scrollTo(0, start + (end - start) * easeInOut(p));
        if (p < 1) requestAnimationFrame(step);
      });
      history.replaceState(null, '', id);
    });
  });
})();

/* jaring pengaman: halaman selalu tampil walau loader gagal */
setTimeout(() => document.body.classList.add('loaded'), 2200);
addEventListener('load', () => document.body.classList.add('loaded'));

/* ============================================================
   v18 — FITUR BARU
   ============================================================ */
(function(){
  /* ---------- jam lokal UTC+7 ---------- */
  const nav = document.getElementById('nav');
  if (nav){
    const c = document.createElement('div');
    c.id = 'clock';
    c.innerHTML = '<span class="dot"></span>JKT <b>--:--:--</b>';
    nav.insertBefore(c, nav.querySelector('.links'));
    const b = c.querySelector('b');
    const tick = () => {
      const d = new Date(Date.now() + 7*3600*1000);
      b.textContent = d.toISOString().slice(11,19);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- aksen warna (tersimpan) ---------- */
  const ACCENTS = {
    violet:{vio:'#8b5cf6',cyn:'#22d3ee',pnk:'#f472b6'},
    ocean :{vio:'#3b82f6',cyn:'#2dd4bf',pnk:'#60a5fa'},
    ember :{vio:'#f97316',cyn:'#fbbf24',pnk:'#fb7185'},
    forest:{vio:'#22c55e',cyn:'#a3e635',pnk:'#34d399'},
    rose  :{vio:'#e879f9',cyn:'#f472b6',pnk:'#c084fc'}
  };
  const applyAccent = name => {
    const a = ACCENTS[name] || ACCENTS.violet;
    const r = document.documentElement.style;
    r.setProperty('--vio', a.vio); r.setProperty('--cyn', a.cyn); r.setProperty('--pnk', a.pnk);
    try { localStorage.setItem('shrp-accent', name); } catch(_){}
    document.querySelectorAll('.acc').forEach(el => el.classList.toggle('on', el.dataset.acc === name));
  };
  let savedAccent = 'violet';
  try { savedAccent = localStorage.getItem('shrp-accent') || 'violet'; } catch(_){}

  /* ---------- reduce motion manual ---------- */
  const setMotion = off => {
    document.body.classList.toggle('no-motion', off);
    try { localStorage.setItem('shrp-nomotion', off ? '1' : '0'); } catch(_){}
  };
  try { if (localStorage.getItem('shrp-nomotion') === '1') document.body.classList.add('no-motion'); } catch(_){}

  /* ---------- command palette ---------- */
  const go = sel => {
    const t = document.querySelector(sel);
    if (t) t.scrollIntoView({behavior: document.body.classList.contains('no-motion') ? 'auto' : 'smooth', block:'start'});
  };
  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); }
    catch(_){
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(__){}
      ta.remove();
    }
    if (typeof toast === 'function') toast('✓ ' + label);
  };

  const items = [
    {ic:'›', t:'Go — Home',        tag:'1', run:() => go('#home')},
    {ic:'›', t:'Go — About',       tag:'2', run:() => go('#about')},
    {ic:'›', t:'Go — AetherBox',   tag:'3', run:() => go('#aether')},
    {ic:'›', t:'Go — Repositories',tag:'4', run:() => go('#repos')},
    {ic:'›', t:'Go — Social',      tag:'6', run:() => go('#social')},
    {ic:'↓', t:'Download AetherBox APK', tag:'LINK', run:() => open('https://github.com/AidansQwert/AetherBox/releases/latest','_blank')},
    {ic:'↓', t:'Download AetherBox Lite APK', tag:'LINK', run:() => open('https://github.com/AidansQwert/AetherBox-Lite/releases/latest','_blank')},
    {ic:'↗', t:'GitHub — AidansQwert', tag:'LINK', run:() => open('https://github.com/AidansQwert','_blank')},
    {ic:'↗', t:'Discord — crystalsharps', tag:'LINK', run:() => open('https://discord.com/users/941358133987643423','_blank')},
    {ic:'↗', t:'guns.lol/crystalsharp', tag:'LINK', run:() => open('https://guns.lol/crystalsharp','_blank')},
    {ic:'[]', t:'Copy guns.lol link', tag:'COPY', run:() => copy('https://guns.lol/crystalsharp','LINK COPIED')},
    {ic:'[]', t:'Copy Discord username', tag:'COPY', run:() => copy('crystalsharps','COPIED — crystalsharps')},
    {ic:'[]', t:'Copy page URL', tag:'COPY', run:() => copy(location.href,'URL COPIED')},
    {ic:'↑', t:'Back to top', tag:'T', run:() => scrollTo({top:0, behavior:'smooth'})},
    {ic:'◐', t:'Toggle reduced motion', tag:'M', run:() => setMotion(!document.body.classList.contains('no-motion'))},
    {ic:'?', t:'Keyboard shortcuts', tag:'?', run:() => showHelp()},
    {ic:'>', t:'Open terminal', tag:'~', run:() => window.SHRP_TERM && window.SHRP_TERM()},
    {ic:'⇪', t:'Share this page', tag:'SHARE', run:() => window.SHRP_SHARE && window.SHRP_SHARE()},
    {ic:'›', t:'Go — Changelog', tag:'5', run:() => go('#log')},
    {ic:'›', t:'Go — Contact', tag:'7', run:() => go('#contact')},
    {ic:'☾', t:'Toggle light / dark mode', tag:'L', run:() => window.SHRP_THEME && window.SHRP_THEME(document.body.classList.contains('light') ? 'dark' : 'light')},
    {ic:'文', t:'Switch language ID / EN', tag:'I', run:() => window.SHRP_LANG && window.SHRP_LANG(document.documentElement.lang === 'id' ? 'en' : 'id')}
  ];

  const pal = document.createElement('div');
  pal.id = 'pal';
  pal.innerHTML = `<div class="pal-box">
      <input type="text" placeholder="type a command… (esc to close)" aria-label="command palette">
      <div class="pal-list"></div>
      <div class="acc-row" aria-label="accent color">
        ${Object.keys(ACCENTS).map(k => `<span class="acc" data-acc="${k}" title="${k}" style="background:linear-gradient(135deg,${ACCENTS[k].vio},${ACCENTS[k].cyn})"></span>`).join('')}
      </div>
      <div class="pal-foot"><span>↑↓ navigate</span><span>⏎ run</span><span>ESC close</span></div>
    </div>`;
  document.body.appendChild(pal);
  applyAccent(savedAccent);

  const input = pal.querySelector('input'), list = pal.querySelector('.pal-list');
  let view = items, sel = 0;

  const render = () => {
    list.innerHTML = view.length
      ? view.map((it,i) => `<div class="pal-item${i===sel?' sel':''}" data-i="${i}"><span class="ic">${it.ic}</span>${it.t}<span class="tag">${it.tag}</span></div>`).join('')
      : '<div class="pal-empty">no match — try "copy", "github", "aether"</div>';
  };
  const filter = q => {
    q = q.trim().toLowerCase();
    view = q ? items.filter(it => it.t.toLowerCase().includes(q)) : items;
    sel = 0; render();
  };
  const openPal = () => {
    pal.classList.add('open');
    requestAnimationFrame(() => pal.classList.add('show'));
    input.value = ''; filter(''); setTimeout(() => input.focus(), 40);
  };
  const closePal = () => {
    pal.classList.remove('show');
    setTimeout(() => pal.classList.remove('open'), 260);
  };
  const runSel = () => { const it = view[sel]; if (!it) return; closePal(); setTimeout(it.run, 120); };

  input.addEventListener('input', () => filter(input.value));
  list.addEventListener('click', e => {
    const el = e.target.closest('.pal-item'); if (!el) return;
    sel = +el.dataset.i; runSel();
  });
  list.addEventListener('mousemove', e => {
    const el = e.target.closest('.pal-item'); if (!el) return;
    sel = +el.dataset.i;
    list.querySelectorAll('.pal-item').forEach((n,i) => n.classList.toggle('sel', i === sel));
  });
  pal.addEventListener('click', e => { if (e.target === pal) closePal(); });
  pal.querySelectorAll('.acc').forEach(el =>
    el.addEventListener('click', () => applyAccent(el.dataset.acc)));

  /* ---------- panel shortcut ---------- */
  function showHelp(){
    if (typeof window.SHRP_HELP === 'function'){ window.SHRP_HELP(); return; }
    if (typeof toast === 'function')
      toast('SHORTCUTS — ctrl+k palette · 1-5 section · t top · m motion · / search');
  }

  /* ---------- keyboard ---------- */
  addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); openPal(); return; }
    if (pal.classList.contains('open')){
      if (e.key === 'Escape'){ closePal(); }
      else if (e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(sel+1, view.length-1); render(); }
      else if (e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(sel-1, 0); render(); }
      else if (e.key === 'Enter'){ e.preventDefault(); runSel(); }
      return;
    }
    if (typing) return;
    if (e.key === '/'){ e.preventDefault(); openPal(); return; }
    const secs = ['#home','#about','#aether','#repos','#log','#social','#contact'];
    if (/^[1-5]$/.test(e.key)) go(secs[+e.key - 1]);
    else if (e.key.toLowerCase() === 't') scrollTo({top:0, behavior:'smooth'});
    else if (e.key.toLowerCase() === 'm') setMotion(!document.body.classList.contains('no-motion'));
    else if (e.key === '?') showHelp();
  });

  /* ---------- tombol HUD ---------- */
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = '<button id="hud-pal" title="command palette (ctrl+k)">⌘K</button>' +
                  '<button id="hud-help" title="shortcuts">?</button>';
  document.body.appendChild(hud);
  hud.querySelector('#hud-pal').addEventListener('click', openPal);
  hud.querySelector('#hud-help').addEventListener('click', showHelp);
})();

/* ============================================================
   v19 — kursor custom, ring progres, statistik GitHub, easter egg
   ============================================================ */
(function(){
  const fine = matchMedia('(pointer:fine)').matches;
  const still = () => document.body.classList.contains('no-motion');

  /* ---------- kursor custom (ring lag halus) ---------- */
  if (fine && !reduced){
    const dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cur-dot'; ring.className = 'cur-ring';
    document.body.append(dot, ring);
    let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
      const hot = !!e.target.closest('a,button,.repo,.dl-card,.soc,.chip,.pal-item,.acc');
      ring.classList.toggle('hot', hot);
    }, {passive:true});
    (function loop(){
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- ring progres di back-to-top ---------- */
  const top = document.getElementById('totop');
  if (top){
    top.insertAdjacentHTML('afterbegin',
      `<svg class="ring" viewBox="0 0 60 60" aria-hidden="true">
         <defs><linearGradient id="totop-grad" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/>
         </linearGradient></defs>
         <circle class="bg" cx="30" cy="30" r="27"/>
         <circle class="fg" cx="30" cy="30" r="27" stroke-dasharray="169.6" stroke-dashoffset="169.6"/>
       </svg>`);
    const fg = top.querySelector('.fg');
    const upd = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
      fg.style.strokeDashoffset = (169.6 * (1 - p)).toFixed(1);
    };
    addEventListener('scroll', upd, {passive:true}); upd();
  }

  /* ---------- statistik GitHub ---------- */
  (async () => {
    const grid = document.getElementById('repo-grid');
    if (!grid) return;
    const wrap = document.createElement('div');
    wrap.className = 'gh-stats';
    wrap.innerHTML = [
      ['gh-repos','PUBLIC REPOS'], ['gh-stars','TOTAL STARS'],
      ['gh-forks','TOTAL FORKS'], ['gh-follow','FOLLOWERS']
    ].map(([id,l]) => `<div class="gh-stat"><b id="${id}">—</b><span>${l}</span></div>`).join('');
    grid.parentNode.insertBefore(wrap, grid);

    const put = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const paint = d => { put('gh-repos', d.repos); put('gh-follow', d.follow); put('gh-stars', d.stars); put('gh-forks', d.forks); };

    let cached = null;
    try { cached = JSON.parse(localStorage.getItem('shrp-ghstats') || 'null'); } catch(_){}
    if (cached) paint(cached);

    try {
      const [u, r] = await Promise.all([
        fetch('https://api.github.com/users/AidansQwert').then(x => x.json()),
        fetch('https://api.github.com/users/AidansQwert/repos?per_page=100').then(x => x.json())
      ]);
      if (u && typeof u.public_repos === 'number' && Array.isArray(r)){
        const data = {
          repos: u.public_repos, follow: u.followers,
          stars: r.reduce((a,b) => a + (b.stargazers_count||0), 0),
          forks: r.reduce((a,b) => a + (b.forks_count||0), 0)
        };
        paint(data);
        try { localStorage.setItem('shrp-ghstats', JSON.stringify(data)); } catch(_){}
        cached = data;
      }
    } catch(_){ /* rate limit / offline */ }

    if (!cached) wrap.remove(); /* nggak ada data → jangan tampilkan strip kosong */
  })();

  /* ---------- easter egg: konami + ketik "sharp" ---------- */
  const burst = n => {
    if (still()) return;
    let box = document.getElementById('egg');
    if (!box){ box = document.createElement('div'); box.id = 'egg'; document.body.appendChild(box); }
    for (let i = 0; i < n; i++){
      const p = document.createElement('i');
      p.className = 'egg-p';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.top = '-10px';
      p.style.setProperty('--ex', (Math.random() * 120 - 60) + 'px');
      p.style.animationDuration = (2.4 + Math.random() * 2.6) + 's';
      p.style.animationDelay = (Math.random() * 1.2) + 's';
      box.appendChild(p);
      setTimeout(() => p.remove(), 7000);
    }
  };
  const KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';
  let keys = [], word = '';
  addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    keys.push(e.key); keys = keys.slice(-10);
    if (keys.join(',') === KONAMI){
      document.body.classList.toggle('rainbow');
      burst(160);
      if (typeof toast === 'function') toast('★ KONAMI — wolf pack mode ' + (document.body.classList.contains('rainbow') ? 'ON' : 'OFF'));
      keys = [];
    }
    if (/^[a-z]$/i.test(e.key)){
      word = (word + e.key.toLowerCase()).slice(-5);
      if (word === 'sharp'){ burst(70); if (typeof toast === 'function') toast('✧ sharp as crystal, soft as linux'); word = ''; }
    }
  });
})();

/* ============================================================
   v20 — terminal interaktif, filter repo, panel shortcut,
   copy snippet, share, PWA offline
   ============================================================ */
(function(){
  const say = m => { if (typeof toast === 'function') toast(m); };
  const smooth = () => document.body.classList.contains('no-motion') ? 'auto' : 'smooth';
  const copyText = async text => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch(_){
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch(__){}
      ta.remove();
      return ok;
    }
  };

  /* ---------- copy di blok snippet ---------- */
  document.querySelectorAll('.snip').forEach(box => {
    const btn = box.querySelector('.snip-copy'), code = box.querySelector('code');
    if (!btn || !code) return;
    btn.addEventListener('click', async () => {
      const ok = await copyText(code.textContent.trim());
      btn.textContent = ok ? '✓ COPIED' : '✕ FAILED';
      btn.classList.toggle('ok', ok);
      setTimeout(() => { btn.textContent = '⧉ COPY'; btn.classList.remove('ok'); }, 1500);
    });
  });

  /* ---------- filter + sort repositories ---------- */
  (function(){
    const grid = document.getElementById('repo-grid');
    if (!grid) return;
    const bar = document.createElement('div');
    bar.className = 'repo-bar';
    bar.innerHTML = `
      <input type="search" id="repo-q" placeholder="search repos…" aria-label="search repositories">
      <div class="repo-langs" id="repo-langs"></div>
      <div class="repo-sort" id="repo-sort">
        <button data-s="pushed" class="on">RECENT</button>
        <button data-s="stars">STARS</button>
        <button data-s="name">A–Z</button>
      </div>`;
    grid.parentNode.insertBefore(bar, grid);

    const langBar = document.createElement('div');
    langBar.className = 'lang-bar';
    grid.parentNode.insertBefore(langBar, grid);

    const COLORS = {JavaScript:'#f1e05a',TypeScript:'#3178c6',Python:'#3572a5',C:'#555555','C++':'#f34b7d',
      Shell:'#89e051',HTML:'#e34c26',CSS:'#563d7c',Java:'#b07219',Kotlin:'#a97bff',Rust:'#dea584',Go:'#00add8',
      Dart:'#00b4ab',Makefile:'#427819',Vue:'#41b883',Ruby:'#701516'};
    const colorOf = l => COLORS[l] || '#8b5cf6';

    let query = '', lang = '', sort = 'pushed';

    const apply = () => {
      const all = (window.SHRP_REPOS && window.SHRP_REPOS.list) || [];
      let list = all.filter(r => {
        const hay = (r.name + ' ' + (r.desc || '') + ' ' + (r.topics || []).join(' ')).toLowerCase();
        return (!query || hay.includes(query)) && (!lang || r.lang === lang);
      });
      list = list.slice().sort((a, b) =>
        sort === 'name'  ? a.name.localeCompare(b.name) :
        sort === 'stars' ? (Number(b.stars) || 0) - (Number(a.stars) || 0) :
                           new Date(b.pushed) - new Date(a.pushed));
      window.SHRP_REPOS.render(list);
    };

    const paintLangs = () => {
      const all = (window.SHRP_REPOS && window.SHRP_REPOS.list) || [];
      const count = {};
      all.forEach(r => { if (r.lang) count[r.lang] = (count[r.lang] || 0) + 1; });
      const langs = Object.entries(count).sort((a, b) => b[1] - a[1]);
      const total = langs.reduce((a, b) => a + b[1], 0) || 1;

      document.getElementById('repo-langs').innerHTML =
        `<button data-l="" class="on">ALL</button>` +
        langs.map(([l]) => `<button data-l="${l}">${l.toUpperCase()}</button>`).join('');
      bar.querySelectorAll('#repo-langs button').forEach(b =>
        b.addEventListener('click', () => {
          lang = b.dataset.l;
          bar.querySelectorAll('#repo-langs button').forEach(x => x.classList.toggle('on', x === b));
          apply();
        }));

      langBar.innerHTML = langs.length ? `
        <div class="lb-track">${langs.map(([l, n]) =>
          `<i style="width:${(n / total * 100).toFixed(1)}%;background:${colorOf(l)}" title="${l}"></i>`).join('')}</div>
        <div class="lb-legend">${langs.map(([l, n]) =>
          `<span><b style="background:${colorOf(l)}"></b>${l} <em>${Math.round(n / total * 100)}%</em></span>`).join('')}</div>` : '';
    };

    bar.querySelector('#repo-q').addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); apply(); });
    bar.querySelectorAll('#repo-sort button').forEach(b =>
      b.addEventListener('click', () => {
        sort = b.dataset.s;
        bar.querySelectorAll('#repo-sort button').forEach(x => x.classList.toggle('on', x === b));
        apply();
      }));

    addEventListener('repos:ready', () => { paintLangs(); apply(); });
    if (window.SHRP_REPOS && window.SHRP_REPOS.list.length){ paintLangs(); apply(); }
  })();

  /* ---------- panel shortcut (menggantikan toast) ---------- */
  const SHORTCUTS = [
    ['ctrl + k', 'command palette'], ['/', 'command palette'], ['~', 'terminal interaktif'],
    ['1 … 5', 'loncat ke section'], ['t', 'kembali ke atas'], ['m', 'reduce motion on/off'],
    ['?', 'panel ini'], ['esc', 'tutup overlay'], ['l', 'light / dark mode'],
  ['i', 'bahasa ID / EN'], ['konami', 'wolf pack mode']
  ];
  const help = document.createElement('div');
  help.id = 'help';
  help.innerHTML = `<div class="help-box">
      <div class="help-top">KEYBOARD SHORTCUTS<button class="help-x" type="button" aria-label="close">✕</button></div>
      <div class="help-grid">${SHORTCUTS.map(([k, d]) =>
        `<div class="help-row"><kbd>${k}</kbd><span>${d}</span></div>`).join('')}</div>
    </div>`;
  document.body.appendChild(help);
  const openHelp = () => help.classList.add('open');
  const closeHelp = () => help.classList.remove('open');
  help.addEventListener('click', e => { if (e.target === help || e.target.closest('.help-x')) closeHelp(); });
  window.SHRP_HELP = openHelp;

  /* ---------- terminal interaktif ---------- */
  const term = document.createElement('div');
  term.id = 'term20';
  term.innerHTML = `<div class="t-box">
      <div class="t-top"><span class="t-dots"><i></i><i></i><i></i></span>sharp@aether: ~<button class="t-x" type="button" aria-label="close">✕</button></div>
      <div class="t-out" id="t-out"></div>
      <div class="t-in"><span class="t-ps1">sharp@aether:~$</span><input id="t-cmd" autocomplete="off" spellcheck="false" aria-label="terminal input"></div>
    </div>`;
  document.body.appendChild(term);
  const out = term.querySelector('#t-out'), cmdEl = term.querySelector('#t-cmd');

  const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  const print = (html, cls) => {
    const ln = document.createElement('div');
    ln.className = 't-ln' + (cls ? ' ' + cls : '');
    ln.innerHTML = html;
    out.appendChild(ln);
    out.scrollTop = out.scrollHeight;
  };

  const LINKS = {
    github:'https://github.com/AidansQwert',
    aetherbox:'https://github.com/AidansQwert/AetherBox',
    lite:'https://github.com/AidansQwert/AetherBox-Lite',
    discord:'https://discord.com/users/941358133987643423',
    guns:'https://guns.lol/crystalsharp'
  };
  const SECTIONS = ['home','about','aether','repos','log','social','contact'];

  const neofetch = () => {
    const days = Math.floor((Date.now() - new Date('2022-02-10T00:00:00+07:00')) / 864e5);
    const rows = [
      ['OS', 'Debian 13 (Trixie) · XFCE'],
      ['HOST', 'aether — android + droidspaces'],
      ['KERNEL', '6.6-aether aarch64'],
      ['UPTIME', days.toLocaleString('en-US') + ' days'],
      ['SHELL', 'sh — web edition'],
      ['PROJECT', 'AetherBox / AetherBox Lite'],
      ['USER', 'crystalsharps (boy ✧)'],
      ['THEME', 'monochrome terminal']
    ];
    print(`<pre class="t-fetch">   ▄▄▄▄▄▄
  █ ▄▄▄  █   <b>sharp</b>@<b>aether</b>
  █ ███  █   ─────────────────────
  █ ▀▀▀  █   ${rows.map(r => `<span class="k">${r[0]}</span> ${esc(r[1])}`).join('\n              ')}
   ▀▀▀▀▀▀</pre>`);
  };

  const HELP_TXT = [
    ['help', 'daftar perintah'],
    ['neofetch', 'info sistem'],
    ['whoami', 'siapa aku'],
    ['ls', 'daftar section'],
    ['cd <section>', 'loncat ke section'],
    ['repos', 'repo teratas'],
    ['open <name>', 'buka link: ' + Object.keys(LINKS).join(' / ')],
    ['copy <name>', 'copy link ke clipboard'],
    ['accent <warna>', 'violet / ocean / ember / forest / rose'],
    ['motion', 'reduce motion on/off'],
    ['theme', 'daftar warna aksen'],
    ['mode <light|dark>', 'ganti mode terang/gelap'],
    ['lang <id|en>', 'ganti bahasa situs'],
    ['changelog', 'rilis terbaru'],
    ['date', 'waktu lokal UTC+7'],
    ['clear', 'bersihkan layar'],
    ['exit', 'tutup terminal']
  ];

  const run = raw => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = (args[0] || '').toLowerCase();
    switch ((cmd || '').toLowerCase()){
      case '': return;
      case 'help': case '?':
        HELP_TXT.forEach(([c, d]) => print(`<span class="k">${esc(c.padEnd(16, ' '))}</span>${esc(d)}`));
        return;
      case 'neofetch': case 'fetch': return neofetch();
      case 'whoami':
        print('sharp — developer &amp; linux tinkerer. boy ✧, not a girl. wolf pack 🐺'); return;
      case 'uname': print('Linux aether 6.6-aether aarch64 GNU/Linux'); return;
      case 'ls': print(SECTIONS.map(s => `<span class="k">${s}/</span>`).join('  ')); return;
      case 'cd': case 'goto':
        if (!SECTIONS.includes(arg)) return print(`cd: ${esc(arg || '')}: no such section`, 'err');
        document.getElementById(arg).scrollIntoView({behavior: smooth(), block:'start'});
        closeTerm(); return;
      case 'repos': {
        const list = (window.SHRP_REPOS && window.SHRP_REPOS.list) || [];
        if (!list.length) return print('repo list belum kebaca — coba lagi sebentar.', 'err');
        list.slice(0, 8).forEach(r => print(`<span class="k">${esc(r.name)}</span> — ${esc(r.desc || 'no description')}`));
        return;
      }
      case 'open':
        if (!LINKS[arg]) return print(`open: unknown target. try: ${Object.keys(LINKS).join(', ')}`, 'err');
        open(LINKS[arg], '_blank'); print('opening ' + esc(LINKS[arg]) + ' …'); return;
      case 'copy': {
        const url = LINKS[arg] || (arg === 'url' ? location.href : '');
        if (!url) return print(`copy: unknown target. try: ${Object.keys(LINKS).join(', ')}, url`, 'err');
        copyText(url).then(ok => print(ok ? '✓ copied — ' + esc(url) : '✕ copy failed', ok ? '' : 'err'));
        return;
      }
      case 'theme': print('accent: violet · ocean · ember · forest · rose'); return;
      case 'mode': case 'light': case 'dark': {
        const want = (cmd || '').toLowerCase() === 'mode' ? arg : (cmd || '').toLowerCase();
        if (!['light','dark'].includes(want)) return print('mode: pilih light / dark', 'err');
        if (window.SHRP_THEME) window.SHRP_THEME(want);
        print('mode → ' + esc(want)); return;
      }
      case 'lang': {
        if (!['id','en'].includes(arg)) return print('lang: pilih id / en', 'err');
        if (window.SHRP_LANG) window.SHRP_LANG(arg);
        print('lang → ' + esc(arg)); return;
      }
      case 'changelog': case 'log': {
        document.getElementById('log')?.scrollIntoView({behavior: smooth(), block:'start'});
        closeTerm(); return;
      }
      case 'contact': case 'mail': {
        document.getElementById('contact')?.scrollIntoView({behavior: smooth(), block:'start'});
        closeTerm(); return;
      }
      case 'accent': {
        const ok = ['violet','ocean','ember','forest','rose'].includes(arg);
        if (!ok) return print('accent: pilih violet / ocean / ember / forest / rose', 'err');
        const swatch = document.querySelector(`.acc[data-acc="${arg}"]`);
        if (swatch) swatch.click();
        print('accent → ' + esc(arg)); return;
      }
      case 'motion':
        document.body.classList.toggle('no-motion');
        print('reduce motion: ' + (document.body.classList.contains('no-motion') ? 'ON' : 'OFF')); return;
      case 'date':
        print(new Date(Date.now() + 7 * 3600e3).toISOString().replace('T', ' ').slice(0, 19) + ' UTC+7'); return;
      case 'sudo': print('nice try. this shell has no root — grab AetherBox instead ;)', 'err'); return;
      case 'sharp': print('✧ sharp as crystal, soft as linux'); return;
      case 'clear': out.innerHTML = ''; return;
      case 'exit': case 'q': closeTerm(); return;
      default: print(`sh: ${esc(cmd)}: command not found — type "help"`, 'err');
    }
  };

  let hist = [], hi = -1;
  const openTerm = () => {
    term.classList.add('open');
    if (!out.childElementCount){
      print('<span class="k">SHRP_ web shell</span> — type <span class="k">help</span> for commands.');
      neofetch();
    }
    setTimeout(() => cmdEl.focus(), 60);
  };
  const closeTerm = () => term.classList.remove('open');
  term.addEventListener('click', e => { if (e.target === term || e.target.closest('.t-x')) closeTerm(); });
  term.querySelector('.t-box').addEventListener('click', e => { if (!e.target.closest('.t-x')) cmdEl.focus(); });
  cmdEl.addEventListener('keydown', e => {
    if (e.key === 'Enter'){
      const v = cmdEl.value;
      print(`<span class="t-ps1">sharp@aether:~$</span> ${esc(v)}`, 'echo');
      if (v.trim()){ hist.unshift(v); hi = -1; }
      cmdEl.value = '';
      run(v);
    } else if (e.key === 'ArrowUp'){
      e.preventDefault();
      if (hi + 1 < hist.length){ hi++; cmdEl.value = hist[hi]; }
    } else if (e.key === 'ArrowDown'){
      e.preventDefault();
      hi = Math.max(hi - 1, -1);
      cmdEl.value = hi < 0 ? '' : hist[hi];
    } else if (e.key === 'Escape') closeTerm();
  });

  /* ---------- share ---------- */
  const share = async () => {
    const data = { title: 'SHARP — crystalsharps', text: 'developer & linux tinkerer · AetherBox', url: location.href };
    if (navigator.share){ try { await navigator.share(data); return; } catch(_){ return; } }
    say((await copyText(location.href)) ? '✓ LINK COPIED — ' + location.host : '✕ SHARE FAILED');
  };

  window.SHRP_TERM = openTerm;
  window.SHRP_SHARE = share;

  /* ---------- HUD tambahan ---------- */
  const hud = document.querySelector('.hud');
  if (hud){
    hud.insertAdjacentHTML('beforeend',
      '<button id="hud-term" title="terminal (~)">&gt;_</button>' +
      '<button id="hud-share" title="share page">⇪</button>');
    hud.querySelector('#hud-term').addEventListener('click', openTerm);
    hud.querySelector('#hud-share').addEventListener('click', share);
  }

  /* ---------- keyboard global ---------- */
  addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    if (e.key === 'Escape'){ closeHelp(); closeTerm(); return; }
    if (typing) return;
    if (e.key === '~' || e.key === '`'){ e.preventDefault(); openTerm(); }
  });

  /* ---------- PWA: service worker + tombol install ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:')
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

  let deferred = null;
  addEventListener('beforeinstallprompt', e => {
    e.preventDefault(); deferred = e;
    if (!hud || document.getElementById('hud-install')) return;
    hud.insertAdjacentHTML('afterbegin', '<button id="hud-install" title="install app">⇩</button>');
    hud.querySelector('#hud-install').addEventListener('click', async () => {
      if (!deferred) return;
      deferred.prompt();
      const r = await deferred.userChoice;
      if (r.outcome === 'accepted'){ say('✓ INSTALLED — SHRP_ is now an app'); document.getElementById('hud-install').remove(); }
      deferred = null;
    });
  });
})();

/* ============================================================
   v21 — THEME · I18N · CHANGELOG · GITHUB GRAPH · NOW PLAYING · CONTACT
   ============================================================ */
(function(){
  const GH_USER = 'AidansQwert';
  const say = m => { if (typeof toast === 'function') toast(m); };
  const esc = s => { const d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; };
  const ls = {
    get(k, d){ try { return localStorage.getItem(k) ?? d; } catch(_){ return d; } },
    set(k, v){ try { localStorage.setItem(k, v); } catch(_){} }
  };

  /* ---------- 1. THEME: light / dark ---------- */
  const applyTheme = mode => {
    const light = mode === 'light';
    document.body.classList.toggle('light', light);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f4f4f6' : '#08080a');
    ls.set('shrp-theme', light ? 'light' : 'dark');
    const b = document.getElementById('hud-theme');
    if (b){ b.textContent = light ? '☀' : '☾'; b.title = light ? 'light mode (klik: dark)' : 'dark mode (klik: light)'; }
  };
  const toggleTheme = () => applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
  applyTheme(ls.get('shrp-theme', 'dark'));

  /* ---------- 2. I18N: EN <-> ID ---------- */
  const DICT = [
    ['nav .links a[href="#home"]', 'BERANDA'],
    ['nav .links a[href="#about"]', 'TENTANG'],
    ['nav .links a[href="#repos"]', 'REPO'],
    ['nav .links a[href="#log"]', 'CATATAN'],
    ['nav .links a[href="#social"]', 'SOSIAL'],
    ['nav .links a[href="#contact"]', 'KONTAK'],
    ['.hero-cta .btn.solid', '↓ AMBIL AETHERBOX'],
    ['.hero-cta .btn.ghost', 'JELAJAHI →'],
    ['.hero .quote', '"<em>menjalankan linux penuh di hp</em> harusnya nggak terasa kayak sihir — tapi ya gitu deh."'],
    ['#about .bio', 'halo. aku <span class="hl">Sharp</span>. suka gonta-ganti distro, ngoprek linux di android, bikin environment sendiri, dan ngembangin <span class="hl">AetherBox</span>. bio lengkap &amp; semua link ada di <a href="https://guns.lol/crystalsharp" target="_blank" rel="noopener">guns.lol/crystalsharp</a> — satu link, semuanya. <span class="hl">wolf pack 🐺</span>, crystal &lt;3 ▊'],
    ['#about .rows .row-item:nth-child(3) .k', 'SETUP SEKARANG'],
    ['#about .rows .row-item:nth-child(4) .k', 'BERGABUNG SEJAK'],
    ['#about .facts .fact:nth-child(1) .l', 'TAHUN NGOPREK'],
    ['#about .facts .fact:nth-child(2) .l', 'APLIKASI RILIS'],
    ['#about .facts .fact:nth-child(3) .l', 'UKURAN RUNTIME'],
    ['#about .facts .fact:nth-child(4) .l', 'ARSITEKTUR'],
    ['#about .tools-head', '// PERKAKAS &amp; TEKNOLOGI'],
    ['.aether-intro', '<b>AetherBox adalah project buatanku</b> — fork resmi dari Droidspaces (oleh ravindu644; kredit tetap ke yang berhak). Runtime container mungil (&lt;400KB, dikompilasi statis dengan musl libc) yang menjalankan distro Linux penuh di atas Android dengan performa native dan tanpa dependency. <span class="root">Versi penuh butuh root (Magisk / KernelSU / APatch).</span> Nggak punya root? pakai Lite.'],
    ['.snips-head', '// PASANG CEPAT — TINGGAL SALIN'],
    ['#repos .repo-intro', 'langsung dari GitHub API — semua yang kubangun secara terbuka, diurut dari push terakhir. <a href="https://github.com/AidansQwert" target="_blank" rel="noopener">github.com/AidansQwert ↗</a>'],
    ['#gh-wrap .gh-t', '// KONTRIBUSI — 12 BULAN TERAKHIR'],
    ['#top-langs .gh-t', '// BAHASA TERBANYAK'],
    ['#log .repo-intro', 'apa yang berubah dan kapan — website &amp; aplikasi dalam satu linimasa.'],
    ['#contact .repo-intro', 'lapor bug, ide fitur, atau sekadar menyapa — kirim aja. tanpa backend: pesannya dibuka lewat aplikasi email kamu.'],
    ['#copy-link', '⧉ SALIN LINK GUNS.LOL'],
    ['#dc-copy', '⧉ SALIN USERNAME'],
    ['footer .top', '↑ KEMBALI KE ATAS']
  ];
  let lang = ls.get('shrp-lang', 'en');
  const applyLang = code => {
    lang = code === 'id' ? 'id' : 'en';
    DICT.forEach(([sel, idText]) => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.dataset.en) el.dataset.en = el.innerHTML;
        const html = lang === 'id' ? idText : el.dataset.en;
        if (el.innerHTML !== html) el.innerHTML = html;
      });
    });
    document.documentElement.lang = lang;
    ls.set('shrp-lang', lang);
    const b = document.getElementById('hud-lang');
    if (b) b.textContent = lang.toUpperCase();
    dispatchEvent(new CustomEvent('lang:change', {detail:{lang}}));
  };
  const toggleLang = () => { applyLang(lang === 'id' ? 'en' : 'id'); say(lang === 'id' ? 'BAHASA → INDONESIA' : 'LANGUAGE → ENGLISH'); };

  /* ---------- 3. CHANGELOG ---------- */
  const LOG = [
    {v:'ui v21', d:'2026-09-23', tag:'site', items:[
      'light / dark mode tersimpan + 5 aksen warna',
      'section changelog & form kontak tanpa backend',
      'grafik kontribusi GitHub + chart bahasa teratas',
      'now playing (Spotify via Lanyard) di kartu Discord',
      'toggle bahasa ID/EN, OG image, lazy-load'
    ]},
    {v:'ui v20', d:'2026-09-23', tag:'site', items:[
      'terminal interaktif (~) dengan 15+ command',
      'search / filter bahasa / sort di section repositories',
      'panel shortcut, tombol share, snippet quick install',
      'PWA: installable + offline lewat service worker'
    ]},
    {v:'v1.4.0', d:'2026-09-21', tag:'aetherbox', items:[
      'Curated Rootfs Repository + theme builder',
      'fallback Cgroup V1 otomatis untuk kernel 4.x',
      'dukungan init systemd / OpenRC / runit / s6'
    ]},
    {v:'v0.1.5', d:'2026-09-22', tag:'lite', items:[
      'panel Omarchy desktop (butuh ~8GB storage)',
      'palet tema: Aether / Nebula / Ocean / Graphite / Forest',
      'alur instalasi Termux + proot-distro dirapikan'
    ]},
    {v:'ui v19', d:'2026-09-20', tag:'site', items:[
      'command palette (ctrl+k) + aksen warna',
      'Discord presence via Lanyard, repos live dari GitHub API'
    ]}
  ];
  const TAGLABEL = {site:'SITE', aetherbox:'AETHERBOX', lite:'LITE'};
  const logList = document.getElementById('log-list');
  const paintLog = f => {
    if (!logList) return;
    const rows = LOG.filter(e => f === 'all' || e.tag === f);
    logList.innerHTML = rows.map((e, i) => `
      <article class="log-item" style="--d:${(i * .05).toFixed(2)}s">
        <div class="log-dot"></div>
        <div class="log-body">
          <div class="log-top"><b>${esc(e.v)}</b><span class="log-tag ${e.tag}">${TAGLABEL[e.tag]}</span><time>${esc(e.d)}</time></div>
          <ul>${e.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        </div>
      </article>`).join('') || '<div class="repo-err">nothing here yet.</div>';
  };
  paintLog('all');
  document.querySelectorAll('.lg-f').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.lg-f').forEach(x => x.classList.toggle('on', x === b));
    paintLog(b.dataset.f);
  }));

  /* ---------- 4a. GITHUB CONTRIBUTION GRAPH ---------- */
  (async function(){
    const box = document.getElementById('gh-graph'), total = document.getElementById('gh-total');
    if (!box) return;
    const KEY = 'sh_contrib_v1';
    const paint = data => {
      const days = data.contributions || [];
      if (!days.length){ document.getElementById('gh-wrap')?.classList.add('hidden'); return; }
      const cut = new Date(Date.now() - 371 * 864e5).toISOString().slice(0,10);
      const recent = days.filter(d => d.date >= cut);
      const weeks = [];
      recent.forEach(d => {
        const wd = new Date(d.date + 'T00:00:00Z').getUTCDay();
        if (!weeks.length || wd === 0) weeks.push(new Array(7).fill(null));
        weeks[weeks.length - 1][wd] = d;
      });
      box.innerHTML = weeks.map(w => `<div class="gh-col">${
        w.map(d => d
          ? `<i class="l${d.level}" title="${d.count} contribution${d.count === 1 ? '' : 's'} · ${d.date}"></i>`
          : '<i class="lx"></i>').join('')
      }</div>`).join('');
      const sum = recent.reduce((a, d) => a + d.count, 0);
      if (total) total.textContent = sum.toLocaleString() + ' contributions';
    };
    try {
      const cached = JSON.parse(ls.get(KEY, 'null'));
      if (cached && Date.now() - cached.t < 6 * 36e5) paint(cached.d);
      const r = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
      if (!r.ok) throw 0;
      const j = await r.json();
      paint(j);
      ls.set(KEY, JSON.stringify({t: Date.now(), d: j}));
    } catch(_){
      if (!box.children.length){
        if (total) total.textContent = 'graph unreachable';
        box.innerHTML = '<div class="repo-err">contribution graph offline — check github.com/' + GH_USER + '</div>';
      }
    }
  })();

  /* ---------- 4b. TOP LANGUAGES ---------- */
  const COLORS = {JavaScript:'#f1e05a',TypeScript:'#3178c6',Python:'#3572A5',C:'#555',"C++":'#f34b7d',Kotlin:'#A97BFF',Java:'#b07219',Shell:'#89e051',HTML:'#e34c26',CSS:'#563d7c',Go:'#00ADD8',Rust:'#dea584',Dart:'#00B4AB',Ruby:'#701516',PHP:'#4F5D95',Makefile:'#427819'};
  const paintLangs = () => {
    const rows = document.getElementById('tl-rows');
    const list = (window.SHRP_REPOS && window.SHRP_REPOS.list) || [];
    if (!rows) return;
    const by = {};
    list.forEach(r => { if (r.lang) by[r.lang] = (by[r.lang] || 0) + Math.max(r.size || 1, 1); });
    const entries = Object.entries(by).sort((a,b) => b[1] - a[1]).slice(0, 6);
    if (!entries.length){ document.getElementById('top-langs')?.classList.add('hidden'); return; }
    document.getElementById('top-langs')?.classList.remove('hidden');
    const max = entries[0][1];
    rows.innerHTML = entries.map(([k, v], i) => `
      <div class="tl-row" style="--d:${(i * .06).toFixed(2)}s">
        <span class="tl-k"><i style="background:${COLORS[k] || '#8b5cf6'}"></i>${esc(k)}</span>
        <span class="tl-bar"><b style="width:${Math.round(v / max * 100)}%;background:${COLORS[k] || '#8b5cf6'}"></b></span>
        <span class="tl-n">${list.filter(r => r.lang === k).length} repo</span>
      </div>`).join('');
  };
  addEventListener('repos:ready', paintLangs);
  paintLangs();

  /* ---------- 5. NOW PLAYING (Spotify via Lanyard) ---------- */
  (function(){
    const anchor = document.getElementById('dc-card');
    if (!anchor) return;
    const card = document.createElement('div');
    card.className = 'np-card hidden';
    card.id = 'np-card';
    card.innerHTML = `<i class="c-tl"></i><i class="c-br"></i>
      <img class="np-art" alt="album art" loading="lazy" decoding="async">
      <div class="np-meta">
        <div class="np-head"><span class="np-eq"><i></i><i></i><i></i><i></i></span>NOW PLAYING · SPOTIFY</div>
        <b class="np-song">—</b>
        <small class="np-artist">—</small>
        <div class="np-track"><span class="np-fill"></span></div>
        <div class="np-time"><span class="np-cur">0:00</span><span class="np-dur">0:00</span></div>
      </div>
      <a class="np-open" target="_blank" rel="noopener" title="open in spotify">↗</a>`;
    anchor.insertAdjacentElement('afterend', card);

    const q = s => card.querySelector(s);
    const fmt = ms => { const t = Math.max(0, Math.floor(ms / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
    let sp = null;

    const tick = () => {
      if (!sp) return;
      const {start, end} = sp.timestamps || {};
      if (!start || !end) return;
      const now = Date.now(), dur = end - start, cur = Math.min(Math.max(now - start, 0), dur);
      q('.np-fill').style.width = (cur / dur * 100).toFixed(2) + '%';
      q('.np-cur').textContent = fmt(cur);
      q('.np-dur').textContent = fmt(dur);
      if (now > end + 1500) sync();
    };

    async function sync(){
      try {
        const r = await fetch('https://api.lanyard.rest/v1/users/' + (typeof DISCORD_ID !== 'undefined' ? DISCORD_ID : ''));
        const j = await r.json();
        const d = j.data;
        if (!j.success || !d.listening_to_spotify || !d.spotify){ sp = null; card.classList.add('hidden'); return; }
        sp = d.spotify;
        q('.np-art').src = sp.album_art_url || '';
        q('.np-song').textContent = sp.song;
        q('.np-artist').textContent = sp.artist + (sp.album ? ' · ' + sp.album : '');
        q('.np-open').href = 'https://open.spotify.com/track/' + sp.track_id;
        card.classList.remove('hidden');
        tick();
      } catch(_){ sp = null; card.classList.add('hidden'); }
    }
    sync();
    setInterval(sync, 30000);
    setInterval(tick, 1000);
  })();

  /* ---------- 6. CONTACT FORM (no backend) ---------- */
  (function(){
    const form = document.getElementById('cform');
    if (!form) return;
    const CONTACT_EMAIL = 'sharpscrutal@gmail.com';              /* isi kalau mau langsung ke email */
    const FORM_ENDPOINT = '';              /* opsional: URL formspree/getform */
    const note = document.getElementById('cform-note');
    const ta = form.querySelector('textarea');
    const MAXLEN = 1000;
    ta.setAttribute('maxlength', MAXLEN);
    const count = () => { if (note) note.textContent = ta.value.length + ' / ' + MAXLEN; };
    ta.addEventListener('input', count); count();

    const compose = () => {
      const f = new FormData(form);
      return `from: ${f.get('name') || '-'} (${f.get('from') || '-'})\ntopic: ${f.get('topic')}\n\n${f.get('msg') || ''}`;
    };
    const valid = () => {
      let ok = true;
      form.querySelectorAll('[required]').forEach(el => {
        const bad = !el.value.trim();
        el.classList.toggle('bad', bad);
        if (bad) ok = false;
      });
      return ok;
    };

    document.getElementById('cform-copy').addEventListener('click', async () => {
      const text = compose();
      try { await navigator.clipboard.writeText(text); }
      catch(_){
        const t = document.createElement('textarea');
        t.value = text; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); } catch(__){}
        t.remove();
      }
      say('✓ MESSAGE COPIED — paste it on Discord');
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!valid()){ say('✗ lengkapi dulu name, contact, dan message'); return; }
      const body = compose(), subject = 'SHRP_ — ' + form.querySelector('select').value;
      if (FORM_ENDPOINT){
        try {
          const r = await fetch(FORM_ENDPOINT, {method:'POST', headers:{Accept:'application/json'}, body:new FormData(form)});
          if (!r.ok) throw 0;
          form.reset(); count(); say('✓ SENT — thanks, i\'ll reply soon');
          return;
        } catch(_){ /* jatuh ke mailto / discord */ }
      }
      if (CONTACT_EMAIL){
        location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        say('✓ OPENING YOUR MAIL APP');
        return;
      }
      try { await navigator.clipboard.writeText(subject + '\n' + body); } catch(_){}
      open('https://discord.com/users/941358133987643423', '_blank');
      say('✓ COPIED — paste it in my Discord DM');
    });
  })();

  /* ---------- 7. PERF: lazy-load + async decode ---------- */
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('loading')) img.loading = 'lazy';
    img.decoding = 'async';
  });

  /* ---------- 8. HUD + palette + terminal hooks ---------- */
  const hud = document.querySelector('.hud');
  if (hud){
    hud.insertAdjacentHTML('beforeend',
      '<button id="hud-theme" title="light / dark">☾</button>' +
      '<button id="hud-lang" title="bahasa / language">EN</button>');
    hud.querySelector('#hud-theme').addEventListener('click', toggleTheme);
    hud.querySelector('#hud-lang').addEventListener('click', toggleLang);
  }
  applyTheme(ls.get('shrp-theme', 'dark'));
  applyLang(lang);

  window.SHRP_THEME = applyTheme;
  window.SHRP_LANG = applyLang;

  addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (e.key === 'l' && !e.ctrlKey && !e.metaKey && !e.altKey){ toggleTheme(); }
    if (e.key === 'i' && !e.ctrlKey && !e.metaKey && !e.altKey){ toggleLang(); }
  });
})();
