# ログイン・会員登録機能 実装ガイド

## 📋 実装概要

H2データベースを使用したログイン機能と会員登録機能を実装しました。

## 🎯 実装内容

### 1. データベース設定
- **データベース**: H2インメモリデータベース
- **URL**: `jdbc:h2:mem:soccerdb`
- **H2コンソール**: http://localhost:8080/h2-console
- **DDL設定**: `update` (テーブル自動作成・更新)

### 2. 作成したファイル

#### エンティティ
- `src/main/java/com/soccer/news/model/User.java`
  - ユーザー情報を管理するエンティティ
  - フィールド: id, username, password, email, displayName, enabled, role, createdAt, updatedAt

#### リポジトリ
- `src/main/java/com/soccer/news/repository/UserRepository.java`
  - ユーザー情報のデータベースアクセス
  - メソッド: findByUsername, findByEmail, existsByUsername, existsByEmail

#### サービス
- `src/main/java/com/soccer/news/service/UserService.java`
  - ユーザー登録・認証ロジック
  - Spring Securityとの統合
  - パスワードのBCryptハッシュ化

#### コントローラー
- `src/main/java/com/soccer/news/controller/RegisterController.java`
  - 会員登録ページの表示と処理
  - 入力値検証（ユーザー名、パスワード、メールアドレス）

#### セキュリティ設定
- `src/main/java/com/soccer/news/config/SecurityConfig.java`
  - Spring Securityの設定
  - ログイン・会員登録ページの認証除外
  - BCryptPasswordEncoderの設定

#### テンプレート
- `src/main/resources/templates/login.html`
  - ログインページ（更新）
  - 会員登録ページへのリンク追加
  
- `src/main/resources/templates/register.html`
  - 会員登録ページ（新規作成）
  - ユーザー名、メールアドレス、パスワード、表示名の入力フォーム

## 🚀 使用方法

### 1. アプリケーションの起動

```bash
# Windowsの場合
run.bat

# または
.\mvnw.cmd spring-boot:run
```

### 2. 会員登録

1. ブラウザで http://localhost:8080/register にアクセス
2. 以下の情報を入力:
   - **ユーザー名** (必須): 一意である必要があります
   - **メールアドレス** (必須): 一意である必要があります
   - **パスワード** (必須): 6文字以上
   - **表示名** (任意): 省略した場合はユーザー名が使用されます
3. 「登録する」ボタンをクリック
4. 登録成功後、ログインページにリダイレクトされます

### 3. ログイン

1. ブラウザで http://localhost:8080/login にアクセス
2. 登録したユーザー名とパスワードを入力
3. 「Sign in」ボタンをクリック
4. ログイン成功後、ホームページにリダイレクトされます

### 4. H2データベースコンソール（開発用）

1. ブラウザで http://localhost:8080/h2-console にアクセス
2. 以下の設定で接続:
   - **JDBC URL**: `jdbc:h2:mem:soccerdb`
   - **User Name**: `sa`
   - **Password**: (空欄)
3. 「Connect」をクリック
4. `USERS`テーブルでユーザー情報を確認できます

## 📊 データベーススキーマ

### USERSテーブル

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| ID | BIGINT | PRIMARY KEY, AUTO_INCREMENT | ユーザーID |
| USERNAME | VARCHAR(50) | NOT NULL, UNIQUE | ユーザー名 |
| PASSWORD | VARCHAR(255) | NOT NULL | パスワード（BCryptハッシュ化） |
| EMAIL | VARCHAR(100) | NOT NULL, UNIQUE | メールアドレス |
| DISPLAY_NAME | VARCHAR(50) | | 表示名 |
| ENABLED | BOOLEAN | NOT NULL | アカウント有効フラグ |
| ROLE | VARCHAR(20) | NOT NULL | ユーザーロール（USER, ADMIN等） |
| CREATED_AT | TIMESTAMP | NOT NULL | 登録日時 |
| UPDATED_AT | TIMESTAMP | NOT NULL | 最終更新日時 |

## 🔒 セキュリティ機能

### パスワードのハッシュ化
- BCryptPasswordEncoderを使用
- パスワードは平文で保存されず、ハッシュ化されて保存されます

### 認証・認可
- Spring Securityによる認証
- ログイン・会員登録ページ以外は認証が必要
- 静的リソース（CSS, JS, 画像）は認証不要

### CSRF保護
- Spring SecurityのCSRF保護が有効
- H2コンソールとAPI更新エンドポイントは除外

## ✅ 入力値検証

### 会員登録時の検証
- **ユーザー名**: 必須、50文字以内、一意
- **メールアドレス**: 必須、100文字以内、メール形式、一意
- **パスワード**: 必須、6文字以上
- **表示名**: 任意、50文字以内

### エラーメッセージ
- ユーザー名が既に使用されている場合
- メールアドレスが既に使用されている場合
- 入力値が不正な場合

## 🎨 UI/UX

### デザイン
- サッカーをテーマにしたデザイン
- レスポンシブ対応（モバイル・タブレット・デスクトップ）
- 背景画像とオーバーレイ効果
- キラキラエフェクト

### ユーザーフィードバック
- 成功メッセージ（緑色）
- エラーメッセージ（赤色）
- ホバーエフェクト
- フォーカスエフェクト

## 🔄 ページ遷移

```
/login (ログインページ)
  ↓ 「新規登録はこちら」リンク
/register (会員登録ページ)
  ↓ 登録成功
/login?success (ログインページ + 成功メッセージ)
  ↓ ログイン成功
/ (ホームページ)
  ↓ ログアウト
/login?logout (ログインページ + ログアウトメッセージ)
```

## 📝 テスト手順

### 1. 会員登録のテスト
```
1. http://localhost:8080/register にアクセス
2. ユーザー名: testuser
3. メールアドレス: test@example.com
4. パスワード: password123
5. 表示名: テストユーザー
6. 「登録する」ボタンをクリック
7. ログインページにリダイレクトされ、成功メッセージが表示されることを確認
```

### 2. ログインのテスト
```
1. http://localhost:8080/login にアクセス
2. ユーザー名: testuser
3. パスワード: password123
4. 「Sign in」ボタンをクリック
5. ホームページにリダイレクトされることを確認
```

### 3. 重複チェックのテスト
```
1. 同じユーザー名で再度登録を試みる
2. エラーメッセージが表示されることを確認
3. 同じメールアドレスで再度登録を試みる
4. エラーメッセージが表示されることを確認
```

### 4. データベース確認
```
1. http://localhost:8080/h2-console にアクセス
2. 接続後、以下のSQLを実行:
   SELECT * FROM USERS;
3. 登録したユーザー情報が表示されることを確認
4. パスワードがハッシュ化されていることを確認
```

## 🛠️ トラブルシューティング

### アプリケーションが起動しない場合
1. Java 21がインストールされているか確認
2. `run.bat`を使用して起動
3. ポート8080が使用されていないか確認

### ログインできない場合
1. ユーザー名とパスワードが正しいか確認
2. H2コンソールでユーザーが登録されているか確認
3. ブラウザのキャッシュをクリア

### データベースが見つからない場合
1. `application.yml`の設定を確認
2. アプリケーションを再起動
3. H2はインメモリDBなので、再起動するとデータは消えます

## 📚 参考情報

### 使用技術
- Spring Boot 3.4.1
- Spring Security
- Spring Data JPA
- H2 Database
- Thymeleaf
- Lombok
- BCrypt

### 設定ファイル
- `src/main/resources/application.yml`: アプリケーション設定
- `pom.xml`: Maven依存関係

## 🎉 完了

ログイン機能と会員登録機能の実装が完了しました！
アプリケーションを起動して、実際に動作を確認してください。
