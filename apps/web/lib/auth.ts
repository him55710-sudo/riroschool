import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "shared";
import {
    hasGoogleOAuthCredentials as hasValidGoogleOAuthCredentials,
    normalizeGoogleClientId,
} from "./auth-env";
import { isAdminEmail } from "./rbac";

let warnedMissingGoogleOAuth = false;
const ADMIN_BASE_CREDITS = Number(process.env.ADMIN_BASE_CREDITS || "10000");

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
                authorization: {
                    params: {
                        prompt: "select_account",
                    },
                },
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
        adapter: PrismaAdapter(prisma) as Adapter,
        providers,
        session: { strategy: "jwt" as const },
        callbacks: {
            async session({ session, token }) {
                if (session.user && token.sub) {
                    session.user.id = token.sub;
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.sub },
                        select: { credits: true, email: true },
                    });

                    if (dbUser) {
                        const admin = isAdminEmail(dbUser.email || session.user.email);
                        session.user.isAdmin = admin;

                        let credits = dbUser.credits;
                        if (admin && Number.isFinite(ADMIN_BASE_CREDITS) && ADMIN_BASE_CREDITS > 0 && credits < ADMIN_BASE_CREDITS) {
                            const updated = await prisma.user.update({
                                where: { id: token.sub },
                                data: { credits: ADMIN_BASE_CREDITS },
                                select: { credits: true },
                            });
                            credits = updated.credits;
                        }

                        session.user.credits = credits;
                    } else {
                        session.user.isAdmin = isAdminEmail(session.user.email);
                    }
                }
                return session;
            }
        },
        secret: process.env.NEXTAUTH_SECRET || "mock-secret-for-dev",
    };
};
