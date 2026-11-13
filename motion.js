/* ============================================================
   MOTION — intro buka website + transisi antar halaman
   ============================================================ */
(function(){
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ---------- wipe transisi antar halaman ---------- */
  const wipe = document.createElement('div');
  wipe.id = 'page-wipe';
  wipe.setAttribute('aria-hidden', 'true');
  wipe.innerHTML = '<span>SHRP_</span>';
  document.body.appendChild(wipe);

  window.SHRP_TRANSITION = function(apply){
    if (reduced || !apply){ if (apply) apply(); return; }
    wipe.classList.remove('out');
    wipe.classList.add('run');
    setTimeout(apply, 330);
    setTimeout(() => wipe.classList.add('out'), 400);
    setTimeout(() => wipe.classList.remove('run', 'out'), 900);
  };

  /* ---------- intro buka website ---------- */
  if (reduced || sessionStorage.getItem('shrp-boot') === '1'){
    body.classList.add('booted');
    return;
  }

  const boot = document.createElement('div');
  boot.id = 'boot';
  boot.setAttribute('aria-hidden', 'true');
  boot.innerHTML =
    '<div class="boot-inner">' +
      '<div class="boot-mark"><span>S</span><span>H</span><span>R</span><span>P</span><span class="u">_</span></div>' +
      '<div class="boot-rows">' +
        '<div class="boot-row"><span>// loading portfolio</span><b id="boot-pct">000</b></div>' +
        '<div class="boot-bar"><i></i></div>' +
        '<div class="boot-tags"><span>7 pages</span><span>monochrome</span><span>motion on</span></div>' +
      '</div>' +
    '</div>' +
    '<button class="boot-skip" type="button">SKIP INTRO</button>';
  document.body.appendChild(boot);
  body.classList.add('booting');

  const pctEl = boot.querySelector('#boot-pct');
  const barEl = boot.querySelector('.boot-bar i');
  const skipEl = boot.querySelector('.boot-skip');
  const DUR = 1300;
  let done = false;

  function finish(){
    if (done) return;
    done = true;
    try { sessionStorage.setItem('shrp-boot', '1'); } catch(_){}
    body.classList.remove('booting');
    body.classList.add('booted');
    boot.classList.add('done');
    window.scrollTo({top:0,left:0,behavior:'instant'});
    setTimeout(() => boot.remove(), 1000);
  }

  const t0 = performance.now();
  function tick(now){
    if (done) return;
    const pct = Math.min(100, Math.round((now - t0) / DUR * 100));
    pctEl.textContent = String(pct).padStart(3, '0');
    barEl.style.transform = 'scaleX(' + (pct / 100) + ')';
    if (pct < 100) requestAnimationFrame(tick);
    else finish();
  }
  requestAnimationFrame(tick);
  setTimeout(finish, DUR + 900);

  skipEl.addEventListener('click', e => { e.stopPropagation(); finish(); });
  addEventListener('keydown', function onKey(){ finish(); removeEventListener('keydown', onKey); });
  addEventListener('pointerdown', function onTap(){ finish(); removeEventListener('pointerdown', onTap); });
})();
