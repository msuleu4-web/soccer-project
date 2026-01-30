# ⚽ 海外サッカーニュースプラットフォーム

**Spring AI と Virtual Threads を活用した次世代ニュース分析システム**

## 📋 プロジェクト概要

海外の主要サッカーメディアから最新ニュースを自動収集し、LLM（大規模言語モデル）を使用して日本語で要約するWebアプリケーションです。

### 🎯 主な特徴

- **🤖 AI駆動の要約**: Spring AIを使用してニュース記事を高精度で日本語要約
- **⚡ 高速並行処理**: Java 21のVirtual Threadsで複数ソースから同時スクレイピング
- **🌐 モダンなアーキテクチャ**: 2026年時点の最新技術スタックを採用
- **🐳 コンテナ対応**: Docker Composeで簡単にローカル環境構築

---

## 🛠️ 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **言語** | Java | 21 (LTS) | Virtual Threads対応 |
| **フレームワーク** | Spring Boot | 3.4.1 | アプリケーション基盤 |
| **AI統合** | Spring AI | 1.0.0-M4 | LLM統合フレームワーク |
| **LLMプロバイダー** | Anthropic Claude | 3.5 Sonnet | ニュース要約生成 |
| **スクレイピング** | Jsoup | 1.17.2 | HTML解析 |
| **テンプレート** | Thymeleaf | - | フロントエンド描画 |
| **ビルドツール** | Maven | - | 依存関係管理 |
| **コンテナ** | Docker | - | 環境構築 |

---

## 📁 プロジェクト構成

```
soccer_project/
├── src/
│   ├── main/
│   │   ├── java/com/soccer/news/
│   │   │   ├── SoccerNewsApplication.java      # メインクラス
│   │   │   ├── controller/
│   │   │   │   └── ニュースコントローラー.java   # Web画面制御
│   │   │   ├── service/
│   │   │   │   ├── スクレイピングサービス.java   # ニュース取得
│   │   │   │   └── AI要約サービス.java          # AI要約処理
│   │   │   ├── model/
│   │   │   │   └── ニュース記事.java            # データモデル
│   │   │   └── config/
│   │   │       └── VirtualThreadsConfig.java   # Virtual Threads設定
│   │   └── resources/
│   │       ├── application.yml                 # アプリケーション設定
│   │       └── templates/
│   │           └── index.html                  # トップページ
├── pom.xml                                     # Maven設定
├── Dockerfile                                  # Dockerイメージ定義
├── docker-compose.yml                          # Docker Compose設定
└── README.md                                   # このファイル
```

---

## 🚀 セットアップ手順

### 前提条件

- **Java 21** 以上がインストールされていること
- **Maven 3.8+** がインストールされていること
- （オプション）**Docker & Docker Compose** がインストールされていること

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd soccer_project
```

### 2. 環境変数の設定

#### Anthropic (Claude) 使用時

**最も簡単な方法**: `run.bat` を実行すると自動的にAPIキーの入力を求められます

**手動設定の場合**:

```bash
# Windows (PowerShell)
$env:SPRING_AI_ANTHROPIC_API_KEY="your-anthropic-api-key"

# Windows (コマンドプロンプト)
set SPRING_AI_ANTHROPIC_API_KEY=your-anthropic-api-key
```

APIキー取得: https://console.anthropic.com/settings/keys

### 3. アプリケーションの起動

#### 方法A: Mavenで直接起動

```bash
./mvnw spring-boot:run
```

#### 方法B: Docker Composeで起動

```bash
docker-compose up -d
```

### 4. アクセス

ブラウザで以下にアクセス:

```
http://localhost:8080
```

---

## ⚙️ 設定ファイル

### application.yml

主要な設定項目:

```yaml
spring:
  ai:
    anthropic:
      api-key: ${SPRING_AI_ANTHROPIC_API_KEY}  # Anthropic APIキー
      chat:
        options:
          model: claude-3-5-sonnet-20241022

soccer-news:
  sources:
    - name: "BBC Sport Football"
      url: "https://www.bbc.com/sport/football"
      enabled: true
  summarization:
    provider: anthropic  # Anthropic Claude使用
    language: ja         # 要約言語
```

---

## 🎨 アーキテクチャの特徴

### 1. Virtual Threads による高速並行処理

Java 21の新機能「Virtual Threads」を活用し、従来のスレッドプールよりも軽量で高速な並行処理を実現。

```java
// VirtualThreadsConfig.java
@Bean
public AsyncTaskExecutor asyncTaskExecutor() {
    return new TaskExecutorAdapter(
        Executors.newVirtualThreadPerTaskExecutor()
    );
}
```

### 2. Spring AI による柔軟なLLM統合

Anthropic Claude 3.5 Sonnetを使用した高精度な要約生成。

```java
// AI要約サービス.java
public String 要約生成(String 記事本文) {
    PromptTemplate template = new PromptTemplate(promptText);
    ChatResponse response = chatClient.call(template.create(...));
    return response.getResult().getOutput().getContent();
}
```

### 3. マルチステージDockerビルド

最適化されたDockerイメージで本番環境にも対応。

---

## 📊 今後の実装予定

- [ ] 実際のスクレイピングロジックの実装
- [ ] データベース連携（記事の永続化）
- [ ] REST API エンドポイントの追加
- [ ] 管理画面の実装
- [ ] スケジューラーによる自動更新
- [ ] キャッシュ機能の追加
- [ ] テストコードの充実

---

## 🤝 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

---

## 📄 ライセンス

MIT License

---

## 👨‍💻 開発者

**プロジェクト作成日**: 2026年1月28日

---

## 🔗 参考リンク

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Java 21 Virtual Threads](https://openjdk.org/jeps/444)
- [Jsoup Documentation](https://jsoup.org/)
- [Anthropic Claude](https://www.anthropic.com/claude)

---

**🌟 このプロジェクトが役に立ったら、スターをお願いします！**
