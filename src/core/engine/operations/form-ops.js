/**
 * Adobe Acrobat & Sejda-Style Interactive Form Operations
 * Supports AcroForm inspection, live field auto-filling, flattening,
 * and bi-directional form data export/import (XFDF, FDF, JSON, CSV).
 */

import {
  PDFDocument,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  PDFOptionList,
  StandardFonts,
  rgb
} from 'pdf-lib';

// Helper XML and CSV escapers
function escapeXml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeCsv(str) {
  if (str == null) return '';
  return String(str).replace(/"/g, '""');
}

function escapePdfString(str) {
  if (str == null) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export class FormOps {
  /**
   * Generates a realistic multi-page interactive fillable AcroForm PDF
   * with text fields, radio buttons, checkboxes, and dropdowns for testing and demonstration.
   */
  static async createSampleFillableFormPdf() {
    const doc = await PDFDocument.create();
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const page = doc.addPage([595.28, 841.89]); // A4
    const form = doc.getForm();

    // Top Header Banner
    page.drawRectangle({
      x: 0,
      y: 760,
      width: 595.28,
      height: 81.89,
      color: rgb(0.188, 0.02, 0.051) // #30050d
    });

    page.drawText('OFFICIAL APPLICATION & REGISTRATION FORM', {
      x: 40,
      y: 800,
      size: 17,
      font: helveticaBold,
      color: rgb(1, 1, 1)
    });

    page.drawText('Interactive AcroForm Document - Fillable in Adobe Acrobat, Chrome & Edge', {
      x: 40,
      y: 778,
      size: 9.5,
      font: helvetica,
      color: rgb(0.9, 0.85, 0.87)
    });

    // Section 1: Personal Information
    page.drawText('1. Personal & Contact Information', {
      x: 40,
      y: 725,
      size: 13,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.15)
    });

    // Full Name
    page.drawText('Full Legal Name *', { x: 40, y: 700, size: 9, font: helveticaBold });
    const nameField = form.createTextField('full_name');
    nameField.addToPage(page, { x: 40, y: 668, width: 245, height: 26 });
    nameField.setText('Jane Doe');

    // Email Address
    page.drawText('Email Address *', { x: 310, y: 700, size: 9, font: helveticaBold });
    const emailField = form.createTextField('email_address');
    emailField.addToPage(page, { x: 310, y: 668, width: 245, height: 26 });
    emailField.setText('jane.doe@example.com');

    // Phone Number
    page.drawText('Phone Number', { x: 40, y: 642, size: 9, font: helveticaBold });
    const phoneField = form.createTextField('phone_number');
    phoneField.addToPage(page, { x: 40, y: 610, width: 245, height: 26 });
    phoneField.setText('+1 (555) 234-5678');

    // Department Dropdown
    page.drawText('Primary Department', { x: 310, y: 642, size: 9, font: helveticaBold });
    const deptDropdown = form.createDropdown('department');
    deptDropdown.addToPage(page, { x: 310, y: 610, width: 245, height: 26 });
    deptDropdown.addOptions(['Engineering', 'Product & Design', 'Legal & Compliance', 'Finance & Accounting', 'Marketing']);
    deptDropdown.select('Engineering');

    // Section 2: Engagement Type (Radio Group)
    page.drawText('2. Engagement Classification', {
      x: 40,
      y: 565,
      size: 13,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.15)
    });

    const roleRadio = form.createRadioGroup('engagement_type');
    const roles = ['Full-Time Employee', 'Contractor', 'Enterprise Vendor'];
    roles.forEach((role, i) => {
      const optX = 40 + (i * 170);
      roleRadio.addOptionToPage(role, page, { x: optX, y: 532, width: 16, height: 16 });
      page.drawText(role, { x: optX + 24, y: 536, size: 9.5, font: helvetica });
    });
    roleRadio.select('Full-Time Employee');

    // Section 3: Notes & Comments
    page.drawText('3. Professional Summary / Additional Notes', {
      x: 40,
      y: 490,
      size: 13,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.15)
    });

    const notesField = form.createTextField('notes_and_comments');
    notesField.enableMultiline();
    notesField.addToPage(page, { x: 40, y: 395, width: 515, height: 80 });
    notesField.setText('Experienced software architect specializing in web standards and PDF processing algorithms.');

    // Section 4: Terms & Sign-off
    page.drawText('4. Certification & Declarations', {
      x: 40,
      y: 350,
      size: 13,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.15)
    });

    const termsCb = form.createCheckBox('terms_accepted');
    termsCb.addToPage(page, { x: 40, y: 316, width: 16, height: 16 });
    termsCb.check();
    page.drawText('I declare that the information provided is accurate and complete under penalty of perjury.', {
      x: 65,
      y: 320,
      size: 9,
      font: helvetica
    });

    const subscribeCb = form.createCheckBox('subscribe_updates');
    subscribeCb.addToPage(page, { x: 40, y: 286, width: 16, height: 16 });
    page.drawText('Receive compliance audit notifications and quarterly regulatory newsletters via email.', {
      x: 65,
      y: 290,
      size: 9,
      font: helvetica
    });

    // Date
    page.drawText('Submission Date', { x: 40, y: 250, size: 9, font: helveticaBold });
    const dateField = form.createTextField('submission_date');
    dateField.addToPage(page, { x: 40, y: 218, width: 245, height: 26 });
    dateField.setText(new Date().toISOString().split('T')[0]);

    return await doc.save();
  }

  /**
   * Inspects and extracts all AcroForm interactive fields from a PDF byte stream.
   * Returns metadata, field types, current values, options, and widget bounding boxes.
   */
  static async inspectFormFields(pdfBytes) {
    if (!pdfBytes) {
      return { hasForm: false, fieldCount: 0, fields: [] };
    }

    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    let form;
    try {
      form = doc.getForm();
    } catch {
      return { hasForm: false, fieldCount: 0, fields: [] };
    }

    let rawFields = [];
    try {
      rawFields = form.getFields();
    } catch {
      rawFields = [];
    }

    if (!rawFields || rawFields.length === 0) {
      return { hasForm: false, fieldCount: 0, fields: [] };
    }

    const pages = doc.getPages();
    const fields = [];

    for (const f of rawFields) {
      const name = f.getName();
      let type = 'text';
      let value = '';
      let options = [];
      let isChecked = false;
      let isMultiline = false;
      let isReadOnly = false;
      let isRequired = false;

      try {
        if (typeof f.isReadOnly === 'function') isReadOnly = f.isReadOnly();
        if (typeof f.isRequired === 'function') isRequired = f.isRequired();
      } catch {}

      if (f instanceof PDFTextField) {
        type = 'text';
        try {
          value = f.getText() || '';
          isMultiline = f.isMultiline();
        } catch {}
      } else if (f instanceof PDFCheckBox) {
        type = 'checkbox';
        try {
          isChecked = f.isChecked();
          value = isChecked ? 'Yes' : 'Off';
        } catch {}
      } else if (f instanceof PDFRadioGroup) {
        type = 'radio';
        try {
          options = f.getOptions() || [];
          value = f.getSelected() || '';
        } catch {}
      } else if (f instanceof PDFDropdown) {
        type = 'dropdown';
        try {
          options = f.getOptions() || [];
          const selected = f.getSelected();
          value = Array.isArray(selected) ? (selected[0] || '') : (selected || '');
        } catch {}
      } else if (f instanceof PDFOptionList) {
        type = 'optionlist';
        try {
          options = f.getOptions() || [];
          const selected = f.getSelected();
          value = Array.isArray(selected) ? selected : [selected];
        } catch {}
      } else {
        type = 'unknown';
      }

      // Extract geometry from AcroField widgets
      const widgets = [];
      try {
        const rawWidgets = f.acroField.getWidgets ? f.acroField.getWidgets() : [];
        for (const w of rawWidgets) {
          const rect = w.getRectangle();
          const pRef = w.P();
          let pageIndex = 0;
          if (pRef) {
            const foundIdx = pages.findIndex(p => p.ref === pRef);
            if (foundIdx >= 0) pageIndex = foundIdx;
          }
          widgets.push({
            pageIndex,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          });
        }
      } catch {}

      fields.push({
        name,
        type,
        value,
        options,
        isChecked,
        isMultiline,
        isReadOnly,
        isRequired,
        widgets,
        pageIndex: widgets[0]?.pageIndex ?? 0
      });
    }

    return {
      hasForm: fields.length > 0,
      fieldCount: fields.length,
      fields
    };
  }

  /**
   * Applies values dictionary to AcroForm fields in the PDF document.
   * Can optionally flatten form fields into static page vectors.
   */
  static async fillFormFields(pdfBytes, fieldValues = {}, options = {}) {
    const { flatten = false } = options;
    const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = doc.getForm();

    for (const [fieldName, val] of Object.entries(fieldValues)) {
      try {
        const field = form.getFieldMaybe(fieldName);
        if (!field) continue;

        if (field instanceof PDFTextField) {
          field.setText(val != null ? String(val) : '');
        } else if (field instanceof PDFCheckBox) {
          const checkBool = val === true || val === 'true' || val === 'Yes' || val === '1' || val === 'checked';
          if (checkBool) {
            field.check();
          } else {
            field.uncheck();
          }
        } else if (field instanceof PDFRadioGroup) {
          if (val) field.select(String(val));
        } else if (field instanceof PDFDropdown) {
          if (val) field.select(String(val));
        } else if (field instanceof PDFOptionList) {
          if (Array.isArray(val)) {
            field.select(val);
          } else if (val) {
            field.select([String(val)]);
          }
        }
      } catch (err) {
        console.warn(`[FormOps] Warning updating field "${fieldName}":`, err.message);
      }
    }

    if (flatten) {
      try {
        form.flatten();
      } catch (err) {
        console.warn('[FormOps] Flatten warning:', err.message);
      }
    }

    return await doc.save();
  }

  /**
   * Exports AcroForm values in standardized formats:
   * 'json', 'xfdf' (ISO 19444-1), 'fdf' (Adobe Acrobat classic), or 'csv' (tabular).
   */
  static async exportFormData(pdfBytes, format = 'json') {
    const inspection = await this.inspectFormFields(pdfBytes);
    const fields = inspection.fields || [];
    const fmt = format.toLowerCase();

    if (fmt === 'json') {
      const dataMap = {};
      fields.forEach(f => {
        dataMap[f.name] = f.type === 'checkbox' ? f.isChecked : f.value;
      });
      return {
        format: 'json',
        mimeType: 'application/json',
        extension: 'json',
        content: JSON.stringify(
          {
            generator: 'LetsEdit Enterprise Form Engine',
            exportedAt: new Date().toISOString(),
            fieldCount: fields.length,
            fields: dataMap,
            schema: fields
          },
          null,
          2
        )
      };
    }

    if (fmt === 'xfdf') {
      const xfdfEntries = fields.map(f => {
        const val = f.type === 'checkbox' ? (f.isChecked ? 'Yes' : 'Off') : (f.value ?? '');
        return `    <field name="${escapeXml(f.name)}">\n      <value>${escapeXml(val)}</value>\n    </field>`;
      }).join('\n');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n  <fields>\n${xfdfEntries}\n  </fields>\n</xfdf>`;

      return {
        format: 'xfdf',
        mimeType: 'application/vnd.adobe.xfdf',
        extension: 'xfdf',
        content: xml
      };
    }

    if (fmt === 'fdf') {
      const fdfEntries = fields.map(f => {
        const val = f.type === 'checkbox' ? (f.isChecked ? '/Yes' : '/Off') : `(${escapePdfString(f.value ?? '')})`;
        return `<< /T (${escapePdfString(f.name)}) /V ${val} >>`;
      }).join('\n    ');

      const fdf = `%FDF-1.2\n1 0 obj\n<<\n  /FDF <<\n    /Fields [\n    ${fdfEntries}\n    ]\n  >>\n>>\nendobj\ntrailer\n<<\n  /Root 1 0 R\n>>\n%%EOF`;

      return {
        format: 'fdf',
        mimeType: 'application/vnd.fdf',
        extension: 'fdf',
        content: fdf
      };
    }

    if (fmt === 'csv') {
      const headers = `"field_name","field_type","field_value","page"`;
      const rows = fields.map(f => {
        const val = f.type === 'checkbox' ? (f.isChecked ? 'true' : 'false') : (f.value ?? '');
        return `"${escapeCsv(f.name)}","${escapeCsv(f.type)}","${escapeCsv(val)}","${(f.pageIndex || 0) + 1}"`;
      });
      return {
        format: 'csv',
        mimeType: 'text/csv',
        extension: 'csv',
        content: [headers, ...rows].join('\n')
      };
    }

    throw new Error(`Unsupported export format: ${format}. Supported: json, xfdf, fdf, csv.`);
  }

  /**
   * Ingests form data from raw string (JSON, XFDF, FDF, or CSV)
   * parses the key-value dictionary and populates the PDF.
   */
  static async importFormData(pdfBytes, rawData, format = 'auto') {
    if (!rawData) return pdfBytes;

    let fmt = format.toLowerCase();
    const str = typeof rawData === 'string' ? rawData.trim() : new TextDecoder().decode(rawData).trim();

    if (fmt === 'auto') {
      if (str.startsWith('{')) fmt = 'json';
      else if (str.includes('<xfdf') || str.startsWith('<?xml')) fmt = 'xfdf';
      else if (str.startsWith('%FDF')) fmt = 'fdf';
      else fmt = 'csv';
    }

    const values = {};

    if (fmt === 'json') {
      const parsed = JSON.parse(str);
      const fieldsObj = parsed.fields || parsed;
      for (const [k, v] of Object.entries(fieldsObj)) {
        if (typeof v === 'object' && v !== null && 'value' in v) {
          values[k] = v.value;
        } else {
          values[k] = v;
        }
      }
    } else if (fmt === 'xfdf') {
      // Parse <field name="..."><value>...</value></field>
      const fieldRegex = /<field\s+name=["']([^"']+)["']\s*>\s*(?:<value>([\s\S]*?)<\/value>)?/gi;
      let match;
      while ((match = fieldRegex.exec(str)) !== null) {
        const fieldName = match[1];
        const val = match[2] !== undefined ? match[2] : '';
        // Unescape standard XML entities
        values[fieldName] = val
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
      }
    } else if (fmt === 'fdf') {
      // Parse << /T (...) /V (...) >> or << /T (...) /V /Yes >>
      const fdfRegex = /<<\s*\/T\s*\(([^)]+)\)\s*\/V\s*(?:\(([^)]*)\)|\/([a-zA-Z0-9_-]+))\s*>>/g;
      let match;
      while ((match = fdfRegex.exec(str)) !== null) {
        const fieldName = match[1];
        const textVal = match[2];
        const nameVal = match[3];
        if (nameVal !== undefined) {
          values[fieldName] = (nameVal === 'Yes');
        } else {
          values[fieldName] = textVal.replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
        }
      }
    } else if (fmt === 'csv') {
      const lines = str.split(/\r?\n/).filter(Boolean);
      if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          // Simple CSV line parser
          const cols = lines[i].match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
          if (cols && cols.length >= 3) {
            const clean = cols.map(c => c.replace(/^,/, '').replace(/^"(.*)"$/, '$1').replace(/""/g, '"').trim());
            const fieldName = clean[0];
            const val = clean[2];
            if (fieldName) values[fieldName] = val;
          }
        }
      }
    }

    return await this.fillFormFields(pdfBytes, values, { flatten: false });
  }
}
