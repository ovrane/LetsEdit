/**
 * PDF Studio & LetsEdit Full URL Router (iLovePDF Compatible Architecture)
 * Provides distinct, real URL routes for every single tool (e.g. /merge_pdf, /compress_pdf, /split_pdf),
 * the landing page (/), and the studio editor (/edit_pdf).
 *
 * Supports:
 * - HTML5 History API (pushState, replaceState, popstate)
 * - Browser Back / Forward buttons
 * - Direct URL loading and refreshes
 * - Delegated click handling on links and [data-route] elements
 * - Canonical aliases (e.g. /merge, /merge-pdf -> /merge_pdf)
 * - Dynamic page titles matching iLovePDF standards
 */

export const ROUTE_DEFINITIONS = [
  {
    path: '/',
    toolId: null,
    isLanding: true,
    title: "LetsEdit — All-in-One Online PDF Editor & Tools",
    description: "Every tool you need to work with PDFs 100% free and in your browser."
  },
  {
    path: '/edit_pdf',
    toolId: null,
    isEditor: true,
    aliases: ['/edit', '/editor', '/edit-pdf', '/pdf_editor', '/pdf-editor'],
    title: "Online PDF Editor — Edit PDF files directly in your browser — LetsEdit",
    description: "Edit PDF documents directly in your browser. Add text, shapes, signatures, and form fields."
  },
  {
    path: '/account',
    toolId: null,
    isAccount: true,
    aliases: ['/profile', '/user', '/user-account', '/settings'],
    title: "Account Settings & Developer API Keys — LetsEdit",
    description: "Manage your account, privacy settings, active sessions, and developer API keys."
  },
  {
    path: '/login',
    toolId: null,
    isLogin: true,
    aliases: ['/signin', '/sign-in'],
    title: "Sign in to LetsEdit — Fast & Secure PDF Tools",
    description: "Log in to your account to manage your documents and developer tokens."
  },
  {
    path: '/register',
    toolId: null,
    isRegister: true,
    aliases: ['/signup', '/sign-up'],
    title: "Create Free Account — LetsEdit",
    description: "Create a free account to manage your documents and developer tokens."
  },
  {
    path: '/merge_pdf',
    toolId: 'merge',
    aliases: ['/merge', '/merge-pdf', '/combine_pdf', '/combine-pdf'],
    title: "Merge PDF files online. Free service to merge PDF — LetsEdit",
    description: "Combine PDFs in the order you want with the easiest PDF merger available."
  },
  {
    path: '/split_pdf',
    toolId: 'split',
    aliases: ['/split', '/split-pdf', '/extract_pdf'],
    title: "Split PDF file online. Separate one page or a whole set — LetsEdit",
    description: "Separate one page or a whole set for easy conversion into independent PDF files."
  },
  {
    path: '/compress_pdf',
    toolId: 'compress',
    aliases: ['/compress', '/compress-pdf', '/reduce_pdf', '/optimize_pdf'],
    title: "Compress PDF file online. Reduce PDF file size — LetsEdit",
    description: "Reduce file size while preserving maximal vector and image quality."
  },
  {
    path: '/pdf_to_word',
    toolId: 'pdf-to-word',
    aliases: ['/pdf-to-word', '/pdf2word', '/pdftoword'],
    title: "Convert PDF to WORD. Convert PDF to editable Docx — LetsEdit",
    description: "Convert PDF documents to editable Microsoft Word files with layout preservation."
  },
  {
    path: '/pdf_to_powerpoint',
    toolId: 'pdf-to-ppt',
    aliases: ['/pdf-to-ppt', '/pdf-to-powerpoint', '/pdftoppt', '/pdf2ppt'],
    title: "Convert PDF to POWERPOINT. Convert PDF to PPT — LetsEdit",
    description: "Convert PDF document pages into high-resolution PowerPoint presentation slides."
  },
  {
    path: '/pdf_to_excel',
    toolId: 'pdf-to-excel',
    aliases: ['/pdf-to-excel', '/pdftoexcel', '/pdf2excel'],
    title: "Convert PDF to EXCEL. Convert PDF to XLS spreadsheets — LetsEdit",
    description: "Extract table data and columns from PDF into spreadsheet CSV files."
  },
  {
    path: '/word_to_pdf',
    toolId: 'word-to-pdf',
    aliases: ['/word-to-pdf', '/word2pdf', '/wordtopdf'],
    title: "Convert WORD to PDF. Convert Docx to PDF — LetsEdit",
    description: "Convert Word DOCX documents into clean, professional PDF files."
  },
  {
    path: '/powerpoint_to_pdf',
    toolId: 'ppt-to-pdf',
    aliases: ['/powerpoint-to-pdf', '/ppt-to-pdf', '/ppt2pdf'],
    title: "Convert POWERPOINT to PDF — LetsEdit",
    description: "Convert presentation slides into high-fidelity PDF documents."
  },
  {
    path: '/excel_to_pdf',
    toolId: 'excel-to-pdf',
    aliases: ['/excel-to-pdf', '/excel2pdf'],
    title: "Convert EXCEL to PDF — LetsEdit",
    description: "Convert spreadsheets into formatted PDF tables."
  },
  {
    path: '/pdf_to_jpg',
    toolId: 'to-image',
    aliases: ['/pdf-to-jpg', '/pdf-to-image', '/to-image', '/pdf2jpg'],
    title: "Convert PDF to JPG. Extract images or save pages as JPG — LetsEdit",
    description: "Render and extract high-resolution raster images from your PDF pages."
  },
  {
    path: '/jpg_to_pdf',
    toolId: 'images-to-pdf',
    aliases: ['/jpg-to-pdf', '/images-to-pdf', '/image-to-pdf', '/png-to-pdf', '/jpg2pdf'],
    title: "Convert JPG to PDF. Images JPG to PDF online — LetsEdit",
    description: "Transform JPG, PNG, and WebP images into a single professional PDF document."
  },
  {
    path: '/sign_pdf',
    toolId: 'sign',
    aliases: ['/sign', '/sign-pdf', '/esign_pdf'],
    title: "Sign PDF online. Free tool to sign documents online — LetsEdit",
    description: "Sign PDF documents online with hand-drawn signatures, type, or initials."
  },
  {
    path: '/watermark_pdf',
    toolId: 'watermark',
    aliases: ['/watermark', '/watermark-pdf', '/add_watermark'],
    title: "Add watermark to PDF. Stamp text or images over PDF — LetsEdit",
    description: "Stamp text or an image across all pages with custom rotation and opacity."
  },
  {
    path: '/rotate_pdf',
    toolId: 'rotate',
    aliases: ['/rotate', '/rotate-pdf'],
    title: "Rotate PDF pages online. Rotate PDF clockwise — LetsEdit",
    description: "Rotate your PDF pages permanently 90, 180, or 270 degrees clockwise."
  },
  {
    path: '/html_to_pdf',
    toolId: 'html-to-pdf',
    aliases: ['/html-to-pdf', '/html2pdf'],
    title: "Convert HTML to PDF online — LetsEdit",
    description: "Convert web pages, HTML files, or raw code into a clean, vector PDF document."
  },
  {
    path: '/unlock_pdf',
    toolId: 'unlock',
    aliases: ['/unlock', '/unlock-pdf', '/remove_password'],
    title: "Unlock PDF. Remove password and permissions from PDF — LetsEdit",
    description: "Remove owner passwords and printing/copying restrictions from PDF documents."
  },
  {
    path: '/protect_pdf',
    toolId: 'security',
    aliases: ['/protect', '/protect-pdf', '/security', '/encrypt_pdf', '/encrypt-pdf'],
    title: "Protect PDF file with password — LetsEdit",
    description: "Encrypt your PDF with standard ISO 32000-1 AES-256 encryption."
  },
  {
    path: '/organize_pdf',
    toolId: 'organize',
    aliases: ['/organize', '/organize-pdf', '/reorder_pdf', '/delete_pdf', '/delete-pages', '/delete_pages', '/delete-pdf'],
    title: "Organize PDF pages online. Reorder, rotate, or remove pages — LetsEdit",
    description: "Sort, rotate, and delete PDF pages in a visual interactive grid."
  },
  {
    path: '/pdf_to_pdfa',
    toolId: 'pdfa',
    aliases: ['/pdf-to-pdfa', '/pdfa', '/pdf_a'],
    title: "Convert PDF to PDF/A for ISO Archival — LetsEdit",
    description: "Conform document to ISO 19005-1 archival standard for permanent storage."
  },
  {
    path: '/repair_pdf',
    toolId: 'repair',
    aliases: ['/repair', '/repair-pdf', '/fix_pdf'],
    title: "Repair corrupted PDF files — LetsEdit",
    description: "Reconstruct broken xref tables and salvage unreadable PDF documents."
  },
  {
    path: '/ocr_pdf',
    toolId: 'ocr-pdf',
    aliases: ['/ocr', '/ocr-pdf', '/searchable_pdf'],
    title: "OCR PDF online. Convert scanned PDF to searchable text — LetsEdit",
    description: "Extract text from scanned documents and create a selectable vector text layer."
  },
  {
    path: '/crop_pdf',
    toolId: 'crop',
    aliases: ['/crop', '/crop-pdf', '/trim_pdf'],
    title: "Crop PDF margins and trim scanner lines — LetsEdit",
    description: "Trim margin borders, remove scanner lines, and resize page bounds."
  },
  {
    path: '/compare_pdf',
    toolId: 'compare',
    aliases: ['/compare', '/compare-pdf', '/diff_pdf'],
    title: "Compare PDF documents online — LetsEdit",
    description: "Visually diff two PDF documents to highlight word insertions and deletions."
  },
  {
    path: '/bates_numbering_pdf',
    toolId: 'bates',
    aliases: ['/bates', '/bates-pdf', '/bates_pdf', '/bates-numbering-pdf', '/bates_numbering'],
    title: "Bates Numbering for PDF. Add sequential legal stamps — LetsEdit",
    description: "Add sequential legal Bates stamps with custom prefixes and zero-padding."
  },
  {
    path: '/nup_pdf',
    toolId: 'nup',
    aliases: ['/nup', '/nup-pdf', '/n-up', '/n-up-pdf'],
    title: "N-Up Imposition PDF Printing. 2-Up & 4-Up sheets — LetsEdit",
    description: "Impose 2 or 4 pages per sheet side-by-side or in a 2x2 grid layout."
  },
  {
    path: '/split_half_pdf',
    toolId: 'split-half',
    aliases: ['/split-half', '/split-half-pdf', '/split_in_half'],
    title: "Split PDF Down the Middle. Bisect book scans — LetsEdit",
    description: "Bisect two-page book scans vertically or horizontally."
  },
  {
    path: '/alternate_mix_pdf',
    toolId: 'alternate-mix',
    aliases: ['/alternate-mix', '/alternate-mix-pdf', '/interleave_pdf'],
    title: "Alternate & Mix PDF. Interleave odd and even pages — LetsEdit",
    description: "Interleave pages from two documents (e.g. odd and even scanner feeder batches)."
  },
  {
    path: '/grayscale_pdf',
    toolId: 'grayscale',
    aliases: ['/grayscale', '/grayscale-pdf', '/black_and_white_pdf'],
    title: "Convert PDF to Grayscale. Black and white toner saver — LetsEdit",
    description: "Desaturate colors and convert strokes to monochrome to save printing toner."
  },
  {
    path: '/flip_pdf',
    toolId: 'flip',
    aliases: ['/flip', '/flip-pdf', '/mirror_pdf'],
    title: "Flip / Mirror PDF. Mirror PDF horizontally or vertically — LetsEdit",
    description: "Mirror PDF coordinates horizontally or vertically for inverted scans."
  },
  {
    path: '/extract_images_pdf',
    toolId: 'extract-images',
    aliases: ['/extract-images', '/extract-images-pdf', '/extract_images'],
    title: "Extract Images from PDF to ZIP — LetsEdit",
    description: "Export all embedded high-resolution JPEG, PNG, and WebP images into a ZIP file."
  },
  {
    path: '/extract_text_pdf',
    toolId: 'pdf-to-text',
    aliases: ['/extract-text', '/extract-text-pdf', '/pdf-to-text', '/extract_text'],
    title: "Extract Text from PDF to TXT — LetsEdit",
    description: "Decompress content streams and export clean plain searchable text to a TXT file."
  },
  {
    path: '/remove_annotations_pdf',
    toolId: 'remove-annotations',
    aliases: ['/remove-annotations', '/remove-annotations-pdf', '/remove_annotations'],
    title: "Remove Annotations from PDF — LetsEdit",
    description: "Batch remove highlights, strikeouts, sticky notes, and drawings to clean up document vectors."
  },
  {
    path: '/resize_pdf',
    toolId: 'resize',
    aliases: ['/resize', '/resize-pdf', '/page_margins'],
    title: "Resize PDF Margins & Page — LetsEdit",
    description: "Add binding margins or fit pages to standard A4/Letter sheet bounds."
  },
  {
    path: '/deskew_pdf',
    toolId: 'deskew',
    aliases: ['/deskew', '/deskew-pdf', '/straighten_pdf'],
    title: "Deskew & Straighten PDF pages — LetsEdit",
    description: "Automatically detect tilt and straighten crooked scanner pages."
  },
  {
    path: '/rename_pdf',
    toolId: 'rename',
    aliases: ['/rename', '/rename-pdf'],
    title: "Smart Rename PDF by Content — LetsEdit",
    description: "Automatically detect document title, heading, or invoice number to rename file."
  },
  {
    path: '/pagenumber_pdf',
    toolId: 'pagenumbers',
    aliases: ['/pagenumbers', '/page-numbers', '/pagenumber-pdf', '/pagenumbers_pdf', '/add_page_numbers', '/page_numbers', '/add_pdf_page_number'],
    title: "Page Numbers in PDF — Free Online Tool — LetsEdit",
    description: "Add page numbers to your PDF document in headers or footers with customizable formatting."
  },
  {
    path: '/fill_pdf',
    toolId: 'fill-forms',
    aliases: ['/fill-forms', '/fill_forms', '/fill-pdf', '/form-filler', '/form_filler', '/extract_form_data', '/extract-form-data'],
    title: "Fill & Sign PDF Forms Online — Adobe Acrobat & Sejda Quality — LetsEdit",
    description: "Fill interactive AcroForm fields, auto-populate sample data, or export and import form values to XFDF, FDF, JSON, and CSV."
  },
  {
    path: '/flatten_pdf',
    toolId: 'flatten',
    aliases: ['/flatten', '/flatten-pdf', '/flatten_forms'],
    title: "Flatten PDF online — Turn form fields into read-only vectors — LetsEdit",
    description: "Makes fillable forms and annotations permanent vectors to prevent further editing."
  },
  {
    path: '/edit_pdf_metadata',
    toolId: 'edit-metadata',
    aliases: ['/edit-metadata', '/edit_metadata', '/edit-pdf-metadata', '/metadata', '/pdf-properties', '/pdf_properties'],
    title: "Edit PDF Metadata & Adobe XMP Online — LetsEdit",
    description: "Inspect and edit Document Properties, Title, Author, Subject, Keywords, and synchronize ISO 16684-1 Adobe XMP streams."
  },
  {
    path: '/page_labels',
    toolId: 'pagelabels',
    aliases: ['/page-labels', '/pagelabels', '/pdf-page-labels', '/pdf_page_labels'],
    title: "Multi-Section Page Labels — Adobe Acrobat Standard — LetsEdit",
    description: "Divide documents into sections with Roman, Arabic, or alphabetic page numbering schemes in ISO 32000-1 /PageLabels."
  },
  {
    path: '/sanitize_pdf',
    toolId: 'sanitize',
    aliases: ['/sanitize-pdf', '/sanitize', '/clean-pdf', '/clean_pdf', '/remove-hidden-info', '/remove_hidden_info'],
    title: "Sanitize PDF & Remove Hidden Information — Adobe Acrobat Pro — LetsEdit",
    description: "Permanently scrub hidden metadata, tracking scripts, embedded files, private application data, and purge unreferenced objects."
  },
  {
    path: '/bookmarks',
    toolId: 'bookmarks',
    aliases: ['/outlines', '/pdf-bookmarks', '/pdf_bookmarks', '/edit-bookmarks', '/edit_bookmarks', '/bookmarks-pdf'],
    title: "PDF Bookmarks & Outline Editor — Adobe Acrobat Standard — LetsEdit",
    description: "Create, edit, nest, and color-code interactive navigation bookmark outlines in the ISO 32000-1 /Outlines hierarchy."
  },
  {
    path: '/header-footer',
    toolId: 'header-footer',
    aliases: ['/header_footer', '/add-header-footer', '/add_header_footer', '/header-and-footer', '/header_and_footer', '/headers-and-footers'],
    title: "Add Header & Footer to PDF — Dynamic Macros & Margins — LetsEdit",
    description: "Stamp professional 6-zone dynamic headers and footers with page numbers, date macros, custom margins, and divider rules."
  },
  {
    path: '/extract_pages_pdf',
    toolId: 'extract-pages',
    aliases: ['/extract-pages', '/extract-pages-pdf', '/extract_pages'],
    title: "Extract Pages from PDF online — Free Tool — LetsEdit",
    description: "Select and extract custom pages into a new independent PDF document."
  },
  {
    path: '/redact_pdf',
    toolId: 'redact',
    aliases: ['/redact', '/redact-pdf', '/whiteout_pdf', '/whiteout-pdf'],
    title: "Redact PDF online. Permanently remove sensitive data — LetsEdit",
    description: "Permanently scrub confidential text, words, and coordinates from underlying PDF streams."
  },
  {
    path: '/scan_pdf',
    toolId: 'scan',
    aliases: ['/scan', '/scan-pdf', '/camera-to-pdf', '/mobile_scan'],
    title: "Scan to PDF online. Camera and Mobile Scanner — LetsEdit",
    description: "Capture documents from your device camera or scanner directly into a sharp PDF document."
  },
  {
    path: '/mobile_pair',
    toolId: 'mobile-pair',
    aliases: ['/mobile-pair', '/pair', '/mobile-camera', '/mobile-sign'],
    title: "Mobile Camera & Signature Pairing — LetsEdit",
    description: "Scan documents or draw signatures with your smartphone camera and sync to desktop instantly."
  },
  {
    path: '/request_signature',
    toolId: 'sign',
    isRequestSignature: true,
    aliases: ['/request-signature', '/request_signatures', '/request-signatures', '/sign_request'],
    title: "Request PDF Signatures Online — Multi-Party e-Sign — LetsEdit",
    description: "Invite multiple signers to fill and sign PDF documents with drag-and-drop fields and eIDAS audit trail."
  },
  {
    path: '/sign_document',
    toolId: 'sign-document',
    isRecipientSigning: true,
    aliases: ['/sign-document', '/sign-doc', '/sign_recipient'],
    title: "Sign Document — LetsEdit Secure e-Sign Portal",
    description: "Review and securely sign requested document fields with cryptographic verification."
  }
];

export class Router {
  constructor() {
    this.routes = new Map();
    this.aliasMap = new Map();
    this.toolToPathMap = new Map();
    this.currentRoute = null;
    this.listeners = new Set();
    this.initialized = false;

    this.registerRoutes(ROUTE_DEFINITIONS);
  }

  registerRoutes(definitions) {
    for (const def of definitions) {
      const canonical = this.normalizePath(def.path);
      const routeObj = { ...def, canonicalPath: canonical };
      this.routes.set(canonical, routeObj);

      if (def.toolId) {
        // Map primary toolId to canonical path
        if (!this.toolToPathMap.has(def.toolId)) {
          this.toolToPathMap.set(def.toolId, canonical);
        }
      }

      if (Array.isArray(def.aliases)) {
        for (const alias of def.aliases) {
          this.aliasMap.set(this.normalizePath(alias), canonical);
        }
      }
    }
  }

  normalizePath(rawPath) {
    if (!rawPath || typeof rawPath !== 'string') return '/';
    // Strip query string and hashes
    let clean = rawPath.split('?')[0].split('#')[0].trim().toLowerCase();
    // Ensure leading slash
    if (!clean.startsWith('/')) clean = '/' + clean;
    // Strip trailing slashes unless it's root
    if (clean.length > 1 && clean.endsWith('/')) {
      clean = clean.replace(/\/+$/, '');
    }
    return clean;
  }

  /**
   * Resolves a path to its canonical route definition
   */
  match(pathname) {
    const norm = this.normalizePath(pathname);

    // Direct canonical match
    if (this.routes.has(norm)) {
      return this.routes.get(norm);
    }

    // Alias match
    if (this.aliasMap.has(norm)) {
      const canonical = this.aliasMap.get(norm);
      return this.routes.get(canonical);
    }

    // Fallback: check if norm without leading slash matches a toolId
    const stripped = norm.replace(/^\//, '');
    if (this.toolToPathMap.has(stripped)) {
      const canonical = this.toolToPathMap.get(stripped);
      return this.routes.get(canonical);
    }

    // Default fallback to landing page
    return this.routes.get('/') || {
      path: '/',
      canonicalPath: '/',
      toolId: null,
      isLanding: true,
      title: "LetsEdit — All-in-One Online PDF Editor & Tools"
    };
  }

  /**
   * Returns canonical URL for a tool ID
   */
  getCanonicalPath(toolId) {
    if (!toolId) return '/';
    if (this.toolToPathMap.has(toolId)) {
      return this.toolToPathMap.get(toolId);
    }
    // Check if toolId is already formatted as a path
    const asPath = toolId.startsWith('/') ? toolId : '/' + toolId;
    const matched = this.match(asPath);
    return matched ? matched.canonicalPath : '/' + toolId.replace(/-/g, '_');
  }

  getCurrentPath() {
    if (typeof window !== 'undefined' && window.location) {
      return this.normalizePath(window.location.pathname);
    }
    return this.currentRoute?.canonicalPath || '/';
  }

  /**
   * Subscribes a listener to route change events
   */
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(route, isPopState = false) {
    for (const listener of this.listeners) {
      try {
        listener(route, isPopState);
      } catch (e) {
        console.error('[Router] Listener error:', e);
      }
    }
  }

  /**
   * Navigates to a new route via HTML5 History pushState
   */
  navigate(targetPath, { replace = false, trigger = true } = {}) {
    const route = this.match(targetPath);
    this.currentRoute = route;

    if (typeof window !== 'undefined' && window.history) {
      const canonical = route.canonicalPath;
      if (replace) {
        window.history.replaceState({ path: canonical }, '', canonical);
      } else if (window.location.pathname !== canonical) {
        window.history.pushState({ path: canonical }, '', canonical);
      }

      if (route.title && typeof document !== 'undefined') {
        document.title = route.title;
      }
    }

    if (trigger) {
      this.notify(route, false);
    }

    return route;
  }

  /**
   * Handles route execution on popstate (browser back/forward) or direct load
   */
  handleRoute(pathname, isPopState = true) {
    const route = this.match(pathname);
    this.currentRoute = route;

    if (typeof window !== 'undefined' && window.history) {
      // If the current URL is an alias (e.g. /merge), replace with canonical (/merge_pdf)
      const currentNorm = this.normalizePath(window.location.pathname);
      if (currentNorm !== route.canonicalPath && !isPopState) {
        window.history.replaceState({ path: route.canonicalPath }, '', route.canonicalPath);
      }

      if (route.title && typeof document !== 'undefined') {
        document.title = route.title;
      }
    }

    this.notify(route, isPopState);
    return route;
  }

  /**
   * Initializes router listeners, click interceptors, and handles initial URL
   */
  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Listen to browser Back / Forward events
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname, true);
    });

    // Delegated click interceptor for standard links or data-route attributes
    document.addEventListener('click', (e) => {
      // Find closest element with data-route or a[href]
      const target = e.target.closest('[data-route], a[data-tool-link], a[href^="/"]');
      if (!target) return;

      // Ignore external or non-HTTP links
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('blob:')) {
          return;
        }
        if (target.target === '_blank') return;
        e.preventDefault();
        this.navigate(href);
        return;
      }

      const routeAttr = target.getAttribute('data-route');
      if (routeAttr) {
        e.preventDefault();
        this.navigate(routeAttr);
      }
    });

    // Execute route on current location
    this.handleRoute(window.location.pathname, false);
  }
}

export const router = new Router();
