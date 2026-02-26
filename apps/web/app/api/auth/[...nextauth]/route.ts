import NextAuth from "next-auth";
import { getAuthOptions, hasGoogleOAuthCredentials } from "../../../../lib/auth";

const handler = (req: any, res: any) => {
    if (!hasGoogleOAuthCredentials()) {
        console.error("[Auth] CRITICAL: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variable.");
        if (process.env.NODE_ENV === "production") {
            return new Response(JSON.stringify({ error: "Missing Google OAuth credentials" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }
    if (!process.env.NEXTAUTH_SECRET) {
        console.error("[Auth] CRITICAL: Missing NEXTAUTH_SECRET environment variable.");
        if (process.env.NODE_ENV === "production") {
            return new Response(JSON.stringify({ error: "Missing NEXTAUTH_SECRET" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }
    const nextAuthHandler = NextAuth(getAuthOptions());
    return nextAuthHandler(req, res);
};

export { handler as GET, handler as POST };
