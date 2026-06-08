/**
 * Quiet Corner — apply archetype theme from cosData config.
 * Include after qc-data.js on any app page.
 */
(function (global) {
  const ARCHETYPE_ROOMS = {
    wren: { file: 'book-nook.html', label: 'Book Nook' },
    patches: { file: 'cat-gremlin.html', label: 'Cat Gremlin' },
    sage: { file: 'cottagecore.html', label: 'Cottagecore' },
    apex: { file: 'stem-commander.html', label: 'STEM Commander' },
    archivist: { file: 'retro-academia.html', label: 'Retro Academia' },
  };

  const DEFAULT_ARCHETYPE = 'wren';

  async function getArchetype() {
    if (typeof cosData === 'undefined') return DEFAULT_ARCHETYPE;
    if (cosData.applyOnboardingFromUrl) await cosData.applyOnboardingFromUrl();
    try {
      const config = await cosData.getConfig();
      return config?.preferences?.archetype || DEFAULT_ARCHETYPE;
    } catch {
      return DEFAULT_ARCHETYPE;
    }
  }

  async function applyTheme() {
    const arch = await getArchetype();
    const root = document.documentElement;
    root.dataset.archetype = arch;
    root.classList.remove(
      'cos-theme-wren', 'cos-theme-patches', 'cos-theme-sage',
      'cos-theme-apex', 'cos-theme-archivist'
    );
    root.classList.add('cos-theme-' + arch);
    return arch;
  }

  function roomHref(archetype) {
    return ARCHETYPE_ROOMS[archetype]?.file || 'book-nook.html';
  }

  const NAV_LINKS = [
    { href: 'classroom-os.html', label: 'Hub', key: 'hub' },
    { href: 'book-nook.html', label: 'Book Nook', key: 'book-nook.html' },
    { href: 'cat-gremlin.html', label: 'Cat Gremlin', key: 'cat-gremlin.html' },
    { href: 'cottagecore.html', label: 'Cottagecore', key: 'cottagecore.html' },
    { href: 'stem-commander.html', label: 'STEM', key: 'stem-commander.html' },
    { href: 'retro-academia.html', label: 'Retro Academia', key: 'retro-academia.html' },
    { href: 'records.html', label: 'Records', key: 'records' },
  ];

  /**
   * Render bottom theme nav. active: 'hub' | 'records' | filename
   */
  async function renderThemeNav(active, containerId) {
    const el = document.getElementById(containerId || 'cos-theme-nav');
    if (!el) return;
    await getArchetype();
    const page = active === 'room'
      ? (global.location?.pathname?.split('/').pop() || '')
      : active;
    el.innerHTML = NAV_LINKS.map((p) => {
      const isActive = page === p.key || (active === 'hub' && p.key === 'hub') || (active === 'records' && p.key === 'records');
      return `<a href="${p.href}" class="${isActive ? 'active' : ''}">${p.label}</a>`;
    }).join('');
  }

  async function bootApp(options) {
    const opts = options || {};
    await applyTheme();
    if (opts.nav) await renderThemeNav(opts.nav, opts.navId);
    if (opts.requireOnboarding && typeof cosData !== 'undefined') {
      const config = await cosData.getConfig();
      if (!config?.onboardingComplete) {
        window.location.href = 'onboarding.html';
        return null;
      }
    }
    return getArchetype();
  }

  global.cosTheme = {
    applyTheme,
    getArchetype,
    renderThemeNav,
    bootApp,
    roomHref,
    ARCHETYPE_ROOMS,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyTheme());
  } else {
    applyTheme();
  }
})(typeof window !== 'undefined' ? window : globalThis);
