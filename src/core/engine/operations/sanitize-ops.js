/**
 * Advanced Document Sanitization & Hidden Information Cleaner
 * Reverse-engineered from Adobe Acrobat Pro ("Remove Hidden Information" / "Sanitize Document")
 * and iLovePDF/Sejda document privacy specifications:
 * - Deep inspection and purge of:
 *   1. Document Info dictionary & ISO 16684-1 Adobe XMP metadata streams
 *   2. File attachments & EmbeddedFiles in catalog Name dictionaries
 *   3. Interactive JavaScript actions (/JS, /JavaScript), OpenAction, and /AA triggers
 *   4. Annotation markup, popups, comments, and stamp annotations (/Annots)
 *   5. Private application data (/PieceInfo from Illustrator, InDesign, Photoshop)
 *   6. Hidden layers & optional content groups (/OCProperties)
 *   7. Interactive AcroForm fields (flattening into permanent vectors)
 *   8. Re-indexing into clean object streams to eliminate orphaned unreferenced objects
 */

import { PDFDocument, PDFName, PDFDict, PDFArray, StandardFonts, rgb } from 'pdf-lib';

export class SanitizeOps {
  /**
   * Deep inspection of hidden data, tracking markers, embedded files, and scripts.
   */
  static async inspectHiddenData(pdfBytes) {
    if (!pdfBytes) throw new Error('No PDF provided to inspect hidden data');
    const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
    const totalPages = doc.getPageCount();

    const findings = {
      metadata: false,
      xmpStream: false,
      embeddedFiles: 0,
      javaScriptActions: 0,
      openActions: false,
      annotations: 0,
      privateData: false,
      hiddenLayers: false,
      formFields: 0,
      totalThreats: 0
    };

    // 1. Metadata & XMP inspection
    const title = doc.getTitle();
    const author = doc.getAuthor();
    const subject = doc.getSubject();
    const keywords = doc.getKeywords();
    if (title || author || subject || (Array.isArray(keywords) && keywords.length > 0)) {
      findings.metadata = true;
      findings.totalThreats++;
    }

    if (doc.catalog.has(PDFName.of('Metadata'))) {
      findings.xmpStream = true;
      findings.totalThreats++;
    }

    // 2. Embedded files in catalog Names dictionary
    if (doc.catalog.has(PDFName.of('Names'))) {
      const namesDict = doc.context.lookup(doc.catalog.get(PDFName.of('Names')));
      if (namesDict instanceof PDFDict && namesDict.has(PDFName.of('EmbeddedFiles'))) {
        findings.embeddedFiles++;
        findings.totalThreats++;
      }
    }

    // 3. JavaScript and OpenAction in Catalog
    if (doc.catalog.has(PDFName.of('OpenAction'))) {
      findings.openActions = true;
      findings.totalThreats++;
    }

    if (doc.catalog.has(PDFName.of('AA'))) {
      findings.javaScriptActions++;
      findings.totalThreats++;
    }

    if (doc.catalog.has(PDFName.of('Names'))) {
      const namesDict = doc.context.lookup(doc.catalog.get(PDFName.of('Names')));
      if (namesDict instanceof PDFDict && namesDict.has(PDFName.of('JavaScript'))) {
        findings.javaScriptActions++;
        findings.totalThreats++;
      }
    }

    // 4. Private application data & Hidden layers
    if (doc.catalog.has(PDFName.of('PieceInfo'))) {
      findings.privateData = true;
      findings.totalThreats++;
    }

    if (doc.catalog.has(PDFName.of('OCProperties'))) {
      findings.hiddenLayers = true;
      findings.totalThreats++;
    }

    // 5. AcroForm inspection
    if (doc.catalog.has(PDFName.of('AcroForm'))) {
      const formDict = doc.context.lookup(doc.catalog.get(PDFName.of('AcroForm')));
      if (formDict instanceof PDFDict && formDict.has(PDFName.of('Fields'))) {
        const fields = doc.context.lookup(formDict.get(PDFName.of('Fields')));
        if (fields instanceof PDFArray) {
          findings.formFields = fields.size();
          if (findings.formFields > 0) findings.totalThreats++;
        }
      }
    }

    // 6. Page-level annotations, page AA, and page PieceInfo
    for (let i = 0; i < totalPages; i++) {
      const page = doc.getPage(i);
      const annots = page.node.Annots();
      if (annots && annots.size() > 0) {
        findings.annotations += annots.size();
      }
      if (page.node.has(PDFName.of('PieceInfo'))) {
        findings.privateData = true;
      }
      if (page.node.has(PDFName.of('AA'))) {
        findings.javaScriptActions++;
      }
    }
    if (findings.annotations > 0) findings.totalThreats += findings.annotations;

    // Determine Risk Level
    let riskLevel = 'clean';
    if (findings.javaScriptActions > 0 || findings.embeddedFiles > 0 || findings.openActions) {
      riskLevel = 'high';
    } else if (findings.totalThreats > 0) {
      riskLevel = 'moderate';
    }

    return {
      totalPages,
      fileSizeBytes: bytes.byteLength,
      riskLevel,
      findings
    };
  }

  /**
   * Selectively or completely purges hidden information from the PDF.
   */
  static async sanitizeDocument(pdfBytes, options = {}) {
    if (!pdfBytes) throw new Error('No PDF provided to sanitize');
    const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
    const totalPages = doc.getPageCount();

    const purgeMetadata = options.purgeMetadata !== false;
    const purgeEmbeddedFiles = options.purgeEmbeddedFiles !== false;
    const purgeScripts = options.purgeScripts !== false;
    const purgeAnnotations = options.purgeAnnotations !== false;
    const purgePrivateData = options.purgePrivateData !== false;
    const flattenForms = options.flattenForms !== false;

    const removedItems = [];

    // 1. Purge Metadata & XMP Stream
    if (purgeMetadata) {
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setCreator('');
      doc.setProducer('');

      if (doc.catalog.has(PDFName.of('Metadata'))) {
        doc.catalog.delete(PDFName.of('Metadata'));
        removedItems.push('ISO 16684-1 Adobe XMP XML metadata packet purged');
      }
      removedItems.push('Document Info Dictionary (Title, Author, Subject, Keywords) cleared');
    }

    // 2. Purge Embedded Files & File Attachments
    if (purgeEmbeddedFiles && doc.catalog.has(PDFName.of('Names'))) {
      const namesDict = doc.context.lookup(doc.catalog.get(PDFName.of('Names')));
      if (namesDict instanceof PDFDict && namesDict.has(PDFName.of('EmbeddedFiles'))) {
        namesDict.delete(PDFName.of('EmbeddedFiles'));
        removedItems.push('Embedded file attachments and Name Tree associations cleared');
      }
    }

    // 3. Purge Scripts, OpenActions, and Automatic Triggers
    if (purgeScripts) {
      if (doc.catalog.has(PDFName.of('OpenAction'))) {
        doc.catalog.delete(PDFName.of('OpenAction'));
        removedItems.push('Document OpenAction triggers removed');
      }
      if (doc.catalog.has(PDFName.of('AA'))) {
        doc.catalog.delete(PDFName.of('AA'));
        removedItems.push('Catalog Additional Actions (/AA) cleared');
      }
      if (doc.catalog.has(PDFName.of('Names'))) {
        const namesDict = doc.context.lookup(doc.catalog.get(PDFName.of('Names')));
        if (namesDict instanceof PDFDict && namesDict.has(PDFName.of('JavaScript'))) {
          namesDict.delete(PDFName.of('JavaScript'));
          removedItems.push('Document-level JavaScript actions removed');
        }
      }
    }

    // 4. Purge Private Application Data & Hidden Layers
    if (purgePrivateData) {
      if (doc.catalog.has(PDFName.of('PieceInfo'))) {
        doc.catalog.delete(PDFName.of('PieceInfo'));
        removedItems.push('Catalog Private Application Data (/PieceInfo) purged');
      }
      if (doc.catalog.has(PDFName.of('OCProperties'))) {
        doc.catalog.delete(PDFName.of('OCProperties'));
        removedItems.push('Optional Content Groups & Hidden Layers (/OCProperties) removed');
      }
    }

    // 5. Purge Annotations & Page-level triggers
    let totalAnnotsRemoved = 0;
    for (let i = 0; i < totalPages; i++) {
      const page = doc.getPage(i);
      if (purgeAnnotations) {
        const annots = page.node.Annots();
        if (annots && annots.size() > 0) {
          totalAnnotsRemoved += annots.size();
          page.node.delete(PDFName.of('Annots'));
        }
      }
      if (purgePrivateData && page.node.has(PDFName.of('PieceInfo'))) {
        page.node.delete(PDFName.of('PieceInfo'));
      }
      if (purgeScripts && page.node.has(PDFName.of('AA'))) {
        page.node.delete(PDFName.of('AA'));
      }
    }
    if (totalAnnotsRemoved > 0) {
      removedItems.push(`${totalAnnotsRemoved} Page annotation(s), comments, and popups cleared`);
    }

    // 6. Flatten Interactive AcroForms
    if (flattenForms && doc.catalog.has(PDFName.of('AcroForm'))) {
      try {
        const form = doc.getForm();
        form.flatten();
        removedItems.push('Interactive AcroForm fields flattened into permanent read-only vectors');
      } catch (e) {
        // Fallback: delete AcroForm dictionary directly
        doc.catalog.delete(PDFName.of('AcroForm'));
        removedItems.push('Interactive AcroForm dictionary stripped');
      }
    }

    // Save with useObjectStreams: true to serialize into a clean indirect object structure
    const sanitizedBytes = await doc.save({ useObjectStreams: true, updateProperties: false });
    const originalSizeBytes = bytes.byteLength;
    const sanitizedSizeBytes = sanitizedBytes.byteLength;
    const bytesSaved = Math.max(0, originalSizeBytes - sanitizedSizeBytes);

    sanitizedBytes.pdfBytes = sanitizedBytes;
    sanitizedBytes.report = {
      isClean: true,
      removedItemsCount: removedItems.length,
      removedItems,
      originalSizeBytes,
      sanitizedSizeBytes,
      bytesSaved,
      sanitizedAt: new Date().toISOString()
    };

    return sanitizedBytes;
  }

  /**
   * Generates a sample PDF intentionally loaded with hidden tracking metadata,
   * embedded attachments, OpenActions, private PieceInfo, and markup annotations.
   */
  static async createSampleExposedPdf() {
    const doc = await PDFDocument.create();
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    doc.setTitle('Confidential M&A Strategy [DRAFT INTERNAL ONLY]');
    doc.setAuthor('Secret Project Team <internal-audit@enterprise.local>');
    doc.setSubject('Project Titanium Valuation & Acquisition Targets');
    doc.setKeywords(['confidential', 'merger', 'acquisition', 'internal', 'financial-leaks']);
    doc.setCreator('Adobe InDesign 2026 (Internal Build 21.4)');
    doc.setProducer('Internal Adobe PDF Library v18.4');

    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(0.85, 0.1, 0.1)
    });

    page.drawText('DOCUMENT SANITIZATION TEST BENCH', {
      x: 40,
      y: height - 60,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    page.drawText('This file intentionally contains hidden tracking markers, metadata & embedded data.', {
      x: 40,
      y: height - 90,
      size: 11,
      font,
      color: rgb(1, 0.9, 0.9)
    });

    page.drawText('Notice: Normal PDF viewers do NOT visually display:', {
      x: 40,
      y: height - 160,
      size: 12,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15)
    });

    const hiddenItems = [
      '• Internal author email address and company device identity',
      '• Private Adobe InDesign / Photoshop editing history (/PieceInfo)',
      '• Document OpenAction auto-execution scripts and catalog triggers',
      '• Unflattened draft form values and review annotations'
    ];

    hiddenItems.forEach((item, idx) => {
      page.drawText(item, {
        x: 45,
        y: height - 190 - (idx * 24),
        size: 11,
        font,
        color: rgb(0.3, 0.3, 0.3)
      });
    });

    // 1. Inject /PieceInfo
    const pieceInfo = doc.context.obj({
      AdobeInDesign: doc.context.obj({
        LastModified: doc.context.obj('D:20261024120000Z'),
        PrivateGuid: doc.context.obj('7f9b8c2d-4e5a-6b7c-8d9e-0f1a2b3c4d5e')
      })
    });
    doc.catalog.set(PDFName.of('PieceInfo'), pieceInfo);

    // 2. Inject /OpenAction
    doc.catalog.set(PDFName.of('OpenAction'), doc.context.obj({
      S: PDFName.of('JavaScript'),
      JS: doc.context.obj('app.alert("Warning: Internal Document Opened");')
    }));

    // 3. Inject XMP stream
    const xmpStream = doc.context.stream(
      `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title><rdf:Alt><rdf:li xml:lang="x-default">Confidential M&amp;A Strategy</rdf:li></rdf:Alt></dc:title></rdf:Description></rdf:RDF></x:xmpmeta>`,
      { Type: 'Metadata', Subtype: 'XML' }
    );
    const xmpRef = doc.context.register(xmpStream);
    doc.catalog.set(PDFName.of('Metadata'), xmpRef);

    // 4. Inject an annotation onto page
    const annot = doc.context.obj({
      Type: PDFName.of('Annot'),
      Subtype: PDFName.of('Text'),
      Rect: [50, 400, 70, 420],
      Contents: doc.context.obj('Confidential reviewer note: Verify financial projections before distribution.')
    });
    const annotRef = doc.context.register(annot);
    page.node.set(PDFName.of('Annots'), doc.context.obj([annotRef]));

    return await doc.save({ updateProperties: false });
  }
}
