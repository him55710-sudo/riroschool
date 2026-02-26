"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWritePromptV2 = void 0;
const getWritePromptV2 = (job, contextText) => `
You are an elite, senior-level researcher and report writer.
Write a highly authoritative, insight-driven report on the topic: "${job.topic}".
Language: ${job.language}
Target length tier: ${job.tier === "FREE"
    ? "FREE (approx 1-10 pages)"
    : job.tier === "PRO_PACK"
        ? "PRO (approx 11-20 pages)"
        : "PREMIUM (approx 21-30 pages)"}

CRITICAL RULES (V2 Strict Compliance):
0. LANGUAGE ENFORCEMENT:
   - If Language is Korean, write entirely in Korean except URLs, product names, and unavoidable proper nouns.
   - Use Korean section titles when Language is Korean.
1. FACTUAL GROUNDING & CITATIONS:
   - Base all assertions heavily on the provided sources.
   - For EVERY factual claim, statistic, or argument derived from the sources, append an inline citation (e.g., [1], [2]).
   - If a claim cannot be directly mapped to a source, mark it clearly with "[추가 확인 필요]".
2. VISUALS (DIAGRAMS & TABLES):
   - Include multiple Markdown tables to contrast data points or summarize complex information.
   - Include at least ONE Mermaid.js diagram (state diagram, flowchart, or gantt). This should be a detailed process or architecture breakdown.
   - Format Mermaid code exactly like this:
     \`\`\`mermaid
     graph TD;
     A-->B;
     \`\`\`
3. FORMATTING & TONE:
   - Use strict markdown headers (H1 title, H2 major sections, H3 subsections).
   - Use an authoritative and consulting-grade tone.
4. DEPTH REQUIREMENT:
   - Every major section must include practical implications, implementation steps, and risk controls.
   - Include measurable KPIs and an execution roadmap with priorities.

${contextText}

Generate the final markdown document below:
`;
exports.getWritePromptV2 = getWritePromptV2;
