import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { getAuthOptions } from "./auth";
import { ApiPermission, AppRole, hasPermission, resolveRoles } from "./rbac";

export type ApiAccessContext = {
    userId: string;
    email: string | null;
    roles: AppRole[];
    isAdmin: boolean;
};

export type ApiAuthorizationResult =
    | { ok: true; context: ApiAccessContext }
    | { ok: false; response: NextResponse };

export async function authorizeApi(permission: ApiPermission): Promise<ApiAuthorizationResult> {
    const session = await getServerSession(getAuthOptions());
    const userId = session?.user?.id || null;
    const email = session?.user?.email || null;
    const roles = resolveRoles(email, userId);

    if (!userId || !hasPermission(roles, permission)) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: userId ? "Forbidden" : "Unauthorized" },
                { status: userId ? 403 : 401 }
            ),
        };
    }

    return {
        ok: true,
        context: {
            userId,
            email,
            roles,
            isAdmin: roles.includes("admin"),
        },
    };
}

export function canAccessOwnedResource(context: ApiAccessContext, ownerUserId?: string | null) {
    if (!ownerUserId) return true;
    if (context.isAdmin) return true;
    return context.userId === ownerUserId;
}
