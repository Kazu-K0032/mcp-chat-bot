"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error("APIエラー");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: last.content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "エラーが発生しただワン...もう一度試してワン！🐾",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 5-1: ダークテーマ（紺ベース）
    <div className="flex h-screen flex-col bg-slate-950">

      {/* ヘッダー — 5-1: インディゴ→スレートのグラデーション */}
      <header className="flex items-center gap-3 border-b border-slate-800/60 bg-linear-to-r from-indigo-950 via-slate-900 to-slate-900 px-4 py-3 sm:px-6 sm:py-4">
        {/* 5-5: SVGアバター */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-500/50">
          <Image src="/luna-avatar.svg" alt="ルナ" width={40} height={40} />
        </div>
        <div>
          {/* 5-1: テキストグラデーション（白→ライトブルー） */}
          <h1 className="bg-linear-to-r from-white to-sky-200 bg-clip-text text-lg font-bold text-transparent">
            ルナ
          </h1>
          <p className="text-xs text-slate-400">かわいい犬型AI</p>
        </div>
        {/* オンラインバッジ（pingアニメーション） */}
        <div className="ml-auto flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs text-slate-400">オンライン</span>
        </div>
      </header>

      {/* メッセージ履歴エリア — 5-4: PCはmax-w-3xlで中央寄せ */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto h-full max-w-3xl px-4 py-4 sm:px-6">
          {messages.length === 0 ? (
            // ウェルカム画面
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="relative mx-auto mb-5 h-24 w-24 overflow-hidden rounded-full ring-4 ring-indigo-500/30 shadow-lg shadow-indigo-500/20">
                  <Image src="/luna-avatar.svg" alt="ルナ" width={96} height={96} />
                </div>
                <p className="bg-linear-to-r from-sky-300 to-indigo-300 bg-clip-text text-xl font-semibold text-transparent">
                  ルナに話しかけてみよう！
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  日本語でも英語でも大丈夫だワン！
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                // 5-2: フェードインアニメーション
                <div
                  key={index}
                  className={`flex animate-fade-in items-end gap-2 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* 5-5: ルナのSVGアバター（メッセージ左） */}
                  {message.role === "assistant" && (
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-indigo-500/40">
                      <Image src="/luna-avatar.svg" alt="ルナ" width={32} height={32} />
                    </div>
                  )}
                  {/* 5-1: メッセージバブルにシャドウ（ライトブルー/ブラック） */}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[65%] ${
                      message.role === "user"
                        ? "rounded-br-sm bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                        : "rounded-bl-sm bg-slate-800 text-slate-100 shadow-lg shadow-black/30"
                    }`}
                  >
                    {message.content !== "" ? (
                      message.content
                    ) : (
                      // タイピングインジケーター
                      <span className="inline-flex gap-1 py-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* フッター — 5-4: 入力欄もmax-w-3xlで中央寄せ */}
      <footer className="border-t border-slate-800/60 bg-linear-to-r from-indigo-950/50 via-slate-900 to-slate-900 p-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-3 sm:px-6">
          {/* 5-1: フォーカス時にライトブルーのリング */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="ルナに話しかけてみよう..."
            maxLength={2000}
            className="flex-1 rounded-full border border-slate-700/50 bg-slate-800/80 px-5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
          />
          {/* 5-3: ホバーエフェクト強化（グロー＋スケール） */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-600/30 transition-all duration-200 hover:scale-105 hover:bg-sky-500 hover:shadow-xl hover:shadow-sky-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
