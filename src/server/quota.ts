type SqlValue = string | number | null;
export interface QuotaStorage {
  sql: { exec<T = Record<string, SqlValue>>(query: string, ...values: SqlValue[]): { toArray(): T[] } };
  transactionSync<T>(callback: () => T): T;
}

export interface QuotaDecision { allowed: boolean; retryAfter?: number; reason?: 'daily' | 'client' | 'burst'; }

export function reserveQuota(storage: QuotaStorage, client: string, now: number, dailyLimit: number): QuotaDecision {
  const day = Math.floor((now + 9 * 3600000) / 86400000);
  const dayEnd = (day + 1) * 86400000 - 9 * 3600000;
  const window = Math.floor(now / 60000);
  const buckets = [
    { key: `day:${day}`, limit: dailyLimit, expires: dayEnd, reason: 'daily' as const },
    { key: `client:${day}:${client}`, limit: 20, expires: dayEnd, reason: 'client' as const },
    { key: `burst:${window}:${client}`, limit: 5, expires: (window + 1) * 60000, reason: 'burst' as const },
  ];
  return storage.transactionSync(() => {
    storage.sql.exec('DELETE FROM chat_quota WHERE expires_at <= ?', now);
    for (const bucket of buckets) {
      const used = storage.sql.exec<{ uses: number }>('SELECT uses FROM chat_quota WHERE bucket = ?', bucket.key).toArray()[0]?.uses ?? 0;
      if (used >= bucket.limit) return { allowed: false, reason: bucket.reason, retryAfter: Math.max(1, Math.ceil((bucket.expires - now) / 1000)) };
    }
    for (const bucket of buckets) {
      storage.sql.exec('INSERT INTO chat_quota (bucket, uses, expires_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET uses = uses + 1', bucket.key, bucket.expires);
    }
    return { allowed: true };
  });
}

export class ChatQuota {
  private storage: QuotaStorage;
  constructor(state: { storage: QuotaStorage }) {
    this.storage = state.storage;
    this.storage.sql.exec('CREATE TABLE IF NOT EXISTS chat_quota (bucket TEXT PRIMARY KEY, uses INTEGER NOT NULL, expires_at INTEGER NOT NULL)');
  }
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return new Response(null, { status: 405 });
    const { client, dailyLimit } = await request.json() as { client: string; dailyLimit: number };
    if (!/^[a-f0-9]{64}$/.test(client) || !Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 100) return new Response(null, { status: 400 });
    return Response.json(reserveQuota(this.storage, client, Date.now(), dailyLimit));
  }
}
