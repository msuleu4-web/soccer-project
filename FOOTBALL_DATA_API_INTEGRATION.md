# Football-Data.org API 連携実装ガイド

## 📋 概要

Football-Data.org APIを活用して、日本人選手の実データをリアルタイムで取得・表示する機能を実装しました。

**実装日**: 2026年1月30日  
**API バージョン**: v4  
**API トークン**: `509f31a084f34d09bddc39a7660a0e49`

---

## 🎯 実装の目的

従来のモックデータから脱却し、実際のサッカーデータAPIと連携することで：

1. **リアルタイムデータ**: 欧州5大リーグの最新得点ランキングを取得
2. **日本人選手フィルタリング**: 国籍が "Japan" の選手のみを自動抽出
3. **自動更新**: 毎日午前6時・午後6時に自動更新（日本時間）
4. **レート制限対応**: 無料プランの制限（1分間10回）に対応したキャッシュ機能

---

## 🏗️ アーキテクチャ

### 実装したコンポーネント

```
src/main/java/com/soccer/news/
├── dto/
│   └── FootballDataApiResponse.java          # APIレスポンスDTO
├── service/
│   ├── FootballDataApiClient.java            # APIクライアント（キャッシュ付き）
│   └── JapanesePlayerUpdateService.java      # 自動更新サービス（リファクタリング済み）
└── config/
    └── CacheConfig.java                       # Caffeineキャッシュ設定
```

---

## 📡 API 仕様

### エンドポイント

```
GET https://api.football-data.org/v4/competitions/{leagueCode}/scorers
```

### リクエストヘッダー

```http
X-Auth-Token: 509f31a084f34d09bddc39a7660a0e49
Accept: application/json
```

### 対応リーグ

| リーグコード | リーグ名 | 日本語名 |
|------------|---------|---------|
| PL | Premier League | プレミアリーグ |
| PD | La Liga | ラ・リーガ |
| BL1 | Bundesliga | ブンデスリーガ |
| SA | Serie A | セリエA |
| FL1 | Ligue 1 | リーグ・アン |

---

## 🔧 設定ファイル

### application.yml

```yaml
# Football-Data.org API設定
football-data:
  api-token: 509f31a084f34d09bddc39a7660a0e49
```

### pom.xml（追加した依存関係）

```xml
<!-- Spring Boot Cache -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>

<!-- Caffeine Cache -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>

<!-- Jackson Databind -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

---

## 💾 キャッシュ戦略

### Caffeineキャッシュの設定

- **キャッシュ名**: `footballDataScorers`
- **有効期限**: 1時間
- **最大エントリ数**: 1000
- **統計記録**: 有効

### レート制限対策

無料プランは **1分間に10回** のリクエスト制限があるため：

1. **@Cacheable アノテーション**: 同じリーグへの重複リクエストを防止
2. **リクエスト間隔**: 各リクエスト間に6.5秒の待機時間を設定
3. **キャッシュ期間**: 1時間キャッシュすることで、頻繁なAPI呼び出しを回避

```java
// リクエスト間隔の実装例
Thread.sleep(6500); // 6.5秒待機 = 1分間に最大9回のリクエスト
```

---

## 🔄 自動更新スケジュール

### スケジュール設定

```java
@Scheduled(cron = "0 0 6,18 * * ?", zone = "Asia/Tokyo")
public void updatePlayerStats()
```

- **実行時刻**: 毎日 午前6時 と 午後6時（日本時間）
- **処理内容**:
  1. 欧州5大リーグからデータ取得
  2. 日本人選手のみフィルタリング
  3. データベースに保存/更新

---

## 📊 データフロー

```
1. スケジューラー起動（毎日6時・18時）
   ↓
2. FootballDataApiClient.getJapanesePlayersFromMultipleLeagues()
   ↓
3. 各リーグのAPIを順次呼び出し（6.5秒間隔）
   ↓
4. レスポンスから nationality="Japan" の選手を抽出
   ↓
5. DTOをJapanesePlayerエンティティに変換
   ↓
6. JapanesePlayerService.saveOrUpdatePlayer()
   ↓
7. データベースに保存（既存データは更新）
```

---

## 🧪 テスト方法

### 1. 手動更新のテスト

```java
@Autowired
private JapanesePlayerUpdateService updateService;

// 手動で更新を実行
updateService.updatePlayerStatsManually();
```

### 2. APIクライアントの単体テスト

```java
@Autowired
private FootballDataApiClient apiClient;

// プレミアリーグのデータ取得
FootballDataApiResponse response = apiClient.getTopScorers("PL");

// 日本人選手のフィルタリング
List<Scorer> japanesePlayers = apiClient.filterJapanesePlayers(response);
```

### 3. アプリケーション起動後の確認

```bash
# アプリケーション起動
./run.bat

# ログで確認
# "Football-Data.org APIから日本人選手データを取得中..."
# "APIから X 件の日本人選手データを取得しました"
```

---

## 📝 実装の詳細

### FootballDataApiClient.java

**主要メソッド**:

- `getTopScorers(String leagueCode)`: 指定リーグの得点ランキング取得（キャッシュ付き）
- `getTopScorersFromMultipleLeagues(List<String> leagueCodes)`: 複数リーグから取得
- `filterJapanesePlayers(FootballDataApiResponse response)`: 日本人選手のみ抽出
- `getJapanesePlayersFromMultipleLeagues(List<String> leagueCodes)`: 全リーグから日本人選手を取得

**エラーハンドリング**:

- `200 OK`: 正常処理
- `429 Too Many Requests`: レート制限エラー（ログ出力）
- その他のエラー: 例外をキャッチしてログ出力

### JapanesePlayerUpdateService.java

**リファクタリング内容**:

- ❌ 削除: `fetchFromTransfermarkt()` - モックデータ生成メソッド
- ❌ 削除: `fetchFromSoccerway()` - 未使用メソッド
- ✅ 追加: `fetchLatestPlayerDataFromApi()` - 実APIからデータ取得
- ✅ 追加: `convertToEntity()` - DTOをエンティティに変換
- ✅ 追加: `getLeagueNameInJapanese()` - リーグ名を日本語に変換

---

## ⚠️ 注意事項

### 無料プランの制限

- **リクエスト制限**: 1分間に10回まで
- **1日の制限**: 制限なし（ただし、レート制限を守る必要あり）
- **データ更新頻度**: リアルタイムではなく、定期的に更新

### 推奨事項

1. **キャッシュの活用**: 同じデータへの重複リクエストを避ける
2. **エラーハンドリング**: 429エラー時は再試行せず、次回の更新を待つ
3. **ログ監視**: API呼び出しの成功/失敗をログで確認

---

## 🚀 今後の拡張案

### 1. より詳細なデータ取得

```java
// 選手の詳細情報を取得するエンドポイント
GET /v4/persons/{playerId}
```

### 2. 試合結果の取得

```java
// チームの試合結果を取得
GET /v4/teams/{teamId}/matches
```

### 3. リアルタイム通知

- 日本人選手がゴールした際にプッシュ通知
- 試合開始前のリマインダー

### 4. データ分析

- 選手のパフォーマンス推移グラフ
- リーグ別の日本人選手統計

---

## 📚 参考リンク

- [Football-Data.org 公式ドキュメント](https://www.football-data.org/documentation/quickstart)
- [API v4 エンドポイント一覧](https://www.football-data.org/documentation/api)
- [Spring Cache 公式ドキュメント](https://docs.spring.io/spring-framework/reference/integration/cache.html)
- [Caffeine Cache GitHub](https://github.com/ben-manes/caffeine)

---

## 🎉 まとめ

この実装により、以下を達成しました：

✅ Football-Data.org APIとの連携  
✅ 日本人選手データの自動取得・更新  
✅ レート制限に対応したキャッシュ機能  
✅ 定期的な自動更新（毎日2回）  
✅ モックデータから実データへの移行  

これで、アプリケーションは常に最新の日本人選手情報を表示できるようになりました！
