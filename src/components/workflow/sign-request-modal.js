/**
 * Visual Interactive Signature Field Placer & Multi-Recipient Modal
 * Reverse-engineered from iLovePDF & Adobe Acrobat Sign architectures.
 * Provides a Canva/Adobe-grade full-screen interactive workspace where users:
 * 1. Configure multiple document signers with distinct color identities.
 * 2. Visually drag-and-drop / click to place Signature, Initials, Date, Text, and Checkbox fields.
 * 3. Assign specific fields to designated recipients with exact page coordinate mapping.
 * 4. Submit to backend API and generate instant signing links with cryptographic tracking.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { Toast } from '../toast.js';

class SignRequestModal {
  constructor() {
    this.container = null;
    this.pdfBytes = null;
    this.documentName = 'Document.pdf';
    this.pdfJsDoc = null;
    this.currentPage = 1;
    this.totalPages = 1;
    this.pageScale = 1.0;
    this.pageWidth = 595;
    this.pageHeight = 842;

    // Default recipients palette
    this.recipients = [
      { id: 'rec_1', name: 'Signer 1', email: '', color: '#3b82f6', role: 'signer' },
      { id: 'rec_2', name: 'Signer 2', email: '', color: '#8b5cf6', role: 'signer' }
    ];
    this.activeRecipientIndex = 0;

    // Placed fields: array of { id, recipientEmail, type, page, x, y, width, height, label }
    this.fields = [];
    this.selectedFieldId = null;
    this.draggedFieldType = null;
    this.isDraggingOnCanvas = false;
    this.dragOffset = { x: 0, y: 0 };
    this.draggedPlacedFieldId = null;

    this.onCompletedCallback = null;
  }

  get activeRecipient() {
    return this.recipients[this.activeRecipientIndex] || this.recipients[0];
  }

  async open(pdfBytes, documentName = 'Document.pdf', options = {}) {
    this.pdfBytes = pdfBytes;
    this.documentName = documentName;
    this.onCompletedCallback = options.onCompleted || null;

    if (Array.isArray(options.recipients) && options.recipients.length > 0) {
      this.recipients = options.recipients;
    }

    this.fields = [];
    this.currentPage = 1;
    this.activeRecipientIndex = 0;

    try {
      this.pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      this.totalPages = this.pdfJsDoc.numPages || 1;
    } catch (e) {
      console.warn('[SignRequestModal] PDF.js load error:', e);
      this.totalPages = 1;
    }

    this.render();
    await this.renderPageCanvas();
  }

  close() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }

  render() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'sign-request-modal-overlay';
      this.container.className = 'sign-request-overlay';
      document.body.appendChild(this.container);
    }

    const currentRec = this.activeRecipient;

    this.container.innerHTML = `
      <div class="sign-request-window">
        <!-- Top Executive Navbar -->
        <header class="sign-req-header">
          <div class="sign-req-header-left">
            <button type="button" class="btn-icon" id="btn-close-sign-modal" title="Exit to Editor">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg>
            </button>
            <div class="sign-req-title-wrap">
              <h2 class="sign-req-title">Request Multi-Party Signatures</h2>
              <span class="sign-req-docname" title="${this.documentName}">${this.documentName}</span>
            </div>
          </div>

          <!-- Recipient Selector Dropdown -->
          <div class="sign-req-header-center">
            <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Assigning Fields:</span>
            <div class="recipient-switcher-wrap">
              <select id="sel-active-recipient" class="recipient-select" style="border-left: 4px solid ${currentRec.color};">
                ${this.recipients.map((r, i) => `
                  <option value="${i}" ${i === this.activeRecipientIndex ? 'selected' : ''}>
                    ${r.name} (${r.email || 'No email'})
                  </option>
                `).join('')}
              </select>
              <button type="button" id="btn-manage-recipients" class="btn btn-xs btn-outline" style="border-radius: 6px; gap: 4px;" title="Manage Signers">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span>Edit Signers</span>
              </button>
            </div>
          </div>

          <div class="sign-req-header-right">
            <button type="button" id="btn-clear-fields" class="btn btn-sm btn-ghost" style="color: #ef4444;">Clear All</button>
            <button type="button" id="btn-send-request" class="btn btn-sm btn-primary" style="background: linear-gradient(135deg, #30050d 0%, #520815 100%); gap: 8px; font-weight: 600; box-shadow: 0 4px 14px rgba(48,5,13,0.3);">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              <span>Send Request</span>
            </button>
          </div>
        </header>

        <!-- Main Workspace Body -->
        <div class="sign-req-body">
          <!-- Left Field Palette -->
          <aside class="sign-req-palette">
            <div class="palette-group">
              <span class="palette-header">Fields for ${currentRec.name}</span>
              <p class="palette-hint">Click a field button to add it to the active page.</p>

              <div class="field-button-list">
                <button type="button" class="field-btn" data-type="signature" style="border-left: 3px solid ${currentRec.color};">
                  <span class="f-icon">🖊️</span>
                  <div class="f-text">
                    <strong>Signature</strong>
                    <span>Hand-drawn or typed</span>
                  </div>
                </button>

                <button type="button" class="field-btn" data-type="initials" style="border-left: 3px solid ${currentRec.color};">
                  <span class="f-icon">✍️</span>
                  <div class="f-text">
                    <strong>Initials</strong>
                    <span>Signer short initials</span>
                  </div>
                </button>

                <button type="button" class="field-btn" data-type="date" style="border-left: 3px solid ${currentRec.color};">
                  <span class="f-icon">📅</span>
                  <div class="f-text">
                    <strong>Date Signed</strong>
                    <span>Auto-stamped date</span>
                  </div>
                </button>

                <button type="button" class="field-btn" data-type="text" style="border-left: 3px solid ${currentRec.color};">
                  <span class="f-icon">📝</span>
                  <div class="f-text">
                    <strong>Text Field</strong>
                    <span>Custom text input</span>
                  </div>
                </button>

                <button type="button" class="field-btn" data-type="checkbox" style="border-left: 3px solid ${currentRec.color};">
                  <span class="f-icon">☑️</span>
                  <div class="f-text">
                    <strong>Checkbox</strong>
                    <span>Agreement tick box</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Placed Fields Summary -->
            <div class="palette-summary">
              <span class="palette-header">Document Fields Summary</span>
              <div class="summary-list">
                ${this.recipients.map(r => {
                  const count = this.fields.filter(f => f.recipientEmail === r.email).length;
                  return `
                    <div class="summary-item" style="border-left: 3px solid ${r.color};">
                      <span class="s-name">${r.name}</span>
                      <span class="s-count badge ${count > 0 ? 'badge-primary' : 'badge-muted'}">${count} field${count === 1 ? '' : 's'}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </aside>

          <!-- Center Canvas Viewport -->
          <main class="sign-req-viewport" id="sign-canvas-viewport">
            <div class="sign-canvas-page-container" id="sign-canvas-page-container">
              <canvas id="sign-pdf-canvas" class="sign-pdf-canvas"></canvas>
              <!-- Interactive floating fields overlay container -->
              <div id="sign-fields-overlay" class="sign-fields-overlay"></div>
            </div>

            <!-- Page Navigation Bottom Bar -->
            <div class="sign-req-page-stepper">
              <button type="button" class="btn btn-xs btn-outline" id="btn-prev-page" ${this.currentPage <= 1 ? 'disabled' : ''}>◀ Prev</button>
              <span class="page-indicator">Page ${this.currentPage} of ${this.totalPages}</span>
              <button type="button" class="btn btn-xs btn-outline" id="btn-next-page" ${this.currentPage >= this.totalPages ? 'disabled' : ''}>Next ▶</button>
            </div>
          </main>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderPlacedFields();
  }

  async renderPageCanvas() {
    const canvas = this.container.querySelector('#sign-pdf-canvas');
    if (!canvas || !this.pdfJsDoc) return;

    try {
      const page = await this.pdfJsDoc.getPage(this.currentPage);
      const viewport = page.getViewport({ scale: 1.25 });
      this.pageScale = 1.25;
      this.pageWidth = viewport.width;
      this.pageHeight = viewport.height;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;

      const overlay = this.container.querySelector('#sign-fields-overlay');
      if (overlay) {
        overlay.style.width = `${viewport.width}px`;
        overlay.style.height = `${viewport.height}px`;
      }
      this.renderPlacedFields();
    } catch (err) {
      console.warn('[SignRequestModal] Error rendering page canvas:', err);
    }
  }

  renderPlacedFields() {
    const overlay = this.container?.querySelector('#sign-fields-overlay');
    if (!overlay) return;

    const pageZeroIdx = this.currentPage - 1;
    const pageFields = this.fields.filter(f => f.page === pageZeroIdx);

    overlay.innerHTML = pageFields.map(f => {
      const recipient = this.recipients.find(r => r.email === f.recipientEmail) || this.activeRecipient;
      const isSelected = this.selectedFieldId === f.id;

      return `
        <div class="placed-field-item ${isSelected ? 'selected' : ''}"
             data-id="${f.id}"
             style="left: ${f.x}px; top: ${f.y}px; width: ${f.width}px; height: ${f.height}px; border-color: ${recipient.color};">
          <div class="field-label-pill" style="background: ${recipient.color};">
            <span class="f-type-tag">${f.label}</span>
            <span class="f-owner-tag">${recipient.name}</span>
          </div>
          <button type="button" class="btn-delete-field" data-id="${f.id}" title="Remove Field">✕</button>
        </div>
      `;
    }).join('');

    this.bindPlacedFieldEvents();
  }

  bindEvents() {
    const closeBtn = this.container.querySelector('#btn-close-sign-modal');
    if (closeBtn) closeBtn.onclick = () => this.close();

    const recipientSelect = this.container.querySelector('#sel-active-recipient');
    if (recipientSelect) {
      recipientSelect.onchange = (e) => {
        this.activeRecipientIndex = parseInt(e.target.value, 10);
        this.render();
        this.renderPageCanvas();
      };
    }

    const manageRecBtn = this.container.querySelector('#btn-manage-recipients');
    if (manageRecBtn) {
      manageRecBtn.onclick = () => this.openRecipientsManagerModal();
    }

    const clearBtn = this.container.querySelector('#btn-clear-fields');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (this.fields.length === 0) return;
        if (confirm('Are you sure you want to remove all placed fields across all pages?')) {
          this.fields = [];
          this.render();
          this.renderPageCanvas();
          Toast.info('All signature fields cleared.');
        }
      };
    }

    const sendBtn = this.container.querySelector('#btn-send-request');
    if (sendBtn) {
      sendBtn.onclick = () => this.submitSignatureRequest();
    }

    const prevBtn = this.container.querySelector('#btn-prev-page');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.render();
          this.renderPageCanvas();
        }
      };
    }

    const nextBtn = this.container.querySelector('#btn-next-page');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.render();
          this.renderPageCanvas();
        }
      };
    }

    // Palette button click to add field to active page
    const fieldBtns = this.container.querySelectorAll('.field-btn');
    fieldBtns.forEach(btn => {
      btn.onclick = () => {
        const type = btn.getAttribute('data-type');
        this.addFieldToCurrentPage(type);
      };
    });
  }

  addFieldToCurrentPage(type) {
    const currentRec = this.activeRecipient;
    if (!currentRec.email) {
      currentRec.email = `${currentRec.name.toLowerCase().replace(/\s+/g, '')}@example.com`;
    }

    const width = type === 'signature' ? 140 : type === 'checkbox' ? 26 : 110;
    const height = type === 'signature' ? 48 : type === 'checkbox' ? 26 : 30;

    // Place staggered on canvas
    const countOnPage = this.fields.filter(f => f.page === this.currentPage - 1).length;
    const x = Math.min(this.pageWidth - width - 20, 50 + (countOnPage * 15) % 200);
    const y = Math.min(this.pageHeight - height - 20, 100 + (countOnPage * 40) % 400);

    const labels = {
      signature: 'Signature',
      initials: 'Initials',
      date: 'Date Signed',
      text: 'Text Input',
      checkbox: 'Checkbox'
    };

    const newField = {
      id: `fld_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      recipientEmail: currentRec.email,
      type,
      page: this.currentPage - 1,
      x: Math.round(x),
      y: Math.round(y),
      width,
      height,
      label: labels[type] || 'Field',
      isTopOrigin: true
    };

    this.fields.push(newField);
    this.selectedFieldId = newField.id;
    this.renderPlacedFields();
    Toast.success(`Added ${labels[type]} for ${currentRec.name}`);
  }

  bindPlacedFieldEvents() {
    const overlay = this.container?.querySelector('#sign-fields-overlay');
    if (!overlay) return;

    // Delete buttons
    const delBtns = overlay.querySelectorAll('.btn-delete-field');
    delBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        this.fields = this.fields.filter(f => f.id !== id);
        this.renderPlacedFields();
      };
    });

    // Dragging placed fields
    const fieldEls = overlay.querySelectorAll('.placed-field-item');
    fieldEls.forEach(el => {
      el.onmousedown = (e) => {
        if (e.target.classList.contains('btn-delete-field')) return;
        e.preventDefault();
        const id = el.getAttribute('data-id');
        this.selectedFieldId = id;
        this.draggedPlacedFieldId = id;

        const field = this.fields.find(f => f.id === id);
        if (!field) return;

        const rect = overlay.getBoundingClientRect();
        this.dragOffset = {
          x: e.clientX - (rect.left + field.x),
          y: e.clientY - (rect.top + field.y)
        };

        const onMouseMove = (moveEvt) => {
          if (!this.draggedPlacedFieldId) return;
          const overlayRect = overlay.getBoundingClientRect();
          let newX = moveEvt.clientX - overlayRect.left - this.dragOffset.x;
          let newY = moveEvt.clientY - overlayRect.top - this.dragOffset.y;

          newX = Math.max(0, Math.min(this.pageWidth - field.width, newX));
          newY = Math.max(0, Math.min(this.pageHeight - field.height, newY));

          field.x = Math.round(newX);
          field.y = Math.round(newY);

          el.style.left = `${field.x}px`;
          el.style.top = `${field.y}px`;
        };

        const onMouseUp = () => {
          this.draggedPlacedFieldId = null;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };
    });
  }

  openRecipientsManagerModal() {
    const modalWrap = document.createElement('div');
    modalWrap.className = 'recipients-modal-overlay';
    document.body.appendChild(modalWrap);

    const renderRecManager = () => {
      modalWrap.innerHTML = `
        <div class="recipients-modal-box">
          <div class="rec-modal-header">
            <h3>Manage Document Signers</h3>
            <button type="button" class="btn-icon" id="btn-close-rec-modal">✕</button>
          </div>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 16px;">
            Configure recipient names, email addresses, and color codes for field assignment.
          </p>

          <div class="rec-list-container">
            ${this.recipients.map((r, i) => `
              <div class="rec-row-item" style="border-left: 4px solid ${r.color};">
                <div style="flex: 1;">
                  <label class="rec-label">Signer Name</label>
                  <input type="text" class="input-sm rec-name-inp" data-idx="${i}" value="${r.name}" style="width: 100%;" />
                </div>
                <div style="flex: 1.5;">
                  <label class="rec-label">Email Address</label>
                  <input type="email" class="input-sm rec-email-inp" data-idx="${i}" value="${r.email}" placeholder="signer@example.com" style="width: 100%;" />
                </div>
                <div style="width: 70px;">
                  <label class="rec-label">Color</label>
                  <input type="color" class="rec-color-inp" data-idx="${i}" value="${r.color}" style="width: 100%; height: 32px; border: none; cursor: pointer;" />
                </div>
                ${this.recipients.length > 1 ? `
                  <button type="button" class="btn-icon btn-del-rec" data-idx="${i}" style="margin-top: 18px; color: #ef4444;" title="Delete Recipient">✕</button>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 18px;">
            <button type="button" id="btn-add-rec-row" class="btn btn-sm btn-outline">+ Add Signer</button>
            <button type="button" id="btn-save-rec-list" class="btn btn-sm btn-primary">Done</button>
          </div>
        </div>
      `;

      modalWrap.querySelector('#btn-close-rec-modal').onclick = () => document.body.removeChild(modalWrap);
      modalWrap.querySelector('#btn-save-rec-list').onclick = () => {
        // Collect inputs
        const nameInps = modalWrap.querySelectorAll('.rec-name-inp');
        const emailInps = modalWrap.querySelectorAll('.rec-email-inp');
        const colorInps = modalWrap.querySelectorAll('.rec-color-inp');

        nameInps.forEach(inp => {
          const idx = parseInt(inp.getAttribute('data-idx'), 10);
          this.recipients[idx].name = inp.value.trim() || `Signer ${idx + 1}`;
        });
        emailInps.forEach(inp => {
          const idx = parseInt(inp.getAttribute('data-idx'), 10);
          this.recipients[idx].email = inp.value.trim().toLowerCase();
        });
        colorInps.forEach(inp => {
          const idx = parseInt(inp.getAttribute('data-idx'), 10);
          this.recipients[idx].color = inp.value;
        });

        document.body.removeChild(modalWrap);
        this.render();
        this.renderPageCanvas();
        Toast.success('Updated signer list.');
      };

      const addBtn = modalWrap.querySelector('#btn-add-rec-row');
      if (addBtn) {
        addBtn.onclick = () => {
          const nextIdx = this.recipients.length + 1;
          const colors = ['#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
          this.recipients.push({
            id: `rec_${nextIdx}`,
            name: `Signer ${nextIdx}`,
            email: '',
            color: colors[(nextIdx - 1) % colors.length],
            role: 'signer'
          });
          renderRecManager();
        };
      }

      const delBtns = modalWrap.querySelectorAll('.btn-del-rec');
      delBtns.forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          this.recipients.splice(idx, 1);
          if (this.activeRecipientIndex >= this.recipients.length) {
            this.activeRecipientIndex = 0;
          }
          renderRecManager();
        };
      });
    };

    renderRecManager();
  }

  async submitSignatureRequest() {
    if (this.fields.length === 0) {
      Toast.error('Please place at least one signature or form field before sending.');
      return;
    }

    // Validate that recipients have emails
    this.recipients.forEach((r, idx) => {
      if (!r.email) {
        r.email = `${r.name.toLowerCase().replace(/\s+/g, '') || `signer${idx + 1}`}@example.com`;
      }
    });

    const sendBtn = this.container.querySelector('#btn-send-request');
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<span>Sending Request...</span>`;
    }

    try {
      // Convert pdf bytes to base64
      let binary = '';
      const bytes = new Uint8Array(this.pdfBytes);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const documentBase64 = btoa(binary);

      const payload = {
        title: this.documentName.replace(/\.[^/.]+$/, ''),
        documentName: this.documentName,
        documentBase64,
        recipients: this.recipients,
        fields: this.fields,
        senderName: 'LetsEdit User',
        senderEmail: 'user@letsedit.dev'
      };

      const response = await fetch('/api/signatures/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const res = await response.json();
      if (!res.success) {
        throw new Error(res.error || 'Failed to initiate signature request.');
      }

      this.showSuccessHub(res);
      if (typeof this.onCompletedCallback === 'function') {
        this.onCompletedCallback(res);
      }
    } catch (err) {
      Toast.error(err.message);
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = `<span>Send Request</span>`;
      }
    }
  }

  showSuccessHub(res) {
    this.container.innerHTML = `
      <div class="sign-request-window" style="max-width: 680px; margin: 40px auto; min-height: auto;">
        <header class="sign-req-header" style="border-bottom: none; justify-content: center; text-align: center; padding-top: 32px;">
          <div style="text-align: center;">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
              <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 class="sign-req-title" style="font-size: 22px;">Signature Request Sent!</h2>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
              Transaction ID: <strong style="font-family: monospace; color: var(--text-main);">${res.transactionId}</strong>
            </p>
          </div>
        </header>

        <div style="padding: 24px 32px 32px;">
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 20px;">
            The document has been securely initialized with eIDAS cryptographic tracking. Share the private signing links below with your recipients:
          </p>

          <div class="signing-links-container" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;">
            ${res.recipients.map(r => `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div>
                  <strong style="display: block; font-size: 13px; color: var(--text-main);">${r.name}</strong>
                  <span style="font-size: 11.5px; color: var(--text-muted);">${r.email}</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button type="button" class="btn btn-xs btn-outline btn-copy-link" data-url="${window.location.origin}${r.signingUrl}">
                    Copy Link
                  </button>
                  <a href="${r.signingUrl}" target="_blank" class="btn btn-xs btn-primary" style="text-decoration: none;">
                    Open Portal
                  </a>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" id="btn-done-hub" class="btn btn-primary" style="padding: 10px 24px;">Done</button>
          </div>
        </div>
      </div>
    `;

    const doneBtn = this.container.querySelector('#btn-done-hub');
    if (doneBtn) doneBtn.onclick = () => this.close();

    const copyBtns = this.container.querySelectorAll('.btn-copy-link');
    copyBtns.forEach(btn => {
      btn.onclick = () => {
        const url = btn.getAttribute('data-url');
        navigator.clipboard.writeText(url);
        Toast.success('Private signing link copied to clipboard!');
      };
    });
  }
}

export const signRequestModal = new SignRequestModal();
