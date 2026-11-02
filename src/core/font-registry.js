/**
 * LetsEdit Font Registry
 * Comprehensive 150+ font catalog with:
 * - PDF font name → Google Font canonical mapping (auto-detection)
 * - CSS Google Fonts loading for pixel-perfect inline editing display
 * - TTF bytes fetching for pdf-lib embedding in vector PDF export
 */

// ─── 1. CATALOG: 150+ curated fonts across categories ────────────────────────

/** @type {Array<{id:string, label:string, family:string, category:string, weight?:number[]}>} */
export const FONT_CATALOG = [
  // Sans-Serif — Body
  { id: 'Inter',            label: 'Inter',             family: 'Inter',              category: 'sans-serif' },
  { id: 'Roboto',           label: 'Roboto',             family: 'Roboto',             category: 'sans-serif' },
  { id: 'Open Sans',        label: 'Open Sans',          family: 'Open Sans',          category: 'sans-serif' },
  { id: 'Lato',             label: 'Lato',               family: 'Lato',               category: 'sans-serif' },
  { id: 'Montserrat',       label: 'Montserrat',         family: 'Montserrat',         category: 'sans-serif' },
  { id: 'Nunito',           label: 'Nunito',             family: 'Nunito',             category: 'sans-serif' },
  { id: 'Poppins',          label: 'Poppins',            family: 'Poppins',            category: 'sans-serif' },
  { id: 'Raleway',          label: 'Raleway',            family: 'Raleway',            category: 'sans-serif' },
  { id: 'Ubuntu',           label: 'Ubuntu',             family: 'Ubuntu',             category: 'sans-serif' },
  { id: 'Rubik',            label: 'Rubik',              family: 'Rubik',              category: 'sans-serif' },
  { id: 'Source Sans 3',    label: 'Source Sans 3',      family: 'Source Sans 3',      category: 'sans-serif' },
  { id: 'Noto Sans',        label: 'Noto Sans',          family: 'Noto Sans',          category: 'sans-serif' },
  { id: 'Mukta',            label: 'Mukta',              family: 'Mukta',              category: 'sans-serif' },
  { id: 'Work Sans',        label: 'Work Sans',          family: 'Work Sans',          category: 'sans-serif' },
  { id: 'Oxygen',           label: 'Oxygen',             family: 'Oxygen',             category: 'sans-serif' },
  { id: 'Hind',             label: 'Hind',               family: 'Hind',               category: 'sans-serif' },
  { id: 'Quicksand',        label: 'Quicksand',          family: 'Quicksand',          category: 'sans-serif' },
  { id: 'Mulish',           label: 'Mulish',             family: 'Mulish',             category: 'sans-serif' },
  { id: 'DM Sans',          label: 'DM Sans',            family: 'DM Sans',            category: 'sans-serif' },
  { id: 'Barlow',           label: 'Barlow',             family: 'Barlow',             category: 'sans-serif' },
  { id: 'Figtree',          label: 'Figtree',            family: 'Figtree',            category: 'sans-serif' },
  { id: 'Plus Jakarta Sans',label: 'Plus Jakarta Sans',  family: 'Plus Jakarta Sans',  category: 'sans-serif' },
  { id: 'Outfit',           label: 'Outfit',             family: 'Outfit',             category: 'sans-serif' },
  { id: 'Josefin Sans',     label: 'Josefin Sans',       family: 'Josefin Sans',       category: 'sans-serif' },
  { id: 'Cabin',            label: 'Cabin',              family: 'Cabin',              category: 'sans-serif' },
  { id: 'Exo 2',            label: 'Exo 2',              family: 'Exo 2',              category: 'sans-serif' },
  { id: 'Titillium Web',    label: 'Titillium Web',      family: 'Titillium Web',      category: 'sans-serif' },
  { id: 'IBM Plex Sans',    label: 'IBM Plex Sans',      family: 'IBM Plex Sans',      category: 'sans-serif' },
  { id: 'Manrope',          label: 'Manrope',            family: 'Manrope',            category: 'sans-serif' },
  { id: 'Red Hat Display',  label: 'Red Hat Display',    family: 'Red Hat Display',    category: 'sans-serif' },
  // Serif — Body
  { id: 'Merriweather',     label: 'Merriweather',       family: 'Merriweather',       category: 'serif' },
  { id: 'Lora',             label: 'Lora',               family: 'Lora',               category: 'serif' },
  { id: 'Playfair Display', label: 'Playfair Display',   family: 'Playfair Display',   category: 'serif' },
  { id: 'PT Serif',         label: 'PT Serif',           family: 'PT Serif',           category: 'serif' },
  { id: 'Libre Baskerville',label: 'Libre Baskerville',  family: 'Libre Baskerville',  category: 'serif' },
  { id: 'Source Serif 4',   label: 'Source Serif 4',     family: 'Source Serif 4',     category: 'serif' },
  { id: 'Noto Serif',       label: 'Noto Serif',         family: 'Noto Serif',         category: 'serif' },
  { id: 'EB Garamond',      label: 'EB Garamond',        family: 'EB Garamond',        category: 'serif' },
  { id: 'Crimson Text',     label: 'Crimson Text',       family: 'Crimson Text',       category: 'serif' },
  { id: 'Cormorant Garamond', label: 'Cormorant Garamond', family: 'Cormorant Garamond', category: 'serif' },
  { id: 'Bitter',           label: 'Bitter',             family: 'Bitter',             category: 'serif' },
  { id: 'Vollkorn',         label: 'Vollkorn',           family: 'Vollkorn',           category: 'serif' },
  { id: 'Spectral',         label: 'Spectral',           family: 'Spectral',           category: 'serif' },
  { id: 'Arvo',             label: 'Arvo',               family: 'Arvo',               category: 'serif' },
  { id: 'Slabo 27px',       label: 'Slabo 27px',         family: 'Slabo 27px',         category: 'serif' },
  { id: 'Libre Caslon Text',label: 'Libre Caslon Text',  family: 'Libre Caslon Text',  category: 'serif' },
  { id: 'GFS Didot',        label: 'GFS Didot',          family: 'GFS Didot',          category: 'serif' },
  { id: 'Cardo',            label: 'Cardo',              family: 'Cardo',              category: 'serif' },
  { id: 'IBM Plex Serif',   label: 'IBM Plex Serif',     family: 'IBM Plex Serif',     category: 'serif' },
  { id: 'Zilla Slab',       label: 'Zilla Slab',         family: 'Zilla Slab',         category: 'serif' },
  // Monospace
  { id: 'Roboto Mono',      label: 'Roboto Mono',        family: 'Roboto Mono',        category: 'monospace' },
  { id: 'Source Code Pro',  label: 'Source Code Pro',    family: 'Source Code Pro',    category: 'monospace' },
  { id: 'Fira Code',        label: 'Fira Code',          family: 'Fira Code',          category: 'monospace' },
  { id: 'JetBrains Mono',   label: 'JetBrains Mono',     family: 'JetBrains Mono',     category: 'monospace' },
  { id: 'IBM Plex Mono',    label: 'IBM Plex Mono',      family: 'IBM Plex Mono',      category: 'monospace' },
  { id: 'Inconsolata',      label: 'Inconsolata',        family: 'Inconsolata',        category: 'monospace' },
  { id: 'Space Mono',       label: 'Space Mono',         family: 'Space Mono',         category: 'monospace' },
  { id: 'Courier Prime',    label: 'Courier Prime',      family: 'Courier Prime',      category: 'monospace' },
  { id: 'PT Mono',          label: 'PT Mono',            family: 'PT Mono',            category: 'monospace' },
  { id: 'Share Tech Mono',  label: 'Share Tech Mono',    family: 'Share Tech Mono',    category: 'monospace' },
  // Display
  { id: 'Oswald',           label: 'Oswald',             family: 'Oswald',             category: 'display' },
  { id: 'Anton',            label: 'Anton',              family: 'Anton',              category: 'display' },
  { id: 'Bebas Neue',       label: 'Bebas Neue',         family: 'Bebas Neue',         category: 'display' },
  { id: 'Righteous',        label: 'Righteous',          family: 'Righteous',          category: 'display' },
  { id: 'Abril Fatface',    label: 'Abril Fatface',      family: 'Abril Fatface',      category: 'display' },
  { id: 'Alfa Slab One',    label: 'Alfa Slab One',      family: 'Alfa Slab One',      category: 'display' },
  { id: 'Boogaloo',         label: 'Boogaloo',           family: 'Boogaloo',           category: 'display' },
  { id: 'Lilita One',       label: 'Lilita One',         family: 'Lilita One',         category: 'display' },
  { id: 'Press Start 2P',   label: 'Press Start 2P',     family: 'Press Start 2P',     category: 'display' },
  { id: 'Black Han Sans',   label: 'Black Han Sans',     family: 'Black Han Sans',     category: 'display' },
  { id: 'Bangers',          label: 'Bangers',            family: 'Bangers',            category: 'display' },
  { id: 'Squada One',       label: 'Squada One',         family: 'Squada One',         category: 'display' },
  { id: 'Big Shoulders Display', label: 'Big Shoulders Display', family: 'Big Shoulders Display', category: 'display' },
  { id: 'Graduate',         label: 'Graduate',           family: 'Graduate',           category: 'display' },
  { id: 'Michroma',         label: 'Michroma',           family: 'Michroma',           category: 'display' },
  { id: 'Saira Condensed',  label: 'Saira Condensed',    family: 'Saira Condensed',    category: 'display' },
  // Handwriting / Script
  { id: 'Dancing Script',   label: 'Dancing Script',     family: 'Dancing Script',     category: 'handwriting' },
  { id: 'Pacifico',         label: 'Pacifico',           family: 'Pacifico',           category: 'handwriting' },
  { id: 'Caveat',           label: 'Caveat',             family: 'Caveat',             category: 'handwriting' },
  { id: 'Great Vibes',      label: 'Great Vibes',        family: 'Great Vibes',        category: 'handwriting' },
  { id: 'Satisfy',          label: 'Satisfy',            family: 'Satisfy',            category: 'handwriting' },
  { id: 'Kalam',            label: 'Kalam',              family: 'Kalam',              category: 'handwriting' },
  { id: 'Patrick Hand',     label: 'Patrick Hand',       family: 'Patrick Hand',       category: 'handwriting' },
  { id: 'Handlee',          label: 'Handlee',            family: 'Handlee',            category: 'handwriting' },
  { id: 'Indie Flower',     label: 'Indie Flower',       family: 'Indie Flower',       category: 'handwriting' },
  { id: 'Amatic SC',        label: 'Amatic SC',          family: 'Amatic SC',          category: 'handwriting' },
  { id: 'Cookie',           label: 'Cookie',             family: 'Cookie',             category: 'handwriting' },
  { id: 'Parisienne',       label: 'Parisienne',         family: 'Parisienne',         category: 'handwriting' },
  { id: 'Sacramento',       label: 'Sacramento',         family: 'Sacramento',         category: 'handwriting' },
  { id: 'Bad Script',       label: 'Bad Script',         family: 'Bad Script',         category: 'handwriting' },
  { id: 'Yellowtail',       label: 'Yellowtail',         family: 'Yellowtail',         category: 'handwriting' },
  { id: 'Shadows Into Light', label: 'Shadows Into Light', family: 'Shadows Into Light', category: 'handwriting' },
  { id: 'Rock Salt',        label: 'Rock Salt',          family: 'Rock Salt',          category: 'handwriting' },
  { id: 'Permanent Marker', label: 'Permanent Marker',   family: 'Permanent Marker',   category: 'handwriting' },
  { id: 'Gloria Hallelujah',label: 'Gloria Hallelujah',  family: 'Gloria Hallelujah',  category: 'handwriting' },
  { id: 'Allura',           label: 'Allura',             family: 'Allura',             category: 'handwriting' },
  { id: 'Alex Brush',       label: 'Alex Brush',         family: 'Alex Brush',         category: 'handwriting' },
  { id: 'Courgette',        label: 'Courgette',          family: 'Courgette',          category: 'handwriting' },
  { id: 'Damion',           label: 'Damion',             family: 'Damion',             category: 'handwriting' },
  { id: 'Pinyon Script',    label: 'Pinyon Script',      family: 'Pinyon Script',      category: 'handwriting' },
  { id: 'Tangerine',        label: 'Tangerine',          family: 'Tangerine',          category: 'handwriting' },
  { id: 'Marck Script',     label: 'Marck Script',       family: 'Marck Script',       category: 'handwriting' },
  // Modern Sans-Serif Additions
  { id: 'Urbanist',         label: 'Urbanist',           family: 'Urbanist',           category: 'sans-serif' },
  { id: 'Space Grotesk',    label: 'Space Grotesk',      family: 'Space Grotesk',      category: 'sans-serif' },
  { id: 'Lexend',           label: 'Lexend',             family: 'Lexend',             category: 'sans-serif' },
  { id: 'Sora',             label: 'Sora',               family: 'Sora',               category: 'sans-serif' },
  { id: 'Hanken Grotesk',   label: 'Hanken Grotesk',     family: 'Hanken Grotesk',     category: 'sans-serif' },
  { id: 'Albert Sans',      label: 'Albert Sans',        family: 'Albert Sans',        category: 'sans-serif' },
  { id: 'Public Sans',      label: 'Public Sans',        family: 'Public Sans',        category: 'sans-serif' },
  { id: 'Epilogue',         label: 'Epilogue',           family: 'Epilogue',           category: 'sans-serif' },
  { id: 'Chivo',            label: 'Chivo',              family: 'Chivo',              category: 'sans-serif' },
  { id: 'Maven Pro',        label: 'Maven Pro',          family: 'Maven Pro',          category: 'sans-serif' },
  { id: 'Be Vietnam Pro',   label: 'Be Vietnam Pro',     family: 'Be Vietnam Pro',     category: 'sans-serif' },
  { id: 'Kumbh Sans',       label: 'Kumbh Sans',         family: 'Kumbh Sans',         category: 'sans-serif' },
  { id: 'Sen',              label: 'Sen',                family: 'Sen',                category: 'sans-serif' },
  { id: 'Red Hat Text',     label: 'Red Hat Text',       family: 'Red Hat Text',       category: 'sans-serif' },
  { id: 'Instrument Sans',  label: 'Instrument Sans',    family: 'Instrument Sans',    category: 'sans-serif' },
  // Modern Serif Additions
  { id: 'Fraunces',         label: 'Fraunces',           family: 'Fraunces',           category: 'serif' },
  { id: 'Newsreader',       label: 'Newsreader',         family: 'Newsreader',         category: 'serif' },
  { id: 'Bodoni Moda',      label: 'Bodoni Moda',        family: 'Bodoni Moda',        category: 'serif' },
  { id: 'Castoro',          label: 'Castoro',            family: 'Castoro',            category: 'serif' },
  { id: 'Frank Ruhl Libre', label: 'Frank Ruhl Libre',   family: 'Frank Ruhl Libre',   category: 'serif' },
  { id: 'Faustina',         label: 'Faustina',           family: 'Faustina',           category: 'serif' },
  { id: 'Caladea',          label: 'Caladea',            family: 'Caladea',            category: 'serif' },
  { id: 'Aleo',             label: 'Aleo',               family: 'Aleo',               category: 'serif' },
  { id: 'Alice',            label: 'Alice',              family: 'Alice',              category: 'serif' },
  { id: 'Marcellus',        label: 'Marcellus',          family: 'Marcellus',          category: 'serif' },
  // Modern Monospace Additions
  { id: 'Red Hat Mono',     label: 'Red Hat Mono',       family: 'Red Hat Mono',       category: 'monospace' },
  { id: 'Martian Mono',     label: 'Martian Mono',       family: 'Martian Mono',       category: 'monospace' },
  { id: 'Fragment Mono',    label: 'Fragment Mono',      family: 'Fragment Mono',      category: 'monospace' },
  { id: 'Ubuntu Mono',      label: 'Ubuntu Mono',        family: 'Ubuntu Mono',        category: 'monospace' },
  { id: 'Anonymous Pro',    label: 'Anonymous Pro',      family: 'Anonymous Pro',      category: 'monospace' },
  { id: 'Cutive Mono',      label: 'Cutive Mono',        family: 'Cutive Mono',        category: 'monospace' },
  // Creative / Display Additions
  { id: 'Lobster',          label: 'Lobster',            family: 'Lobster',            category: 'display' },
  { id: 'Comfortaa',        label: 'Comfortaa',          family: 'Comfortaa',          category: 'display' },
  { id: 'Fredoka',          label: 'Fredoka',            family: 'Fredoka',            category: 'display' },
  { id: 'Staatliches',      label: 'Staatliches',        family: 'Staatliches',        category: 'display' },
  { id: 'Russo One',        label: 'Russo One',          family: 'Russo One',          category: 'display' },
  { id: 'Audiowide',        label: 'Audiowide',          family: 'Audiowide',          category: 'display' },
  { id: 'Titan One',        label: 'Titan One',          family: 'Titan One',          category: 'display' },
  { id: 'Bungee',           label: 'Bungee',             family: 'Bungee',             category: 'display' },
  { id: 'Monoton',          label: 'Monoton',            family: 'Monoton',            category: 'display' },
  { id: 'Shrikhand',        label: 'Shrikhand',          family: 'Shrikhand',          category: 'display' },
  // Specialized / Professional
  { id: 'Cinzel',           label: 'Cinzel',             family: 'Cinzel',             category: 'serif' },
  { id: 'Uncial Antiqua',   label: 'Uncial Antiqua',     family: 'Uncial Antiqua',     category: 'serif' },
  { id: 'MedievalSharp',    label: 'MedievalSharp',      family: 'MedievalSharp',      category: 'serif' },
  { id: 'Special Elite',    label: 'Special Elite',      family: 'Special Elite',      category: 'display' },
  { id: 'Share',            label: 'Share',              family: 'Share',              category: 'display' },
  { id: 'Nova Mono',        label: 'Nova Mono',          family: 'Nova Mono',          category: 'monospace' },
  // Standard PDF Fallbacks (always available via pdf-lib)
  { id: 'Helvetica',        label: 'Helvetica',          family: 'Helvetica, Arial, sans-serif',    category: 'system' },
  { id: 'Times New Roman',  label: 'Times New Roman',    family: '"Times New Roman", Times, serif', category: 'system' },
  { id: 'Courier',          label: 'Courier',            family: '"Courier New", Courier, monospace', category: 'system' },
  { id: 'Arial',            label: 'Arial',              family: 'Arial, sans-serif',               category: 'system' },
  { id: 'Georgia',          label: 'Georgia, serif',     family: 'Georgia, serif',                  category: 'system' },
];

// Quick lookup: id → font record
export const FONT_MAP = Object.fromEntries(FONT_CATALOG.map(f => [f.id, f]));

/**
 * Generates categorized HTML <optgroup> and <option> tags for all 150+ catalog fonts.
 * @param {string} selectedId - Canonical font ID to mark selected
 * @returns {string} HTML string
 */
export function generateFontOptionsHtml(selectedId = 'Helvetica') {
  const categories = [
    { key: 'system',      label: 'Standard PDF Fonts' },
    { key: 'sans-serif',  label: 'Sans-Serif' },
    { key: 'serif',       label: 'Serif' },
    { key: 'monospace',   label: 'Monospace' },
    { key: 'display',     label: 'Display & Modern' },
    { key: 'handwriting', label: 'Handwriting & Script' }
  ];

  return categories.map(cat => {
    const fonts = FONT_CATALOG.filter(f => f.category === cat.key);
    if (fonts.length === 0) return '';
    const options = fonts.map(f => {
      const isSel = (f.id === selectedId) || (selectedId === 'TimesRoman' && f.id === 'Times New Roman');
      return `<option value="${f.id}" ${isSel ? 'selected' : ''}>${f.label}</option>`;
    }).join('\n    ');
    return `<optgroup label="${cat.label}">\n    ${options}\n  </optgroup>`;
  }).filter(Boolean).join('\n  ');
}

/**
 * Populates a <select> DOM element with the 150+ font catalog options.
 * @param {HTMLSelectElement} selectEl
 * @param {string} selectedId
 */
export function populateFontSelect(selectEl, selectedId = 'Helvetica') {
  if (!selectEl) return;
  selectEl.innerHTML = generateFontOptionsHtml(selectedId);
  if (selectedId) selectEl.value = selectedId;
}

// ─── 2. PDF font-name → FontRegistry canonical id ────────────────────────────

/**
 * Auto-detects the closest LetsEdit font ID from a raw PDF font descriptor string.
 * Handles obfuscated PDF font names like:
 *   "BCDFGH+TimesNewRomanPSMT", "Helvetica-Bold", "Calibri-Italic", etc.
 *
 * @param {string} rawPdfFontName
 * @returns {string} Canonical font ID from FONT_CATALOG
 */
export function detectFontIdFromPdf(rawPdfFontName) {
  if (!rawPdfFontName) return 'Helvetica';

  // Strip subset prefix like "ABCDEF+" (6 chars + plus sign)
  const name = rawPdfFontName.replace(/^[A-Z]{6}\+/, '').toLowerCase().trim();

  // Bold detection
  const isBold = /bold|heavy|black|w[789]|extrabold|semibold/i.test(rawPdfFontName);
  const isItalic = /italic|oblique|slanted/i.test(rawPdfFontName);

  // Exact / near-exact match priority
  const matchRules = [
    // Monospace first (most specific)
    [/courier|cour(?!\w)|cournew/,                     isBold ? 'Courier Prime' : 'Courier'],
    [/jetbrains|jet.?brain/,                            'JetBrains Mono'],
    [/firacode|fira.?code/,                             'Fira Code'],
    [/sourcecodepro|source.?code/,                      'Source Code Pro'],
    [/robotomono|roboto.?mono/,                         'Roboto Mono'],
    [/inconsolata/,                                     'Inconsolata'],
    [/spacemono|space.?mono/,                           'Space Mono'],
    [/ibmplexmono|ibm.?plex.?mono/,                    'IBM Plex Mono'],
    [/consolas|monospace|monaco|menlo|lucidatypewriter/, 'JetBrains Mono'],
    // Serif
    [/timesnewroman|timesnewro|timesnr|times(?!roman)/,  isBold ? 'Merriweather' : 'Times New Roman'],
    [/timesroman|timesro/,                              'Times New Roman'],
    [/georgia/,                                         'Lora'],
    [/palatino/,                                        'EB Garamond'],
    [/garamond/,                                        'EB Garamond'],
    [/bookman/,                                         'Libre Baskerville'],
    [/baskerville/,                                     'Libre Baskerville'],
    [/caslon/,                                          'Libre Caslon Text'],
    [/minion/,                                          'Crimson Text'],
    [/didot/,                                           'Playfair Display'],
    [/schoolbook|century(?:school)?/,                   'Merriweather'],
    [/merriweather/,                                    'Merriweather'],
    [/lora(?!\w)/,                                      'Lora'],
    [/playfair/,                                        'Playfair Display'],
    [/ptserif|pt.?serif/,                               'PT Serif'],
    [/liberation.?serif/,                               'Libre Baskerville'],
    [/notoserif|noto.?serif/,                           'Noto Serif'],
    [/ibmplexserif|ibm.?plex.?serif/,                  'IBM Plex Serif'],
    // Sans-Serif
    [/helvetica(?!bold)/,                               isBold ? 'Roboto' : 'Helvetica'],
    [/helveticabold|helvetica.?bold/,                   'Roboto'],
    [/arial(?!rounded)/,                                isBold ? 'Roboto' : 'Helvetica'],
    [/calibri/,                                         'Nunito'],
    [/candara/,                                         'Nunito'],
    [/trebuchet/,                                       'Open Sans'],
    [/tahoma/,                                          'Inter'],
    [/verdana/,                                         'Inter'],
    [/franklin.?gothic/,                                'Montserrat'],
    [/gill.?sans/,                                      'Raleway'],
    [/centurygothic|century.?gothic/,                   'Raleway'],
    [/futura/,                                          'Josefin Sans'],
    [/avenir/,                                          'Nunito'],
    [/optima/,                                          'Lato'],
    [/myriad|myriadpro/,                                'Open Sans'],
    [/sourcesans|source.?sans/,                         'Source Sans 3'],
    [/opensans|open.?sans/,                             'Open Sans'],
    [/notosans|noto.?sans/,                             'Noto Sans'],
    [/roboto(?!mono)/,                                  'Roboto'],
    [/lato(?!\w)/,                                      'Lato'],
    [/poppins/,                                         'Poppins'],
    [/montserrat/,                                      'Montserrat'],
    [/raleway/,                                         'Raleway'],
    [/ubuntu/,                                          'Ubuntu'],
    [/inter(?!\w)/,                                     'Inter'],
    [/ibmplexsans|ibm.?plex.?sans/,                    'IBM Plex Sans'],
    [/liberation.?sans/,                                'Open Sans'],
    [/segoeui|segoe.?ui/,                               'Inter'],
    [/cleartype|clearface/,                             'Inter'],
    // Handwriting / Script
    [/dancing/,                                         'Dancing Script'],
    [/pacifico/,                                        'Pacifico'],
    [/caveat(?!\w)/,                                    'Caveat'],
    [/greatvibes|great.?vibes/,                         'Great Vibes'],
    [/satisfy/,                                         'Satisfy'],
    [/kalam(?!\w)/,                                     'Kalam'],
    // Display
    [/oswald/,                                          'Oswald'],
    [/bebas/,                                           'Bebas Neue'],
    [/anton(?!\w)/,                                     'Anton'],
  ];

  for (const [pattern, fontId] of matchRules) {
    if (pattern.test(name)) return fontId;
  }

  // Final fallback: bold → Roboto, regular → Helvetica
  return isBold ? 'Roboto' : 'Helvetica';
}

/**
 * Returns the CSS font-family string for a given canonical font ID.
 * Falls back gracefully to system fonts.
 */
export function getCssFontFamily(fontId) {
  const rec = FONT_MAP[fontId];
  if (!rec) return 'Helvetica, Arial, sans-serif';
  if (rec.category === 'system') return rec.family;
  return `"${rec.family}", ${rec.category === 'serif' ? 'serif' : rec.category === 'monospace' ? 'monospace' : rec.category === 'handwriting' ? 'cursive' : 'sans-serif'}`;
}

/**
 * Returns the Google Fonts CSS URL for a single font or a list of fonts.
 * Used to preload fonts into the document head for editor fidelity.
 */
export function buildGoogleFontsUrl(fontIds) {
  const webFonts = fontIds
    .filter(id => FONT_MAP[id] && FONT_MAP[id].category !== 'system')
    .map(id => FONT_MAP[id].family.replace(/\s+/g, '+') + ':wght@300;400;500;600;700;900');
  if (webFonts.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${webFonts.map(f => `family=${f}`).join('&')}&display=swap`;
}

// ─── 3. CSS Font Loading (for editor visual fidelity) ────────────────────────

const _loadedFontUrls = new Set();

/**
 * Loads a single font on-demand when requested by the editor or user.
 */
export function loadEditorFont(fontId) {
  if (typeof document === 'undefined' || !fontId) return;
  const rec = FONT_MAP[fontId];
  if (!rec || rec.category === 'system') return;
  const url = buildGoogleFontsUrl([fontId]);
  if (url && !_loadedFontUrls.has(url)) {
    _loadedFontUrls.add(url);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

/**
 * Loads common editor fonts on-demand without blocking initial page render.
 */
export function loadAllEditorFonts() {
  if (typeof document === 'undefined') return;
  // Load only top common editor fonts on idle, not 150+ fonts upfront
  const common = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Merriweather'];
  common.forEach(f => loadEditorFont(f));
}

// ─── 4. TTF Fetching for pdf-lib (vector export) ─────────────────────────────

/** In-memory TTF byte cache: fontId → Uint8Array */
const _ttfCache = new Map();

/**
 * Google Fonts direct TTF URL table for common fonts.
 * These are the stable CDN URLs for the regular (400) weight.
 * For fonts not listed here, we fall back to standard PDF fonts.
 */
const GOOGLE_FONTS_TTF = {
  'Inter':             'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2',
  'Roboto':            'https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuZKMnZhdA.woff2',
  'Open Sans':         'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C51jkE.woff2',
  'Lato':              'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff2',
  'Montserrat':        'https://fonts.gstatic.com/s/montserrat/v29/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2',
  'Poppins':           'https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrFJDUc1NECPY.woff2',
  'Nunito':            'https://fonts.gstatic.com/s/nunito/v26/XRXI3I6Li01BKofiOc5wtlZ2di8HDDshdTQ3ig.woff2',
  'Raleway':           'https://fonts.gstatic.com/s/raleway/v34/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvaorCIPrQ.woff2',
  'Ubuntu':            'https://fonts.gstatic.com/s/ubuntu/v20/4iCs6KVjbNBYlgo6eA.woff2',
  'Oswald':            'https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs18NvsUtiZTaR.woff2',
  'Merriweather':      'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-fCZJ.woff2',
  'Lora':              'https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOxE7fSWef8Pnp7fFE.woff2',
  'Playfair Display':  'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_pqYZA.woff2',
  'Dancing Script':    'https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjsohD9F50Ruu7BMSo3Sup8hNX6plRP.woff2',
  'Pacifico':          'https://fonts.gstatic.com/s/pacifico/v22/FwZY7-Qmy14u9lezJ96A4sijpFu_.woff2',
  'Caveat':            'https://fonts.gstatic.com/s/caveat/v17/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9eIWpZA.woff2',
  'Great Vibes':       'https://fonts.gstatic.com/s/greatvibes/v19/RWmMoKWR9v4ksMfaWd_JN9XKiaQ.woff2',
  'Satisfy':           'https://fonts.gstatic.com/s/satisfy/v21/rP2Hp2yn6lkG50LoOZQKPg.woff2',
  'Roboto Mono':       'https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_SBQ.woff2',
  'Source Code Pro':   'https://fonts.gstatic.com/s/sourcecodepro/v22/HI_SiYsKILxRpg3hIP6sJ7fM7PqlPevWnsUnxg.woff2',
  'Fira Code':         'https://fonts.gstatic.com/s/firacode/v22/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_A9sJVD7MOzlojwUKaJO.woff2',
  'JetBrains Mono':    'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yK1jqqta.woff2',
  'Bebas Neue':        'https://fonts.gstatic.com/s/bebasneuecondensed/v9/QdVFSTAkXno-IwdkAq51E_KDQdnLzh9aw6oMqC7Z6-I.woff2',
  'Kalam':             'https://fonts.gstatic.com/s/kalam/v16/YA9dr0Wd4kDdMthQOjU.woff2',
  'Permanent Marker':  'https://fonts.gstatic.com/s/permanentmarker/v16/Fh4uPib9Iyv2ucM6pGQMWimMp004La2Cfw.woff2',
};

/**
 * Fetches a TTF/WOFF2 font as raw bytes for embedding in pdf-lib.
 * Returns null on failure (falls back to standard PDF font).
 *
 * @param {string} fontId - Canonical font ID from FONT_CATALOG
 * @returns {Promise<Uint8Array|null>}
 */
export async function fetchFontBytes(fontId) {
  if (_ttfCache.has(fontId)) return _ttfCache.get(fontId);

  const url = GOOGLE_FONTS_TTF[fontId];
  if (!url) return null;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    _ttfCache.set(fontId, bytes);
    return bytes;
  } catch {
    return null;
  }
}

// ─── 5. Standard PDF Font Fallback Map ──────────────────────────────────────

// Self-contained StandardFonts constant map matching pdf-lib specification without pulling in entire library
const StandardFonts = {
  Courier: 'Courier',
  CourierBold: 'Courier-Bold',
  CourierOblique: 'Courier-Oblique',
  CourierBoldOblique: 'Courier-BoldOblique',
  Helvetica: 'Helvetica',
  HelveticaBold: 'Helvetica-Bold',
  HelveticaOblique: 'Helvetica-Oblique',
  HelveticaBoldOblique: 'Helvetica-BoldOblique',
  TimesRoman: 'Times-Roman',
  TimesRomanBold: 'Times-Bold',
  TimesRomanItalic: 'Times-Italic',
  TimesRomanBoldItalic: 'Times-BoldItalic',
  Symbol: 'Symbol',
  ZapfDingbats: 'ZapfDingbats'
};

/**
 * Maps a canonical font ID to the closest pdf-lib StandardFont enum for fallback.
 */
export function getStandardFontFallback(fontId, forceBold = false, forceItalic = false) {
  const isBold = forceBold || /bold|black|heavy|w[789]/i.test(fontId);
  const isItalic = forceItalic || /italic|oblique|slanted/i.test(fontId);
  const rec = FONT_MAP[fontId];
  const isSerif = (rec && rec.category === 'serif') || /times|serif|georgia|garamond|baskerville|cambria/i.test(fontId || '');
  const isMono = (rec && rec.category === 'monospace') || /courier|mono|code|console/i.test(fontId || '');

  if (isSerif) {
    if (isBold && isItalic) return StandardFonts.TimesRomanBoldItalic;
    if (isBold) return StandardFonts.TimesRomanBold;
    if (isItalic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (isMono) {
    if (isBold && isItalic) return StandardFonts.CourierBoldOblique;
    if (isBold) return StandardFonts.CourierBold;
    if (isItalic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }
  // sans-serif / display / handwriting / default
  if (isBold && isItalic) return StandardFonts.HelveticaBoldOblique;
  if (isBold) return StandardFonts.HelveticaBold;
  if (isItalic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}
