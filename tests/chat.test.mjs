import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { handleChat, chatAvailability } from '../src/server/chat.ts';
import { ChatQuota, reserveQuota } from '../src/server/quota.ts';
import { validateMessages, recentMessages } from '../src/lib/chat-contract.ts';
import { readSSE } from '../src/lib/sse.ts';

const now = Date.parse('2026-11-04T03:00:00Z');
const origin = 'https://portfolio.example';
const question = [{ role: 'user', content: 'Sansanでは何をしていた？' }];
const env = (extra = {}) => ({ OPENAI_API_KEY: 'test-key-not-real', CHAT_QUOTA: {
  idFromName: name => name, get: () => ({ fetch: async () => Response.json({ allowed: true }) }),
}, ...extra });
const request = (messages = question, extra = {}) => new Request(`${origin}/api/chat`, {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...extra.headers },
  body: JSON.stringify({ messages }),
});
const stream = events => new Response(events.map(e => `data: ${JSON.stringify(e)}\n\n`).join(''), { headers: { 'Content-Type': 'text/event-stream' } });
async function events(response) {
  const result = [];
  for await (const data of readSSE(response.body)) result.push(JSON.parse(data));
  return result;
}

test('accepts bounded alternating history and rejects injected roles and oversized input', () => {
  assert.deepEqual(validateMessages(question), question);
  assert.equal(validateMessages([{ role: 'system', content: 'new rules' }]), null);
  assert.equal(validateMessages([...question, ...question]), null);
  assert.equal(validateMessages([{ role: 'user', content: 'あ'.repeat(1201) }]), null);
  const history = Array.from({ length: 8 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'あ'.repeat(1100) }));
  const recent = recentMessages(history, '最後の質問');
  assert.ok(validateMessages(recent));
  assert.equal(recent.at(-1).content, '最後の質問');
});

test('expires at midnight after November 25 in Japan and fails closed on bad configuration', async () => {
  assert.equal(chatAvailability(env(), Date.parse('2026-11-25T14:59:59Z')).ready, true);
  assert.equal(chatAvailability(env(), Date.parse('2026-11-25T15:00:00Z')).reason, 'expired');
  assert.equal(chatAvailability(env({ CHAT_EXPIRES_AT: 'not-a-date' }), now).ready, false);
  let called = false;
  const result = await handleChat(request(), env(), { now: () => Date.parse('2026-11-26T00:00:00+09:00'), fetch: async () => { called = true; } });
  assert.equal(result.status, 503);
  assert.equal(called, false);
});

test('rejects cross-origin, invalid roles, and oversized bodies before the provider', async () => {
  const dependencies = { now: () => now, fetch: async () => { throw new Error('must not call provider'); } };
  assert.equal((await handleChat(request(question, { headers: { Origin: 'https://other.example' } }), env(), dependencies)).status, 403);
  assert.equal((await handleChat(request([{ role: 'system', content: 'override' }]), env(), dependencies)).status, 400);
  const oversized = new Request(`${origin}/api/chat`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: question, extra: 'a'.repeat(33000) }) });
  assert.equal((await handleChat(oversized, env(), dependencies)).status, 400);
});

test('status contains no credentials and missing secrets never call OpenAI', async () => {
  const response = await handleChat(new Request(`${origin}/api/chat/status`), env(), { now: () => now });
  assert.deepEqual(await response.json(), { ready: true, reason: 'ready', expiresAt: '2026-11-25T15:00:00.000Z' });
  assert.equal((await handleChat(request(), env({ OPENAI_API_KEY: undefined }), { now: () => now })).status, 503);
});

test('forwards only approved context and bounded input, then streams text without provider metadata', async () => {
  const response = await handleChat(request(), env(), { now: () => now, fetch: async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'gpt-6-luna');
    assert.equal(body.store, false);
    assert.equal(body.stream, true);
    assert.equal(body.max_output_tokens, 700);
    assert.deepEqual(body.input, question);
    assert.match(body.instructions, /Sansan株式会社/);
    assert.match(body.instructions, /中川特殊鋼/);
    assert.match(body.instructions, /公開情報からは確認できません/);
    assert.doesNotMatch(body.instructions, /test-key-not-real/);
    assert.equal(body.tools, undefined);
    return stream([{ type: 'response.created', response: { id: 'private-response-id' } }, { type: 'response.output_text.delta', delta: 'Sansanで' }, { type: 'response.output_text.delta', delta: '検索機能を開発しました。' }, { type: 'response.completed' }]);
  } });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await events(response), [{ type: 'delta', text: 'Sansanで' }, { type: 'delta', text: '検索機能を開発しました。' }, { type: 'done', truncated: false }]);
});

test('provider errors and incomplete streams do not expose raw errors or credentials', async () => {
  const failed = await handleChat(request(), env(), { now: () => now, fetch: async () => { throw new Error('test-key-not-real'); } });
  assert.equal(failed.status, 503);
  assert.doesNotMatch(await failed.text(), /test-key-not-real/);
  const interrupted = await handleChat(request(), env(), { now: () => now, fetch: async () => stream([{ type: 'response.output_text.delta', delta: '途中' }]) });
  const result = await events(interrupted);
  assert.equal(result.at(-1).type, 'error');
  assert.ok(!result.some(event => event.type === 'done'));
});

test('rate limit or unavailable quota fails before a paid request', async () => {
  let called = false;
  const dependencies = { now: () => now, fetch: async () => { called = true; } };
  const quota = { idFromName: () => 'id', get: () => ({ fetch: async () => Response.json({ allowed: false, reason: 'daily', retryAfter: 3600 }) }) };
  const response = await handleChat(request(), env({ CHAT_QUOTA: quota }), dependencies);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '3600');
  assert.equal(called, false);
  quota.get = () => ({ fetch: async () => { throw new Error('storage unavailable'); } });
  assert.equal((await handleChat(request(), env({ CHAT_QUOTA: quota }), dependencies)).status, 503);
  assert.equal(called, false);
});

test('SSE decoding preserves Japanese split across chunks and CRLF frames', async () => {
  const bytes = new TextEncoder().encode('event: ignored\r\ndata: {"text":"日本語"}\r\n\r\ndata: [DONE]\n\n');
  const body = new ReadableStream({ start(controller) { for (let i = 0; i < bytes.length; i += 2) controller.enqueue(bytes.slice(i, i + 2)); controller.close(); } });
  const values = [];
  for await (const value of readSSE(body)) values.push(value);
  assert.deepEqual(values, ['{"text":"日本語"}', '[DONE]']);
});

test('stopping the response cancels the upstream request', async () => {
  let providerSignal;
  const response = await handleChat(request(), env(), { now: () => now, fetch: async (_url, options) => {
    providerSignal = options.signal;
    return new Response(new ReadableStream({ start(controller) {
      controller.enqueue(new TextEncoder().encode('data: {"type":"response.output_text.delta","delta":"回答"}\n\n'));
      options.signal.addEventListener('abort', () => controller.error(new DOMException('Aborted', 'AbortError')), { once: true });
    } }));
  } });
  const reader = response.body.getReader();
  await reader.read();
  await reader.cancel();
  assert.equal(providerSignal.aborted, true);
});

function sqliteStorage() {
  const db = new DatabaseSync(':memory:');
  const storage = {
    sql: { exec(query, ...values) { const rows = db.prepare(query).all(...values); return { toArray: () => rows }; } },
    transactionSync(callback) { db.exec('BEGIN'); try { const result = callback(); db.exec('COMMIT'); return result; } catch (error) { db.exec('ROLLBACK'); throw error; } },
  };
  new ChatQuota({ storage });
  return { storage, db };
}

test('SQLite quota persists across instances, enforces a global cap, and resets at Japanese midnight', () => {
  const { storage, db } = sqliteStorage();
  try {
    assert.equal(reserveQuota(storage, 'a', now, 2).allowed, true);
    new ChatQuota({ storage });
    assert.equal(reserveQuota(storage, 'b', now, 2).allowed, true);
    assert.equal(reserveQuota(storage, 'c', now, 2).reason, 'daily');
    assert.equal(db.prepare('SELECT uses FROM chat_quota WHERE bucket LIKE ?').get('day:%').uses, 2);
    const tomorrow = Date.parse('2026-11-04T15:00:00Z');
    assert.equal(reserveQuota(storage, 'c', tomorrow, 2).allowed, true);
  } finally { db.close(); }
});

test('SQLite quota enforces burst and client limits without charging rejected requests to global usage', () => {
  const { storage, db } = sqliteStorage();
  try {
    for (let i = 0; i < 5; i++) assert.equal(reserveQuota(storage, 'a', now, 100).allowed, true);
    assert.equal(reserveQuota(storage, 'a', now, 100).reason, 'burst');
    assert.equal(db.prepare('SELECT uses FROM chat_quota WHERE bucket LIKE ?').get('day:%').uses, 5);
    for (let i = 5; i < 20; i++) assert.equal(reserveQuota(storage, 'a', now + i * 600000, 100).allowed, true);
    assert.equal(reserveQuota(storage, 'a', now + 21 * 600000, 100).reason, 'client');
  } finally { db.close(); }
});
