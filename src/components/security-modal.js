/**
 * Security & Encryption Modal Component
 * Configures AES-256 PDF encryption, document open passwords, and owner restriction policies.
 */

import { store } from '../core/state-store.js';
import { Toast } from './toast.js';

export class SecurityModal {
  constructor() {
    this.modal = null;
    this.init();
  }

  init() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-backdrop';
    this.modal.id = 'security-modal';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 500px;">
        <div class="modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#30050d" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <h3>PDF Security & Encryption</h3>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:12px; margin-bottom:16px; display:flex; gap:10px;">
            <div style="color:#30050d; font-weight:700;">AES-256</div>
            <div style="font-size:12px; color:#1e40af; line-height:1.4;">
              Secures your exported document with industry standard encryption. Anyone opening this PDF will be required to input this password.
            </div>
          </div>

          <div class="form-group">
            <label>Document Open Password</label>
            <input type="password" id="sec-user-pwd" class="form-input" placeholder="Enter secure password" autocomplete="new-password" />
            <div id="sec-strength-bar" style="height:4px; border-radius:2px; background:#e2e8f0; margin-top:6px; overflow:hidden;">
              <div id="sec-strength-fill" style="width:0%; height:100%; transition:width 0.2s, background 0.2s;"></div>
            </div>
          </div>

          <div class="form-group" style="margin-top:14px;">
            <label>Confirm Password</label>
            <input type="password" id="sec-confirm-pwd" class="form-input" placeholder="Re-enter password" autocomplete="new-password" />
          </div>

          <div class="form-group" style="margin-top:14px;">
            <label>Owner / Permissions Password (Optional)</label>
            <input type="password" id="sec-owner-pwd" class="form-input" placeholder="Optional master password" />
            <p style="font-size:11px; color:var(--text-muted); margin-top:4px;">
              Allows modifying security restrictions without changing the user open password.
            </p>
          </div>

          <div style="margin-top:18px; border-top:1px solid #f1f5f9; padding-top:14px;">
            <label style="font-size:13px; font-weight:600; margin-bottom:8px; display:block;">Permissions Policy</label>
            <div style="display:flex; flex-direction:column; gap:8px; font-size:13px; color:#334155;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="perm-print" checked /> Allow high-resolution printing
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="perm-copy" checked /> Allow copying text and graphics
              </label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                <input type="checkbox" id="perm-modify" /> Allow modifying document contents
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="justify-content: space-between;">
          <button class="btn btn-outline" id="sec-clear-btn" style="color:#ef4444; border-color:#fca5a5;">Remove Password</button>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="sec-apply-btn">Set Password</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.bindEvents();
  }

  bindEvents() {
    const pwdInp = this.modal.querySelector('#sec-user-pwd');
    const confInp = this.modal.querySelector('#sec-confirm-pwd');
    const ownerInp = this.modal.querySelector('#sec-owner-pwd');
    const fill = this.modal.querySelector('#sec-strength-fill');

    pwdInp.oninput = () => {
      const val = pwdInp.value;
      let score = 0;
      if (val.length >= 6) score += 25;
      if (val.length >= 10) score += 25;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 25;
      if (/[0-9]/.test(val) || /[^A-Za-z0-9]/.test(val)) score += 25;

      fill.style.width = `${score}%`;
      if (score <= 25) fill.style.background = '#ef4444';
      else if (score <= 50) fill.style.background = '#f59e0b';
      else if (score <= 75) fill.style.background = '#30050d';
      else fill.style.background = '#10b981';
    };

    const close = () => { this.modal.style.display = 'none'; };
    this.modal.querySelector('.modal-close-btn').onclick = close;
    this.modal.querySelector('.modal-cancel-btn').onclick = close;

    this.modal.querySelector('#sec-clear-btn').onclick = () => {
      store.setExportPassword(null);
      close();
      Toast.info('Password encryption removed');
    };

    this.modal.querySelector('#sec-apply-btn').onclick = () => {
      const pwd = pwdInp.value;
      const conf = confInp.value;

      if (!pwd) {
        Toast.warning('Please enter a password');
        return;
      }
      if (pwd !== conf) {
        Toast.error('Passwords do not match');
        return;
      }

      store.setExportPassword({
        userPassword: pwd,
        ownerPassword: ownerInp.value || pwd,
        permissions: {
          printing: this.modal.querySelector('#perm-print').checked,
          copying: this.modal.querySelector('#perm-copy').checked,
          modifying: this.modal.querySelector('#perm-modify').checked
        }
      });

      close();
      Toast.success('PDF encryption configured! Password will be required on export.');
    };
  }

  open() {
    const cur = store.getState().exportPassword;
    if (cur && cur.userPassword) {
      this.modal.querySelector('#sec-user-pwd').value = cur.userPassword;
      this.modal.querySelector('#sec-confirm-pwd').value = cur.userPassword;
      this.modal.querySelector('#sec-owner-pwd').value = cur.ownerPassword || '';
    } else {
      this.modal.querySelector('#sec-user-pwd').value = '';
      this.modal.querySelector('#sec-confirm-pwd').value = '';
      this.modal.querySelector('#sec-owner-pwd').value = '';
      this.modal.querySelector('#sec-strength-fill').style.width = '0%';
    }
    this.modal.style.display = 'flex';
  }
}
