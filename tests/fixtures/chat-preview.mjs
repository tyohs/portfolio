// Local browser checks only. This server never calls OpenAI and is not deployed.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve(new URL('../../dist/', import.meta.url).pathname);
const failed = new Set();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.txt': 'text/plain' };

createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:4185');
  if (url.pathname === '/api/chat/status') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ ready: true, reason: 'ready' }));
  }
  if (url.pathname === '/api/chat' && request.method === 'POST') {
    let body = '';
    for await (const chunk of request) body += chunk;
    const question = JSON.parse(body).messages.at(-1).content;
    if (question.includes('接続エラー') && !failed.has(question)) {
      failed.add(question);
      response.writeHead(503, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify({ error: '接続テスト用のエラーです。もう一度お試しください。' }));
    }
    const text = question.includes('表示テスト')
      ? '**公開プロフィール**の確認です。<img src=x onerror="alert(1)"><script>alert(1)</script> [不正なリンク](javascript:alert(1)) [外部のリンク](https://example.invalid/) [経歴・活動](#career)'
      : '**Sansan株式会社**では、2026年8〜9月にフルタイムの就業型インターンシップに参加しました。\n\nWebメディアの検索機能について、要件定義から検索ページ・APIの実装まで取り組みました。\n\n[経歴・活動を見る](#career)';
    response.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' });
    let offset = 0;
    const timer = setInterval(() => {
      if (offset >= text.length) {
        response.end(`data: ${JSON.stringify({ type: 'done' })}\n\n`); clearInterval(timer); return;
      }
      response.write(`data: ${JSON.stringify({ type: 'delta', text: text.slice(offset, offset + 6) })}\n\n`);
      offset += 6;
    }, 100);
    response.on('close', () => clearInterval(timer));
    return;
  }
  const file = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(root + '/')) { response.writeHead(404); return response.end(); }
  try {
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }); response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(4185, '127.0.0.1', () => console.log('Local chat UI fixture: http://127.0.0.1:4185/#ask (no real API calls)'));
