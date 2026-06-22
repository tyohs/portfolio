export type TerminalSectionData = {
  id: "whoami" | "profile" | "projects" | "experience" | "skills" | "contact";
  label: string;
  command: string;
  output?: string;
  gipenLine: string;
};

export type Project = {
  name: string;
  description: string;
  stack: string;
  href: string;
};

export const projects: Project[] = [
  {
    name: "MinKara",
    description: "チームリーダーとして開発した、複数端末でルーム・音声を同期するリアルタイム音楽ゲーム。",
    stack: "Next.js / TypeScript / Supabase",
    href: "https://github.com/tyohs/MinKara",
  },
  {
    name: "Eda.ai",
    description: "フロントエンドを担当した、会話を枝分かれさせて思考を探索するハッカソン作品。",
    stack: "Next.js / TypeScript / Gemini API",
    href: "https://github.com/50ki-1706/Eda.ai",
  },
  {
    name: "Minesweeper",
    description: "Reactの状態管理と再帰処理を学ぶために制作したマインスイーパー。",
    stack: "React / TypeScript",
    href: "https://github.com/tyohs/minesweeper",
  },
  {
    name: "Othello",
    description: "盤面ロジックと合法手判定を実装した、初期の個人開発作品。",
    stack: "React / TypeScript",
    href: "https://github.com/tyohs/othello",
  },
];

export const sections: TerminalSectionData[] = [
  {
    id: "whoami",
    label: "Whoami",
    command: "whoami",
    output: "神永 陽 / INIAD 学部2年\nWeb・AI・コミュニティで活動中",
    gipenLine: "神永陽のポートフォリオへようこそ",
  },
  {
    id: "profile",
    label: "Profile",
    command: "cat profile.txt",
    output:
      "Name: 神永 陽 / Yoh Kaminaga\nUniversity: 東洋大学 情報連携学部（INIAD）\nLearning: 42 Tokyo\nFocus: Web development / AI / Community\nGitHub: @tyohs",
    gipenLine: "大学入学後から、作って学ぶを続けています",
  },
  {
    id: "projects",
    label: "Projects",
    command: "ls projects/",
    gipenLine: "作品名を選ぶとGitHubで詳しく見られます",
  },
  {
    id: "experience",
    label: "Experience",
    command: "cat experience.log",
    output:
      "2025.12–現在  StartGear Inc. フルスタック開発インターン\n2025–現在     学生技術コミュニティ geeken 代表\n2025          ハッカソンでEda.aiをチーム開発\n現在          42 TokyoでCとコンピュータ基礎を学習",
    gipenLine: "個人開発とチーム開発、どちらも経験しています",
  },
  {
    id: "skills",
    label: "Skills",
    command: "cat skills.json",
    output:
      "{\n  \"main\": [\"TypeScript\", \"React\", \"Next.js\"],\n  \"used\": [\"Supabase\", \"PostgreSQL\", \"Vercel\"],\n  \"learning\": [\"Python\", \"C\"],\n  \"interests\": [\"Realtime Web\", \"AI-assisted development\"]\n}",
    gipenLine: "TypeScriptとReactを中心に学んでいます",
  },
  {
    id: "contact",
    label: "Contact",
    command: "cat contact.md",
    output: "GitHub: https://github.com/tyohs\nRepository: github.com/tyohs/portfolio",
    gipenLine: "質問ボタンから、このポートフォリオについて聞けます",
  },
];

export const wavingGipenLines = [
  "呼びました？",
  "気になるプロジェクトはありますか？",
  "白衣が本体です",
  "質問もできますよ",
];

export const footerLinks = [
  { label: "GitHub", value: "@tyohs", href: "https://github.com/tyohs" },
  {
    label: "Source",
    value: "portfolio",
    href: "https://github.com/tyohs/portfolio",
  },
];
