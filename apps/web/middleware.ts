import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
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
