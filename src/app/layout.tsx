import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "神永 陽 / Yoh Kaminaga | Portfolio",
  description:
    "東洋大学 INIADでWeb開発とAI活用を学ぶ、神永陽のポートフォリオ。",
  openGraph: {
    title: "神永 陽 / Yoh Kaminaga | Portfolio",
    description: "MinKara、Eda.ai、Minesweeper、Othelloの開発記録。",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
