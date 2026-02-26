import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { hasGoogleOAuthCredentials, hasNextAuthSecret } from "./lib/auth-env";

let warnedInvalidDevAuth = false;

const authMiddleware = withAuth(
    function middleware() {
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export default function middleware(req: any, ev: any) {
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

    return (authMiddleware as any)(req, ev);
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/api/admin/:path*",
        "/checkout/:path*",
        "/api/orders/:path*",
    ],
};
