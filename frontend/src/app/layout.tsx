// @ts-ignore: CSS module declarations not found
import "./globals.css"; // MUST BE PRESENT
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Lumina AI — Intelligent Document Summarizer",
  description:
    "Turn long documents into instant insights. Powered by Gemini AI — summarize, chat, and analyze in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#090909] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}