"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobOutlineSchema = exports.OutlineSectionSchema = exports.JobProgressStageSchema = exports.JobStatusSchema = exports.JobCreateSchema = void 0;
const zod_1 = require("zod");
exports.JobCreateSchema = zod_1.z.object({
    topic: zod_1.z.string().min(2, "Topic must be at least 2 characters"),
    language: zod_1.z.string().default("Korean"),
    tier: zod_1.z.enum(["FREE", "PAID_TIER_1", "PAID_TIER_2"]).default("FREE"),
    pageRangePreset: zod_1.z.enum(["FREE_10", "PAID_20", "PAID_30"]).default("FREE_10")
});
exports.JobStatusSchema = zod_1.z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);
exports.JobProgressStageSchema = zod_1.z.enum(["IDLE", "PLAN", "RESEARCH", "WRITE", "QA", "RENDER", "DONE"]);
exports.OutlineSectionSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    estimatedPages: zod_1.z.number().min(0.5).max(5),
    requiresDiagram: zod_1.z.boolean().default(false)
});
exports.JobOutlineSchema = zod_1.z.object({
    title: zod_1.z.string(),
    subtitle: zod_1.z.string(),
    targetPages: zod_1.z.number(),
    sections: zod_1.z.array(exports.OutlineSectionSchema)
});
