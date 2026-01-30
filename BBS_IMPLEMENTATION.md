# 掲示板（BBS）機能実装ドキュメント

## 📋 概要
海外サッカーニュースサイトに、DCinside/2chスタイルの匿名掲示板機能を追加しました。

## 🏗️ データベース設計

### Postテーブル（スレッド）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGINT (PK) | スレッドID（自動採番） |
| title | VARCHAR(200) | スレッドタイトル |
| content | TEXT | 投稿本文 |
| author | VARCHAR(50) | 投稿者名（匿名ニックネーム） |
| password | VARCHAR(255) | 削除用パスワード（BCryptハッシュ化） |
| category | VARCHAR(50) | カテゴリ（プレミアリーグ、ラ・リーガなど） |
| recommend_count | INTEGER | おすすめ（イイネ）数 |
| view_count | INTEGER | 閲覧数 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

**インデックス:**
- `idx_category` (category)
- `idx_created_at` (created_at)
- `idx_recommend_count` (recommend_count)

### Commentテーブル（レス）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | BIGINT (PK) | コメントID（自動採番） |
| content | TEXT | コメント本文 |
| author | VARCHAR(50) | コメント投稿者名 |
| password | VARCHAR(255) | 削除用パスワード（BCryptハッシュ化） |
| created_at | TIMESTAMP | 作成日時 |
| post_id | BIGINT (FK) | 親スレッドID |
| comment_number | INTEGER | コメント番号（スレッド内連番） |

**インデックス:**
- `idx_post_id` (post_id)
- `idx_created_at` (created_at)

**リレーション:**
- Post 1 : N Comment（カスケード削除）

## 🎯 実装した機能

### 1. スレッド機能
- ✅ スレッド一覧表示（ページング対応）
- ✅ カテゴリ別フィルタリング
- ✅ キーワード検索
- ✅ 新規スレッド作成（匿名投稿）
- ✅ スレッド詳細表示
- ✅ スレッド削除（パスワード認証）
- ✅ おすすめ（イイネ）機能
- ✅ 閲覧数カウント

### 2. コメント機能
- ✅ コメント一覧表示（時系列順）
- ✅ コメント投稿（匿名）
- ✅ コメント削除（パスワード認証）
- ✅ コメント番号自動採番

### 3. セキュリティ対策
- ✅ **XSS対策**: `HtmlUtils.htmlEscape()`で全入力をエスケープ
- ✅ **CSRF対策**: Spring Securityのデフォルト設定（Thymeleafフォーム自動対応）
- ✅ **パスワード保護**: BCryptによるハッシュ化
- ✅ **SQLインジェクション対策**: Spring Data JPAのパラメータバインディング

### 4. カテゴリ
- 全般
- プレミアリーグ
- ラ・リーガ
- セリエA
- ブンデスリーガ
- リーグ・アン
- 代表戦
- その他

## 📁 ファイル構成

```
src/main/java/com/soccer/news/
├── model/
│   ├── Post.java              # スレッドエンティティ
│   └── Comment.java           # コメントエンティティ
├── repository/
│   ├── PostRepository.java    # スレッドリポジトリ
│   └── CommentRepository.java # コメントリポジトリ
├── service/
│   └── PostService.java       # ビジネスロジック
└── controller/
    └── PostController.java    # コントローラー

src/main/resources/templates/bbs/
├── list.html                  # スレッド一覧画面
├── detail.html                # スレッド詳細画面
└── new.html                   # 新規スレッド作成画面
```

## 🔌 エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/bbs` | スレッド一覧 |
| GET | `/bbs?category={category}` | カテゴリ別一覧 |
| GET | `/bbs?keyword={keyword}` | キーワード検索 |
| GET | `/bbs/{id}` | スレッド詳細 |
| GET | `/bbs/new` | 新規作成フォーム |
| POST | `/bbs/create` | スレッド作成 |
| POST | `/bbs/{id}/delete` | スレッド削除 |
| POST | `/bbs/{id}/recommend` | おすすめ追加 |
| POST | `/bbs/{id}/comment` | コメント投稿 |
| POST | `/bbs/comment/{commentId}/delete` | コメント削除 |

## 🎨 デザインコンセプト

### 日本のユーザーに馴染みのあるデザイン
- **情報密度の高いリスト型レイアウト**: 5ch/Yahoo!リアルタイム検索風
- **シンプルで直感的なUI**: Tailwind CSSによるモダンなデザイン
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ対応
- **視認性重視**: カテゴリバッジ、統計情報の明確な表示

### 主要な画面要素
1. **一覧画面**
   - カテゴリフィルタ（タブ形式）
   - 検索バー
   - スレッド情報（タイトル、投稿者、レス数、閲覧数、おすすめ数、日時）
   - 人気スレッドサイドバー
   - ページネーション

2. **詳細画面**
   - スレッド本文
   - おすすめボタン
   - コメント一覧（番号付き）
   - コメント投稿フォーム
   - 削除モーダル

3. **新規作成画面**
   - カテゴリ選択
   - タイトル・本文入力
   - 投稿者名・パスワード設定
   - 注意事項表示

## 🚀 起動方法

### 1. 依存関係のインストール
```bash
mvn clean install
```

### 2. アプリケーション起動
```bash
mvn spring-boot:run
```

または

```bash
run.bat
```

### 3. アクセス
- **掲示板**: http://localhost:8080/bbs
- **H2コンソール**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:soccerdb`
  - Username: `sa`
  - Password: (空欄)

## 🔧 技術スタック

- **Backend**: Spring Boot 3.4.1, Java 21
- **Database**: H2 Database (インメモリ)
- **ORM**: Spring Data JPA / Hibernate
- **Template Engine**: Thymeleaf
- **CSS Framework**: Tailwind CSS (CDN)
- **Security**: Spring Security Crypto (BCrypt)
- **Virtual Threads**: Java 21 Virtual Threads有効化

## 📊 パフォーマンス最適化

1. **インデックス設計**
   - カテゴリ、作成日時、おすすめ数にインデックス
   - 検索・ソートの高速化

2. **Virtual Threads活用**
   - Java 21のVirtual Threadsで並行処理を効率化
   - 大量のリクエストに対応

3. **ページング**
   - Spring Data JPAのPageableで効率的なページング
   - デフォルト20件/ページ

4. **楽観的ロック回避**
   - 閲覧数・おすすめ数は直接UPDATE文で更新
   - 競合を最小化

## 🔐 セキュリティ実装詳細

### XSS対策
```java
String escapedContent = HtmlUtils.htmlEscape(content);
```
- 全ユーザー入力をHTMLエスケープ
- `<script>`タグなどの実行を防止

### パスワードハッシュ化
```java
BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
String hashedPassword = passwordEncoder.encode(password);
```
- BCryptで一方向ハッシュ化
- レインボーテーブル攻撃に強い

### CSRF対策
- Spring Securityのデフォルト設定
- Thymeleafフォームに自動でCSRFトークン埋め込み

## 📝 今後の拡張案

1. **機能追加**
   - [ ] 画像アップロード機能
   - [ ] 返信機能（アンカー機能）
   - [ ] ユーザーID機能（トリップ）
   - [ ] 通報機能
   - [ ] 管理者機能

2. **パフォーマンス**
   - [ ] Redis導入（キャッシング）
   - [ ] PostgreSQL/MySQL移行（本番環境）
   - [ ] CDN導入（静的ファイル配信）

3. **UI/UX改善**
   - [ ] リアルタイム更新（WebSocket）
   - [ ] ダークモード
   - [ ] 絵文字サポート
   - [ ] マークダウン対応

## 🐛 トラブルシューティング

### データベースが初期化されない
- `application.yml`の`ddl-auto: create-drop`を確認
- H2コンソールでテーブル存在確認

### パスワード認証が失敗する
- BCryptのハッシュ化が正しく動作しているか確認
- パスワードの最小文字数（4文字）を確認

### XSS攻撃のテスト
```html
<script>alert('XSS')</script>
```
- 上記を投稿してもエスケープされて実行されないことを確認

## 📞 サポート

問題が発生した場合は、以下を確認してください：
1. Java 21がインストールされているか
2. Maven依存関係が正しくインストールされているか
3. ポート8080が使用可能か
4. ログファイルでエラーメッセージを確認

---

**作成日**: 2026/01/30  
**バージョン**: 1.0.0  
**ライセンス**: MIT
