import { NextResponse } from 'next/server';
import { prisma } from 'shared';
import { authorizeApi } from "../../../../lib/api-rbac";

export async function GET() {
    const auth = await authorizeApi("admin:config:read");
    if (!auth.ok) return auth.response;

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
    const auth = await authorizeApi("admin:config:write");
    if (!auth.ok) return auth.response;

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
