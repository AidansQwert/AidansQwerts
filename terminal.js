const terminal = {
  history: [],
  historyIndex: -1,
  isOpen: false,

  commands: {
    help: {
      desc: 'Show available commands',
      exec: () => [
        '> Available Commands:',
        '',
        '  help          Show this help message',
        '  about         About Sharp (crystalsharps)',
        '  projects      List my projects',
        '  theme <name>  Change theme (dark, light, ocean, violet, sunset, forest)',
        '  theme list    Show all available themes',
        '  whoami        Who am I?',
        '  uptime        Show uptime',
        '  open github   Open GitHub profile',
        '  copy link     Copy portfolio link',
        '  clear         Clear terminal',
        '',
        'Tip: Use arrow keys to navigate history'
      ]
    },
    about: {
      desc: 'About Sharp',
      exec: () => [
        '> Sharp (crystalsharps) - AidansQwert',
        '',
        'Developer & Linux tinkerer',
        'Creator of AetherBox (Linux on Android)',
        '',
        'Languages: C, Python, Shell',
        'Focus: Linux, Android, Container runtimes',
        'Status: Actively developing',
        '',
        'Contact: guns.lol/crystalsharp'
      ]
    },
    projects: {
      desc: 'List projects',
      exec: () => [
        '> Featured Projects:',
        '',
        '  1. AetherBox       - Linux native on Android (root)',
        '  2. AetherBox Lite  - No-root companion for Termux',
        '  3. AidansQwerts    - Portfolio & personal site',
        '',
        'Type: open github'
      ]
    },
    whoami: {
      desc: 'Who are you?',
      exec: () => ['sharp@aether:~$ crystalsharps']
    },
    uptime: {
      desc: 'Show uptime',
      exec: () => {
        const uptimeEl = document.getElementById('uptime');
        const uptime = uptimeEl ? uptimeEl.textContent : 'N/A';
        return [`System uptime: ${uptime}`];
      }
    },
    'open github': {
      desc: 'Open GitHub',
      exec: () => {
        window.open('https://github.com/AidansQwert', '_blank');
        return ['Opening GitHub...'];
      }
    },
    'copy link': {
      desc: 'Copy portfolio link',
      exec: () => {
        navigator.clipboard.writeText('https://guns.lol/crystalsharp').catch(() => {});
        return ['✓ Link copied to clipboard'];
      }
    },
    theme: {
      desc: 'Change theme',
      exec: (args) => {
        if (args[0] === 'list') {
          return [
            '> Available themes:',
            '',
            '  dark, light, ocean, violet, sunset, forest',
            '',
            'Use: theme <name>'
          ];
        }
        const theme = args[0];
        if (['dark', 'light', 'ocean', 'violet', 'sunset', 'forest'].includes(theme)) {
          applyTheme(theme);
          return [`✓ Theme changed to: ${theme}`];
        }
        return ['✗ Invalid theme. Use: theme list'];
      }
    },
    clear: {
      desc: 'Clear terminal',
      exec: () => {
        const content = document.querySelector('.terminal-content');
        if (content) content.innerHTML = '';
        return [];
      }
    }
  },

  init: () => {
    const overlay = document.getElementById('terminal-overlay');
    const input = document.getElementById('terminal-input');
    const closeBtn = document.querySelector('.terminal-btn.close');

    if (!overlay || !input) return;

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        terminal.isOpen ? terminal.close() : terminal.open();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && terminal.isOpen) terminal.close();
    });

    if (closeBtn) closeBtn.addEventListener('click', () => terminal.close());

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) terminal.close();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = input.value.trim();
        if (cmd) {
          terminal.execute(cmd);
          terminal.history.push(cmd);
          terminal.historyIndex = terminal.history.length;
          input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (terminal.historyIndex > 0) {
          terminal.historyIndex--;
          input.value = terminal.history[terminal.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (terminal.historyIndex < terminal.history.length - 1) {
          terminal.historyIndex++;
          input.value = terminal.history[terminal.historyIndex];
        } else {
          terminal.historyIndex = terminal.history.length;
          input.value = '';
        }
      }
    });
  },

  open: () => {
    terminal.isOpen = true;
    const overlay = document.getElementById('terminal-overlay');
    const input = document.getElementById('terminal-input');
    if (overlay) overlay.classList.add('open');
    if (input) input.focus();
  },

  close: () => {
    terminal.isOpen = false;
    const overlay = document.getElementById('terminal-overlay');
    if (overlay) overlay.classList.remove('open');
  },

  execute: (cmd) => {
    const content = document.querySelector('.terminal-content');
    if (!content) return;

    const cmdLine = document.createElement('div');
    cmdLine.className = 'terminal-line';
    cmdLine.innerHTML = `<span class="prompt">sharp@aether:~$</span> <span class="text">${cmd}</span>`;
    content.appendChild(cmdLine);

    const [command, ...args] = cmd.toLowerCase().split(' ');
    let output = ['✗ Command not found'];

    if (terminal.commands[command]) {
      output = terminal.commands[command].exec(args);
    } else if (terminal.commands[`${command} ${args[0]}`]) {
      output = terminal.commands[`${command} ${args[0]}`].exec(args.slice(1));
    }

    output.forEach((line) => {
      const outLine = document.createElement('div');
      outLine.className = 'terminal-line output';
      outLine.textContent = line;
      content.appendChild(outLine);
    });

    content.scrollTop = content.scrollHeight;
  }
};

const themes = ['dark', 'light', 'ocean', 'violet', 'sunset', 'forest'];

const applyTheme = (theme) => {
  if (!themes.includes(theme)) return;

  document.body.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('shrp-theme', theme);
  } catch (_) {}

  document.querySelectorAll('.theme-option').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });

  const toggle = document.getElementById('theme-toggle-btn');
  if (toggle) {
    const icon = toggle.querySelector('.theme-icon');
    const text = toggle.querySelector('.theme-text');
    if (icon) icon.textContent = theme === 'light' ? '☾' : '☀';
    if (text) text.textContent = theme === 'light' ? 'DARK' : 'LIGHT';
  }
};

const initThemePicker = () => {
  const picker = document.getElementById('theme-picker');
  const toggle = document.getElementById('theme-toggle-btn');

  if (picker && toggle) {
    toggle.addEventListener('click', () => {
      picker.classList.toggle('show');
    });
  }

  document.querySelectorAll('.theme-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyTheme(btn.getAttribute('data-theme'));
      if (picker) picker.classList.remove('show');
    });
  });

  document.addEventListener('click', (e) => {
    if (!picker) return;
    if (!picker.contains(e.target) && e.target !== toggle) {
      picker.classList.remove('show');
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  terminal.init();
  initThemePicker();

  const saved = (() => {
    try {
      return localStorage.getItem('shrp-theme') || 'dark';
    } catch (_) {
      return 'dark';
    }
  })();
  applyTheme(saved);

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      terminal.isOpen ? terminal.close() : terminal.open();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'l' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      const current = document.body.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    }
  });
});

window.addEventListener('load', () => {
  const saved = (() => {
    try {
      return localStorage.getItem('shrp-theme') || 'dark';
    } catch (_) {
      return 'dark';
    }
  })();
  applyTheme(saved);
});
