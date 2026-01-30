package com.soccer.news.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soccer.news.dto.FootballDataApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * Football-Data.org API クライアント
 * 無料プランの制限（1分間に10回）を考慮してキャッシュを実装
 */
@Service
@Slf4j
public class FootballDataApiClient {
    
    private static final String API_BASE_URL = "https://api.football-data.org/v4";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);
    
    @Value("${football-data.api-token}")
    private String apiToken;
    
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    public FootballDataApiClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(REQUEST_TIMEOUT)
                .build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * 指定されたリーグの得点ランキングを取得
     * キャッシュ有効期限: 1時間
     * 
     * @param leagueCode リーグコード (PL, PD, BL1, SA, FL1など)
     * @return APIレスポンス
     */
    @Cacheable(value = "footballDataScorers", key = "#leagueCode", unless = "#result == null")
    public FootballDataApiResponse getTopScorers(String leagueCode) {
        try {
            String url = String.format("%s/competitions/%s/scorers", API_BASE_URL, leagueCode);
            
            log.info("Football-Data.org APIにリクエスト: {}", url);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("X-Auth-Token", apiToken)
                    .header("Accept", "application/json")
                    .timeout(REQUEST_TIMEOUT)
                    .GET()
                    .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                FootballDataApiResponse apiResponse = objectMapper.readValue(
                        response.body(), 
                        FootballDataApiResponse.class
                );
                log.info("APIレスポンス取得成功: {} - {} 件の得点者データ", 
                        leagueCode, 
                        apiResponse.getScorers() != null ? apiResponse.getScorers().size() : 0);
                return apiResponse;
            } else if (response.statusCode() == 429) {
                log.error("APIレート制限に達しました（429 Too Many Requests）");
                return null;
            } else {
                log.error("APIリクエスト失敗: ステータスコード {}, レスポンス: {}", 
                        response.statusCode(), 
                        response.body());
                return null;
            }
            
        } catch (Exception e) {
            log.error("Football-Data.org APIの呼び出し中にエラーが発生しました: {}", leagueCode, e);
            return null;
        }
    }
    
    /**
     * 複数のリーグから得点ランキングを取得
     * 
     * @param leagueCodes リーグコードのリスト
     * @return 全リーグの得点者データ
     */
    public List<FootballDataApiResponse> getTopScorersFromMultipleLeagues(List<String> leagueCodes) {
        List<FootballDataApiResponse> responses = new ArrayList<>();
        
        for (String leagueCode : leagueCodes) {
            try {
                FootballDataApiResponse response = getTopScorers(leagueCode);
                if (response != null) {
                    responses.add(response);
                }
                
                // レート制限対策: リクエスト間に少し待機（無料プランは1分間に10回まで）
                Thread.sleep(6500); // 6.5秒待機 = 1分間に最大9回のリクエスト
                
            } catch (InterruptedException e) {
                log.error("スリープ中に割り込みが発生しました", e);
                Thread.currentThread().interrupt();
                break;
            }
        }
        
        return responses;
    }
    
    /**
     * 日本人選手のみをフィルタリング
     * 
     * @param response APIレスポンス
     * @return 日本人選手のリスト
     */
    public List<FootballDataApiResponse.Scorer> filterJapanesePlayers(FootballDataApiResponse response) {
        if (response == null || response.getScorers() == null) {
            return List.of();
        }
        
        return response.getScorers().stream()
                .filter(scorer -> scorer.getPlayer() != null)
                .filter(scorer -> "Japan".equalsIgnoreCase(scorer.getPlayer().getNationality()))
                .toList();
    }
    
    /**
     * 複数のリーグから日本人選手のみを抽出
     * 
     * @param leagueCodes リーグコードのリスト
     * @return 全リーグの日本人選手データ
     */
    public List<FootballDataApiResponse.Scorer> getJapanesePlayersFromMultipleLeagues(List<String> leagueCodes) {
        List<FootballDataApiResponse.Scorer> japanesePlayers = new ArrayList<>();
        
        List<FootballDataApiResponse> responses = getTopScorersFromMultipleLeagues(leagueCodes);
        
        for (FootballDataApiResponse response : responses) {
            japanesePlayers.addAll(filterJapanesePlayers(response));
        }
        
        log.info("全リーグから {} 件の日本人選手データを取得しました", japanesePlayers.size());
        
        return japanesePlayers;
    }
    
    /**
     * 指定されたチームのスカッド（選手名簿）を取得
     * キャッシュ有効期限: 24時間（1日1回の更新）
     * 
     * @param teamId チームID
     * @return APIレスポンス（squadフィールドに選手リスト）
     */
    @Cacheable(value = "footballDataSquad", key = "#teamId", unless = "#result == null")
    public FootballDataApiResponse getTeamSquad(Integer teamId) {
        try {
            String url = String.format("%s/teams/%d", API_BASE_URL, teamId);
            
            log.info("Football-Data.org APIにリクエスト（チームスカッド）: {}", url);
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("X-Auth-Token", apiToken)
                    .header("Accept", "application/json")
                    .timeout(REQUEST_TIMEOUT)
                    .GET()
                    .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                FootballDataApiResponse apiResponse = objectMapper.readValue(
                        response.body(), 
                        FootballDataApiResponse.class
                );
                log.info("APIレスポンス取得成功: チームID {} - {} 件の選手データ", 
                        teamId, 
                        apiResponse.getSquad() != null ? apiResponse.getSquad().size() : 0);
                return apiResponse;
            } else if (response.statusCode() == 429) {
                log.error("APIレート制限に達しました（429 Too Many Requests）");
                return null;
            } else {
                log.error("APIリクエスト失敗: ステータスコード {}, レスポンス: {}", 
                        response.statusCode(), 
                        response.body());
                return null;
            }
            
        } catch (Exception e) {
            log.error("Football-Data.org APIの呼び出し中にエラーが発生しました: チームID {}", teamId, e);
            return null;
        }
    }
    
    /**
     * チームスカッドから日本人選手のみをフィルタリング
     * 
     * @param response APIレスポンス
     * @return 日本人選手のリスト
     */
    public List<FootballDataApiResponse.SquadMember> filterJapaneseSquadMembers(FootballDataApiResponse response) {
        if (response == null || response.getSquad() == null) {
            return List.of();
        }
        
        return response.getSquad().stream()
                .filter(member -> "Japan".equalsIgnoreCase(member.getNationality()))
                .toList();
    }
    
    /**
     * 複数のチームから日本人選手のスカッドを取得
     * 
     * @param teamIds チームIDのリスト
     * @return 全チームの日本人選手データ
     */
    public List<FootballDataApiResponse.SquadMember> getJapanesePlayersFromTeams(List<Integer> teamIds) {
        List<FootballDataApiResponse.SquadMember> japanesePlayers = new ArrayList<>();
        
        for (Integer teamId : teamIds) {
            try {
                FootballDataApiResponse response = getTeamSquad(teamId);
                if (response != null) {
                    List<FootballDataApiResponse.SquadMember> teamJapanesePlayers = 
                            filterJapaneseSquadMembers(response);
                    japanesePlayers.addAll(teamJapanesePlayers);
                    
                    log.info("チームID {} から {} 件の日本人選手を発見", 
                            teamId, teamJapanesePlayers.size());
                }
                
                // レート制限対策: リクエスト間に少し待機（無料プランは1分間に10回まで）
                if (!teamId.equals(teamIds.get(teamIds.size() - 1))) {
                    Thread.sleep(6500); // 6.5秒待機
                }
                
            } catch (InterruptedException e) {
                log.error("スリープ中に割り込みが発生しました", e);
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("チームID {} のデータ取得中にエラーが発生しました", teamId, e);
            }
        }
        
        log.info("全チームから {} 件の日本人選手データを取得しました", japanesePlayers.size());
        
        return japanesePlayers;
    }
}
