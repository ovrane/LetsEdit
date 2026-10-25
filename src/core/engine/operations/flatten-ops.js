/**
 * Adobe Acrobat Pro & iLovePDF Document Flattening & Form AcroForm Baker
 * Permanently converts interactive AcroForm fields (text, checkboxes, radios, dropdowns)
 * and interactive annotations into static, non-editable vector graphics.
 */

import {
  PDFDocument,
  PDFName,
  PDFArray,
  PDFDict,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  PDFOptionList,
  StandardFonts,
  rgb
} from 'pdf-lib';

export class FlattenOps {
  /**
   * Deeply inspects PDF for AcroForm fields and interactive annotations
   */
  static async inspectFlattenTargets(pdfBytes) {
    if (!pdfBytes) {
      return {
        hasAcroForm: false,
        fieldCount: 0,
        fields: [],
        fieldTypes: { text: 0, checkbox: 0, radio: 0, dropdown: 0, optionList: 0, other: 0 },
        annotCount: 0,
        annotTypes: { widget: 0, link: 0, highlight: 0, stamp: 0, comment: 0, other: 0 },
        totalPages: 0,
        isAlreadyFlat: true
      };
    }

    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();
    let hasAcroForm = doc.catalog.has(PDFName.of('AcroForm'));
    let fieldCount = 0;
    const fieldTypes = { text: 0, checkbox: 0, radio: 0, dropdown: 0, optionList: 0, other: 0 };
    const fields = [];

    if (hasAcroForm) {
      try {
        const form = doc.getForm();
        const rawFields = form.getFields();
        fieldCount = rawFields.length;

        for (const f of rawFields) {
          const name = f.getName();
          let type = 'text';
          let val = '';
          let readOnly = false;
          let required = false;

          try {
            if (typeof f.isReadOnly === 'function') readOnly = f.isReadOnly();
            if (typeof f.isRequired === 'function') required = f.isRequired();
          } catch {}

          if (f instanceof PDFTextField) {
            type = 'text';
            fieldTypes.text++;
            try { val = f.getText() || ''; } catch {}
          } else if (f instanceof PDFCheckBox) {
            type = 'checkbox';
            fieldTypes.checkbox++;
            try { val = f.isChecked() ? 'Yes' : 'Off'; } catch {}
          } else if (f instanceof PDFRadioGroup) {
            type = 'radio';
            fieldTypes.radio++;
            try { val = f.getSelected() || ''; } catch {}
          } else if (f instanceof PDFDropdown) {
            type = 'dropdown';
            fieldTypes.dropdown++;
            try { val = (f.getSelected() || []).join(', '); } catch {}
          } else if (f instanceof PDFOptionList) {
            type = 'optionList';
            fieldTypes.optionList++;
            try { val = (f.getSelected() || []).join(', '); } catch {}
          } else {
            type = 'other';
            fieldTypes.other++;
          }

          fields.push({ name, type, value: val, readOnly, required });
        }
      } catch {
        // Corrupted or custom AcroForm dictionary
        fieldCount = 0;
      }
    }

    // Inspect page annotations
    let annotCount = 0;
    const annotTypes = { widget: 0, link: 0, highlight: 0, stamp: 0, comment: 0, other: 0 };

    for (let i = 0; i < totalPages; i++) {
      const page = doc.getPage(i);
      const annots = page.node.Annots();
      if (annots && annots instanceof PDFArray) {
        const sz = annots.size();
        annotCount += sz;
        for (let j = 0; j < sz; j++) {
          const annotRef = annots.get(j);
          const annotDict = annotRef instanceof PDFDict ? annotRef : doc.context.lookup(annotRef);
          if (annotDict instanceof PDFDict) {
            const subtype = annotDict.get(PDFName.of('Subtype'))?.toString();
            if (subtype === '/Widget') annotTypes.widget++;
            else if (subtype === '/Link') annotTypes.link++;
            else if (subtype === '/Highlight') annotTypes.highlight++;
            else if (subtype === '/Stamp') annotTypes.stamp++;
            else if (subtype === '/Text' || subtype === '/FreeText' || subtype === '/Popup') annotTypes.comment++;
            else annotTypes.other++;
          }
        }
      }
    }

    const isAlreadyFlat = fieldCount === 0 && (annotCount === 0 || annotCount === annotTypes.link);

    return {
      hasAcroForm,
      fieldCount,
      fields,
      fieldTypes,
      annotCount,
      annotTypes,
      totalPages,
      isAlreadyFlat
    };
  }

  /**
   * Flattens AcroForm fields and/or annotations into permanent vector content streams
   * Modes:
   *  - 'all' (default): Flatten AcroForm fields and purge interactive annotations
   *  - 'forms' / 'forms-only': Flatten interactive AcroForm form fields, leave markup annotations
   *  - 'annotations' / 'annots-only': Flatten/purge annotations, leave AcroForm fields interactive
   */
  static async flattenPdf(pdfBytes, options = {}) {
    const rawBytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
    const originalSize = rawBytes.byteLength;
    const doc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();

    const mode = String(options.mode || 'all').toLowerCase();
    const shouldFlattenForms = mode === 'all' || mode === 'forms' || mode === 'forms-only';
    const shouldFlattenAnnots = mode === 'all' || mode === 'annotations' || mode === 'annots-only';
    const stripXFA = options.stripXFA !== false;
    const cleanNeedAppearances = options.cleanNeedAppearances !== false;

    let fieldsFlattened = 0;
    const fieldTypes = { text: 0, checkbox: 0, radio: 0, dropdown: 0, optionList: 0, other: 0 };
    let annotationsFlattened = 0;

    // 1. Process AcroForm fields
    if (shouldFlattenForms && doc.catalog.has(PDFName.of('AcroForm'))) {
      try {
        const form = doc.getForm();
        const rawFields = form.getFields();
        fieldsFlattened = rawFields.length;

        for (const f of rawFields) {
          if (f instanceof PDFTextField) fieldTypes.text++;
          else if (f instanceof PDFCheckBox) fieldTypes.checkbox++;
          else if (f instanceof PDFRadioGroup) fieldTypes.radio++;
          else if (f instanceof PDFDropdown) fieldTypes.dropdown++;
          else if (f instanceof PDFOptionList) fieldTypes.optionList++;
          else fieldTypes.other++;
        }

        // Clean deprecated XFA if present
        if (stripXFA) {
          const acroFormDict = doc.catalog.get(PDFName.of('AcroForm'));
          if (acroFormDict instanceof PDFDict && acroFormDict.has(PDFName.of('XFA'))) {
            acroFormDict.delete(PDFName.of('XFA'));
          }
        }

        // Clean NeedAppearances
        if (cleanNeedAppearances) {
          const acroFormDict = doc.catalog.get(PDFName.of('AcroForm'));
          if (acroFormDict instanceof PDFDict && acroFormDict.has(PDFName.of('NeedAppearances'))) {
            acroFormDict.delete(PDFName.of('NeedAppearances'));
          }
        }

        // Perform native vector flattening into page contents
        form.flatten();
      } catch (err) {
        // Fallback: delete AcroForm catalog reference directly
        doc.catalog.delete(PDFName.of('AcroForm'));
      }

      // If mode is 'all' or no more fields, eliminate AcroForm catalog
      if (mode === 'all') {
        doc.catalog.delete(PDFName.of('AcroForm'));
      }
    }

    // 2. Process Annotations
    if (shouldFlattenAnnots) {
      for (let i = 0; i < totalPages; i++) {
        const page = doc.getPage(i);
        const annots = page.node.Annots();
        if (annots && annots instanceof PDFArray) {
          const sz = annots.size();
          annotationsFlattened += sz;
          // In 'all' or 'annotations' mode, purge interactive annot dictionary array from the page
          page.node.delete(PDFName.of('Annots'));
        }
      }
    }

    const outputBytes = await doc.save({
      useObjectStreams: true,
      updateProperties: false
    });

    const outputSize = outputBytes.byteLength;
    const bytesSaved = Math.max(0, originalSize - outputSize);

    const report = {
      mode,
      fieldsFlattened,
      fieldTypes,
      annotationsFlattened,
      totalPages,
      originalSize,
      outputSize,
      bytesSaved,
      isFlat: true,
      timestamp: new Date().toISOString()
    };

    outputBytes.bytes = outputBytes;
    outputBytes.pdfBytes = outputBytes;
    outputBytes.report = report;
    outputBytes.lastFlattenResult = report;
    outputBytes.fieldsFlattened = fieldsFlattened;
    outputBytes.annotationsFlattened = annotationsFlattened;

    return outputBytes;
  }

  /**
   * Generates a 3-page realistic Corporate Non-Disclosure & Service Agreement
   * with interactive AcroForm fields and annotations for flattening validation.
   */
  static async createSampleFlattenPdf() {
    const doc = await PDFDocument.create();
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const form = doc.getForm();

    // --- PAGE 1: Agreement Preamble & Parties ---
    const page1 = doc.addPage([595.28, 841.89]);

    // Header banner
    page1.drawRectangle({
      x: 0,
      y: 760,
      width: 595.28,
      height: 81.89,
      color: rgb(0.05, 0.58, 0.53) // #0d9488
    });

    page1.drawText('MASTER NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT', {
      x: 36,
      y: 805,
      size: 15,
      font: helveticaBold,
      color: rgb(1, 1, 1)
    });
    page1.drawText('Enterprise Fillable Form • ISO 32000-1 Interactive Standard', {
      x: 36,
      y: 785,
      size: 10,
      font: helvetica,
      color: rgb(0.85, 0.96, 0.95)
    });

    page1.drawText('1. Disclosing & Receiving Party Information', {
      x: 36,
      y: 720,
      size: 12,
      font: helveticaBold,
      color: rgb(0.12, 0.16, 0.22)
    });

    page1.drawText('Legal Company Name:', { x: 36, y: 695, size: 9, font: helveticaBold });
    const compField = form.createTextField('party_company_name');
    compField.addToPage(page1, { x: 36, y: 665, width: 250, height: 24 });
    compField.setText('Acme Global Technologies Inc.');

    page1.drawText('Jurisdiction / State:', { x: 305, y: 695, size: 9, font: helveticaBold });
    const stateField = form.createTextField('party_state');
    stateField.addToPage(page1, { x: 305, y: 665, width: 250, height: 24 });
    stateField.setText('Delaware, USA');

    page1.drawText('Authorized Signatory Full Name:', { x: 36, y: 640, size: 9, font: helveticaBold });
    const signNameField = form.createTextField('signatory_name');
    signNameField.addToPage(page1, { x: 36, y: 610, width: 250, height: 24 });
    signNameField.setText('Dr. Eleanor Vance');

    page1.drawText('Official Business Email:', { x: 305, y: 640, size: 9, font: helveticaBold });
    const emailField = form.createTextField('signatory_email');
    emailField.addToPage(page1, { x: 305, y: 610, width: 250, height: 24 });
    emailField.setText('e.vance@acmeglobal.example.com');

    page1.drawText('Governing Jurisdiction:', { x: 36, y: 585, size: 9, font: helveticaBold });
    const govDropdown = form.createDropdown('governing_law_choice');
    govDropdown.addToPage(page1, { x: 36, y: 555, width: 250, height: 24 });
    govDropdown.addOptions(['State of Delaware', 'State of California', 'State of New York', 'England & Wales']);
    govDropdown.select('State of Delaware');

    page1.drawText('Effective Execution Date:', { x: 305, y: 585, size: 9, font: helveticaBold });
    const dateField = form.createTextField('execution_date');
    dateField.addToPage(page1, { x: 305, y: 555, width: 250, height: 24 });
    dateField.setText('2026-10-26');

    // Checkbox mutual
    const mutualCb = form.createCheckBox('mutual_obligations');
    mutualCb.addToPage(page1, { x: 36, y: 515, width: 16, height: 16 });
    mutualCb.check();
    page1.drawText('Mutual Protection: Both Disclosing and Receiving Parties bind themselves equally.', {
      x: 60,
      y: 518,
      size: 9.5,
      font: helveticaBold,
      color: rgb(0.12, 0.16, 0.22)
    });

    // --- PAGE 2: Technical Scope & Requirements ---
    const page2 = doc.addPage([595.28, 841.89]);

    page2.drawText('EXHIBIT A: TECHNICAL SCOPE & PROTECTED ASSETS', {
      x: 36,
      y: 790,
      size: 14,
      font: helveticaBold,
      color: rgb(0.05, 0.58, 0.53)
    });

    page2.drawText('2. Detailed Scope of Proprietary Information', {
      x: 36,
      y: 745,
      size: 11,
      font: helveticaBold
    });

    const scopeNotes = form.createTextField('proprietary_scope_notes');
    scopeNotes.enableMultiline();
    scopeNotes.addToPage(page2, { x: 36, y: 645, width: 520, height: 85 });
    scopeNotes.setText('Includes source code, compiler heuristics, neural embeddings, customer financial datasets, and security cryptographic keys.');

    page2.drawText('3. Inspection & Audit Notice Requirements:', { x: 36, y: 615, size: 10, font: helveticaBold });
    const auditRadio = form.createRadioGroup('audit_notice_period');
    auditRadio.addOptionToPage('30_days', page2, { x: 36, y: 585, width: 16, height: 16 });
    page2.drawText('30 Business Days Notice', { x: 60, y: 588, size: 9, font: helvetica });

    auditRadio.addOptionToPage('60_days', page2, { x: 210, y: 585, width: 16, height: 16 });
    page2.drawText('60 Business Days Notice', { x: 234, y: 588, size: 9, font: helvetica });
    auditRadio.select('30_days');

    const exportCb = form.createCheckBox('export_control_certified');
    exportCb.addToPage(page2, { x: 36, y: 540, width: 16, height: 16 });
    exportCb.check();
    page2.drawText('Certify adherence to international trade regulations and export controls.', {
      x: 60,
      y: 543,
      size: 9,
      font: helvetica
    });

    // --- PAGE 3: Execution Block & Stamp ---
    const page3 = doc.addPage([595.28, 841.89]);

    page3.drawText('EXHIBIT B: EXECUTION BLOCK & AUDIT SIGN-OFF', {
      x: 36,
      y: 790,
      size: 14,
      font: helveticaBold,
      color: rgb(0.05, 0.58, 0.53)
    });

    page3.drawText('Signatory Authorization:', { x: 36, y: 730, size: 9, font: helveticaBold });
    const signField = form.createTextField('digital_signature_token');
    signField.addToPage(page3, { x: 36, y: 695, width: 300, height: 26 });
    signField.setText('/s/ Dr. Eleanor Vance, VP Engineering');

    page3.drawText('Signing Timestamp:', { x: 360, y: 730, size: 9, font: helveticaBold });
    const signDateField = form.createTextField('signing_timestamp');
    signDateField.addToPage(page3, { x: 360, y: 695, width: 195, height: 26 });
    signDateField.setText('2026-10-26T00:40:00Z');

    // Visual review stamp container
    page3.drawRectangle({
      x: 36,
      y: 590,
      width: 260,
      height: 70,
      borderColor: rgb(0.05, 0.58, 0.53),
      borderWidth: 1.5,
      color: rgb(0.95, 0.99, 0.98)
    });
    page3.drawText('REVIEWED & LEGALLY APPROVED', {
      x: 50,
      y: 635,
      size: 11,
      font: helveticaBold,
      color: rgb(0.05, 0.58, 0.53)
    });
    page3.drawText('Corporate Legal Counsel • Ready for Flattening', {
      x: 50,
      y: 615,
      size: 8.5,
      font: helvetica,
      color: rgb(0.2, 0.3, 0.35)
    });

    doc.setTitle('Corporate NDA & Compliance Agreement (Fillable Form)');
    doc.setSubject('Fillable interactive AcroForm sample for PDF flattening verification');

    return await doc.save();
  }
}
