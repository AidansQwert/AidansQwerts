/* ============================================================
   FEATURES — guestbook lokal, share, theme & language control
   ============================================================ */
(function(){
  const $ = s => document.querySelector(s);
  const say = m => { if (typeof toast === 'function') toast(m); };

  /* ---------- share / tema / bahasa di menu tiga titik ---------- */
  const shareBtn = $('#pm-share');
  const themeBtn = $('#pm-theme');
  const langBtn  = $('#pm-lang');

  const themeLabel = () => {
    if (!themeBtn) return;
    themeBtn.textContent = document.body.classList.contains('light') ? '☀ TEMA TERANG' : '☾ TEMA GELAP';
  };

  themeBtn && themeBtn.addEventListener('click', () => {
    if (window.SHRP_THEME) window.SHRP_THEME(document.body.classList.contains('light') ? 'dark' : 'light');
    themeLabel();
    say(document.body.classList.contains('light') ? '✓ mode terang' : '✓ mode gelap');
  });
  themeLabel();

  langBtn && langBtn.addEventListener('click', () => {
    const next = document.documentElement.lang === 'id' ? 'en' : 'id';
    if (window.SHRP_LANG) window.SHRP_LANG(next);
    langBtn.textContent = next === 'id' ? '文 BAHASA ID' : '文 BAHASA EN';
    say(next === 'id' ? '✓ bahasa indonesia' : '✓ english');
  });
  if (langBtn) langBtn.textContent = document.documentElement.lang === 'id' ? '文 BAHASA ID' : '文 BAHASA EN';

  shareBtn && shareBtn.addEventListener('click', async () => {
    const url = location.origin + location.pathname;
    const data = { title: 'Sharp / crystalsharps', text: 'Portfolio of Sharp — developer & crystal wolf', url };
    if (navigator.share){
      try { await navigator.share(data); return; }
      catch(err){ if (err && err.name === 'AbortError') return; }
    }
    const ok = window.SHRP_COPY ? await window.SHRP_COPY(url) : false;
    say(ok ? '✓ LINK COPIED — ' + location.host : '✕ copy gagal — ' + url);
  });

  /* ---------- guestbook lokal ---------- */
  const form = $('#gb-form');
  const list = $('#gb-list');
  const count = $('#gb-count');
  const KEY = 'shrp-guestbook';
  let notes = [];

  try { notes = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(_){ notes = []; }
  if (!Array.isArray(notes)) notes = [];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(notes.slice(0, 40))); } catch(_){}
  }

  function render(){
    if (count) count.textContent = notes.length + (notes.length === 1 ? ' note' : ' notes');
    if (!list) return;
    if (!notes.length){
      list.innerHTML = '<li class="gb-empty">belum ada yang nulis — jadi yang pertama ✧</li>';
      return;
    }
    list.innerHTML = notes.map((n, i) =>
      '<li class="gb-item"><div><b>' + esc(n.n) + '</b><span>' + esc(n.d || '') + '</span><p>' + esc(n.m) + '</p></div>' +
      '<button class="gb-del" type="button" data-i="' + i + '" aria-label="hapus catatan">✕</button></li>'
    ).join('');
  }

  list && list.addEventListener('click', e => {
    const btn = e.target.closest('.gb-del');
    if (!btn) return;
    const i = Number(btn.dataset.i);
    if (!Number.isInteger(i) || i < 0 || i >= notes.length) return;
    notes.splice(i, 1); save(); render(); say('✕ catatan dihapus');
  });

  form && form.addEventListener('submit', e => {
    e.preventDefault();
    const nameEl = $('#gb-name'), msgEl = $('#gb-msg');
    const n = (nameEl.value || '').trim().slice(0, 24);
    const m = (msgEl.value || '').trim().slice(0, 140);
    if (!n || !m){ say('✗ isi nama & pesan dulu'); return; }
    notes.unshift({ n, m, d: new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) });
    save(); render(); form.reset();
    if (nameEl) nameEl.focus();
    say('✓ makasih sudah mampir ✧');
  });


  /* ---------- share site (dipakai menu + contact) ---------- */
  async function shareSite(){
    const url = location.origin + location.pathname;
    const data = { title: 'Sharp / crystalsharps', text: 'Portfolio of Sharp — developer & crystal wolf', url };
    if (navigator.share){
      try { await navigator.share(data); return; }
      catch(err){ if (err && err.name === 'AbortError') return; }
    }
    const ok = window.SHRP_COPY ? await window.SHRP_COPY(url) : false;
    say(ok ? '✓ LINK COPIED — ' + location.host : '✕ copy gagal — ' + url);
  }
  $('#contact-share') && $('#contact-share').addEventListener('click', shareSite);

  /* ---------- simpan kontak (.vcf) ---------- */
  const vcardBtn = $('#vcard');
  vcardBtn && vcardBtn.addEventListener('click', () => {
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Sharp',
      'N:Sharp;;;;',
      'NICKNAME:crystalsharps',
      'NOTE:Developer & Linux tinkerer from Bali. Crystal wolf fursona.',
      'URL:https://crystalsharpss.dpdns.org/',
      'X-SOCIALPROFILE;type=github:https://github.com/AidansQwert',
      'X-SOCIALPROFILE;type=telegram:https://t.me/CrystalSharps',
      'X-SOCIALPROFILE;type=discord:https://discord.com/users/941358133987643423',
      'END:VCARD'
    ].join('\r\n');
    try {
      const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sharp-crystalsharps.vcf';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      say('✓ contact card diunduh');
    } catch(_){ say('✕ gagal bikin vcard'); }
  });

  render();
})();
