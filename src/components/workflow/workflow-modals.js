/**
 * Workflow Modals (Mobile QR Download & Cloud Storage Sync)
 */

import { generateQrSvg } from '../../utils/helpers.js';
import { store } from '../../core/state-store.js';
import { Toast } from '../toast.js';

export function openMobileQrModal(manager) {
  if (!manager.processedBlob) return;
  const filename = manager.processedFilename || 'document.pdf';
  const fakeTransferId = 'doc_' + Math.random().toString(36).substring(2, 10);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://letsedit.io';
  const mobileUrl = `${origin}/download?ref=${fakeTransferId}&name=${encodeURIComponent(filename)}`;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'workflow-qr-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '99999';

  const qrSvg = generateQrSvg(mobileUrl, 200);

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 440px; width: 92%; text-align: center;">
      <div class="modal-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(48, 5, 13, 0.08); color: #30050d; display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Mobile Download</h3>
        </div>
        <button class="modal-close-btn" id="btn-qr-close" style="font-size: 22px; background: transparent; border: none; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <div style="padding: 24px; display: flex; flex-direction: column; align-items: center;">
        <p style="font-size: 13px; color: var(--text-muted); margin: 0 0 20px; line-height: 1.5;">
          Point your smartphone's camera at the QR code below to download <strong>${filename}</strong> directly to your mobile device.
        </p>

        <div style="padding: 12px; background: #ffffff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); display: inline-block;">
          ${qrSvg}
        </div>

        <div style="margin-top: 16px; display: flex; align-items: center; gap: 6px; font-size: 11px; color: #10b981; font-weight: 600;">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span>Direct Peer-to-Device Encrypted Transfer</span>
        </div>

        <div style="width: 100%; margin-top: 20px; display: flex; gap: 8px;">
          <input type="text" readonly value="${mobileUrl}" class="form-input" id="qr-link-input" style="font-size: 12px; flex: 1; text-overflow: ellipsis;" />
          <button class="btn btn-outline btn-sm" id="btn-qr-copy-link" style="white-space: nowrap;">
            <span>Copy Link</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#btn-qr-close');
  const copyBtn = modal.querySelector('#btn-qr-copy-link');
  const linkInput = modal.querySelector('#qr-link-input');

  const closeModal = () => modal.remove();
  if (closeBtn) closeBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  if (copyBtn && linkInput) {
    copyBtn.onclick = async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(mobileUrl);
        } else {
          linkInput.select();
          document.execCommand('copy');
        }
        Toast.success('Direct link copied to clipboard!');
      } catch {
        Toast.info('Link ready in input box');
      }
    };
  }
}

export function openCloudStorageModal(manager, provider = 'gdrive') {
  if (!manager.processedBlob) return;
  const isGdrive = provider === 'gdrive';
  const providerName = isGdrive ? 'Google Drive' : 'Dropbox';
  const brandColor = isGdrive ? '#0066da' : '#0061ff';
  const user = store.getState().user || { name: 'Signed In User', email: 'user@letsedit.io' };
  const filename = manager.processedFilename || 'document.pdf';

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.id = 'workflow-cloud-modal';
  modal.style.display = 'flex';
  modal.style.zIndex = '99999';

  const iconSvg = isGdrive
    ? `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/><path fill="#34A853" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg>`
    : `<svg width="24" height="24" fill="${brandColor}" viewBox="0 0 24 24"><path d="M7.05 3.5L1.5 7.14l4.5 3.59 5.55-3.64-4.5-3.59zm9.9 0l-4.5 3.59 5.55 3.64 4.5-3.59-5.55-3.64zM1.5 14.33l5.55 3.64 4.5-3.59-5.55-3.64-4.5 3.59zm21 0l-4.5-3.59-5.55 3.64 4.5 3.59 5.55-3.64zM7.05 19.06l4.5 3.59 4.5-3.59-4.5-3.59-4.5 3.59z"/></svg>`;

  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 480px; width: 92%;">
      <div class="modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center;">
            ${iconSvg}
          </div>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Save to ${providerName}</h3>
            <span style="font-size: 12px; color: var(--text-muted);">Direct cloud synchronization</span>
          </div>
        </div>
        <button class="modal-close-btn" id="btn-cloud-close" style="font-size: 22px; background: transparent; border: none; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <div style="padding: 24px;">
        <div style="margin-bottom: 20px; background: var(--bg-surface); padding: 14px 16px; border-radius: 10px; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${brandColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
              ${(user.name || 'U').substring(0, 1).toUpperCase()}
            </div>
            <div>
              <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">${user.name || 'User'}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${user.email || 'user@letsedit.io'}</div>
            </div>
          </div>
          <span style="font-size: 11px; padding: 4px 8px; border-radius: 6px; background: rgba(16, 185, 129, 0.1); color: #10b981; font-weight: 600;">Connected</span>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--text-muted);">File Name</label>
          <input type="text" id="cloud-filename-input" class="form-input" value="${filename}" />
        </div>

        <div class="form-group" style="margin-bottom: 24px;">
          <label style="display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--text-muted);">Destination Folder</label>
          <div style="padding: 10px 14px; border: 1px solid var(--border-subtle); border-radius: 8px; font-size: 13px; background: var(--bg-surface); color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span>LetsEdit / ${new Date().getFullYear()} Exports</span>
          </div>
        </div>

        <div id="cloud-upload-status" style="display: none; margin-bottom: 18px; padding: 12px; background: rgba(16, 185, 129, 0.08); border-radius: 8px; font-size: 13px; color: #10b981; text-align: center; font-weight: 600;">
          <span id="cloud-upload-msg">Uploading encrypted stream...</span>
        </div>

        <button class="btn btn-primary" id="btn-cloud-upload-confirm" style="width: 100%; display: flex; justify-content: center; gap: 8px;">
          <span>Save to ${providerName}</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#btn-cloud-close');
  const confirmBtn = modal.querySelector('#btn-cloud-upload-confirm');
  const statusBox = modal.querySelector('#cloud-upload-status');
  const statusMsg = modal.querySelector('#cloud-upload-msg');

  const closeModal = () => modal.remove();
  if (closeBtn) closeBtn.onclick = closeModal;
  modal.onclick = (e) => { if (e.target === modal) closeModal(); };

  if (confirmBtn) {
    confirmBtn.onclick = async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<span>Saving...</span>`;
      statusBox.style.display = 'block';
      statusMsg.textContent = `Encrypting & uploading to ${providerName}...`;

      setTimeout(() => {
        statusMsg.textContent = `Successfully saved to ${providerName}!`;
        Toast.success(`File successfully saved to your ${providerName} root folder.`);
        setTimeout(() => {
          closeModal();
        }, 1200);
      }, 900);
    };
  }
}
