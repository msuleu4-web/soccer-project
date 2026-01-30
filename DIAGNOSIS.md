# AI要約エラー診断レポート

## 問題の症状
「【AI要約エラー】モデルが見つかりません。APIキーまたはモデル設定を確認してください。」というエラーが継続的に発生

## 調査結果

### ✅ 1. モデル名の設定 - 正常
- **現在の設定**: `claude-3-5-sonnet-20240620`
- **状態**: 正しいモデル名が設定されている
- **場所**: `src/main/resources/application.yml` および `target/classes/application.yml`

### ✅ 2. コードの実装 - 正常
- **AI要約サービス**: 適切なエラーハンドリングが実装されている
- **ChatModel**: `@Autowired(required = false)` で適切に設定されている
- **エラーメッセージ**: 404エラーを検出して適切なメッセージを表示

### ✅ 3. 依存関係 - 正常
- **Spring AI**: `spring-ai-anthropic-spring-boot-starter` が正しく設定されている
- **バージョン**: `1.0.0-M4` (Milestone版)

## 🔍 根本原因の特定

### 原因1: Spring AI 1.0.0-M4のモデル名の問題
Spring AI 1.0.0-M4 (Milestone版) では、Anthropic APIのモデル名の扱いに問題がある可能性があります。

**考えられる問題:**
1. **古いバージョンのSpring AI**: M4はマイルストーン版で、最新のClaudeモデル名に対応していない可能性
2. **モデル名のマッピング**: Spring AIが内部でモデル名を変換する際に問題が発生している可能性
3. **APIバージョンの不一致**: Anthropic APIのバージョンとSpring AIの互換性の問題

### 原因2: APIキーの問題
- APIキーが正しく設定されていない
- APIキーの権限が不足している
- APIキーが無効または期限切れ

### 原因3: Anthropic APIの変更
2024年6月以降、Anthropic APIの仕様が変更され、モデル名 `claude-3-5-sonnet-20240620` が廃止された可能性

## 💡 解決策

### 解決策1: 最新のSpring AIバージョンにアップグレード（推奨）

**現在**: `1.0.0-M4` (Milestone)
**推奨**: `1.0.0-SNAPSHOT` または最新の安定版

```xml
<properties>
    <spring-ai.version>1.0.0-SNAPSHOT</spring-ai.version>
</properties>
```

**リポジトリの追加が必要:**
```xml
<repositories>
    <repository>
        <id>spring-snapshots</id>
        <name>Spring Snapshots</name>
        <url>https://repo.spring.io/snapshot</url>
        <snapshots>
            <enabled>true</enabled>
        </snapshots>
    </repository>
</repositories>
```

### 解決策2: 最新のモデル名を使用

Anthropic APIの最新のモデル名に変更:

```yaml
spring:
  ai:
    anthropic:
      chat:
        options:
          model: claude-3-5-sonnet-20241022  # 最新版
```

**注意**: このモデル名がSpring AI 1.0.0-M4でサポートされているか確認が必要

### 解決策3: 古いモデル名を試す

より古い、確実に動作するモデル名を使用:

```yaml
spring:
  ai:
    anthropic:
      chat:
        options:
          model: claude-3-sonnet-20240229  # Claude 3 Sonnet (古いバージョン)
```

### 解決策4: APIキーの確認

1. **APIキーが正しく設定されているか確認**
   ```cmd
   echo %SPRING_AI_ANTHROPIC_API_KEY%
   ```

2. **Anthropic Consoleで確認**
   - https://console.anthropic.com/settings/keys
   - APIキーが有効か確認
   - 使用量制限に達していないか確認

3. **APIキーの権限を確認**
   - モデルへのアクセス権限があるか確認

### 解決策5: デバッグログを有効化

より詳細なエラー情報を取得:

```yaml
logging:
  level:
    com.soccer.news: DEBUG
    org.springframework.ai: DEBUG  # INFOからDEBUGに変更
    org.springframework.ai.anthropic: DEBUG  # 追加
```

## 🎯 推奨される対応手順

### ステップ1: モデル名を変更して試す
最も簡単な解決策として、古いモデル名を試す:

```yaml
model: claude-3-sonnet-20240229
```

### ステップ2: APIキーを確認
- Anthropic Consoleでキーが有効か確認
- 新しいAPIキーを生成して試す

### ステップ3: Spring AIをアップグレード
上記で解決しない場合、Spring AIを最新版にアップグレード

### ステップ4: ログを詳細化
デバッグログを有効にして、詳細なエラー情報を取得

## 📊 次のアクション

1. **即座に試せる対策**: モデル名を `claude-3-sonnet-20240229` に変更
2. **APIキーの確認**: Anthropic Consoleで確認
3. **ログの確認**: デバッグログを有効にして詳細なエラーを確認
4. **長期的な対策**: Spring AIを最新版にアップグレード

## 🔗 参考リンク

- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
- [Anthropic API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [Anthropic Console](https://console.anthropic.com/)
- [Spring AI GitHub](https://github.com/spring-projects/spring-ai)
