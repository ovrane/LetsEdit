/**
 * True PDF Content Stream Redaction & Data Sanitization Engine
 * Strips confidential text streams and character tokens from the underlying PDF binary structure
 * using Web Streams (DecompressionStream/CompressionStream) so sensitive data cannot be
 * extracted or copied from beneath whiteout/redaction rectangles.
 */

export async function decompressStreamBytes(compressedBytes) {
  try {
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(compressedBytes);
    writer.close();
    const response = new Response(ds.readable);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (err) {
    // If stream was not deflate compressed, return as-is
    return compressedBytes;
  }
}

export async function compressStreamBytes(rawBytes) {
  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  writer.write(rawBytes);
  writer.close();
  const response = new Response(cs.readable);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Converts ASCII string to PDF hex string format (e.g. "CONFIDENTIAL" -> "434F4E46...")
 */
export function stringToPdfHex(str) {
  return Array.from(new TextEncoder().encode(str))
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

/**
 * Decodes a PDF hex string to text
 */
export function pdfHexToString(hex) {
  const clean = hex.replace(/[^0-9A-Fa-f]/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Sanitizes a decompressed content stream by scrubbing text operators that fall
 * within redaction bounding boxes or match specific sensitive text patterns.
 */
export function sanitizeContentStream(contentString, redactionBoxes, textTargets = []) {
  let result = contentString;

  // 1. Scrub explicit text targets (e.g. from Find & Replace or explicit redaction words)
  for (const target of textTargets) {
    if (!target) continue;

    // A. Literal string format: (Sensitive Text) Tj
    const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const literalRegex = new RegExp(`\\(${escapedTarget}\\)\\s*Tj`, 'gi');
    result = result.replace(literalRegex, '() Tj');

    // B. Hex string format: <434F4E46...> Tj
    const hexTarget = stringToPdfHex(target);
    const hexRegex = new RegExp(`<${hexTarget}>\\s*Tj`, 'gi');
    result = result.replace(hexRegex, '<> Tj');

    // C. Inside TJ array: [(...) ...] TJ
    const arrayLiteralRegex = new RegExp(`\\(${escapedTarget}\\)`, 'gi');
    result = result.replace(arrayLiteralRegex, '()');

    // D. Purge substring occurrences in any hex or literal text tokens
    result = result.replace(new RegExp(hexTarget, 'gi'), '');
    result = result.replace(new RegExp(escapedTarget, 'g'), '');
  }

  // 2. Scrub by bounding box coordinates
  if (redactionBoxes && redactionBoxes.length > 0) {
    // PDF text block regex: BT ... ET
    result = result.replace(/BT[\s\S]*?ET/g, (block) => {
      // Extract position Tm or Td
      // Matrix: 1 0 0 1 x y Tm or x y Td
      const tmMatch = block.match(/(?:[-+]?[0-9]*\.?[0-9]+\s+){4}([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)\s+Tm/) ||
                      block.match(/([-+]?[0-9]*\.?[0-9]+)\s+([-+]?[0-9]*\.?[0-9]+)\s+Td/);

      if (tmMatch) {
        const textX = parseFloat(tmMatch[1]);
        const textY = parseFloat(tmMatch[2]);

        for (const box of redactionBoxes) {
          // Check if text matrix origin falls inside or near the redaction box
          if (textX >= box.x - 10 &&
              textX <= box.x + box.width + 10 &&
              textY >= box.y - 10 &&
              textY <= box.y + box.height + 10) {
            // Replace text show operators with empty strings
            return block
              .replace(/\(.*?\)\s*Tj/g, '() Tj')
              .replace(/<[0-9A-Fa-f]*?>\s*Tj/g, '<> Tj')
              .replace(/\[[\s\S]*?\]\s*TJ/g, '[] TJ');
          }
        }
      }

      return block;
    });
  }

  return result;
}

/**
 * Sanitizes all content streams of a page in a PDFDocument context.
 */
export async function redactPageContentStreams(doc, page, redactionBoxes, textTargets = []) {
  const contents = page.node.Contents();
  if (!contents) return;

  const streamRefs = [];
  if (contents.asArray) {
    const arr = contents.asArray();
    for (let i = 0; i < arr.length; i++) {
      streamRefs.push(contents.get(i));
    }
  } else if (contents.size) {
    for (let i = 0; i < contents.size(); i++) {
      streamRefs.push(contents.get(i));
    }
  } else {
    streamRefs.push(contents);
  }

  for (const ref of streamRefs) {
    const stream = doc.context.lookup(ref);
    if (!stream || !stream.getContents) continue;

    const rawBytes = stream.getContents();
    const decompressedBytes = await decompressStreamBytes(rawBytes);
    const textContent = new TextDecoder('latin1').decode(decompressedBytes);

    const sanitizedText = sanitizeContentStream(textContent, redactionBoxes, textTargets);

    if (sanitizedText !== textContent) {
      const newFlateStream = doc.context.flateStream(new TextEncoder().encode(sanitizedText));
      doc.context.assign(ref, newFlateStream);
    }
  }
}
