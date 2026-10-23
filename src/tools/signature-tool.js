/**
 * Signature Tool: Modal supporting Draw, Type, Upload, and Webcam Camera Extraction
 * Matches Sejda's 4-way electronic signature creation suite.
 */

import { store } from '../core/state-store.js';
import { uid } from '../utils/helpers.js';
import { Toast } from '../components/toast.js';
import { mobilePairModal } from '../components/mobile-pair-modal.js';

export class SignatureTool {
  constructor() {
    this.modal = null;
    this.activeTab = 'draw';
    this.inkColor = '#0f172a';
    this.cameraStream = null;
    this.initModal();
  }

  initModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'signature-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header">
          <h3>Create Your Signature</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-tabs">
          <button class="tab-btn active" data-tab="draw">Draw</button>
          <button class="tab-btn" data-tab="type">Type</button>
          <button class="tab-btn" data-tab="upload">Upload</button>
          <button class="tab-btn" data-tab="camera">Camera</button>
          <button class="tab-btn" data-tab="phone">📱 Phone (QR)</button>
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
                <button class="color-dot" data-color="#30050d" style="background:#30050d;"></button>
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

          <!-- Tab 4: Camera (Webcam Signature Extractor) -->
          <div class="tab-content" id="tab-camera" style="display:none;">
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; text-align:center;">
              <p style="font-size:13px; color:var(--text-muted); margin-bottom:10px;">
                Hold a white piece of paper with your signature up to your webcam.
              </p>
              
              <div style="position:relative; width:100%; height:200px; background:#000; border-radius:6px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                <video id="sig-camera-video" autoplay playsinline style="width:100%; height:100%; object-fit:cover; display:none;"></video>
                <canvas id="sig-camera-canvas" width="600" height="200" style="display:none;"></canvas>
                <div id="sig-camera-placeholder" style="color:#94a3b8; font-size:13px;">Camera not active</div>
              </div>

              <div style="display:flex; justify-content:center; gap:10px; margin-top:12px;">
                <button class="btn btn-outline btn-sm" id="btn-start-camera">Turn On Camera</button>
                <button class="btn btn-primary btn-sm" id="btn-capture-camera" style="display:none;">Snap & Extract Ink</button>
              </div>

              <div id="sig-extracted-wrap" style="display:none; margin-top:14px; padding:10px; background:white; border:1px dashed #cbd5e1; border-radius:6px;">
                <p style="font-size:11px; color:#64748b; margin-bottom:4px;">Extracted Transparent Signature:</p>
                <img id="sig-extracted-img" style="max-height:80px;" />
              </div>
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

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    const video = this.modal.querySelector('#sig-camera-video');
    const placeholder = this.modal.querySelector('#sig-camera-placeholder');
    const snapBtn = this.modal.querySelector('#btn-capture-camera');
    const startBtn = this.modal.querySelector('#btn-start-camera');

    if (video) video.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (snapBtn) snapBtn.style.display = 'none';
    if (startBtn) startBtn.style.display = 'inline-block';
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

        if (this.activeTab !== 'camera') {
          this.stopCamera();
        }
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

    // Camera tab logic
    const video = this.modal.querySelector('#sig-camera-video');
    const placeholder = this.modal.querySelector('#sig-camera-placeholder');
    const snapBtn = this.modal.querySelector('#btn-capture-camera');
    const startBtn = this.modal.querySelector('#btn-start-camera');
    const extractedWrap = this.modal.querySelector('#sig-extracted-wrap');
    const extractedImg = this.modal.querySelector('#sig-extracted-img');
    let cameraExtractedUrl = null;

    startBtn.onclick = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          Toast.error('Webcam is not supported in this browser');
          return;
        }
        this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = this.cameraStream;
        video.style.display = 'block';
        placeholder.style.display = 'none';
        startBtn.style.display = 'none';
        snapBtn.style.display = 'inline-block';
      } catch (err) {
        console.error('Camera access error:', err);
        Toast.error('Could not access webcam: ' + err.message);
      }
    };

    snapBtn.onclick = () => {
      if (!video || video.videoWidth === 0) return;
      const offscreen = document.createElement('canvas');
      offscreen.width = 600;
      offscreen.height = 200;
      const octx = offscreen.getContext('2d');

      // Draw middle center crop of the video feed
      const srcW = video.videoWidth;
      const srcH = video.videoHeight;
      const cropW = srcW * 0.8;
      const cropH = cropW * (200 / 600);
      const cropX = (srcW - cropW) / 2;
      const cropY = (srcH - cropH) / 2;

      octx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, 600, 200);

      // Extract ink by adaptive paper binarization
      const imgData = octx.getImageData(0, 0, 600, 200);
      const data = imgData.data;

      // Threshold: darker pixels stay ink, lighter background paper becomes fully transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        if (brightness < 140) {
          // Keep as dark ink (using selected ink color #0f172a)
          data[i] = 15;
          data[i + 1] = 23;
          data[i + 2] = 42;
          data[i + 3] = 255;
        } else {
          // Transparent paper
          data[i + 3] = 0;
        }
      }

      octx.putImageData(imgData, 0, 0);
      cameraExtractedUrl = offscreen.toDataURL('image/png');
      extractedImg.src = cameraExtractedUrl;
      extractedWrap.style.display = 'block';
      Toast.success('Signature isolated from paper background!');
    };

    // Phone Pairing Signature
    let phoneExtractedUrl = null;
    const phoneBtn = this.modal.querySelector('#btn-start-phone-sig');
    const phoneBox = this.modal.querySelector('#phone-sig-preview-box');
    const phoneImg = this.modal.querySelector('#phone-sig-preview-img');

    if (phoneBtn) {
      phoneBtn.onclick = () => {
        mobilePairModal.open({
          action: 'sign',
          title: 'Draw Signature on Smartphone',
          subtitle: 'Scan QR code with your phone camera to sign on your touchscreen',
          onComplete: (payload) => {
            if (payload && payload.dataUrl) {
              phoneExtractedUrl = payload.dataUrl;
              if (phoneImg) phoneImg.src = payload.dataUrl;
              if (phoneBox) phoneBox.style.display = 'block';
              Toast.success('Phone signature ready! Click Save Signature to place on document.');
            }
          }
        });
      };
    }

    // Close / Cancel
    const close = () => {
      this.stopCamera();
      this.modal.style.display = 'none';
    };
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
      } else if (this.activeTab === 'camera') {
        if (!cameraExtractedUrl) {
          Toast.warning('Please capture a signature using the camera first');
          return;
        }
        finalDataUrl = cameraExtractedUrl;
      } else if (this.activeTab === 'phone') {
        if (!phoneExtractedUrl) {
          Toast.warning('Please scan the QR code and draw a signature on your phone first');
          return;
        }
        finalDataUrl = phoneExtractedUrl;
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

    Toast.success('Signature placed! Drag to reposition or resize.');
  }
}
