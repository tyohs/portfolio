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
let cachedClient: OpenAI | null = null;

const getOpenAI = () => {
  if (!cachedClient) {
    const apiKey = process.env.GPT_APIKEY;
    if (!apiKey) {
      throw new Error("GPT_APIKEY が設定されていません。環境変数を確認してください。");
    }
    cachedClient = new OpenAI({ apiKey });
  }
  return cachedClient;
};

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
  const openai = getOpenAI();
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
  const openai = getOpenAI();

  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryVector = queryEmbedding.data[0].embedding;

  const results = corpusVectors.map((v) => ({
    ...v,
    similarity: cosineSimilarity(queryVector, v.embedding),
  }));

  const sorted = results.sort((a, b) => b.similarity - a.similarity);
  const filtered = sorted.filter((item, index) => item.similarity > 0.12 || index === 0);

  return filtered.slice(0, topK);
};
