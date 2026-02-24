"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runQAGate = runQAGate;
const shared_1 = require("shared");
async function runQAGate(job, rawArtifact) {
    console.log(`[QA] Running detailed QA filters for '${job.topic}'`);
    let text = rawArtifact.metadata || "";
    const warnings = [];
    let piiCount = 0;
    // 1. Basic PII Masking (SSN, Phone numbers, Emails)
    // Simplified regex for Korean/General contexts
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const phoneRegex = /(01(?:0|1|[6-9])[-]?\d{3,4}[-]?\d{4})/g;
    const ssnRegex = /(\d{6}[-]\d{7})/g;
    text = text.replace(emailRegex, () => { piiCount++; return "[EMAIL MASKED]"; });
    text = text.replace(phoneRegex, () => { piiCount++; return "[PHONE MASKED]"; });
    text = text.replace(ssnRegex, () => { piiCount++; return "[SSN MASKED]"; });
    // 2. Hallucination Risk Checks
    // Check if there are explicit markers for missing citations left by the model
    const missingCitationRegex = /\[추가 확인 필요\]/g;
    const missingCitations = (text.match(missingCitationRegex) || []).length;
    if (missingCitations > 0) {
        warnings.push(`Found ${missingCitations} instances of unverified claims needing citation.`);
    }
    // Check if no Mermaid diagrams exist
    if (!text.includes("```mermaid")) {
        warnings.push("No Mermaid diagrams generated. Failed visual requirement.");
    }
    const score = Math.max(0, 100 - (missingCitations * 10) - (text.includes("```mermaid") ? 0 : 20));
    const report = {
        score,
        piiMasked: piiCount,
        hallucinationWarnings: warnings,
        safeHtml: text // We pass this modified text down
    };
    // Save the QA report as a separate artifact for auditing
    await shared_1.prisma.artifact.create({
        data: {
            jobId: job.id,
            type: "QA_REPORT",
            storageKey: `local://qa/${job.id}.json`,
            metadata: JSON.stringify(report, null, 2)
        }
    });
    // Return the new, masked text as an artifact for Formatting
    const maskedArtifact = await shared_1.prisma.artifact.create({
        data: {
            jobId: job.id,
            type: "SAFE_DRAFT_MD",
            storageKey: `local://drafts/${job.id}-qa_passed.md`,
            metadata: text
        }
    });
    console.log(`[QA] Gate completed with score: ${score}`);
    return maskedArtifact;
}
