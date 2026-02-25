import { z } from "zod";

export const JobCreateSchema = z.object({
    topic: z.string().min(2, "Topic must be at least 2 characters"),
    language: z.string().default("Korean"),
    tier: z.enum(["FREE", "PRO_PACK", "PREMIUM_PACK"]).default("FREE"),
    pageRangePreset: z.enum(["FREE_10", "PAID_20", "PAID_30"]).default("FREE_10")
});

export type JobCreateInput = z.infer<typeof JobCreateSchema>;

export const JobStatusSchema = z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

export const JobProgressStageSchema = z.enum(["IDLE", "PLAN", "RESEARCH", "WRITE", "QA", "RENDER", "DONE"]);
export type JobProgressStage = z.infer<typeof JobProgressStageSchema>;

export const OutlineSectionSchema = z.object({
    title: z.string(),
    description: z.string(),
    estimatedPages: z.number().min(0.5).max(5),
    requiresDiagram: z.boolean().default(false)
});

export const JobOutlineSchema = z.object({
    title: z.string(),
    subtitle: z.string(),
    targetPages: z.number(),
    sections: z.array(OutlineSectionSchema)
});

export type JobOutline = z.infer<typeof JobOutlineSchema>;
