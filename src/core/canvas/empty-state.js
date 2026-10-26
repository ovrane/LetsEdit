/**
 * Canvas Empty State Renderer
 * Displays rich drag-and-drop zone and actions when no PDF is loaded.
 */

import { pdfEngine } from '../pdf-engine.js';
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


      <h2 class="editor-upload-title">Upload PDF to Start Editing</h2>
      <p class="editor-upload-subtitle">
        Edit existing text, fill & sign forms, or organize pages — 100% private in your browser.
      </p>

      <div class="editor-upload-actions">
        <input type="file" id="editor-empty-file-input" accept="application/pdf" style="display:none;" />
        <button class="btn editor-upload-btn-primary" id="btn-editor-upload-pdf">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
          <span>Choose PDF Document</span>
        </button>
        <button class="btn editor-upload-btn-secondary" id="btn-editor-blank-doc">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"></rect><line x1="8" y1="8" x2="16" y2="8"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          <span>Start with Blank Page</span>
        </button>
      </div>

      <div class="editor-upload-drop-hint">
        or drag and drop your file here
      </div>

      <div class="editor-upload-sample-row">
        <span>Want to test first?</span>
        <button class="btn-sample-link" id="btn-editor-load-sample">Load sample contract</button>
      </div>

      <div class="editor-upload-features">
        <div class="feature-pill pill-private">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>100% Private (No Cloud Uploads)</span>
        </div>
        <div class="feature-pill pill-vector">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <span>Edit Original Text</span>
        </div>
      </div>
    `;

    container.appendChild(emptyWrap);

    const fileInp = emptyWrap.querySelector('#editor-empty-file-input');
    const uploadBtn = emptyWrap.querySelector('#btn-editor-upload-pdf');
    const blankBtn = emptyWrap.querySelector('#btn-editor-blank-doc');
    const sampleBtn = emptyWrap.querySelector('#btn-editor-load-sample');
    const sampleMultiBtn = emptyWrap.querySelector('#btn-editor-load-sample-multipage');

    if (uploadBtn && fileInp) {
      uploadBtn.onclick = () => fileInp.click();
      fileInp.onchange = async (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
          try {
            Toast.info('Loading PDF document...');
            const ab = await readFileAsArrayBuffer(file);
            const info = await pdfEngine.loadPdf(ab);
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
          const blankBytes = await pdfEngine.createBlankPdf();
          const info = await pdfEngine.loadPdf(blankBytes);
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

    if (sampleBtn) {
      sampleBtn.onclick = async () => {
        try {
          Toast.info('Loading sample agreement...');
          const sampleBytes = await pdfEngine.createSamplePdf();
          const info = await pdfEngine.loadPdf(sampleBytes);
          store.setDocument(sampleBytes, 'Sample_Agreement.pdf', info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = 'Sample_Agreement.pdf';
          Toast.success('Sample document loaded! Ready to edit.');
        } catch (err) {
          console.error(err);
          Toast.error('Failed to load sample document');
        }
      };
    }

    if (sampleMultiBtn) {
      sampleMultiBtn.onclick = async () => {
        try {
          Toast.info('Loading 4-page sample report...');
          const sampleBytes = await pdfEngine.createSampleWatermarkPdf();
          const info = await pdfEngine.loadPdf(sampleBytes);
          store.setDocument(sampleBytes, 'Sample_4Page_Report.pdf', info.numPages);
          const filenameEl = document.getElementById('current-filename');
          if (filenameEl) filenameEl.textContent = 'Sample_4Page_Report.pdf';
          Toast.success('4-page report loaded! Ready for multi-page editing.');
        } catch (err) {
          console.error(err);
          Toast.error('Failed to load multi-page sample');
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
          const ab = await readFileAsArrayBuffer(file);
          const info = await pdfEngine.loadPdf(ab);
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
