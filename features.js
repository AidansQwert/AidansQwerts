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
    <a href="${item.href}" target="_blank" rel="noopener" class="showcase-card" data-rv>
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
        <span class="chip">↗</span>
      </div>
    </a>
  `).join('');
};

/* Uptime Counter - FIXED */
const initUptime = () => {
  const el = document.getElementById('uptime');
  if (!el) return;

  const t0 = new Date('2022-02-10T00:00:00+07:00').getTime();
  
  const tick = () => {
    const now = Date.now();
    const diff = now - t0;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    el.textContent = days.toLocaleString('en-US') + ' DAYS · ' + hours + 'H';
  };
  
  tick();
  setInterval(tick, 3600000); // Update every hour
};

/* Theme Toggle */
const applyTheme = mode => {
  const light = mode === 'light';
  document.body.classList.toggle('light', light);
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  const themeText = themeToggle?.querySelector('.theme-text');

  if (themeIcon) themeIcon.textContent = light ? '☾' : '☀';
  if (themeText) themeText.textContent = light ? 'DARK' : 'LIGHT';

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', light ? '#f9fafb' : '#08080a');

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
    toggle.addEventListener('click', e => {
      e.preventDefault();
      const next = document.body.classList.contains('light') ? 'dark' : 'light';
      applyTheme(next);
    });
  }
};

/* Performance optimizations */
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const throttle = (fn, delay) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
};

/* Lazy load images */
const initLazyLoad = () => {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.loading = 'eager';
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    images.forEach(img => observer.observe(img));
  }
};

/* Initialize everything */
document.addEventListener('DOMContentLoaded', () => {
  renderShowcase();
  initTheme();
  initUptime();
  initLazyLoad();
}, { once: true });

/* Keyboard shortcuts for theme */
document.addEventListener('keydown', e => {
  if ((/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))) return;
  if (e.key === 'l' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const next = document.body.classList.contains('light') ? 'dark' : 'light';
    applyTheme(next);
  }
});

export { applyTheme, initTheme, debounce, throttle };
