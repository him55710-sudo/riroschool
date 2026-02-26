import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "shared";
import { canAccessJob, resolveRequestIdentity } from "../../../../lib/job-access";

const STORAGE_ROOT = path.resolve(process.cwd(), "../../.storage");

function resolveDownloadPath(key: string) {
    const normalized = key.replace(/^local:\/\//, "").replace(/\\/g, "/");
    if (!normalized || normalized.startsWith("/") || normalized.includes("..")) {
        return null;
    }

    const absolutePath = path.resolve(STORAGE_ROOT, normalized);
    if (absolutePath !== STORAGE_ROOT && !absolutePath.startsWith(`${STORAGE_ROOT}${path.sep}`)) {
        return null;
    }
    return absolutePath;
}

function getContentType(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".pdf") return "application/pdf";
    if (ext === ".html") return "text/html; charset=utf-8";
    if (ext === ".md") return "text/markdown; charset=utf-8";
    if (ext === ".json") return "application/json; charset=utf-8";
    return "application/octet-stream";
}

export async function GET(req: Request) {
    const identity = await resolveRequestIdentity(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    let key = searchParams.get("key");

    if (id) {
        const job = await prisma.job.findUnique({
            where: { id },
            select: { id: true, userId: true },
        });
        if (!job) return new NextResponse("Job not found", { status: 404 });
        if (!canAccessJob(identity, job.id, job.userId)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const pdfArtifact = await prisma.artifact.findFirst({
            where: { jobId: id, type: "PDF_REPORT" },
            orderBy: { id: "desc" },
            select: { storageKey: true },
        });

        if (!pdfArtifact?.storageKey) {
            return new NextResponse("PDF not ready", { status: 404 });
        }

        key = pdfArtifact.storageKey.replace(/^local:\/\//, "");
    } else if (key) {
        const inferredJobId = key.replace(/^local:\/\//, "").split("/")[0] || "";
        if (!inferredJobId) return new NextResponse("Invalid key", { status: 400 });

        const job = await prisma.job.findUnique({
            where: { id: inferredJobId },
            select: { id: true, userId: true },
        });
        if (!job) return new NextResponse("Job not found", { status: 404 });
        if (!canAccessJob(identity, job.id, job.userId)) {
            return new NextResponse("Forbidden", { status: 403 });
        }
    } else {
        return new NextResponse("Missing id or key", { status: 400 });
    }

    const filePath = resolveDownloadPath(key || "");
    if (!filePath) return new NextResponse("Invalid key", { status: 400 });
    if (!fs.existsSync(filePath)) return new NextResponse("File not found", { status: 404 });

    const fileBuffer = fs.readFileSync(filePath);
    const stat = fs.statSync(filePath);
    const contentType = getContentType(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
            "Content-Length": stat.size.toString(),
            "Cache-Control": "no-store",
        },
    });
}
