const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = { success?: boolean };

export async function verifyTurnstile(
  token: string,
  remoteIp: string,
  secret: string,
  fetcher: typeof fetch = fetch,
) {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp !== "unknown") body.set("remoteip", remoteIp);
  const response = await fetcher(VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(4_000),
  });
  if (!response.ok) return false;
  const result = await response.json() as TurnstileResponse;
  return result.success === true;
}
