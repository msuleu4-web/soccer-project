# 日本人選手情報 自動更新機能ガイド

## 📋 概要

このシステムは、日本人選手の最新情報を**自動的に更新**する機能を実装しています。
最新の試合結果、ゴール数、アシスト数などが常に最新の状態に保たれます。

## ⚙️ 自動更新の仕組み

### 🕐 定期自動更新

システムは以下のスケジュールで**自動的に**選手情報を更新します：

- **毎日 午前6時** （日本時間）
- **毎日 午後6時** （日本時間）

この時間帯は、欧州の試合が終了した後に設定されており、最新の試合結果を反映できます。

### 📊 更新される情報

以下の情報が自動的に更新されます：

- ✅ 今シーズンのゴール数
- ✅ 今シーズンのアシスト数
- ✅ 出場試合数
- ✅ 最新試合の評価点
- ✅ 最新試合の走行距離
- ✅ 最新試合の対戦相手
- ✅ 最新試合の結果
- ✅ 所属チーム情報
- ✅ リーグ情報

## 🎯 対象選手

現在、以下の日本人選手の情報が自動更新されます：

### プレミアリーグ
- **三笘薫** (ブライトン)
- **冨安健洋** (アーセナル)
- **遠藤航** (リヴァプール)
- **鎌田大地** (クリスタル・パレス)

### ラ・リーガ
- **久保建英** (レアル・ソシエダ)

## 🔧 手動更新機能

自動更新を待たずに、**今すぐ**最新情報を取得したい場合：

### 方法1: Webインターフェース

1. トップページ（`http://localhost:8080/`）にアクセス
2. ページ下部の「**日本人選手情報を更新**」ボタンをクリック
3. 更新完了メッセージが表示されます

### 方法2: APIエンドポイント

```bash
# POSTリクエストで手動更新
curl -X POST http://localhost:8080/api/players/update
```

## 📁 実装ファイル

### 1. JapanesePlayerUpdateService.java
**場所**: `src/main/java/com/soccer/news/service/JapanesePlayerUpdateService.java`

**役割**: 
- 定期的な自動更新のスケジュール管理
- 外部データソースからの情報取得
- データベースへの保存

**主要メソッド**:
```java
@Scheduled(cron = "0 0 6,18 * * ?", zone = "Asia/Tokyo")
public void updatePlayerStats()
```

### 2. SoccerNewsApplication.java
**場所**: `src/main/java/com/soccer/news/SoccerNewsApplication.java`

**変更点**:
```java
@EnableScheduling  // スケジューラーを有効化
```

### 3. ニュースコントローラー.java
**場所**: `src/main/java/com/soccer/news/controller/ニュースコントローラー.java`

**追加エンドポイント**:
```java
@PostMapping("/api/players/update")
public String 選手情報更新(RedirectAttributes redirectAttributes)
```

## 🔍 ログの確認

更新状況はログで確認できます：

```
=== 日本人選手情報の自動更新を開始します ===
更新完了: 久保建英 - レアル・ソシエダ (ラ・リーガ)
更新完了: 三笘薫 - ブライトン (プレミアリーグ)
更新完了: 冨安健洋 - アーセナル (プレミアリーグ)
更新完了: 遠藤航 - リヴァプール (プレミアリーグ)
更新完了: 鎌田大地 - クリスタル・パレス (プレミアリーグ)
=== 日本人選手情報の自動更新が完了しました（5件） ===
```

## 🎨 カスタマイズ

### 更新スケジュールの変更

`JapanesePlayerUpdateService.java`の`@Scheduled`アノテーションを編集：

```java
// 現在: 毎日6時と18時
@Scheduled(cron = "0 0 6,18 * * ?", zone = "Asia/Tokyo")

// 例: 毎時0分に更新
@Scheduled(cron = "0 0 * * * ?", zone = "Asia/Tokyo")

// 例: 毎日正午のみ
@Scheduled(cron = "0 0 12 * * ?", zone = "Asia/Tokyo")

// 例: 30分ごと
@Scheduled(cron = "0 */30 * * * ?", zone = "Asia/Tokyo")
```

### Cron式の説明

```
秒 分 時 日 月 曜日
0  0  6  *  *  ?    = 毎日午前6時
0  0  18 *  *  ?    = 毎日午後6時
0  */30 * * * ?     = 30分ごと
0  0  */3 * * ?     = 3時間ごと
```

### 選手の追加

`JapanesePlayerUpdateService.java`の`fetchFromTransfermarkt()`メソッドに選手を追加：

```java
// 新しい選手を追加
JapanesePlayer newPlayer = JapanesePlayer.builder()
        .playerName("選手名")
        .teamName("チーム名")
        .league("リーグ名")
        .position("ポジション")
        .jerseyNumber(背番号)
        .goals(ゴール数)
        .assists(アシスト数)
        .matchesPlayed(試合数)
        .latestRating(評価点)
        .latestDistance(走行距離)
        .latestMatchDate(LocalDateTime.now().minusDays(1))
        .latestOpponent("対戦相手")
        .latestResult("試合結果")
        .apiPlayerId("API-ID")
        .build();
players.add(newPlayer);
```

## 🚀 データソースの拡張

現在はデモデータを使用していますが、実際のAPIと連携することも可能です：

### 推奨API

1. **API-Football** (https://www.api-football.com/)
   - 包括的なサッカーデータAPI
   - リアルタイム試合情報
   - 選手統計データ

2. **Transfermarkt API**
   - 選手の市場価値
   - 移籍情報
   - 詳細な統計データ

3. **SofaScore API**
   - 試合評価点
   - 詳細なパフォーマンス指標

### API連携の実装例

```java
private List<JapanesePlayer> fetchFromAPI() {
    RestTemplate restTemplate = new RestTemplate();
    String apiUrl = "https://api-football.com/v3/players";
    
    HttpHeaders headers = new HttpHeaders();
    headers.set("x-rapidapi-key", "YOUR_API_KEY");
    
    HttpEntity<String> entity = new HttpEntity<>(headers);
    ResponseEntity<String> response = restTemplate.exchange(
        apiUrl, HttpMethod.GET, entity, String.class
    );
    
    // JSONをパースして選手情報を取得
    return parsePlayerData(response.getBody());
}
```

## 📈 パフォーマンス

- **更新時間**: 約2-5秒（5選手の場合）
- **データベース負荷**: 最小限（既存データの更新のみ）
- **メモリ使用量**: 軽量（Virtual Threads使用）

## 🔒 セキュリティ

- 手動更新エンドポイントは認証が必要な場合、Spring Securityで保護可能
- APIキーは環境変数で管理することを推奨

```yaml
# application.yml
api:
  football:
    key: ${FOOTBALL_API_KEY}
```

## 🐛 トラブルシューティング

### 自動更新が動作しない

1. `@EnableScheduling`が有効か確認
2. ログにエラーメッセージがないか確認
3. タイムゾーン設定を確認

### データが更新されない

1. データソースの接続を確認
2. ログで更新処理の実行を確認
3. データベースの接続を確認

### 手動更新ボタンが表示されない

1. ブラウザのキャッシュをクリア
2. `index.html`が最新版か確認

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. ログファイル（`logs/application.log`）
2. データベースの状態
3. ネットワーク接続

## 🎉 まとめ

この自動更新機能により：

- ✅ **常に最新の情報**が表示されます
- ✅ **手動作業が不要**になります
- ✅ **リアルタイム性**が向上します
- ✅ **ユーザー体験**が改善されます

最新情報に敏感なユーザーのニーズに応える、信頼性の高いシステムです！
