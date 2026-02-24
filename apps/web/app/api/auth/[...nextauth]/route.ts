import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "shared";

export const authOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: "Mock Account (For Local Test)",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                let user = await prisma.user.findUnique({ where: { email: credentials.email } });

                if (!user) {
                    // Auto-register for mock testing
                    user = await prisma.user.create({
                        data: { email: credentials.email, name: credentials.email.split('@')[0], credits: 0 }
                    });
                }

                return { id: user.id, name: user.name, email: user.email, image: user.image };
            }
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
