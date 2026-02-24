import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "mock-key");

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
export const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
