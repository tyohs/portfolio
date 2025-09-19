"use client";

import { useState, FormEvent } from "react";

const sampleQuestions = [
  "自己紹介を要約して",
];

export default function AskMe() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runQuery = async (prompt: string) => {
    if (!prompt.trim()) {
      setError("質問を入力してください。");
      return;
    }
    setIsLoading(true);
    setAnswer("");
    setError(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.statusText}`);
      }

      setAnswer(data.answer ?? "");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await runQuery(input);
  };

  return (
    <div className="mt-20">
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur p-6 sm:p-8">
        <h2 className="text-xl font-bold">Ask My Portfolio</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">
          このポートフォリオの内容について、AIに質問できます。
          <br />
          例:「Othelloはどんな技術を使っていますか？」
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {sampleQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => {
                setInput(question);
                setError(null);
                void runQuery(question);
              }}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/70 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
              disabled={isLoading}
            >
              {question}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex items-start gap-3">
          <input
            name="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Othelloの先読みについて教えて"
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? "回答中..." : "質問する"}
          </button>
        </form>

        {(answer || error) && (
          <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/60 p-4">
            <h3 className="font-semibold text-sm">AIの回答</h3>
            {error && (
              <p className="text-sm text-red-500 mt-2">
                エラーが発生しました: {error}
              </p>
            )}
            {answer && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed whitespace-pre-wrap">
                {answer}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
