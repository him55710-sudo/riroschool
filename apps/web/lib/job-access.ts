import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { getAuthOptions } from "./auth";
import { isAdminEmail } from "./rbac";

const GUEST_JOB_COOKIE = "polio_guest_jobs";
const MAX_GUEST_JOBS = 40;
const JOB_ID_PATTERN = /^[a-z0-9]{10,40}$/;

export type RequestIdentity = {
    userId: string | null;
    email: string | null;
    isAdmin: boolean;
    guestJobIds: string[];
};

function parseCookieValue(cookieHeader: string, key: string): string | null {
    const token = `${key}=`;
    const parts = cookieHeader.split(";").map((item) => item.trim());
    for (const part of parts) {
        if (!part.startsWith(token)) continue;
        return decodeURIComponent(part.slice(token.length));
    }
    return null;
}

function normalizeJobIdList(raw: string | null): string[] {
    if (!raw) return [];
    return raw
        .split(",")
        .map((item) => item.trim())
        .filter((item) => JOB_ID_PATTERN.test(item));
}

export function readGuestJobIds(req: Request): string[] {
    const cookieHeader = req.headers.get("cookie") || "";
    return normalizeJobIdList(parseCookieValue(cookieHeader, GUEST_JOB_COOKIE));
}

export function appendGuestJobId(existingIds: string[], jobId: string) {
    if (!JOB_ID_PATTERN.test(jobId)) return existingIds.slice(0, MAX_GUEST_JOBS);
    const merged = [jobId, ...existingIds.filter((id) => id !== jobId)];
    return merged.slice(0, MAX_GUEST_JOBS);
}

export function setGuestJobsCookie(res: NextResponse, jobIds: string[]) {
    const value = jobIds.join(",");
    res.cookies.set(GUEST_JOB_COOKIE, value, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
    });
}

export async function resolveRequestIdentity(req: Request): Promise<RequestIdentity> {
    const session = await getServerSession(getAuthOptions());
    const userId = session?.user?.id || null;
    const email = session?.user?.email || null;
    const guestJobIds = readGuestJobIds(req);

    return {
        userId,
        email,
        isAdmin: isAdminEmail(email),
        guestJobIds,
    };
}

export function canAccessJob(identity: RequestIdentity, jobId: string, ownerUserId?: string | null) {
    if (identity.isAdmin) return true;
    if (ownerUserId) return identity.userId === ownerUserId;
    return identity.guestJobIds.includes(jobId);
}
