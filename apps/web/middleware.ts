import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { hasGoogleOAuthCredentials, hasNextAuthSecret } from "./lib/auth-env";
import { isAdminEmail } from "./lib/rbac";

let warnedInvalidDevAuth = false;

const AUTH_REQUIRED_PAGE_PREFIXES = ["/admin", "/checkout"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/webhooks/toss", "/api/jobs"];
const ADMIN_ONLY_PREFIXES = ["/admin", "/api/admin", "/api/webhooks/payment/mock"];

const hasPrefix = (pathname: string, prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);

const isApiPath = (pathname: string) => hasPrefix(pathname, "/api");

const isPublicApiPath = (pathname: string) =>
    PUBLIC_API_PREFIXES.some((prefix) => hasPrefix(pathname, prefix));

const requiresAuthentication = (pathname: string) => {
    if (isApiPath(pathname)) return !isPublicApiPath(pathname);
    return AUTH_REQUIRED_PAGE_PREFIXES.some((prefix) => hasPrefix(pathname, prefix));
};

const requiresAdminRole = (pathname: string) =>
    ADMIN_ONLY_PREFIXES.some((prefix) => hasPrefix(pathname, prefix));

const handleUnauthorized = (req: NextRequest) => {
    if (isApiPath(req.nextUrl.pathname)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.url);
    const next = `${req.nextUrl.pathname}${req.nextUrl.search}`;
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
};

const handleForbidden = (req: NextRequest) => {
    if (isApiPath(req.nextUrl.pathname)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.redirect(new URL("/", req.url));
};

export default async function middleware(req: NextRequest) {
    const isAuthConfigured = hasNextAuthSecret() && hasGoogleOAuthCredentials();

    // In local dev, allow the app to load even when OAuth is not fully configured.
    if (process.env.NODE_ENV !== "production" && !isAuthConfigured) {
        if (!warnedInvalidDevAuth) {
            console.warn(
                "[Auth Middleware] NEXTAUTH/Google OAuth env is missing or placeholder. " +
                "Skipping auth guard in development so local pages can load."
            );
            warnedInvalidDevAuth = true;
        }
        return NextResponse.next();
    }

    const { pathname } = req.nextUrl;
    if (!requiresAuthentication(pathname)) {
        return NextResponse.next();
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
        return handleUnauthorized(req);
    }

    if (requiresAdminRole(pathname) && !isAdminEmail(token.email)) {
        return handleForbidden(req);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/checkout/:path*",
        "/api/:path*",
    ],
};
