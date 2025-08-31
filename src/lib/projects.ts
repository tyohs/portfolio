export type Project = {
  title: string;
  summary: string;
  tech: string[];
  role?: string;
  cover?: string | null;
  demoUrl?: string | null;
  codeUrl?: string | null;
  tags?: string[];
};

export const projects: Project[] = [
  {
    title: "Eda.ai (Hackathon)",
    summary: "gitのブランチから着想した対話型LLMアプリ(仮)。役割分担でフロントの一部を担当。",
    tech: ["Next.js", "TypeScript", "Tailwind", "gemini API"],
    role: "Frontend",
    cover: "https://placehold.co/1600x900/d1fae5/333?text=Eda.ai",
    demoUrl: "https://eda-ai-a.vercel.app/",
    codeUrl: "https://github.com/50ki-1706/Eda.ai",
    tags: ["hackathon"],
  },
  {
    title: "Othello (TypeScript/React)",
    summary: "初の個人開発で作った簡単なオセロゲーム。",
    tech: ["TypeScript", "React"],
    role: "Solo Dev",
    cover: "https://placehold.co/1600x900/e0f2fe/333?text=Othello",
    codeUrl: "https://github.com/tyohs/othello",
    tags: ["iniad.ts", "game"],
  },
  {
    title: "Minesweeper (TypeScript/React)",
    summary: "未完成のマインスイーパー。制作過程でreactのフックや再起関数を学んだ。",
    tech: ["TypeScript", "React"],
    role: "Solo Dev",
    cover: "https://placehold.co/1600x900/fce7f3/333?text=Minesweeper",
    codeUrl: "https://github.com/tyohs/minesweeper",
    tags: ["iniad.ts", "game"],
  },
  {
    title: "self-dialog-bot (Python/Streamlit)",
    summary: "aiが自動で対話するツール。初めてバイブコーディングに挑戦してほとんどのコーディングをChat-gptに任せた。",
    tech: ["Python", "Streamlit"],
    role: "Solo Dev",
    cover: "https://placehold.co/1600x900/fef9c3/333?text=Self-Dialog",
    codeUrl: "https://github.com/tyohs/self-dialog-bot",
    tags: ["vibecoding" ],
  },
];
