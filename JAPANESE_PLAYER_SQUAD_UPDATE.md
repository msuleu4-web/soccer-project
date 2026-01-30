# 日本人選手セクション ロジック変更完了レポート

## 📋 変更概要

**変更日時**: 2026年1月30日  
**変更内容**: `/scorers` APIから `/teams/{teamId}` Squad APIへの切り替え

---

## 🎯 変更の目的

### 課題
- 現在の `/scorers` API使用では、得点王ランク外の主力日本人選手（三笘薫、久保建英、冨安健洋など）が表示されない
- 画面が寂しい状態になっている

### 解決策
- リーグ全体の得点王ランキングではなく、**日本人選手が所属する特定チームのSquad（選手名簿）API**を使用
- `nationality: "Japan"` の選手を抽出するロジックに変更

---

## 🔧 実装内容

### 1. DTO拡張 (`FootballDataApiResponse.java`)

```java
// Team Squad API用のフィールド追加
@JsonProperty("squad")
private List<SquadMember> squad;

// SquadMember内部クラス追加
public static class SquadMember {
    private Integer id;
    private String name;
    private String position;
    private String dateOfBirth;
    private String nationality;
    private Integer shirtNumber;
}
```

### 2. APIクライアント拡張 (`FootballDataApiClient.java`)

#### 新規メソッド追加

```java
// チームスカッド取得（24時間キャッシュ）
@Cacheable(value = "footballDataSquad", key = "#teamId")
public FootballDataApiResponse getTeamSquad(Integer teamId)

// 日本人選手フィルタリング
public List<SquadMember> filterJapaneseSquadMembers(FootballDataApiResponse response)

// 複数チームから日本人選手取得
public List<SquadMember> getJapanesePlayersFromTeams(List<Integer> teamIds)
```

### 3. キャッシュ設定更新 (`CacheConfig.java`)

```java
@Bean
public CacheManager cacheManager() {
    CaffeineCacheManager cacheManager = new CaffeineCacheManager(
            "footballDataScorers",   // 1時間キャッシュ
            "footballDataSquad"      // 24時間キャッシュ（新規追加）
    );
    // ...
}
```

### 4. 更新サービス完全リニューアル (`JapanesePlayerUpdateService.java`)

#### 対象チームリスト管理

```java
private static final Map<Integer, TeamInfo> TARGET_TEAMS = Map.ofEntries(
    Map.entry(92, new TeamInfo("レアル・ソシエダ", "ラ・リーガ", "PD")),
    Map.entry(397, new TeamInfo("ブライトン", "プレミアリーグ", "PL")),
    Map.entry(678, new TeamInfo("アヤックス", "エールディヴィジ", "DED")),
    Map.entry(64, new TeamInfo("リヴァプール", "プレミアリーグ", "PL")),
    Map.entry(675, new TeamInfo("フェイエノールト", "エールディヴィジ", "DED")),
    Map.entry(12, new TeamInfo("フライブルク", "ブンデスリーガ", "BL1")),
    Map.entry(354, new TeamInfo("クリスタル・パレス", "プレミアリーグ", "PL")),
    Map.entry(5, new TeamInfo("バイエルン・ミュンヘン", "ブンデスリーガ", "BL1")),
    Map.entry(548, new TeamInfo("ASモナコ", "リーグ・アン", "FL1")),
    Map.entry(547, new TeamInfo("スタッド・ランス", "リーグ・アン", "FL1"))
);
```

#### 新しいデータ取得フロー

1. **得点データ取得** (`fetchScorersData()`)
   - 各リーグの `/scorers` APIから日本人得点者データを取得
   - 選手名をキーとしたMapに格納（マージ用）

2. **チームスカッド取得** (`fetchLatestPlayerDataFromApi()`)
   - 各チームの `/teams/{teamId}` APIからスカッドを取得
   - `nationality == "Japan"` の選手をフィルタリング
   - 得点データとマージして完全な選手情報を生成

3. **データマージ** (`convertSquadMemberToEntity()`)
   - スカッドデータ（名前、ポジション、背番号）
   - 得点データ（ゴール数、アシスト数、出場試合数）
   - 両方を統合して `JapanesePlayer` エンティティを生成

---

## 📊 期待される結果

### 表示される選手例

| 選手名 | 所属チーム | リーグ | ポジション | 背番号 |
|--------|-----------|--------|-----------|--------|
| 久保建英 | レアル・ソシエダ | ラ・リーガ | MF | 14 |
| 三笘薫 | ブライトン | プレミアリーグ | FW | 22 |
| 冨安健洋 | アヤックス | エールディヴィジ | DF | 3 |
| 遠藤航 | リヴァプール | プレミアリーグ | MF | 3 |
| 上田綺世 | フェイエノールト | エールディヴィジ | FW | 9 |
| 堂安律 | フライブルク | ブンデスリーガ | MF | 8 |
| 鎌田大地 | クリスタル・パレス | プレミアリーグ | MF | 18 |
| 伊藤洋輝 | バイエルン・ミュンヘン | ブンデスリーガ | DF | 4 |
| 南野拓実 | ASモナコ | リーグ・アン | FW | 18 |
| 伊東純也 | スタッド・ランス | リーグ・アン | FW | 7 |

**✅ 得点の有無にかかわらず、全ての日本人選手が表示される**

---

## 🔒 API制限対策

### 無料プランの制限
- **制限**: 1分間に10回まで
- **対策**: リクエスト間に6.5秒の待機時間を設定

### キャッシュ戦略
- **得点データ**: 1時間キャッシュ（頻繁に変動）
- **スカッドデータ**: 24時間キャッシュ（選手名簿は安定）

### 自動更新スケジュール
- **実行時間**: 毎日 午前6時 & 午後6時（日本時間）
- **処理時間**: 約10チーム × 6.5秒 = 約65秒（1分強）

---

## 🚀 使用方法

### 自動更新
```java
// スケジュール設定済み（毎日6時・18時）
@Scheduled(cron = "0 0 6,18 * * ?", zone = "Asia/Tokyo")
public void updatePlayerStats()
```

### 手動更新
```java
// コントローラーやサービスから呼び出し
japanesePlayerUpdateService.updatePlayerStatsManually();
```

### 特定選手の更新
```java
japanesePlayerUpdateService.updateSpecificPlayer("久保建英");
```

---

## 📝 ログ出力例

```
=== 日本人選手情報の自動更新を開始します（Football-Data.org API） ===
Football-Data.org APIから日本人選手データを取得中（チームスカッド方式）...
得点データを取得中（スカッドデータとのマージ用）...
リーグ PL から 3 件の日本人得点者データを取得
リーグ PD から 1 件の日本人得点者データを取得
合計 8 件の日本人得点者データを取得しました
チーム レアル・ソシエダ (92) のスカッドを取得中...
チーム レアル・ソシエダ から 1 件の日本人選手を発見
日本人選手発見: 久保建英 - レアル・ソシエダ (ラ・リーガ) - ポジション: MF, 背番号: 14
レート制限対策のため6.5秒待機中... (1/10)
チーム ブライトン (397) のスカッドを取得中...
チーム ブライトン から 1 件の日本人選手を発見
日本人選手発見: 三笘薫 - ブライトン (プレミアリーグ) - ポジション: FW, 背番号: 22
...
APIから12件の日本人選手データを取得しました
更新完了: 久保建英 - レアル・ソシエダ (ラ・リーガ) - ゴール: 8, アシスト: 5
更新完了: 三笘薫 - ブライトン (プレミアリーグ) - ゴール: 6, アシスト: 4
=== 日本人選手情報の自動更新が完了しました（12件） ===
```

---

## ✅ 変更ファイル一覧

1. ✅ `src/main/java/com/soccer/news/dto/FootballDataApiResponse.java`
   - SquadMember内部クラス追加
   - squadフィールド追加

2. ✅ `src/main/java/com/soccer/news/service/FootballDataApiClient.java`
   - getTeamSquad() メソッド追加
   - filterJapaneseSquadMembers() メソッド追加
   - getJapanesePlayersFromTeams() メソッド追加

3. ✅ `src/main/java/com/soccer/news/config/CacheConfig.java`
   - footballDataSquad キャッシュ追加（24時間）

4. ✅ `src/main/java/com/soccer/news/service/JapanesePlayerUpdateService.java`
   - TARGET_TEAMS マップ追加（10チーム）
   - fetchLatestPlayerDataFromApi() 完全リニューアル
   - fetchScorersData() 新規追加
   - convertSquadMemberToEntity() 新規追加

---

## 🧪 テスト方法

### 1. アプリケーション起動
```bash
mvnw spring-boot:run
```

### 2. 手動更新テスト
```bash
# ログを確認しながら手動更新を実行
# JapanesePlayerController に手動更新エンドポイントを追加することを推奨
```

### 3. データ確認
```
http://localhost:8080/players
```

---

## 🎉 完了

**ステータス**: ✅ 実装完了  
**次のステップ**: アプリケーションを起動してテスト実行

---

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. **APIトークン**: `application.yml` の `football-data.api-token` が正しく設定されているか
2. **ログ**: エラーメッセージを確認
3. **キャッシュ**: 必要に応じてキャッシュをクリア
4. **レート制限**: 429エラーが出る場合は待機時間を調整

---

**変更者**: Cline AI Assistant  
**レビュー**: 必要に応じて人間のレビューを実施してください
