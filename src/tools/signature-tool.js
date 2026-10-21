/**
 * Signature Tool: Modal supporting Draw, Type, and Upload
 */

import { store } from '../core/state-store.js';
import { uid } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';

export class SignatureTool {
  constructor() {
    this.modal = null;
    this.activeTab = 'draw';
    this.inkColor = '#0f172a';
    this.initModal();
  }

  initModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'signature-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Create Your Signature</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="draw">Draw</button>
          <button class="tab-btn" data-tab="type">Type</button>
          <button class="tab-btn" data-tab="upload">Upload</button>
        </div>

        <div class="modal-body">
          <!-- Tab 1: Draw -->
          <div class="tab-content" id="tab-draw">
            <div class="signature-canvas-wrap">
              <canvas id="signature-pad" width="500" height="200"></canvas>
              <div class="signature-line"></div>
            </div>
            <div class="signature-controls">
              <div class="color-picker-row">
                <span>Ink:</span>
                <button class="color-dot active" data-color="#0f172a" style="background:#0f172a;"></button>
                <button class="color-dot" data-color="#1d4ed8" style="background:#1d4ed8;"></button>
                <button class="color-dot" data-color="#047857" style="background:#047857;"></button>
              </div>
              <button class="btn btn-outline" id="clear-signature-btn">Clear Pad</button>
            </div>
          </div>

          <!-- Tab 2: Type -->
          <div class="tab-content" id="tab-type" style="display:none;">
            <input type="text" id="type-signature-input" class="form-input" placeholder="Enter your full name" value="John Doe" />
            <div class="signature-font-previews">
              <div class="sig-preview-card active" data-font="Caveat">
                <span style="font-family: 'Caveat', cursive;">John Doe</span>
              </div>
              <div class="sig-preview-card" data-font="Dancing Script">
                <span style="font-family: 'Dancing Script', cursive;">John Doe</span>
              </div>
              <div class="sig-preview-card" data-font="Great Vibes">
                <span style="font-family: 'Great Vibes', cursive;">John Doe</span>
              </div>
            </div>
          </div>

          <!-- Tab 3: Upload -->
          <div class="tab-content" id="tab-upload" style="display:none;">
            <div class="dropzone" id="sig-dropzone">
              <input type="file" id="sig-file-input" accept="image/png, image/jpeg" style="display:none;" />
              <p>Drag and drop signature PNG/JPG, or <strong>Browse</strong></p>
            </div>
            <div id="sig-upload-preview" style="display:none; text-align:center; margin-top:15px;">
              <img id="sig-uploaded-img" style="max-height:120px; border:1px solid #e2e8f0; border-radius:8px;" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
          <button class="btn btn-primary" id="save-signature-btn">Insert Signature</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const pad = this.modal.querySelector('#signature-pad');
    const ctx = pad.getContext('2d');
    let isDrawing = false;
    let hasDrawn = false;

    const start = (e) => {
      isDrawing = true;
      hasDrawn = true;
      const r = pad.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
      ctx.strokeStyle = this.inkColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const r = pad.getBoundingClientRect();
      ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
      ctx.stroke();
    };

    const stop = () => { isDrawing = false; };

    pad.addEventListener('mousedown', start);
    pad.addEventListener('mousemove', draw);
    pad.addEventListener('mouseup', stop);
    pad.addEventListener('mouseleave', stop);

    // Ink dots
    this.modal.querySelectorAll('.color-dot').forEach(dot => {
      dot.onclick = () => {
        this.modal.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.inkColor = dot.dataset.color;
      };
    });

    // Clear
    this.modal.querySelector('#clear-signature-btn').onclick = () => {
      ctx.clearRect(0, 0, pad.width, pad.height);
      hasDrawn = false;
    };

    // Tabs
    const tabBtns = this.modal.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.modal.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        this.modal.querySelector(`#tab-${this.activeTab}`).style.display = 'block';
      };
    });

    // Type input
    const typeInp = this.modal.querySelector('#type-signature-input');
    typeInp.oninput = () => {
      const val = typeInp.value || 'Signature';
      this.modal.querySelectorAll('.sig-preview-card span').forEach(s => s.innerText = val);
    };

    let selectedFont = 'Caveat';
    this.modal.querySelectorAll('.sig-preview-card').forEach(card => {
      card.onclick = () => {
        this.modal.querySelectorAll('.sig-preview-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedFont = card.dataset.font;
      };
    });

    // Upload
    const dropzone = this.modal.querySelector('#sig-dropzone');
    const fileInp = this.modal.querySelector('#sig-file-input');
    const previewBox = this.modal.querySelector('#sig-upload-preview');
    const previewImg = this.modal.querySelector('#sig-uploaded-img');
    let uploadedDataUrl = null;

    dropzone.onclick = () => fileInp.click();
    fileInp.onchange = (e) => {
      const f = e.target.files[0];
      if (f) {
        const reader = new FileReader();
        reader.onload = () => {
          uploadedDataUrl = reader.result;
          previewImg.src = uploadedDataUrl;
          previewBox.style.display = 'block';
        };
        reader.readAsDataURL(f);
      }
    };

    // Close / Cancel
    const close = () => { this.modal.style.display = 'none'; };
    this.modal.querySelector('.modal-close-btn').onclick = close;
    this.modal.querySelector('.modal-cancel-btn').onclick = close;

    // Confirm & Save
    this.modal.querySelector('#save-signature-btn').onclick = () => {
      let finalDataUrl = null;

      if (this.activeTab === 'draw') {
        if (!hasDrawn) {
          Toast.warning('Please draw your signature first');
          return;
        }
        finalDataUrl = pad.toDataURL('image/png');
      } else if (this.activeTab === 'type') {
        const text = typeInp.value.trim() || 'Signature';
        const offscreen = document.createElement('canvas');
        offscreen.width = 600;
        offscreen.height = 200;
        const octx = offscreen.getContext('2d');
        octx.font = `60px '${selectedFont}', cursive`;
        octx.fillStyle = this.inkColor;
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';
        octx.fillText(text, 300, 100);
        finalDataUrl = offscreen.toDataURL('image/png');
      } else if (this.activeTab === 'upload') {
        if (!uploadedDataUrl) {
          Toast.warning('Please upload an image first');
          return;
        }
        finalDataUrl = uploadedDataUrl;
      }

      if (finalDataUrl) {
        close();
        this.placeSignatureOnActivePage(finalDataUrl);
      }
    };
  }

  open() {
    this.modal.style.display = 'flex';
  }

  placeSignatureOnActivePage(dataUrl) {
    const state = store.getState();
    // Default to first active non-deleted page
    let targetPage = 1;
    for (let i = 1; i <= state.pageCount; i++) {
      if (!state.deletedPages.has(i)) {
        targetPage = i;
        break;
      }
    }

    store.addAnnotation(targetPage, {
      id: uid('sig'),
      type: 'signature',
      dataUrl,
      x: 0.35,
      y: 0.7,
      width: 0.3,
      height: 0.1
    });

    Toast.success('Signature placed! You can drag it into position.');
  }
}
