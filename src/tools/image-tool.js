/**
 * Enhanced Image Placement & Official Business Stamps Suite
 * Supports uploading custom images with opacity controls and
 * generating pre-designed vector business stamps (Approved, Draft, Void, Sign Here, etc.)
 */

import { store } from '../core/state-store.js';
import { uid } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';

export class ImageTool {
  constructor() {
    this.modal = null;
    this.activeTab = 'stamps';
    this.uploadedDataUrl = null;
    this.initModal();
  }

  initModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'image-stamps-modal';
    this.modal.style.display = 'none';

    const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 620px;">
        <div class="modal-header">
          <h3>Images & Business Stamps</h3>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="stamps">Standard Stamps</button>
          <button class="tab-btn" data-tab="custom-stamp">Custom Stamp</button>
          <button class="tab-btn" data-tab="upload">Upload Image</button>
        </div>

        <div class="modal-body" style="max-height: 480px; overflow-y: auto;">
          <!-- Tab 1: Standard Stamps -->
          <div class="tab-content" id="img-tab-stamps">
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:14px;">
              Click any official stamp below to immediately place it onto your active document page.
            </p>
            <div class="stamps-grid" style="display:grid; grid-template-columns: repeat(2, 1fr); gap:12px;">
              
              <!-- Approved Stamp -->
              <div class="stamp-card" data-stamp="APPROVED" data-color="#16a34a" style="border: 2px solid #16a34a; border-radius:6px; padding:12px; text-align:center; cursor:pointer; background:#f0fdf4; transition: transform 0.1s, box-shadow 0.1s;">
                <div style="font-weight:900; font-size:20px; color:#16a34a; letter-spacing:2px; text-transform:uppercase; border:2px dashed #16a34a; padding:6px; border-radius:4px;">
                  ✓ APPROVED
                </div>
                <div style="font-size:10px; color:#15803d; font-weight:700; margin-top:4px;">${todayDate}</div>
              </div>

              <!-- Rejected / Declined Stamp -->
              <div class="stamp-card" data-stamp="REJECTED" data-color="#dc2626" style="border: 2px solid #dc2626; border-radius:6px; padding:12px; text-align:center; cursor:pointer; background:#fef2f2; transition: transform 0.1s, box-shadow 0.1s;">
                <div style="font-weight:900; font-size:20px; color:#dc2626; letter-spacing:2px; text-transform:uppercase; border:2px dashed #dc2626; padding:6px; border-radius:4px;">
                  ✕ REJECTED
                </div>
                <div style="font-size:10px; color:#b91c1c; font-weight:700; margin-top:4px;">NOT ACCEPTED</div>
              </div>

              <!-- Confidential Stamp -->
              <div class="stamp-card" data-stamp="CONFIDENTIAL" data-color="#b91c1c" style="border: 2px solid #b91c1c; border-radius:6px; padding:12px; text-align:center; cursor:pointer; background:#fff1f2; transition: transform 0.1s, box-shadow 0.1s;">
                <div style="font-weight:900; font-size:19px; color:#b91c1c; letter-spacing:3px; text-transform:uppercase; border:2px solid #b91c1c; padding:6px; border-radius:4px;">
                  CONFIDENTIAL
                </div>
                <div style="font-size:10px; color:#9f1239; font-weight:700; margin-top:4px;">STRICT PRIVACY</div>
              </div>

              <!-- Draft Stamp -->
              <div class="stamp-card" data-stamp="DRAFT" data-color="#d97706" style="border: 2px solid #d97706; border-radius:6px; padding:12px; text-align:center; cursor:pointer; background:#fffbeb; transition: transform 0.1s, box-shadow 0.1s;">
                <div style="font-weight:900; font-size:20px; color:#d97706; letter-spacing:2px; text-transform:uppercase; border:2px dashed #d97706; padding:6px; border-radius:4px;">
                  ✎ DRAFT
                </div>
                <div style="font-size:10px; color:#b45309; font-weight:700; margin-top:4px;">FOR REVIEW ONLY</div>
              </div>

              <!-- Received Stamp -->
              <div class="stamp-card" data-stamp="RECEIVED" data-color="#30050d" style="border: 2px solid #30050d; border-radius:6px; padding:12px; text-align:center; cursor:pointer; background:rgba(48,5,13,0.04); transition: transform 0.1s, box-shadow 0.1s;">
                <div style="font-weight:900; font-size:18px; color:#30050d; letter-spacing:2px; text-transform:uppercase; border:2px solid #30050d; padding:6px; border-radius:4px;">
                  RECEIVED
                </div>
                <div style="font-size:10px; color:#1d4ed8; font-weight:700; margin-top:4px;">DATE: ${todayDate}</div>
              </div>

              <!-- Sign Here Stamp -->
              <div class="stamp-card" data-stamp="SIGN HERE" data-color="#30050d" style="border: 2px solid #30050d; border-radius:6px; padding:12px; text-align:center; cursor:pointer; background:rgba(48,5,13,0.04); transition: transform 0.1s, box-shadow 0.1s;">
                <div style="font-weight:900; font-size:18px; color:#30050d; letter-spacing:1px; text-transform:uppercase; border:2px solid #30050d; padding:6px; border-radius:4px; display:flex; align-items:center; justify-content:center; gap:6px;">
                  <span>➔ SIGN HERE</span>
                </div>
                <div style="font-size:10px; color:#0369a1; font-weight:700; margin-top:4px;">AUTHORIZED SIGNATURE</div>
              </div>

              <!-- Void Stamp -->
              <div class="stamp-card" data-stamp="VOID" data-color="#7c3aed" style="border: 2px solid #7c3aed; border-radius:6px; padding:12px; text-align:center; cursor:pointer; background:#f5f3ff; transition: transform 0.1s, box-shadow 0.1s;">
                <div style="font-weight:900; font-size:20px; color:#7c3aed; letter-spacing:4px; text-transform:uppercase; border:2px solid #7c3aed; padding:6px; border-radius:4px;">
                  VOID
                </div>
                <div style="font-size:10px; color:#6d28d9; font-weight:700; margin-top:4px;">CANCELLED DOCUMENT</div>
              </div>

              <!-- Final Stamp -->
              <div class="stamp-card" data-stamp="FINAL" data-color="#059669" style="border: 2px solid #059669; border-radius:6px; padding:12px; text-align:center; cursor:pointer; background:#ecfdf5; transition: transform 0.1s, box-shadow 0.1s;">
                <div style="font-weight:900; font-size:20px; color:#059669; letter-spacing:3px; text-transform:uppercase; border:2px solid #059669; padding:6px; border-radius:4px;">
                  FINAL VERSION
                </div>
                <div style="font-size:10px; color:#047857; font-weight:700; margin-top:4px;">LOCKED FOR RELEASE</div>
              </div>
            </div>
          </div>

          <!-- Tab 2: Custom Stamp Generator -->
          <div class="tab-content" id="img-tab-custom-stamp" style="display:none;">
            <div class="form-group">
              <label>Custom Stamp Text</label>
              <input type="text" id="custom-stamp-text" class="form-input" placeholder="e.g. AUDITED, COMPLETED, SHIPPED" value="VERIFIED" />
            </div>

            <div class="form-group" style="margin-top:12px;">
              <label>Secondary Sub-Text (Optional)</label>
              <input type="text" id="custom-stamp-subtext" class="form-input" placeholder="e.g. ${todayDate}" value="${todayDate}" />
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:12px;">
              <div class="form-group">
                <label>Ink Color</label>
                <div style="display:flex; align-items:center; gap:8px;">
                  <input type="color" id="custom-stamp-color" class="color-input-badge" value="#16a34a" />
                  <span id="custom-stamp-color-label" style="font-size:13px; color:var(--text-muted);">#16a34a</span>
                </div>
              </div>

              <div class="form-group">
                <label>Rotation Angle</label>
                <select id="custom-stamp-angle" class="form-input">
                  <option value="0">Straight (0°)</option>
                  <option value="-8" selected>Tilted (-8°)</option>
                  <option value="12">Tilted (12°)</option>
                  <option value="-20">Heavy Tilt (-20°)</option>
                </select>
              </div>
            </div>

            <!-- Custom Stamp Live Preview -->
            <div style="margin-top:18px; text-align:center; padding:20px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px;">
              <div id="custom-stamp-preview-box" style="display:inline-block; border:3px solid #16a34a; border-radius:8px; padding:10px 24px; transform:rotate(-8deg); background:rgba(255,255,255,0.95); box-shadow:0 2px 6px rgba(0,0,0,0.06);">
                <div id="custom-stamp-preview-title" style="font-weight:900; font-size:22px; color:#16a34a; letter-spacing:3px; text-transform:uppercase; border:2px dashed #16a34a; padding:4px 14px; border-radius:4px;">
                  VERIFIED
                </div>
                <div id="custom-stamp-preview-sub" style="font-size:11px; color:#16a34a; font-weight:700; margin-top:4px;">
                  ${todayDate}
                </div>
              </div>
            </div>

            <div style="text-align:center; margin-top:16px;">
              <button class="btn btn-primary" id="btn-insert-custom-stamp">Insert Custom Stamp</button>
            </div>
          </div>

          <!-- Tab 3: Upload Image -->
          <div class="tab-content" id="img-tab-upload" style="display:none;">
            <div class="dropzone" id="img-upload-dropzone">
              <input type="file" id="img-file-input" accept="image/png, image/jpeg, image/webp, image/svg+xml" style="display:none;" />
              <p>Drag and drop PNG, JPG, or SVG, or <strong>Browse</strong></p>
            </div>

            <div id="img-preview-container" style="display:none; margin-top:16px;">
              <div style="text-align:center; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
                <img id="img-uploaded-preview" style="max-height:160px; max-width:100%; border-radius:4px;" />
              </div>

              <div class="form-group" style="margin-top:14px;">
                <label>Image Opacity: <span id="img-opacity-val">100%</span></label>
                <input type="range" id="img-opacity-slider" min="0.1" max="1.0" step="0.05" value="1.0" style="width:100%;" />
              </div>

              <div style="text-align:center; margin-top:16px;">
                <button class="btn btn-primary" id="btn-insert-uploaded-img">Insert Image Onto Page</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary modal-cancel-btn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents(todayDate);
  }

  bindEvents(todayDate) {
    // Tab switching
    const tabBtns = this.modal.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.modal.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        this.modal.querySelector(`#img-tab-${this.activeTab}`).style.display = 'block';
      };
    });

    // Close buttons
    const close = () => { this.modal.style.display = 'none'; };
    this.modal.querySelector('.modal-close-btn').onclick = close;
    this.modal.querySelector('.modal-cancel-btn').onclick = close;

    // Click standard stamp card
    this.modal.querySelectorAll('.stamp-card').forEach(card => {
      card.onclick = () => {
        const text = card.dataset.stamp;
        const color = card.dataset.color;
        let sub = '';
        if (text === 'APPROVED' || text === 'RECEIVED') sub = todayDate;
        else if (text === 'REJECTED') sub = 'NOT ACCEPTED';
        else if (text === 'CONFIDENTIAL') sub = 'STRICT PRIVACY';
        else if (text === 'DRAFT') sub = 'FOR REVIEW ONLY';
        else if (text === 'SIGN HERE') sub = 'AUTHORIZED SIGNATURE';

        const dataUrl = this.generateStampDataUrl(text, sub, color, text === 'DRAFT' ? -10 : 0);
        this.placeImageOnActivePage(dataUrl, 0.28, 0.12);
        close();
        Toast.success(`Stamp "${text}" placed on document!`);
      };

      // Hover effect
      card.onmouseenter = () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = 'var(--shadow-md)'; };
      card.onmouseleave = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = 'none'; };
    });

    // Custom stamp logic
    const custTextInp = this.modal.querySelector('#custom-stamp-text');
    const custSubInp = this.modal.querySelector('#custom-stamp-subtext');
    const custColorInp = this.modal.querySelector('#custom-stamp-color');
    const custColorLabel = this.modal.querySelector('#custom-stamp-color-label');
    const custAngleSel = this.modal.querySelector('#custom-stamp-angle');

    const custPreviewBox = this.modal.querySelector('#custom-stamp-preview-box');
    const custPreviewTitle = this.modal.querySelector('#custom-stamp-preview-title');
    const custPreviewSub = this.modal.querySelector('#custom-stamp-preview-sub');

    const updateCustomPreview = () => {
      const text = custTextInp.value.trim() || 'STAMP';
      const sub = custSubInp.value.trim();
      const color = custColorInp.value;
      const angle = custAngleSel.value;

      custColorLabel.textContent = color;
      custPreviewBox.style.borderColor = color;
      custPreviewBox.style.transform = `rotate(${angle}deg)`;

      custPreviewTitle.textContent = text;
      custPreviewTitle.style.color = color;
      custPreviewTitle.style.borderColor = color;

      custPreviewSub.textContent = sub;
      custPreviewSub.style.color = color;
      custPreviewSub.style.display = sub ? 'block' : 'none';
    };

    custTextInp.oninput = updateCustomPreview;
    custSubInp.oninput = updateCustomPreview;
    custColorInp.oninput = updateCustomPreview;
    custAngleSel.onchange = updateCustomPreview;

    this.modal.querySelector('#btn-insert-custom-stamp').onclick = () => {
      const text = custTextInp.value.trim() || 'STAMP';
      const sub = custSubInp.value.trim();
      const color = custColorInp.value;
      const angle = parseInt(custAngleSel.value, 10);

      const dataUrl = this.generateStampDataUrl(text, sub, color, angle);
      this.placeImageOnActivePage(dataUrl, 0.28, 0.12);
      close();
      Toast.success(`Custom stamp "${text}" placed!`);
    };

    // Upload tab
    const dropzone = this.modal.querySelector('#img-upload-dropzone');
    const fileInp = this.modal.querySelector('#img-file-input');
    const previewContainer = this.modal.querySelector('#img-preview-container');
    const previewImg = this.modal.querySelector('#img-uploaded-preview');
    const opacitySlider = this.modal.querySelector('#img-opacity-slider');
    const opacityVal = this.modal.querySelector('#img-opacity-val');

    dropzone.onclick = () => fileInp.click();

    fileInp.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.uploadedDataUrl = reader.result;
          previewImg.src = this.uploadedDataUrl;
          previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    };

    opacitySlider.oninput = () => {
      const op = opacitySlider.value;
      opacityVal.textContent = `${Math.round(op * 100)}%`;
      previewImg.style.opacity = op;
    };

    this.modal.querySelector('#btn-insert-uploaded-img').onclick = () => {
      if (!this.uploadedDataUrl) {
        Toast.warning('Please select an image file first');
        return;
      }
      this.placeImageOnActivePage(this.uploadedDataUrl, 0.35, 0.2, parseFloat(opacitySlider.value));
      close();
      Toast.success('Image successfully placed on document!');
    };
  }

  generateStampDataUrl(title, subtitle, color, angle = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    ctx.translate(250, 100);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-250, -100);

    // Outer double border
    ctx.lineWidth = 6;
    ctx.strokeStyle = color;
    ctx.strokeRect(20, 20, 460, 160);

    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 440, 140);

    // Inner dashed box around title
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(40, 40, 420, subtitle ? 75 : 120);
    ctx.setLineDash([]);

    // Stamp text
    ctx.fillStyle = color;
    ctx.font = 'bold 38px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 250, subtitle ? 78 : 100);

    // Subtitle text (date or verification label)
    if (subtitle) {
      ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
      ctx.fillText(subtitle, 250, 145);
    }

    return canvas.toDataURL('image/png');
  }

  triggerUpload() {
    this.open();
  }

  open() {
    this.modal.style.display = 'flex';
  }

  placeImageOnActivePage(dataUrl, initialW = 0.3, initialH = 0.15, opacity = 1.0) {
    const state = store.getState();
    let targetPage = 1;
    for (let i = 1; i <= state.pageCount; i++) {
      if (!state.deletedPages.has(i)) {
        targetPage = i;
        break;
      }
    }

    store.addAnnotation(targetPage, {
      id: uid('img'),
      type: 'image',
      dataUrl,
      opacity,
      x: 0.35,
      y: 0.4,
      width: initialW,
      height: initialH
    });
  }
}
