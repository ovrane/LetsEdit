/**
 * Security Operations Sub-Module
 * Handles password removal (Sejda Unlock tool) and ISO 32000-1 AES encryption configuration.
 */

import { PDFDocument } from 'pdf-lib';
import { applyPdfEncryption } from '../pdf-crypto.js';

export class SecurityOperations {
  /**
   * Removes password encryption and restrictions from a PDF document (Sejda Unlock tool).
   */
  static async unlockPdf(encryptedBytes, password = '') {
    const sourceDoc = await PDFDocument.load(encryptedBytes, { ignoreEncryption: true });
    const finalDoc = await PDFDocument.create();
    const pageIndices = sourceDoc.getPageIndices();
    const pages = await finalDoc.copyPages(sourceDoc, pageIndices);
    pages.forEach(p => finalDoc.addPage(p));
    finalDoc.context.trailerInfo.Encrypt = undefined;
    return await finalDoc.save();
  }

  /**
   * Applies AES-256 password protection to a PDF document.
   */
  static applyEncryption(doc, userPassword, ownerPassword, permissions) {
    return applyPdfEncryption(doc, userPassword, ownerPassword, permissions);
  }
}
