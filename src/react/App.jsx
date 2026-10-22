import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { LandingHero } from './components/LandingHero.jsx';
import { CanvaToolbar } from './components/CanvaToolbar.jsx';
import { store } from '../core/state-store.js';
import { pdfEngine } from '../core/pdf-engine.js';
import { Toast } from '../components/toast.js';
import { downloadBlob, readFileAsArrayBuffer } from '../utils/helpers.js';

export function App() {
  const [isStudioMode, setIsStudioMode] = useState(false);

  useEffect(() => {
    // Check initial body class
    const hasStudio = document.body.classList.contains('show-studio');
    setIsStudioMode(hasStudio);

    // Watch for class changes or state updates
    const handleDocumentLoaded = () => {
      document.body.classList.remove('show-landing');
      document.body.classList.add('show-studio');
      setIsStudioMode(true);
    };

    window.addEventListener('letsedit:open-studio', handleDocumentLoaded);
    return () => window.removeEventListener('letsedit:open-studio', handleDocumentLoaded);
  }, []);

  const handleToggleMode = (forceStudio) => {
    const nextMode = forceStudio !== undefined ? forceStudio : !isStudioMode;
    setIsStudioMode(nextMode);

    if (nextMode) {
      document.body.classList.remove('show-landing');
      document.body.classList.add('show-studio');
    } else {
      document.body.classList.remove('show-studio');
      document.body.classList.add('show-landing');
    }
  };

  const handleOpenPdf = () => {
    const input = document.getElementById('upload-pdf-input');
    if (input) input.click();
  };

  const handleExportPdf = async () => {
    try {
      Toast.info('Compiling vector PDF document...');
      const state = store.getState();
      const compiledBytes = await pdfEngine.exportPdf(state);
      const filename = (state.documentTitle || 'Document_Edited.pdf').replace(/\.pdf$/i, '') + '_edited.pdf';
      const blob = new Blob([compiledBytes], { type: 'application/pdf' });
      downloadBlob(blob, filename);
      Toast.success('PDF successfully exported and downloaded!');
    } catch (err) {
      Toast.error('Export failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Navbar
        isStudioMode={isStudioMode}
        onToggleMode={handleToggleMode}
        onOpenPdf={handleOpenPdf}
        onExportPdf={handleExportPdf}
      />

      {isStudioMode ? (
        <div className="flex flex-col flex-1">
          <CanvaToolbar />
          {/* Studio Canvas is managed by CanvasManager & Sidebar in existing viewport container */}
        </div>
      ) : (
        <main className="flex-1 flex flex-col items-center">
          <LandingHero onDocumentLoaded={() => handleToggleMode(true)} />
        </main>
      )}
    </div>
  );
}
