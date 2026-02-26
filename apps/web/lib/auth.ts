import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "shared";
import {
    hasGoogleOAuthCredentials as hasValidGoogleOAuthCredentials,
    normalizeGoogleClientId,
} from "./auth-env";

let warnedMissingGoogleOAuth = false;

const getGoogleOAuthConfig = () => {
    const clientId = normalizeGoogleClientId(process.env.GOOGLE_CLIENT_ID || "");
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const isConfigured = hasValidGoogleOAuthCredentials(clientId, clientSecret);

    if (!isConfigured && process.env.NODE_ENV !== "production" && !warnedMissingGoogleOAuth) {
        console.warn(
            "[Auth] GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET missing. " +
            "Using dev placeholders so non-auth pages can still load."
        );
        warnedMissingGoogleOAuth = true;
    }

    return {
        isConfigured,
        clientId: clientId || "dev-missing-google-client-id",
        clientSecret: clientSecret || "dev-missing-google-client-secret",
    };
};

export const hasGoogleOAuthCredentials = () => getGoogleOAuthConfig().isConfigured;

export const getAuthOptions = (): NextAuthOptions => {
    const google = getGoogleOAuthConfig();
    const providers = google.isConfigured
        ? [
            GoogleProvider({
                clientId: google.clientId,
                clientSecret: google.clientSecret,
            })
        ]
        : [
            CredentialsProvider({
                id: "dev-disabled-provider",
                name: "Dev Disabled Provider",
                credentials: {},
                async authorize() {
                    return null;
                },
            })
        ];

    return {
        adapter: PrismaAdapter(prisma) as any,
        providers,
        session: { strategy: "jwt" as const },
        callbacks: {
            async session({ session, token }: any) {
                if (session.user) {
                    session.user.id = token.sub as string;
                    // Fetch fresh credits
                    const dbUser = await prisma.user.findUnique({ where: { id: token.sub! } });
                    if (dbUser) session.user.credits = dbUser.credits;
                }
                return session;
            }
        },
        secret: process.env.NEXTAUTH_SECRET || "mock-secret-for-dev",
    };
};
