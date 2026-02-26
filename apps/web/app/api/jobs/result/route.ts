import { NextResponse } from "next/server";
import { prisma } from "shared";
import { canAccessJob, resolveRequestIdentity } from "../../../../lib/job-access";

export async function GET(req: Request) {
    const identity = await resolveRequestIdentity(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return new NextResponse("Missing id", { status: 400 });
    }

    const job = await prisma.job.findUnique({
        where: { id },
        select: { id: true, userId: true },
    });

    if (!job) {
        return new NextResponse("Job not found", { status: 404 });
    }

    if (!canAccessJob(identity, job.id, job.userId)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const report = await prisma.artifact.findFirst({
        where: { jobId: id, type: "HTML_REPORT" },
        orderBy: { id: "desc" },
    });

    if (!report?.metadata) {
        return new NextResponse("Report not ready", { status: 404 });
    }

    return new NextResponse(report.metadata, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}
