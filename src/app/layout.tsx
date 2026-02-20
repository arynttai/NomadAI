import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
    display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: '--font-jakarta',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "NomadAI — Global Travel Assistant",
    description:
        "Your AI-powered luxury travel concierge. Get expert advice on hotels, hidden gems, local tips, and personalized itineraries for any destination worldwide.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
            <body className="antialiased bg-slate-950 text-slate-100">{children}</body>
        </html>
    );
}
