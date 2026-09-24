/* SHRP_ — script kecil untuk halaman tambahan (aetherbox/guide/blog/contact) */
(function () {
  'use strict';

  /* style.css menyembunyikan body sampai class ini ada (dipasang script.js di home) */
  document.body.classList.add('ready', 'loaded');

  function toast(msg) {
    var el = document.getElementById('ptoast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('on'); }, 2200);
  }

  /* copy tombol di tiap blok command */
  document.querySelectorAll('.cmd-top button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.cmd');
      var pre = box && box.querySelector('pre');
      if (!pre) return;
      var text = pre.innerText;
      var done = function () { toast('✓ COPIED TO CLIPBOARD'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else fallback();
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('× COPY FAILED'); }
        document.body.removeChild(ta);
      }
    });
  });

  /* FAQ: buka satu, tutup yang lain */
  var faq = document.querySelectorAll('.faq details');
  faq.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faq.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* tahun otomatis */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* rilis terbaru dari GitHub (kalau ada elemen-nya) */
  document.querySelectorAll('[data-release]').forEach(function (el) {
    var repo = el.getAttribute('data-release');
    fetch('https://api.github.com/repos/' + repo + '/releases/latest')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.tag_name) { el.textContent = '—'; return; }
        var date = d.published_at ? new Date(d.published_at).toISOString().slice(0, 10) : '';
        el.textContent = d.tag_name + (date ? ' · ' + date : '');
      })
      .catch(function () { el.textContent = '—'; });
  });

  /* form kontak — tanpa backend: buka email client atau copy teks */
  var form = document.getElementById('pform');
  if (form) {
    var EMAIL = '';           /* isi email kamu di sini kalau mau tombol SEND langsung ke email */
    var DISCORD = 'https://discord.com/users/941358133987643423';

    var build = function () {
      var d = new FormData(form);
      var subject = '[' + (d.get('topic') || 'Message') + '] from ' + (d.get('name') || 'anon');
      var body = 'NAME: ' + (d.get('name') || '-') + '\nCONTACT: ' + (d.get('from') || '-') +
        '\nTOPIC: ' + (d.get('topic') || '-') + '\n\n' + (d.get('msg') || '');
      return { subject: subject, body: body };
    };

    var counter = form.querySelector('[data-count]');
    var msg = form.querySelector('[name=msg]');
    if (counter && msg) {
      var upd = function () { counter.textContent = msg.value.length + ' / 1000'; };
      msg.addEventListener('input', upd); upd();
    }

    var copyBtn = form.querySelector('[data-copy]');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var m = build();
      var text = m.subject + '\n\n' + m.body;
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () {
        toast('✓ TEXT COPIED — paste ke DM/email');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var m = build();
      if (EMAIL) {
        location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(m.subject) +
          '&body=' + encodeURIComponent(m.body);
      } else {
        if (navigator.clipboard) navigator.clipboard.writeText(m.subject + '\n\n' + m.body);
        toast('✓ PESAN DICOPY — buka Discord & paste');
        setTimeout(function () { window.open(DISCORD, '_blank', 'noopener'); }, 700);
      }
    });
  }
})();
