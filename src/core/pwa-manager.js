/**
 * Progressive Web App (PWA) & Native File System Manager
 * Manages Service Worker lifecycle, offline detection, native desktop app installation
 * via beforeinstallprompt, and the HTML5 Native File System Access API.
 */

import { Toast } from '../components/toast.js';

export class PwaManager {
  constructor() {
    this.deferredPrompt = null;
    this.isStandalone = false;
    this.isOffline = false;
    this.currentFileHandle = null;
    this.listeners = new Set();

    if (typeof window !== 'undefined') {
      this.checkStandalone();
      this.initEventListeners();
    }
  }

  checkStandalone() {
    if (typeof window === 'undefined') return;
    this.isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
  }

  initEventListeners() {
    // 1. Capture PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.notifyListeners('installable', true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isStandalone = true;
      Toast.success('LetsEdit successfully installed as a native desktop application!');
      this.notifyListeners('installed', true);
    });

    // 2. Online / Offline network status listeners
    this.isOffline = !navigator.onLine;

    window.addEventListener('online', () => {
      this.isOffline = false;
      Toast.success('Connection restored. All cloud and sync capabilities online.');
      this.notifyListeners('network', { online: true });
      this.updateOfflineBadge(false);
    });

    window.addEventListener('offline', () => {
      this.isOffline = true;
      Toast.info('Working Offline: 100% of PDF tools run locally in browser WebAssembly.');
      this.notifyListeners('network', { online: false });
      this.updateOfflineBadge(true);
    });
  }

  updateOfflineBadge(isOffline) {
    if (typeof document === 'undefined') return;
    let badge = document.getElementById('pwa-offline-hud');
    if (isOffline) {
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'pwa-offline-hud';
        badge.className = 'pwa-offline-badge';
        badge.innerHTML = `
          <span class="offline-dot"></span>
          <span>Offline Mode (100% WASM)</span>
        `;
        document.body.appendChild(badge);
      }
      badge.style.display = 'flex';
    } else if (badge) {
      badge.style.display = 'none';
    }
  }

  /**
   * Prompt user to install LetsEdit Desktop App
   */
  async installPwa() {
    if (this.isStandalone) {
      Toast.info('LetsEdit is already running as an installed desktop app.');
      return { outcome: 'already-installed' };
    }

    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        Toast.success('Installing LetsEdit Desktop App...');
      }
      this.deferredPrompt = null;
      return choiceResult;
    }

    // Manual guidance when browser does not fire prompt automatically
    const isMac = navigator.userAgent.includes('Mac');
    const tip = isMac
      ? 'To install on macOS: Click the Install icon in the Safari/Chrome address bar or choose File > Add to Dock.'
      : 'To install on Windows: Click the Install App icon in the browser address bar (top right) or pin to taskbar.';
    Toast.info(tip);
    return { outcome: 'manual-prompt', tip };
  }

  /**
   * Register Service Worker
   */
  async registerServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      return reg;
    } catch (err) {
      console.warn('[PWA] Service worker registration notice:', err);
      return null;
    }
  }

  /**
   * Native File System Access API - Direct Open
   */
  async openLocalPdfWithFsApi() {
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: 'PDF Documents',
              accept: { 'application/pdf': ['.pdf'] }
            }
          ],
          multiple: false
        });
        if (handle) {
          this.currentFileHandle = handle;
          const file = await handle.getFile();
          return { file, handle };
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[PWA] FS API open notice:', err);
        }
      }
    }
    return null;
  }

  /**
   * Native File System Access API - Direct Save
   */
  async saveLocalPdfWithFsApi(pdfBytes, defaultName = 'Document_Edited.pdf') {
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: defaultName,
          types: [
            {
              description: 'PDF Document',
              accept: { 'application/pdf': ['.pdf'] }
            }
          ]
        });

        if (handle) {
          const writable = await handle.createWritable();
          await writable.write(pdfBytes);
          await writable.close();
          this.currentFileHandle = handle;
          return { success: true, name: handle.name };
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[PWA] FS API save notice:', err);
        }
        return { success: false, aborted: err.name === 'AbortError' };
      }
    }
    return { success: false, fallback: true };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(type, data) {
    this.listeners.forEach(fn => {
      try {
        fn(type, data);
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export const pwaManager = new PwaManager();
