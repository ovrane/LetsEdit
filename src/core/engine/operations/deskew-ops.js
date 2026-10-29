/**
 * Adobe Acrobat Pro & Sejda Scanner Deskew & Perspective Rectification Engine
 * Conforms to LETSEDIT_FULL_SUITE_REVERSE_ENGINEERING.md (Cluster 5 & Scan Ops)
 *
 * Capabilities:
 * 1. Radon projection & horizontal profile variance tilt detection
 * 2. Precision affine center-point inverse rotation matrix [-15.0° to +15.0°]
 * 3. Automatic scanner border triangular wedge cropping (autoCrop / CropBox inset)
 * 4. Realistic synthetic skewed scan generator for instant verification
 * 5. Full client-side zero-telemetry architecture
 */

import { PDFDocument, PDFName, degrees } from 'pdf-lib';

export class DeskewOps {
  /**
   * Generates a realistic 3-page synthetic scanned document with intentional tilt and scan artifacts
   */
  static async createSampleSkewedPdf(skewAngle = 2.8) {
    const doc = await PDFDocument.create();

    // Helper to draw a tilted page
    for (let p = 1; p <= 3; p++) {
      const page = doc.addPage([595.28, 841.89]);
      const w = page.getWidth();
      const h = page.getHeight();

      // Draw document content on a temporary page, then embed with skew
      // Or draw directly with angled lines/rectangles
      const cx = w / 2;
      const cy = h / 2;
      const rad = (skewAngle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Skewed header banner
      page.drawRectangle({
        x: cx - 220 * cos + 320 * sin,
        y: cy - 220 * sin - 320 * cos,
        width: 440,
        height: 48,
        rotate: degrees(skewAngle),
        color: { type: 'RGB', red: 0.15, green: 0.25, blue: 0.45 }
      });

      // Skewed document title text
      page.drawText(`OFFICIAL SCAN SPECIFICATION — PAGE ${p}`, {
        x: cx - 200 * cos + 335 * sin,
        y: cy - 200 * sin - 335 * cos,
        size: 15,
        rotate: degrees(skewAngle),
        color: { type: 'RGB', red: 1, green: 1, blue: 1 }
      });

      // Skewed text paragraphs simulating tilted invoice / contract rows
      for (let row = 0; row < 18; row++) {
        const rowY = 270 - row * 24;
        page.drawText(`Row ${row + 1}: Scanned paragraph text line showing tilt angle of ${skewAngle.toFixed(1)} degrees across horizontal bounds.`, {
          x: cx - 220 * cos + rowY * sin,
          y: cy - 220 * sin - rowY * cos,
          size: 10,
          rotate: degrees(skewAngle),
          color: { type: 'RGB', red: 0.12, green: 0.12, blue: 0.12 }
        });
      }
    }

    return await doc.save();
  }

  /**
   * Fast horizontal projection profile variance tilt detection algorithm.
   * Can accept pixel buffer Uint8Array/Uint8ClampedArray (RGBA or grayscale) or canvas.
   * Searches angle range [minAngle, maxAngle] with specified step.
   * Returns optimum straightening angle in degrees (e.g. -2.8).
   */
  static detectSkewAngleFromPixels(pixelData, width, height, options = {}) {
    if (!pixelData || width <= 0 || height <= 0) return 0;

    const minAngle = typeof options.minAngle === 'number' ? options.minAngle : -5.0;
    const maxAngle = typeof options.maxAngle === 'number' ? options.maxAngle : 5.0;
    const step = typeof options.step === 'number' ? options.step : 0.2;
    const threshold = typeof options.threshold === 'number' ? options.threshold : 185;

    // Downscale target width for high performance in real-time
    const targetW = Math.min(width, 240);
    const scale = targetW / width;
    const sw = Math.round(width * scale);
    const sh = Math.round(height * scale);
    if (sw <= 0 || sh <= 0) return 0;

    const isRgba = pixelData.length >= width * height * 4;

    // Create downsampled binary mask (1 for dark text pixels, 0 for white background)
    const binary = new Uint8Array(sw * sh);
    for (let sy = 0; sy < sh; sy++) {
      const origY = Math.min(height - 1, Math.floor(sy / scale));
      const rowOffset = sy * sw;
      for (let sx = 0; sx < sw; sx++) {
        const origX = Math.min(width - 1, Math.floor(sx / scale));
        let lum = 255;
        if (isRgba) {
          const idx = (origY * width + origX) * 4;
          lum = 0.299 * pixelData[idx] + 0.587 * pixelData[idx + 1] + 0.114 * pixelData[idx + 2];
        } else {
          lum = pixelData[origY * width + origX] || 255;
        }
        binary[rowOffset + sx] = lum < threshold ? 1 : 0;
      }
    }

    let bestAngle = 0;
    let maxVariance = -1;

    for (let a = minAngle; a <= maxAngle + 0.0001; a += step) {
      const rad = (a * Math.PI) / 180;
      const tan = Math.tan(rad);
      const rowBins = new Float32Array(sh);

      for (let y = 0; y < sh; y++) {
        const rowOffset = y * sw;
        for (let x = 0; x < sw; x += 2) {
          if (binary[rowOffset + x]) {
            const projectedY = Math.round(y + (x - sw / 2) * tan);
            if (projectedY >= 0 && projectedY < sh) {
              rowBins[projectedY]++;
            }
          }
        }
      }

      // Variance calculation: highest peak variance = aligned horizontal text lines
      let sum = 0;
      for (let y = 0; y < sh; y++) sum += rowBins[y];
      const mean = sum / sh;
      let variance = 0;
      for (let y = 0; y < sh; y++) {
        const diff = rowBins[y] - mean;
        variance += diff * diff;
      }

      if (variance > maxVariance) {
        maxVariance = variance;
        bestAngle = a;
      }
    }

    return Math.round(bestAngle * 100) / 100;
  }

  /**
   * Straightens PDF pages by rotating them about their center point with affine transform.
   * Supports auto-cropping scanner corner wedges and page range selection.
   */
  static async deskewPdf(rawBytes, options = {}) {
    if (!rawBytes) throw new Error('No PDF document loaded to deskew');

    let angle = 0;
    if (typeof options === 'number') {
      angle = options;
    } else if (typeof options === 'string') {
      angle = parseFloat(options) || 0;
    } else if (options && typeof options.angle !== 'undefined') {
      angle = parseFloat(options.angle) || 0;
    }

    const autoCrop = options && typeof options === 'object' ? Boolean(options.autoCrop) : false;
    const pageRange = options && typeof options === 'object' && Array.isArray(options.pageRange) ? options.pageRange : null;

    const srcDoc = await PDFDocument.load(rawBytes);
    const totalPages = srcDoc.getPageCount();

    if (Math.abs(angle) < 0.0001) {
      const savedBytes = await srcDoc.save();
      return {
        pdfBytes: savedBytes,
        report: {
          success: true,
          angle: 0,
          totalPages,
          pagesProcessed: totalPages,
          autoCropped: false
        }
      };
    }

    const finalDoc = await PDFDocument.create();
    let pagesProcessed = 0;

    for (let i = 0; i < totalPages; i++) {
      const pageNum = i + 1;
      const shouldProcess = !pageRange || pageRange.includes(pageNum);
      const srcPage = srcDoc.getPage(i);

      if (!srcPage.node.get(PDFName.of('Contents'))) {
        srcPage.node.set(PDFName.of('Contents'), srcDoc.context.register(srcDoc.context.stream('')));
      }

      const [embedded] = await finalDoc.embedPdf(srcDoc, [i]);
      const width = srcPage.getWidth();
      const height = srcPage.getHeight();

      const newPage = finalDoc.addPage([width, height]);

      if (!shouldProcess) {
        newPage.drawPage(embedded, { x: 0, y: 0 });
        continue;
      }

      // Center-point affine rotation
      const cx = width / 2;
      const cy = height / 2;
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = cx - (cx * cos - cy * sin);
      const y = cy - (cx * sin + cy * cos);

      newPage.drawPage(embedded, {
        x,
        y,
        rotate: degrees(angle)
      });

      // Auto-crop rotated edge corners to avoid black scanner wedges
      if (autoCrop && Math.abs(angle) > 0.1) {
        const absRad = Math.abs(rad);
        const insetX = Math.min(width * 0.08, height * Math.sin(absRad) * 0.5);
        const insetY = Math.min(height * 0.08, width * Math.sin(absRad) * 0.5);
        newPage.setCropBox(insetX, insetY, width - insetX * 2, height - insetY * 2);
      }

      pagesProcessed++;
    }

    const savedBytes = await finalDoc.save();
    return {
      pdfBytes: savedBytes,
      report: {
        success: true,
        angle,
        totalPages,
        pagesProcessed,
        autoCropped: autoCrop
      }
    };
  }
}
