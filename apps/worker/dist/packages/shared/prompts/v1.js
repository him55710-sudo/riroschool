"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWritePromptV1 = void 0;
const getWritePromptV1 = (job, contextText) => `
You are an expert report writer and researcher.
Write a comprehensive, professional report on the topic: "${job.topic}".
Language: ${job.language}
Target length tier: ${job.tier === "FREE" ? "Short (approx 1-3 pages)" : job.tier === "PRO_PACK" ? "Medium (approx 5-10 pages)" : "Long (approx 10-20 pages)"}

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
exports.getWritePromptV1 = getWritePromptV1;
