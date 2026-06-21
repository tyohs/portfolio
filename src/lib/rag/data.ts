export type CorpusData = { id: string; title: string; url?: string; text: string };

export const corpus: CorpusData[] = [
  {
    id: "profile",
    title: "Profile",
    text: "神永陽は東洋大学 情報連携学部（INIAD）の学部2年生です。TypeScript、React、Next.jsを中心に、Web開発とAI活用を学んでいます。",
  },
  {
    id: "minkara",
    title: "MinKara",
    url: "https://github.com/tyohs/MinKara",
    text: "MinKaraは複数人で同じ楽曲を演奏できるリアルタイム音楽ゲームです。Next.js、TypeScript、Supabaseを利用しています。",
  },
  {
    id: "eda-ai",
    title: "Eda.ai",
    url: "https://github.com/50ki-1706/Eda.ai",
    text: "Eda.aiは会話を枝分かれさせ、複数の方向へ思考を探索するための対話UIです。ハッカソンでチーム開発しました。",
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    url: "https://github.com/tyohs/minesweeper",
    text: "MinesweeperはReactの状態管理と再帰処理を学ぶためにTypeScriptで制作した個人開発作品です。",
  },
  {
    id: "othello",
    title: "Othello",
    url: "https://github.com/tyohs/othello",
    text: "Othelloは盤面ロジックと合法手判定を実装したReact、TypeScript製の個人開発作品です。",
  },
];
