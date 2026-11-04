# Yoh Kaminaga Portfolio

神永 陽の経歴・活動、学歴、スキルを紹介するAstroのサイトです。静的ページに、Cloudflare Workerで動くAIの質問窓口を組み合わせています。

公開先: [yoh-kaminaga-portfolio.tyohs-lifeos.workers.dev](https://yoh-kaminaga-portfolio.tyohs-lifeos.workers.dev/)

## 開発

Node.js 22.23.4以上を使用します。CIはNode.js 24で実行します。

```sh
npm ci
npm run dev
```

## 確認と公開

```sh
npm run verify
npm run deploy:dry-run
npm run deploy
```

Cloudflare Workers Static Assetsで `dist/` を配信します。初回の公開には `npx wrangler login` によるCloudflare認証が必要です。独自ドメインは後から追加できます。

canonicalとOG画像のURLは現在のWorkers公開先を使います。独自ドメインへ移行する際は、ビルド時に `PUBLIC_SITE_URL` を指定して上書きできます。

## AIへの質問

ページ下部のチャットは、`src/data/portfolio.ts` の公開プロフィールを根拠に回答します。ブラウザーからの送信先は同じWorkerの `/api/chat` です。WorkerがOpenAI Responses APIを呼び、回答をストリーミングします。

- `OPENAI_API_KEY` はCloudflareのSecretとして登録します。値をGit、フロントエンド、通常の変数に書きません。登録コマンドは `npx wrangler secret put OPENAI_API_KEY` です。
- 使用モデルは `OPENAI_MODEL` で指定します。初期設定は `gpt-6-luna`、推論量は `none`、回答の上限は700トークンです。
- `CHAT_EXPIRES_AT` は `2026-11-25T15:00:00.000Z`（日本時間2026年11月26日0時）。期限以降はサーバー側でAPI呼び出しを停止します。
- 回数制限はサイト全体で日本時間の1日100回、IPごとに1日20回・1分5回。サイト全体の上限は `CHAT_DAILY_LIMIT` で1〜100の範囲で変更できます。エラーや停止を含め、OpenAIへの送信を試みた回数として数えます。
- 上限カウンターはSQLiteのDurable Objectで管理し、再デプロイでリセットしません。生のIPや会話本文は保存しません。IPは日ごとのハッシュとしてカウンターに使用します。
- 会話は開いているページ内だけで保持します。OpenAIには `store: false` を指定します。OpenAI側のデータの取り扱いは[公式ドキュメント](https://developers.openai.com/api/docs/guides/your-data)に従います。
- AIからのMarkdownはサニタイズし、リンクはサイト内の既知の項目と公開済みSNS・メールだけを許可します。

APIキーを使わずにUIの停止・再試行・Markdown表示を確認する場合は、`npm run build` の後に `node tests/fixtures/chat-preview.mjs` を実行します。ローカルのテストサーバーは本番には含まれません。

## 旧版

Next.js版は `archive/nextjs-2026-11-04-08326f4` ブランチに保存しています。移行開始時のコミットは `08326f431be73369ce5d9382d1ab7729ac245a42` です。Gitの履歴は引き継ぎます。

このリポジトリの新しいコミットからVercelへ自動公開しないよう、`vercel.json` でGitデプロイを無効にしています。2026年11月4日にCloudflareでの公開を確認し、旧Vercelプロジェクトを一時停止しました。

## コンテンツと素材

- 本人が確認したプロフィール、経歴・活動7件、学歴2件を掲載。
- スキルはTypeScript・React・Python。
- ギペンは本人提供の元画像を使用。本人の顔写真は掲載しません。
- SNSアイコンはIBM Carbon Icons。フォントはIBM Plex Sans JP / IBM Plex Mono。ライセンスは `public/licenses/` に保存。

## 構成

- `src/data/portfolio.ts`: 掲載内容
- `src/components/`: プロフィール、期間、経歴、正規アイコン
- `src/pages/index.astro`: メインページ
- `src/styles/global.css`: 採用デザイン
- `src/components/PortfolioChat.astro` / `src/scripts/chat.ts`: 質問UI
- `src/server/`: 公開プロフィール、OpenAI接続、回数制限
- `src/worker.ts`: APIルーティング
- `wrangler.jsonc`: Cloudflare Workers配信設定

Cloudflareの構成は[公式Astroガイド](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/#if-you-have-a-static-site)に合わせています。

