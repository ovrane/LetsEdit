/**
 * Workflow Tool SEO Content Engine
 * Generates rich on-page semantic content (How-To guide, Feature Pillars,
 * Tool FAQs, and Related Tools Silo) rendered beneath the dropzone on Stage 1.
 * Provides high-intent keyword density and E-E-A-T signals for Googlebot.
 */

export function getToolSeoContentHtml(tool) {
  const t = tool || { title: 'PDF Tool', subtitle: 'Fast and private online PDF tool' };
  const toolName = t.title ? t.title.split('—')[0].split('.')[0].trim() : 'PDF Tool';

  return `
    <div class="workflow-seo-section" style="max-width: 980px; margin: 48px auto 0; padding: 0 16px;">
      <!-- Breadcrumbs -->
      <nav class="workflow-seo-breadcrumbs" aria-label="Breadcrumb" style="font-size: 13px; color: var(--text-muted); margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
        <a href="/" data-route="/" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Home</a>
        <span>/</span>
        <a href="/#landing-tools-section" data-route="/#landing-tools-section" style="color: var(--text-muted); text-decoration: none; font-weight: 500;">Tools</a>
        <span>/</span>
        <span style="color: var(--text-main); font-weight: 600;">${toolName}</span>
      </nav>

      <!-- How to Guide (Step-by-Step) -->
      <section class="workflow-seo-howto" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 32px 28px; margin-bottom: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        <h2 style="font-size: 22px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; text-align: center;">
          How to ${toolName} Online for Free
        </h2>
        <p style="font-size: 14px; color: var(--text-muted); text-align: center; max-width: 620px; margin: 0 auto 28px;">
          Follow these 3 simple steps to process your PDF files privately in your browser with zero cloud uploads.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
          <!-- Step 1 -->
          <div style="background: var(--bg-subtle, rgba(0,0,0,0.02)); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: ${t.color || 'var(--primary)'}18; color: ${t.color || 'var(--primary)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; margin-bottom: 14px;">1</div>
            <h3 style="font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">Select Your PDF</h3>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0;">
              Click "${t.buttonText || 'Choose PDF'}" or drag and drop your document into the box. You can also import from Google Drive or Dropbox.
            </p>
          </div>

          <!-- Step 2 -->
          <div style="background: var(--bg-subtle, rgba(0,0,0,0.02)); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: ${t.color || 'var(--primary)'}18; color: ${t.color || 'var(--primary)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; margin-bottom: 14px;">2</div>
            <h3 style="font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">Configure Settings</h3>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0;">
              Adjust tool options, page selections, reorder thumbnails, or customize settings with real-time browser preview.
            </p>
          </div>

          <!-- Step 3 -->
          <div style="background: var(--bg-subtle, rgba(0,0,0,0.02)); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: ${t.color || 'var(--primary)'}18; color: ${t.color || 'var(--primary)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; margin-bottom: 14px;">3</div>
            <h3 style="font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">Process & Download</h3>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin: 0;">
              Execute instant in-browser WebAssembly processing and save your finalized document directly to your device.
            </p>
          </div>
        </div>
      </section>

      <!-- Why Choose LetsEdit Feature Highlights -->
      <section class="workflow-seo-features" style="margin-bottom: 36px;">
        <h2 style="font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 18px; text-align: center;">
          Why Use LetsEdit for ${toolName}?
        </h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
            <div style="font-size: 22px; margin-bottom: 10px;">🔒</div>
            <h3 style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">100% Private & In-Browser</h3>
            <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5; margin: 0;">
              Zero cloud uploads. Your confidential files are processed entirely in client-side WebAssembly and never touch remote servers.
            </p>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
            <div style="font-size: 22px; margin-bottom: 10px;">⚡</div>
            <h3 style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">Sub-Second Execution</h3>
            <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5; margin: 0;">
              Zero upload lag or server queues. Process documents instantly at local hardware speeds without bandwidth limitations.
            </p>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
            <div style="font-size: 22px; margin-bottom: 10px;">🎁</div>
            <h3 style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">100% Free With No Paywalls</h3>
            <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5; margin: 0;">
              No 2-task hourly limits, no watermarks, and no mandatory registration. All premium tools are permanently available.
            </p>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px;">
            <div style="font-size: 22px; margin-bottom: 10px;">📄</div>
            <h3 style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">ISO 32000-1 Standards</h3>
            <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.5; margin: 0;">
              Strict vector PDF preservation. Output files remain 100% compatible with Adobe Acrobat, Apple Preview, and modern viewers.
            </p>
          </div>
        </div>
      </section>

      <!-- Frequently Asked Questions Accordion -->
      <section class="workflow-seo-faq" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 28px; margin-bottom: 36px;">
        <h2 style="font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 6px; text-align: center;">
          Frequently Asked Questions about ${toolName}
        </h2>
        <p style="font-size: 13.5px; color: var(--text-muted); text-align: center; margin-bottom: 24px;">
          Common questions about our client-side WebAssembly ${toolName} tool.
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <details style="background: var(--bg-subtle, rgba(0,0,0,0.02)); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px 18px;" open>
            <summary style="font-weight: 600; font-size: 14.5px; color: var(--text-main); cursor: pointer; user-select: none;">
              Is LetsEdit ${toolName} really free?
            </summary>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 10px 0 0; line-height: 1.5;">
              Yes, LetsEdit is 100% free with no hidden fees, subscriptions, or watermarks. Unlike competitors like Smallpdf or Sejda, we do not restrict you to 2 free tasks per hour.
            </p>
          </details>

          <details style="background: var(--bg-subtle, rgba(0,0,0,0.02)); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px 18px;">
            <summary style="font-weight: 600; font-size: 14.5px; color: var(--text-main); cursor: pointer; user-select: none;">
              Are my files safe and private when using this tool?
            </summary>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 10px 0 0; line-height: 1.5;">
              Yes, completely safe. LetsEdit executes 100% in your browser using WebAssembly. Your files, text, and data never leave your computer and are never uploaded to any cloud server or database.
            </p>
          </details>

          <details style="background: var(--bg-subtle, rgba(0,0,0,0.02)); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px 18px;">
            <summary style="font-weight: 600; font-size: 14.5px; color: var(--text-main); cursor: pointer; user-select: none;">
              Can I use this tool offline without an active internet connection?
            </summary>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 10px 0 0; line-height: 1.5;">
              Yes. Because the PDF engine runs inside your browser sandbox, you can disconnect from the internet or install LetsEdit as a desktop PWA application and process documents completely offline.
            </p>
          </details>

          <details style="background: var(--bg-subtle, rgba(0,0,0,0.02)); border: 1px solid var(--border-color); border-radius: 10px; padding: 14px 18px;">
            <summary style="font-weight: 600; font-size: 14.5px; color: var(--text-main); cursor: pointer; user-select: none;">
              What platforms and devices are supported?
            </summary>
            <p style="font-size: 13.5px; color: var(--text-muted); margin: 10px 0 0; line-height: 1.5;">
              LetsEdit works seamlessly on Windows, macOS, Linux, ChromeOS, iOS (iPhone/iPad), and Android across all modern browsers (Chrome, Edge, Firefox, Safari, and Brave).
            </p>
          </details>
        </div>
      </section>

      <!-- Related Tools Internal Linking Silo -->
      <section class="workflow-seo-related" style="margin-bottom: 48px; text-align: center;">
        <h3 style="font-size: 16px; font-weight: 600; color: var(--text-muted); margin-bottom: 16px;">
          Explore Complementary PDF Tools
        </h3>
        <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;">
          <a href="/edit_pdf" data-route="/edit_pdf" class="btn btn-outline btn-sm" style="border-radius: 20px; font-size: 12.5px; font-weight: 500; text-decoration: none;">✏ Edit PDF</a>
          <a href="/merge_pdf" data-route="/merge_pdf" class="btn btn-outline btn-sm" style="border-radius: 20px; font-size: 12.5px; font-weight: 500; text-decoration: none;">🔗 Merge PDF</a>
          <a href="/compress_pdf" data-route="/compress_pdf" class="btn btn-outline btn-sm" style="border-radius: 20px; font-size: 12.5px; font-weight: 500; text-decoration: none;">🗜 Compress PDF</a>
          <a href="/split_pdf" data-route="/split_pdf" class="btn btn-outline btn-sm" style="border-radius: 20px; font-size: 12.5px; font-weight: 500; text-decoration: none;">✂ Split PDF</a>
          <a href="/pdf_to_word" data-route="/pdf_to_word" class="btn btn-outline btn-sm" style="border-radius: 20px; font-size: 12.5px; font-weight: 500; text-decoration: none;">📄 PDF to Word</a>
          <a href="/sign_pdf" data-route="/sign_pdf" class="btn btn-outline btn-sm" style="border-radius: 20px; font-size: 12.5px; font-weight: 500; text-decoration: none;">✍ Sign PDF</a>
          <a href="/organize_pdf" data-route="/organize_pdf" class="btn btn-outline btn-sm" style="border-radius: 20px; font-size: 12.5px; font-weight: 500; text-decoration: none;">📑 Organize Pages</a>
        </div>
      </section>
    </div>
  `;
}
