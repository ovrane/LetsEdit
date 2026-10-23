/**
 * Account Settings Tabs Renderer
 * Renders profile information, session telemetry metrics, Pro features overview,
 * Developer REST API tokens with multi-language code snippets, and adaptive 2FA security settings.
 */

import { store } from '../../core/state-store.js';
import { Toast } from '../toast.js';

export class AccountTabsRenderer {
  static getCodeSnippet(codeTab, token) {
    if (codeTab === 'curl') {
      return `curl -X POST http://localhost:3000/api/pdf/merge \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "documents": ["<base64_doc_1>", "<base64_doc_2>"]
  }'`;
    } else if (codeTab === 'js') {
      return `const response = await fetch('http://localhost:3000/api/pdf/merge', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${token}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    documents: [doc1Base64, doc2Base64]
  })
});
const data = await response.json();
console.log('Merged PDF Base64:', data.pdfBase64);`;
    } else if (codeTab === 'python') {
      return `import requests

url = "http://localhost:3000/api/pdf/merge"
headers = {
    "Authorization": "Bearer ${token}",
    "Content-Type": "application/json"
}
payload = {
    "documents": [doc1_base64, doc2_base64]
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Merged PDF length:", len(data["pdfBase64"]))`;
    }
    return '';
  }

  static renderActiveTabContent(accountPage, user, apiKeys) {
    if (accountPage.activeTab === 'profile') {
      return `
        <div class="account-card">
          <div class="account-card-header">
            <div>
              <h2>Profile Details</h2>
              <p>Manage your account settings and workspace identity.</p>
            </div>
          </div>
          <div class="account-card-body">
            <form id="form-update-profile" class="account-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" id="profile-name-input" class="form-input" value="${user.name || ''}" required />
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" class="form-input" value="${user.email || ''}" disabled title="Email address cannot be changed." />
                </div>
              </div>
              <div class="form-group">
                <label>Account Role</label>
                <input type="text" class="form-input" value="${user.teamMember ? 'Enterprise Team Member' : 'Workspace Administrator'}" disabled />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary" id="btn-save-profile">Save Changes</button>
              </div>
            </form>
          </div>
        </div>

        <div class="account-card" style="margin-top: 24px;">
          <div class="account-card-header">
            <div>
              <h2>Session Telemetry & Audit</h2>
              <p>Client-side processing statistics during this browser session.</p>
            </div>
          </div>
          <div class="account-card-body">
            <div class="stats-overview-grid">
              <div class="stat-box">
                <div class="stat-number">100%</div>
                <div class="stat-label">Client-Side Privacy</div>
                <div class="stat-desc">Zero files uploaded to any cloud server</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">Unlimited</div>
                <div class="stat-label">Batch Processing</div>
                <div class="stat-desc">Multi-file parallel browser execution</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">&lt; 0.5s</div>
                <div class="stat-label">Average Runtime</div>
                <div class="stat-desc">Zero server queues or upload waits</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (accountPage.activeTab === 'plan') {
      return `
        <div class="account-card">
          <div class="account-card-header">
            <div>
              <h2>Your Active Plan</h2>
              <p>Enjoy unlimited, unthrottled PDF editing with zero subscription fees.</p>
            </div>
            <span class="account-plan-badge" style="background:var(--primary, #30050d); color:white; padding:6px 14px; border-radius:999px; font-weight:700; font-size:12px;">PRO UNLIMITED ACTIVE</span>
          </div>
          <div class="account-card-body">
            <div class="plan-comparison-box">
              <div class="plan-feature-row">
                <div class="feature-title">
                  <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Unlimited Document Size & Page Counts</span>
                </div>
                <span class="feature-badge">Included Free</span>
              </div>
              <div class="plan-feature-row">
                <div class="feature-title">
                  <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Multi-File Batch Processing & Free ZIP Downloads</span>
                </div>
                <span class="feature-badge">Included Free</span>
              </div>
              <div class="plan-feature-row">
                <div class="feature-title">
                  <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>High-Fidelity ISO 32000-1 AES-256 Encryption & True Redaction</span>
                </div>
                <span class="feature-badge">Included Free</span>
              </div>
              <div class="plan-feature-row">
                <div class="feature-title">
                  <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Zero-Telemetry Privacy (Zero documents sent to third-party servers)</span>
                </div>
                <span class="feature-badge">Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (accountPage.activeTab === 'api-keys') {
      return `
        <div class="account-card">
          <div class="account-card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h2>Developer & Automation REST API Keys</h2>
              <p>Programmatically automate PDF operations with our local Node.js backend.</p>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-create-api-key">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span>Generate New Key</span>
            </button>
          </div>
          <div class="account-card-body">
            ${apiKeys.length === 0 ? `
              <div class="empty-state-keys">
                <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color:var(--text-muted); margin-bottom:12px;"><path d="M21 2l-2 2m-1.5 1.5L10 13l-4 1 1-4 7.5-7.5M16 5l3 3"></path><circle cx="7.5" cy="16.5" r="4.5"></circle><polyline points="7.5 16.5 5 19 2 19 2 16 4.5 13.5"></polyline></svg>
                <p>No active API keys yet. Click <strong>Generate New Key</strong> above to create your first automation token.</p>
              </div>
            ` : `
              <div class="keys-table-container">
                <table class="keys-table">
                  <thead>
                    <tr>
                      <th>Key Label</th>
                      <th>Token</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${apiKeys.map(k => `
                      <tr>
                        <td><strong>${k.label}</strong></td>
                        <td>
                          <code class="token-code">${k.token.substring(0, 16)}••••••••••••</code>
                        </td>
                        <td>${new Date(k.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style="display:flex; gap:8px;">
                            <button class="btn btn-xs btn-outline btn-copy-key" data-token="${k.token}" title="Copy full token to clipboard">Copy</button>
                            <button class="btn btn-xs btn-outline text-danger btn-revoke-key" data-id="${k.id}" title="Revoke this key">Revoke</button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}

            <!-- Interactive API Snippets -->
            <div class="api-docs-box" style="margin-top: 32px;">
              <div class="api-docs-header">
                <h3>Quickstart REST API Example (POST /api/pdf/merge)</h3>
                <div class="code-tab-pills">
                  <button class="code-pill ${accountPage.codeTab === 'curl' ? 'active' : ''}" data-code-tab="curl">cURL</button>
                  <button class="code-pill ${accountPage.codeTab === 'js' ? 'active' : ''}" data-code-tab="js">JavaScript (Node)</button>
                  <button class="code-pill ${accountPage.codeTab === 'python' ? 'active' : ''}" data-code-tab="python">Python</button>
                </div>
              </div>
              <div class="api-snippet-wrap">
                <pre class="api-code-block"><code>${AccountTabsRenderer.getCodeSnippet(accountPage.codeTab, apiKeys[0]?.token || 'api_live_your_token_here')}</code></pre>
                <button class="btn btn-xs btn-outline btn-copy-snippet" title="Copy code snippet">Copy Snippet</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (accountPage.activeTab === 'security') {
      return `
        <div class="account-card">
          <div class="account-card-header">
            <div>
              <h2>Security & Verification</h2>
              <p>Configure two-factor authentication and session security policies.</p>
            </div>
          </div>
          <div class="account-card-body">
            <div class="security-toggle-row">
              <div>
                <strong>Adaptive Step-up 2FA (Email Verification)</strong>
                <p style="margin:4px 0 0; color:var(--text-muted); font-size:13px;">
                  Challenges logins with a 6-digit confirmation code on unrecognized devices.
                </p>
              </div>
              <label class="switch">
                <input type="checkbox" id="chk-toggle-2fa" ${user.requires2fa ? 'checked' : ''} />
                <span class="slider round"></span>
              </label>
            </div>

            <div class="account-divider" style="margin: 24px 0;"></div>

            <div>
              <h3>Active Session Devices</h3>
              <p style="color:var(--text-muted); font-size:13px; margin:4px 0 16px;">
                Your account is currently authorized on this browser instance.
              </p>
              <div class="session-device-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                <div class="session-device-meta">
                  <strong>Current Browser (${navigator.platform || 'Linux/Web'})</strong>
                  <span>Active Now • Pure Client-Side Local Storage</span>
                </div>
                <span class="badge-success">Current</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  static bindTabEvents(accountPage, user) {
    // Profile update form
    const profileForm = accountPage.container.querySelector('#form-update-profile');
    if (profileForm) {
      profileForm.onsubmit = (e) => {
        e.preventDefault();
        const newName = accountPage.container.querySelector('#profile-name-input').value.trim();
        if (newName) {
          const updated = { ...user, name: newName };
          store.setUser(updated);
          Toast.success('Profile details saved successfully!');
          accountPage.render();
        }
      };
    }

    // Security toggle
    const chk2fa = accountPage.container.querySelector('#chk-toggle-2fa');
    if (chk2fa) {
      chk2fa.onchange = (e) => {
        const val = e.target.checked;
        const updated = { ...user, requires2fa: val };
        store.setUser(updated);
        Toast.info(`Adaptive 2FA ${val ? 'enabled' : 'disabled'}`);
      };
    }

    // Create API Key
    const createKeyBtn = accountPage.container.querySelector('#btn-create-api-key');
    if (createKeyBtn) {
      createKeyBtn.onclick = () => {
        const label = prompt('Enter a label for this API key:', 'Production Key') || 'Default API Key';
        const newKey = {
          id: 'key_' + Math.random().toString(36).substring(2, 8),
          token: 'api_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
          label: label.trim(),
          createdAt: new Date().toISOString()
        };
        const currentKeys = user.apiKeys || [];
        const updated = { ...user, apiKeys: [newKey, ...currentKeys] };
        store.setUser(updated);
        Toast.success(`API key '${newKey.label}' created!`);
        accountPage.render();
      };
    }

    // Copy Token
    const copyBtns = accountPage.container.querySelectorAll('.btn-copy-key');
    copyBtns.forEach(btn => {
      btn.onclick = () => {
        const tok = btn.dataset.token;
        if (tok && typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(tok);
          Toast.success('API key token copied to clipboard!');
        }
      };
    });

    // Revoke Token
    const revokeBtns = accountPage.container.querySelectorAll('.btn-revoke-key');
    revokeBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        if (confirm('Are you sure you want to revoke this API key? Applications using it will lose access.')) {
          const filtered = (user.apiKeys || []).filter(k => k.id !== id);
          const updated = { ...user, apiKeys: filtered };
          store.setUser(updated);
          Toast.info('API key revoked.');
          accountPage.render();
        }
      };
    });

    // Code tabs
    const codePills = accountPage.container.querySelectorAll('.code-pill');
    codePills.forEach(pill => {
      pill.onclick = () => {
        accountPage.codeTab = pill.dataset.codeTab;
        accountPage.render();
      };
    });

    // Copy Snippet
    const copySnippetBtn = accountPage.container.querySelector('.btn-copy-snippet');
    if (copySnippetBtn) {
      copySnippetBtn.onclick = () => {
        const tok = user.apiKeys?.[0]?.token || 'api_live_your_token_here';
        const snippet = AccountTabsRenderer.getCodeSnippet(accountPage.codeTab, tok);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(snippet);
          Toast.success('Code snippet copied to clipboard!');
        }
      };
    }
  }
}
