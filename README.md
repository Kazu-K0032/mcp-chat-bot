# ルナ 🐾 — AIチャットボット

かわいくデフォルメされた犬型AIキャラクター「ルナ」と雑談できるエンターテインメント向けチャットボットです。

![ルナ](public/luna-avatar.svg)

## 特徴

- 🐶 **キャラクター**: かわいい犬型AI「ルナ」が明るく元気に応答
- 🌐 **日英自動切替**: 日本語・英語どちらで話しかけても自動で対応
- ⚡ **ストリーミング**: 文字がリアルタイムで流れるように表示
- 🌙 **ダークテーマ**: 宇宙・深紫・ライトブルーのリッチなUI
- 📱 **レスポンシブ**: スマートフォン・PCどちらでも快適に使用可能

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | Next.js 15 (App Router) + TypeScript |
| AIエージェント | Mastra |
| AIモデル | gpt-4o (OpenAI) |
| スタイリング | Tailwind CSS v4 |
| デプロイ | Vercel |

## ローカル起動

### 必要条件

- Node.js 18以上
- OpenAI APIキー（[OpenAI Platform](https://platform.openai.com/api-keys)で取得）

### セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/Kazu-K0032/mcp-chat-bot.git
cd mcp-chat-bot

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集して OPENAI_API_KEY を設定

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてルナと会話できます。

### 環境変数

`.env.local` ファイルに以下を設定してください：

```env
OPENAI_API_KEY=your_api_key_here
```

## Vercel デプロイ

### 1. GitHubリポジトリをVercelにインポート

[vercel.com/new](https://vercel.com/new) からこのリポジトリをインポートします。

### 2. 環境変数を設定

Vercelダッシュボードの **Settings → Environment Variables** で以下を追加：

| 変数名 | 値 |
|---|---|
| `OPENAI_API_KEY` | OpenAI PlatformのAPIキー |

### 3. デプロイ

`main` ブランチへのプッシュで自動的にデプロイされます。

## プロジェクト構造

```
app/
├── page.tsx              # チャット画面（メインUI）
├── api/chat/route.ts     # Mastraエージェント呼び出し + ストリーミング
├── layout.tsx
└── globals.css

lib/
└── mastra/
    ├── index.ts          # Mastraインスタンス初期化
    └── agents/
        └── luna.ts       # ルナエージェント定義（システムプロンプト）

public/
└── luna-avatar.svg       # ルナのキャラクターアイコン
```

## ライセンス

MIT
