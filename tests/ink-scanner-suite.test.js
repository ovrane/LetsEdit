import { test } from 'node:test';
import assert from 'node:assert';
import { InkScannerOps } from '../src/core/engine/operations/ink-scanner-ops.js';
import { PageOperations } from '../src/core/engine/page-ops.js';
import { handleInkScannerRequest } from '../server/routes/ink-scanner-routes.js';

// Mock request / response helpers for backend route testing
function createMockReq(method, body = null, headers = {}) {
  const req = {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    socket: { remoteAddress: '127.0.0.1' },
    listeners: {},
    on(event, handler) {
      this.listeners[event] = handler;
      if (event === 'data' && body !== null) {
        handler(typeof body === 'string' ? body : JSON.stringify(body));
      }
      if (event === 'end') {
        setTimeout(handler, 0);
      }
    }
  };
  return req;
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    writeHead(code, headers = {}) {
      this.statusCode = code;
      this.headers = { ...this.headers, ...headers };
    },
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(content) {
      this.body = content;
    }
  };
  return res;
}

test('Ink Scanner Suite - computeOtsuThreshold finds optimal bimodal separation', () => {
  const width = 100;
  const height = 100;
  const gray = new Uint8Array(width * height);

  // Create clear bimodal distribution:
  // 30% foreground ink around intensity 40
  // 70% background paper around intensity 220
  for (let i = 0; i < gray.length; i++) {
    if (i % 10 < 3) {
      gray[i] = 35 + (i % 10); // ~40
    } else {
      gray[i] = 215 + (i % 10); // ~220
    }
  }

  const threshold = InkScannerOps.computeOtsuThreshold(gray, width, height);
  // Optimal threshold must fall cleanly between foreground max (37) and background min (215)
  assert(threshold >= 37 && threshold < 215, `Threshold was ${threshold}, expected between 37 and 215`);
});

test('Ink Scanner Suite - normalizeIllumination levels harsh paper shadow gradients', () => {
  const width = 64;
  const height = 64;
  const gray = new Uint8Array(width * height);

  // Gradient: top-left bright (240), bottom-right dark (120)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      gray[y * width + x] = Math.round(240 - 120 * ((x + y) / (width + height)));
    }
  }

  const normalized = InkScannerOps.normalizeIllumination(gray, width, height, 16);
  assert.strictEqual(normalized.length, width * height);

  // After illumination leveling, all paper regions should be scaled near 255
  let sumNorm = 0;
  for (let i = 0; i < normalized.length; i++) sumNorm += normalized[i];
  const avgNorm = sumNorm / normalized.length;
  assert(avgNorm > 230, `Average normalized brightness was ${avgNorm}, expected > 230`);
});

test('Ink Scanner Suite - extractTransparentInk turns paper transparent and colorizes ink', () => {
  const width = 50;
  const height = 50;
  const rgba = new Uint8Array(width * height * 4);

  // Top half: light paper (RGB 240, 240, 240)
  // Bottom half: dark ink (RGB 30, 30, 30)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const isInk = y >= 25;
      const val = isInk ? 30 : 240;
      rgba[idx] = val;
      rgba[idx + 1] = val;
      rgba[idx + 2] = val;
      rgba[idx + 3] = 255;
    }
  }

  // Extract with Classic Blue (#1a365d -> RGB 26, 54, 93)
  const result = InkScannerOps.extractTransparentInk(rgba, width, height, {
    color: '#1a365d',
    smoothing: false,
    normalizeIllum: false,
    threshold: 128
  });

  assert.strictEqual(result.width, width);
  assert.strictEqual(result.height, height);

  const out = result.outputRgba;
  // Check paper region (top row): alpha must be 0
  const paperAlpha = out[3]; // pixel (0,0)
  assert.strictEqual(paperAlpha, 0);

  // Check ink region (bottom row): alpha must be 255, RGB must match Classic Blue
  const inkIdx = (40 * width + 25) * 4;
  assert.strictEqual(out[inkIdx], 26); // R
  assert.strictEqual(out[inkIdx + 1], 54); // G
  assert.strictEqual(out[inkIdx + 2], 93); // B
  assert.strictEqual(out[inkIdx + 3], 255); // Alpha
});

test('Ink Scanner Suite - smoothAlphaChannel eliminates pixel noise', () => {
  const width = 20;
  const height = 20;
  const alpha = new Uint8Array(width * height);

  // Introduce an isolated noisy single-pixel spike
  alpha[10 * width + 10] = 255;

  const smoothed = InkScannerOps.smoothAlphaChannel(alpha, width, height);
  // The isolated spike should be dispersed/softened by 3x3 binomial filtering
  assert(smoothed[10 * width + 10] < 255);
  assert(smoothed[10 * width + 10] > 0);
  assert(smoothed[10 * width + 11] > 0); // Neighbors receive blended energy
});

test('Ink Scanner Suite - encodeRgbaToPng produces valid binary PNG bytes', async () => {
  const width = 4;
  const height = 4;
  const rgba = new Uint8Array(width * height * 4).fill(128);

  const pngBytes = await InkScannerOps.encodeRgbaToPng(rgba, width, height);
  assert(pngBytes instanceof Uint8Array);

  // Check 8-byte PNG header: 137, 80, 78, 71, 13, 10, 26, 10
  assert.strictEqual(pngBytes[0], 137);
  assert.strictEqual(pngBytes[1], 80); // 'P'
  assert.strictEqual(pngBytes[2], 78); // 'N'
  assert.strictEqual(pngBytes[3], 71); // 'G'
  assert.strictEqual(pngBytes[4], 13);
  assert.strictEqual(pngBytes[5], 10);
  assert.strictEqual(pngBytes[6], 26);
  assert.strictEqual(pngBytes[7], 10);
});

test('Ink Scanner Suite - createSampleInkCapture generates synthetic photo under lighting shadows', async () => {
  const sample = await InkScannerOps.createSampleInkCapture(200, 80);
  assert.strictEqual(sample.width, 200);
  assert.strictEqual(sample.height, 80);
  assert(sample.rgba instanceof Uint8Array);
  assert(sample.pngBytes instanceof Uint8Array);
  assert(sample.dataUrl.startsWith('data:image/png;base64,'));
});

test('Ink Scanner Suite - PageOperations facade delegates ink scanner methods', async () => {
  const sample = await PageOperations.createSampleInkCapture(100, 50);
  assert.strictEqual(sample.width, 100);

  const proc = await PageOperations.processInkImage(sample, { color: '#0a0a0a' });
  assert.strictEqual(proc.success, true);
  assert(proc.dataUrl.startsWith('data:image/png;base64,'));
});

test('Ink Scanner Suite - Backend API routes handle sample and process endpoints', async () => {
  // 1. GET /api/ink-scanner/sample
  const req1 = createMockReq('GET', null, { accept: 'application/json' });
  const res1 = createMockRes();
  const handled1 = await handleInkScannerRequest(req1, res1, '/api/ink-scanner/sample', 'GET');
  assert.strictEqual(handled1, true);
  assert.strictEqual(res1.statusCode, 200);
  const json1 = JSON.parse(res1.body);
  assert.strictEqual(json1.success, true);
  assert(json1.pngBase64);

  // 2. POST /api/ink-scanner/process
  const req2 = createMockReq('POST', {
    imageBase64: json1.pngBase64,
    color: '#1a365d',
    thresholdOffset: 5,
    smoothing: true
  });
  const res2 = createMockRes();
  const handled2 = await handleInkScannerRequest(req2, res2, '/api/ink-scanner/process', 'POST');
  assert.strictEqual(handled2, true);
  assert.strictEqual(res2.statusCode, 200);
  const json2 = JSON.parse(res2.body);
  assert.strictEqual(json2.success, true);
  assert(json2.dataUrl.startsWith('data:image/png;base64,'));
  assert(json2.otsuThreshold > 0);
});
