import NextAuth from "next-auth";
import { getAuthOptions, hasGoogleOAuthCredentials } from "../../../../lib/auth";

if (!hasGoogleOAuthCredentials()) {
    console.error("[Auth] CRITICAL: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variable.");
}
if (!process.env.NEXTAUTH_SECRET) {
    console.error("[Auth] CRITICAL: Missing NEXTAUTH_SECRET environment variable.");
}

const handler = NextAuth(getAuthOptions());

export { handler as GET, handler as POST };
