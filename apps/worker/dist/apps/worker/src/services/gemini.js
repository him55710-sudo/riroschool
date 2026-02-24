"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashModel = exports.model = exports.genAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not set.");
}
exports.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || "mock-key");
exports.model = exports.genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
exports.flashModel = exports.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
