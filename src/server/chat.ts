import { DEFAULT_EXPIRY, validateMessages, type ChatEvent } from '../lib/chat-contract.ts';
import { readSSE } from '../lib/sse.ts';
import { portfolioInstructions } from './knowledge.ts';
import type { QuotaDecision } from './quota.ts';

export interface ChatEnv {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  CHAT_EXPIRES_AT?: string;
  CHAT_DAILY_LIMIT?: string;
  CHAT_QUOTA?: { idFromName(name: string): unknown; get(id: unknown): { fetch(request: Request): Promise<Response> } };
}
interface Dependencies { now?: () => number; fetch?: typeof fetch; }
const MAX_BODY_BYTES = 32768;
const UNAVAILABLE = 'ただいまAIに接続できません。少し時間をおいて、もう一度お試しください。';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

function json(value: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return Response.json(value, { status, headers: { ...headers, ...extra } });
}

export function chatAvailability(env: ChatEnv, now: number) {
  const expiresAt = env.CHAT_EXPIRES_AT ?? DEFAULT_EXPIRY;
  const expiry = Date.parse(expiresAt);
  if (!Number.isFinite(expiry)) return { ready: false, reason: 'unavailable', expiresAt: DEFAULT_EXPIRY };
  if (now >= expiry) return { ready: false, reason: 'expired', expiresAt };
  const ready = Boolean(env.OPENAI_API_KEY?.trim() && env.CHAT_QUOTA);
  return { ready, reason: ready ? 'ready' : 'setup', expiresAt };
}

async function readBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) throw new Error('body too large');
  if (!request.body) throw new Error('empty body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new Error('body too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function handleChat(request: Request, env: ChatEnv, dependencies: Dependencies = {}): Promise<Response> {
  const now = (dependencies.now ?? Date.now)();
  const url = new URL(request.url);
  const availability = chatAvailability(env, now);
  if (url.pathname === '/api/chat/status' && request.method === 'GET') return json(availability);
  if (url.pathname !== '/api/chat') return json({ error: '見つかりません。' }, 404);
  if (request.method !== 'POST') return json({ error: '送信方法を確認してください。' }, 405, { Allow: 'POST' });
  if (request.headers.get('Origin') !== url.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return json({ error: 'このサイトの質問欄から送信してください。' }, 403);
  if (!availability.ready) return json({ error: availability.reason === 'expired' ? 'AIへの質問受付は終了しました。お問い合わせはメールからお願いします。' : 'AIの接続を準備しています。お問い合わせはメールからお願いします。' }, 503);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({ error: '送信内容を確認してください。' }, 415);
  let messages;
  try {
    const body = await readBody(request) as { messages?: unknown };
    messages = validateMessages(body?.messages);
  } catch { return json({ error: '送信内容が大きすぎるか、形式が正しくありません。' }, 400); }
  if (!messages) return json({ error: '質問は1200文字以内で入力してください。会話が長い場合は、新しい会話を始めてください。' }, 400);
  if (request.signal.aborted) return json({ error: '送信を中止しました。' }, 400);
  const dailyLimit = Number(env.CHAT_DAILY_LIMIT ?? '100');
  if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 100) return json({ error: UNAVAILABLE }, 503);
  let decision: QuotaDecision;
  try {
    const ip = request.headers.get('CF-Connecting-IP') ?? 'local';
    const day = Math.floor((now + 9 * 3600000) / 86400000);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${day}:${ip}`));
    const client = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const id = env.CHAT_QUOTA!.idFromName('portfolio-chat-budget');
    const quota = await env.CHAT_QUOTA!.get(id).fetch(new Request('https://quota/consume', { method: 'POST', body: JSON.stringify({ client, dailyLimit }) }));
    if (!quota.ok) throw new Error('quota unavailable');
    decision = await quota.json() as QuotaDecision;
    if (typeof decision.allowed !== 'boolean') throw new Error('quota invalid');
  } catch { return json({ error: UNAVAILABLE }, 503); }
  if (!decision.allowed) return json({ error: decision.reason === 'daily' ? '本日のAIの利用上限に達しました。また明日ご利用ください。' : decision.reason === 'client' ? '本日の質問回数の上限に達しました。また明日ご利用ください。' : '短い時間に質問が続いています。少し時間をおいてお試しください。' }, 429, { 'Retry-After': String(decision.retryAfter ?? 600) });

  const abort = new AbortController();
  const cancel = () => abort.abort();
  request.signal.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(cancel, 45000);
  const cleanup = () => { clearTimeout(timer); request.signal.removeEventListener('abort', cancel); };
  let upstream: Response;
  try {
    upstream = await (dependencies.fetch ?? fetch)('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.OPENAI_MODEL ?? 'gpt-6-luna',
        instructions: portfolioInstructions(now),
        input: messages,
        stream: true,
        store: false,
        reasoning: { effort: 'none' },
        max_output_tokens: 700,
        service_tier: 'default',
      }),
      signal: abort.signal,
    });
  } catch { cleanup(); return json({ error: UNAVAILABLE }, 503); }
  if (!upstream.ok || !upstream.body) {
    abort.abort(); cleanup();
    return json({ error: UNAVAILABLE }, 503);
  }
  const encoder = new TextEncoder();
  const body = upstream.body;
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => { if (!cancelled) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)); };
      let textReceived = false;
      let completed = false;
      try {
        for await (const data of readSSE(body)) {
          if (data === '[DONE]') break;
          const event = JSON.parse(data) as { type: string; delta?: string };
          if ((event.type === 'response.output_text.delta' || event.type === 'response.refusal.delta') && typeof event.delta === 'string') {
            textReceived ||= Boolean(event.delta);
            send({ type: 'delta', text: event.delta });
          } else if (event.type === 'response.completed' || event.type === 'response.incomplete') {
            if (!textReceived) throw new Error('empty response');
            completed = true;
            send({ type: 'done', truncated: event.type === 'response.incomplete' });
            break;
          } else if (event.type === 'response.failed' || event.type === 'error') throw new Error('upstream failed');
        }
        if (!completed && !cancelled) throw new Error('response interrupted');
      } catch { if (!cancelled) send({ type: 'error', message: UNAVAILABLE }); }
      finally { abort.abort(); cleanup(); if (!cancelled) controller.close(); }
    },
    cancel() { cancelled = true; abort.abort(); cleanup(); },
  });
  return new Response(stream, { headers: { ...headers, 'Content-Type': 'text/event-stream; charset=utf-8', 'X-Accel-Buffering': 'no' } });
}
