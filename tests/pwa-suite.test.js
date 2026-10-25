import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PwaManager } from '../src/core/pwa-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('Progressive Web App (PWA) Offline Engine Tests', () => {
  test('PwaManager initializes with safe default state', () => {
    const manager = new PwaManager();
    assert.equal(manager.deferredPrompt, null);
    assert.equal(manager.isStandalone, false);
    assert.equal(typeof manager.installPwa, 'function');
    assert.equal(typeof manager.openLocalPdfWithFsApi, 'function');
    assert.equal(typeof manager.saveLocalPdfWithFsApi, 'function');
  });

  test('PwaManager subscriber system notifies on custom events', () => {
    const manager = new PwaManager();
    const events = [];
    const unsubscribe = manager.subscribe((type, data) => {
      events.push({ type, data });
    });

    manager.notifyListeners('network', { online: false });
    manager.notifyListeners('installed', true);

    assert.equal(events.length, 2);
    assert.equal(events[0].type, 'network');
    assert.equal(events[0].data.online, false);
    assert.equal(events[1].type, 'installed');

    unsubscribe();
    manager.notifyListeners('network', { online: true });
    assert.equal(events.length, 2); // Unsubscribed, no new event
  });

  test('installPwa handles standalone and deferred prompt branches', async () => {
    const manager = new PwaManager();

    // 1. Standalone mode
    manager.isStandalone = true;
    const resStandalone = await manager.installPwa();
    assert.equal(resStandalone.outcome, 'already-installed');

    // 2. Simulated beforeinstallprompt prompt event
    manager.isStandalone = false;
    let promptCalled = false;
    manager.deferredPrompt = {
      prompt: () => { promptCalled = true; },
      userChoice: Promise.resolve({ outcome: 'accepted' })
    };
    const resPrompt = await manager.installPwa();
    assert.equal(promptCalled, true);
    assert.equal(resPrompt.outcome, 'accepted');
    assert.equal(manager.deferredPrompt, null);
  });

  test('Native File System API fallback returns null when API is unavailable', async () => {
    const manager = new PwaManager();
    const openRes = await manager.openLocalPdfWithFsApi();
    assert.equal(openRes, null);

    const saveRes = await manager.saveLocalPdfWithFsApi(new Uint8Array([1, 2, 3]), 'test.pdf');
    assert.equal(saveRes.success, false);
    assert.equal(saveRes.fallback, true);
  });

  test('public/manifest.webmanifest exists and conforms to PWA standards', () => {
    const manifestPath = path.join(rootDir, 'public', 'manifest.webmanifest');
    assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest should exist in public/');

    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.ok(content.name.includes('LetsEdit'));
    assert.equal(content.short_name, 'LetsEdit');
    assert.equal(content.display, 'standalone');
    assert.equal(content.theme_color, '#30050d');
    assert.ok(Array.isArray(content.icons) && content.icons.length > 0);
    assert.ok(Array.isArray(content.shortcuts) && content.shortcuts.length >= 3);
    assert.ok(Array.isArray(content.file_handlers) && content.file_handlers.length > 0);
  });

  test('public/sw.js exists and defines offline precaching strategy', () => {
    const swPath = path.join(rootDir, 'public', 'sw.js');
    assert.ok(fs.existsSync(swPath), 'sw.js should exist in public/');

    const swContent = fs.readFileSync(swPath, 'utf8');
    assert.ok(swContent.includes('CACHE_NAME'));
    assert.ok(swContent.includes('PRECACHE_ASSETS'));
    assert.ok(swContent.includes('skipWaiting'));
    assert.ok(swContent.includes('clients.claim'));
    assert.ok(swContent.includes('/manifest.webmanifest'));
  });

  test('index.html links manifest.webmanifest and PWA icon', () => {
    const indexPath = path.join(rootDir, 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    assert.ok(indexContent.includes('rel="manifest"'));
    assert.ok(indexContent.includes('/manifest.webmanifest'));
    assert.ok(indexContent.includes('rel="apple-touch-icon"'));
  });
});
