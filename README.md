# ⚽ Goal Labo（ゴールラボ）

> サッカーファンのための情報・コミュニティ・AI体験・育成ゲームを一つに集約したフルスタック Web アプリ

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-f55036?logo=groq)](https://groq.com/)

---

## 📌 プロジェクト概要

**Goal Labo** は、サッカーファンが「ニュースを読む・順位を確認する・仲間と語り合う・AIと遊ぶ・選手を育てる」をすべて一箇所でできるように設計した個人フルスタックプロジェクトです。

バックエンドには **Supabase**（PostgreSQL + Row Level Security）、フロントエンドには **Next.js 14 App Router** を採用。外部 AI API（Groq）を組み合わせることで、チャットボット・試合シミュレーター・試合後アナリストコメントといった独自の体験を提供しています。

---

## 🚀 主な機能

### 1. ダッシュボード（トップページ）
- 最新サッカーニュースをリアルタイム取得（NewsData API）
- プレミアリーグ順位表（TheSportsDB API）
- マッチスケジュール表示
- 育成ゲーム・マンUくんへの導線カード

### 2. マンUくん AI チャット
- Manchester United 専用のキャラクター型 AI チャットボット
- **Groq API（LLaMA 3.3 70B）** を使用したコンテキスト保持型の会話
- クイック質問テンプレート・レジェンド選手紹介パネル付き

### 3. 監督 AI シミュレーター
- 任意の 2 チームを選択し、フォーメーション・戦術を設定
- **Groq API（LLaMA 3）** が 90 分の架空試合を実況形式で生成
- AI による試合分析レポート・SNS シェア機能
- OG 画像動的生成（`/simulator/[id]/og`）

### 4. チーム掲示板
- 匿名 ID ベースの投稿・コメント機能
- いいね / 嫌いのトグル投票（同じボタン再クリックで取消、楽観的 UI）
- チームごとのスレッド分離（リーグ別グルーピング）
- フォロー機能でお気に入りチームを上位表示
- **管理者アカウント**による不適切投稿・コメントの削除権限（複数管理者対応、カンマ区切り設定）

### 5. 選手育成ゲーム（`/game`）

**localStorage** を使ったフルクライアントサイドの選手育成ゲーム。地域リーグから欧州最高峰までキャリアを積み上げる。

#### ゲームシステム
| 項目 | 内容 |
|---|---|
| **リーグ構造** | 地域リーグ 🇯🇵 → J3 → J2 → J1 → ブンデスリーガ 🇩🇪 → プレミア/ラ・リーガ 🏴󠁧󠁢󠁥󠁮󠁧󠁿🇪🇸 |
| **チーム数** | 52チーム（都道府県名ベースの架空チーム＋欧州架空クラブ） |
| **ポジション** | FW / MF / DF / GK（ポジション別OVR重みと能力値上限） |
| **能力値上限** | ポジション別（例: FWシュート130、MFパス130、GKDF150） |
| **シーズン** | 38週/シーズン、年齢35歳で引退 |

#### イベント・成長
- **ランダムイベント 85個以上**（スポンサー契約・代表招集・SNS炎上・バロンドール候補など）
- **3択イベント**・発生条件付きイベント対応
- **連続トレーニングボーナス**（同じ訓練3回連続→+1、5回→+2）
- **確率的収穫逓減**（上限近くでも低確率で成長可能）
- **負債ペナルティ**（マイナス資金は毎週モラル低下）

#### 受賞・実績システム
| 分類 | 内容 |
|---|---|
| **個人賞 21種** | 新人王 / 得点王 / アシスト王 / リーグMVP / ベストイレブン / バロンドールなど |
| **レアリティ** | ブロンズ / シルバー / ゴールド / レジェンド（4段階） |
| **実績 14個** | 初ゴール / OVR60突破 / CL出場 / 億万長者など |
| **特技 8個** | スナイパー / プレイメーカー / レジェンドなど（スタット80+で解放） |
| **シーズン要約** | 得点・平均評価点・OVR変化・獲得トロフィー |
| **シーズン後 시상식** | スポットライト演出付きアワードセレモニー画面 |

#### 試合システム
- **分単位イベントタイムライン**（誰が・何分に・どんなゴールを）
- **ライブスコアボード**（イベントごとにリアルタイム更新）
- **リーグ順位表**（52チームの勝敗表・得失差・勝ち点）
- **AI アナリストコメント**（Groq API、6キャラクターがランダム登場）

#### 自動保存・引き継ぎ
- `localStorage` にリアルタイム自動保存
- ページ離脱時（`beforeunload`）にも保存
- 旧セーブデータとの後方互換性・スタック状態自動修復

### 6. 認証・セキュリティ
- Supabase Auth（メール + パスワード / Google OAuth）
- **未ログイン時は全ページをログイン画面へリダイレクト**（Next.js Middleware）
- ログアウト後も即リダイレクト
- ホログラムカード風オリジナルログイン UI

---

## 🛠 技術スタック

| カテゴリ | 採用技術 |
|---|---|
| **フロントエンド** | Next.js 14 (App Router), React 18, TypeScript 5 |
| **スタイリング** | Tailwind CSS v4, CSS カスタムプロパティ（ダーク/ライト両対応） |
| **バックエンド** | Next.js Route Handlers（API Routes） |
| **データベース** | Supabase（PostgreSQL + RLS） |
| **認証** | Supabase Auth（SSR 対応 Middleware） |
| **AI / LLM** | Groq API（LLaMA 3.3 70B） |
| **外部 API** | NewsData API, TheSportsDB API |
| **ゲーム保存** | localStorage（完全クライアントサイド） |
| **アイコン** | Lucide React |
| **デプロイ** | AWS EC2 + PM2 |

---

## 🏗 アーキテクチャ

```
src/
├── app/
│   ├── api/                       # Route Handlers（サーバーサイド）
│   │   ├── auth/me/               # ログインユーザー情報・管理者判定
│   │   ├── board/                 # 掲示板 CRUD（投稿・コメント・投票トグル）
│   │   ├── chat/manu/             # マンUくん AI チャット
│   │   ├── game/analyst/          # 試合後 AI アナリストコメント
│   │   ├── news/                  # ニュース取得
│   │   ├── simulator/             # 試合シミュレーター生成・分析
│   │   └── standings/             # 順位表取得
│   │
│   ├── about/                     # サービス紹介ページ
│   ├── board/[slug]/              # チーム掲示板（動的ルーティング）
│   ├── game/                      # 選手育成ゲーム
│   │   ├── components/            # ゲーム UI コンポーネント（10+）
│   │   ├── hooks/                 # useGameState / useAutoSave
│   │   ├── lib/                   # ゲームエンジン / イベント / 受賞 / 順位
│   │   └── types/                 # ゲーム型定義
│   ├── login/                     # ログイン（ホログラムカード UI）
│   ├── manu/                      # AI チャットページ
│   ├── news/                      # ニュース一覧
│   ├── privacy/                   # プライバシーポリシー
│   ├── simulator/[id]/            # シミュレーター結果詳細
│   ├── standings/                 # 順位表
│   └── components/                # 共通 UI コンポーネント
│
├── lib/
│   ├── supabase/                  # Supabase クライアント（client / server / service）
│   └── board/                    # 匿名 ID 生成・ハッシュ
│
├── src/middleware.ts              # 認証ガード（未ログイン→/login リダイレクト）
└── types/                         # 共通型定義
```

### データフロー

```
ブラウザ (React)
    │
    ├── [ゲーム] localStorage ←──── 完全クライアントサイド
    │
    ▼
Next.js Middleware (認証チェック)
    │
    ▼
Next.js Route Handler    ←──  Supabase（DB / Auth / RLS）
    │
    ├──▶ Groq API          （マンUくん / シミュレーター / 試合アナリスト）
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

# 4. 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと確認できます。

---

## 🔑 環境変数

`.env.local.example` を参考に `.env.local` を作成してください。

| 変数名 | 説明 | 必須 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー | ✅ |
| `GROQ_API_KEY` | Groq API キー（LLaMA 3.3 70B） | ✅ |
| `NEWSDATA_API_KEY` | NewsData.io API キー | ✅ |
| `THESPORTSDB_API_KEY` | TheSportsDB API キー | ✅ |
| `ADMIN_EMAIL` | 管理者メールアドレス（カンマ区切りで複数指定可） | 任意 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense クライアント ID | 任意 |

---

## 🚢 デプロイ

### AWS EC2 + PM2（本番環境）

```bash
# 1. ファイルをサーバーに転送
scp -i "key.pem" -r ./src ubuntu@<EC2_IP>:~/frontend/

# 2. SSH 接続
ssh -i "key.pem" ubuntu@<EC2_IP>

# 3. クリーンビルド＆再起動（.next キャッシュ削除が重要）
cd ~/frontend && rm -rf .next && npm run build && pm2 restart goal-labo
```

> ⚠️ `rm -rf .next` を省略すると、新しく追加したファイルが反映されない場合があります。

---

## 💡 実装のこだわり

### SSR / CSR の使い分け
- 初期データ取得が必要なページ（シミュレーター・順位表）は **Server Components** でデータフェッチ
- インタラクティブな UI（チャット・掲示板・育成ゲーム）は **Client Components** で管理
- 育成ゲームは `dynamic({ ssr: false })` で SSR 完全無効化（localStorage hydration エラー防止）

### 認証設計
- **Next.js Middleware**（`src/middleware.ts`）で全ページを保護
- 公開ルート（`/login`, `/signup`, `/about`, `/privacy`）のみ未認証でアクセス可能
- 静的ファイル（画像・アイコン）は認証チェックから除外

### セキュリティ設計
- **Row Level Security（RLS）** をすべての掲示板テーブルに適用
- 投稿者識別は匿名ハッシュ ID を使用
- 管理者権限は環境変数で管理（複数アドレスのカンマ区切り対応）
- 全投票処理は `service_role` キーで RLS バイパス（server-side のみ）

### ゲームエンジン設計
- **確率的収穫逓減**：`raw < 1` の場合に確率で +1 を返すことで上限近くでもいつか成長できる設計
- **ポジション別能力値正規化 OVR**：全スタットが上限に達すると OVR=99 になる正規化計算
- **分単位試合イベント**：得点・アシスト・チャンス・失点をそれぞれ異なる分に割り当て
- **後方互換 saveManager**：旧セーブデータへの新フィールド自動補完とスタック状態修復

### UI / UX
- Tailwind CSS v4 のカスタムプロパティでダーク/ライトテーマを一元管理
- **楽観的 UI**：投票ボタンはクリック即時反映、サーバー失敗時にロールバック
- **試合後 AI コメント**：6種のキャラクターがランダムで異なる視点からコメント
- シーズン終了時のアワードセレモニーはスポットライト演出付きアニメーション

---

## 🎮 育成ゲーム 所属チーム一覧

| リーグ | チーム例 |
|---|---|
| 地域リーグ 🇯🇵 | FC青森ソルジャーズ、岩手フロンティアFC、秋田ノーザンズ … |
| J3リーグ | 富山ヴァンガード、石川スワンズ、宮崎サンシャインFC … |
| J2リーグ | 新潟アルビス、静岡フォルツァ、熊本ヴォルカーノ … |
| J1リーグ | 東京ヴィクトリア、大阪グランデ、名古屋フェニックス … |
| ブンデスリーガ 🇩🇪 | ベルリン・シュトルム、ミュンヘン・ロートヴァイス … |
| プレミア/ラリーガ 🏴󠁧󠁢󠁥󠁮󠁧󠁿🇪🇸 | ロンドン・ロイヤルズ、マドリード・ブランコ … |

---

## 📄 ライセンス

MIT License — 個人ポートフォリオ目的で公開しています。
