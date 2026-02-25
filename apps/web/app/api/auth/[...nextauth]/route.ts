import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "shared";

export const authOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        })
    ],
    session: { strategy: "jwt" as const },
    callbacks: {
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.sub;

                // Fetch fresh credits
                const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
                if (dbUser) session.user.credits = dbUser.credits;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "mock-secret-for-dev",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
