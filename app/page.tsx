"use client";

import { useState, useEffect, useRef } from "react";

// 4-2. メッセージの型定義
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  // 4-3. 会話履歴・ローディング状態の管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 4-7. 新しいメッセージ追加時に自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4-6. fetch で /api/chat を呼び出し、ストリーミング受信
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];

    // ユーザーメッセージを追加し、ルナの返答用の空メッセージを先行追加
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

      // ストリーミングチャンクを逐次追記
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
    <div className="flex h-screen flex-col bg-slate-950">
      {/* 4-1. ヘッダー */}
      <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-900 px-6 py-4">
        {/* 4-5. ルナのアイコン（仮：絵文字プレースホルダー） */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-900 text-xl">
          🐾
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">ルナ</h1>
          <p className="text-xs text-slate-400">かわいい犬型AI</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-400">オンライン</span>
        </div>
      </header>

      {/* 4-1. メッセージ履歴エリア */}
      <main className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl">🐾</div>
              <p className="text-lg font-medium text-slate-300">
                ルナに話しかけてみよう！
              </p>
              <p className="mt-1 text-sm text-slate-500">
                日本語でも英語でも大丈夫だワン！
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 4-4. ユーザー（右）とルナ（左）を区別して表示 */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* 4-5. ルナのアイコンをメッセージ左側に表示 */}
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-900 text-base">
                    🐾
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-sm bg-sky-600 text-white"
                      : "rounded-bl-sm bg-slate-800 text-slate-100"
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
      </main>

      {/* 4-1. 入力フォーム */}
      <footer className="border-t border-slate-800 bg-slate-900 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          {/* 4-8. 送信中は入力フォームを無効化 */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="ルナに話しかけてみよう..."
            maxLength={2000}
            className="flex-1 rounded-full bg-slate-800 px-5 py-3 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          />
          {/* 4-8. 送信中は送信ボタンを無効化 */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white transition-colors hover:bg-sky-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
