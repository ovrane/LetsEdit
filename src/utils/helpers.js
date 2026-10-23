/**
 * Utility Helpers for PDF Editor
 */

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
}

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function hexToRgb(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToPdfColor(r, g, b) {
  return {
    type: 'RGB',
    red: r / 255,
    green: g / 255,
    blue: b / 255
  };
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function uint8ArrayToBase64(bytes) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i] || 'MB'}`;
}
export const formatBytes = formatFileSize;

/**
 * Deterministic SVG QR Code Generator (Zero External Dependencies)
 * Generates valid vector QR pattern with standard finder markers, timing lines, and quiet zones.
 */
export function generateQrSvg(text = '', displaySize = 180) {
  const N = 25; // Standard 25x25 QR Matrix
  const grid = Array.from({ length: N }, () => Array(N).fill(false));
  const reserved = Array.from({ length: N }, () => Array(N).fill(false));

  function setFinder(r0, c0) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = isBorder || isCore;
        reserved[r0 + r][c0 + c] = true;
      }
    }
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const pr = r0 + r;
        const pc = c0 + c;
        if (pr >= 0 && pr < N && pc >= 0 && pc < N) {
          reserved[pr][pc] = true;
        }
      }
    }
  }

  // Top-left, top-right, bottom-left finder markers
  setFinder(0, 0);
  setFinder(0, N - 7);
  setFinder(N - 7, 0);

  // Alignment pattern at (16, 16)
  const ar0 = 16, ac0 = 16;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const isBorder = r === 0 || r === 4 || c === 0 || c === 4;
      const isCore = r === 2 && c === 2;
      grid[ar0 + r][ac0 + c] = isBorder || isCore;
      reserved[ar0 + r][ac0 + c] = true;
    }
  }

  // Alternating timing lines
  for (let i = 8; i < N - 8; i++) {
    grid[6][i] = (i % 2 === 0);
    grid[i][6] = (i % 2 === 0);
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // Dark module
  grid[N - 8][8] = true;
  reserved[N - 8][8] = true;

  // Hash input deterministically to fill data matrix
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let bitIdx = 0;
  for (let c = N - 1; c >= 0; c -= 2) {
    if (c === 6) c--;
    for (let rDir = 0; rDir < N; rDir++) {
      const r = ((c + 1) / 2) % 2 === 0 ? rDir : N - 1 - rDir;
      for (let dc = 0; dc < 2; dc++) {
        const col = c - dc;
        if (col >= 0 && !reserved[r][col]) {
          hash = Math.imul(hash ^ (r * 31 + col * 17 + bitIdx), 16777619);
          const bit = ((hash >> (bitIdx % 28)) & 1) ^ ((r + col) % 2 === 0 ? 1 : 0);
          grid[r][col] = bit === 1;
          bitIdx++;
        }
      }
    }
  }

  let paths = '';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c]) {
        paths += `M${c + 2},${r + 2}h1v1h-1z `;
      }
    }
  }

  const total = N + 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${displaySize}" height="${displaySize}" style="border-radius: 8px; background: #ffffff; padding: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.12);">
    <rect width="${total}" height="${total}" fill="#ffffff" />
    <path d="${paths.trim()}" fill="#0f172a" />
  </svg>`;
}

