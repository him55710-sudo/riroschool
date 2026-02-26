import { Job, prisma } from "shared";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildFallbackMarkdown(job: Job, sources: any[]) {
  const topSources = sources.slice(0, 6);
  const sourceSummary = topSources
    .map((s, idx) => `${idx + 1}. ${s.title} (${s.url})`)
    .join("\n");

  return `# ${job.topic}

## 1. Overview
This document is a fallback draft generated when the AI model key is not available.
It provides a stable structure so users can still receive output in local development.

## 2. Core context
- Summarize the current context of the topic.
- Organize expected effects and practical constraints.
- Separate short-term and long-term implications.

## 3. Execution framework
\`\`\`mermaid
flowchart LR
    A[Define problem] --> B[Collect references]
    B --> C[Write draft]
    C --> D[Run QA]
    D --> E[Finalize report]
\`\`\`

## 4. Suggested actions
1. Immediate: pick 2-3 practical actions.
2. Mid-term: define measurable checkpoints.
3. Long-term: standardize process and policy.

## References
${sourceSummary || "1. Fallback source list unavailable."}
`;
}

export async function generateDraft(job: Job) {
  console.log(`[WRITE] Generating draft for '${job.topic}'`);

  const sources = await prisma.source.findMany({ where: { jobId: job.id } });
  if (sources.length === 0) {
    throw new Error("No sources found for this job. Cannot write report without grounding.");
  }

  let contextText = "AVAILABLE SOURCES FOR RESEARCH:\n";
  sources.forEach((s: any, idx: number) => {
    contextText += `\n--- SOURCE [${idx + 1}] ---\nTitle: ${s.title}\nURL: ${s.url}\nContent Snippet:\n${s.notes}\n`;
  });

  let adminConfig = await prisma.adminConfig.findUnique({ where: { id: "singleton" } });
  if (!adminConfig) {
    adminConfig = await prisma.adminConfig.create({ data: { id: "singleton", activePromptVersion: "v1" } });
  }

  let prompt = "";
  if (adminConfig.activePromptVersion === "v2") {
    const { getWritePromptV2 } = await import("shared");
    prompt = getWritePromptV2(job, contextText);
  } else {
    const { getWritePromptV1 } = await import("shared");
    prompt = getWritePromptV1(job, contextText);
  }

  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const useFallback = !geminiApiKey || geminiApiKey.toLowerCase().includes("your_gemini_api_key_here");

  let markdown = "";
  if (useFallback) {
    console.warn("[WRITE] GEMINI_API_KEY is missing. Using fallback markdown generator.");
    markdown = buildFallbackMarkdown(job, sources);
  } else {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const result = await model.generateContent(prompt);
    markdown = result.response.text();
  }

  markdown = markdown.replace(/^```html\n|```$/g, "").trim();

  markdown += `\n\n## References\n\n`;
  sources.forEach((s: any, idx: number) => {
    markdown += `${idx + 1}. **${s.title}**. Accessed via [Link](${s.url})\n`;
  });

  const artifact = await prisma.artifact.create({
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
