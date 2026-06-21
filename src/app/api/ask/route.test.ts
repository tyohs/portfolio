import { afterEach, describe, expect, it, vi } from "vitest";
import { createAskPost, type AskDependencies } from "./route";

const env = {
  OPENAI_API_KEY: "test-openai",
  TURNSTILE_SECRET_KEY: "test-turnstile",
  UPSTASH_REDIS_REST_URL: "https://example.invalid",
  UPSTASH_REDIS_REST_TOKEN: "test-redis",
};

function request(body: unknown) {
  return new Request("http://localhost/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.2" },
    body: JSON.stringify(body),
  });
}

function dependencies(overrides: Partial<AskDependencies> = {}): AskDependencies {
  return {
    verify: vi.fn().mockResolvedValue(true),
    limit: vi.fn().mockResolvedValue(true),
    answer: vi.fn().mockResolvedValue("MinKaraはリアルタイム音楽ゲームです。"),
    ...overrides,
  };
}

afterEach(() => vi.restoreAllMocks());

describe("POST /api/ask", () => {
  it("fails closed when a required secret is missing", async () => {
    const response = await createAskPost(dependencies(), {})(request({ prompt: "hello", turnstileToken: "token" }));
    expect(response.status).toBe(503);
  });

  it("rejects prompts over 200 characters before calling services", async () => {
    const deps = dependencies();
    const response = await createAskPost(deps, env)(request({ prompt: "a".repeat(201), turnstileToken: "token" }));
    expect(response.status).toBe(400);
    expect(deps.verify).not.toHaveBeenCalled();
  });

  it("rejects failed Turnstile verification", async () => {
    const deps = dependencies({ verify: vi.fn().mockResolvedValue(false) });
    const response = await createAskPost(deps, env)(request({ prompt: "MinKara?", turnstileToken: "bad" }));
    expect(response.status).toBe(403);
    expect(deps.limit).not.toHaveBeenCalled();
  });

  it("returns 429 when either rate limit is exhausted", async () => {
    const deps = dependencies({ limit: vi.fn().mockResolvedValue(false) });
    const response = await createAskPost(deps, env)(request({ prompt: "MinKara?", turnstileToken: "ok" }));
    expect(response.status).toBe(429);
    expect(deps.answer).not.toHaveBeenCalled();
  });

  it("returns a mocked portfolio answer without exposing internals", async () => {
    const deps = dependencies();
    const response = await createAskPost(deps, env)(request({ prompt: "MinKara?", turnstileToken: "ok" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ answer: "MinKaraはリアルタイム音楽ゲームです。" });
    expect(deps.answer).toHaveBeenCalledWith("MinKara?", expect.objectContaining({ ipLimit: 5, globalLimit: 50 }));
  });
});
