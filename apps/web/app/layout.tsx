import type { Metadata } from "next";
import { Noto_Sans_KR, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Nav } from "./components/Nav";

const heading = Outfit({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: ["600", "700", "800"],
});

const body = Noto_Sans_KR({
    subsets: ["latin"],
    variable: "--font-body",
    weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
    title: "polio | 포트폴리오 생성기",
    description: "AI로 포트폴리오 보고서를 빠르게 생성하고 진행 상태를 실시간으로 확인하세요.",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ko">
            <body className={`${heading.variable} ${body.variable} antialiased`}>
                <Providers>
                    <Nav />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
