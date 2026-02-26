"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatReport = formatReport;
const shared_1 = require("shared");
const marked_1 = require("marked");
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const window = new jsdom_1.JSDOM("").window;
const purify = (0, dompurify_1.default)(window);
const THEME_KOREAN = `
  body {
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
    line-height: 1.75;
    color: #1f2937;
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem;
  }
  h1, h2, h3 { color: #0f172a; margin-top: 2rem; line-height: 1.35; }
  p, li { font-size: 0.98rem; }
  .cover-page { text-align: center; margin-bottom: 5rem; padding-top: 4rem; }
  .references { margin-top: 4rem; border-top: 1px solid #dbe3f3; padding-top: 2rem; }
  table { width: 100%; border-collapse: collapse; margin: 2rem 0; page-break-inside: avoid; }
  th, td { border: 1px solid #d4dce8; padding: 0.75rem; text-align: left; vertical-align: top; }
  th { background-color: #eef4ff; }
  .diagram-container { margin: 2rem 0; text-align: center; page-break-inside: avoid; }
`;
const THEME_ENGLISH = `
  body {
    font-family: 'Times New Roman', serif;
    line-height: 1.8;
    color: #000;
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem;
  }
  h1, h2, h3 { font-family: 'Arial', sans-serif; color: #111827; }
  .cover-page { text-align: center; margin-bottom: 5rem; padding-top: 4rem; border-bottom: 2px solid #000; }
  table { width: 100%; border-collapse: collapse; border-top: 2px solid #000; border-bottom: 2px solid #000; margin: 2rem 0; page-break-inside: avoid; }
  th, td { border-bottom: 1px solid #ddd; padding: 0.5rem; text-align: left; }
  .diagram-container { margin: 2rem 0; text-align: center; border: 1px solid #ccc; padding: 1rem; page-break-inside: avoid; }
`;
function normalizeLanguage(language) {
    const value = (language || "").toLowerCase();
    const isKorean = value.includes("korean") || value.includes("ko") || value.includes("kr") || value.includes("한국");
    return {
        isKorean,
        htmlLang: isKorean ? "ko" : "en",
    };
}
async function formatReport(job, draftArtifact) {
    console.log(`[FORMAT] Formatting report for '${job.topic}'`);
    const htmlContent = marked_1.marked.parse(draftArtifact.metadata || "");
    const safeHtml = purify.sanitize(htmlContent, {
        ADD_TAGS: ["div", "table", "thead", "tbody", "tr", "th", "td"],
        ADD_ATTR: ["class"],
    });
    const lang = normalizeLanguage(job.language);
    const selectedTheme = lang.isKorean ? THEME_KOREAN : THEME_ENGLISH;
    const subtitle = lang.isKorean ? "종합 품질 보고서" : "Comprehensive Quality Report";
    const generatedAtLabel = lang.isKorean ? "생성 일시" : "Generated";
    const generatedAt = new Date().toLocaleDateString(lang.isKorean ? "ko-KR" : "en-US");
    const fullHtml = `
<!DOCTYPE html>
<html lang="${lang.htmlLang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${job.topic}</title>
    <style>
      ${selectedTheme}
      pre > code.language-mermaid { display: none; }
    </style>
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: true, theme: 'default' });

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
      <p>${subtitle}</p>
      <p>${generatedAtLabel}: ${generatedAt}</p>
    </div>
    <div class="content">
      ${safeHtml}
    </div>
</body>
</html>
  `;
    const finalArtifact = await shared_1.prisma.artifact.create({
        data: {
            jobId: job.id,
            type: "HTML_REPORT",
            storageKey: `local://final/${job.id}.html`,
            metadata: fullHtml,
            url: `/api/jobs/result?id=${job.id}`,
        },
    });
    console.log(`[FORMAT] HTML Document saved. ID: ${finalArtifact.id}`);
    return finalArtifact;
}
