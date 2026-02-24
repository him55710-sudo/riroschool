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
    let adminConfig = await shared_1.prisma.adminConfig.findUnique({ where: { id: "singleton" } });
    if (!adminConfig) {
        adminConfig = await shared_1.prisma.adminConfig.create({ data: { id: "singleton", activePromptVersion: "v1" } });
    }
    let prompt = "";
    if (adminConfig.activePromptVersion === "v2") {
        const { getWritePromptV2 } = await Promise.resolve().then(() => __importStar(require("shared")));
        prompt = getWritePromptV2(job, contextText);
    }
    else {
        const { getWritePromptV1 } = await Promise.resolve().then(() => __importStar(require("shared")));
        prompt = getWritePromptV1(job, contextText);
    }
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
