export interface PeriodData {
  start: string;
  end: string | null;
  current: boolean | null;
  endIsExpected?: boolean;
}

export interface Experience extends PeriodData {
  id: string;
  organization: string;
  title: string;
  employmentType: string | null;
  description: string;
}

export interface Education extends PeriodData {
  id: string;
  organization: string;
  field: string;
}

export const profile = {
  "name": "神永 陽",
  "roman": "Yoh Kaminaga",
  "occupation": "Web開発・AIコンサルタント",
  "community": "GeeKEN代表",
  "affiliations": "東洋大学 INIAD · 42 Tokyo · 29卒",
  "email": "yoh.kaminaga@gmail.com"
};

export const experiences: Experience[] = [
  {
    "id": "nakagawa",
    "organization": "中川特殊鋼（株）",
    "title": "AIプロダクト開発エンジニア",
    "employmentType": "インターンシップ",
    "start": "2026-11",
    "end": null,
    "current": true,
    "description": ""
  },
  {
    "id": "gld",
    "organization": "GLD LAB",
    "title": "Webエンジニア",
    "employmentType": null,
    "start": "2026-10",
    "end": null,
    "current": true,
    "description": ""
  },
  {
    "id": "sansan",
    "organization": "Sansan株式会社",
    "title": "Webエンジニア",
    "employmentType": "インターンシップ",
    "start": "2026-08",
    "end": "2026-09",
    "current": false,
    "description": "フルタイムの就業型インターンシップに参加しました。\n\n■ 担当業務\n・Webメディアの検索機能について、要件定義から検索ページ・APIの実装まで取り組みました。\n・コードレビューを通じて、既存の設計や利用者の目的を踏まえた実装を学びました。"
  },
  {
    "id": "succeed",
    "organization": "株式会社サクシード",
    "title": "中学校・高等学校 外部講師（情報・プログラミング）",
    "employmentType": "フリーランス",
    "start": "2026-06",
    "end": null,
    "current": true,
    "description": "中学校・高等学校の生徒に、プログラミングやAIの基礎を指導。"
  },
  {
    "id": "freelance",
    "organization": "フリーランス",
    "title": "ソフトウェアエンジニア・AIコンサルタント",
    "employmentType": "フリーランス",
    "start": "2025-11",
    "end": null,
    "current": true,
    "description": "AIツール・エージェントやWebアプリケーションの開発に携わりました。\n\n■ AIコンサルタント・AIツール、エージェント開発\n・Slack,Notionを入り口に、普段AIを使わない人でも簡単に議事録を作成・編集できるAIエージェントを開発。\n・営業担当者へのヒアリングをもとに、AIを活用した営業リスト作成の仕組みを実装。\n\n■ Webアプリケーション開発\n・フロントエンド・バックエンドを担当。\n・LP作成から日程調整アプリなどの社内ツールの開発に携わる。\n\n使用技術：Python、TypeScript、React、Next.js、Microsoft Azure AI Foundry"
  },
  {
    "id": "geeken",
    "organization": "GeeKEN",
    "title": "学生団体 情報技術メディア研究会 創設代表",
    "employmentType": null,
    "start": "2025-10",
    "end": null,
    "current": null,
    "description": "学生団体の創設・運営／ハッカソン・イベント運営"
  },
  {
    "id": "kadokawa",
    "organization": "学校法人角川ドワンゴ学園",
    "title": "教育アシスタント",
    "employmentType": "インターンシップ",
    "start": "2025-04",
    "end": "2026-03",
    "current": false,
    "description": "ティーチングアシスタントとして、生徒のAI・プログラミング学習を支援しました。\n\n・プログラミングの学習・制作課題に関する質問対応や、課題解決のサポート。\n・授業の運営を補助し、生徒が学習を進められるよう支援。\n・グループワークでの議論やアイデア出しを支援。"
  }
];

export const education: Education[] = [
  {
    "id": "42",
    "organization": "42 Tokyo",
    "field": "コンピューターサイエンス／ソフトウェアエンジニアリング",
    "start": "2026-04",
    "end": null,
    "current": true,
    "endIsExpected": false
  },
  {
    "id": "toyo",
    "organization": "東洋大学",
    "field": "情報連携学部（INIAD）",
    "start": "2025-04",
    "end": "2029-03",
    "current": true,
    "endIsExpected": true
  }
];

export const skills = ['TypeScript', 'React', 'Python'] as const;

export const socials = [
  {
    "label": "LinkedIn",
    "url": "https://www.linkedin.com/in/%E9%99%BD-%E7%A5%9E%E6%B0%B8-64154842a/",
    "icon": "LinkedIn"
  },
  {
    "label": "GitHub",
    "url": "https://github.com/tyohs",
    "icon": "GitHub"
  },
  {
    "label": "X",
    "url": "https://x.com/tyohs4",
    "icon": "X"
  },
  {
    "label": "Instagram",
    "url": "https://www.instagram.com/yoh84928/",
    "icon": "Instagram"
  }
] as const;

