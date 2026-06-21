import { describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "./turnstile";

describe("verifyTurnstile", () => {
  it("sends the token and remote IP to Cloudflare", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    await expect(verifyTurnstile("token", "203.0.113.4", "secret", fetcher)).resolves.toBe(true);
    const [, init] = fetcher.mock.calls[0];
    expect(String(init.body)).toContain("response=token");
    expect(String(init.body)).toContain("remoteip=203.0.113.4");
  });

  it("fails closed on a non-success response", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 }));
    await expect(verifyTurnstile("token", "unknown", "secret", fetcher)).resolves.toBe(false);
  });
});
