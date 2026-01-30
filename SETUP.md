# 🚀 セットアップガイド

## 📋 前提条件

このプロジェクトを実行するには、以下のソフトウェアが必要です：

### 必須
- **Java 21** (LTS版)
  - ダウンロード: https://adoptium.net/
  - インストール後、`java -version` で確認

### 推奨
- **Maven 3.8+**
  - ダウンロード: https://maven.apache.org/download.cgi
  - または、プロジェクトに含まれるMaven Wrapperを使用

### オプション（AI機能を使用する場合）
- **Anthropic (Claude) APIキー**

---

## 🔧 セットアップ手順

### 1. Java 21のインストール確認

```bash
java -version
```

以下のような出力が表示されればOK：
```
openjdk version "21.0.x" 2024-xx-xx
```

### 2. プロジェクトのビルド

#### 方法A: Mavenがインストールされている場合

```bash
cd c:\Users\KIMYONGJIN\Desktop\soccer_project
mvn clean install
```

#### 方法B: Maven Wrapperを使用（Mavenがない場合）

```bash
cd c:\Users\KIMYONGJIN\Desktop\soccer_project
mvnw.cmd clean install
```

### 3. アプリケーションの起動

#### 最も簡単な方法: 起動スクリプトを使用

```bash
run.bat
```

#### または、Mavenコマンドで起動

```bash
mvn spring-boot:run
```

#### または、Maven Wrapperで起動

```bash
mvnw.cmd spring-boot:run
```

### 4. ブラウザでアクセス

アプリケーションが起動したら、以下のURLにアクセス：

```
http://localhost:8080
```

---

## ⚙️ AI機能の設定（オプション）

### Anthropic (Claude) を使用する場合

1. Anthropic APIキーを取得: https://console.anthropic.com/settings/keys

2. **最も簡単な方法**: `run.bat` を実行すると自動的にAPIキーの入力を求められます

3. **手動で環境変数を設定する場合**:

**Windows (PowerShell):**
```powershell
$env:SPRING_AI_ANTHROPIC_API_KEY="your-anthropic-api-key-here"
```

**Windows (コマンドプロンプト):**
```cmd
set SPRING_AI_ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

4. `application.yml`で設定を確認:
```yaml
spring:
  ai:
    anthropic:
      api-key: ${SPRING_AI_ANTHROPIC_API_KEY}
      chat:
        options:
          model: claude-3-5-sonnet-20241022
```

---

## 🐛 トラブルシューティング

### エラー: "Java 21が見つかりません"

- Java 21がインストールされているか確認
- 環境変数`JAVA_HOME`が正しく設定されているか確認

### エラー: "Mavenが見つかりません"

- `run.bat`を使用（自動的にMaven Wrapperを使用）
- または、Mavenをインストール

### エラー: "ChatModelが設定されていません"

- これは正常です。Anthropic APIキーが設定されていない場合、ダミーメッセージが表示されます
- AI機能を使用する場合は、`run.bat` 起動時にAPIキーを入力してください
- または、上記の「AI機能の設定」を参照して環境変数を設定してください

### ポート8080が既に使用されている

`application.yml`でポートを変更:
```yaml
server:
  port: 8081  # 別のポート番号に変更
```

---

## 📊 動作確認

アプリケーションが正常に起動すると、以下のログが表示されます：

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.4.1)

...
Started SoccerNewsApplication in X.XXX seconds
```

ブラウザで `http://localhost:8080` にアクセスして、画面が表示されればOK！

---

## 🎯 次のステップ

1. ニュースソースの設定を`application.yml`でカスタマイズ
2. AI APIキーを設定して要約機能を有効化
3. スクレイピングロジックの実装
4. データベース連携の追加

---

## 💡 ヒント

- 開発中は`spring-boot-devtools`が自動リロードを提供します
- ログレベルは`application.yml`で調整可能
- Docker Composeを使用する場合は`docker-compose up`で起動

---

**問題が解決しない場合は、README.mdの「参考リンク」セクションを確認してください。**
