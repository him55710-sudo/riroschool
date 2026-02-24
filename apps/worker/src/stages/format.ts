import { Job, prisma, Artifact } from "shared";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Default Minimal Theme
const THEME_MINIMAL = `
  body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }
  h1, h2, h3 { color: #111; margin-top: 2rem; }
  .cover-page { text-align: center; margin-bottom: 5rem; padding-top: 5rem; }
  .references { margin-top: 4rem; border-top: 1px solid #eee; padding-top: 2rem; }
  table { width: 100%; border-collapse: collapse; margin: 2rem 0; page-break-inside: avoid; }
  th, td { border: 1px solid #ddd; padding: 0.75rem; text-align: left; }
  th { background-color: #f9f9f9; }
  .diagram-container { margin: 2rem 0; text-align: center; page-break-inside: avoid; }
`;

const THEME_ACADEMIC = `
  body { font-family: 'Times New Roman', serif; line-height: 1.8; color: #000; max-width: 800px; margin: 0 auto; padding: 2rem; }
  h1, h2, h3 { font-family: 'Arial', sans-serif; color: #222; }
  .cover-page { text-align: center; margin-bottom: 5rem; padding-top: 5rem; border-bottom: 2px solid #000; }
  table { width: 100%; border-collapse: collapse; border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 2rem 0; page-break-inside: avoid; }
  th, td { border-bottom: 1px solid #ddd; padding: 0.5rem; text-align: left; }
  .diagram-container { margin: 2rem 0; text-align: center; border: 1px solid #ccc; padding: 1rem; page-break-inside: avoid; }
`;

export async function formatReport(job: Job, draftArtifact: Artifact) {
  console.log(`[FORMAT] Formatting report for '${job.topic}'`);

  const htmlContent = marked.parse(draftArtifact.metadata || "");
  // Sanitize, but allow mermaid class and markdown elements
  const safeHtml = purify.sanitize(htmlContent as string, {
    ADD_TAGS: ['div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ADD_ATTR: ['class']
  });

  const selectedTheme = job.language === 'ko' ? THEME_MINIMAL : THEME_ACADEMIC; // temporary logic for theme picking

  const fullHtml = `
<!DOCTYPE html>
<html lang="${job.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${job.topic}</title>
    <style>
      ${selectedTheme}
      /* Ensure code blocks meant for Mermaid don't look broken before render */
      pre > code.language-mermaid { display: none; }
    </style>
    <!-- Load Mermaid.js -->
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: true, theme: 'default' });
      
      // Auto-convert standard codeblocks into mermaid divs
      document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('code.language-mermaid').forEach(el => {
           const pre = el.parentElement;
           const div = document.createElement('div');
           div.className = 'mermaid diagram-container';
           div.textContent = el.textContent;
           pre.replaceWith(div);
        });
      });
    </script>
</head>
<body>
    <div class="cover-page">
      <h1>${job.topic}</h1>
      <p>A Comprehensive Quality Report</p>
      <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="content">
      ${safeHtml}
    </div>
</body>
</html>
  `;

  const finalArtifact = await prisma.artifact.create({
    data: {
      jobId: job.id,
      type: "HTML_REPORT",
      storageKey: `local://final/${job.id}.html`,
      metadata: fullHtml,
      url: `/dashboard/reports/${job.id}`
    }
  });

  console.log(`[FORMAT] HTML Document saved. ID: ${finalArtifact.id}`);
  return finalArtifact;
}
