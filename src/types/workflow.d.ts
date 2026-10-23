/**
 * Type Definitions for Distraction-Free Tool Workflows & Tool Chaining
 */

export type ToolId =
  | 'merge'
  | 'split'
  | 'compress'
  | 'pdf-to-word'
  | 'pdf-to-excel'
  | 'pdf-to-ppt'
  | 'word-to-pdf'
  | 'excel-to-pdf'
  | 'ppt-to-pdf'
  | 'to-image'
  | 'from-image'
  | 'sign'
  | 'watermark'
  | 'rotate'
  | 'html-to-pdf'
  | 'unlock'
  | 'security'
  | 'organize'
  | 'pdfa'
  | 'repair'
  | 'pagenumbers'
  | 'scan'
  | 'ocr-pdf'
  | 'compare'
  | 'redact'
  | 'crop'
  | 'deskew'
  | 'bates'
  | 'split-half'
  | 'alternate-mix'
  | 'nup'
  | 'flip'
  | 'grayscale'
  | 'pdf-to-text'
  | 'extract-images'
  | 'extract-pages';

export interface WorkflowFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  bytes: Uint8Array;
  pageCount?: number;
  thumbnailUrl?: string;
  rotation?: number;
}

export interface WorkflowToolConfig {
  title: string;
  subtitle: string;
  badge?: string;
  accept: string;
  multiple: boolean;
  actionText: string;
  color?: string;
  icon?: string;
}

export interface ChainToolItem {
  id: ToolId;
  name: string;
  desc: string;
  icon: string;
  color: string;
}
