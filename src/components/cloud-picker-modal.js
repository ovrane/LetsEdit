/**
 * Cloud Storage File Picker Modal
 * Reverse-engineered from iLovePDF & SmallPDF cloud ingestion dialogs.
 * Allows users to browse, search, and import PDF documents directly from Google Drive and Dropbox.
 */

import { CloudStorageService } from '../core/cloud-storage.js';
import { Toast } from './toast.js';
import { formatFileSize } from '../utils/helpers.js';

class CloudPickerModal {
  constructor() {
    this.container = null;
    this.activeProvider = 'gdrive'; // 'gdrive' | 'dropbox'
    this.files = [];
    this.selectedFileIds = new Set();
    this.searchQuery = '';
    this.isLoading = false;
    this.onFilesSelectedCallback = null;
  }

  async open(provider = 'gdrive', options = {}) {
    this.activeProvider = provider;
    this.onFilesSelectedCallback = options.onFilesSelected || null;
    this.selectedFileIds.clear();
    this.searchQuery = '';

    this.render();
    await this.fetchFiles();
  }

  close() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }

  async fetchFiles() {
    this.isLoading = true;
    this.renderFileList();

    try {
      this.files = await CloudStorageService.listFiles(this.activeProvider, this.searchQuery);
    } catch (err) {
      Toast.error(err.message);
      this.files = [];
    } finally {
      this.isLoading = false;
      this.renderFileList();
    }
  }

  render() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'cloud-picker-modal-overlay';
      this.container.className = 'modal-backdrop';
      this.container.style.display = 'flex';
      this.container.style.zIndex = '99999';
      document.body.appendChild(this.container);
    }

    const isGdrive = this.activeProvider === 'gdrive';
    const brandColor = isGdrive ? '#0066da' : '#0061ff';
    const providerTitle = isGdrive ? 'Google Drive' : 'Dropbox';

    this.container.innerHTML = `
      <div class="modal-dialog" style="max-width: 640px; width: 94%; border-radius: 14px; overflow: hidden; background: var(--bg-card, #ffffff); box-shadow: 0 20px 50px rgba(0,0,0,0.25);">
        <!-- Header -->
        <div style="padding: 18px 24px; border-bottom: 1px solid var(--border-subtle, #e2e8f0); display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface, #f8fafc);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center;">
              ${isGdrive
                ? `<svg width="22" height="22" viewBox="0 0 87.3 78" fill="none"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066da"/><path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.55h27.5L43.65 25z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.9 10.2 7.85 13.6z" fill="#ea4335"/><path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2L43.65 25z" fill="#00832d"/><path d="M59.8 48.55H27.5L13.75 72.35c1.35.8 2.9 1.25 4.5 1.25h50.8c1.6 0 3.15-.45 4.5-1.25L59.8 48.55z" fill="#2684fc"/><path d="M73.4 26.5L60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 23.55h27.5c0-1.55-.4-3.1-1.2-4.5l-12.7-17.55z" fill="#ffba00"/></svg>`
                : `<svg width="22" height="22" fill="#0061ff" viewBox="0 0 24 24"><path d="M7.05 3.5L1.5 7.14l4.5 3.59 5.55-3.64-4.5-3.59zm9.9 0l-4.5 3.59 5.55 3.64 4.5-3.59-5.55-3.64zM1.5 14.33l5.55 3.64 4.5-3.59-5.55-3.64-4.5 3.59zm21 0l-4.5-3.59-5.55 3.64 4.5 3.59 5.55-3.64zM7.05 19.06l4.5 3.59 4.5-3.59-4.5-3.59-4.5 3.59z"/></svg>`}
            </div>
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: var(--text-main, #0f172a);">Select from ${providerTitle}</h3>
              <span style="font-size: 12px; color: var(--text-muted, #64748b);">Direct client-side stream import</span>
            </div>
          </div>
          <button type="button" class="modal-close-btn" id="btn-close-cloud-picker" style="font-size: 20px; background: transparent; border: none; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <!-- Provider Switcher Tabs & Search -->
        <div style="padding: 14px 24px; border-bottom: 1px solid var(--border-subtle, #e2e8f0); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-xs ${isGdrive ? 'btn-primary' : 'btn-outline'} btn-switch-provider" data-provider="gdrive" style="font-weight: 600;">
              Google Drive
            </button>
            <button type="button" class="btn btn-xs ${!isGdrive ? 'btn-primary' : 'btn-outline'} btn-switch-provider" data-provider="dropbox" style="font-weight: 600;">
              Dropbox
            </button>
          </div>

          <div style="position: relative; flex: 1; max-width: 260px;">
            <input type="text" id="cloud-search-input" class="input-sm" placeholder="Search files..." value="${this.searchQuery}" style="width: 100%; padding: 6px 10px 6px 30px; border-radius: 6px; border: 1px solid var(--border-subtle, #e2e8f0); font-size: 12.5px;" />
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        <!-- File List Body -->
        <div id="cloud-file-list-wrap" style="max-height: 360px; min-height: 200px; overflow-y: auto; padding: 12px 24px;">
          <!-- Items dynamically injected -->
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; border-top: 1px solid var(--border-subtle, #e2e8f0); background: var(--bg-surface, #f8fafc); display: flex; align-items: center; justify-content: space-between;">
          <span id="cloud-selected-label" style="font-size: 12.5px; font-weight: 600; color: var(--text-muted, #64748b);">
            0 files selected
          </span>
          <div style="display: flex; gap: 10px;">
            <button type="button" id="btn-cancel-cloud-picker" class="btn btn-sm btn-outline">Cancel</button>
            <button type="button" id="btn-import-cloud-files" class="btn btn-sm btn-primary" style="background: ${brandColor};" disabled>
              Import Selected Files
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderFileList() {
    const listWrap = this.container?.querySelector('#cloud-file-list-wrap');
    if (!listWrap) return;

    if (this.isLoading) {
      listWrap.innerHTML = `
        <div style="text-align: center; padding: 40px 0;">
          <div class="workflow-spinner" style="width: 32px; height: 32px; margin: 0 auto 12px;"></div>
          <span style="font-size: 13px; color: var(--text-muted);">Fetching cloud directory...</span>
        </div>
      `;
      return;
    }

    if (this.files.length === 0) {
      listWrap.innerHTML = `
        <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
          <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 10px; display: block; opacity: 0.5;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
          <strong style="display: block; font-size: 14px; color: var(--text-main);">No PDF files found</strong>
          <span style="font-size: 12px;">Try a different search query or provider.</span>
        </div>
      `;
      return;
    }

    listWrap.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${this.files.map(file => {
          const isSelected = this.selectedFileIds.has(file.id);
          const dateStr = (file.modifiedTime || file.server_modified) ? new Date(file.modifiedTime || file.server_modified).toLocaleDateString() : 'Recent';
          return `
            <div class="cloud-file-row ${isSelected ? 'selected' : ''}" data-id="${file.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1.5px solid ${isSelected ? '#30050d' : 'var(--border-subtle, #e2e8f0)'}; border-radius: 8px; background: ${isSelected ? 'rgba(48, 5, 13, 0.04)' : 'var(--bg-card, #ffffff)'}; cursor: pointer; transition: all 0.15s ease;">
              <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                <input type="checkbox" class="cloud-file-check" data-id="${file.id}" ${isSelected ? 'checked' : ''} style="width: 16px; height: 16px; cursor: pointer;" />
                <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 700; font-size: 10px;">
                  PDF
                </div>
                <div style="overflow: hidden;">
                  <strong style="display: block; font-size: 13px; color: var(--text-main, #0f172a); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${file.name}</strong>
                  <span style="font-size: 11.5px; color: var(--text-muted, #64748b);">${formatFileSize(file.size || 0)} • Modified ${dateStr}</span>
                </div>
              </div>
              <span class="badge" style="font-size: 10.5px; background: var(--bg-surface); color: var(--text-muted); border: 1px solid var(--border-subtle);">Cloud</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindRowEvents();
  }

  bindEvents() {
    const closeBtn = this.container.querySelector('#btn-close-cloud-picker');
    const cancelBtn = this.container.querySelector('#btn-cancel-cloud-picker');
    if (closeBtn) closeBtn.onclick = () => this.close();
    if (cancelBtn) cancelBtn.onclick = () => this.close();

    const providerBtns = this.container.querySelectorAll('.btn-switch-provider');
    providerBtns.forEach(btn => {
      btn.onclick = () => {
        const prov = btn.getAttribute('data-provider');
        if (prov !== this.activeProvider) {
          this.activeProvider = prov;
          this.selectedFileIds.clear();
          this.render();
          this.fetchFiles();
        }
      };
    });

    const searchInp = this.container.querySelector('#cloud-search-input');
    if (searchInp) {
      let debounceTimer;
      searchInp.oninput = (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value.trim();
          this.fetchFiles();
        }, 300);
      };
    }

    const importBtn = this.container.querySelector('#btn-import-cloud-files');
    if (importBtn) {
      importBtn.onclick = () => this.importSelectedFiles();
    }
  }

  bindRowEvents() {
    const rows = this.container.querySelectorAll('.cloud-file-row');
    rows.forEach(row => {
      row.onclick = (e) => {
        const id = row.getAttribute('data-id');
        if (this.selectedFileIds.has(id)) {
          this.selectedFileIds.delete(id);
        } else {
          this.selectedFileIds.add(id);
        }
        this.renderFileList();
        this.updateFooter();
      };
    });
  }

  updateFooter() {
    const count = this.selectedFileIds.size;
    const label = this.container.querySelector('#cloud-selected-label');
    const importBtn = this.container.querySelector('#btn-import-cloud-files');

    if (label) {
      label.textContent = `${count} file${count === 1 ? '' : 's'} selected`;
    }
    if (importBtn) {
      importBtn.disabled = count === 0;
    }
  }

  async importSelectedFiles() {
    if (this.selectedFileIds.size === 0) return;

    const importBtn = this.container.querySelector('#btn-import-cloud-files');
    if (importBtn) {
      importBtn.disabled = true;
      importBtn.innerHTML = `<span>Downloading...</span>`;
    }

    const downloadedFiles = [];
    const selectedList = this.files.filter(f => this.selectedFileIds.has(f.id));

    for (const fileMeta of selectedList) {
      try {
        const fileObj = await CloudStorageService.downloadFile(this.activeProvider, fileMeta.id, fileMeta.name);
        downloadedFiles.push(fileObj);
      } catch (err) {
        console.warn(`[CloudPickerModal] Error downloading ${fileMeta.name}:`, err);
        Toast.error(`Failed to download ${fileMeta.name}`);
      }
    }

    if (downloadedFiles.length > 0) {
      Toast.success(`Imported ${downloadedFiles.length} file${downloadedFiles.length === 1 ? '' : 's'} from ${this.activeProvider === 'gdrive' ? 'Google Drive' : 'Dropbox'}.`);
      if (typeof this.onFilesSelectedCallback === 'function') {
        this.onFilesSelectedCallback(downloadedFiles);
      }
      this.close();
    } else {
      if (importBtn) {
        importBtn.disabled = false;
        importBtn.innerHTML = `<span>Import Selected Files</span>`;
      }
    }
  }
}

export const cloudPickerModal = new CloudPickerModal();
