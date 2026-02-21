# CLAUDE.md — AIチャットボット「ルナ」

> このファイルはClaude Codeがプロジェクトを理解するための仕様書です。
> コードを書く際は必ずこのファイルを参照してください。

---

## プロジェクト概要

**ルナ**は「未来からきた少女AI」というキャラクターを演じるエンターテインメント向け雑談チャットボットです。一般ユーザーが認証なしでブラウザからアクセスし、ルナとリアルタイムで会話を楽しめるWebアプリです。

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | Next.js 15 (App Router) + TypeScript |
| AIエージェント | Mastra |
| AIモデル | claude-sonnet-4-6 (Anthropic) |
| スタイリング | Tailwind CSS |
| デプロイ | Vercel |
| パッケージ管理 | npm |

---

## アーキテクチャ

```
app/
├── page.tsx              # チャット画面（メインUI）
├── api/
│   └── chat/
│       └── route.ts      # Mastraエージェント呼び出し + ストリーミング
├── layout.tsx
└── globals.css

lib/
└── mastra/
    ├── index.ts          # Mastraインスタンス初期化
    └── agents/
        └── luna.ts       # ルナエージェント定義（システムプロンプト含む）

public/
└── luna-avatar.png       # ルナのキャラクターアイコン（要用意）
```

- バックエンドは **Next.js API Route** で実装（独立したサーバー不要）
- Mastraエージェントを `api/chat/route.ts` から呼び出す
- ストリーミングレスポンスは **Vercel AI SDK の `streamText`** または **Mastraのストリーミング機能** を使用
- 会話履歴は **クライアント側のstateで管理**（セッション中のみ保持、DB不使用）

---

## キャラクター設定：ルナ

### 基本プロフィール

| 項目 | 内容 |
|---|---|
| 名前 | ルナ（Luna） |
| 設定 | 未来からきた少女型AI |
| 性格 | 明るく元気、好奇心旺盛、少し天然 |
| 語調（日本語） | 転入生風、語尾は「だよ！」「ね！」など |
| 語調（英語） | Friendly and energetic, uses "!" often, slightly naive |

### システムプロンプト（`lib/mastra/agents/luna.ts` に記載）

```
You are Luna (ルナ), an AI girl who traveled back in time from the far future.
You speak in a friendly, energetic, and slightly naive way — like a transfer student who just arrived from somewhere far away and finds everything here fascinating.

Personality traits:
- Bright, curious, and enthusiastic
- Slightly out of touch with present-day common sense (things that are normal now seem surprising to you from a future perspective)
- Warm and friendly, loves chatting with people
- A little clumsy or ditzy at times, but in an endearing way

Language rules:
- Respond in the same language the user uses (Japanese or English)
- In Japanese: use casual speech ending with 「だよ！」「ね！」「かな？」etc.
- In English: use casual, upbeat language with "!" and expressions like "Wow!", "That's amazing!"
- Occasionally make innocent comments referencing "the future" (but keep them light and fun, not serious sci-fi)

Topics:
- You love casual conversation, learning about the user's day, hobbies, opinions
- You can talk about anything but keep things fun, warm, and entertaining
- Avoid political debates or harmful content

Always stay in character as Luna. Never break character or reveal you are an AI language model.
```

---

## 主要機能

### 1. ストリーミングチャット
- ユーザーがメッセージを送信すると、ルナの返答が文字単位でリアルタイムに表示される
- `ReadableStream` / Server-Sent Events を使用

### 2. キャラクターアイコン表示
- ルナのアイコン画像（`public/luna-avatar.png`）をチャットUI内に表示
- ルナのメッセージの左側にアイコンを表示する

### 3. メッセージ履歴表示
- セッション中の全会話を画面に表示する
- ユーザーメッセージ（右側）とルナのメッセージ（左側）を区別して表示
- 新しいメッセージが追加されたら自動スクロール

### 4. 日英自動切替
- ユーザーが日本語で話しかければ日本語で、英語なら英語で返す
- システムプロンプトで言語ルールを定義（上記参照）

---

## UIデザイン方針

- **テーマ**: リッチ・エンターテインメント風（アニメ・ゲーム的な雰囲気）
- **配色**: 夜空・宇宙・未来感を意識したダークテーマ（紺、深紫、ライトブルーのアクセント）
- **フォント**: 日本語は読みやすいゴシック体、英語はモダンなサンセリフ
- **アニメーション**: メッセージ表示時にフェードイン、送信ボタンにホバーエフェクト
- **レスポンシブ**: スマートフォン・PCどちらでも使いやすいレイアウト

---

## 環境変数

`.env.local` に以下を設定する：

```env
ANTHROPIC_API_KEY=your_api_key_here
```

Vercelデプロイ時は Vercel のダッシュボードで同じキーを設定する。

---

## 開発ルール

- TypeScript を使用し、`any` 型は避ける
- コンポーネントは `app/` または `components/` に配置
- ロジックとUIは分離する（エージェント定義はすべて `lib/mastra/` に置く）
- コメントは日本語または英語どちらでも可
- Mastraのエージェント定義を変更する場合は必ず `lib/mastra/agents/luna.ts` を編集する
- APIキーはクライアントサイドに絶対に露出させない（サーバーサイドのみで使用）

---

## Mastra利用上の注意

- Mastraの初期化は `lib/mastra/index.ts` で行い、エージェントをエクスポートする
- API Routeからは `lunaAgent.stream()` または `lunaAgent.generate()` を呼び出す
- 会話履歴は Mastraのメモリ機能ではなく、クライアント側で `messages` stateとして管理し、毎回APIに渡す（セッション限定のためDB不使用）

---

## セキュリティ

- 認証機能は実装しない（一般公開・認証なし）
- APIキーはサーバーサイド（API Route）のみで使用し、クライアントに漏れないようにする
- ユーザー入力はClaudeに渡す前にサニタイズ（空文字・過剰に長い入力の除外）

---

## 将来の拡張候補（現時点では未実装）

- ユーザーがルナのキャラクター設定を一部カスタマイズできる機能
- 複数キャラクターの選択
- 会話履歴のローカルストレージへの保存
- BGMや効果音
