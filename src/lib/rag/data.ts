export type CorpusData = { id: string; title: string; url?: string; text: string };

export const corpus: CorpusData[] = [
  {
    id: "profile",
    title: "Profile",
    text: "神永陽は東洋大学 情報連携学部（INIAD）の学部2年生です。TypeScript、React、Next.jsを中心にWeb開発へ取り組み、42 TokyoではCとコンピュータ基礎を学んでいます。",
  },
  {
    id: "minkara",
    title: "MinKara",
    url: "https://github.com/tyohs/MinKara",
    text: "MinKaraはチームリーダーとして開発した、複数端末でルームと音声を同期して同じ楽曲を演奏するリアルタイム音楽ゲームです。Next.js、TypeScript、Supabaseを利用しています。",
  },
  {
    id: "eda-ai",
    title: "Eda.ai",
    url: "https://github.com/50ki-1706/Eda.ai",
    text: "Eda.aiは会話を枝分かれさせ、複数の方向へ思考を探索するための対話UIです。ハッカソンでチーム開発し、神永陽はフロントエンドを担当しました。",
  },
  {
    id: "experience",
    title: "Experience",
    text: "神永陽は2025年12月からStartGear Inc.でフルスタック開発インターンをしています。2025年から学生技術コミュニティgeekenの代表を務め、現在は42 Tokyoでも学習しています。",
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
