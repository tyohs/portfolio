import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { searchCorpus } from "@/lib/rag/vector-store";
import { verifyTurnstile } from "@/lib/security/turnstile";

export const runtime = "nodejs";

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(200),
  turnstileToken: z.string().min(1).max(2048),
}).strict();

type AskConfig = {
  openAiKey: string;
  turnstileSecret: string;
  redisUrl: string;
  redisToken: string;
  ipLimit: number;
  globalLimit: number;
  timeoutMs: number;
};

export type AskDependencies = {
  verify: typeof verifyTurnstile;
  answer: (prompt: string, config: AskConfig) => Promise<string>;
  limit: (ip: string, config: AskConfig) => Promise<boolean>;
};

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

type Environment = Record<string, string | undefined>;

function readConfig(env: Environment): AskConfig | null {
  const { OPENAI_API_KEY, TURNSTILE_SECRET_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = env;
  if (!OPENAI_API_KEY || !TURNSTILE_SECRET_KEY || !UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) return null;
  return {
    openAiKey: OPENAI_API_KEY,
    turnstileSecret: TURNSTILE_SECRET_KEY,
    redisUrl: UPSTASH_REDIS_REST_URL,
    redisToken: UPSTASH_REDIS_REST_TOKEN,
    ipLimit: positiveInteger(env.ASK_IP_LIMIT, 5),
    globalLimit: positiveInteger(env.ASK_GLOBAL_DAILY_LIMIT, 50),
    timeoutMs: positiveInteger(env.ASK_TIMEOUT_MS, 12_000),
  };
}

async function checkLimits(ip: string, config: AskConfig) {
  const redis = new Redis({ url: config.redisUrl, token: config.redisToken });
  const perIp = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(config.ipLimit, "10 m"), prefix: "portfolio:ask:ip" });
  const global = new Ratelimit({ redis, limiter: Ratelimit.fixedWindow(config.globalLimit, "1 d"), prefix: "portfolio:ask:global" });
  const ipResult = await perIp.limit(ip);
  if (!ipResult.success) return false;

  const globalResult = await global.limit("all");
  return globalResult.success;
}

async function answerQuestion(prompt: string, config: AskConfig) {
  const openai = new OpenAI({ apiKey: config.openAiKey, timeout: config.timeoutMs, maxRetries: 1 });
  const redis = new Redis({ url: config.redisUrl, token: config.redisToken });
  const context = await searchCorpus(prompt, openai, redis);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 180,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `あなたは神永陽のポートフォリオ案内役です。次の情報だけを根拠に日本語で簡潔に答えてください。情報がなければ「ポートフォリオには記載がありません」と答えてください。個人情報を推測しないでください。\n\n${context.map((item) => `${item.title}: ${item.text}`).join("\n")}`,
      },
      { role: "user", content: prompt },
    ],
  });
  return (completion.choices[0]?.message.content ?? "回答を生成できませんでした。").slice(0, 400);
}

const defaultDependencies: AskDependencies = {
  verify: verifyTurnstile,
  answer: answerQuestion,
  limit: checkLimits,
};

export function createAskPost(dependencies: AskDependencies = defaultDependencies, env: Environment = process.env) {
  return async function post(request: Request) {
    const config = readConfig(env);
    if (!config) return NextResponse.json({ error: "AI assistant unavailable" }, { status: 503 });
    try {
      const input = requestSchema.parse(await request.json());
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      if (!await dependencies.verify(input.turnstileToken, ip, config.turnstileSecret)) {
        return NextResponse.json({ error: "Request could not be verified" }, { status: 403 });
      }
      if (!await dependencies.limit(ip, config)) {
        return NextResponse.json({ error: "Please try again later" }, { status: 429 });
      }
      const answer = await dependencies.answer(input.prompt, config);
      return NextResponse.json({ answer });
    } catch (error) {
      if (error instanceof z.ZodError || error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }
      return NextResponse.json({ error: "AI assistant unavailable" }, { status: 503 });
    }
  };
}

export const POST = createAskPost();
