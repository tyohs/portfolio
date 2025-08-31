"use client";

import { useState, FormEvent } from "react";

export default function AskMe() {
  const [input, setInput] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setCompletion("");
    setError(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.statusText}`);
      }

      setCompletion(data.answer);

    } catch (err) {
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

  return (
    <div className="relative isolate mt-20">
      <div className="absolute inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-sm z-10 rounded-2xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-200 text-yellow-900 text-sm font-semibold px-4 py-2 rounded-lg z-20 pointer-events-none">
        現在ポートフォリオの内容を聞けるAIを実装中...
      </div>

      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-6 sm:p-8">
        <h2 className="text-xl font-bold">Ask My Portfolio</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">
          このポートフォリオの内容について、AIに質問できます。
          <br />
          例:「Othelloはどんな技術を使っていますか？」
        </p>

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
            disabled={isLoading}
          >
            {isLoading ? "回答中..." : "質問する"}
          </button>
        </form>

        {(completion || error) && (
          <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 p-4">
            <h3 className="font-semibold text-sm">AIの回答</h3>
            {error && (
              <p className="text-sm text-red-500 mt-2">
                エラーが発生しました: {error}
              </p>
            )}
            {completion && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed whitespace-pre-wrap">
                {completion}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
