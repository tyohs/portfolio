import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yoh Kaminaga | Portfolio",
  description: "INIAD 1st-year | TypeScript/React | Hackathon & Side Projects",
  openGraph: {
    title: "Yoh Kaminaga | Portfolio",
    description: "TypeScript/React projects: Eda.ai, Othello, Minesweeper, self-dialog-bot",
  },
  metadataBase: new URL("https://your-vercel-url.vercel.app"), // デプロイ後に置換
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<html lang="ja" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-900 antialiased dark:from-zinc-950 dark:to-zinc-900 dark:text-zinc-50`}>{children}</body>
    </html>
  );
}
