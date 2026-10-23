/**
 * Type Definitions for PDF Studio & LetsEdit Core State Architecture
 */

export type AnnotationType =
  | 'text'
  | 'drawing'
  | 'highlight'
  | 'eraser'
  | 'shape'
  | 'image'
  | 'signature'
  | 'stamp'
  | 'whiteout'
  | 'redact'
  | 'form'
  | 'link';

export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  pageIndex: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold?: boolean;
  italic?: boolean;
  opacity?: number;
  width: number;
  height: number;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingAnnotation extends BaseAnnotation {
  type: 'drawing' | 'highlight';
  points: DrawingPoint[];
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line' | 'arrow';
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  width: number;
  height: number;
}

export interface SignatureAnnotation extends BaseAnnotation {
  type: 'signature';
  dataUrl: string;
  width: number;
  height: number;
}

export interface StampAnnotation extends BaseAnnotation {
  type: 'stamp';
  label: string;
  subtext?: string;
  color: string;
  variant?: 'approved' | 'rejected' | 'confidential' | 'custom';
  width: number;
  height: number;
}

export interface FormAnnotation extends BaseAnnotation {
  type: 'form';
  fieldType: 'text' | 'checkbox' | 'radio' | 'dropdown';
  fieldName: string;
  value?: string | boolean;
  options?: string[];
  required?: boolean;
  readOnly?: boolean;
  width: number;
  height: number;
}

export interface LinkAnnotation extends BaseAnnotation {
  type: 'link';
  targetType: 'url' | 'page';
  url?: string;
  targetPage?: number;
  width: number;
  height: number;
}

export type Annotation =
  | TextAnnotation
  | DrawingAnnotation
  | ShapeAnnotation
  | SignatureAnnotation
  | StampAnnotation
  | FormAnnotation
  | LinkAnnotation;

export interface WatermarkSettings {
  text: string;
  opacity: number;
  rotation: number;
  fontSize: number;
  color: string;
  pages?: 'all' | 'odd' | 'even' | number[];
}

export interface PageNumberSettings {
  format: string; // e.g. 'Page {n} of {total}'
  position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  fontSize: number;
  fontFamily: string;
  startPage: number;
}

export interface BatesSettings {
  prefix: string;
  suffix?: string;
  startNumber: number;
  padding: number;
  position: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right';
  fontSize: number;
  color?: string;
}

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  applyAll: boolean;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface PDFDocumentState {
  filename: string;
  pdfBytes: Uint8Array | null;
  pageCount: number;
  currentPage: number;
  zoom: number;
  activeTool: AnnotationType | 'select' | 'hand';
  annotations: Map<number, Annotation[]>;
  deletedPages: Set<number>;
  pageRotations: Map<number, number>;
  pageSequence: number[];
  watermark: WatermarkSettings | null;
  pageNumbers: PageNumberSettings | null;
  bates: BatesSettings | null;
  metadata: DocumentMetadata;
  cropSettings: CropSettings | null;
  flattenForms: boolean;
}
