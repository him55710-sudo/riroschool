"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDraft = generateDraft;
const shared_1 = require("shared");
const generative_ai_1 = require("@google/generative-ai");
async function generateDraft(job) {
    console.log(`[WRITE] Generating draft for '${job.topic}'`);
    const sources = await shared_1.prisma.source.findMany({ where: { jobId: job.id } });
    if (sources.length === 0) {
        throw new Error("No sources found for this job. Cannot write report without grounding.");
    }
    // Build the context string with explicit Source IDs
    let contextText = "AVAILABLE SOURCES FOR RESEARCH:\n";
    sources.forEach((s, idx) => {
        // 1-indexed citations
        contextText += `\n--- SOURCE [${idx + 1}] ---\nTitle: ${s.title}\nURL: ${s.url}\nContent Snippet:\n${s.notes}\n`;
    });
    const prompt = `
You are an expert report writer and researcher.
Write a comprehensive, professional report on the topic: "${job.topic}".
Language: ${job.language}
Target length tier: ${job.tier === "FREE" ? "Short (approx 1-3 pages)" : job.tier === "PAID_TIER_1" ? "Medium (approx 5-10 pages)" : "Long (approx 10-20 pages)"}

CRITICAL RULES:
1. FACTUAL GROUNDING & CITATIONS:
   - You MUST use the provided sources.
   - For EVERY factual claim, statistic, or argument derived from the sources, append an inline citation using brackets like [1], [2].
   - If a claim has no citation, write "[추가 확인 필요]" next to it.
2. VISUALS (DIAGRAMS & TABLES):
   - You MUST include at least ONE Markdown table comparing key concepts or data.
   - You MUST include at least ONE Mermaid.js diagram (state diagram, flowchart, or gantt) to visualize a process, relationship, or architecture.
   - Format Mermaid code exactly like this (without 'mermaid' language tag inside if it breaks markdown renderers, just standard \`\`\`mermaid\n code \n\`\`\`):
     \`\`\`mermaid
     graph TD;
     A-->B;
     \`\`\`
3. FORMATTING:
   - Use clear markdown headers (H1 for title, H2, H3).
   - Use professional and persuasive tone.

${contextText}

Generate the final markdown document below:
`;
    const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    let markdown = result.response.text();
    // Remove any HTML wrapper code blocks if Gemini produces them around the whole doc
    markdown = markdown.replace(/^```html\n|```$/g, "").trim();
    // Append References Section
    markdown += `\n\n## References\n\n`;
    sources.forEach((s, idx) => {
        markdown += `${idx + 1}. **${s.title}**. Accessed via [Link](${s.url})\n`;
    });
    const artifact = await shared_1.prisma.artifact.create({
        data: {
            jobId: job.id,
            type: "RAW_DRAFT_MD",
            storageKey: `local://drafts/${job.id}.md`,
            metadata: markdown
        }
    });
    console.log(`[WRITE] Draft generated. Artifact ID: ${artifact.id}`);
    return artifact;
}
