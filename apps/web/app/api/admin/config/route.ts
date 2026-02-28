import { NextResponse } from 'next/server';
import { prisma } from 'shared';
import { authorizeApi } from "../../../../lib/api-rbac";

type UpdateAdminConfigBody = {
    activePromptVersion?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

export async function GET() {
    const auth = await authorizeApi("admin:config:read");
    if (!auth.ok) return auth.response;

    try {
        let adminConfig = await prisma.adminConfig.findUnique({ where: { id: "singleton" } });
        if (!adminConfig) {
            adminConfig = await prisma.adminConfig.create({ data: { id: "singleton", activePromptVersion: "v1" } });
        }
        return NextResponse.json(adminConfig, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error, "Failed to load admin config") }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const auth = await authorizeApi("admin:config:write");
    if (!auth.ok) return auth.response;

    try {
        const body = (await req.json()) as UpdateAdminConfigBody;
        const activePromptVersion = body.activePromptVersion?.trim();

        if (!activePromptVersion) {
            return NextResponse.json({ error: "Provide activePromptVersion" }, { status: 400 });
        }

        const adminConfig = await prisma.adminConfig.upsert({
            where: { id: "singleton" },
            update: { activePromptVersion },
            create: { id: "singleton", activePromptVersion }
        });

        return NextResponse.json(adminConfig, { status: 200 });
    } catch (error: unknown) {
        return NextResponse.json({ error: getErrorMessage(error, "Failed to update admin config") }, { status: 500 });
    }
}
