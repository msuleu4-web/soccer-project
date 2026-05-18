# ⚽ Goal Labo（ゴールラボ）

> Manchester United を中心に、サッカーファンのための情報・コミュニティ・AI体験を一つに集約したフルスタック Web アプリ

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

---

## 📌 プロジェクト概要

**Goal Labo** は、サッカーファンが「ニュースを読む・順位を確認する・仲間と語り合う・AIと遊ぶ」をすべて一箇所でできるように設計した個人フルスタックプロジェクトです。

バックエンドには **Supabase**（PostgreSQL + Row Level Security）、フロントエンドには **Next.js 14 App Router** を採用。外部 AI API（Gemini・Groq）を組み合わせることで、チャットボットや試合シミュレーターといった独自の体験を提供しています。

---

## 🚀 主な機能

### 1. ダッシュボード（トップページ）
- 最新サッカーニュースをリアルタイム取得（NewsData API）
- プレミアリーグ順位表（TheSportsDB API）
- マッチスケジュール表示

### 2. マンUくん AIチャット
- Manchester United 専用のキャラクター型 AI チャットボット
- **Gemini API** を使用したコンテキスト保持型の会話
- クイック質問テンプレート・レジェンド選手紹介パネル付き

### 3. 監督 AI シミュレーター
- 任意の 2 チームを選択し、フォーメーション・戦術を設定
- **Groq API（LLaMA 3）** が 90 分の架空試合を実況形式で生成
- AI による試合分析レポート・SNS シェア機能
- OG 画像動的生成（`/simulator/[id]/og`）

### 4. チーム掲示板
- 匿名 ID ベースの投稿・コメント・いいね機能
- チームごとのスレッド分離（リーグ別グルーピング）
- フォロー機能でお気に入りチームを上位表示
- **Supabase RLS** による投稿者本人のみ削除可能な権限制御

### 5. 認証システム
- Supabase Auth（メール + パスワード）
- ホログラムカード風のオリジナルログイン UI

---

## 🛠 技術スタック

| カテゴリ | 採用技術 |
|----------|----------|
| **フロントエンド** | Next.js 14 (App Router), React 18, TypeScript 5 |
| **スタイリング** | Tailwind CSS v4, CSS カスタムプロパティ |
| **バックエンド** | Next.js Route Handlers（API Routes） |
| **データベース** | Supabase（PostgreSQL + RLS） |
| **認証** | Supabase Auth（SSR 対応） |
| **AI / LLM** | Google Gemini API, Groq API（LLaMA 3） |
| **外部 API** | NewsData API, TheSportsDB API |
| **アイコン** | Lucide React |
| **デプロイ** | Vercel（予定） |

---

## 🏗 アーキテクチャ

```
src/
├── app/
│   ├── api/                    # Route Handlers（サーバーサイド）
│   │   ├── auth/me/            # ログインユーザー情報
│   │   ├── board/              # 掲示板 CRUD（投稿・コメント・投票）
│   │   ├── chat/manu/          # マンUくん AIチャット
│   │   ├── news/               # ニュース取得
│   │   ├── simulator/          # 試合シミュレーター生成・分析
│   │   └── standings/          # 順位表取得
│   │
│   ├── board/[slug]/           # チーム掲示板（動的ルーティング）
│   ├── manu/                   # AIチャットページ
│   ├── news/                   # ニュース一覧
│   ├── simulator/[id]/         # シミュレーター結果詳細
│   ├── standings/              # 順位表
│   └── components/             # 共通 UI コンポーネント
│
├── lib/
│   ├── supabase/               # Supabase クライアント（server / service）
│   └── board/                  # 匿名 ID 生成・ハッシュユーティリティ
│
└── types/                      # 共通型定義
```

### データフロー

```
ブラウザ (React)
    │
    ▼
Next.js Route Handler    ←──  Supabase（DB / Auth）
    │
    ├──▶ Gemini API        （マンUくんチャット）
    ├──▶ Groq API          （試合シミュレーター）
    ├──▶ NewsData API      （ニュース）
    └──▶ TheSportsDB API   （順位・試合情報）
```

---

## ⚙️ セットアップ

### 前提条件
- Node.js 20 以上
- Supabase プロジェクト（[supabase.com](https://supabase.com) で無料作成可能）
- 各種 API キー（下記参照）

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/<your-username>/soccer.git
cd soccer

# 2. 依存パッケージをインストール
npm install

# 3. 環境変数を設定（.env.local.example を参照）
cp .env.local.example .env.local
# .env.local を編集して各キーを設定

# 4. Supabase のテーブルを作成
# supabase/phase-a-board.sql を Supabase SQL Editor で実行

# 5. 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと確認できます。

---

## 🔑 環境変数

`.env.local.example` を参考に `.env.local` を作成してください。

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー（管理操作用） | ✅ |
| `GEMINI_API_KEY` | Google Gemini API キー | ✅ |
| `GROQ_API_KEY` | Groq API キー（LLaMA 3） | ✅ |
| `NEWSDATA_API_KEY` | NewsData.io API キー | ✅ |
| `THESPORTSDB_API_KEY` | TheSportsDB API キー | ✅ |
| `ADMIN_EMAIL` | 管理者メールアドレス（投稿削除権限） | 任意 |

---

## 💡 実装のこだわり

### SSR / CSR の使い分け
- 初期データ取得が必要なページ（シミュレーター・順位表）は **Server Components** でデータフェッチ
- インタラクティブな UI（チャット・掲示板）は **Client Components** で管理
- `server-only` パッケージを活用し、サービスロールキーがクライアントバンドルに漏洩しないよう徹底

### セキュリティ設計
- **Row Level Security（RLS）** をすべての掲示板テーブルに適用
- 投稿者識別は匿名ハッシュ ID を使用し、ユーザー登録なしでも利用可能
- 環境変数はすべて `.env.local`（gitignore 済み）で管理

### UI / UX
- Tailwind CSS v4 のカスタムプロパティでダークテーマを一元管理
- ローディングスケルトン・エラーバウンダリを各ページに実装
- OG 画像をサーバーサイドで動的生成（SNS シェア対応）

---

## 📈 今後の予定

- [ ] 多言語対応（next-intl）
- [ ] お気に入り試合のプッシュ通知
- [ ] シミュレーター結果のランキング機能
- [ ] PWA 対応（オフラインキャッシュ）

---

## 📄 ライセンス

MIT License — 個人ポートフォリオ目的で公開しています。
