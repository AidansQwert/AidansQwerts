const showcase = [
  {
    tag: 'System',
    title: 'AetherBox Core',
    icon: '◈',
    desc: 'A Linux-on-Android runtime built for native performance, rooted workflows, and flexible distro booting.',
    metrics: ['root', 'arm64', 'native'],
    href: 'https://github.com/AidansQwert/AetherBox'
  },
  {
    tag: 'No-root',
    title: 'AetherBox Lite',
    icon: '◌',
    desc: 'A lightweight companion for Termux and proot-based setups, tuned for mobile-first experimentation.',
    metrics: ['termux', 'proot', 'portable'],
    href: 'https://github.com/AidansQwert/AetherBox-Lite'
  },
  {
    tag: 'Web',
    title: 'Portfolio Experience',
    icon: '⌘',
    desc: 'The current single-page portfolio with terminal-inspired motion, live GitHub data, and interactive shell-like browsing.',
    metrics: ['html', 'css', 'js'],
    href: 'https://github.com/AidansQwert/AidansQwerts'
  }
];

const renderShowcase = () => {
  const host = document.getElementById('showcase-grid');
  if (!host) return;

  host.innerHTML = showcase.map(item => `
    <article class="showcase-card" data-rv>
      <div class="showcase-top">
        <span class="showcase-tag">${item.tag}</span>
        <span class="showcase-icon" aria-hidden="true">${item.icon}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <div class="showcase-metrics">
        ${item.metrics.map(metric => `<span>${metric}</span>`).join('')}
      </div>
      <div class="showcase-actions">
        <span class="showcase-link">open project</span>
        <a class="chip" href="${item.href}" target="_blank" rel="noopener">↗</a>
      </div>
    </article>
  `).join('');
};

const applyTheme = mode => {
  const light = mode === 'light';
  document.body.classList.toggle('light', light);
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  const themeText = themeToggle?.querySelector('.theme-text');

  if (themeIcon) themeIcon.textContent = light ? '☾' : '☀';
  if (themeText) themeText.textContent = light ? 'DARK' : 'LIGHT';

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', light ? '#f4f6fb' : '#08080a');

  try {
    localStorage.setItem('shrp-theme', light ? 'light' : 'dark');
  } catch (_) {}
};

const initTheme = () => {
  const saved = (() => {
    try {
      return localStorage.getItem('shrp-theme') || 'dark';
    } catch (_) {
      return 'dark';
    }
  })();

  applyTheme(saved);

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = document.body.classList.contains('light') ? 'dark' : 'light';
      applyTheme(next);
    });
  }
};

renderShowcase();
initTheme();
