import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { searchCorpus } from "@/lib/rag/vector-store";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.GPT_APIKEY,
});

const postSchema = z.object({
  prompt: z.string().min(1).max(200),
});

export async function POST(req: Request) {
  console.log("--- API Route Called (RAG with Non-Streaming) ---");

  try {
    const json = await req.json();
    const { prompt: query } = postSchema.parse(json);

    // 1. 関連情報を検索 (RAGロジック復活)
    const context = await searchCorpus(query);

    // 2. プロンプトを構築 (RAGロジック復活)
    const systemPrompt = `あなたは、Yoh Kaminaga のポートフォリオに関する質問に答える、親切なAIアシスタントです。
以下の文脈情報のみに基づいて、質問に答えてください。
文脈情報に答えがない場合は、「わかりません」と正直に答えてください。
回答は、常に日本語で、簡潔に150字以内で記述してください。
回答には、関連する文脈情報の順番に基づいて、[#] の形式で参照番号を付与してください。例えば、1番目の文脈情報を使ったら [#1]、2番目なら [#2] のようにします。

文脈情報:
${context
  .map((c, i) => `[${i + 1}] ${c.title}: ${c.text}`)
  .join("---")}`;

    // 3. ストリーミングなしでAPIを呼び出す
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // モデルを元に戻します
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
      stream: false,
    });

    const content = response.choices[0].message.content;
    console.log("--- RAG Response Content ---", content);

    // 4. 結果をJSONで返す
    return NextResponse.json({ answer: content });

  } catch (error) {
    console.error("API Route Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
