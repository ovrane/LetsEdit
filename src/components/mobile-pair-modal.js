/**
 * Mobile Camera & Touch Signature Pairing Modal Component
 * Displays a real-time vector QR code for smartphone pairing.
 * Supports document camera capture and high-precision touchscreen signatures.
 */

import { generateQrSvg } from '../utils/helpers.js';
import { Toast } from './toast.js';

export class MobilePairModal {
  constructor() {
    this.modal = null;
    this.sessionId = null;
    this.pollInterval = null;
    this.broadcastChannel = null;
    this.onCompleteCallback = null;
    this.activeAction = 'camera';
    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modal = document.createElement('div');
    this.modal.id = 'mobile-pair-modal';
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px; width: 95%;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(48, 5, 13, 0.08); color: var(--primary); display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
              </svg>
            </div>
            <div>
              <h2 class="modal-title" id="mobile-pair-title" style="margin: 0; font-size: 17px;">Pair Smartphone Camera</h2>
              <p class="modal-subtitle" id="mobile-pair-subtitle" style="margin: 0; font-size: 12px; color: var(--text-muted);">Scan QR code to capture documents or signatures on mobile</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-mobile-pair">&times;</button>
        </div>

        <div class="modal-body" style="padding: 24px; text-align: center;">
          <!-- QR Code Container -->
          <div id="mobile-pair-qr-box" style="background: white; padding: 16px; border-radius: 16px; display: inline-block; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid var(--border-subtle); margin-bottom: 16px; min-height: 220px; min-width: 220px;">
            <div class="spinner" style="width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 80px auto;"></div>
          </div>

          <!-- Live Status Indicator -->
          <div id="mobile-pair-status-bar" style="display: inline-flex; align-items: center; gap: 8px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 9999px; padding: 6px 16px; margin-bottom: 18px; font-size: 13px; font-weight: 600; color: var(--text-main);">
            <span id="mobile-pair-pulse-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; display: inline-block; box-shadow: 0 0 8px #f59e0b;"></span>
            <span id="mobile-pair-status-text">Waiting for phone to scan...</span>
          </div>

          <!-- Instructions Card -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 14px 18px; text-align: left; margin-bottom: 18px; font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
            <div style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 6px;">
              <span style="background: var(--primary); color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;">1</span>
              <span>Open the camera app on your iPhone or Android smartphone.</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 6px;">
              <span style="background: var(--primary); color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;">2</span>
              <span>Scan the QR code to open the instant mobile capture screen (no app install required).</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="background: var(--primary); color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;">3</span>
              <span id="mobile-pair-step3-text">Snap paper pages or documents. Photos instantly appear on this screen!</span>
            </div>
          </div>

          <!-- Manual Link Fallback & Testing -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="text" id="mobile-pair-url-input" readonly style="flex: 1; padding: 8px 12px; font-size: 12px; font-family: monospace; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-surface); color: var(--text-muted); text-overflow: ellipsis;" />
            <button class="btn btn-sm btn-outline" id="btn-copy-pair-url" title="Copy direct pairing link">Copy Link</button>
            <button class="btn btn-sm btn-outline" id="btn-open-pair-tab" title="Open mobile view in new tab for testing">Open Tab</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    this.modal.querySelector('#btn-close-mobile-pair').onclick = () => this.close();
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    const copyBtn = this.modal.querySelector('#btn-copy-pair-url');
    const openBtn = this.modal.querySelector('#btn-open-pair-tab');
    const urlInput = this.modal.querySelector('#mobile-pair-url-input');

    if (copyBtn) {
      copyBtn.onclick = async () => {
        if (urlInput && urlInput.value) {
          try {
            await navigator.clipboard.writeText(urlInput.value);
            Toast.success('Pairing URL copied to clipboard!');
          } catch (e) {
            urlInput.select();
            document.execCommand('copy');
            Toast.success('Pairing URL copied!');
          }
        }
      };
    }

    if (openBtn) {
      openBtn.onclick = () => {
        if (urlInput && urlInput.value) {
          window.open(urlInput.value, '_blank');
        }
      };
    }
  }

  async open({ action = 'camera', title = null, subtitle = null, onComplete = null } = {}) {
    if (!this.modal) return;
    this.activeAction = action;
    this.onCompleteCallback = onComplete;
    this.modal.style.display = 'flex';

    const titleEl = this.modal.querySelector('#mobile-pair-title');
    const subEl = this.modal.querySelector('#mobile-pair-subtitle');
    const step3El = this.modal.querySelector('#mobile-pair-step3-text');
    const statusText = this.modal.querySelector('#mobile-pair-status-text');
    const pulseDot = this.modal.querySelector('#mobile-pair-pulse-dot');
    const qrBox = this.modal.querySelector('#mobile-pair-qr-box');
    const urlInput = this.modal.querySelector('#mobile-pair-url-input');

    if (action === 'sign') {
      if (titleEl) titleEl.textContent = title || 'Draw Signature on Mobile Phone';
      if (subEl) subEl.textContent = subtitle || 'Scan QR code to draw smooth ink signature using phone touchscreen';
      if (step3El) step3El.textContent = 'Draw your signature on the smartphone screen. It instantly embeds on your document!';
    } else {
      if (titleEl) titleEl.textContent = title || 'Pair Smartphone Camera';
      if (subEl) subEl.textContent = subtitle || 'Scan QR code to capture documents or signatures on mobile';
      if (step3El) step3El.textContent = 'Snap paper pages or documents. Photos instantly appear on this screen!';
    }

    if (statusText) statusText.textContent = 'Generating secure pairing session...';
    if (pulseDot) {
      pulseDot.style.background = '#f59e0b';
      pulseDot.style.boxShadow = '0 0 8px #f59e0b';
    }

    try {
      // 1. Request pairing session from backend
      let sessId = null;
      try {
        const resp = await fetch('/api/mobile-pair/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });
        if (resp.ok) {
          const data = await resp.json();
          sessId = data.sessionId;
        }
      } catch (e) {
        console.warn('Backend pairing session creation error, falling back to client session:', e);
      }

      if (!sessId) {
        sessId = 'client_pair_' + Math.random().toString(36).substring(2, 10);
      }
      this.sessionId = sessId;

      // 2. Build direct mobile pairing URL
      const origin = window.location.origin;
      const pairUrl = `${origin}/mobile_pair?session=${sessId}&action=${action}`;
      if (urlInput) urlInput.value = pairUrl;

      // 3. Render vector QR code
      const qrSvg = generateQrSvg(pairUrl, 220);
      if (qrBox) qrBox.innerHTML = qrSvg;

      if (statusText) statusText.textContent = 'Waiting for smartphone to scan...';

      // 4. Listen on BroadcastChannel for instant local / cross-tab updates
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel(`letsedit_pair_${sessId}`);
        this.broadcastChannel.onmessage = (event) => {
          const msg = event.data;
          if (msg && msg.type === 'connected') {
            this.handlePhoneConnected();
          } else if (msg && msg.type === 'completed' && msg.payload) {
            this.handlePayloadReceived(msg.payload);
          }
        };
      }

      // 5. Start Polling backend for mobile phone status
      this.startPolling(sessId);

    } catch (err) {
      console.error('Mobile pairing initialization error:', err);
      Toast.error('Could not initialize pairing session: ' + err.message);
    }
  }

  handlePhoneConnected() {
    const statusText = this.modal.querySelector('#mobile-pair-status-text');
    const pulseDot = this.modal.querySelector('#mobile-pair-pulse-dot');
    if (statusText) statusText.textContent = 'Smartphone connected! Capturing...';
    if (pulseDot) {
      pulseDot.style.background = '#0ea5e9';
      pulseDot.style.boxShadow = '0 0 8px #0ea5e9';
    }
  }

  handlePayloadReceived(payload) {
    this.stopPolling();
    const statusText = this.modal.querySelector('#mobile-pair-status-text');
    const pulseDot = this.modal.querySelector('#mobile-pair-pulse-dot');
    if (statusText) statusText.textContent = 'Photo received! Importing...';
    if (pulseDot) {
      pulseDot.style.background = '#10b981';
      pulseDot.style.boxShadow = '0 0 8px #10b981';
    }

    Toast.success(this.activeAction === 'sign' ? 'Signature received from phone!' : 'Photo received from smartphone camera!');

    if (this.onCompleteCallback) {
      this.onCompleteCallback(payload);
    }

    setTimeout(() => {
      this.close();
    }, 700);
  }

  startPolling(sessionId) {
    this.stopPolling();
    this.pollInterval = setInterval(async () => {
      try {
        const resp = await fetch(`/api/mobile-pair/session/${sessionId}`);
        if (!resp.ok) return;
        const data = await resp.json();

        if (data.status === 'connected') {
          this.handlePhoneConnected();
        } else if (data.status === 'completed' && data.payload) {
          this.handlePayloadReceived(data.payload);
        }
      } catch (e) {
        // Silent polling error
      }
    }, 1200);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }

  close() {
    this.stopPolling();
    if (this.modal) this.modal.style.display = 'none';
  }
}

export const mobilePairModal = new MobilePairModal();
