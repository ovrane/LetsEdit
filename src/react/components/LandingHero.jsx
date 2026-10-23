import React, { useState, useMemo } from 'react';
import { Upload, Sparkles, Search, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';
import { TOOLS_CATALOG, allToolsModal } from '../../components/all-tools-modal.js';
import { store } from '../../core/state-store.js';
import { pdfEngine } from '../../core/pdf-engine.js';
import { Toast } from '../../components/toast.js';
import { readFileAsArrayBuffer } from '../../utils/helpers.js';

const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'popular', label: '⭐ Most Popular' },
  { id: 'merge', label: '🔗 Merge' },
  { id: 'split', label: '✂ Split' },
  { id: 'edit-sign', label: '✏ Edit & Sign' },
  { id: 'compress-scans', label: '🗜 Compress & Scans' },
  { id: 'security', label: '🔒 Security' },
  { id: 'convert-from', label: '📤 Convert from PDF' },
  { id: 'convert-to', label: '📥 Convert to PDF' },
  { id: 'others', label: '⚡ Others' }
];

export function LandingHero({ onDocumentLoaded }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const filteredTools = useMemo(() => {
    return TOOLS_CATALOG.filter(tool => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'popular' && tool.popular) ||
        tool.category === activeFilter;

      const matchesSearch =
        !searchQuery ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const handleFileUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      Toast.error('Please select a valid PDF file.');
      return;
    }
    try {
      Toast.info(`Loading ${file.name}...`);
      const buffer = await readFileAsArrayBuffer(file);
      const info = await pdfEngine.loadPdf(buffer);
      store.setDocument(buffer, file.name, info.numPages);
      Toast.success(`Loaded ${file.name} (${info.numPages} pages)`);
      if (onDocumentLoaded) onDocumentLoaded();
    } catch (err) {
      Toast.error('Failed to load PDF: ' + err.message);
    }
  };

  const handleSamplePdf = async () => {
    try {
      Toast.info('Generating sample document...');
      const sample = await pdfEngine.createSamplePdf();
      const info = await pdfEngine.loadPdf(sample);
      store.setDocument(sample, 'Sample_Document.pdf', info.numPages);
      Toast.success('Loaded sample document!');
      if (onDocumentLoaded) onDocumentLoaded();
    } catch (err) {
      Toast.error('Failed to create sample PDF: ' + err.message);
    }
  };

  const handleToolClick = (tool) => {
    // If not in studio, open studio and dispatch tool action
    if (onDocumentLoaded) onDocumentLoaded();
    setTimeout(() => {
      allToolsModal.dispatchToolAction(tool.action);
    }, 120);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-4 pt-12 pb-8 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/80 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pure In-Browser WebAssembly &bull; 100% Free &bull; Zero Server Uploads</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-4 max-w-3xl">
          The Modern PDF Suite Built for <span className="text-blue-600 dark:text-blue-400">Speed & Privacy</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
          Edit existing text, merge, sign, compress, and convert documents directly in your browser. Powered by client-side WebAssembly — 100% free, unlimited, and your confidential files never leave your device.
        </p>

        {/* Hero Dropzone Card */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className={`w-full max-w-2xl rounded-2xl p-8 sm:p-10 border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/40 ${
            isDragging
              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-500/70'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center mb-5">
            <Upload className="w-7 h-7" />
          </div>

          <label className="cursor-pointer mb-3">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <span className="px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm sm:text-base font-bold shadow-md shadow-blue-500/25 transition inline-block">
              Select PDF file
            </span>
          </label>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">
            or drag and drop your PDF here
          </p>

          <button
            onClick={handleSamplePdf}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Or try with a sample document</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>End-to-End Privacy (Client-Side)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Sub-Second Execution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>ISO 32000-1 Standards Compliant</span>
          </div>
        </div>
      </section>

      {/* Directory & Cards Hub */}
      <section className="w-full max-w-6xl px-4 py-8">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeFilter === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find any tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 34+ Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm mb-3.5 transition group-hover:scale-105"
                  style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-80 group-hover:opacity-100">
                <span>Launch tool</span>
                <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
