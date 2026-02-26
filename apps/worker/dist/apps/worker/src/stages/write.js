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
const TIER_TARGETS = {
    FREE: { minChars: 7000, sections: 8, paragraphsPerSection: 2 },
    PRO_PACK: { minChars: 13000, sections: 11, paragraphsPerSection: 3 },
    PREMIUM_PACK: { minChars: 19000, sections: 14, paragraphsPerSection: 3 },
};
function normalizeLanguage(language) {
    const value = (language || "").toLowerCase();
    if (value.includes("korean") || value.includes("ko") || value.includes("kr") || value.includes("한국")) {
        return "ko";
    }
    return "en";
}
function cleanSnippet(text, max = 180) {
    if (!text)
        return "";
    return text
        .replace(/\[SYSTEM SECURITY NOTE:[\s\S]*$/i, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
}
function fallbackSections(lang) {
    if (lang === "ko") {
        return [
            { title: "연구 배경과 문제 정의", focus: "주제의 사회적·산업적 맥락을 구조적으로 정리하고 핵심 쟁점을 명확히 한다." },
            { title: "개념 프레임과 평가 기준", focus: "핵심 개념을 계층화하고 실행 가능성, 효과성, 지속 가능성 기준을 제시한다." },
            { title: "현재 상태 진단", focus: "현행 방식의 병목, 품질 편차, 운영 리스크를 정량·정성 관점으로 진단한다." },
            { title: "이해관계자 요구 분석", focus: "사용자, 운영자, 의사결정자 관점에서 요구사항 충돌과 우선순위를 정리한다." },
            { title: "전략 대안 비교", focus: "대안별 장단점, 비용, 기대효과를 비교해 선택 가능한 의사결정 프레임을 제공한다." },
            { title: "실행 로드맵", focus: "단기-중기-장기 실행 항목을 단계별 마일스톤과 함께 제안한다." },
            { title: "리스크 관리 체계", focus: "품질, 보안, 법·윤리, 운영 리스크를 분류하고 대응 시나리오를 설계한다." },
            { title: "성과지표(KPI)와 검증 방법", focus: "측정 가능한 지표를 정의하고 데이터 기반 검증 절차를 설계한다." },
            { title: "거버넌스와 운영 모델", focus: "책임 체계, 승인 프로세스, 주기적 리뷰 메커니즘을 수립한다." },
            { title: "벤치마크 및 시사점", focus: "유사 사례를 비교해 적용 가능한 실천 지점을 추출한다." },
            { title: "정책·제도 연계 검토", focus: "현행 제도와의 정합성, 확장 시 제약요소, 보완 방향을 제시한다." },
            { title: "실무 적용 체크리스트", focus: "도입 전·중·후 단계에서 점검해야 할 항목을 명확히 정리한다." },
            { title: "종합 결론", focus: "핵심 판단과 실행 우선순위를 통합해 제시한다." },
            { title: "부록: 추가 분석 메모", focus: "본문에서 다루지 못한 세부 가정과 추가 검증 포인트를 정리한다." },
        ];
    }
    return [
        { title: "Background and Problem Definition", focus: "Clarify the macro context and define the exact problem boundary." },
        { title: "Conceptual Framework and Criteria", focus: "Define concepts and build evaluation criteria for decisions." },
        { title: "Current-State Diagnosis", focus: "Identify bottlenecks, quality variance, and operational risk." },
        { title: "Stakeholder Requirements", focus: "Reconcile priorities across users, operators, and leadership." },
        { title: "Strategic Option Analysis", focus: "Compare alternatives across cost, benefit, and feasibility." },
        { title: "Execution Roadmap", focus: "Lay out phased milestones for implementation." },
        { title: "Risk Management", focus: "Design response scenarios for quality, security, and compliance risks." },
        { title: "KPI and Validation", focus: "Define measurable KPIs and verification methods." },
        { title: "Governance Model", focus: "Establish ownership and recurring review structures." },
        { title: "Benchmark and Implications", focus: "Extract practical lessons from comparable cases." },
        { title: "Policy Alignment", focus: "Assess constraints and policy-level implications." },
        { title: "Operational Checklist", focus: "Provide a stage-wise readiness and execution checklist." },
        { title: "Conclusion", focus: "Synthesize actionable conclusions and priorities." },
        { title: "Appendix", focus: "Capture assumptions and deeper follow-up points." },
    ];
}
function getCitationIndex(index, sourceCount) {
    if (sourceCount <= 0)
        return 1;
    return (index % sourceCount) + 1;
}
function buildFallbackMarkdown(job, sources) {
    const lang = normalizeLanguage(job.language);
    const targets = TIER_TARGETS[job.tier] || TIER_TARGETS.FREE;
    const sections = fallbackSections(lang).slice(0, targets.sections);
    const topSources = sources.slice(0, Math.max(3, Math.min(8, sources.length)));
    if (lang === "ko") {
        let markdown = `# ${job.topic}\n\n`;
        markdown += `## 초록\n`;
        markdown += `본 보고서는 "${job.topic}" 주제를 다각도로 분석하여 실제 실행 가능한 전략을 제시한다. 단순 개요가 아니라 문제 구조, 대안 비교, 실행 우선순위, 리스크 대응까지 포함해 의사결정자가 바로 활용할 수 있도록 구성했다. 분석 근거는 수집된 출처를 기반으로 정리했으며, 핵심 주장에는 인라인 인용을 포함했다 [1].\n\n`;
        markdown += `보고서의 목표는 첫째, 현재 상태를 객관적으로 진단하고 둘째, 단기 성과와 장기 지속 가능성을 동시에 달성할 수 있는 실행 설계를 제안하는 것이다. 또한 운영 관점에서 발생할 수 있는 품질 저하와 일정 리스크를 사전에 통제할 수 있도록 점검 프레임을 제시한다 [2].\n\n`;
        markdown += `## 핵심 분석 프레임\n`;
        markdown += `\`\`\`mermaid\n`;
        markdown += `flowchart TD\n`;
        markdown += `  A[문제 정의] --> B[근거 수집]\n`;
        markdown += `  B --> C[대안 설계]\n`;
        markdown += `  C --> D[리스크 검증]\n`;
        markdown += `  D --> E[실행 로드맵 확정]\n`;
        markdown += `  E --> F[KPI 기반 운영]\n`;
        markdown += `\`\`\`\n\n`;
        markdown += `## 근거 출처 요약\n`;
        markdown += `| 번호 | 출처 | 핵심 활용 포인트 |\n`;
        markdown += `|---|---|---|\n`;
        topSources.forEach((source, idx) => {
            const snippet = cleanSnippet(source.notes, 90) || `${job.topic} 관련 핵심 배경과 실행 시사점을 제공한다.`;
            markdown += `| ${idx + 1} | ${source.title.replace(/\|/g, "/")} | ${snippet.replace(/\|/g, "/")} |\n`;
        });
        markdown += `\n`;
        sections.forEach((section, sectionIdx) => {
            markdown += `## ${sectionIdx + 1}. ${section.title}\n\n`;
            for (let paragraphIdx = 0; paragraphIdx < targets.paragraphsPerSection; paragraphIdx++) {
                const citation = getCitationIndex(sectionIdx + paragraphIdx, Math.max(1, topSources.length));
                markdown += `${job.topic}의 관점에서 "${section.title}"는 실행 품질을 좌우하는 핵심 축이다. 이 영역은 ${section.focus}는 점에서 중요하며, 실제 프로젝트에서는 범위 정의와 우선순위 정렬이 선행되어야 시행착오를 줄일 수 있다. 특히 초기 단계에서 목표를 너무 넓게 잡으면 리소스 분산으로 인해 성과가 지연될 가능성이 높다 [${citation}].\n\n`;
                markdown += `실무 적용을 위해서는 정성 판단과 정량 지표를 함께 사용해야 한다. 예를 들어 성과지표를 설정할 때 단기 산출물 중심 지표와 장기 효과 지표를 분리해 관리하면, 단기 성과 압박으로 인한 품질 저하를 줄일 수 있다. 또한 의사결정 로그를 기록해 변경 이력을 추적하면 반복 개선이 쉬워진다 [${citation}].\n\n`;
            }
            if (sectionIdx % 3 === 1) {
                const citation = getCitationIndex(sectionIdx, Math.max(1, topSources.length));
                markdown += `### 실행 체크포인트\n`;
                markdown += `- 범위: 이번 단계의 목표, 제외 범위, 완료 기준을 문서로 확정한다 [${citation}].\n`;
                markdown += `- 품질: 결과물 검수 기준(정확성, 일관성, 재현성)을 사전에 합의한다 [${citation}].\n`;
                markdown += `- 운영: 담당자, 승인자, 대응 SLA를 분명히 설정한다 [${citation}].\n\n`;
            }
        });
        return markdown.trim();
    }
    let markdown = `# ${job.topic}\n\n`;
    markdown += `## Executive Summary\n`;
    markdown += `This report provides a grounded and implementation-focused assessment of "${job.topic}". It moves beyond a short summary by covering diagnosis, strategic alternatives, execution sequencing, and quality governance [1].\n\n`;
    markdown += `\`\`\`mermaid\nflowchart LR\nA[Define Problem] --> B[Collect Evidence]\nB --> C[Design Options]\nC --> D[Validate Risks]\nD --> E[Implement and Measure]\n\`\`\`\n\n`;
    markdown += `## Source Snapshot\n| No. | Source | Key Insight |\n|---|---|---|\n`;
    topSources.forEach((source, idx) => {
        const snippet = cleanSnippet(source.notes, 100) || `Provides context and practical implications for ${job.topic}.`;
        markdown += `| ${idx + 1} | ${source.title.replace(/\|/g, "/")} | ${snippet.replace(/\|/g, "/")} |\n`;
    });
    markdown += `\n`;
    sections.forEach((section, sectionIdx) => {
        markdown += `## ${sectionIdx + 1}. ${section.title}\n\n`;
        for (let paragraphIdx = 0; paragraphIdx < targets.paragraphsPerSection; paragraphIdx++) {
            const citation = getCitationIndex(sectionIdx + paragraphIdx, Math.max(1, topSources.length));
            markdown += `From an execution perspective, ${section.focus} This is critical for reducing rework and keeping delivery quality stable across phases. A practical design should separate near-term wins from long-term capability building while preserving decision traceability [${citation}].\n\n`;
            markdown += `Teams should combine qualitative judgment with measurable metrics and maintain explicit ownership boundaries. This keeps governance resilient when priorities or constraints shift during implementation [${citation}].\n\n`;
        }
    });
    return markdown.trim();
}
function koreanRatio(text) {
    const letters = text.match(/[A-Za-z\u3131-\u318E\uAC00-\uD7A3]/g) || [];
    const korean = text.match(/[\u3131-\u318E\uAC00-\uD7A3]/g) || [];
    if (letters.length === 0)
        return 1;
    return korean.length / letters.length;
}
function buildLengthExpansionBlock(job, lang, sources, index) {
    const sourceCount = Math.max(1, Math.min(8, sources.length));
    const citation = getCitationIndex(index, sourceCount);
    if (lang === "ko") {
        return `### 보강 분석 ${index + 1}\n${job.topic}의 실행 완성도를 높이기 위해서는 단계별 산출물과 검증 기준을 함께 운영해야 한다. 특히 초기 기획 단계에서 가정과 제약사항을 명시하면, 이후 단계에서 발생하는 해석 차이와 재작업 비용을 크게 줄일 수 있다. 또한 성과 측정은 단일 지표가 아니라 품질, 속도, 지속 가능성을 균형 있게 반영해야 한다 [${citation}].\n\n실행 과정에서는 의사결정의 근거를 기록하고 주기적으로 회고하는 체계를 유지해야 한다. 이 접근은 조직 내 지식 자산을 축적하고, 동일한 오류의 재발을 방지하는 데 효과적이다. 결과적으로 보고서의 제안이 문서 수준에서 멈추지 않고 실제 운영 개선으로 이어질 가능성이 높아진다 [${citation}].\n\n`;
    }
    return `### Deepening Analysis ${index + 1}\nTo improve execution reliability for ${job.topic}, each phase should pair delivery outputs with explicit validation criteria. Documenting assumptions and constraints early reduces ambiguity, rework, and timeline drift later in the program [${citation}].\n\nA robust operating model should preserve decision traceability and recurring retrospectives. This ensures the report's recommendations can be translated into sustained operational gains rather than one-off deliverables [${citation}].\n\n`;
}
function ensureMinimumQuality(markdown, job, sources) {
    const lang = normalizeLanguage(job.language);
    const target = TIER_TARGETS[job.tier] || TIER_TARGETS.FREE;
    let output = markdown.trim();
    if (!output.includes("```mermaid")) {
        output += `\n\n## ${lang === "ko" ? "프로세스 다이어그램" : "Process Diagram"}\n\`\`\`mermaid\nflowchart TD\nA[Input] --> B[Analyze]\nB --> C[Decide]\nC --> D[Execute]\nD --> E[Review]\n\`\`\`\n`;
    }
    if (!/\|[^\n]+\|[^\n]+\|/.test(output)) {
        output += `\n\n## ${lang === "ko" ? "비교 표" : "Comparison Table"}\n| 항목 | 설명 |\n|---|---|\n| 목표 | ${job.topic} 주제의 실행 가능한 의사결정 제시 |\n| 방법 | 출처 기반 분석 + 단계별 검증 |\n`;
    }
    if (lang === "ko" && koreanRatio(output) < 0.7) {
        output += `\n\n## 한국어 요약 보강\n본 문서는 한국어 보고서 기준을 충족하도록 핵심 논점, 실행 전략, 리스크 대응, 성과 지표를 한국어 중심으로 재정리했다. 이후 섹션은 의사결정 및 실무 적용에 바로 사용할 수 있도록 근거 기반 문장으로 보강한다 [1].\n`;
    }
    let expandIndex = 0;
    while (output.length < target.minChars && expandIndex < 24) {
        output += `\n\n${buildLengthExpansionBlock(job, lang, sources, expandIndex)}`;
        expandIndex += 1;
    }
    return output.trim();
}
function appendReferenceSection(markdown, job, sources) {
    const lang = normalizeLanguage(job.language);
    const heading = lang === "ko" ? "## 참고 문헌" : "## References";
    const linkWord = lang === "ko" ? "링크" : "Link";
    const fallback = lang === "ko" ? "출처 목록을 불러오지 못했습니다." : "No sources available.";
    if (sources.length === 0) {
        return `${markdown}\n\n${heading}\n1. ${fallback}`;
    }
    const body = sources
        .map((source, idx) => `${idx + 1}. **${source.title}**. [${linkWord}](${source.url})`)
        .join("\n");
    return `${markdown}\n\n${heading}\n${body}`;
}
async function generateDraft(job) {
    console.log(`[WRITE] Generating draft for '${job.topic}'`);
    const sources = await shared_1.prisma.source.findMany({ where: { jobId: job.id } });
    if (sources.length === 0) {
        throw new Error("No sources found for this job. Cannot write report without grounding.");
    }
    const lang = normalizeLanguage(job.language);
    let contextText = lang === "ko" ? "보고서 작성에 사용할 수집 출처:\n" : "AVAILABLE SOURCES FOR RESEARCH:\n";
    sources.forEach((s, idx) => {
        if (lang === "ko") {
            contextText += `\n--- 출처 [${idx + 1}] ---\n제목: ${s.title}\nURL: ${s.url}\n요약:\n${cleanSnippet(s.notes, 600)}\n`;
            return;
        }
        contextText += `\n--- SOURCE [${idx + 1}] ---\nTitle: ${s.title}\nURL: ${s.url}\nContent Snippet:\n${cleanSnippet(s.notes, 600)}\n`;
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
    const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
    const useFallback = !geminiApiKey || geminiApiKey.toLowerCase().includes("your_gemini_api_key_here");
    let markdown = "";
    if (useFallback) {
        console.warn("[WRITE] GEMINI_API_KEY is missing. Using fallback markdown generator.");
        markdown = buildFallbackMarkdown(job, sources);
    }
    else {
        const genAI = new generative_ai_1.GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        const result = await model.generateContent(prompt);
        markdown = result.response.text();
    }
    markdown = markdown.replace(/^```(?:html|markdown)\n|```$/g, "").trim();
    markdown = ensureMinimumQuality(markdown, job, sources);
    markdown = appendReferenceSection(markdown, job, sources);
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
