"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatReport = formatReport;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const shared_1 = require("shared");
const marked_1 = require("marked");
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const window = new jsdom_1.JSDOM("").window;
const purify = (0, dompurify_1.default)(window);
const STORAGE_ROOT = path_1.default.resolve(process.cwd(), "../../.storage");
const THEME_KOREAN = `
  :root {
    --ink: #0f172a;
    --sub: #334155;
    --line: #d9e4fb;
    --paper: #f8fbff;
    --primary: #1d4ed8;
    --primary-soft: #eaf2ff;
  }
  body {
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
    line-height: 1.8;
    color: var(--ink);
    max-width: 880px;
    margin: 0 auto;
    padding: 2.2rem;
    background:
      radial-gradient(circle at 0% 0%, #f2f7ff 0%, rgba(242,247,255,0) 55%),
      radial-gradient(circle at 100% 0%, #eef4ff 0%, rgba(238,244,255,0) 58%),
      #ffffff;
  }
  .paper {
    background: linear-gradient(180deg, #ffffff 0%, var(--paper) 100%);
    border: 1px solid var(--line);
    border-radius: 22px;
    padding: 28px 30px;
    box-shadow: 0 12px 30px rgba(29, 78, 216, 0.08);
  }
  .cover-page {
    text-align: center;
    margin-bottom: 2.4rem;
    padding: 2.4rem 1.4rem;
    border-radius: 20px;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fbff 68%, #ffffff 100%);
    border: 1px solid var(--line);
  }
  .cover-topic {
    margin: 0;
    font-size: 2rem;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }
  .cover-sub {
    margin-top: 0.65rem;
    color: var(--sub);
    font-weight: 600;
  }
  .cover-meta {
    margin-top: 0.35rem;
    color: #64748b;
    font-size: 0.92rem;
  }
  h1, h2, h3 {
    color: var(--ink);
    line-height: 1.34;
    letter-spacing: -0.01em;
  }
  h1 { font-size: 2rem; margin-top: 0.2rem; }
  h2 {
    margin-top: 2rem;
    padding: 0.44rem 0.76rem;
    border-left: 4px solid var(--primary);
    border-radius: 0.7rem;
    background: var(--primary-soft);
    font-size: 1.26rem;
  }
  h3 { margin-top: 1.4rem; font-size: 1.04rem; }
  p, li {
    color: var(--sub);
    font-size: 0.98rem;
  }
  ul, ol { padding-left: 1.35rem; }
  blockquote {
    margin: 1rem 0;
    border-left: 4px solid #93c5fd;
    background: #eff6ff;
    border-radius: 0.75rem;
    padding: 0.72rem 0.9rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.6rem 0;
    page-break-inside: avoid;
    border-radius: 12px;
    overflow: hidden;
  }
  th, td {
    border: 1px solid var(--line);
    padding: 0.68rem 0.7rem;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #eaf2ff;
    color: #0b3f9a;
    font-weight: 700;
  }
  .diagram-container {
    margin: 1.7rem 0;
    text-align: center;
    page-break-inside: avoid;
    border-radius: 12px;
    border: 1px dashed #b7ccf5;
    background: #f8fbff;
    padding: 1rem;
  }
  code {
    background: #eef4ff;
    border: 1px solid #dbe7ff;
    border-radius: 6px;
    padding: 0.12rem 0.32rem;
    font-family: 'Consolas', monospace;
  }
  hr {
    border: none;
    border-top: 1px solid #dbe7ff;
    margin: 1.8rem 0;
  }
  @page {
    size: A4;
    margin: 14mm 12mm;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .paper { border: none; box-shadow: none; padding: 0; }
    .cover-page { break-after: page; }
  }
`;
const THEME_ENGLISH = `
  body {
    font-family: 'Times New Roman', serif;
    line-height: 1.8;
    color: #111827;
    max-width: 860px;
    margin: 0 auto;
    padding: 2rem;
  }
  .paper { border: 1px solid #d1d5db; padding: 24px; border-radius: 14px; }
  .cover-page { text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #111827; }
  h1, h2, h3 { font-family: 'Arial', sans-serif; color: #111827; }
  table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; page-break-inside: avoid; }
  th, td { border: 1px solid #d1d5db; padding: 0.52rem; text-align: left; }
  .diagram-container { margin: 1.5rem 0; text-align: center; border: 1px solid #d1d5db; padding: 0.8rem; page-break-inside: avoid; }
  @page { size: A4; margin: 14mm 12mm; }
`;
function normalizeLanguage(language) {
    const value = (language || "").toLowerCase();
    const isKorean = value.includes("korean") || value.includes("ko") || value.includes("kr") || value.includes("한국");
    return {
        isKorean,
        htmlLang: isKorean ? "ko" : "en",
    };
}
function ensureStoragePath(jobId) {
    const dir = path_1.default.join(STORAGE_ROOT, jobId);
    fs_1.default.mkdirSync(dir, { recursive: true });
    return dir;
}
async function generatePdfArtifact(job, fullHtml) {
    const { chromium } = await Promise.resolve().then(() => __importStar(require("playwright")));
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
        await page.setContent(fullHtml, { waitUntil: "networkidle" });
        // Give Mermaid and layout scripts a short window to finish rendering.
        await page.waitForTimeout(1400);
        await page
            .waitForFunction(() => {
            const nodes = document.querySelectorAll(".mermaid");
            if (nodes.length === 0)
                return true;
            return Array.from(nodes).every((node) => node.querySelector("svg"));
        }, { timeout: 8000 })
            .catch(() => undefined);
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
        });
        const filename = `${job.id}.pdf`;
        const dir = ensureStoragePath(job.id);
        const filePath = path_1.default.join(dir, filename);
        fs_1.default.writeFileSync(filePath, pdfBuffer);
        const storageKey = `local://${job.id}/${filename}`;
        const pdfUrl = `/api/jobs/download?id=${job.id}`;
        const existing = await shared_1.prisma.artifact.findFirst({
            where: { jobId: job.id, type: "PDF_REPORT" },
            orderBy: { id: "desc" },
            select: { id: true },
        });
        if (existing) {
            await shared_1.prisma.artifact.update({
                where: { id: existing.id },
                data: {
                    storageKey,
                    url: pdfUrl,
                    metadata: JSON.stringify({ bytes: pdfBuffer.byteLength }),
                },
            });
            return;
        }
        await shared_1.prisma.artifact.create({
            data: {
                jobId: job.id,
                type: "PDF_REPORT",
                storageKey,
                url: pdfUrl,
                metadata: JSON.stringify({ bytes: pdfBuffer.byteLength }),
            },
        });
    }
    finally {
        await browser.close();
    }
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
    const subtitle = lang.isKorean ? "고품질 포트폴리오 분석 보고서" : "High-Quality Portfolio Analysis Report";
    const generatedAtLabel = lang.isKorean ? "생성 일시" : "Generated";
    const generatedAt = new Date().toLocaleString(lang.isKorean ? "ko-KR" : "en-US");
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
  <article class="paper">
    <div class="cover-page">
      <h1 class="cover-topic">${job.topic}</h1>
      <p class="cover-sub">${subtitle}</p>
      <p class="cover-meta">${generatedAtLabel}: ${generatedAt}</p>
    </div>
    <div class="content">
      ${safeHtml}
    </div>
  </article>
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
    void generatePdfArtifact(job, fullHtml)
        .then(() => {
        console.log(`[FORMAT] PDF document saved for job ${job.id}`);
    })
        .catch((error) => {
        const message = error instanceof Error ? error.message : "unknown error";
        console.warn(`[FORMAT] PDF generation skipped for ${job.id}: ${message}`);
    });
    console.log(`[FORMAT] HTML Document saved. ID: ${finalArtifact.id}`);
    return finalArtifact;
}
