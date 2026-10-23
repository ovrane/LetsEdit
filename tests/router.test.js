import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Router, ROUTE_DEFINITIONS } from '../src/core/router.js';
import { generateQrSvg } from '../src/utils/helpers.js';
import { WORKFLOW_TOOLS_CONFIG, CHAIN_TOOLS } from '../src/components/tool-workflow.js';

describe('iLovePDF-Compatible Router Engine Tests', () => {
  const router = new Router();

  test('canonical root route matches landing page', () => {
    const route = router.match('/');
    assert.equal(route.canonicalPath, '/');
    assert.equal(route.isLanding, true);
    assert.ok(route.title.includes('LetsEdit'));
  });

  test('canonical studio editor route matches /edit_pdf and aliases', () => {
    const direct = router.match('/edit_pdf');
    assert.equal(direct.canonicalPath, '/edit_pdf');
    assert.equal(direct.isEditor, true);

    const aliases = ['/edit', '/editor', '/edit-pdf', '/pdf_editor', '/pdf-editor'];
    for (const alias of aliases) {
      const match = router.match(alias);
      assert.equal(match.canonicalPath, '/edit_pdf');
      assert.equal(match.isEditor, true);
    }
  });

  test('canonical iLovePDF tool routes match their respective workflow tools', () => {
    const expectations = [
      { path: '/merge_pdf', toolId: 'merge' },
      { path: '/split_pdf', toolId: 'split' },
      { path: '/compress_pdf', toolId: 'compress' },
      { path: '/pdf_to_word', toolId: 'pdf-to-word' },
      { path: '/pdf_to_powerpoint', toolId: 'pdf-to-ppt' },
      { path: '/pdf_to_excel', toolId: 'pdf-to-excel' },
      { path: '/word_to_pdf', toolId: 'word-to-pdf' },
      { path: '/pdf_to_jpg', toolId: 'to-image' },
      { path: '/jpg_to_pdf', toolId: 'images-to-pdf' },
      { path: '/sign_pdf', toolId: 'sign' },
      { path: '/watermark_pdf', toolId: 'watermark' },
      { path: '/rotate_pdf', toolId: 'rotate' },
      { path: '/html_to_pdf', toolId: 'html-to-pdf' },
      { path: '/unlock_pdf', toolId: 'unlock' },
      { path: '/protect_pdf', toolId: 'security' },
      { path: '/organize_pdf', toolId: 'organize' },
      { path: '/pdf_to_pdfa', toolId: 'pdfa' },
      { path: '/repair_pdf', toolId: 'repair' },
      { path: '/ocr_pdf', toolId: 'ocr-pdf' },
      { path: '/crop_pdf', toolId: 'crop' },
      { path: '/compare_pdf', toolId: 'compare' },
      { path: '/bates_numbering_pdf', toolId: 'bates' },
      { path: '/nup_pdf', toolId: 'nup' },
      { path: '/split_half_pdf', toolId: 'split-half' },
      { path: '/alternate_mix_pdf', toolId: 'alternate-mix' },
      { path: '/grayscale_pdf', toolId: 'grayscale' },
      { path: '/flip_pdf', toolId: 'flip' },
      { path: '/extract_images_pdf', toolId: 'extract-images' },
      { path: '/extract_text_pdf', toolId: 'pdf-to-text' },
      { path: '/remove_annotations_pdf', toolId: 'remove-annotations' },
      { path: '/resize_pdf', toolId: 'resize' },
      { path: '/rename_pdf', toolId: 'rename' },
      { path: '/pagenumber_pdf', toolId: 'pagenumbers' },
      { path: '/flatten_pdf', toolId: 'flatten' },
      { path: '/extract_pages_pdf', toolId: 'extract-pages' },
      { path: '/redact_pdf', toolId: 'redact' },
      { path: '/scan_pdf', toolId: 'scan' },
      { path: '/powerpoint_to_pdf', toolId: 'ppt-to-pdf' },
      { path: '/excel_to_pdf', toolId: 'excel-to-pdf' }
    ];

    for (const exp of expectations) {
      const match = router.match(exp.path);
      assert.equal(match.canonicalPath, exp.path);
      assert.equal(match.toolId, exp.toolId, `Mismatch for path ${exp.path}`);
      assert.ok(match.title.length > 5, `Expected descriptive title for ${exp.path}`);
    }
  });

  test('common aliases resolve to canonical iLovePDF paths', () => {
    const aliasPairs = [
      { alias: '/merge', canonical: '/merge_pdf' },
      { alias: '/merge-pdf', canonical: '/merge_pdf' },
      { alias: '/combine_pdf', canonical: '/merge_pdf' },
      { alias: '/split', canonical: '/split_pdf' },
      { alias: '/split-pdf', canonical: '/split_pdf' },
      { alias: '/compress', canonical: '/compress_pdf' },
      { alias: '/compress-pdf', canonical: '/compress_pdf' },
      { alias: '/pdf-to-word', canonical: '/pdf_to_word' },
      { alias: '/pdf-to-ppt', canonical: '/pdf_to_powerpoint' },
      { alias: '/pdf-to-excel', canonical: '/pdf_to_excel' },
      { alias: '/word-to-pdf', canonical: '/word_to_pdf' },
      { alias: '/pdf-to-jpg', canonical: '/pdf_to_jpg' },
      { alias: '/to-image', canonical: '/pdf_to_jpg' },
      { alias: '/jpg-to-pdf', canonical: '/jpg_to_pdf' },
      { alias: '/images-to-pdf', canonical: '/jpg_to_pdf' },
      { alias: '/protect', canonical: '/protect_pdf' },
      { alias: '/security', canonical: '/protect_pdf' },
      { alias: '/encrypt-pdf', canonical: '/protect_pdf' },
      { alias: '/unlock', canonical: '/unlock_pdf' },
      { alias: '/watermark', canonical: '/watermark_pdf' },
      { alias: '/rotate', canonical: '/rotate_pdf' },
      { alias: '/organize', canonical: '/organize_pdf' },
      { alias: '/pdfa', canonical: '/pdf_to_pdfa' },
      { alias: '/repair', canonical: '/repair_pdf' },
      { alias: '/ocr', canonical: '/ocr_pdf' },
      { alias: '/bates', canonical: '/bates_numbering_pdf' },
      { alias: '/nup', canonical: '/nup_pdf' },
      { alias: '/delete_pdf', canonical: '/organize_pdf' },
      { alias: '/delete-pages', canonical: '/organize_pdf' },
      { alias: '/pagenumbers', canonical: '/pagenumber_pdf' },
      { alias: '/page-numbers', canonical: '/pagenumber_pdf' },
      { alias: '/flatten', canonical: '/flatten_pdf' },
      { alias: '/extract-pages', canonical: '/extract_pages_pdf' },
      { alias: '/redact', canonical: '/redact_pdf' },
      { alias: '/whiteout_pdf', canonical: '/redact_pdf' },
      { alias: '/scan', canonical: '/scan_pdf' },
      { alias: '/scan-pdf', canonical: '/scan_pdf' },
      { alias: '/excel-to-pdf', canonical: '/excel_to_pdf' },
      { alias: '/excel2pdf', canonical: '/excel_to_pdf' },
      { alias: '/ppt-to-pdf', canonical: '/powerpoint_to_pdf' },
      { alias: '/powerpoint-to-pdf', canonical: '/powerpoint_to_pdf' }
    ];

    for (const pair of aliasPairs) {
      const match = router.match(pair.alias);
      assert.equal(match.canonicalPath, pair.canonical, `Expected alias ${pair.alias} to resolve to ${pair.canonical}`);
    }
  });

  test('normalizes trailing slashes, uppercase characters, query parameters, and hashes', () => {
    assert.equal(router.match('/MERGE_PDF/').canonicalPath, '/merge_pdf');
    assert.equal(router.match('/compress_pdf?utm_source=test#step1').canonicalPath, '/compress_pdf');
    assert.equal(router.match('/SPLIT-PDF///').canonicalPath, '/split_pdf');
  });

  test('getCanonicalPath returns the canonical path for any registered tool ID', () => {
    assert.equal(router.getCanonicalPath('merge'), '/merge_pdf');
    assert.equal(router.getCanonicalPath('compress'), '/compress_pdf');
    assert.equal(router.getCanonicalPath('split'), '/split_pdf');
    assert.equal(router.getCanonicalPath('pdf-to-word'), '/pdf_to_word');
    assert.equal(router.getCanonicalPath('images-to-pdf'), '/jpg_to_pdf');
    assert.equal(router.getCanonicalPath('to-image'), '/pdf_to_jpg');
    assert.equal(router.getCanonicalPath('security'), '/protect_pdf');
    assert.equal(router.getCanonicalPath('bates'), '/bates_numbering_pdf');
    assert.equal(router.getCanonicalPath('pagenumbers'), '/pagenumber_pdf');
    assert.equal(router.getCanonicalPath('flatten'), '/flatten_pdf');
    assert.equal(router.getCanonicalPath('extract-pages'), '/extract_pages_pdf');
    assert.equal(router.getCanonicalPath(null), '/');
  });

  test('canonical /account and /login routes match with aliases', () => {
    const acc = router.match('/account');
    assert.equal(acc.canonicalPath, '/account');
    assert.equal(acc.isAccount, true);

    for (const alias of ['/profile', '/user', '/settings']) {
      const match = router.match(alias);
      assert.equal(match.canonicalPath, '/account');
      assert.equal(match.isAccount, true);
    }

    const login = router.match('/login');
    assert.equal(login.canonicalPath, '/login');
    assert.equal(login.isLogin, true);

    for (const alias of ['/signin', '/sign-in']) {
      const match = router.match(alias);
      assert.equal(match.canonicalPath, '/login');
      assert.equal(match.isLogin, true);
    }

    const reg = router.match('/register');
    assert.equal(reg.canonicalPath, '/register');
    assert.equal(reg.isRegister, true);

    for (const alias of ['/signup', '/sign-up']) {
      const match = router.match(alias);
      assert.equal(match.canonicalPath, '/register');
      assert.equal(match.isRegister, true);
    }
  });

  test('subscription listeners receive notifications on route transitions', () => {
    let notifiedRoute = null;
    const unsub = router.subscribe((route) => {
      notifiedRoute = route;
    });

    router.navigate('/compress_pdf', { trigger: true });
    assert.ok(notifiedRoute);
    assert.equal(notifiedRoute.canonicalPath, '/compress_pdf');
    assert.equal(notifiedRoute.toolId, 'compress');

    unsub();
  });

  test('generateQrSvg produces valid vector SVG with quiet zones and path elements', () => {
    const svg = generateQrSvg('https://letsedit.io/download?ref=doc_12345', 180);
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('viewBox="0 0 29 29"'));
    assert.ok(svg.includes('width="180"'));
    assert.ok(svg.includes('height="180"'));
    assert.ok(svg.includes('<rect width="29" height="29" fill="#ffffff" />'));
    assert.ok(svg.includes('<path d="M'));
  });

  test('CHAIN_TOOLS provides valid workflow chaining tools with color palettes and vector icons', () => {
    assert.ok(CHAIN_TOOLS.length >= 8);
    for (const tool of CHAIN_TOOLS) {
      assert.ok(tool.id);
      assert.ok(tool.title);
      assert.ok(tool.desc);
      assert.ok(tool.color.startsWith('#'));
      assert.ok(tool.icon.includes('<svg'));
      // Verify tool exists in WORKFLOW_TOOLS_CONFIG
      assert.ok(WORKFLOW_TOOLS_CONFIG[tool.id], `Tool ${tool.id} should be registered in WORKFLOW_TOOLS_CONFIG`);
    }
  });

  test('WORKFLOW_TOOLS_CONFIG supports protect alias mapping to security', () => {
    assert.equal(WORKFLOW_TOOLS_CONFIG.protect, WORKFLOW_TOOLS_CONFIG.security);
    assert.equal(WORKFLOW_TOOLS_CONFIG.protect.id, 'security');
  });
});

