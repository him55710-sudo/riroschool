import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type ChatRole = "user" | "assistant";

type ChatMessage = {
    role: ChatRole;
    content: string;
};

type ChatRequestBody = {
    messages?: ChatMessage[];
    topic?: string;
    language?: string;
    tier?: string;
};

type GeminiRole = "user" | "model";

type GeminiContent = {
    role: GeminiRole;
    parts: Array<{ text: string }>;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parsePositiveInt = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return Math.floor(parsed);
};

const parseModelList = (raw: string) =>
    Array.from(
        new Set(
            raw
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
        ),
    );

const GEMINI_CHAT_MAX_OUTPUT_TOKENS = parsePositiveInt(process.env.GEMINI_CHAT_MAX_OUTPUT_TOKENS, 8192);
const GEMINI_CHAT_MAX_SEGMENTS = parsePositiveInt(process.env.GEMINI_CHAT_MAX_SEGMENTS, 24);

const isGeminiConfigured = () => {
    const key = (process.env.GEMINI_API_KEY || "").trim().toLowerCase();
    return key.length > 0 && !key.includes("your_gemini_api_key_here");
};

const toSafeMessages = (messages: ChatMessage[]) =>
    messages
        .map((message) => ({
            role: message.role,
            content: (message.content || "").trim(),
        }))
        .filter((message) => message.content.length > 0);

const getFinishReason = (response: unknown) => {
    if (typeof response !== "object" || !response) return "";
    const maybeResponse = response as { candidates?: Array<{ finishReason?: string }> };
    const reason = maybeResponse.candidates?.[0]?.finishReason;
    return typeof reason === "string" ? reason : "";
};

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) return error.message;
    try {
        return JSON.stringify(error);
    } catch {
        return String(error);
    }
};

const isQuotaOrRateLimitError = (error: unknown) => {
    const message = getErrorMessage(error).toLowerCase();
    return (
        message.includes("429") ||
        message.includes("quota") ||
        message.includes("too many requests") ||
        message.includes("rate limit") ||
        message.includes("resource exhausted")
    );
};

const parseRetryDelayMs = (error: unknown) => {
    const message = getErrorMessage(error);
    const match = message.match(/retry in\s*([0-9.]+)s/i);
    if (!match) return 0;
    const seconds = Number(match[1]);
    if (!Number.isFinite(seconds) || seconds <= 0) return 0;
    return Math.min(Math.ceil(seconds * 1000), 30000);
};

const getChatCandidateModels = (primary: string) => {
    const configuredFallback = parseModelList(process.env.GEMINI_CHAT_FALLBACK_MODELS || "");
    const safetyFallback = ["gemini-2.5-flash"];
    return parseModelList([primary, ...configuredFallback, ...safetyFallback].join(","));
};

const getContinuationPrompt = (language: "English" | "Korean") =>
    language === "English"
        ? "Continue exactly from where you stopped. Do not repeat previous sentences. Keep numbering and structure consistent."
        : "방금 멈춘 지점 바로 다음 문장부터 정확히 이어서 작성하세요. 이미 작성한 문장은 반복하지 말고 번호/구조를 그대로 유지하세요.";

const getChatFailureMessage = (language: "English" | "Korean", error: unknown) => {
    if (isQuotaOrRateLimitError(error)) {
        const retryDelayMs = parseRetryDelayMs(error);
        if (language === "English") {
            if (retryDelayMs > 0) {
                const seconds = Math.max(1, Math.ceil(retryDelayMs / 1000));
                return `AI quota is temporarily exceeded. Please retry in about ${seconds} seconds, or switch to a Flash model.`;
            }
            return "AI quota is temporarily exceeded. Please retry shortly, or switch to a Flash model.";
        }
        if (retryDelayMs > 0) {
            const seconds = Math.max(1, Math.ceil(retryDelayMs / 1000));
            return `AI 사용량 한도를 초과했습니다. 약 ${seconds}초 후 다시 시도하거나 Flash 모델로 전환해 주세요.`;
        }
        return "AI 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나 Flash 모델로 전환해 주세요.";
    }
    return language === "English"
        ? "An error occurred while generating chat response. Please retry."
        : "채팅 응답 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
};

export async function POST(req: Request) {
    try {
        if (!isGeminiConfigured()) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY가 설정되지 않았습니다. .env.local을 확인해 주세요." },
                { status: 503 },
            );
        }

        const body = (await req.json()) as ChatRequestBody;
        const topic = (body.topic || "").trim();
        const language = body.language === "English" ? "English" : "Korean";
        const tier = (body.tier || "FREE").trim();
        const messages = toSafeMessages(body.messages || []);

        const systemInstruction =
            language === "English"
                ? [
                      "You are an elite portfolio mentor AI.",
                      `Target topic: ${topic || "Not decided yet"}.`,
                      `Quality tier: ${tier}.`,
                      "Ask sharp follow-up questions and propose concrete improvements.",
                      "Keep replies actionable and tailored to the user's portfolio context.",
                      "Respect the user's requested output length. If the user asks for a long answer, provide a long, detailed answer.",
                  ].join(" ")
                : [
                      "당신은 포트폴리오 기획을 돕는 최고 수준의 AI 멘토입니다.",
                      `목표 주제: ${topic || "미정"}.`,
                      `품질 티어: ${tier}.`,
                      "사용자의 경험과 강점을 구체화하도록 날카로운 후속 질문을 하세요.",
                      "답변은 실무적으로 실행 가능하고 명확하게 제시하세요.",
                      "사용자가 길게 요청하면 충분히 길고 상세하게 답변하세요.",
                  ].join(" ");

        const chatModel = (process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash").trim();
        const chatCandidateModels = getChatCandidateModels(chatModel);
        const genAI = new GoogleGenerativeAI((process.env.GEMINI_API_KEY || "").trim());

        const messageContents: GeminiContent[] =
            messages.length > 0
                ? messages.map((message) => {
                      const role: GeminiRole = message.role === "assistant" ? "model" : "user";
                      return {
                          role,
                          parts: [{ text: message.content }],
                      };
                  })
                : [
                      {
                          role: "user",
                          parts: [{ text: language === "English" ? "Let's design my portfolio." : "포트폴리오 설계를 시작하자." }],
                      },
                  ];

        const initialContents: GeminiContent[] = [
            {
                role: "user",
                parts: [{ text: systemInstruction }],
            },
            ...messageContents,
        ];

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let emittedChars = 0;
                try {
                    let contents = [...initialContents];
                    let activeModelIndex = 0;

                    for (let segmentIndex = 0; segmentIndex < GEMINI_CHAT_MAX_SEGMENTS; segmentIndex += 1) {
                        let shouldGenerateNextSegment = false;
                        let segmentCompleted = false;
                        let retryCount = 0;

                        while (!segmentCompleted) {
                            const modelName = chatCandidateModels[activeModelIndex];
                            if (!modelName) {
                                throw new Error("No Gemini model candidates available for chat.");
                            }

                            const model = genAI.getGenerativeModel({ model: modelName });

                            try {
                                const result = await model.generateContentStream({
                                    contents,
                                    generationConfig: {
                                        temperature: 0.6,
                                        topP: 0.9,
                                        maxOutputTokens: GEMINI_CHAT_MAX_OUTPUT_TOKENS,
                                    },
                                });

                                let segmentText = "";
                                for await (const chunk of result.stream) {
                                    const text = chunk.text();
                                    if (!text) continue;
                                    segmentText += text;
                                    emittedChars += text.length;
                                    controller.enqueue(encoder.encode(text));
                                }

                                const response = await result.response;
                                const finishReason = getFinishReason(response);
                                const endedByTokenLimit = finishReason === "MAX_TOKENS";
                                shouldGenerateNextSegment = endedByTokenLimit && segmentText.trim().length > 0;

                                if (shouldGenerateNextSegment) {
                                    contents = [
                                        ...contents,
                                        { role: "model", parts: [{ text: segmentText }] },
                                        { role: "user", parts: [{ text: getContinuationPrompt(language) }] },
                                    ];
                                }

                                segmentCompleted = true;
                            } catch (error: unknown) {
                                const retryDelayMs = parseRetryDelayMs(error);
                                if (retryCount === 0 && isQuotaOrRateLimitError(error) && retryDelayMs > 0) {
                                    retryCount += 1;
                                    await wait(retryDelayMs + 300);
                                    continue;
                                }

                                if (isQuotaOrRateLimitError(error) && activeModelIndex < chatCandidateModels.length - 1) {
                                    activeModelIndex += 1;
                                    retryCount = 0;
                                    continue;
                                }
                                throw error;
                            }
                        }

                        if (!shouldGenerateNextSegment) break;
                    }

                    controller.close();
                } catch (error: unknown) {
                    const fallbackMessage = getChatFailureMessage(language, error);
                    const text = emittedChars > 0 ? `\n\n${fallbackMessage}` : fallbackMessage;
                    controller.enqueue(encoder.encode(text));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "채팅 응답 생성에 실패했습니다.";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
