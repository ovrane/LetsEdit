/**
 * Mobile Pairing Web Page Component (/mobile_pair)
 * High-performance mobile web app for smartphone camera document scanning
 * and smooth touch signature capture. Transmits directly to paired desktop session.
 */

import { Toast } from './toast.js';

export class MobilePairPage {
  constructor() {
    this.container = null;
    this.sessionId = null;
    this.action = 'camera';
    this.stream = null;
    this.broadcastChannel = null;
    this.currentDataUrl = null;
    this.enhanceMode = 'color'; // 'color' | 'contrast'
  }

  mount(targetContainer) {
    this.container = targetContainer;
    this.parseParams();
    this.render();
    this.notifyConnected();
  }

  parseParams() {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    this.sessionId = url.searchParams.get('session') || 'demo_session';
    this.action = url.searchParams.get('action') || 'camera';

    if (typeof BroadcastChannel !== 'undefined' && this.sessionId) {
      this.broadcastChannel = new BroadcastChannel(`letsedit_pair_${this.sessionId}`);
    }
  }

  async notifyConnected() {
    if (!this.sessionId) return;
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'connected', sessionId: this.sessionId });
    }
    try {
      await fetch(`/api/mobile-pair/connect/${this.sessionId}`, { method: 'POST' });
    } catch (e) {
      // Offline fallback
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="mobile-pair-wrapper" style="min-height: 100vh; background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column;">
        <!-- Mobile Header Bar -->
        <header style="padding: 14px 18px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 8px; background: #30050d; color: #f43f5e; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">
              L
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 700; color: white;">Lets<span style="color: #f43f5e;">Edit</span> Mobile</div>
              <div style="font-size: 11px; color: #94a3b8;">${this.action === 'sign' ? 'Touch Signature' : 'Document Camera'}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); padding: 4px 10px; border-radius: 9999px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
            <span style="font-size: 11px; font-weight: 700; color: #10b981;">PAIRED</span>
          </div>
        </header>

        <!-- Main Workspace -->
        <main style="flex: 1; padding: 20px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 480px; width: 100%; margin: 0 auto; box-sizing: border-box;">
          ${this.action === 'sign' ? this.renderSignatureUI() : this.renderCameraUI()}
        </main>
      </div>
    `;

    if (this.action === 'sign') {
      this.initSignaturePad();
    } else {
      this.initCameraControls();
    }
  }

  renderCameraUI() {
    return `
      <div id="camera-capture-view" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
        <!-- Live Viewfinder or Snapshot Preview -->
        <div style="width: 100%; height: 380px; background: #020617; border-radius: 16px; overflow: hidden; position: relative; border: 2px dashed #475569; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <video id="mobile-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover; display: none;"></video>
          <img id="mobile-preview-img" style="width: 100%; height: 100%; object-fit: contain; display: none;" />
          <canvas id="mobile-canvas" style="display: none;"></canvas>

          <!-- Guide Overlay Lines -->
          <div id="camera-guides" style="position: absolute; inset: 20px; border: 1.5px dashed rgba(255, 255, 255, 0.4); border-radius: 8px; pointer-events: none; display: flex; align-items: center; justify-content: center;">
            <span style="background: rgba(0,0,0,0.6); padding: 4px 10px; border-radius: 4px; font-size: 11px; color: rgba(255,255,255,0.8);">Align document within frame</span>
          </div>

          <div id="camera-empty-placeholder" style="text-align: center; padding: 20px;">
            <svg width="48" height="48" fill="none" stroke="#64748b" stroke-width="1.8" viewBox="0 0 24 24" style="margin-bottom: 12px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <p style="font-size: 14px; color: #94a3b8; margin: 0;">Tap button below to snap document</p>
          </div>
        </div>

        <!-- Hidden Native File Input with Environment Camera Capture -->
        <input type="file" id="mobile-native-file-input" accept="image/*" capture="environment" style="display: none;" />

        <!-- Actions -->
        <div style="width: 100%; display: flex; flex-direction: column; gap: 12px;">
          <!-- Snap Button -->
          <button type="button" id="btn-snap-photo" style="width: 100%; background: #30050d; color: white; border: none; border-radius: 12px; padding: 15px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 14px rgba(48, 5, 13, 0.4);">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>Take Photo of Document</span>
          </button>

          <!-- Transmit Button (Visible after photo taken) -->
          <button type="button" id="btn-transmit-photo" style="width: 100%; background: #10b981; color: white; border: none; border-radius: 12px; padding: 15px; font-size: 16px; font-weight: 700; display: none; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
            <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Transmit to Desktop Screen</span>
          </button>

          <button type="button" id="btn-retake-photo" style="width: 100%; background: transparent; color: #94a3b8; border: 1px solid #475569; border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; display: none;">
            Retake Photo
          </button>
        </div>
      </div>

      <!-- Transmission Success Card -->
      <div id="camera-success-view" style="display: none; text-align: center; padding: 40px 20px;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: white; margin: 0 0 8px;">Transmitted!</h2>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0 0 24px;">Your document has been sent directly to your desktop workspace.</p>
        <button type="button" id="btn-take-another" style="background: #334155; color: white; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600;">Take Another Photo</button>
      </div>
    `;
  }

  renderSignatureUI() {
    return `
      <div id="signature-capture-view" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 100%; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; font-weight: 600; color: #94a3b8;">Draw signature with finger/stylus:</span>
          <button type="button" id="btn-clear-sig" style="background: transparent; border: none; color: #f43f5e; font-size: 12px; font-weight: 700; cursor: pointer; padding: 4px 8px;">Clear</button>
        </div>

        <div style="width: 100%; height: 260px; background: white; border-radius: 16px; overflow: hidden; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.4); touch-action: none; margin-bottom: 20px;">
          <canvas id="mobile-sig-canvas" width="600" height="340" style="width: 100%; height: 100%; touch-action: none;"></canvas>
          <div style="position: absolute; bottom: 35px; left: 30px; right: 30px; height: 1.5px; background: #cbd5e1; pointer-events: none;"></div>
          <span style="position: absolute; bottom: 14px; left: 32px; font-size: 11px; color: #94a3b8; pointer-events: none; font-family: monospace;">✕ Sign above the line</span>
        </div>

        <div style="width: 100%; display: flex; gap: 12px;">
          <button type="button" id="btn-transmit-sig" style="flex: 1; background: #30050d; color: white; border: none; border-radius: 12px; padding: 15px; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 14px rgba(48, 5, 13, 0.4);">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Send Signature to Desktop</span>
          </button>
        </div>
      </div>

      <div id="sig-success-view" style="display: none; text-align: center; padding: 40px 20px;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: white; margin: 0 0 8px;">Signature Transmitted!</h2>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0 0 24px;">Your signature has been placed on your desktop document.</p>
        <button type="button" id="btn-sign-again" style="background: #334155; color: white; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600;">Draw Another Signature</button>
      </div>
    `;
  }

  initCameraControls() {
    const snapBtn = this.container.querySelector('#btn-snap-photo');
    const transmitBtn = this.container.querySelector('#btn-transmit-photo');
    const retakeBtn = this.container.querySelector('#btn-retake-photo');
    const fileInp = this.container.querySelector('#mobile-native-file-input');
    const previewImg = this.container.querySelector('#mobile-preview-img');
    const emptyPlaceholder = this.container.querySelector('#camera-empty-placeholder');
    const guides = this.container.querySelector('#camera-guides');
    const successView = this.container.querySelector('#camera-success-view');
    const captureView = this.container.querySelector('#camera-capture-view');
    const takeAnotherBtn = this.container.querySelector('#btn-take-another');

    snapBtn.onclick = () => {
      fileInp.click();
    };

    fileInp.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          this.currentDataUrl = reader.result;
          previewImg.src = reader.result;
          previewImg.style.display = 'block';
          emptyPlaceholder.style.display = 'none';
          guides.style.display = 'none';
          snapBtn.style.display = 'none';
          transmitBtn.style.display = 'flex';
          retakeBtn.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    };

    retakeBtn.onclick = () => {
      this.currentDataUrl = null;
      previewImg.style.display = 'none';
      emptyPlaceholder.style.display = 'block';
      guides.style.display = 'flex';
      snapBtn.style.display = 'flex';
      transmitBtn.style.display = 'none';
      retakeBtn.style.display = 'none';
      fileInp.value = '';
    };

    transmitBtn.onclick = async () => {
      if (!this.currentDataUrl) return;
      transmitBtn.disabled = true;
      transmitBtn.textContent = 'Transmitting...';

      await this.transmitPayload({
        dataUrl: this.currentDataUrl,
        filename: `Mobile_Scan_${Date.now()}.jpg`,
        mimeType: 'image/jpeg'
      });

      captureView.style.display = 'none';
      successView.style.display = 'block';
    };

    if (takeAnotherBtn) {
      takeAnotherBtn.onclick = () => {
        captureView.style.display = 'flex';
        successView.style.display = 'none';
        retakeBtn.click();
      };
    }
  }

  initSignaturePad() {
    const canvas = this.container.querySelector('#mobile-sig-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let points = [];

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      isDrawing = true;
      points = [getPos(e)];
    };

    const moveDraw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pt = getPos(e);
      points.push(pt);

      if (points.length >= 3) {
        const xc = (points[points.length - 2].x + points[points.length - 1].x) / 2;
        const yc = (points[points.length - 2].y + points[points.length - 1].y) / 2;
        ctx.beginPath();
        ctx.moveTo(points[points.length - 3].x, points[points.length - 3].y);
        ctx.quadraticCurveTo(points[points.length - 2].x, points[points.length - 2].y, xc, yc);
        ctx.stroke();
      }
    };

    const endDraw = () => {
      isDrawing = false;
      points = [];
    };

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', moveDraw, { passive: false });
    canvas.addEventListener('touchend', endDraw);
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', moveDraw);
    canvas.addEventListener('mouseup', endDraw);

    const clearBtn = this.container.querySelector('#btn-clear-sig');
    clearBtn.onclick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const transmitBtn = this.container.querySelector('#btn-transmit-sig');
    const captureView = this.container.querySelector('#signature-capture-view');
    const successView = this.container.querySelector('#sig-success-view');

    transmitBtn.onclick = async () => {
      const dataUrl = canvas.toDataURL('image/png');
      transmitBtn.disabled = true;
      transmitBtn.textContent = 'Transmitting...';

      await this.transmitPayload({
        dataUrl,
        filename: `Mobile_Signature_${Date.now()}.png`,
        mimeType: 'image/png'
      });

      captureView.style.display = 'none';
      successView.style.display = 'block';
    };

    const signAgainBtn = this.container.querySelector('#btn-sign-again');
    if (signAgainBtn) {
      signAgainBtn.onclick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        transmitBtn.disabled = false;
        transmitBtn.innerHTML = `<span>Send Signature to Desktop</span>`;
        captureView.style.display = 'flex';
        successView.style.display = 'none';
      };
    }
  }

  async transmitPayload(payload) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'completed',
        sessionId: this.sessionId,
        payload
      });
    }

    try {
      await fetch(`/api/mobile-pair/submit/${this.sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: payload.dataUrl,
          filename: payload.filename,
          mimeType: payload.mimeType
        })
      });
    } catch (e) {
      console.warn('Network transmit error:', e);
    }
  }
}

export const mobilePairPage = new MobilePairPage();
