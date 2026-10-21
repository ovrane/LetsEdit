/**
 * Pure JavaScript ISO 32000-1 Standard PDF Encryption & Key Derivation
 * Computes Algorithm 2, 3, and 4 security parameters (/O, /U, /P, /Length 128)
 * for native PDF password protection without any external binaries or dependencies.
 */

import { PDFName, PDFNumber, PDFHexString } from 'pdf-lib';

// 32-byte standard PDF padding string defined in ISO 32000-1 Table 20
export const PDF_PADDING = new Uint8Array([
  0x28, 0xBF, 0x4E, 0x5E, 0x4E, 0x75, 0x8A, 0x41,
  0x64, 0x00, 0x4E, 0x56, 0xFF, 0xFA, 0x01, 0x08,
  0x2E, 0x2E, 0x00, 0xB6, 0xD0, 0x68, 0x3E, 0x80,
  0x2F, 0x0C, 0xA9, 0xFE, 0x64, 0x53, 0x69, 0x7A
]);

export function md5(bytes) {
  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];
  const S = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];
  const origLen = bytes.length;
  const bitLen = origLen * 8;
  const padLen = (origLen % 64 < 56) ? (56 - (origLen % 64)) : (120 - (origLen % 64));
  const totalLen = origLen + padLen + 8;
  const buf = new Uint8Array(totalLen);
  buf.set(bytes);
  buf[origLen] = 0x80;

  const view = new DataView(buf.buffer);
  view.setUint32(totalLen - 8, bitLen, true);
  view.setUint32(totalLen - 4, Math.floor(bitLen / 0x100000000), true);

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let i = 0; i < totalLen; i += 64) {
    let A = a, B = b, C = c, D = d;
    for (let j = 0; j < 64; j++) {
      let F, g;
      if (j < 16) {
        F = (B & C) | (~B & D);
        g = j;
      } else if (j < 32) {
        F = (D & B) | (~D & C);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        F = B ^ C ^ D;
        g = (3 * j + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * j) % 16;
      }
      const M_g = view.getUint32(i + g * 4, true);
      const temp = D;
      D = C;
      C = B;
      const sum = (A + F + K[j] + M_g) >>> 0;
      const rot = S[j];
      const shifted = ((sum << rot) | (sum >>> (32 - rot))) >>> 0;
      B = (B + shifted) >>> 0;
      A = temp;
    }
    a = (a + A) >>> 0;
    b = (b + B) >>> 0;
    c = (c + C) >>> 0;
    d = (d + D) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a, true);
  outView.setUint32(4, b, true);
  outView.setUint32(8, c, true);
  outView.setUint32(12, d, true);
  return out;
}

export function rc4(key, data) {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 0xff;
    const tmp = S[i];
    S[i] = S[j];
    S[j] = tmp;
  }
  let i = 0;
  j = 0;
  const out = new Uint8Array(data.length);
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 0xff;
    j = (j + S[i]) & 0xff;
    const tmp = S[i];
    S[i] = S[j];
    S[j] = tmp;
    out[k] = data[k] ^ S[(S[i] + S[j]) & 0xff];
  }
  return out;
}

export function padPassword(pwd) {
  const buf = new Uint8Array(32);
  const enc = new TextEncoder().encode(pwd || '');
  const copyLen = Math.min(enc.length, 32);
  buf.set(enc.subarray(0, copyLen));
  if (copyLen < 32) {
    buf.set(PDF_PADDING.subarray(0, 32 - copyLen), copyLen);
  }
  return buf;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function computePdfStandardSecurity(userPassword, ownerPassword = null, permissionsConfig = null) {
  const uPwd = userPassword || '';
  const oPwd = ownerPassword || userPassword || '';

  // 1. Calculate Permissions Integer (32-bit signed, default -4: print & copy allowed)
  let pInt = -4;
  if (permissionsConfig) {
    if (permissionsConfig.printing === false) pInt &= ~4;
    if (permissionsConfig.copying === false) pInt &= ~16;
    if (permissionsConfig.modifying === false) pInt &= ~(8 | 32);
  }

  // 2. Algorithm 3: Compute /O Entry (Revision 3, 128-bit)
  const paddedO = padPassword(oPwd);
  let oKey = md5(paddedO);
  for (let i = 0; i < 50; i++) {
    oKey = md5(oKey);
  }

  let oResult = padPassword(uPwd);
  for (let i = 0; i < 20; i++) {
    const roundKey = new Uint8Array(16);
    for (let k = 0; k < 16; k++) {
      roundKey[k] = oKey[k] ^ i;
    }
    oResult = rc4(roundKey, oResult);
  }

  // 3. Algorithm 2: Compute Encryption Key
  const pBytes = new Uint8Array(4);
  new DataView(pBytes.buffer).setInt32(0, pInt, true);

  const keyInput = new Uint8Array(32 + 32 + 4 + 16);
  keyInput.set(padPassword(uPwd), 0);
  keyInput.set(oResult, 32);
  keyInput.set(pBytes, 64);
  // Default document ID
  for (let i = 0; i < 16; i++) keyInput[68 + i] = 0x5a;

  let encKey = md5(keyInput);
  for (let i = 0; i < 50; i++) {
    encKey = md5(encKey);
  }

  // 4. Algorithm 4: Compute /U Entry
  let uResult = new Uint8Array(PDF_PADDING);
  for (let i = 0; i < 20; i++) {
    const roundKey = new Uint8Array(16);
    for (let k = 0; k < 16; k++) {
      roundKey[k] = encKey[k] ^ i;
    }
    uResult = rc4(roundKey, uResult);
  }

  return {
    O_hex: bytesToHex(oResult),
    U_hex: bytesToHex(uResult),
    P_num: pInt,
    encKey
  };
}

export function applyPdfEncryption(doc, userPassword, ownerPassword = null, permissionsConfig = null) {
  const { O_hex, U_hex, P_num } = computePdfStandardSecurity(userPassword, ownerPassword, permissionsConfig);

  const encryptDict = doc.context.obj({
    Filter: PDFName.of('Standard'),
    V: PDFNumber.of(2),
    R: PDFNumber.of(3),
    O: PDFHexString.of(O_hex),
    U: PDFHexString.of(U_hex),
    P: PDFNumber.of(P_num),
    Length: PDFNumber.of(128)
  });

  const encryptRef = doc.context.register(encryptDict);
  doc.context.trailerInfo.Encrypt = encryptRef;
}
