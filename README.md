# Goal Labo（ゴールラボ）

サッカーファンのための情報・コミュニティ・AI体験・育成ゲームをまとめた個人フルスタックプロジェクト。

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-f55036?logo=groq)](https://groq.com/)

---

## プロジェクト概要

サッカー情報サイトを作ろうとして始めたが、途中で「ゲームも入れたい」「AIチャットも入れたい」と膨らんでいったプロジェクト。最初は Spring Boot で設計していたが Next.js 14 App Router に切り替えた。

バックエンドは Supabase（PostgreSQL + Row Level Security）、フロントエンドは Next.js。外部 AI API（Groq）を使ってチャットボット・試合シミュレーター・試合後アナリストコメントを実装している。

---

## 主な機能

### ダッシュボード
- 最新サッカーニュース取得（NewsData API）
- プレミアリーグ順位表（TheSportsDB API）
- マッチスケジュール表示

### マンUくん AIチャット
- Manchester United 専用キャラクター型チャットボット
- Groq API（LLaMA 3.3 70B）によるコンテキスト保持型の会話

### 監督 AIシミュレーター
- 2チームを選択してフォーメーション・戦術を設定し、架空の90分試合を生成
- AI試合分析レポート・SNSシェア・OG画像動的生成付き

### チーム掲示板
- 匿名IDベースの投稿・コメント
- いいね/嫌いのトグル投票（楽観的UI、再クリックで取消）
- チームごとのスレッド分離、フォロー機能
- 管理者アカウントによる不適切投稿・コメント削除（複数管理者対応）

### 選手育成ゲーム（`/game`）

localStorage を使った完全クライアントサイドの育成ゲーム。地域リーグから欧州最高峰までキャリアを積む。

**ゲームシステム**
- リーグ構造：地域 → J3 → J2 → J1 → ブンデスリーガ → プレミア/ラリーガ
- 52チーム（都道府県名ベースの架空チーム＋欧州架空クラブ）
- FW / MF / DF / GK（ポジション別OVR重みと能力値上限）
- 38週/シーズン、年齢35歳基準で引退（スキル・行動で最大45まで延長）

**イベント・成長**
- ランダムイベント85個以上（スポンサー契約・代表招集・SNS炎上・バロンドール候補など）
- 確率的収穫逓減（上限近くでも低確率で成長、完全に止まらない設計）
- 連続トレーニングボーナス（同じ訓練3回連続→+1、5回→+2）
- 加齢衰退（27歳ピーク以降、ポジション別に速度・スタミナが減少）

**受賞・実績**
- 個人賞21種（新人王・得点王・バロンドールなど）、実績14個、特技8個
- レアリティ4段階（ブロンズ/シルバー/ゴールド/レジェンド）

**試合システム**
- 分単位のイベントタイムライン（誰が・何分に・どんなゴールを）
- リーグ順位表（52チームの勝敗・得失差・勝ち点）
- 試合後AIアナリストコメント（Groq API、6キャラクターがランダム登場）

**保存・引き継ぎ**
- リアルタイム自動保存・ページ離脱時にも保存
- 旧セーブデータへの新フィールド自動補完と後方互換性

### 認証
- Supabase Auth（メール+パスワード / Google OAuth）
- Next.js Middleware で全ページを保護、未ログイン時は `/login` へリダイレクト

---

## 技術スタック

- **フロントエンド** Next.js 14 (App Router), React 18, TypeScript 5
- **スタイリング** Tailwind CSS v4, CSS カスタムプロパティ（ダーク/ライト両対応）
- **バックエンド** Next.js Route Handlers
- **データベース** Supabase（PostgreSQL + RLS）
- **認証** Supabase Auth（SSR 対応 Middleware）
- **AI / LLM** Groq API（LLaMA 3.3 70B）
- **外部 API** NewsData API, TheSportsDB API
- **ゲーム保存** localStorage（完全クライアントサイド）
- **デプロイ** AWS EC2 + PM2

---

## アーキテクチャ

```
src/
├── app/
│   ├── api/                       # Route Handlers（サーバーサイド）
│   │   ├── auth/me/               # ログインユーザー情報・管理者判定
│   │   ├── board/                 # 掲示板 CRUD（投稿・コメント・投票）
│   │   ├── chat/manu/             # マンUくん AIチャット
│   │   ├── game/analyst/          # 試合後 AIアナリストコメント
│   │   ├── news/                  # ニュース取得
│   │   ├── simulator/             # 試合シミュレーター生成・分析
│   │   └── standings/             # 順位表取得
│   ├── board/[slug]/              # チーム掲示板
│   ├── game/                      # 選手育成ゲーム
│   │   ├── components/            # ゲーム UI コンポーネント
│   │   ├── hooks/                 # useGameState / useAutoSave
│   │   ├── lib/                   # ゲームエンジン / イベント / 受賞 / 順位
│   │   └── types/                 # ゲーム型定義
│   ├── manu/                      # AIチャットページ
│   ├── simulator/[id]/            # シミュレーター結果詳細
│   └── components/                # 共通 UI コンポーネント
├── lib/
│   ├── supabase/                  # Supabaseクライアント（client / server / service）
│   └── board/                    # 匿名ID生成・ハッシュ
└── middleware.ts                  # 認証ガード
```

データフロー：
```
ブラウザ (React)
    │
    ├── [ゲーム] localStorage ←── 完全クライアントサイド
    ▼
Next.js Middleware（認証チェック）
    ▼
Next.js Route Handler  ←── Supabase（DB / Auth / RLS）
    │
    ├──▶ Groq API       （マンUくん / シミュレーター / 試合アナリスト）
    ├──▶ NewsData API   （ニュース）
    └──▶ TheSportsDB    （順位・試合情報）
```

---

## セットアップ

```bash
git clone https://github.com/msuleu4-web/soccer-project.git
cd soccer-project
npm install
cp .env.local.example .env.local
# .env.local を編集して各キーを設定
npm run dev
```

### 環境変数

| 変数名 | 説明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー |
| `GROQ_API_KEY` | Groq API キー |
| `NEWSDATA_API_KEY` | NewsData.io API キー |
| `THESPORTSDB_API_KEY` | TheSportsDB API キー |
| `ADMIN_EMAIL` | 管理者メールアドレス（カンマ区切りで複数指定可） |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense クライアント ID |

---

## デプロイ（AWS EC2 + PM2）

```bash
scp -i "key.pem" -r ./src ubuntu@<EC2_IP>:~/frontend/
ssh -i "key.pem" ubuntu@<EC2_IP>
cd ~/frontend && rm -rf .next && npm run build && pm2 restart goal-labo
```

`.next` キャッシュを削除しないと新しく追加したファイルが反映されないことがある。

---

## 実装メモ

**確率的収穫逓減**：スタットが上限に近いほど伸びにくいが、上限の95%を超えても最低5%の確率を保証することで完全に止まらないようにした。

**匿名ID設計**：掲示板の匿名性を保ちながら荒らし対策ができるよう、生UUIDをそのまま使わずサーバー側でSHA-256ハッシュ化してDBに保存している。

**後方互換セーブ**：ゲームのアップデートで新フィールドが増えるたびに旧セーブデータが壊れる問題を `applyCompat()` で吸収。既存セーブがあっても新機能が自動補完される。

**TheSportsDB rate limit**：無料プランのレート制限対策でキャッシュを挟んでいる。

---

## ライセンス

MIT
