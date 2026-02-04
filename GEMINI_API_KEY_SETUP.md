# Gemini APIキー 環境変数設定ガイド

このドキュメントでは、Gemini APIキーを環境変数として設定し、セキュアにアプリケーションを実行する方法を説明します。

## 📋 概要

`application.properties` ファイルでは、APIキーを直接記述せず、環境変数 `${GEMINI_API_KEY}` を参照するように設定されています。

```properties
# Gemini API キー（環境変数から取得）
gemini.api.key=${GEMINI_API_KEY}
```

---

## 🖥️ 1. IntelliJ IDEA での設定方法（ローカル開発環境）

### 方法1: Run/Debug Configuration で設定（推奨）

1. **Run/Debug Configurations を開く**
   - メニューバー: `Run` → `Edit Configurations...`
   - または、ツールバーの実行ボタン横のドロップダウンから `Edit Configurations...` を選択

2. **環境変数を追加**
   - 左側のリストから実行したい設定（例: `SoccerNewsApplication`）を選択
   - `Environment variables` フィールドを探す
   - フィールド右側の **📁 フォルダアイコン** をクリック

3. **環境変数を入力**
   - `+` ボタンをクリックして新しい環境変数を追加
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `あなたのGemini APIキー`（例: `AIzaSyA-A2TcLJSHVvDMi1KKaKPkTBMm7Uq2cH0`）
   - `OK` をクリックして保存

4. **アプリケーションを実行**
   - 通常通り `Run` または `Debug` ボタンでアプリケーションを起動

### 方法2: .env ファイルを使用（EnvFile プラグイン）

1. **EnvFile プラグインをインストール**
   - `File` → `Settings` → `Plugins`
   - "EnvFile" を検索してインストール

2. **プロジェクトルートに `.env` ファイルを作成**
   ```bash
   GEMINI_API_KEY=あなたのGemini APIキー
   ```

3. **Run/Debug Configuration で .env ファイルを指定**
   - `Run` → `Edit Configurations...`
   - `EnvFile` タブを選択
   - `Enable EnvFile` にチェック
   - `.env` ファイルのパスを追加

4. **`.env` ファイルを `.gitignore` に追加**（重要）
   ```
   .env
   ```

---

## ☁️ 2. AWS EC2（Linux サーバー）での実行方法

### 方法1: コマンドライン引数で環境変数を指定（一時的な実行）

```bash
# 環境変数を指定してアプリケーションを実行
java -jar -DGEMINI_API_KEY=あなたのGemini APIキー target/soccer-news-0.0.1-SNAPSHOT.jar
```

または、Spring Boot の標準的な方法：

```bash
# Spring Boot のプロパティとして指定
java -jar target/soccer-news-0.0.1-SNAPSHOT.jar --gemini.api.key=あなたのGemini APIキー
```

### 方法2: 環境変数をエクスポートして実行（セッション内で有効）

```bash
# 環境変数をエクスポート
export GEMINI_API_KEY="あなたのGemini APIキー"

# アプリケーションを実行
java -jar target/soccer-news-0.0.1-SNAPSHOT.jar
```

この方法では、現在のシェルセッション内でのみ環境変数が有効です。

### 方法3: システム全体で環境変数を設定（永続的な設定・推奨）

#### 3-1. ユーザーの `.bashrc` または `.bash_profile` に追加

```bash
# .bashrc ファイルを編集
nano ~/.bashrc

# ファイルの最後に以下を追加
export GEMINI_API_KEY="あなたのGemini APIキー"

# 変更を反映
source ~/.bashrc

# 環境変数が設定されたか確認
echo $GEMINI_API_KEY
```

#### 3-2. systemd サービスとして実行（本番環境推奨）

1. **サービスファイルを作成**
   ```bash
   sudo nano /etc/systemd/system/soccer-news.service
   ```

2. **サービス設定を記述**
   ```ini
   [Unit]
   Description=Soccer News Application
   After=network.target

   [Service]
   Type=simple
   User=ec2-user
   WorkingDirectory=/home/ec2-user/soccer-project
   
   # 環境変数を設定
   Environment="GEMINI_API_KEY=あなたのGemini APIキー"
   
   # アプリケーションを実行
   ExecStart=/usr/bin/java -jar /home/ec2-user/soccer-project/target/soccer-news-0.0.1-SNAPSHOT.jar
   
   # 自動再起動設定
   Restart=on-failure
   RestartSec=10
   
   StandardOutput=journal
   StandardError=journal

   [Install]
   WantedBy=multi-user.target
   ```

3. **サービスを有効化して起動**
   ```bash
   # サービスをリロード
   sudo systemctl daemon-reload
   
   # サービスを有効化（起動時に自動起動）
   sudo systemctl enable soccer-news.service
   
   # サービスを起動
   sudo systemctl start soccer-news.service
   
   # サービスの状態を確認
   sudo systemctl status soccer-news.service
   
   # ログを確認
   sudo journalctl -u soccer-news.service -f
   ```

4. **サービスの管理コマンド**
   ```bash
   # サービスを停止
   sudo systemctl stop soccer-news.service
   
   # サービスを再起動
   sudo systemctl restart soccer-news.service
   
   # サービスを無効化
   sudo systemctl disable soccer-news.service
   ```

### 方法4: 環境変数ファイルを使用（セキュア・推奨）

1. **環境変数ファイルを作成**
   ```bash
   # プロジェクトディレクトリに移動
   cd /home/ec2-user/soccer-project
   
   # 環境変数ファイルを作成
   nano .env
   
   # 以下の内容を記述
   GEMINI_API_KEY=あなたのGemini APIキー
   ```

2. **ファイルのパーミッションを制限（セキュリティ対策）**
   ```bash
   # 所有者のみ読み取り可能に設定
   chmod 600 .env
   ```

3. **環境変数を読み込んで実行**
   ```bash
   # 環境変数を読み込んで実行
   export $(cat .env | xargs) && java -jar target/soccer-news-0.0.1-SNAPSHOT.jar
   ```

4. **起動スクリプトを作成（便利）**
   ```bash
   # 起動スクリプトを作成
   nano start.sh
   ```
   
   ```bash
   #!/bin/bash
   # 環境変数を読み込み
   export $(cat /home/ec2-user/soccer-project/.env | xargs)
   
   # アプリケーションを実行
   java -jar /home/ec2-user/soccer-project/target/soccer-news-0.0.1-SNAPSHOT.jar
   ```
   
   ```bash
   # 実行権限を付与
   chmod +x start.sh
   
   # スクリプトを実行
   ./start.sh
   ```

---

## 🔒 セキュリティのベストプラクティス

### 1. `.gitignore` に環境変数ファイルを追加

```gitignore
# 環境変数ファイル
.env
*.env
application-local.properties
```

### 2. APIキーの権限を最小限に設定

- Google Cloud Console で Gemini API キーの使用制限を設定
- 特定のIPアドレスやドメインからのみアクセスを許可

### 3. 定期的にAPIキーをローテーション

- セキュリティのため、定期的にAPIキーを再生成
- 古いキーは無効化

### 4. ファイルパーミッションの設定

```bash
# 環境変数ファイルは所有者のみ読み取り可能に
chmod 600 .env

# アプリケーションファイルの適切な権限設定
chmod 644 application.properties
```

---

## ✅ 動作確認

### アプリケーション起動時のログを確認

```bash
# ログで環境変数が正しく読み込まれているか確認
# エラーが出ていないかチェック
```

### Gemini API の動作テスト

1. アプリケーションを起動
2. ブラウザで `http://localhost:8080/gemini` にアクセス
3. Gemini API が正常に動作するか確認

---

## 🚨 トラブルシューティング

### エラー: `Could not resolve placeholder 'GEMINI_API_KEY'`

**原因**: 環境変数 `GEMINI_API_KEY` が設定されていない

**解決方法**:
- 環境変数が正しく設定されているか確認
  ```bash
  echo $GEMINI_API_KEY
  ```
- IntelliJ IDEA の Run Configuration を確認
- サーバーで環境変数をエクスポートしているか確認

### アプリケーションが起動しない

1. **JARファイルが存在するか確認**
   ```bash
   ls -la target/*.jar
   ```

2. **Javaのバージョンを確認**
   ```bash
   java -version
   ```

3. **ポートが使用中でないか確認**
   ```bash
   sudo netstat -tulpn | grep 8080
   ```

---

## 📚 参考情報

- [Spring Boot - Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [systemd Service Management](https://www.freedesktop.org/software/systemd/man/systemd.service.html)

---

## 📝 まとめ

| 環境 | 推奨方法 | コマンド例 |
|------|---------|-----------|
| **IntelliJ IDEA** | Run Configuration で環境変数を設定 | GUI で設定 |
| **AWS EC2（開発）** | 環境変数をエクスポート | `export GEMINI_API_KEY="..."` |
| **AWS EC2（本番）** | systemd サービスとして実行 | `systemctl start soccer-news` |

セキュリティを確保しながら、環境に応じた適切な方法でAPIキーを管理してください。
