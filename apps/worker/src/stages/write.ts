import { Job, prisma } from "shared";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateDraft(job: Job) {
  console.log(`[WRITE] Generating draft for '${job.topic}'`);

  const sources = await prisma.source.findMany({ where: { jobId: job.id } });
  if (sources.length === 0) {
    throw new Error("No sources found for this job. Cannot write report without grounding.");
  }

  // Build the context string with explicit Source IDs
  let contextText = "AVAILABLE SOURCES FOR RESEARCH:\n";
  sources.forEach((s: any, idx: number) => {
    // 1-indexed citations
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

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const result = await model.generateContent(prompt);
  let markdown = result.response.text();

  // Remove any HTML wrapper code blocks if Gemini produces them around the whole doc
  markdown = markdown.replace(/^```html\n|```$/g, "").trim();

  // Append References Section
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
