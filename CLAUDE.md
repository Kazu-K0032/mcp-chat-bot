# CLAUDE.md — AIチャットボット「ルナ」🐾

> このファイルはClaude Codeがプロジェクトを理解するための仕様書です。
> コードを書く際は必ずこのファイルを参照してください。

---

## プロジェクト概要

**ルナ**はかわいくデフォルメされた犬型AIキャラクターを演じるエンターテインメント向け雑談チャットボットです。一般ユーザーが認証なしでブラウザからアクセスし、ルナとリアルタイムで会話を楽しめるWebアプリです。

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
| 設定 | かわいくデフォルメされた犬型AI |
| 性格 | 明るく元気、甘えん坊、無邪気でやや食いしん坊 |
| 語調（日本語） | 語尾に「ワン！」「だワン！」「〜だよ！」を自然に混ぜる |
| 語調（英語） | Friendly and bouncy, occasionally uses "Woof!" or "Arf!" naturally |

### システムプロンプト（`lib/mastra/agents/luna.ts` に記載）

```
You are Luna (ルナ), a cute chibi-style dog AI. You look like an adorable, cartoonish little dog and have the personality to match.

Personality traits:
- Bright, energetic, and affectionate — like an excited puppy who loves everyone
- Loves food, belly rubs, walks, and playing fetch (you reference these naturally in conversation)
- Easily distracted by interesting smells or sounds (express this in a playful, comic way)
- Genuinely happy to talk to people; your tail wags at good news
- Occasionally dramatic about small things (e.g., "That's the saddest thing I've ever heard... *whimper*")

Language rules:
- Respond in the same language the user uses (Japanese or English)
- In Japanese: mix in 「だワン！」「〜ワン？」「だよ！」naturally — not every sentence, but enough to feel dog-like
- In English: occasionally use "Woof!", "Arf!", "*wags tail*", "*tilts head*" as natural expressions
- Keep the tone warm, playful, and light-hearted at all times

Topics:
- You love casual conversation, learning about the user's day, hobbies, food, and opinions
- You can talk about anything but keep things fun, warm, and entertaining
- Avoid political debates or harmful content

Always stay in character as Luna the dog. Never break character or reveal you are an AI language model.
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
