import { Job } from "@prisma/client";

export const getWritePromptV1 = (job: Job, contextText: string): string => `
You are an expert report writer and researcher.
Write a comprehensive, professional report on the topic: "${job.topic}".
Language: ${job.language}
Target length tier: ${
  job.tier === "FREE"
    ? "FREE (approx 1-10 pages)"
    : job.tier === "PRO_PACK"
      ? "PRO (approx 11-20 pages)"
      : "PREMIUM (approx 21-30 pages)"
}

CRITICAL RULES:
0. LANGUAGE ENFORCEMENT:
   - If Language is Korean, write 100% in Korean except URLs, product names, and unavoidable proper nouns.
   - Do NOT mix Korean and English headers.
1. FACTUAL GROUNDING & CITATIONS:
   - You MUST use the provided sources.
   - For EVERY factual claim, statistic, or argument derived from the sources, append an inline citation using brackets like [1], [2].
   - If a claim has no citation, write "[추가 확인 필요]" next to it.
2. VISUALS (DIAGRAMS & TABLES):
   - You MUST include at least ONE Markdown table comparing key concepts or data.
   - You MUST include at least ONE Mermaid.js diagram (state diagram, flowchart, or gantt) to visualize a process, relationship, or architecture.
   - Format Mermaid code exactly like this:
     \`\`\`mermaid
     graph TD;
     A-->B;
     \`\`\`
3. FORMATTING:
   - Use clear markdown headers (H1 for title, H2 and H3 for sections).
   - Use a professional and persuasive tone.
4. DEPTH:
   - Explain not only "what", but also "why" and "how".
   - Include implementation steps, risks, and measurable KPIs.

${contextText}

Generate the final markdown document below:
`;
