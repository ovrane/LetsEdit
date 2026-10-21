/**
 * Modern Toast Notifications
 */

export class Toast {
  static container = null;

  static init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  static show(message, type = 'info', duration = 3500) {
    this.init();
    const item = document.createElement('div');
    item.className = `toast-item toast-${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    item.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    `;

    item.querySelector('.toast-close').onclick = () => {
      item.classList.add('toast-fadeout');
      setTimeout(() => item.remove(), 250);
    };

    this.container.appendChild(item);

    setTimeout(() => {
      if (item.parentNode) {
        item.classList.add('toast-fadeout');
        setTimeout(() => item.remove(), 250);
      }
    }, duration);
  }

  static success(msg, duration) { this.show(msg, 'success', duration); }
  static error(msg, duration) { this.show(msg, 'error', duration); }
  static info(msg, duration) { this.show(msg, 'info', duration); }
  static warning(msg, duration) { this.show(msg, 'warning', duration); }
}
