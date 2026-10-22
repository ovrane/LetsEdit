import React, { useState, useEffect } from 'react';
import {
  MousePointer,
  Type,
  PenLine,
  Highlighter,
  Eraser,
  EyeOff,
  Square,
  FileSignature,
  Stamp,
  CheckSquare,
  ChevronDown,
  Layers,
  Wrench,
  RefreshCw,
  Search,
  Link as LinkIcon
} from 'lucide-react';
import { store } from '../../core/state-store.js';
import { allToolsModal } from '../../components/all-tools-modal.js';
import { extractImagesModal } from '../../components/extract-images-modal.js';

const PRIMARY_TOOLS = [
  { id: 'select', label: 'Select', icon: MousePointer },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'link', label: 'Link', icon: LinkIcon },
  { id: 'draw', label: 'Draw', icon: PenLine },
  { id: 'highlight', label: 'Highlight', icon: Highlighter },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
  { id: 'redact', label: 'Redact', icon: EyeOff },
  { id: 'shape', label: 'Shapes', icon: Square },
  { id: 'signature', label: 'Sign', icon: FileSignature },
  { id: 'stamp', label: 'Stamps', icon: Stamp },
  { id: 'form', label: 'Forms', icon: CheckSquare }
];

export function CanvaToolbar({ onAction }) {
  const [activeTool, setActiveTool] = useState('select');
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const unsub = store.subscribe((state) => {
      if (state.activeTool) setActiveTool(state.activeTool);
    });
    return () => unsub();
  }, []);

  const handleSelectTool = (toolId) => {
    setActiveTool(toolId);
    store.setActiveTool(toolId);
    setOpenDropdown(null);
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleDropdownAction = (action) => {
    setOpenDropdown(null);
    if (action === 'modal:extract-images') {
      extractImagesModal.open();
    } else {
      allToolsModal.dispatchToolAction(action);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs transition-colors z-20">
      {/* Primary Tool Group */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {PRIMARY_TOOLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleSelectTool(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTool === id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Category Dropdowns */}
      <div className="flex items-center gap-1.5">
        {/* Pages Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('pages')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Pages</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'pages' && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50">
              <button onClick={() => handleDropdownAction('modal:split')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Split PDF</span>
                <span className="text-[11px] text-slate-400">Extract page ranges</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:split-half')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Split in Half</span>
                <span className="text-[11px] text-slate-400">Bisect two-page book scans</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:alternate-mix')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Alternate & Mix</span>
                <span className="text-[11px] text-slate-400">Interleave duplex scanner pages</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:nup')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">N-Up Imposition</span>
                <span className="text-[11px] text-slate-400">Print 2 or 4 pages per sheet</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:crop')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Crop Margins</span>
                <span className="text-[11px] text-slate-400">Trim whitespace borders</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:flip')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Flip / Mirror</span>
                <span className="text-[11px] text-slate-400">Mirror coordinates horizontally or vertically</span>
              </button>
            </div>
          )}
        </div>

        {/* Tools Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('tools')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Tools</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'tools' && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50">
              <button onClick={() => handleDropdownAction('modal:compress')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Compress PDF</span>
                <span className="text-[11px] text-slate-400">Reduce document file size</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:watermark')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Watermark</span>
                <span className="text-[11px] text-slate-400">Diagonal text / logo stamp</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:grayscale')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Grayscale PDF</span>
                <span className="text-[11px] text-slate-400">Desaturate vector colors & save ink</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:ocr')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">OCR PDF</span>
                <span className="text-[11px] text-slate-400">Recognize scanned text into searchable vectors</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:compare')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Compare PDF</span>
                <span className="text-[11px] text-slate-400">Side-by-side visual diff & reports</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:repair')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Repair PDF</span>
                <span className="text-[11px] text-slate-400">Recover damaged & corrupted files</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:security')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Protect & Encrypt</span>
                <span className="text-[11px] text-slate-400">ISO 32000-1 AES Password Security</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:metadata')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Metadata & Properties</span>
                <span className="text-[11px] text-slate-400">Edit Title, Author, Keywords</span>
              </button>
            </div>
          )}
        </div>

        {/* Convert Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('convert')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Convert</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'convert' && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50">
              <button onClick={() => handleDropdownAction('modal:to-image')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">PDF to JPG / PNG</span>
                <span className="text-[11px] text-slate-400">Render high-res image pages</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:extract-images')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Extract Images</span>
                <span className="text-[11px] text-slate-400">Extract embedded images to ZIP</span>
              </button>
              <button onClick={() => handleDropdownAction('action:images-to-pdf')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">Images to PDF</span>
                <span className="text-[11px] text-slate-400">Combine JPG/PNGs into A4 PDF</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:pdfa')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">PDF to PDF/A</span>
                <span className="text-[11px] text-slate-400">ISO 19005-1 Archival Standard</span>
              </button>
              <button onClick={() => handleDropdownAction('action:extract-text')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col">
                <span className="font-semibold">PDF to Text</span>
                <span className="text-[11px] text-slate-400">Extract plain searchable text</span>
              </button>
            </div>
          )}
        </div>

        {/* Find & Replace Trigger */}
        <button
          onClick={() => allToolsModal.dispatchToolAction('tool:replace')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          title="Find & Replace Text"
        >
          <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden md:inline">Find</span>
        </button>
      </div>
    </div>
  );
}
