import type { Metadata } from "next";
import { Manrope, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Nav } from "./components/Nav";

const heading = Manrope({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: ["700", "800"],
});

const body = Noto_Sans_KR({
    subsets: ["latin"],
    variable: "--font-body",
    weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
    title: "리로 포트폴리오 빌더",
    description: "토스뱅크 스타일의 AI 포트폴리오 리포트 생성 서비스",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ko">
            <body className={`${heading.variable} ${body.variable}`}>
                <Providers>
                    <Nav />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
