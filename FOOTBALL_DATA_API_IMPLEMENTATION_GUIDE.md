# Football-Data.org API 実装ガイド

## 📋 概要

このドキュメントは、Football-Data.org API (v4) を使用して日本人選手データを取得・更新する実装の完全ガイドです。

## 🎯 実装の目的

現在、アプリケーション内の「日本人選手速報」セクションに表示されているデータを、実際のAPI（Football-Data.org）と連携して、リアルタイムの正確なデータに更新します。

## 🔑 API 仕様および接続情報

### 基本情報
- **サービス**: Football-Data.org (v4)
- **API Token**: `509f31a084f34d09bddc39a7660a0e49`
- **認証方法**: HTTPヘッダーに `X-Auth-Token: 509f31a084f34d09bddc39a7660a0e49` を設定
- **ベースURL**: `https://api.football-data.org/v4`

### 動作確認済み
PowerShell の `Invoke-RestMethod` を使用して、データの取得ができることを確認済みです。

```powershell
$headers = @{
    "X-Auth-Token" = "509f31a084f34d09bddc39a7660a0e49"
}
Invoke-RestMethod -Uri "https://api.football-data.org/v4/competitions/PL/scorers" -Headers $headers
```

## 📊 対象リーグ

以下の3つのリーグから日本人選手データを取得します：

| リーグ名 | リーグコード | 説明 |
|---------|------------|------|
| プレミアリーグ | `PL` | イングランド |
| ラ・リーガ | `PD` | スペイン |
| エールディヴィジ | `DED` | オランダ |

### 重要な選手情報
- **冨安健洋選手**: 現在はアーセナルではなく **アヤックス (Ajax / リーグコード: DED)** 所属
- **久保建英選手**: ラ・リーガ (PD) のレアル・ソシエダ所属

## ⚠️ 無料プランの制限

### レート制限
- **制限**: 1分間に10回のAPI呼び出し
- **対策**: 
  - Spring Bootの `@Cacheable` を使用して1時間キャッシュ
  - リクエスト間に6.5秒の待機時間を設定（1分間に最大9回）

### キャッシュ設定
```java
@Cacheable(value = "footballDataScorers", key = "#leagueCode", unless = "#result == null")
public FootballDataApiResponse getTopScorers(String leagueCode) {
    // API呼び出しロジック
}
```

## 🏗️ アーキテクチャ

### 1. FootballDataApiClient
**場所**: `src/main/java/com/soccer/news/service/FootballDataApiClient.java`

**役割**: 外部API通信を担当

**主要メソッド**:
- `getTopScorers(String leagueCode)`: 指定リーグの得点ランキングを取得（キャッシュ付き）
- `filterJapanesePlayers(FootballDataApiResponse response)`: 日本人選手のみをフィルタリング
- `getJapanesePlayersFromMultipleLeagues(List<String> leagueCodes)`: 複数リーグから日本人選手を抽出

**特徴**:
- HTTPクライアントを使用した非同期通信
- 10秒のタイムアウト設定
- 429エラー（レート制限）の適切な処理
- リクエスト間に6.5秒の待機時間

### 2. FootballDataApiResponse (DTO)
**場所**: `src/main/java/com/soccer/news/dto/FootballDataApiResponse.java`

**役割**: JSONレスポンスをマッピング

**主要クラス**:
- `FootballDataApiResponse`: ルートレスポンス
- `Competition`: リーグ情報
- `Season`: シーズン情報
- `Scorer`: 得点者情報
- `Player`: 選手詳細（名前、国籍、ポジション等）
- `Team`: チーム情報

**重要フィールド**:
```java
public static class Player {
    private String name;           // 選手名
    private String nationality;    // 国籍（"Japan"でフィルタリング）
    private String position;       // ポジション
    private Integer shirtNumber;   // 背番号
}

public static class Scorer {
    private Player player;
    private Team team;
    private Integer goals;         // ゴール数
    private Integer assists;       // アシスト数
    private Integer playedMatches; // 出場試合数
}
```

### 3. JapanesePlayerUpdateService
**場所**: `src/main/java/com/soccer/news/service/JapanesePlayerUpdateService.java`

**役割**: 日本人選手情報の自動更新

**主要機能**:
- **自動更新**: 毎日午前6時と午後6時に実行（日本時間）
- **手動更新**: `updatePlayerStatsManually()` メソッドで即座に更新可能
- **国籍フィルタリング**: nationality が "Japan" の選手のみを抽出
- **データ変換**: API DTOをJapanesePlayerエンティティに変換

**対象リーグ**:
```java
private static final List<String> TARGET_LEAGUES = List.of(
    "PL",   // プレミアリーグ
    "PD",   // ラ・リーガ
    "DED"   // エールディヴィジ（オランダ）
);
```

**スケジュール設定**:
```java
@Scheduled(cron = "0 0 6,18 * * ?", zone = "Asia/Tokyo")
@Transactional
public void updatePlayerStats() {
    // 自動更新ロジック
}
```

### 4. JapanesePlayerService
**場所**: `src/main/java/com/soccer/news/service/JapanesePlayerService.java`

**役割**: 選手データのCRUD操作

**主要メソッド**:
- `getTopPlayers(int limit)`: 活躍度順に選手を取得
- `saveOrUpdatePlayer(JapanesePlayer player)`: 選手情報を更新または作成
- `initializeDemoData()`: デモデータの初期投入

### 5. CacheConfig
**場所**: `src/main/java/com/soccer/news/config/CacheConfig.java`

**役割**: キャッシュ設定

**設定内容**:
- キャッシュ名: `footballDataScorers`
- 最大エントリ数: 1000
- 有効期限: 1時間
- 統計記録: 有効

## 🔄 データフロー

```
1. JapanesePlayerUpdateService (スケジュール実行)
   ↓
2. FootballDataApiClient.getTopScorers("PL")
   ↓ (キャッシュチェック)
3. Football-Data.org API呼び出し
   ↓
4. FootballDataApiResponse (JSON → DTO)
   ↓
5. filterJapanesePlayers() (nationality == "Japan")
   ↓
6. convertToEntity() (DTO → JapanesePlayer)
   ↓
7. JapanesePlayerService.saveOrUpdatePlayer()
   ↓
8. データベースに保存
```

## 📝 実装例

### API呼び出しとフィルタリング

```java
// 1. APIクライアントを使用してデータ取得
FootballDataApiResponse response = footballDataApiClient.getTopScorers("PL");

// 2. 日本人選手のみをフィルタリング
List<FootballDataApiResponse.Scorer> japaneseScorers = 
    footballDataApiClient.filterJapanesePlayers(response);

// 3. エンティティに変換
for (FootballDataApiResponse.Scorer scorer : japaneseScorers) {
    JapanesePlayer player = convertToEntity(scorer, "プレミアリーグ");
    playerService.saveOrUpdatePlayer(player);
}
```

### 複数リーグからの一括取得

```java
List<String> leagues = List.of("PL", "PD", "DED");
List<FootballDataApiResponse.Scorer> allJapanesePlayers = 
    footballDataApiClient.getJapanesePlayersFromMultipleLeagues(leagues);
```

## 🧪 テスト方法

### 1. 手動更新のテスト

```java
@Autowired
private JapanesePlayerUpdateService updateService;

// 手動で更新を実行
updateService.updatePlayerStatsManually();
```

### 2. API接続テスト

```bash
# PowerShellでテスト
$headers = @{"X-Auth-Token" = "509f31a084f34d09bddc39a7660a0e49"}

# プレミアリーグ
Invoke-RestMethod -Uri "https://api.football-data.org/v4/competitions/PL/scorers" -Headers $headers

# ラ・リーガ
Invoke-RestMethod -Uri "https://api.football-data.org/v4/competitions/PD/scorers" -Headers $headers

# エールディヴィジ（冨安健洋選手確認用）
Invoke-RestMethod -Uri "https://api.football-data.org/v4/competitions/DED/scorers" -Headers $headers
```

### 3. 冨安健洋選手のデータ確認

```java
// アヤックス（DED）から冨安選手のデータが取得できることを確認
FootballDataApiResponse response = footballDataApiClient.getTopScorers("DED");
List<FootballDataApiResponse.Scorer> japaneseScorers = 
    footballDataApiClient.filterJapanesePlayers(response);

// 冨安選手が含まれているか確認
japaneseScorers.stream()
    .filter(s -> s.getPlayer().getName().contains("Tomiyasu"))
    .forEach(s -> {
        System.out.println("選手名: " + s.getPlayer().getName());
        System.out.println("チーム: " + s.getTeam().getName());
        System.out.println("リーグ: エールディヴィジ");
    });
```

## 📊 データベーススキーマ

### JapanesePlayer エンティティ

```java
@Entity
public class JapanesePlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String playerName;      // 選手名
    private String teamName;        // チーム名
    private String league;          // リーグ名
    private String position;        // ポジション
    private Integer jerseyNumber;   // 背番号
    private Integer goals;          // ゴール数
    private Integer assists;        // アシスト数
    private Integer matchesPlayed;  // 出場試合数
    private String apiPlayerId;     // API選手ID（"FD-{id}"形式）
    private LocalDateTime latestMatchDate; // 最終更新日時
}
```

## 🚀 デプロイ後の確認事項

### 1. ログ確認
```
=== 日本人選手情報の自動更新を開始します（Football-Data.org API） ===
Football-Data.org APIから日本人選手データを取得中...
リーグ PL のデータを取得中...
APIレスポンス取得成功: PL - 20 件の得点者データ
リーグ PL から 3 件の日本人選手を発見
日本人選手発見: 三笘薫 (プレミアリーグ) - ゴール: 6, アシスト: 4
...
リーグ DED のデータを取得中...
日本人選手発見: 冨安健洋 (エールディヴィジ) - ゴール: 0, アシスト: 1
=== 日本人選手情報の自動更新が完了しました（5件） ===
```

### 2. キャッシュ動作確認
- 初回リクエスト: APIを呼び出し（ログに "Football-Data.org APIにリクエスト" が表示）
- 2回目以降（1時間以内）: キャッシュから取得（APIリクエストログなし）

### 3. レート制限の確認
- 3つのリーグを順次取得
- 各リクエスト間に6.5秒の待機
- 合計約13秒で完了

## 🔧 トラブルシューティング

### 問題: 429 Too Many Requests エラー

**原因**: レート制限（1分間に10回）を超過

**解決策**:
1. キャッシュが正しく動作しているか確認
2. 待機時間（6.5秒）が設定されているか確認
3. 複数インスタンスが同時にAPIを呼び出していないか確認

### 問題: 冨安選手のデータが取得できない

**原因**: リーグコードが正しくない、またはAPIデータが更新されていない

**解決策**:
1. リーグコード `DED` が設定されているか確認
2. PowerShellで直接APIを呼び出して確認
3. APIのドキュメントで最新情報を確認

### 問題: キャッシュが効かない

**原因**: CacheConfig の設定ミス

**解決策**:
1. `@EnableCaching` アノテーションが付いているか確認
2. `@Cacheable` のキー設定が正しいか確認
3. Caffeineの依存関係が追加されているか確認（pom.xml）

## 📚 参考リソース

- [Football-Data.org API Documentation](https://www.football-data.org/documentation/quickstart)
- [Spring Cache Abstraction](https://docs.spring.io/spring-framework/reference/integration/cache.html)
- [Caffeine Cache](https://github.com/ben-manes/caffeine)

## 🎉 まとめ

この実装により、以下が実現されました：

✅ Football-Data.org API (v4) との連携  
✅ プレミアリーグ、ラ・リーガ、エールディヴィジからの日本人選手データ取得  
✅ 国籍（nationality == "Japan"）による自動フィルタリング  
✅ 1時間のキャッシュによるレート制限対策  
✅ 毎日2回（午前6時・午後6時）の自動更新  
✅ 冨安健洋選手のアヤックス移籍データの正確な取得  
✅ 久保建英選手のラ・リーガデータの取得  

これで、リアルタイムで正確な日本人選手データをアプリケーションに表示できます！
