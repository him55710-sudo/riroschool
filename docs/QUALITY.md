# Quality Guidelines for AI Portfolio Generator

## Core Principles
The goal of this application is to deliver "Consulting-Grade" automated reports. This means accuracy, clear citations, robust structure, and professional visual design.

## 1. Web Research & Safety
- **Prompt Injection Defense**: All web requests made by the WebPageFetcher will explicitly append boundaries and ignore instructions found in the scraped content.
- **Provider Fallbacks**: If the primary search API (Tavily) is unreachable, the system must degrade gracefully to curated academic mocks or Wikipedia snippets.
- **Traceability**: All grabbed snippets must store `accessedAt`, `url`, and `title` to generate a rigorous bibliography.

## 2. Citation Requirements
- Models are strictly prompted to ground ALL facts using `[1]`, `[2]` bracket notation.
- If the model makes a claim that cannot be verified against the scraped text, it MUST append `[추가 확인 필요]`.
- The Formatting stage will compile these into a canonical Markdown `## References` section.

## 3. Visuals & Formatting Rules
- **Mermaid.js**: Reports must include structural diagrams (flowcharts, state diagrams). The Formatting pipeline handles `<script>` hydration safely via JSDOM DOMPurify.
- **Tables**: Markdown tables are used for comparison and heuristics.
- **CSS Themes**: 
  - `Minimal` (Default): Inter font, high legibility.
  - `Academic`: Serif fonts, traditional border styles.
  - Page breaks are strictly avoided inside tables and `.diagram-container` via CSS rules (`page-break-inside: avoid`).

## 4. QA Gate Checks
Before finalizing a document, the system runs an automatic QA logic check:
- **Masking**: Hardcoded Regex filters apply phone, email, and SSN masking to prevent accidental PII leakage.
- **Hallucination Detection**: Any `[추가 확인 필요]` triggers a 10-point penalty on the QA Score and creates a warning.
- **Missing Visuals**: Lack of \`\`\`mermaid triggers a 20-point penalty.
- **Artifact**: A JSON log of these checks is saved independently.

## 5. Anti-Duplication
To prevent users from duplicate-billing and generating identical content, the system checks the `Job` database within a 24-hour window. Exact matches (Topic + Language + Tier) instantly return the pre-existing result.
