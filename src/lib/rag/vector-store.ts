import OpenAI from "openai";
import { corpus } from "./data";

// 1. ベクトル計算のヘルパー関数
const cosineSimilarity = (a: number[], b: number[]) => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

// 2. OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.GPT_APIKEY,
});

// 3. コーパスのベクトル化とキャッシュ
type CorpusVector = {
  id: string;
  title: string;
  text: string;
  url?: string;
  embedding: number[];
};

let vectorizedCorpus: CorpusVector[] | null = null;

const vectorizeCorpus = async (): Promise<CorpusVector[]> => {
  if (vectorizedCorpus) {
    return vectorizedCorpus;
  }

  console.log("Creating embeddings for the corpus...");
  const embeddings = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: corpus.map((c) => c.text),
  });

  vectorizedCorpus = corpus.map((c, i) => ({
    ...c,
    embedding: embeddings.data[i].embedding,
  }));
  console.log("Embeddings created and cached.");

  return vectorizedCorpus;
};

// 4. 検索関数の実装
export type SearchResult = {
  id: string;
  title: string;
  text: string;
  url?: string;
  similarity: number;
};

export const searchCorpus = async (query: string, topK = 4): Promise<SearchResult[]> => {
  const corpusVectors = await vectorizeCorpus();

  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryVector = queryEmbedding.data[0].embedding;

  const results = corpusVectors.map((v) => ({
    ...v,
    similarity: cosineSimilarity(queryVector, v.embedding),
  }));

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
};
