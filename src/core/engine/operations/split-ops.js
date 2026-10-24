/**
 * Split & Page Extraction Operations
 * Handles range splitting, split by size, split by bookmarks, extract every N pages,
 * split in half (book bisecting), and alternate mix (duplex scans).
 */

import { PDFDocument, PDFName, PDFArray } from 'pdf-lib';
import { decompressStreamBytes, pdfHexToString } from '../../pdf-redactor.js';

export class SplitOps {
  /**
   * Splits or extracts pages from a PDF based on a range expression.
   * e.g. "1-2, 3" -> generates separate documents.
   */
  static async splitPdf(rawBytes, rangeExpression, options = {}) {
    if (!rawBytes) throw new Error('No PDF loaded to split');

    if (options?.mode === 'text' || (typeof rangeExpression === 'string' && rangeExpression.startsWith('text:'))) {
      const textParam = options?.keyword || (typeof rangeExpression === 'string' ? rangeExpression.replace('text:', '') : '');
      return await SplitOps.splitByText(rawBytes, { keyword: textParam, ...options });
    }

    if (options?.mode === 'size' || (typeof rangeExpression === 'string' && rangeExpression.startsWith('size:'))) {
      const sizeParam = options?.maxBytes || parseInt(rangeExpression.replace('size:', ''), 10);
      return await SplitOps.splitBySize(rawBytes, sizeParam);
    }

    if (options?.mode === 'bookmarks' || rangeExpression === 'bookmarks') {
      return await SplitOps.splitByBookmarks(rawBytes);
    }

    if (options?.mode === 'every_n' || (typeof rangeExpression === 'string' && rangeExpression.startsWith('every:'))) {
      const nParam = options?.everyN || parseInt(rangeExpression.replace('every:', ''), 10);
      return await SplitOps.splitEveryN(rawBytes, nParam);
    }

    const sourceDoc = await PDFDocument.load(rawBytes);
    const totalPages = sourceDoc.getPageCount();

    if (!rangeExpression || rangeExpression.trim().toLowerCase() === 'all') {
      const results = [];
      for (let i = 0; i < totalPages; i++) {
        const subDoc = await PDFDocument.create();
        const [page] = await subDoc.copyPages(sourceDoc, [i]);
        subDoc.addPage(page);
        const bytes = await subDoc.save();
        results.push({
          name: `page_${i + 1}.pdf`,
          bytes,
          pageCount: 1,
          pages: `${i + 1}`
        });
      }
      return results;
    }

    const groups = rangeExpression.split(',').map(s => s.trim()).filter(Boolean);
    const results = [];

    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      const g = groups[gIdx];
      let pageIndices = [];
      if (g.includes('-')) {
        const [startStr, endStr] = g.split('-').map(s => s.trim());
        const start = Math.max(1, parseInt(startStr, 10));
        const end = Math.min(totalPages, parseInt(endStr, 10));
        for (let p = start; p <= end; p++) {
          pageIndices.push(p - 1);
        }
      } else {
        const p = parseInt(g, 10);
        if (p >= 1 && p <= totalPages) {
          pageIndices.push(p - 1);
        }
      }

      if (pageIndices.length > 0) {
        const subDoc = await PDFDocument.create();
        const pages = await subDoc.copyPages(sourceDoc, pageIndices);
        pages.forEach(pg => subDoc.addPage(pg));
        const bytes = await subDoc.save();
        results.push({
          name: `split_range_${g.replace(/\s+/g, '')}.pdf`,
          bytes,
          pageCount: pageIndices.length,
          pages: g
        });
      }
    }

    return results;
  }

  /**
   * Splits a PDF document into parts where each part is approximately or under target bytes.
   * Conforms to Sejda Split by Size specification.
   */
  static async splitBySize(rawBytes, maxBytes = 5242880) {
    if (!rawBytes) throw new Error('No PDF loaded to split');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const totalPages = sourceDoc.getPageCount();
    if (totalPages === 0) return [];

    const effectiveMax = Math.max(1024, Number(maxBytes) || 5242880);
    const results = [];
    let currentChunkPages = [];
    let partIndex = 1;

    for (let i = 0; i < totalPages; i++) {
      currentChunkPages.push(i);

      // Check current subDoc size
      const testDoc = await PDFDocument.create();
      const copied = await testDoc.copyPages(sourceDoc, currentChunkPages);
      copied.forEach(p => testDoc.addPage(p));
      const testBytes = await testDoc.save();

      if (testBytes.length > effectiveMax && currentChunkPages.length > 1) {
        // Exceeded limit: remove the last page and finalize previous chunk
        currentChunkPages.pop();
        const chunkDoc = await PDFDocument.create();
        const finalPages = await chunkDoc.copyPages(sourceDoc, currentChunkPages);
        finalPages.forEach(p => chunkDoc.addPage(p));
        const chunkBytes = await chunkDoc.save();

        const startNum = currentChunkPages[0] + 1;
        const endNum = currentChunkPages[currentChunkPages.length - 1] + 1;
        results.push({
          name: `part_${partIndex}_pages_${startNum}-${endNum}.pdf`,
          bytes: chunkBytes,
          pageCount: currentChunkPages.length,
          size: chunkBytes.length,
          pages: `${startNum}-${endNum}`
        });

        partIndex++;
        // Start next chunk with current page i
        currentChunkPages = [i];
      }
    }

    // Save final remaining chunk
    if (currentChunkPages.length > 0) {
      const chunkDoc = await PDFDocument.create();
      const finalPages = await chunkDoc.copyPages(sourceDoc, currentChunkPages);
      finalPages.forEach(p => chunkDoc.addPage(p));
      const chunkBytes = await chunkDoc.save();

      const startNum = currentChunkPages[0] + 1;
      const endNum = currentChunkPages[currentChunkPages.length - 1] + 1;
      results.push({
        name: `part_${partIndex}_pages_${startNum}-${endNum}.pdf`,
        bytes: chunkBytes,
        pageCount: currentChunkPages.length,
        size: chunkBytes.length,
        pages: `${startNum}-${endNum}`
      });
    }

    return results;
  }

  /**
   * Splits a PDF document by its bookmarks / table of contents outline.
   * Conforms to Sejda Split by Bookmarks specification.
   */
  static async splitByBookmarks(rawBytes) {
    if (!rawBytes) throw new Error('No PDF loaded to split');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const totalPages = sourceDoc.getPageCount();
    if (totalPages === 0) return [];

    const pageRefMap = new Map();
    sourceDoc.getPages().forEach((p, idx) => {
      pageRefMap.set(p.ref.toString(), idx);
    });

    const bookmarks = [];
    const outlinesRef = sourceDoc.catalog.get(PDFName.of('Outlines'));

    if (outlinesRef) {
      const outlinesDict = sourceDoc.context.lookup(outlinesRef);
      if (outlinesDict) {
        let curRef = outlinesDict.get(PDFName.of('First'));
        const visited = new Set();

        while (curRef && !visited.has(curRef.toString())) {
          visited.add(curRef.toString());
          const item = sourceDoc.context.lookup(curRef);
          if (!item) break;

          let title = 'Untitled Bookmark';
          const titleObj = item.get(PDFName.of('Title'));
          if (titleObj) {
            title = typeof titleObj.decodeText === 'function' ? titleObj.decodeText() : titleObj.toString();
          }

          let targetPageIndex = -1;
          const destObj = item.get(PDFName.of('Dest'));
          const actObj = item.get(PDFName.of('A'));

          const resolveDest = (d) => {
            const resolved = sourceDoc.context.lookup(d);
            if (Array.isArray(resolved?.asArray?.())) {
              const targetRef = resolved.asArray()[0];
              if (targetRef && pageRefMap.has(targetRef.toString())) {
                return pageRefMap.get(targetRef.toString());
              }
            } else if (resolved && pageRefMap.has(resolved.toString())) {
              return pageRefMap.get(resolved.toString());
            }
            return -1;
          };

          if (destObj) {
            targetPageIndex = resolveDest(destObj);
          } else if (actObj) {
            const actDict = sourceDoc.context.lookup(actObj);
            const actDest = actDict?.get?.(PDFName.of('D'));
            if (actDest) {
              targetPageIndex = resolveDest(actDest);
            }
          }

          if (targetPageIndex >= 0 && targetPageIndex < totalPages) {
            bookmarks.push({ title: title.trim(), pageIndex: targetPageIndex });
          }

          curRef = item.get(PDFName.of('Next'));
        }
      }
    }

    if (bookmarks.length === 0) {
      throw new Error('No bookmarks or table of contents found in this PDF document.');
    }

    bookmarks.sort((a, b) => a.pageIndex - b.pageIndex);

    const uniqueBookmarks = [];
    for (const bm of bookmarks) {
      if (!uniqueBookmarks.some(u => u.pageIndex === bm.pageIndex)) {
        uniqueBookmarks.push(bm);
      }
    }

    const results = [];

    if (uniqueBookmarks[0].pageIndex > 0) {
      const prefacePages = [];
      for (let p = 0; p < uniqueBookmarks[0].pageIndex; p++) prefacePages.push(p);
      const subDoc = await PDFDocument.create();
      const copied = await subDoc.copyPages(sourceDoc, prefacePages);
      copied.forEach(p => subDoc.addPage(p));
      const bytes = await subDoc.save();
      results.push({
        name: '00_Introduction.pdf',
        title: 'Introduction',
        bytes,
        pageCount: prefacePages.length,
        pages: `1-${uniqueBookmarks[0].pageIndex}`
      });
    }

    for (let i = 0; i < uniqueBookmarks.length; i++) {
      const curBm = uniqueBookmarks[i];
      const startP = curBm.pageIndex;
      const endP = (i + 1 < uniqueBookmarks.length) ? (uniqueBookmarks[i + 1].pageIndex - 1) : (totalPages - 1);

      const chapterPages = [];
      for (let p = startP; p <= endP; p++) chapterPages.push(p);

      if (chapterPages.length > 0) {
        const subDoc = await PDFDocument.create();
        const copied = await subDoc.copyPages(sourceDoc, chapterPages);
        copied.forEach(p => subDoc.addPage(p));
        const bytes = await subDoc.save();

        const safeTitle = curBm.title.replace(/[/\\?%*:|"<>]/g, '_').trim() || `Chapter_${i + 1}`;
        const prefix = String(i + 1).padStart(2, '0');
        results.push({
          name: `${prefix}_${safeTitle}.pdf`,
          title: curBm.title,
          bytes,
          pageCount: chapterPages.length,
          pages: `${startP + 1}-${endP + 1}`
        });
      }
    }

    return results;
  }

  /**
   * Splits a PDF document every N pages.
   * Conforms to Sejda Extract Every N Pages mode.
   */
  static async splitEveryN(rawBytes, n = 1) {
    if (!rawBytes) throw new Error('No PDF loaded to split');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const totalPages = sourceDoc.getPageCount();
    if (totalPages === 0) return [];

    const step = Math.max(1, parseInt(n, 10) || 1);
    const results = [];
    let chunkIndex = 1;

    for (let i = 0; i < totalPages; i += step) {
      const pageIndices = [];
      const end = Math.min(i + step, totalPages);
      for (let p = i; p < end; p++) pageIndices.push(p);

      const subDoc = await PDFDocument.create();
      const copied = await subDoc.copyPages(sourceDoc, pageIndices);
      copied.forEach(p => subDoc.addPage(p));
      const bytes = await subDoc.save();

      const startNum = i + 1;
      const endNum = end;
      results.push({
        name: step === 1 ? `page_${startNum}.pdf` : `chunk_${chunkIndex}_pages_${startNum}-${endNum}.pdf`,
        bytes,
        pageCount: pageIndices.length,
        pages: `${startNum}-${endNum}`
      });
      chunkIndex++;
    }

    return results;
  }

  /**
   * Slices each page down the middle (Sejda Split in Half tool).
   */
  static async splitInHalf(rawBytes, direction = 'vertical') {
    if (!rawBytes) throw new Error('No PDF loaded');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const finalDoc = await PDFDocument.create();
    const numPages = sourceDoc.getPageCount();

    for (let i = 0; i < numPages; i++) {
      const origPage = sourceDoc.getPage(i);
      const { width, height } = origPage.getSize();

      if (direction === 'horizontal') {
        const [topHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        topHalf.setCropBox(0, height / 2, width, height / 2);
        finalDoc.addPage(topHalf);

        const [bottomHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        bottomHalf.setCropBox(0, 0, width, height / 2);
        finalDoc.addPage(bottomHalf);
      } else {
        const [leftHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        leftHalf.setCropBox(0, 0, width / 2, height);
        finalDoc.addPage(leftHalf);

        const [rightHalf] = await finalDoc.copyPages(sourceDoc, [i]);
        rightHalf.setCropBox(width / 2, 0, width / 2, height);
        finalDoc.addPage(rightHalf);
      }
    }

    return await finalDoc.save();
  }

  /**
   * Alternates and mixes two PDF documents (e.g. duplex scanner scans).
   */
  static async alternateMix(docABytes, docBBytes, options = {}) {
    const docA = await PDFDocument.load(docABytes);
    const docB = await PDFDocument.load(docBBytes);
    const finalDoc = await PDFDocument.create();

    const countA = docA.getPageCount();
    const countB = docB.getPageCount();
    const reverseB = options.reverseB !== false;

    const indicesB = Array.from({ length: countB }, (_, i) => i);
    if (reverseB) indicesB.reverse();

    const maxCount = Math.max(countA, countB);

    for (let i = 0; i < maxCount; i++) {
      if (i < countA) {
        const [copiedA] = await finalDoc.copyPages(docA, [i]);
        finalDoc.addPage(copiedA);
      }
      if (i < countB) {
        const bIdx = indicesB[i];
        const [copiedB] = await finalDoc.copyPages(docB, [bIdx]);
        finalDoc.addPage(copiedB);
      }
    }

    return await finalDoc.save();
  }

  /**
   * Splits a PDF document by text keyword or regex pattern match / value change.
   * Conforms to Sejda Split by Text / Invoice Change specification.
   */
  static async splitByText(rawBytes, options = {}) {
    if (!rawBytes) throw new Error('No PDF loaded to split');
    const sourceDoc = await PDFDocument.load(rawBytes);
    const totalPages = sourceDoc.getPageCount();
    if (totalPages === 0) return [];

    const keyword = options.keyword || options.text || 'Invoice';
    const mode = options.mode || 'contains'; // 'contains' or 'change'
    const pattern = options.filenamePattern || '[text]_[n].pdf';

    // Extract text per page
    const pageTexts = [];
    if (Array.isArray(options.pageTexts) && options.pageTexts.length === totalPages) {
      for (const pt of options.pageTexts) pageTexts.push(String(pt || ''));
    } else {
      for (let i = 0; i < totalPages; i++) {
        const page = sourceDoc.getPage(i);
        const contentsRef = page.node.get(PDFName.of('Contents'));
        const textPieces = [];

        if (contentsRef) {
          const streamObjects = contentsRef instanceof PDFArray
            ? contentsRef.asArray()
            : (Array.isArray(contentsRef) ? contentsRef : [contentsRef]);
          for (const ref of streamObjects) {
            const stream = sourceDoc.context.lookup(ref);
            if (stream && stream.getContents) {
              let bytes = stream.getContents();
              try {
                const filter = stream.dict.get(PDFName.of('Filter'));
                if (filter && (filter.encodedName === '/FlateDecode' || filter === PDFName.of('FlateDecode'))) {
                  bytes = await decompressStreamBytes(bytes);
                }
              } catch (e) {}

              const textStr = new TextDecoder('latin1').decode(bytes);

              // Literal strings
              const literalMatches = textStr.match(/\(([^)]+)\)\s*(?:Tj|'|")/g) || [];
              for (const lm of literalMatches) {
                const cleaned = lm.replace(/^[('"]|[)'"]\s*(?:Tj)?$/g, '').trim();
                if (cleaned) textPieces.push(cleaned);
              }

              // Hex strings
              const hexMatches = textStr.match(/<([0-9a-fA-F]+)>\s*Tj/g) || [];
              for (const hm of hexMatches) {
                const hexVal = hm.replace(/[<>\sTj]/g, '');
                const decoded = pdfHexToString(hexVal);
                if (decoded && decoded.trim()) textPieces.push(decoded.trim());
              }

              // TJ array strings
              const tjMatches = textStr.match(/\[(.*?)\]\s*TJ/g) || [];
              for (const tm of tjMatches) {
                const inner = tm.replace(/^\[|\]\s*TJ$/g, '');
                const subLiterals = inner.match(/\(([^)]+)\)/g) || [];
                for (const sl of subLiterals) {
                  const c = sl.slice(1, -1).trim();
                  if (c) textPieces.push(c);
                }
              }
            }
          }
        }
        pageTexts.push(textPieces.join(' '));
      }
    }

    // Prepare regex matcher
    let regex;
    try {
      regex = keyword instanceof RegExp ? keyword : new RegExp(keyword, 'i');
    } catch {
      regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    // Partition into page chunks
    const chunks = [];
    let curChunk = [];
    let curMatchedValue = '';
    let lastSeenValue = null;

    for (let i = 0; i < totalPages; i++) {
      const pText = pageTexts[i] || '';
      const match = pText.match(regex);
      const matchedStr = match ? (match[1] || match[0]) : '';

      if (mode === 'change') {
        if (matchedStr && lastSeenValue !== null && matchedStr !== lastSeenValue && curChunk.length > 0) {
          chunks.push({ pages: [...curChunk], value: lastSeenValue });
          curChunk = [i];
          curMatchedValue = matchedStr;
          lastSeenValue = matchedStr;
        } else {
          curChunk.push(i);
          if (matchedStr) lastSeenValue = matchedStr;
          if (!curMatchedValue && matchedStr) curMatchedValue = matchedStr;
        }
      } else {
        // 'contains' mode: start new chunk whenever keyword appears (except at start of document)
        if (match && i > 0 && curChunk.length > 0) {
          chunks.push({ pages: [...curChunk], value: curMatchedValue });
          curChunk = [i];
          curMatchedValue = matchedStr;
        } else {
          curChunk.push(i);
          if (match && !curMatchedValue) curMatchedValue = matchedStr;
        }
      }
    }

    if (curChunk.length > 0) {
      chunks.push({ pages: [...curChunk], value: curMatchedValue || lastSeenValue || keyword });
    }

    // Generate sub-documents for each chunk
    const results = [];
    for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
      const chunk = chunks[cIdx];
      const subDoc = await PDFDocument.create();
      const copied = await subDoc.copyPages(sourceDoc, chunk.pages);
      copied.forEach(p => subDoc.addPage(p));
      const bytes = await subDoc.save();

      const startP = chunk.pages[0] + 1;
      const endP = chunk.pages[chunk.pages.length - 1] + 1;
      const cleanVal = (chunk.value || 'part').replace(/[/\\?%*:|"<>]/g, '_').trim();
      const nStr = String(cIdx + 1);

      let filename = pattern
        .replace(/\[text\]/gi, cleanVal)
        .replace(/\[n\]/gi, nStr)
        .replace(/\[pages\]/gi, `${startP}-${endP}`);
      if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';

      results.push({
        name: filename,
        bytes,
        pageCount: chunk.pages.length,
        pages: `${startP}-${endP}`,
        matchedValue: chunk.value
      });
    }

    return results;
  }
}
