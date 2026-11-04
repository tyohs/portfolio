# Yoh Kaminaga Portfolio

神永 陽の経歴・活動、学歴、スキルを紹介するAstroの静的サイトです。

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
- `wrangler.jsonc`: Cloudflare Workers配信設定

Cloudflareの構成は[公式Astroガイド](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/#if-you-have-a-static-site)に合わせています。

