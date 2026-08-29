# Yoh Kaminaga Portfolio

神永陽の公開プロジェクトと学習記録を、ターミナルUIで紹介するポートフォリオです。画面右下の「ぎぺん」は、表示中のセクションに反応し、明示的に「質問する」を選んだときだけAI質問画面を開きます。

## Tech stack

- Next.js 15 / React 19 / TypeScript
- Motion（スクロール・マスコットアニメーション）
- OpenRouter API（ポートフォリオ内の情報に限定した回答）
- Cloudflare Turnstile（bot対策）
- Upstash Redis（rate limit・embedding cache）
- Vitest / ESLint / GitHub Actions

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

AI機能を使わずUIだけ確認する場合、環境変数は空のままで構いません。必要な値が1つでも欠けると、AI機能は安全のため無効になります。

| Environment variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | ブラウザで表示するTurnstile site key |
| `TURNSTILE_SECRET_KEY` | Turnstile server verification |
| `OPENROUTER_API_KEY` | OpenRouterのサーバー専用API key |
| `OPENROUTER_CHAT_MODEL` | 回答生成モデル（明示指定・必須） |
| `OPENROUTER_EMBEDDING_MODEL` | embeddingモデル（例: `openai/text-embedding-3-small`） |
| `OPENROUTER_SITE_URL` | OpenRouterへ送る任意のサイトURL (`HTTP-Referer`) |
| `OPENROUTER_APP_NAME` | OpenRouterへ送る任意のアプリ名 (`X-OpenRouter-Title`) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis access token |
| `ASK_IP_LIMIT` | 10分あたりのIP別上限（既定: 5） |
| `ASK_GLOBAL_DAILY_LIMIT` | 1日あたりの全体上限（既定: 50） |
| `ASK_TIMEOUT_MS` | OpenRouter timeout（既定: 12000ms） |

Turnstileでは、本番ドメインとは別に `localhost` を許可したsite keyを用意してください。秘密値を `NEXT_PUBLIC_` 付きの変数へ入れないでください。

`OPENROUTER_API_KEY` は `.env.local` またはVercelのEnvironment Variablesへ登録し、Gitへcommitしないでください。OpenRouter側では、万一の濫用時にも請求が膨らまないよう、用途専用keyを作成してcredit limitを小さく設定する運用を推奨します。モデル名は価格と提供状況を確認して明示的に設定してください。

## Security design

- API入力は `{ prompt, turnstileToken }` のみを受け取り、質問は200文字までに制限
- Turnstile検証後に、IP別5回/10分・全体50回/日のrate limitを適用
- コーパスembeddingは内容のSHA-256 digestをキーに30日間キャッシュ
- OpenRouterの出力token数、timeout、retry回数、最終文字数を制限
- promptや回答本文をログへ記録しない
- 内部エラー、外部サービスの応答、秘密値をクライアントへ返さない

IP制限はVercel等の信頼できるreverse proxyが設定する `x-forwarded-for` の先頭値を利用します。独自インフラへ移す場合は、信頼するproxyとヘッダーの設定を再確認してください。

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

デプロイ後の疎通確認には `GET /api/health` を使えます。レスポンスに秘密値やユーザー入力は含めません。

## AI disclosure

このポートフォリオの質問機能はOpenRouter経由で設定した生成AIモデルを利用します。回答対象はリポジトリ内の短い紹介文に限定し、記載がない情報を推測しないよう指示しています。ただし生成内容が常に正しい保証はありません。プロジェクトの正確な内容は各GitHubリポジトリを確認してください。

実装とリファクタリングではAIコーディング支援を利用し、内容・セキュリティ設計・動作確認は人間が確認する前提です。

## Credits

「ぎぺん」の画像素材は、ユーザー提供の既存ポートフォリオ素材を再利用しています。無断での再配布・二次利用は行わないでください。
