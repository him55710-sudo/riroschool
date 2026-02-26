import { NextResponse } from 'next/server';
import { prisma } from 'shared';
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "../../../../lib/auth";

export async function GET(req: Request) {
    // Basic Auth Check (Ideally, we'd check for a specific admin role or email)
    const session = await getServerSession(getAuthOptions());
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let adminConfig = await prisma.adminConfig.findUnique({ where: { id: "singleton" } });
        if (!adminConfig) {
            adminConfig = await prisma.adminConfig.create({ data: { id: "singleton", activePromptVersion: "v1" } });
        }
        return NextResponse.json(adminConfig, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(getAuthOptions());
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { activePromptVersion } = body;

        if (!activePromptVersion) {
            return NextResponse.json({ error: "Provide activePromptVersion" }, { status: 400 });
        }

        const adminConfig = await prisma.adminConfig.upsert({
            where: { id: "singleton" },
            update: { activePromptVersion },
            create: { id: "singleton", activePromptVersion }
        });

        return NextResponse.json(adminConfig, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
