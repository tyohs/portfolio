import { createHash } from "node:crypto";
import type OpenAI from "openai";
import type { Redis } from "@upstash/redis";
import { corpus } from "./data";

type CorpusVector = (typeof corpus)[number] & { embedding: number[] };
export type SearchResult = CorpusVector & { similarity: number };

const corpusDigest = createHash("sha256").update(JSON.stringify(corpus)).digest("hex");
const cacheKey = `portfolio:embeddings:${corpusDigest}`;

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return magnitudeA && magnitudeB ? dot / (magnitudeA * magnitudeB) : 0;
}

async function vectorizeCorpus(openai: OpenAI, redis: Redis): Promise<CorpusVector[]> {
  const cached = await redis.get<CorpusVector[]>(cacheKey);
  if (cached) return cached;
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: corpus.map((item) => item.text),
  });
  const vectors = corpus.map((item, index) => ({
    ...item,
    embedding: result.data[index].embedding,
  }));
  await redis.set(cacheKey, vectors, { ex: 60 * 60 * 24 * 30 });
  return vectors;
}

export async function searchCorpus(query: string, openai: OpenAI, redis: Redis, topK = 3) {
  const [vectors, queryResult] = await Promise.all([
    vectorizeCorpus(openai, redis),
    openai.embeddings.create({ model: "text-embedding-3-small", input: query }),
  ]);
  const queryVector = queryResult.data[0].embedding;
  return vectors
    .map((item) => ({ ...item, similarity: cosineSimilarity(queryVector, item.embedding) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
