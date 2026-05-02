// ── ArjunaFit Theme Manager ──
const Theme = {
  STORAGE_KEY: 'af_theme',

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.apply(theme, false);
  },

  get() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  apply(theme, animate = true) {
    if (animate) {
      document.documentElement.style.transition = 'background .3s, color .3s';
    }
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateToggle(theme);
  },

  toggle() {
    const current = this.get();
    this.apply(current === 'dark' ? 'light' : 'dark');
  },

  updateToggle(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    });
  }
};

// Auto-init on load
Theme.init();

// Expose globally
window.Theme = Theme;
window.toggleTheme = () => Theme.toggle();
