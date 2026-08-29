"use client";

import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type AskPanelProps = { open: boolean; onClose: () => void };

export function AskPanel({ open, onClose }: AskPanelProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const widgetContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [token, setToken] = useState("");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTurnstileError("");
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  useEffect(() => {
    if (!open || !scriptReady || !siteKey || !widgetContainer.current || !window.turnstile) return;
    widgetId.current = window.turnstile.render(widgetContainer.current, {
      sitekey: siteKey,
      theme: "dark",
      size: "flexible",
      callback: (nextToken: string) => {
        setToken(nextToken);
        setTurnstileError("");
      },
      "expired-callback": () => setToken(""),
      "error-callback": (code: string | number) => {
        setToken("");
        setTurnstileError(String(code) === "110200"
          ? "この公開ドメインがTurnstileの許可対象に含まれていません。サイト管理者の設定を確認してください。"
          : "認証を完了できませんでした。ページを再読み込みしてもう一度お試しください。");
      },
    });
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
      setToken("");
    };
  }, [open, scriptReady, siteKey]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = prompt.trim();
    if (!value || value.length > 200 || !token) return;
    setLoading(true); setAnswer(""); setError("");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: value, turnstileToken: token }),
      });
      const data = await response.json() as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error();
      setAnswer(data.answer);
    } catch {
      setError("いまは回答できません。時間をおいてもう一度お試しください。");
    } finally {
      setLoading(false);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      setToken("");
    }
  }

  return (
    <div className="ask-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="ask-panel" role="dialog" aria-modal="true" aria-labelledby="ask-title">
        <header><span id="ask-title"><span className="prompt">$</span> ask gipen</span><button type="button" onClick={onClose} aria-label="質問画面を閉じる">close</button></header>
        <p>ポートフォリオに書かれている内容について、200文字以内で質問できます。</p>
        {!siteKey ? <p className="terminal-error">AI助手は現在利用できません。</p> : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="portfolio-question">question</label>
            <textarea id="portfolio-question" value={prompt} maxLength={200} onChange={(event) => setPrompt(event.target.value)} placeholder="MinKaraについて教えて" disabled={loading} autoFocus />
            <div className="ask-count">{prompt.length}/200</div>
            <div ref={widgetContainer} className="turnstile-slot" />
            {turnstileError ? <p className="terminal-error" role="alert">{turnstileError}</p> : null}
            <button className="terminal-submit" type="submit" disabled={loading || !prompt.trim() || !token}>{loading ? "running..." : "run"}</button>
          </form>
        )}
        {answer ? <pre className="ask-answer">{answer}</pre> : null}
        {error ? <p className="terminal-error" role="alert">{error}</p> : null}
      </section>
      {siteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={() => setScriptReady(true)} /> : null}
    </div>
  );
}
