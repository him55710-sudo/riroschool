import { Job, prisma, Artifact } from "shared";

interface QualityReport {
    score: number;
    piiMasked: number;
    hallucinationWarnings: string[];
    safeHtml: string;
}

export async function runQAGate(job: Job, rawArtifact: Artifact): Promise<Artifact> {
    console.log(`[QA] Running detailed QA filters for '${job.topic}'`);

    let text = rawArtifact.metadata || "";
    const warnings: string[] = [];
    let piiCount = 0;

    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const phoneRegex = /(01(?:0|1|[6-9])[-]?\d{3,4}[-]?\d{4})/g;
    const ssnRegex = /(\d{6}[-]\d{7})/g;

    text = text.replace(emailRegex, () => {
        piiCount++;
        return "[EMAIL MASKED]";
    });
    text = text.replace(phoneRegex, () => {
        piiCount++;
        return "[PHONE MASKED]";
    });
    text = text.replace(ssnRegex, () => {
        piiCount++;
        return "[SSN MASKED]";
    });

    const missingCitationRegex = /\[(?:추가 확인 필요|UNVERIFIED_CLAIM|異붽? ?뺤씤 ?꾩슂)\]/g;
    const missingCitations = (text.match(missingCitationRegex) || []).length;

    if (missingCitations > 0) {
        warnings.push(`Found ${missingCitations} instances of unverified claims needing citation.`);
    }

    if (!text.includes("```mermaid")) {
        warnings.push("No Mermaid diagrams generated. Failed visual requirement.");
    }

    const score = Math.max(0, 100 - (missingCitations * 10) - (text.includes("```mermaid") ? 0 : 20));

    const report: QualityReport = {
        score,
        piiMasked: piiCount,
        hallucinationWarnings: warnings,
        safeHtml: text
    };

    await prisma.artifact.create({
        data: {
            jobId: job.id,
            type: "QA_REPORT",
            storageKey: `local://qa/${job.id}.json`,
            metadata: JSON.stringify(report, null, 2)
        }
    });

    const maskedArtifact = await prisma.artifact.create({
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
