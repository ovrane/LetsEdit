/**
 * Global Theme Manager (Light Mode Standard)
 * Dark mode has been removed per product design specifications.
 * Enforces clean, high-contrast, professional light mode across all views.
 */

export function getPreferredTheme() {
  return 'light';
}

export function applyTheme() {
  if (typeof document === 'undefined') return;

  document.body.classList.remove('dark-mode');
  document.documentElement.removeAttribute('data-theme');

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('pdf_editor_theme');
  }
}

export function toggleTheme() {
  applyTheme();
  return 'light';
}
