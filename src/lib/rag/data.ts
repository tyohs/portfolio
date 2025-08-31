export type CorpusData = {
  id: string;
  title: string;
  url?: string;
  text: string;
};

export const corpus: CorpusData[] = [
  {
    id: "profile",
    title: "Yoh Kaminaga's Profile",
    text: "神永 陽 (Yoh Kaminaga) は、東洋大学情報連携学部 (INIAD) に在籍する学生です。TypeScript と React を中心としたフロントエンド開発に情熱を注いでおり、特に UI/UX デザインと、軽量なAI技術の組み込みに関心があります。学内の技術コミュニティ 'iniad.ts' に所属し、ハッカソン参加や個人プロジェクトを通じて、実践的なスキルを磨いています。彼の目標は、ユーザーにとって直感的で価値のあるウェブ体験を創造することです。",
  },
  {
    id: "eda-ai",
    title: "Eda.ai (Hackathon Project)",
    url: "https://eda-ai.vercel.app/",
    text: "Eda.ai は、ハッカソンで開発されたLLM活用アプリケーションです。コンセプトは「食材からのインスピレーション」。ユーザーが持つ食材を入力すると、LLMが創造的なレシピや調理法を提案します。このプロジェクトでは、Next.js, TypeScript, Tailwind CSS を使用し、フロントエンド開発を主導しました。LLM APIとの連携部分も担当し、短期間でのプロトタイピングに貢献しました。",
  },
  {
    id: "othello",
    title: "Othello Game",
    url: "https://your-othello.vercel.app/",
    text: "TypeScript と React を用いて開発したオセロゲームです。このプロジェクトの核心は、ゲームの盤面ロジックにあります。合法手の判定とハイライト表示、さらには数手先を読む簡易的な思考（ミニマックス法）アルゴリズムを実装しました。UIはレスポンシブデザインに対応しており、PCでもスマートフォンでも快適にプレイできます。Vite を用いた高速な開発環境で構築されています。",
  },
  {
    id: "minesweeper",
    title: "Minesweeper Game",
    url: "https://your-minesweeper.vercel.app/",
    text: "クラシックなマインスイーパゲームを、TypeScript と React で再現したプロジェクトです。基本的なゲーム機能（マスの開封、フラグ立て）に加え、隣接するマスを再帰的に自動で開くロジックも実装しています。ユーザーは盤面のサイズや地雷の数を自由にカスタマイズして、好みの難易度で遊ぶことができます。状態管理の複雑さを学ぶ良い機会となりました。",
  },
  {
    id: "self-dialog-bot",
    title: "Self-Dialog Bot",
    url: "https://your-self-dialog.vercel.app/",
    text: "自己対話を促進するための軽量なウェブアプリケーションです。Python の Streamlit フレームワークを使用し、シンプルで直感的なUIを重視して開発しました。ユーザーが自身の考えや感情を入力すると、ボットが簡単な質問を投げ返し、思考の整理をサポートします。非エンジニアのユーザーでも手軽に使えることを目指した、プロダクティビティとメンタルヘルスを支援するツールです。",
  },
];
