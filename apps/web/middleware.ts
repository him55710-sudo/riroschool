import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Development convenience: Warn clearly if auth env vars are missing
        if (!process.env.NEXTAUTH_SECRET || !process.env.GOOGLE_CLIENT_ID) {
            console.warn(
                "[Auth Middleware] WARNING: NEXTAUTH_SECRET or GOOGLE_CLIENT_ID is missing. " +
                "Google Login will not work properly until these are set in .env."
            );
        }
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

export const config = {
    matcher: [
        "/",
        "/checkout/:path*",
        "/api/orders/:path*",
        // Exclude specific public routes from protection if necessary (e.g., auth, webhooks)
    ],
};
