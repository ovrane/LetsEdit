/**
 * Global Theme Manager
 * Manages light / dark theme persistence, class toggling, and icon updates across all views.
 */

export function getPreferredTheme() {
  const saved = localStorage.getItem('pdf_editor_theme');
  if (saved) return saved;
  return 'light';
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return;

  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  localStorage.setItem('pdf_editor_theme', theme);

  // Update icons in studio navbar
  const studioSun = document.getElementById('theme-icon-sun');
  const studioMoon = document.getElementById('theme-icon-moon');
  if (studioSun) studioSun.style.display = isDark ? 'block' : 'none';
  if (studioMoon) studioMoon.style.display = isDark ? 'none' : 'block';

  // Update icons in landing header
  const landingSun = document.getElementById('landing-theme-sun');
  const landingMoon = document.getElementById('landing-theme-moon');
  if (landingSun) landingSun.style.display = isDark ? 'block' : 'none';
  if (landingMoon) landingMoon.style.display = isDark ? 'none' : 'block';
}

export function toggleTheme() {
  const current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
