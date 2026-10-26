/**
 * Recipient Signing Experience Portal (`/sign_document?token=...`)
 * Reverse-engineered from iLovePDF & Adobe Acrobat Sign architectures.
 * Provides a streamlined, mobile-responsive portal for invited signers to:
 * 1. View document with guided navigation to assigned signature and form fields.
 * 2. Sign fields using Draw, Type, Phone (QR), or Upload.
 * 3. Submit cryptographically verified signature payloads to the backend API.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { Toast } from './toast.js';
import { mobilePairModal } from './mobile-pair-modal.js';

class RecipientSignPage {
  constructor() {
    this.container = null;
    this.token = null;
    this.sessionData = null;
    this.pdfJsDoc = null;
    this.fieldValues = {};
    this.currentPage = 1;
    this.totalPages = 1;
    this.activeFieldId = null;
  }

  async mount(container, token) {
    this.container = container;
    this.token = token || new URLSearchParams(window.location.search).get('token');
    this.fieldValues = {};

    if (!this.token) {
      this.renderError('Missing or invalid signing token in URL.');
      return;
    }

    this.renderLoading();

    try {
      const res = await fetch(`/api/signatures/recipient/${encodeURIComponent(this.token)}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load document for signing.');
      }

      this.sessionData = data;

      // Check if already signed
      if (data.recipient.status === 'signed') {
        this.renderAlreadySigned();
        return;
      }

      // Load PDF.js document
      const binStr = atob(data.documentBase64);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);

      this.pdfJsDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      this.totalPages = this.pdfJsDoc.numPages || 1;

      this.render();
      await this.renderDocumentPages();
    } catch (err) {
      this.renderError(err.message);
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-base, #f8fafc); font-family: sans-serif;">
        <div style="text-align: center;">
          <div class="workflow-spinner" style="width: 44px; height: 44px; margin: 0 auto 16px;"></div>
          <h2 style="font-size: 18px; color: var(--text-main, #0f172a); margin: 0 0 6px;">Loading Document...</h2>
          <p style="font-size: 13px; color: var(--text-muted, #64748b); margin: 0;">Establishing secure e-Sign session</p>
        </div>
      </div>
    `;
  }

  renderError(msg) {
    this.container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-base, #f8fafc); padding: 20px; font-family: sans-serif;">
        <div style="max-width: 440px; background: var(--bg-card, #fff); border: 1px solid var(--border-subtle, #e2e8f0); border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 style="font-size: 18px; color: var(--text-main, #0f172a); margin: 0 0 8px;">Invalid Signing Session</h2>
          <p style="font-size: 13px; color: var(--text-muted, #64748b); line-height: 1.5; margin: 0 0 20px;">${msg}</p>
          <a href="/" class="btn btn-primary" style="display: inline-block; padding: 10px 20px; text-decoration: none;">Return to Home</a>
        </div>
      </div>
    `;
  }

  renderAlreadySigned() {
    this.container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-base, #f8fafc); padding: 20px; font-family: sans-serif;">
        <div style="max-width: 480px; background: var(--bg-card, #fff); border: 1px solid var(--border-subtle, #e2e8f0); border-radius: 12px; padding: 36px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: #d1fae5; color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style="font-size: 20px; color: var(--text-main, #0f172a); margin: 0 0 8px;">Document Already Signed</h2>
          <p style="font-size: 13px; color: var(--text-muted, #64748b); line-height: 1.5; margin: 0 0 24px;">
            You have already completed your signature on <strong>${this.sessionData.documentName}</strong>. All responses have been cryptographically sealed.
          </p>
          <a href="/api/signatures/request/${this.sessionData.requestId}/download" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; text-decoration: none;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
            <span>Download Signed Copy</span>
          </a>
        </div>
      </div>
    `;
  }

  render() {
    const { documentName, senderName, recipient, fields = [] } = this.sessionData;
    const unfilledCount = fields.filter(f => !this.fieldValues[f.id]).length;

    this.container.innerHTML = `
      <div class="recipient-sign-layout">
        <!-- Executive Top Navigation Bar -->
        <header class="rec-header">
          <div class="rec-header-inner">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="lets-logo" style="cursor: pointer;">
                <div class="lets-logo-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="9" height="9" rx="2.8" fill="#EE404C"/>
                    <rect x="13" y="2" width="9" height="9" rx="2.8" fill="#00B4D8"/>
                    <rect x="2" y="13" width="9" height="9" rx="2.8" fill="#2F74EE"/>
                    <rect x="13" y="13" width="9" height="9" rx="2.8" fill="#F0A500"/>
                  </svg>
                </div>
                <span class="lets-logo-text">Lets<span class="lets-logo-accent">Sign</span></span>
              </div>
              <div class="rec-doc-meta">
                <strong style="font-size: 14px; color: var(--text-main); display: block;">${documentName}</strong>
                <span style="font-size: 11.5px; color: var(--text-muted);">Requested by ${senderName}</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="rec-signer-badge" style="border-left: 3px solid ${recipient.color}; padding: 4px 10px; background: var(--bg-surface); border-radius: 6px; font-size: 12px;">
                <span>Signer: <strong>${recipient.name}</strong></span>
              </div>
              <button type="button" id="btn-finish-signing" class="btn btn-sm btn-primary" style="background: linear-gradient(135deg, #30050d 0%, #520815 100%); padding: 10px 20px; font-weight: 600; box-shadow: 0 4px 12px rgba(48,5,13,0.3);">
                <span>Finish & Sign</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Guided Floating Action Bar -->
        <div class="rec-guidance-bar">
          <span id="rec-unfilled-indicator" style="font-size: 13px; font-weight: 600; color: var(--text-main);">
            ${unfilledCount > 0 ? `👉 ${unfilledCount} field${unfilledCount === 1 ? '' : 's'} remaining for you to complete` : '✅ All required fields completed!'}
          </span>
          ${unfilledCount > 0 ? `
            <button type="button" id="btn-next-unfilled" class="btn btn-xs btn-outline" style="gap: 6px; border-radius: 20px; font-weight: 600;">
              <span>Next Field</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
            </button>
          ` : ''}
        </div>

        <!-- Scrollable Document Viewport -->
        <main class="rec-document-viewport" id="rec-doc-viewport">
          <div class="rec-pages-stack" id="rec-pages-stack">
            <!-- Canvas pages and field overlays rendered here -->
          </div>
        </main>
      </div>
    `;

    this.bindTopEvents();
  }

  async renderDocumentPages() {
    const stack = this.container.querySelector('#rec-pages-stack');
    if (!stack || !this.pdfJsDoc) return;

    stack.innerHTML = '';
    const fields = this.sessionData.fields || [];

    for (let p = 1; p <= this.totalPages; p++) {
      const page = await this.pdfJsDoc.getPage(p);
      const viewport = page.getViewport({ scale: 1.25 });

      const pageWrap = document.createElement('div');
      pageWrap.className = 'rec-page-container';
      pageWrap.setAttribute('data-page', p);
      pageWrap.style.width = `${viewport.width}px`;
      pageWrap.style.height = `${viewport.height}px`;

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      pageWrap.appendChild(canvas);

      // Render interactive fields assigned to this page
      const pageFields = fields.filter(f => f.page === p - 1);
      const overlay = document.createElement('div');
      overlay.className = 'rec-page-overlay';
      overlay.style.width = `${viewport.width}px`;
      overlay.style.height = `${viewport.height}px`;

      pageFields.forEach(f => {
        const fieldEl = document.createElement('div');
        fieldEl.className = `rec-target-field ${this.fieldValues[f.id] ? 'filled' : 'unfilled'}`;
        fieldEl.id = `rec-field-${f.id}`;
        fieldEl.style.left = `${f.x}px`;
        fieldEl.style.top = `${f.y}px`;
        fieldEl.style.width = `${f.width}px`;
        fieldEl.style.height = `${f.height}px`;

        this.renderFieldContent(fieldEl, f);

        fieldEl.onclick = () => this.handleFieldClick(f, fieldEl);
        overlay.appendChild(fieldEl);
      });

      pageWrap.appendChild(overlay);
      stack.appendChild(pageWrap);
    }
  }

  renderFieldContent(el, f) {
    const val = this.fieldValues[f.id];
    if (val) {
      if (f.type === 'signature' || f.type === 'initials') {
        el.innerHTML = `
          <img src="${val}" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block; margin: auto;" />
        `;
      } else if (f.type === 'checkbox') {
        el.innerHTML = `<span style="font-size: 16px; font-weight: bold; color: #10b981;">✔</span>`;
      } else {
        el.innerHTML = `<span style="font-size: 12px; font-weight: 600; color: #0f172a; padding: 4px;">${val}</span>`;
      }
    } else {
      const typeIcons = { signature: '🖊️', initials: '✍️', date: '📅', text: '📝', checkbox: '☑️' };
      el.innerHTML = `
        <div class="field-prompt-pill">
          <span>${typeIcons[f.type] || '🖊️'}</span>
          <span>Click to ${f.type === 'checkbox' ? 'Check' : 'Sign'}</span>
        </div>
      `;
    }
  }

  handleFieldClick(f, el) {
    if (f.type === 'checkbox') {
      this.fieldValues[f.id] = !this.fieldValues[f.id];
      this.renderFieldContent(el, f);
      this.updateGuidanceBar();
      return;
    }

    if (f.type === 'date') {
      const today = new Date().toISOString().split('T')[0];
      this.fieldValues[f.id] = today;
      this.renderFieldContent(el, f);
      this.updateGuidanceBar();
      Toast.success('Date stamped.');
      return;
    }

    if (f.type === 'text') {
      const cur = this.fieldValues[f.id] || '';
      const input = prompt(`Enter ${f.label || 'text'}:`, cur);
      if (input !== null) {
        this.fieldValues[f.id] = input.trim();
        this.renderFieldContent(el, f);
        this.updateGuidanceBar();
      }
      return;
    }

    // Signature or Initials: open signature capture modal
    this.openSignaturePadModal(f, el);
  }

  openSignaturePadModal(f, el) {
    const modalWrap = document.createElement('div');
    modalWrap.className = 'rec-sig-modal-overlay';
    document.body.appendChild(modalWrap);

    let activeTab = 'draw';
    let drawnDataUrl = null;

    const renderModal = () => {
      modalWrap.innerHTML = `
        <div class="rec-sig-modal-box">
          <div class="rec-sig-modal-header">
            <h3>Adopt Your ${f.type === 'initials' ? 'Initials' : 'Signature'}</h3>
            <button type="button" class="btn-icon" id="btn-close-sig-pad">✕</button>
          </div>

          <div class="sig-tabs-nav">
            <button type="button" class="sig-tab-btn ${activeTab === 'draw' ? 'active' : ''}" data-tab="draw">Draw</button>
            <button type="button" class="sig-tab-btn ${activeTab === 'type' ? 'active' : ''}" data-tab="type">Type</button>
            <button type="button" class="sig-tab-btn ${activeTab === 'phone' ? 'active' : ''}" data-tab="phone">📱 Phone (QR)</button>
          </div>

          <div class="sig-tab-body">
            ${activeTab === 'draw' ? `
              <div style="text-align: center;">
                <canvas id="rec-sig-canvas" width="440" height="150" style="border: 1px dashed var(--border-subtle); border-radius: 8px; background: #fff; cursor: crosshair; touch-action: none; display: block; margin: 0 auto;"></canvas>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                  <span style="font-size: 11px; color: var(--text-muted);">Draw using touchscreen or mouse</span>
                  <button type="button" id="btn-clear-sig-canvas" class="btn btn-xs btn-ghost">Clear</button>
                </div>
              </div>
            ` : activeTab === 'type' ? `
              <div>
                <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Signer Name</label>
                <input type="text" id="rec-type-inp" class="input-sm" value="${this.sessionData.recipient.name}" style="width: 100%; font-size: 14px; margin-bottom: 14px;" />
                <div id="rec-type-preview" style="height: 100px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid var(--border-subtle); border-radius: 8px; font-family: 'Caveat', cursive, sans-serif; font-size: 38px; color: #0f172a;">
                  ${this.sessionData.recipient.name}
                </div>
              </div>
            ` : `
              <div style="text-align: center; padding: 20px 0;">
                <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 16px;">
                  Use your smartphone camera to draw your signature directly on your phone's touch glass.
                </p>
                <button type="button" id="btn-launch-mobile-pair" class="btn btn-sm btn-primary">
                  📱 Open QR Code Scanner
                </button>
              </div>
            `}
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" id="btn-cancel-adopt" class="btn btn-sm btn-outline">Cancel</button>
            <button type="button" id="btn-adopt-sign" class="btn btn-sm btn-primary">Adopt & Apply</button>
          </div>
        </div>
      `;

      modalWrap.querySelector('#btn-close-sig-pad').onclick = () => document.body.removeChild(modalWrap);
      modalWrap.querySelector('#btn-cancel-adopt').onclick = () => document.body.removeChild(modalWrap);

      const tabs = modalWrap.querySelectorAll('.sig-tab-btn');
      tabs.forEach(t => {
        t.onclick = () => {
          activeTab = t.getAttribute('data-tab');
          renderModal();
        };
      });

      if (activeTab === 'draw') {
        const c = modalWrap.querySelector('#rec-sig-canvas');
        const ctx = c.getContext('2d');
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
        let drawing = false;

        const getXY = (e) => {
          const rect = c.getBoundingClientRect();
          const clX = e.touches ? e.touches[0].clientX : e.clientX;
          const clY = e.touches ? e.touches[0].clientY : e.clientY;
          return {
            x: (clX - rect.left) * (c.width / rect.width),
            y: (clY - rect.top) * (c.height / rect.height)
          };
        };

        const onDown = (e) => { e.preventDefault(); drawing = true; const p = getXY(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
        const onMove = (e) => { if (!drawing) return; e.preventDefault(); const p = getXY(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
        const onUp = () => { if (!drawing) return; drawing = false; drawnDataUrl = c.toDataURL('image/png'); };

        c.addEventListener('mousedown', onDown);
        c.addEventListener('mousemove', onMove);
        c.addEventListener('mouseup', onUp);
        c.addEventListener('touchstart', onDown, { passive: false });
        c.addEventListener('touchmove', onMove, { passive: false });
        c.addEventListener('touchend', onUp);

        modalWrap.querySelector('#btn-clear-sig-canvas').onclick = () => {
          ctx.clearRect(0, 0, c.width, c.height);
          drawnDataUrl = null;
        };
      } else if (activeTab === 'type') {
        const inp = modalWrap.querySelector('#rec-type-inp');
        const prev = modalWrap.querySelector('#rec-type-preview');
        inp.oninput = () => { prev.textContent = inp.value || 'Signature'; };
      } else if (activeTab === 'phone') {
        const pairBtn = modalWrap.querySelector('#btn-launch-mobile-pair');
        if (pairBtn) {
          pairBtn.onclick = () => {
            mobilePairModal.open({
              action: 'sign',
              onPayload: (payload) => {
                this.fieldValues[f.id] = payload.dataUrl;
                this.renderFieldContent(el, f);
                this.updateGuidanceBar();
                document.body.removeChild(modalWrap);
                Toast.success('Signature synced from smartphone!');
              }
            });
          };
        }
      }

      modalWrap.querySelector('#btn-adopt-sign').onclick = () => {
        if (activeTab === 'draw') {
          if (!drawnDataUrl) {
            Toast.error('Please draw a signature first.');
            return;
          }
          this.fieldValues[f.id] = drawnDataUrl;
        } else if (activeTab === 'type') {
          const name = modalWrap.querySelector('#rec-type-inp').value.trim() || 'Signature';
          const off = document.createElement('canvas');
          off.width = 400; off.height = 140;
          const oCtx = off.getContext('2d');
          oCtx.fillStyle = '#0f172a';
          oCtx.font = "italic 44px 'Caveat', cursive, sans-serif";
          oCtx.textBaseline = 'middle';
          oCtx.fillText(name, 20, 70);
          this.fieldValues[f.id] = off.toDataURL('image/png');
        }

        this.renderFieldContent(el, f);
        this.updateGuidanceBar();
        document.body.removeChild(modalWrap);
        Toast.success('Signature applied.');
      };
    };

    renderModal();
  }

  updateGuidanceBar() {
    const fields = this.sessionData.fields || [];
    const unfilledCount = fields.filter(f => !this.fieldValues[f.id]).length;
    const indicator = this.container.querySelector('#rec-unfilled-indicator');
    if (indicator) {
      indicator.textContent = unfilledCount > 0
        ? `👉 ${unfilledCount} field${unfilledCount === 1 ? '' : 's'} remaining for you to complete`
        : '✅ All required fields completed!';
    }
  }

  bindTopEvents() {
    const nextBtn = this.container.querySelector('#btn-next-unfilled');
    if (nextBtn) {
      nextBtn.onclick = () => {
        const fields = this.sessionData.fields || [];
        const nextUnfilled = fields.find(f => !this.fieldValues[f.id]);
        if (nextUnfilled) {
          const el = this.container.querySelector(`#rec-field-${nextUnfilled.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('pulse-focus');
            setTimeout(() => el.classList.remove('pulse-focus'), 1500);
          }
        }
      };
    }

    const finishBtn = this.container.querySelector('#btn-finish-signing');
    if (finishBtn) {
      finishBtn.onclick = () => this.submitRecipientSignatures();
    }
  }

  async submitRecipientSignatures() {
    const fields = this.sessionData.fields || [];
    const unfilled = fields.filter(f => f.required !== false && !this.fieldValues[f.id]);

    if (unfilled.length > 0) {
      Toast.error(`Please complete all required fields (${unfilled.length} remaining).`);
      const firstEl = this.container.querySelector(`#rec-field-${unfilled[0].id}`);
      if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const btn = this.container.querySelector('#btn-finish-signing');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>Sealing Signature...</span>`;
    }

    try {
      const res = await fetch(`/api/signatures/recipient/${encodeURIComponent(this.token)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldValues: this.fieldValues })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit signatures.');
      }

      this.sessionData.recipient.status = 'signed';
      this.renderAlreadySigned();
      Toast.success('Document signed and sealed successfully!');
    } catch (err) {
      Toast.error(err.message);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Finish & Sign</span>`;
      }
    }
  }
}

export const recipientSignPage = new RecipientSignPage();
