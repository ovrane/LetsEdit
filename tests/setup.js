/**
 * Test Environment Bootstrap & Polyfills
 * Polyfills missing ECMAScript globals in Node 20 / older runtimes
 * specifically required by modern pdfjs-dist.
 */

// Polyfill ECMAScript Iterator global if absent (standardized in ES2024 / Node 22+)
if (typeof globalThis.Iterator === 'undefined') {
  globalThis.Iterator = function Iterator() {};
  globalThis.Iterator.prototype = Object.create(Object.prototype);
}
