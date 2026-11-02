/**
 * Extract Images Modal Component
 * Extracts all embedded JPEG, PNG, and raster images from PDF documents
 * with live preview cards, individual download, and 1-click JSZip bulk archive export.
 */

import { pdfEngine } from '../core/pdf-engine.js';
import { store } from '../core/state-store.js';
import { Toast } from './toast.js';
import { downloadBlob, readFileAsArrayBuffer } from '../utils/helpers.js';
import JSZip from 'jszip';

export class ExtractImagesModal {
  constructor() {
    this.modal = null;
    this.extractedImages = [];
    this.isExtracting = false;
  }

  init() {
    if (typeof document === 'undefined') return;

    this.modal = document.createElement('div');
    this.modal.id = 'extract-images-modal';
    this.modal.className = 'modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog modal-lg" style="max-width: 780px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(236,72,153,0.12); color:#ec4899; display:flex; align-items:center; justify-content:center;">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div>
              <h2 class="modal-title" style="margin:0; font-size:18px;">Extract Images from PDF</h2>
              <p class="modal-subtitle" style="margin:0; font-size:12px; color:var(--text-muted);">Extract every embedded high-resolution JPEG and PNG image</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-extract-images">&times;</button>
        </div>

        <div class="modal-body" style="padding:20px; max-height: 65vh; overflow-y: auto;">
          <!-- Action Bar / Summary -->
          <div id="extract-summary-bar" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding:12px 16px; background:var(--bg-secondary); border-radius:10px; border:1px solid var(--border-subtle);">
            <div>
              <span id="extract-count-badge" style="font-weight:600; font-size:14px; color:var(--text-main);">Scanning document...</span>
            </div>
            <div style="display:flex; gap:8px;">
              <input type="file" id="extract-upload-input" accept="application/pdf" style="display:none;" />
              <button class="btn btn-sm btn-outline" id="btn-extract-upload-new">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span>Upload Another PDF</span>
              </button>
              <button class="btn btn-sm btn-primary" id="btn-extract-zip-all" disabled>
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Download All as ZIP</span>
              </button>
            </div>
          </div>

          <!-- Loading Spinner -->
          <div id="extract-loading-state" style="display:none; text-align:center; padding:40px 20px;">
            <div class="spinner" style="width:36px; height:36px; border:3px solid var(--border-subtle); border-top-color:var(--primary); border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 12px;"></div>
            <p style="font-size:14px; color:var(--text-muted);">Extracting embedded image streams...</p>
          </div>

          <!-- Images Grid Container -->
          <div id="extract-images-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:16px;">
          </div>

          <!-- Empty State -->
          <div id="extract-empty-state" style="display:none; text-align:center; padding:48px 20px;">
            <div style="width:56px; height:56px; border-radius:50%; background:var(--bg-secondary); color:var(--text-muted); display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
              <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <h4 style="font-size:16px; margin-bottom:6px; color:var(--text-main);">No Images Found</h4>
            <p style="font-size:13px; color:var(--text-muted); max-width:380px; margin:0 auto 18px;">
              This PDF document consists purely of vector typography and shapes, without any embedded raster image objects.
            </p>
            <button class="btn btn-outline btn-sm" id="btn-extract-empty-upload">Upload an Image-Rich PDF</button>
          </div>
        </div>

        <div class="modal-footer" style="padding:14px 20px; border-top:1px solid var(--border-subtle); display:flex; justify-content:flex-end;">
          <button class="btn btn-outline" id="btn-cancel-extract">Done</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('#btn-close-extract-images');
    const cancelBtn = this.modal.querySelector('#btn-cancel-extract');
    const uploadInput = this.modal.querySelector('#extract-upload-input');
    const uploadBtn = this.modal.querySelector('#btn-extract-upload-new');
    const emptyUploadBtn = this.modal.querySelector('#btn-extract-empty-upload');
    const zipBtn = this.modal.querySelector('#btn-extract-zip-all');

    const closeHandler = () => this.close();
    closeBtn.onclick = closeHandler;
    cancelBtn.onclick = closeHandler;

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    uploadBtn.onclick = () => uploadInput.click();
    emptyUploadBtn.onclick = () => uploadInput.click();

    uploadInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const bytes = await readFileAsArrayBuffer(file);
        this.runExtraction(bytes, file.name);
      } catch (err) {
        Toast.error('Failed to read PDF file: ' + err.message);
      }
    };

    zipBtn.onclick = () => this.downloadAllZip();
  }

  async open(customBytes = null, docTitle = null) {
    if (!this.modal && typeof document !== 'undefined') {
      this.init();
    }
    if (!this.modal) return;
    this.modal.style.display = 'flex';
    const state = store.getState();
    const bytes = customBytes || pdfEngine.rawBytes || state.pdfBytes;
    const title = docTitle || state.documentTitle || 'document.pdf';

    if (!bytes) {
      Toast.warning('Please open a PDF document first');
      this.showEmptyState();
      return;
    }

    await this.runExtraction(bytes, title);
  }

  close() {
    this.modal.style.display = 'none';
  }

  async runExtraction(bytes, title) {
    this.extractedImages = [];
    this.currentDocTitle = title.replace(/\.pdf$/i, '');

    const loading = this.modal.querySelector('#extract-loading-state');
    const grid = this.modal.querySelector('#extract-images-grid');
    const emptyState = this.modal.querySelector('#extract-empty-state');
    const countBadge = this.modal.querySelector('#extract-count-badge');
    const zipBtn = this.modal.querySelector('#btn-extract-zip-all');

    loading.style.display = 'block';
    grid.innerHTML = '';
    emptyState.style.display = 'none';
    zipBtn.disabled = true;
    countBadge.textContent = 'Scanning PDF objects...';

    try {
      const images = await pdfEngine.extractImages(bytes);
      this.extractedImages = images;
      loading.style.display = 'none';

      if (images.length === 0) {
        this.showEmptyState();
        return;
      }

      countBadge.textContent = `${images.length} embedded image${images.length === 1 ? '' : 's'} extracted`;
      zipBtn.disabled = false;
      this.renderImageCards(images);
      Toast.success(`Successfully extracted ${images.length} image${images.length === 1 ? '' : 's'}`);
    } catch (err) {
      loading.style.display = 'none';
      Toast.error('Extraction failed: ' + err.message);
      this.showEmptyState();
    }
  }

  renderImageCards(images) {
    const grid = this.modal.querySelector('#extract-images-grid');
    grid.innerHTML = '';

    images.forEach((img, index) => {
      const card = document.createElement('div');
      card.className = 'extract-img-card';
      card.style.cssText = `
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      `;

      const kbSize = (img.sizeBytes / 1024).toFixed(1);
      const dims = img.width && img.height ? `${img.width} × ${img.height} px` : 'Raster image';

      card.innerHTML = `
        <div style="width:100%; height:130px; background:#f8fafc; display:flex; align-items:center; justify-content:center; overflow:hidden; border-bottom:1px solid var(--border-subtle);">
          <img src="${img.dataUrl}" alt="${img.name}" style="max-width:100%; max-height:100%; object-fit:contain;" />
        </div>
        <div style="padding:10px 12px; display:flex; flex-direction:column; gap:6px; flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; font-weight:600; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px;" title="${img.name}">
              ${img.name}
            </span>
            <span style="font-size:10px; font-weight:700; text-transform:uppercase; background:var(--primary-light); color:var(--primary); padding:2px 6px; border-radius:4px;">
              ${img.extension}
            </span>
          </div>
          <div style="font-size:11px; color:var(--text-muted); display:flex; justify-content:space-between;">
            <span>${dims}</span>
            <span>${kbSize} KB</span>
          </div>
          <button class="btn btn-sm btn-outline" style="width:100%; margin-top:6px; font-size:11px; padding:4px 8px;" data-index="${index}">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download
          </button>
        </div>
      `;

      const downloadBtn = card.querySelector('button');
      downloadBtn.onclick = () => this.downloadSingleImage(img);

      grid.appendChild(card);
    });
  }

  downloadSingleImage(img) {
    const blob = new Blob([img.bytes], { type: img.mimeType });
    downloadBlob(blob, img.name);
    Toast.success(`Downloaded ${img.name}`);
  }

  async downloadAllZip() {
    if (this.extractedImages.length === 0) return;

    try {
      Toast.info('Packaging ZIP archive...');
      const zip = new JSZip();

      this.extractedImages.forEach(img => {
        zip.file(img.name, img.bytes);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const filename = `${this.currentDocTitle || 'extracted'}_images.zip`;
      downloadBlob(zipBlob, filename);
      Toast.success(`Downloaded all ${this.extractedImages.length} images as ZIP!`);
    } catch (err) {
      Toast.error('Failed to create ZIP: ' + err.message);
    }
  }

  showEmptyState() {
    this.modal.querySelector('#extract-images-grid').innerHTML = '';
    this.modal.querySelector('#extract-empty-state').style.display = 'block';
    this.modal.querySelector('#extract-count-badge').textContent = '0 images found';
    this.modal.querySelector('#btn-extract-zip-all').disabled = true;
  }
}

export const extractImagesModal = new ExtractImagesModal();
