/**
 * Document Properties & Metadata Modal
 * Inspect and edit PDF metadata (Title, Author, Subject, Keywords, Creator, Producer).
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';

export class MetadataModal {
  constructor() {
    this.modal = null;
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'metadata-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <h3 style="margin:0;">Document Properties & Metadata</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-secondary); padding:10px 14px; border-radius:6px; margin-bottom:16px; font-size:12px; color:var(--text-muted);">
            <div>File: <strong id="meta-doc-name" style="color:var(--text-main);">Untitled.pdf</strong></div>
            <div>Pages: <strong id="meta-doc-pages" style="color:var(--text-main);">0</strong></div>
          </div>

          <div class="form-group" style="margin-bottom:12px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Document Title</label>
            <input type="text" id="meta-title" class="form-input" placeholder="e.g. Master Services Agreement" />
          </div>

          <div class="form-group" style="margin-bottom:12px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Author / Organization</label>
            <input type="text" id="meta-author" class="form-input" placeholder="e.g. Jane Doe, Acme Corp" />
          </div>

          <div class="form-group" style="margin-bottom:12px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Subject / Topic</label>
            <input type="text" id="meta-subject" class="form-input" placeholder="e.g. Legal Contract & Addendum" />
          </div>

          <div class="form-group" style="margin-bottom:12px;">
            <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Keywords (comma separated)</label>
            <input type="text" id="meta-keywords" class="form-input" placeholder="e.g. contract, nda, confidential, 2026" />
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;">
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Creator Application</label>
              <input type="text" id="meta-creator" class="form-input" placeholder="e.g. PDF Studio Pro" />
            </div>
            <div class="form-group">
              <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px;">Producer Engine</label>
              <input type="text" id="meta-producer" class="form-input" placeholder="e.g. PDF Studio Vector Engine" />
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
          <button class="btn btn-outline btn-sm" id="btn-clear-metadata" style="color:#ef4444;">Clear All</button>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-outline" id="btn-cancel-metadata">Cancel</button>
            <button class="btn btn-primary" id="btn-apply-metadata">Save Properties</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('.modal-close-btn');
    const cancelBtn = this.modal.querySelector('#btn-cancel-metadata');
    const applyBtn = this.modal.querySelector('#btn-apply-metadata');
    const clearBtn = this.modal.querySelector('#btn-clear-metadata');

    const hide = () => this.hide();
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) hide();
    });

    clearBtn.addEventListener('click', () => {
      this.modal.querySelector('#meta-title').value = '';
      this.modal.querySelector('#meta-author').value = '';
      this.modal.querySelector('#meta-subject').value = '';
      this.modal.querySelector('#meta-keywords').value = '';
      this.modal.querySelector('#meta-creator').value = '';
      this.modal.querySelector('#meta-producer').value = '';
      store.setMetadata({
        title: '',
        author: '',
        subject: '',
        keywords: '',
        creator: '',
        producer: ''
      });
      Toast.info('Document metadata cleared');
      hide();
    });

    applyBtn.addEventListener('click', () => {
      const title = this.modal.querySelector('#meta-title').value.trim();
      const author = this.modal.querySelector('#meta-author').value.trim();
      const subject = this.modal.querySelector('#meta-subject').value.trim();
      const keywords = this.modal.querySelector('#meta-keywords').value.trim();
      const creator = this.modal.querySelector('#meta-creator').value.trim();
      const producer = this.modal.querySelector('#meta-producer').value.trim();

      store.setMetadata({
        title,
        author,
        subject,
        keywords,
        creator: creator || 'PDF Studio Pro',
        producer: producer || 'PDF Studio Vector Engine'
      });

      Toast.success('Document properties saved!');
      hide();
    });
  }

  show() {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    const state = store.getState();
    const meta = state.metadata || {};

    const nameEl = this.modal.querySelector('#meta-doc-name');
    const pagesEl = this.modal.querySelector('#meta-doc-pages');
    if (nameEl) nameEl.textContent = state.filename || 'Untitled.pdf';
    if (pagesEl) pagesEl.textContent = state.pageCount.toString();

    this.modal.querySelector('#meta-title').value = meta.title || '';
    this.modal.querySelector('#meta-author').value = meta.author || '';
    this.modal.querySelector('#meta-subject').value = meta.subject || '';
    this.modal.querySelector('#meta-keywords').value = meta.keywords || '';
    this.modal.querySelector('#meta-creator').value = meta.creator || 'PDF Studio Pro';
    this.modal.querySelector('#meta-producer').value = meta.producer || 'PDF Studio Vector Engine';

    this.modal.style.display = 'flex';
  }

  hide() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }
}

export const metadataModal = new MetadataModal();
