import { NextResponse } from "next/server";
import type { MessageInput } from "@mastra/core/agent/message-list";
import { lunaAgent } from "@/lib/mastra/agents/luna";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 100;

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages } = body as { messages?: unknown };

  // バリデーション: messages は空でない配列であること
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages は空でない配列である必要があります" },
      { status: 400 }
    );
  }

  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: "メッセージ数が多すぎます" },
      { status: 400 }
    );
  }

  // 各メッセージのバリデーション
  for (const msg of messages) {
    if (
      typeof msg !== "object" ||
      msg === null ||
      !("role" in msg) ||
      !("content" in msg)
    ) {
      return NextResponse.json(
        { error: "メッセージの形式が不正です" },
        { status: 400 }
      );
    }

    const { role, content } = msg as Message;

    if (role !== "user" && role !== "assistant") {
      return NextResponse.json(
        { error: "role は user または assistant である必要があります" },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "メッセージ内容が空です" },
        { status: 400 }
      );
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください` },
        { status: 400 }
      );
    }
  }

  // Mastraエージェントでストリーミング呼び出し
  const agentStream = await lunaAgent.stream(messages as MessageInput[]);

  // textStream を ReadableStream に変換して返す
  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of agentStream.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
