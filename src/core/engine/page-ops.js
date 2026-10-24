/**
 * Page Operations Facade
 * Delegates multi-document merge, range/page splitting, book-scan bisecting,
 * duplex alternate & mix, N-up imposition, page flipping, conversion, and stamping
 * to focused, maintainable operation sub-modules in ./operations/
 */

import { MergeOps } from './operations/merge-ops.js';
import { SplitOps } from './operations/split-ops.js';
import { GeometryOps } from './operations/geometry-ops.js';
import { ConvertOps } from './operations/convert-ops.js';
import { StampOps } from './operations/stamp-ops.js';
import { MultiSignOps } from './operations/multi-sign-ops.js';
import { FormOps } from './operations/form-ops.js';
import { RepairOps } from './operations/repair-ops.js';

export { MergeOps, SplitOps, GeometryOps, ConvertOps, StampOps, MultiSignOps, FormOps, RepairOps };

export class PageOperations {
  // Merge & Organize
  static appendBlankPage(...args) { return MergeOps.appendBlankPage(...args); }
  static mergeExternalPdf(...args) { return MergeOps.mergeExternalPdf(...args); }
  static mergePdf(...args) { return MergeOps.mergePdf(...args); }
  static mergePdfAdvanced(...args) { return MergeOps.mergePdfAdvanced(...args); }
  static organizePages(...args) { return MergeOps.organizePages(...args); }

  // Split & Extract
  static splitPdf(...args) { return SplitOps.splitPdf(...args); }
  static splitBySize(...args) { return SplitOps.splitBySize(...args); }
  static splitByBookmarks(...args) { return SplitOps.splitByBookmarks(...args); }
  static splitByText(...args) { return SplitOps.splitByText(...args); }
  static splitEveryN(...args) { return SplitOps.splitEveryN(...args); }
  static splitInHalf(...args) { return SplitOps.splitInHalf(...args); }
  static alternateMix(...args) { return SplitOps.alternateMix(...args); }

  // Geometry & Imposition
  static nUpPdf(...args) { return GeometryOps.nUpPdf(...args); }
  static flipPages(...args) { return GeometryOps.flipPages(...args); }
  static deskewPdf(...args) { return GeometryOps.deskewPdf(...args); }
  static detectDeskewAngle(...args) { return GeometryOps.detectDeskewAngle(...args); }
  static cropPdf(...args) { return GeometryOps.cropPdf(...args); }
  static detectWhitespaceCrop(...args) { return GeometryOps.detectWhitespaceCrop(...args); }

  // Document Format Converters
  static imagesToPdf(...args) { return ConvertOps.imagesToPdf(...args); }
  static htmlToPdf(...args) { return ConvertOps.htmlToPdf(...args); }
  static wordToPdf(...args) { return ConvertOps.wordToPdf(...args); }
  static excelToPdf(...args) { return ConvertOps.excelToPdf(...args); }
  static pptToPdf(...args) { return ConvertOps.pptToPdf(...args); }

  // Stamping & Numbering
  static batesNumberPdf(...args) { return StampOps.batesNumberPdf(...args); }
  static addPageNumbers(...args) { return StampOps.addPageNumbers(...args); }
  static signPdf(...args) { return StampOps.signPdf(...args); }
  static generateAuditCertificate(...args) { return StampOps.generateAuditCertificate(...args); }

  // Multi-Signer & Field Placement
  static burnSignatureFields(...args) { return MultiSignOps.burnSignatureFields(...args); }
  static compileCompletedDocument(...args) { return MultiSignOps.compileCompletedDocument(...args); }

  // Form Filler & Form Data Export/Import
  static inspectFormFields(...args) { return FormOps.inspectFormFields(...args); }
  static fillFormFields(...args) { return FormOps.fillFormFields(...args); }
  static exportFormData(...args) { return FormOps.exportFormData(...args); }
  static importFormData(...args) { return FormOps.importFormData(...args); }
  static createSampleFillableFormPdf(...args) { return FormOps.createSampleFillableFormPdf(...args); }

  // PDF Repair & Diagnostic Suite
  static repairPdfAdvanced(...args) { return RepairOps.repairPdfAdvanced(...args); }
  static diagnosePdf(...args) { return RepairOps.diagnosePdf(...args); }
  static createCorruptTestPdf(...args) { return RepairOps.createCorruptTestPdf(...args); }
}
