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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#30050d]/5 dark:bg-[#30050d]/25 border border-[#30050d]/20 dark:border-[#801426]/50 text-[#30050d] dark:text-[#d46374] text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pure In-Browser WebAssembly &bull; 100% Free &bull; Zero Server Uploads</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-4 max-w-3xl">
          The Modern PDF Suite Built for <span className="text-gray-500 dark:white">Speed & Privacy</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
          Edit existing text, merge, sign, compress, and convert documents directly in your browser. Powered by client-side WebAssembly — 100% free, unlimited, and your confidential files never leave your device.
        </p>

        {/* Hero Fast Search & Popular Shortcuts Hub */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-4 mb-4">
          <div className="w-full flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-full px-5 py-3 shadow-lg shadow-slate-200/50 dark:shadow-black/40 focus-within:border-[#30050d] focus-within:ring-2 focus-within:ring-[#30050d]/20 transition">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 43+ PDF tools (e.g. Edit, Merge, Compress, Split, Sign, OCR)..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none p-1"
              >
                &times;
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Popular:</span>
            {[
              { id: 'edit', title: 'Edit PDF', action: 'workflow:edit' },
              { id: 'merge', title: 'Merge PDF', action: 'workflow:merge' },
              { id: 'compress', title: 'Compress', action: 'workflow:compress' },
              { id: 'split', title: 'Split PDF', action: 'workflow:split' },
              { id: 'sign', title: 'Fill & Sign', action: 'workflow:sign' },
              { id: 'to-image', title: 'PDF to JPG', action: 'workflow:to-image' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => handleToolClick(pill)}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#30050d] text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm hover:shadow transition flex items-center gap-1.5"
              >
                <span>{pill.title}</span>
              </button>
            ))}
          </div>
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
            <ShieldCheck className="w-4 h-4 text-[#30050d] dark:text-[#d46374]" />
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
                    ? 'bg-[#30050d] text-white shadow-sm'
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
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#30050d]"
            />
          </div>
        </div>

        {/* 34+ Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#30050d] dark:hover:border-[#801426] hover:shadow-xl hover:shadow-[#30050d]/10 cursor-pointer transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm mb-3.5 transition group-hover:scale-105"
                  style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 group-hover:text-[#30050d] dark:group-hover:text-[#d46374] transition">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-[#30050d] dark:text-[#d46374] opacity-80 group-hover:opacity-100">
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
