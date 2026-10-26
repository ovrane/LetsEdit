import React, { useState, useEffect } from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, FolderOpen, Grid, ArrowLeft, Download } from 'lucide-react';
import { store } from '../../core/state-store.js';
import { allToolsModal } from '../../components/all-tools-modal.js';
import { Toast } from '../../components/toast.js';

export function Navbar({ onOpenPdf, onExportPdf, isStudioMode, onToggleMode }) {
  const [docTitle, setDocTitle] = useState('Sample_Document.pdf');
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    const unsub = store.subscribe((state) => {
      if (state.documentTitle) setDocTitle(state.documentTitle);
      if (state.zoom) setZoomLevel(Math.round(state.zoom * 100));
    });
    return () => unsub();
  }, []);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setDocTitle(newTitle);
    store.setDocumentTitle(newTitle);
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-[#383838] bg-white/95 dark:bg-[#232323]/95 backdrop-blur-md px-4 flex items-center justify-between z-30 transition-colors">
      {/* Brand & Left Actions */}
      <div className="flex items-center gap-3">
        {isStudioMode && (
          <button
            onClick={onToggleMode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-[#383838] hover:bg-slate-100 dark:hover:bg-[#2e2e2e] text-slate-700 dark:text-slate-200 transition shadow-sm"
            title="Back to All Tools Home"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Tools</span>
          </button>
        )}

        <div className="lets-logo" onClick={() => onToggleMode(false)} title="LetsEdit — Home">
          <div className="lets-logo-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2.8" fill="#EE404C"/>
              <rect x="13" y="2" width="9" height="9" rx="2.8" fill="#00B4D8"/>
              <rect x="2" y="13" width="9" height="9" rx="2.8" fill="#2F74EE"/>
              <rect x="13" y="13" width="9" height="9" rx="2.8" fill="#F0A500"/>
            </svg>
          </div>
          <span className="lets-logo-text">Lets<span className="lets-logo-accent">Edit</span></span>
        </div>

        {isStudioMode && (
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 dark:border-[#383838]">
            <input
              type="text"
              value={docTitle}
              onChange={handleTitleChange}
              className="text-xs font-medium bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-[#383838] focus:border-[#30050d] rounded px-1.5 py-1 text-slate-800 dark:text-slate-200 outline-none max-w-[180px] truncate"
              title="Click to rename document"
            />
            <button
              onClick={onOpenPdf}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-[#383838] hover:bg-slate-100 dark:hover:bg-[#2e2e2e] text-slate-700 dark:text-slate-300 transition"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#30050d] dark:text-[#d46374]" />
              <span>Open</span>
            </button>
          </div>
        )}
      </div>

      {/* Center Studio Controls (Undo, Redo, Zoom) */}
      {isStudioMode && (
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#282828] p-1 rounded-xl border border-slate-200/80 dark:border-[#383838] shadow-sm">
          <button
            onClick={() => store.undo()}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#383838] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => store.redo()}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#383838] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-[#383838] mx-1"></div>
          <button
            onClick={() => store.setZoom(Math.max(0.5, (zoomLevel - 15) / 100))}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#383838] text-slate-600 dark:text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-1 min-w-[42px] text-center select-none">
            {zoomLevel}%
          </span>
          <button
            onClick={() => store.setZoom(Math.min(2.5, (zoomLevel + 15) / 100))}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-[#383838] text-slate-600 dark:text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Right Quick Links & CTAs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => allToolsModal.show()}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#2e2e2e] dark:hover:bg-[#383838] text-slate-700 dark:text-slate-200 transition"
        >
          <Grid className="w-3.5 h-3.5 text-[#30050d] dark:text-[#d46374]" />
          <span>All 43+ Tools</span>
        </button>

        <a
          href="/account"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#383838] hover:bg-slate-100 dark:hover:bg-[#2e2e2e] text-slate-700 dark:text-slate-300 transition"
        >
          <span>Account & API</span>
        </a>


        {isStudioMode && (
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-[#30050d] to-[#4a0914] hover:from-[#4a0914] hover:to-[#5e0b1a] text-white shadow-md shadow-[#30050d]/20 active:scale-95 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        )}
      </div>
    </header>
  );
}
