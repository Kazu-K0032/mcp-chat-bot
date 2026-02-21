# デプロイ手順書 — ルナ AIチャットボット

## 前提条件

| 必要なもの | 取得先 |
|---|---|
| GitHubアカウント | https://github.com |
| Vercelアカウント | https://vercel.com（GitHubアカウントでサインアップ可） |
| OpenAI APIキー | https://platform.openai.com/api-keys |

---

## Step 1: GitHubへプッシュ

ローカルの全コミットをGitHubにプッシュします。

```bash
git push origin main
```

> **確認**: `https://github.com/Kazu-K0032/mcp-chat-bot` にコードが反映されていることを確認してください。

---

## Step 2: VercelにGitHubリポジトリをインポート

1. [vercel.com/new](https://vercel.com/new) を開く
2. **「Import Git Repository」** から `mcp-chat-bot` を選択
3. 以下の設定を確認（デフォルトのままでOK）

   | 項目 | 値 |
   |---|---|
   | Framework Preset | Next.js（自動検出） |
   | Root Directory | `./` |
   | Build Command | `npm run build` |
   | Output Directory | `.next` |

---

## Step 3: 環境変数を設定

**「Environment Variables」** セクションで以下を追加します。

| Name | Value | Environments |
|---|---|---|
| `OPENAI_API_KEY` | OpenAIのAPIキー（`sk-proj-...`） | Production, Preview, Development |

> ⚠️ APIキーは絶対に公開しないでください。

---

## Step 4: デプロイ実行

**「Deploy」** ボタンをクリックします。

- ビルドログがリアルタイムで表示されます
- 完了すると本番URLが発行されます（例: `https://mcp-chat-bot-xxx.vercel.app`）

---

## Step 5: 動作確認

発行されたURLにアクセスし、以下を確認します。

- [ ] ルナのUIが正しく表示される
- [ ] 日本語でメッセージを送り、ルナが「だワン！」を混えて返答する
- [ ] 英語でメッセージを送り、「Woof!」や「*wags tail*」を混えて返答する
- [ ] 文字がストリーミングで流れるように表示される

---

## 環境変数の変更・追加

デプロイ後に環境変数を変更する場合：

1. Vercelダッシュボード → プロジェクト → **Settings → Environment Variables**
2. 変更後は **Deployments → ＋ Redeploy** で再デプロイが必要

---

## 継続的デプロイ（自動デプロイ）

`main` ブランチにプッシュするたびに自動でデプロイされます。

```bash
# コードを変更したら
git add .
git commit -m "feat: ○○を追加"
git push origin main
# → Vercelが自動的にビルド＆デプロイ
```

---

## トラブルシューティング

### ビルドエラーが発生した場合

Vercelのビルドログを確認し、エラーメッセージをチェックします。

```bash
# ローカルでビルドを確認
npm run build
```

### APIが動作しない場合

- `OPENAI_API_KEY` が正しく設定されているか確認
- OpenAI PlatformでAPIキーが有効か確認（https://platform.openai.com/usage）
- Vercelダッシュボードの **Functions** タブでAPIのログを確認

### タイムアウトエラーが発生する場合

`app/api/chat/route.ts` の先頭に以下を追加します。

```typescript
export const maxDuration = 30; // 最大30秒（Vercel Hobbyプランの上限）
```

---

## Vercel プラン別の制限

| 項目 | Hobby（無料） | Pro |
|---|---|---|
| 関数の最大実行時間 | 10秒 | 300秒 |
| 帯域幅 | 100GB/月 | 1TB/月 |
| カスタムドメイン | ○ | ○ |

> ストリーミングで長い応答を返す場合、Hobbyプランの10秒制限に注意してください。
