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
  Link as LinkIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  StickyNote
} from 'lucide-react';
import { store } from '../../core/state-store.js';
import { allToolsModal } from '../../components/all-tools-modal.js';
import { extractImagesModal } from '../../components/extract-images-modal.js';
import { FONT_CATALOG, getCssFontFamily } from '../../core/font-registry.js';

const PRIMARY_TOOLS = [
  { id: 'select', label: 'Select', icon: MousePointer },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'note', label: 'Note', icon: StickyNote },
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
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState('#000000');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strikethrough, setStrikethrough] = useState(false);
  const [align, setAlign] = useState('left');
  const [bgColor, setBgColor] = useState('transparent');

  useEffect(() => {
    const unsub = store.subscribe((state) => {
      if (state.activeTool) setActiveTool(state.activeTool);
      if (state.activeFontFamily) setFontFamily(state.activeFontFamily);
      if (state.activeFontSize) setFontSize(state.activeFontSize);
      if (state.activeColor) setColor(state.activeColor);
      if (state.activeBold !== undefined) setBold(state.activeBold);
      if (state.activeItalic !== undefined) setItalic(state.activeItalic);
      if (state.activeUnderline !== undefined) setUnderline(state.activeUnderline);
      if (state.activeStrikethrough !== undefined) setStrikethrough(state.activeStrikethrough);
      if (state.activeTextAlign) setAlign(state.activeTextAlign);
      if (state.activeTextBgColor) setBgColor(state.activeTextBgColor);
    });

    const onAnnotSelected = (e) => {
      const { ann } = e.detail || {};
      if (ann && ann.type === 'text') {
        if (ann.fontId || ann.fontFamily) setFontFamily(ann.fontId || ann.fontFamily);
        if (ann.fontSize) setFontSize(ann.fontSize);
        if (ann.color) setColor(ann.color);
        setBold(!!ann.bold);
        setItalic(!!ann.italic);
        setUnderline(!!ann.underline);
        setStrikethrough(!!ann.strikethrough);
        if (ann.align) setAlign(ann.align);
        if (ann.bgColor) setBgColor(ann.bgColor);
      }
    };
    window.addEventListener('letsedit:annotation-selected', onAnnotSelected);

    return () => {
      unsub();
      window.removeEventListener('letsedit:annotation-selected', onAnnotSelected);
    };
  }, []);

  const handleSelectTool = (toolId) => {
    if (toolId === 'signature') {
      allToolsModal.dispatchToolAction('tool:sign');
      return;
    }
    if (toolId === 'stamp') {
      allToolsModal.dispatchToolAction('tool:image');
      return;
    }
    const internalTool = toolId === 'redact' ? 'whiteout' : toolId;
    setActiveTool(toolId);
    store.setActiveTool(internalTool);
    setOpenDropdown(null);
  };

  const handleFontChange = (e) => {
    const val = e.target.value;
    setFontFamily(val);
    store.getState().activeFontFamily = val;
    store.getState().activeFontId = val;
    const selected = store.getState().selectedAnnotation;
    if (selected && selected.ann && selected.ann.type === 'text') {
      store.updateAnnotation(selected.pageNum, selected.ann.id, { fontId: val, fontFamily: val });
    }
  };

  const handleSizeChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setFontSize(val);
    store.getState().activeFontSize = val;
    const selected = store.getState().selectedAnnotation;
    if (selected && selected.ann && selected.ann.type === 'text') {
      store.updateAnnotation(selected.pageNum, selected.ann.id, { fontSize: val });
    }
  };

  const handleColorChange = (e) => {
    const val = e.target.value;
    setColor(val);
    store.getState().activeColor = val;
    const selected = store.getState().selectedAnnotation;
    if (selected && selected.ann && selected.ann.type === 'text') {
      store.updateAnnotation(selected.pageNum, selected.ann.id, { color: val });
    }
  };

  const handleToggleBold = () => {
    const next = !bold;
    setBold(next);
    store.getState().activeBold = next;
    const selected = store.getState().selectedAnnotation;
    if (selected && selected.ann && selected.ann.type === 'text') {
      store.updateAnnotation(selected.pageNum, selected.ann.id, { bold: next });
    }
  };

  const handleToggleItalic = () => {
    const next = !italic;
    setItalic(next);
    store.getState().activeItalic = next;
    const selected = store.getState().selectedAnnotation;
    if (selected && selected.ann && selected.ann.type === 'text') {
      store.updateAnnotation(selected.pageNum, selected.ann.id, { italic: next });
    }
  };

  const handleToggleUnderline = () => {
    const next = !underline;
    setUnderline(next);
    store.getState().activeUnderline = next;
    const selected = store.getState().selectedAnnotation;
    if (selected && selected.ann && selected.ann.type === 'text') {
      store.updateAnnotation(selected.pageNum, selected.ann.id, { underline: next });
    }
  };

  const handleToggleStrikethrough = () => {
    const next = !strikethrough;
    setStrikethrough(next);
    store.getState().activeStrikethrough = next;
    const selected = store.getState().selectedAnnotation;
    if (selected && selected.ann && selected.ann.type === 'text') {
      store.updateAnnotation(selected.pageNum, selected.ann.id, { strikethrough: next });
    }
  };

  const handleSetAlign = (val) => {
    setAlign(val);
    store.getState().activeTextAlign = val;
    const selected = store.getState().selectedAnnotation;
    if (selected && selected.ann && selected.ann.type === 'text') {
      store.updateAnnotation(selected.pageNum, selected.ann.id, { align: val });
    }
  };

  const handleBgColorChange = (e) => {
    const val = e.target.value;
    setBgColor(val);
    store.getState().activeTextBgColor = val;
    const selected = store.getState().selectedAnnotation;
    if (selected && selected.ann && selected.ann.type === 'text') {
      store.updateAnnotation(selected.pageNum, selected.ann.id, { bgColor: val });
    }
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
    <div className="w-full bg-white dark:bg-[#232323] border-b border-slate-200 dark:border-[#383838] px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs transition-colors z-20">
      {/* Primary Tool Group */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {PRIMARY_TOOLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleSelectTool(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTool === id
                ? 'bg-[#30050d] text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2e2e2e]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Font & Text Properties Bar */}
      {activeTool === 'text' && (
        <div className="flex items-center flex-wrap gap-1.5 px-2 py-1 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg border border-slate-200 dark:border-neutral-800 text-xs">
          <label className="text-slate-500 font-medium">Font:</label>
          <select
            value={fontFamily}
            onChange={handleFontChange}
            className="bg-white dark:bg-[#282828] border border-slate-300 dark:border-neutral-700 rounded px-2 py-1 text-xs font-medium max-w-[130px] truncate"
            title="Choose from 150+ fonts"
          >
            {FONT_CATALOG.map(f => (
              <option key={f.id} value={f.id} style={{ fontFamily: getCssFontFamily(f.id) }}>
                {f.label}
              </option>
            ))}
          </select>

          <label className="text-slate-500 font-medium ml-1">Size:</label>
          <select
            value={fontSize}
            onChange={handleSizeChange}
            className="bg-white dark:bg-[#282828] border border-slate-300 dark:border-neutral-700 rounded px-1.5 py-1 text-xs font-medium"
          >
            {[10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64].map(s => (
              <option key={s} value={s}>{s} px</option>
            ))}
          </select>

          <div className="h-4 w-px bg-slate-200 dark:bg-neutral-700 mx-1"></div>

          {/* Bold, Italic, Underline, Strikethrough Buttons */}
          <div className="flex items-center gap-0.5 bg-slate-200/60 dark:bg-[#262626] p-0.5 rounded">
            <button
              onClick={handleToggleBold}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold transition ${bold ? 'bg-[#30050d] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-[#333]'}`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleItalic}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs italic transition ${italic ? 'bg-[#30050d] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-[#333]'}`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleUnderline}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs underline transition ${underline ? 'bg-[#30050d] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-[#333]'}`}
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleStrikethrough}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs line-through transition ${strikethrough ? 'bg-[#30050d] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-[#333]'}`}
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-neutral-700 mx-1"></div>

          {/* Text Alignment */}
          <div className="flex items-center gap-0.5 bg-slate-200/60 dark:bg-[#262626] p-0.5 rounded">
            <button
              onClick={() => handleSetAlign('left')}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs transition ${align === 'left' ? 'bg-[#30050d] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-[#333]'}`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleSetAlign('center')}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs transition ${align === 'center' ? 'bg-[#30050d] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-[#333]'}`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleSetAlign('right')}
              className={`w-6 h-6 flex items-center justify-center rounded text-xs transition ${align === 'right' ? 'bg-[#30050d] text-white shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-[#333]'}`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-neutral-700 mx-1"></div>

          <label className="text-slate-500 font-medium ml-1">Color:</label>
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
            title="Text Color"
          />

          <label className="text-slate-500 font-medium ml-1">Highlight:</label>
          <input
            type="color"
            value={bgColor === 'transparent' ? '#ffffff' : bgColor}
            onChange={handleBgColorChange}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
            title="Highlight / Background Color"
          />
        </div>
      )}

      {/* Category Dropdowns */}
      <div className="flex items-center gap-1.5">
        {/* Pages Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('pages')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#2e2e2e] hover:bg-slate-200 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-200 transition"
          >
            <Layers className="w-3.5 h-3.5 text-[#30050d] dark:text-[#d46374]" />
            <span>Pages</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'pages' && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-[#232323] border border-slate-200 dark:border-[#383838] shadow-xl py-1.5 z-50">
              <button onClick={() => handleDropdownAction('modal:split')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Split PDF</span>
                <span className="text-[11px] text-slate-400">Extract page ranges</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:split-half')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Split in Half</span>
                <span className="text-[11px] text-slate-400">Bisect two-page book scans</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:alternate-mix')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Alternate & Mix</span>
                <span className="text-[11px] text-slate-400">Interleave duplex scanner pages</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:nup')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">N-Up Imposition</span>
                <span className="text-[11px] text-slate-400">Print 2 or 4 pages per sheet</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:crop')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Crop Margins</span>
                <span className="text-[11px] text-slate-400">Trim whitespace borders</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:flip')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#2e2e2e] hover:bg-slate-200 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-200 transition"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Tools</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'tools' && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-[#232323] border border-slate-200 dark:border-[#383838] shadow-xl py-1.5 z-50">
              <button onClick={() => handleDropdownAction('modal:compress')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Compress PDF</span>
                <span className="text-[11px] text-slate-400">Reduce document file size</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:watermark')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Watermark</span>
                <span className="text-[11px] text-slate-400">Diagonal text / logo stamp</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:grayscale')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Grayscale PDF</span>
                <span className="text-[11px] text-slate-400">Desaturate vector colors & save ink</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:ocr')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">OCR PDF</span>
                <span className="text-[11px] text-slate-400">Recognize scanned text into searchable vectors</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:compare')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Compare PDF</span>
                <span className="text-[11px] text-slate-400">Side-by-side visual diff & reports</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:repair')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Repair PDF</span>
                <span className="text-[11px] text-slate-400">Recover damaged & corrupted files</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:security')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Protect & Encrypt</span>
                <span className="text-[11px] text-slate-400">ISO 32000-1 AES Password Security</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:metadata')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#2e2e2e] hover:bg-slate-200 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Convert</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'convert' && (
            <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-[#232323] border border-slate-200 dark:border-[#383838] shadow-xl py-1.5 z-50">
              <button onClick={() => handleDropdownAction('modal:to-image')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">PDF to JPG / PNG</span>
                <span className="text-[11px] text-slate-400">Render high-res image pages</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:extract-images')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Extract Images</span>
                <span className="text-[11px] text-slate-400">Extract embedded images to ZIP</span>
              </button>
              <button onClick={() => handleDropdownAction('action:images-to-pdf')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">Images to PDF</span>
                <span className="text-[11px] text-slate-400">Combine JPG/PNGs into A4 PDF</span>
              </button>
              <button onClick={() => handleDropdownAction('modal:pdfa')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">PDF to PDF/A</span>
                <span className="text-[11px] text-slate-400">ISO 19005-1 Archival Standard</span>
              </button>
              <button onClick={() => handleDropdownAction('action:extract-text')} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2e2e2e] flex flex-col">
                <span className="font-semibold">PDF to Text</span>
                <span className="text-[11px] text-slate-400">Extract plain searchable text</span>
              </button>
            </div>
          )}
        </div>

        {/* Find & Replace Trigger */}
        <button
          onClick={() => allToolsModal.dispatchToolAction('tool:replace')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-[#2e2e2e] hover:bg-slate-200 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-200 transition"
          title="Find & Replace Text"
        >
          <Search className="w-3.5 h-3.5 text-[#30050d] dark:text-[#d46374]" />
          <span className="hidden md:inline">Find</span>
        </button>
      </div>
    </div>
  );
}
