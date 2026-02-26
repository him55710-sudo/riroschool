import { z } from "zod";
export declare const JobCreateSchema: z.ZodObject<{
    topic: z.ZodString;
    language: z.ZodDefault<z.ZodString>;
    tier: z.ZodDefault<z.ZodEnum<["FREE", "PRO_PACK", "PREMIUM_PACK"]>>;
    pageRangePreset: z.ZodDefault<z.ZodEnum<["FREE_10", "PRO_20", "PREMIUM_30"]>>;
}, "strip", z.ZodTypeAny, {
    topic: string;
    language: string;
    tier: "FREE" | "PRO_PACK" | "PREMIUM_PACK";
    pageRangePreset: "FREE_10" | "PRO_20" | "PREMIUM_30";
}, {
    topic: string;
    language?: string | undefined;
    tier?: "FREE" | "PRO_PACK" | "PREMIUM_PACK" | undefined;
    pageRangePreset?: "FREE_10" | "PRO_20" | "PREMIUM_30" | undefined;
}>;
export type JobCreateInput = z.infer<typeof JobCreateSchema>;
export declare const JobStatusSchema: z.ZodEnum<["PENDING", "PROCESSING", "COMPLETED", "FAILED"]>;
export type JobStatus = z.infer<typeof JobStatusSchema>;
export declare const JobProgressStageSchema: z.ZodEnum<["IDLE", "PLAN", "RESEARCH", "WRITE", "QA", "RENDER", "DONE"]>;
export type JobProgressStage = z.infer<typeof JobProgressStageSchema>;
export declare const OutlineSectionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    estimatedPages: z.ZodNumber;
    requiresDiagram: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    estimatedPages: number;
    requiresDiagram: boolean;
}, {
    title: string;
    description: string;
    estimatedPages: number;
    requiresDiagram?: boolean | undefined;
}>;
export declare const JobOutlineSchema: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodString;
    targetPages: z.ZodNumber;
    sections: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        estimatedPages: z.ZodNumber;
        requiresDiagram: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description: string;
        estimatedPages: number;
        requiresDiagram: boolean;
    }, {
        title: string;
        description: string;
        estimatedPages: number;
        requiresDiagram?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    subtitle: string;
    targetPages: number;
    sections: {
        title: string;
        description: string;
        estimatedPages: number;
        requiresDiagram: boolean;
    }[];
}, {
    title: string;
    subtitle: string;
    targetPages: number;
    sections: {
        title: string;
        description: string;
        estimatedPages: number;
        requiresDiagram?: boolean | undefined;
    }[];
}>;
export type JobOutline = z.infer<typeof JobOutlineSchema>;
