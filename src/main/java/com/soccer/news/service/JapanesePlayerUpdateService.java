package com.soccer.news.service;

import com.soccer.news.dto.FootballDataApiResponse;
import com.soccer.news.model.JapanesePlayer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 日本人選手情報自動更新サービス
 * Football-Data.org APIから定期的に最新の選手情報を取得して更新
 * 
 * 変更点: /scorers APIではなく、特定チームの /teams/{teamId} APIから
 * 日本人選手を抽出するロジックに変更
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JapanesePlayerUpdateService {
    
    private final JapanesePlayerService playerService;
    private final FootballDataApiClient footballDataApiClient;
    
    /**
     * 日本人選手が所属する主要チームのID一覧
     * チームID: チーム名, リーグ名のマップ
     */
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
    
    /**
     * チーム情報を保持する内部クラス
     */
    private static class TeamInfo {
        final String teamName;
        final String leagueName;
        final String leagueCode;
        
        TeamInfo(String teamName, String leagueName, String leagueCode) {
            this.teamName = teamName;
            this.leagueName = leagueName;
            this.leagueCode = leagueCode;
        }
    }
    
    /**
     * 日本人選手情報を自動更新
     * 毎日午前6時と午後6時に実行（日本時間）
     * Football-Data.org APIから実データを取得
     */
    @Scheduled(cron = "0 0 6,18 * * ?", zone = "Asia/Tokyo")
    @Transactional
    public void updatePlayerStats() {
        log.info("=== 日本人選手情報の自動更新を開始します（Football-Data.org API） ===");
        
        try {
            List<JapanesePlayer> updatedPlayers = fetchLatestPlayerDataFromApi();
            
            int updateCount = 0;
            for (JapanesePlayer player : updatedPlayers) {
                playerService.saveOrUpdatePlayer(player);
                log.info("更新完了: {} - {} ({}) - ゴール: {}, アシスト: {}", 
                    player.getPlayerName(), 
                    player.getTeamName(), 
                    player.getLeague(),
                    player.getGoals(),
                    player.getAssists());
                updateCount++;
            }
            
            log.info("=== 日本人選手情報の自動更新が完了しました（{}件） ===", updateCount);
            
        } catch (Exception e) {
            log.error("日本人選手情報の更新中にエラーが発生しました", e);
        }
    }
    
    /**
     * 手動更新用メソッド
     */
    @Transactional
    public void updatePlayerStatsManually() {
        log.info("=== 日本人選手情報の手動更新を開始します ===");
        updatePlayerStats();
    }
    
    /**
     * Football-Data.org APIから最新の選手データを取得
     * 変更: チームスカッドAPIから日本人選手を抽出
     */
    private List<JapanesePlayer> fetchLatestPlayerDataFromApi() {
        List<JapanesePlayer> players = new ArrayList<>();
        
        try {
            log.info("Football-Data.org APIから日本人選手データを取得中（チームスカッド方式）...");
            
            // 得点データを取得（マージ用）
            Map<String, FootballDataApiResponse.Scorer> scorersMap = fetchScorersData();
            
            // 各チームごとに処理
            List<Integer> teamIds = new ArrayList<>(TARGET_TEAMS.keySet());
            int processedCount = 0;
            
            for (Integer teamId : teamIds) {
                try {
                    TeamInfo teamInfo = TARGET_TEAMS.get(teamId);
                    log.info("チーム {} ({}) のスカッドを取得中...", teamInfo.teamName, teamId);
                    
                    FootballDataApiResponse response = footballDataApiClient.getTeamSquad(teamId);
                    
                    if (response != null && response.getSquad() != null) {
                        // 日本人選手のみフィルタリング
                        List<FootballDataApiResponse.SquadMember> japaneseMembers = 
                                footballDataApiClient.filterJapaneseSquadMembers(response);
                        
                        log.info("チーム {} から {} 件の日本人選手を発見", teamInfo.teamName, japaneseMembers.size());
                        
                        // DTOをエンティティに変換
                        for (FootballDataApiResponse.SquadMember member : japaneseMembers) {
                            // 得点データとマージ
                            FootballDataApiResponse.Scorer scorerData = scorersMap.get(member.getName());
                            
                            JapanesePlayer player = convertSquadMemberToEntity(
                                    member, teamInfo, scorerData);
                            players.add(player);
                            
                            log.info("日本人選手発見: {} - {} ({}) - ポジション: {}, 背番号: {}", 
                                    member.getName(),
                                    teamInfo.teamName,
                                    teamInfo.leagueName,
                                    member.getPosition(),
                                    member.getShirtNumber());
                        }
                    }
                    
                    processedCount++;
                    
                    // レート制限対策: 次のリクエストまで待機（最後のチーム以外）
                    if (processedCount < teamIds.size()) {
                        log.info("レート制限対策のため6.5秒待機中... ({}/{})", processedCount, teamIds.size());
                        Thread.sleep(6500);
                    }
                    
                } catch (InterruptedException e) {
                    log.error("スリープ中に割り込みが発生しました", e);
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("チームID {} のデータ取得中にエラーが発生しました", teamId, e);
                }
            }
            
            log.info("APIから{}件の日本人選手データを取得しました", players.size());
            
        } catch (Exception e) {
            log.error("APIからの選手データ取得中にエラーが発生しました", e);
        }
        
        return players;
    }
    
    /**
     * 得点ランキングデータを取得してマップに格納
     * スカッドデータとマージするために使用
     */
    private Map<String, FootballDataApiResponse.Scorer> fetchScorersData() {
        Map<String, FootballDataApiResponse.Scorer> scorersMap = new HashMap<>();
        
        try {
            log.info("得点データを取得中（スカッドデータとのマージ用）...");
            
            // 対象リーグから得点データを取得
            List<String> leagueCodes = TARGET_TEAMS.values().stream()
                    .map(info -> info.leagueCode)
                    .distinct()
                    .toList();
            
            for (String leagueCode : leagueCodes) {
                try {
                    FootballDataApiResponse response = footballDataApiClient.getTopScorers(leagueCode);
                    if (response != null && response.getScorers() != null) {
                        List<FootballDataApiResponse.Scorer> japaneseScorers = 
                                footballDataApiClient.filterJapanesePlayers(response);
                        
                        for (FootballDataApiResponse.Scorer scorer : japaneseScorers) {
                            scorersMap.put(scorer.getPlayer().getName(), scorer);
                        }
                        
                        log.info("リーグ {} から {} 件の日本人得点者データを取得", 
                                leagueCode, japaneseScorers.size());
                    }
                    
                    // レート制限対策
                    if (!leagueCode.equals(leagueCodes.get(leagueCodes.size() - 1))) {
                        Thread.sleep(6500);
                    }
                    
                } catch (InterruptedException e) {
                    log.error("スリープ中に割り込みが発生しました", e);
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("リーグ {} の得点データ取得中にエラー", leagueCode, e);
                }
            }
            
            log.info("合計 {} 件の日本人得点者データを取得しました", scorersMap.size());
            
        } catch (Exception e) {
            log.error("得点データの取得中にエラーが発生しました", e);
        }
        
        return scorersMap;
    }
    
    /**
     * SquadMemberをJapanesePlayerエンティティに変換
     * 得点データがあればマージ
     */
    private JapanesePlayer convertSquadMemberToEntity(
            FootballDataApiResponse.SquadMember member,
            TeamInfo teamInfo,
            FootballDataApiResponse.Scorer scorerData) {
        
        JapanesePlayer.JapanesePlayerBuilder builder = JapanesePlayer.builder()
                .playerName(member.getName())
                .teamName(teamInfo.teamName)
                .league(teamInfo.leagueName)
                .position(member.getPosition())
                .jerseyNumber(member.getShirtNumber())
                .apiPlayerId("FD-" + member.getId())
                .latestMatchDate(LocalDateTime.now());
        
        // 得点データがあればマージ
        if (scorerData != null) {
            builder.goals(scorerData.getGoals() != null ? scorerData.getGoals() : 0)
                   .assists(scorerData.getAssists() != null ? scorerData.getAssists() : 0)
                   .matchesPlayed(scorerData.getPlayedMatches() != null ? scorerData.getPlayedMatches() : 0);
        } else {
            // 得点データがない場合はデフォルト値
            builder.goals(0)
                   .assists(0)
                   .matchesPlayed(0);
        }
        
        return builder.build();
    }
    
    /**
     * APIレスポンスのScorerをJapanesePlayerエンティティに変換（リーグ名指定版）
     */
    private JapanesePlayer convertToEntity(FootballDataApiResponse.Scorer scorer, String leagueName) {
        FootballDataApiResponse.Player player = scorer.getPlayer();
        FootballDataApiResponse.Team team = scorer.getTeam();
        
        return JapanesePlayer.builder()
                .playerName(player.getName())
                .teamName(team.getName())
                .league(leagueName)
                .position(player.getPosition())
                .jerseyNumber(player.getShirtNumber())
                .goals(scorer.getGoals() != null ? scorer.getGoals() : 0)
                .assists(scorer.getAssists() != null ? scorer.getAssists() : 0)
                .matchesPlayed(scorer.getPlayedMatches() != null ? scorer.getPlayedMatches() : 0)
                .apiPlayerId("FD-" + player.getId())
                .latestMatchDate(LocalDateTime.now())
                .build();
    }
    
    /**
     * リーグコードから日本語リーグ名を取得
     */
    private String getLeagueNameFromCode(String leagueCode) {
        return switch (leagueCode) {
            case "PL" -> "プレミアリーグ";
            case "PD" -> "ラ・リーガ";
            case "DED" -> "エールディヴィジ";
            case "BL1" -> "ブンデスリーガ";
            case "SA" -> "セリエA";
            case "FL1" -> "リーグ・アン";
            default -> "欧州リーグ";
        };
    }
    
    /**
     * APIのリーグ名を日本語に変換
     */
    private String getLeagueNameInJapanese(String competitionName) {
        if (competitionName == null) {
            return "欧州リーグ";
        }
        
        if (competitionName.contains("Premier League")) {
            return "プレミアリーグ";
        } else if (competitionName.contains("La Liga") || competitionName.contains("Primera")) {
            return "ラ・リーガ";
        } else if (competitionName.contains("Eredivisie")) {
            return "エールディヴィジ";
        } else if (competitionName.contains("Bundesliga")) {
            return "ブンデスリーガ";
        } else if (competitionName.contains("Serie A")) {
            return "セリエA";
        } else if (competitionName.contains("Ligue 1")) {
            return "リーグ・アン";
        }
        
        return "欧州リーグ";
    }
    
    /**
     * 特定の選手の詳細情報を更新
     */
    @Transactional
    public void updateSpecificPlayer(String playerName) {
        log.info("選手 {} の情報を更新します", playerName);
        
        try {
            List<JapanesePlayer> allPlayers = fetchLatestPlayerDataFromApi();
            
            allPlayers.stream()
                    .filter(p -> p.getPlayerName().equals(playerName))
                    .findFirst()
                    .ifPresent(player -> {
                        playerService.saveOrUpdatePlayer(player);
                        log.info("選手 {} の情報を更新しました", playerName);
                    });
                    
        } catch (Exception e) {
            log.error("選手 {} の更新中にエラーが発生しました", playerName, e);
        }
    }
}
