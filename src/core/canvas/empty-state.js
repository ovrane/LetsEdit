/**
 * Canvas Empty State Renderer
 * Displays a clean, Adobe Acrobat / Landing style upload dropzone when no document is open.
 */

const getPdfEngine = async () => (await import('../pdf-engine.js')).pdfEngine;
import { store } from '../state-store.js';
import { readFileAsArrayBuffer } from '../../utils/helpers.js';
import { Toast } from '../../components/toast.js';

export class CanvasEmptyState {
  static render(container) {
    const pagingBar = document.getElementById('editor-paging-bar');
    if (pagingBar) pagingBar.style.display = 'none';

    const emptyWrap = document.createElement('div');
    emptyWrap.className = 'editor-upload-card';
    emptyWrap.id = 'editor-empty-dropzone';
    emptyWrap.innerHTML = `
      <div class="editor-upload-badge-wrapper">
        <div class="editor-upload-badge-glow"></div>
        <div class="editor-upload-icon-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <polyline points="9 15 12 12 15 15"></polyline>
          </svg>
        </div>
      </div>

      <h2 class="editor-upload-title">Select a PDF to edit</h2>
      <p class="editor-upload-subtitle">
        Drag and drop your file here, or choose from your computer to edit text, fill forms, and annotate privately.
      </p>

      <div class="editor-upload-actions">
        <input type="file" id="editor-empty-file-input" accept="application/pdf" style="display:none;" />
        <button class="btn editor-upload-btn-primary" id="btn-editor-upload-pdf">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <span>Select PDF file</span>
        </button>
        <button class="btn editor-upload-btn-secondary" id="btn-editor-blank-doc">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"></rect><line x1="8" y1="8" x2="16" y2="8"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          <span>Blank Page</span>
        </button>
      </div>

      <div class="editor-upload-drop-hint">
        or drag and drop your file here
      </div>

      <div class="editor-upload-features">
        <div class="feature-pill pill-private">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>100% In-Browser Privacy</span>
        </div>
        <div class="feature-pill pill-vector">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>Edit &amp; Add Text</span>
        </div>
      </div>
    `;

    container.appendChild(emptyWrap);

    const fileInp = emptyWrap.querySelector('#editor-empty-file-input');
    const uploadBtn = emptyWrap.querySelector('#btn-editor-upload-pdf');
    const blankBtn = emptyWrap.querySelector('#btn-editor-blank-doc');

    if (uploadBtn && fileInp) {
      uploadBtn.onclick = () => fileInp.click();
      fileInp.onchange = async (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
          try {
            Toast.info('Loading PDF document...');
            const engine = await getPdfEngine();
            const ab = await readFileAsArrayBuffer(file);
            const info = await engine.loadPdf(ab);
            store.setDocument(ab, file.name, info.numPages);
            const filenameEl = document.getElementById('current-filename');
            if (filenameEl) filenameEl.textContent = file.name;
            Toast.success(`Loaded ${file.name} (${info.numPages} pages)`);
          } catch (err) {
            console.error(err);
            Toast.error('Could not load PDF');
          }
        }
      };
    }

    if (blankBtn) {
      blankBtn.onclick = async () => {
        try {
          Toast.info('Creating clean blank page...');
          const engine = await getPdfEngine();
          const blankBytes = await engine.createBlankPdf();
          const info = await engine.loadPdf(blankBytes);
          store.setDocument(blankBytes, 'Blank_Document.pdf', info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = 'Blank_Document.pdf';
          Toast.success('Blank document ready! Add text, shapes, or signatures.');
        } catch (err) {
          console.error(err);
          Toast.error('Failed to create blank page');
        }
      };
    }

    emptyWrap.ondragover = (e) => {
      e.preventDefault();
      emptyWrap.classList.add('drag-over');
    };
    emptyWrap.ondragleave = () => {
      emptyWrap.classList.remove('drag-over');
    };
    emptyWrap.ondrop = async (e) => {
      e.preventDefault();
      emptyWrap.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type === 'application/pdf') {
        try {
          Toast.info('Loading PDF document...');
          const engine = await getPdfEngine();
          const ab = await readFileAsArrayBuffer(file);
          const info = await engine.loadPdf(ab);
          store.setDocument(ab, file.name, info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = file.name;
          Toast.success(`Loaded ${file.name} (${info.numPages} pages)`);
        } catch (err) {
          console.error(err);
          Toast.error('Could not load PDF');
        }
      } else {
        Toast.error('Please drop a valid PDF document');
      }
    };
  }
}
