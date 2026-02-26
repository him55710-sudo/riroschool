import { NextResponse } from "next/server";
import { prisma } from "shared";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "../../../../lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(getAuthOptions());
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

    if (job.userId && job.userId !== session?.user?.id) {
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
