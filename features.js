/* ============================================================
   FEATURES — i18n (EN / ID / 中文 / 日本語), guestbook, share, vCard
   English adalah bahasa bawaan. Pilihan bahasa disimpan di localStorage.
   ============================================================ */
(function(){
  const $ = s => document.querySelector(s);
  const say = m => { if (typeof toast === 'function') toast(m); };

  const LANGS = ['en', 'id', 'zh', 'ja'];
  const LANG_LABEL = { en: 'English', id: 'Indonesia', zh: '中文', ja: '日本語' };
  let current = 'en';

  const DICT = {
    id: {
      'hero.badge': 'tersedia untuk collab & project kecil',
      'hero.lede': 'Developer dan pengoprek Linux dari Bali. Aku bikin website kecil, cepat, ditulis tangan — plus fursona serigala kristal di sampingnya.',
      'hero.work': 'LIHAT KARYAKU',
      'hero.touch': 'HUBUNGI AKU →',
      'hero.quote': '"<em>serigala dengan terminal terbuka</em> — sabtu pakai suit, minggu ngoprek kernel."',
      'about.bio': 'halo. aku <span class="hl">Sharp</span>. suka gonta-ganti distro, ngoprek linux, bikin environment sendiri, nulis tool kecil-kecilan, dan sisanya dipakai buat fursuit. bio lengkap &amp; semua link ada di <a href="https://guns.lol/crystalsharp" target="_blank" rel="noopener">guns.lol/crystalsharp</a> — satu link, semuanya. <span class="hl">di luar layar</span> aku fursuiter wolf kristal — dossier lengkapnya di <a href="#fursuit">section .002</a>. <span class="hl">wolf pack 🐺</span>, crystal &lt;3 ▊',
      'qa1s': 'siapa kamu, dalam satu baris?',
      'qa1p': 'sharp — developer dari bali yang pakai linux, nulis tool kecil, dan serigala kristal di sampingnya.',
      'qa2s': 'kamu sebenarnya ngapain?',
      'qa2p': 'ngoprek linux (kadang di android), bikin situs ini manual, bikin config sendiri rusak, dan foto sistem operasi yang nggak ada yang minta.',
      'qa3s': 'kamu sudah punya fursuit?',
      'qa3p': 'belum — desainnya sudah fix dan rencananya ada di halaman ini. sementara itu fursonanya hidup di kode dan sketsa.',
      'qa4s': 'boleh pakai kode kamu?',
      'qa4p': 'situsnya publik di github. baca, fork, pelajari — link balik itu bagus tapi nggak wajib.',
      'qa5s': 'gimana cara nyapa?',
      'qa5p': 'discord atau telegram paling cepat. form kontak di bawah juga bisa — cuma buka aplikasi email kamu.',
      'fursuit.soon': 'foto fursuit muncul di sini<br>begitu suit-nya jadi',
      'fursuit.note': 'belum ada suit — halaman ini dokumen desainnya. ref, maker, dan build-nya nanti mendarat di sini.',
      'contact.intro': 'lapor bug, ide fitur, atau cuma mau nyapa — kirim aja. tanpa backend: pesanmu dibuka di aplikasi email kamu sendiri.',
      'contact.name': 'NAMA',
      'contact.contact': 'KONTAK',
      'contact.topic': 'TOPIK',
      'contact.msg': 'PESAN',
      'contact.ph.name': 'nama / handle kamu',
      'contact.ph.contact': 'email atau tag discord',
      'contact.ph.msg': 'tulis pesanmu di sini…',
      'contact.topic1': 'Sapa / meetup',
      'contact.topic2': 'Pertanyaan fursuit',
      'contact.topic3': 'Feedback website',
      'contact.topic4': 'Collab / project',
      'contact.topic5': 'Cuma nyapa',
      'contact.copy': '⧉ SALIN TEKS',
      'contact.send': 'KIRIM →',
      'contact.vcard': '⤓ SIMPAN KONTAK (.VCF)',
      'contact.share': '↗ BAGIKAN SITUS',
      'gb.name': 'nama / handle',
      'gb.msg': 'tulis sesuatu…',
      'gb.submit': 'TULIS →',
      'gb.note': 'disimpan di browser kamu sendiri (localStorage), bukan di server.',
      'foot.desc': 'Developer dan pengoprek Linux dari Bali. Website tulisan tangan, tool kecil, dan fursona serigala kristal.',
      'foot.legal': 'art, fursona & kode © sharp · cantumkan sumber sebelum repost · tanpa tracking',
      'menu.share': '↗ BAGIKAN SITUS',
      'menu.themeDark': '☾ TEMA GELAP',
      'menu.themeLight': '☀ TEMA TERANG',
      'menu.hint': 'TOMBOL 0–6 UNTUK LOMPAT · ESC UNTUK TUTUP',
      'nav.home': 'BERANDA', 'nav.about': 'TENTANG', 'nav.fursuit': 'FURSUIT',
      'nav.work': 'KARYA', 'nav.social': 'SOSIAL', 'nav.music': 'MUSIK', 'nav.contact': 'KONTAK',
      'foot.top': '↑ KEMBALI KE ATAS',
      'gb.empty': 'belum ada yang nulis — jadi yang pertama ✧',
      'gb.thanks': '✓ makasih sudah mampir ✧',
      'gb.need': '✗ isi nama & pesan dulu',
      'gb.deleted': '✕ catatan dihapus',
      'ui.copied': '✓ LINK COPIED — ',
      'ui.copyFail': '✕ copy gagal — ',
      'ui.vcardDone': '✓ contact card diunduh',
      'ui.vcardFail': '✕ gagal bikin vcard',
      'ui.themeDark': '✓ mode gelap',
      'ui.themeLight': '✓ mode terang',
      'ui.shareText': 'Portfolio Sharp — developer & serigala kristal'
    },
    zh: {
      'hero.badge': '接受合作与小项目',
      'hero.lede': '来自巴厘岛的开发者和 Linux 折腾党。我做小巧、快速、手写的网站 —— 另外还有一只水晶狼兽设。',
      'hero.work': '看看我的作品',
      'hero.touch': '联系我 →',
      'hero.quote': '"<em>开着终端的狼</em> —— 周六穿兽装，周日调内核。"',
      'about.bio': '嗨，我是 <span class="hl">Sharp</span>。喜欢换发行版、在手机上折腾 linux、搭建自己的环境、写小工具，剩下的时间都花在兽装上。完整简介和所有链接都在 <a href="https://guns.lol/crystalsharp" target="_blank" rel="noopener">guns.lol/crystalsharp</a> —— 一个链接，全部搞定。<span class="hl">屏幕之外</span>我是一只水晶狼兽装玩家 —— 完整档案在 <a href="#fursuit">section .002</a>。<span class="hl">狼群 🐺</span>，crystal &lt;3 ▊',
      'qa1s': '一句话介绍你自己？',
      'qa1p': 'sharp —— 来自巴厘岛的开发者，用 linux、写小工具，同时是一只水晶狼。',
      'qa2s': '你平时到底做什么？',
      'qa2p': '折腾 linux（有时在安卓上）、手写这个网站、弄坏自己的配置，还给没人关心的操作系统拍照。',
      'qa3s': '你有兽装吗？',
      'qa3p': '还没有 —— 设计已经定稿，计划都在这页上。在那之前，兽设活在代码和草图里。',
      'qa4s': '我可以用你的代码吗？',
      'qa4p': '网站在 github 上公开。读它、fork 它、从中学 —— 留个链接更好，但不强求。',
      'qa5s': '怎么跟你打招呼？',
      'qa5p': 'discord 或 telegram 最快。下面的联系表单也行 —— 它只是打开你的邮件应用。',
      'fursuit.soon': '兽装照片会出现在这里<br>等兽装做好之后',
      'fursuit.note': '还没有兽装 —— 这一页就是设计文档。参考图、制作者和最终成品都会放在这里。',
      'contact.intro': '报 bug、提功能想法，或者只是想打个招呼 —— 发过来吧。没有后端：消息会在你自己的邮件应用里打开。',
      'contact.name': '名字',
      'contact.contact': '联系方式',
      'contact.topic': '主题',
      'contact.msg': '消息',
      'contact.ph.name': '你的名字 / 昵称',
      'contact.ph.contact': '邮箱或 discord 标签',
      'contact.ph.msg': '在这里写你的消息…',
      'contact.topic1': '打招呼 / 见面',
      'contact.topic2': '兽装问题',
      'contact.topic3': '网站反馈',
      'contact.topic4': '合作 / 项目',
      'contact.topic5': '只是打个招呼',
      'contact.copy': '⧉ 复制文本',
      'contact.send': '发送 →',
      'contact.vcard': '⤓ 保存联系人 (.VCF)',
      'contact.share': '↗ 分享网站',
      'gb.name': '名字 / 昵称',
      'gb.msg': '写点什么…',
      'gb.submit': '留言 →',
      'gb.note': '只保存在你自己的浏览器里（localStorage），不在服务器上。',
      'foot.desc': '来自巴厘岛的开发者和 Linux 折腾党。手写网站、小工具，还有一只水晶狼兽设。',
      'foot.legal': '美术、兽设与代码 © sharp · 转载前请注明出处 · 无追踪',
      'menu.share': '↗ 分享网站',
      'menu.themeDark': '☾ 深色模式',
      'menu.themeLight': '☀ 浅色模式',
      'menu.hint': '按键 0–6 跳转 · ESC 关闭',
      'nav.home': '首页', 'nav.about': '关于', 'nav.fursuit': '兽装',
      'nav.work': '作品', 'nav.social': '社交', 'nav.music': '音乐', 'nav.contact': '联系',
      'foot.top': '↑ 回到顶部',
      'gb.empty': '还没有留言 —— 来写第一条 ✧',
      'gb.thanks': '✓ 谢谢你来过 ✧',
      'gb.need': '✗ 先填名字和留言',
      'gb.deleted': '✕ 留言已删除',
      'ui.copied': '✓ 链接已复制 — ',
      'ui.copyFail': '✕ 复制失败 — ',
      'ui.vcardDone': '✓ 联系人已下载',
      'ui.vcardFail': '✕ 生成 vcard 失败',
      'ui.themeDark': '✓ 深色模式',
      'ui.themeLight': '✓ 浅色模式',
      'ui.shareText': 'Sharp 的作品集 —— 开发者与水晶狼'
    },
    ja: {
      'hero.badge': 'コラボ・小規模制作 受付中',
      'hero.lede': 'バリ島の開発者で Linux いじり。小さくて速い、手書きのサイトを作っています —— 相棒はクリスタルウルフのファーソナ。',
      'hero.work': '作品を見る',
      'hero.touch': '連絡する →',
      'hero.quote': '「<em>ターミナルを開いた狼</em> —— 土曜はスーツ、日曜はカーネル。」',
      'about.bio': 'どうも、<span class="hl">Sharp</span> です。distro を渡り歩き、Android で linux をいじり、自分の環境を組み、小さなツールを書いて、残りの時間はスーツで過ごしています。詳しい bio とリンクは <a href="https://guns.lol/crystalsharp" target="_blank" rel="noopener">guns.lol/crystalsharp</a> に全部。<span class="hl">画面の外</span>ではクリスタルウルフのファースーター —— 詳細は <a href="#fursuit">section .002</a>。<span class="hl">wolf pack 🐺</span>、crystal &lt;3 ▊',
      'qa1s': 'ひと言で誰？',
      'qa1p': 'sharp —— バリ島の開発者。linux を使って小さなツールを書き、相棒はクリスタルウルフ。',
      'qa2s': '普段は何を？',
      'qa2p': 'linux をいじり（たまに Android で）、このサイトを手書きし、自分の設定を壊し、誰も頼んでいない OS の写真を撮っています。',
      'qa3s': 'ファースーツは持ってる？',
      'qa3p': 'まだです —— デザインは確定していて、計画はこのページに。それまではコードとスケッチの中にいます。',
      'qa4s': 'コードを使ってもいい？',
      'qa4p': 'サイトは github で公開しています。読む、fork する、学ぶ —— リンクがあると嬉しいですが必須ではありません。',
      'qa5s': '挨拶はどうすれば？',
      'qa5p': 'discord か telegram が一番早いです。下のフォームも使えます —— メールアプリが開くだけ。',
      'fursuit.soon': 'スーツが完成したら<br>ここに写真が入ります',
      'fursuit.note': 'スーツはまだありません —— このページが設計書です。参考資料、制作依頼、完成したスーツはここに。',
      'contact.intro': 'バグ報告、機能のアイデア、ただの挨拶 —— 何でもどうぞ。バックエンドなし：メッセージはあなたのメールアプリで開きます。',
      'contact.name': '名前',
      'contact.contact': '連絡先',
      'contact.topic': '話題',
      'contact.msg': 'メッセージ',
      'contact.ph.name': '名前 / ハンドル',
      'contact.ph.contact': 'メールか discord タグ',
      'contact.ph.msg': 'ここにメッセージを…',
      'contact.topic1': '挨拶 / オフ会',
      'contact.topic2': 'スーツの質問',
      'contact.topic3': 'サイトの感想',
      'contact.topic4': 'コラボ / 案件',
      'contact.topic5': 'ただの挨拶',
      'contact.copy': '⧉ テキストをコピー',
      'contact.send': '送信 →',
      'contact.vcard': '⤓ 連絡先を保存 (.VCF)',
      'contact.share': '↗ サイトを共有',
      'gb.name': '名前 / ハンドル',
      'gb.msg': 'ひとこと…',
      'gb.submit': '書く →',
      'gb.note': 'あなたのブラウザにだけ保存されます（localStorage）。サーバーには送られません。',
      'foot.desc': 'バリ島の開発者で Linux いじり。手書きのサイト、小さなツール、そしてクリスタルウルフのファーソナ。',
      'foot.legal': 'アート・ファーソナ・コード © sharp · 転載は出典を明記 · トラッキングなし',
      'menu.share': '↗ サイトを共有',
      'menu.themeDark': '☾ ダークモード',
      'menu.themeLight': '☀ ライトモード',
      'menu.hint': '0–6 キーで移動 · ESC で閉じる',
      'nav.home': 'ホーム', 'nav.about': '紹介', 'nav.fursuit': 'スーツ',
      'nav.work': '作品', 'nav.social': 'SNS', 'nav.music': '音楽', 'nav.contact': '連絡',
      'foot.top': '↑ トップへ戻る',
      'gb.empty': 'まだメモはありません —— 最初の一人に ✧',
      'gb.thanks': '✓ 来てくれてありがとう ✧',
      'gb.need': '✗ 名前とメッセージを入れてね',
      'gb.deleted': '✕ メモを削除しました',
      'ui.copied': '✓ リンクをコピーしました — ',
      'ui.copyFail': '✕ コピー失敗 — ',
      'ui.vcardDone': '✓ 連絡先をダウンロードしました',
      'ui.vcardFail': '✕ vcard の作成に失敗',
      'ui.themeDark': '✓ ダークモード',
      'ui.themeLight': '✓ ライトモード',
      'ui.shareText': 'Sharp のポートフォリオ —— 開発者とクリスタルウルフ'
    }
  };

  const tr = (k, fb) => {
    const d = DICT[current];
    return (d && d[k] != null) ? d[k] : (fb || '');
  };

  const countLabel = n =>
    current === 'id' ? n + ' catatan' :
    current === 'zh' ? n + ' 条留言' :
    current === 'ja' ? n + ' 件' :
    n + (n === 1 ? ' note' : ' notes');

  const dateLabel = () => {
    const loc = current === 'id' ? 'id-ID' : current === 'zh' ? 'zh-CN' : current === 'ja' ? 'ja-JP' : 'en-GB';
    try {
      return new Date().toLocaleDateString(loc, { day: '2-digit', month: 'short', year: 'numeric' });
    } catch(_){ return new Date().toISOString().slice(0, 10); }
  };

  /* ---------- guestbook store (dibaca oleh applyLang) ---------- */
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
    if (count) count.textContent = countLabel(notes.length);
    if (!list) return;
    if (!notes.length){
      list.innerHTML = '<li class="gb-empty">' + esc(tr('gb.empty', 'no notes yet — be the first ✧')) + '</li>';
      return;
    }
    list.innerHTML = notes.map((n, i) =>
      '<li class="gb-item"><div><b>' + esc(n.n) + '</b><span>' + esc(n.d || '') + '</span><p>' + esc(n.m) + '</p></div>' +
      '<button class="gb-del" type="button" data-i="' + i + '" aria-label="delete">✕</button></li>'
    ).join('');
  }

  /* ---------- terapkan bahasa ke seluruh halaman ---------- */
  function themeLabel(){
    const b = $('#pm-theme');
    if (!b) return;
    const light = document.body.classList.contains('light');
    b.textContent = light ? tr('menu.themeLight', '☀ LIGHT THEME') : tr('menu.themeDark', '☾ DARK THEME');
  }

  function applyLang(code, announce){
    if (!LANGS.includes(code)) code = 'en';
    current = code;
    try { localStorage.setItem('shrp-lang', code); } catch(_){}
    document.documentElement.lang = code;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.dataset.en == null) el.dataset.en = el.innerHTML;
      const key = el.dataset.i18n;
      const v = code === 'en' ? el.dataset.en
        : (DICT[code][key] != null ? DICT[code][key] : el.dataset.en);
      if (el.innerHTML !== v) el.innerHTML = v;
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      if (el.dataset.enPh == null) el.dataset.enPh = el.placeholder;
      const key = el.dataset.i18nPh;
      const v = code === 'en' ? el.dataset.enPh
        : (DICT[code][key] != null ? DICT[code][key] : el.dataset.enPh);
      el.placeholder = v;
    });

    const sel = $('#pm-lang');
    if (sel && sel.value !== code) sel.value = code;

    themeLabel();
    render();
    if (announce) say('✓ ' + LANG_LABEL[code]);
    dispatchEvent(new CustomEvent('lang:change', { detail: { lang: code } }));
  }

  const nextLang = () => applyLang(LANGS[(LANGS.indexOf(current) + 1) % LANGS.length], true);

  /* ---------- share / tema / bahasa ---------- */
  const themeBtn = $('#pm-theme');
  themeBtn && themeBtn.addEventListener('click', () => {
    if (window.SHRP_THEME) window.SHRP_THEME(document.body.classList.contains('light') ? 'dark' : 'light');
    themeLabel();
    say(document.body.classList.contains('light') ? tr('ui.themeLight', '✓ light mode') : tr('ui.themeDark', '✓ dark mode'));
  });

  const langSel = $('#pm-lang');
  langSel && langSel.addEventListener('change', () => applyLang(langSel.value, true));

  async function shareSite(){
    const url = location.origin + location.pathname;
    const data = { title: 'Sharp / crystalsharps', text: tr('ui.shareText', 'Portfolio of Sharp — developer & crystal wolf'), url };
    if (navigator.share){
      try { await navigator.share(data); return; }
      catch(err){ if (err && err.name === 'AbortError') return; }
    }
    const ok = window.SHRP_COPY ? await window.SHRP_COPY(url) : false;
    say(ok ? tr('ui.copied', '✓ LINK COPIED — ') + location.host : tr('ui.copyFail', '✕ copy failed — ') + url);
  }

  $('#pm-share') && $('#pm-share').addEventListener('click', shareSite);
  $('#contact-share') && $('#contact-share').addEventListener('click', shareSite);

  /* ---------- guestbook ---------- */
  list && list.addEventListener('click', e => {
    const btn = e.target.closest('.gb-del');
    if (!btn) return;
    const i = Number(btn.dataset.i);
    if (!Number.isInteger(i) || i < 0 || i >= notes.length) return;
    notes.splice(i, 1); save(); render(); say(tr('gb.deleted', '✕ note deleted'));
  });

  form && form.addEventListener('submit', e => {
    e.preventDefault();
    const nameEl = $('#gb-name'), msgEl = $('#gb-msg');
    const n = (nameEl.value || '').trim().slice(0, 24);
    const m = (msgEl.value || '').trim().slice(0, 140);
    if (!n || !m){ say(tr('gb.need', '✗ add a name & message first')); return; }
    notes.unshift({ n, m, d: dateLabel() });
    save(); render(); form.reset();
    if (nameEl) nameEl.focus();
    say(tr('gb.thanks', '✓ thanks for stopping by ✧'));
  });

  /* ---------- vCard ---------- */
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
      say(tr('ui.vcardDone', '✓ contact card downloaded'));
    } catch(_){ say(tr('ui.vcardFail', '✕ could not build the vcard')); }
  });

  /* ---------- keyboard: i = ganti bahasa ---------- */
  addEventListener('keydown', e => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (e.key === 'i' && !e.ctrlKey && !e.metaKey && !e.altKey) nextLang();
  });

  /* ---------- API buat script lain ---------- */
  window.SHRP_LANG = applyLang;
  window.SHRP_LANG_NEXT = nextLang;

  /* ---------- terapkan bahasa tersimpan (default: English) ---------- */
  let saved = 'en';
  try { saved = localStorage.getItem('shrp-lang') || 'en'; } catch(_){}
  applyLang(LANGS.includes(saved) ? saved : 'en');
})();
