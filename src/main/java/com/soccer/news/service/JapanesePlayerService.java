package com.soccer.news.service;

import com.soccer.news.model.JapanesePlayer;
import com.soccer.news.repository.JapanesePlayerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 日本人選手サービス
 * 欧州5大リーグで活躍する日本人選手のスタッツ管理
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JapanesePlayerService {
    
    private final JapanesePlayerRepository playerRepository;
    
    /**
     * 全選手を活躍度順に取得
     */
    public List<JapanesePlayer> getTopPlayers(int limit) {
        List<JapanesePlayer> players = playerRepository.findAllOrderByActivityScore();
        return players.stream().limit(limit).toList();
    }
    
    /**
     * 最新試合情報がある選手を取得
     */
    public List<JapanesePlayer> getPlayersWithLatestMatches() {
        return playerRepository.findTop10ByOrderByLatestMatchDateDesc();
    }
    
    /**
     * 選手名で検索
     */
    public Optional<JapanesePlayer> getPlayerByName(String playerName) {
        return playerRepository.findByPlayerName(playerName);
    }
    
    /**
     * リーグで検索
     */
    public List<JapanesePlayer> getPlayersByLeague(String league) {
        return playerRepository.findByLeague(league);
    }
    
    /**
     * 選手情報を更新または作成
     */
    @Transactional
    public JapanesePlayer saveOrUpdatePlayer(JapanesePlayer player) {
        Optional<JapanesePlayer> existing = playerRepository.findByPlayerName(player.getPlayerName());
        
        if (existing.isPresent()) {
            JapanesePlayer existingPlayer = existing.get();
            // 既存の選手情報を更新
            existingPlayer.setTeamName(player.getTeamName());
            existingPlayer.setLeague(player.getLeague());
            existingPlayer.setPosition(player.getPosition());
            existingPlayer.setJerseyNumber(player.getJerseyNumber());
            existingPlayer.setGoals(player.getGoals());
            existingPlayer.setAssists(player.getAssists());
            existingPlayer.setMatchesPlayed(player.getMatchesPlayed());
            existingPlayer.setLatestRating(player.getLatestRating());
            existingPlayer.setLatestDistance(player.getLatestDistance());
            existingPlayer.setLatestMatchDate(player.getLatestMatchDate());
            existingPlayer.setLatestOpponent(player.getLatestOpponent());
            existingPlayer.setLatestResult(player.getLatestResult());
            existingPlayer.setApiPlayerId(player.getApiPlayerId());
            
            return playerRepository.save(existingPlayer);
        } else {
            // 新規作成
            return playerRepository.save(player);
        }
    }
    
    /**
     * 初期データを投入（デモ用）
     */
    @Transactional
    public void initializeDemoData() {
        if (playerRepository.count() > 0) {
            log.info("日本人選手データは既に存在します");
            return;
        }
        
        log.info("日本人選手のデモデータを投入します");
        
        // 久保建英
        JapanesePlayer kubo = JapanesePlayer.builder()
                .playerName("久保建英")
                .teamName("レアル・ソシエダ")
                .league("ラ・リーガ")
                .position("MF")
                .jerseyNumber(14)
                .goals(8)
                .assists(5)
                .matchesPlayed(22)
                .latestRating(7.8)
                .latestDistance(11.2)
                .latestMatchDate(LocalDateTime.now().minusDays(2))
                .latestOpponent("バルセロナ")
                .latestResult("2-1勝利")
                .build();
        
        // 三笘薫
        JapanesePlayer mitoma = JapanesePlayer.builder()
                .playerName("三笘薫")
                .teamName("ブライトン")
                .league("プレミアリーグ")
                .position("FW")
                .jerseyNumber(22)
                .goals(6)
                .assists(4)
                .matchesPlayed(20)
                .latestRating(8.2)
                .latestDistance(10.8)
                .latestMatchDate(LocalDateTime.now().minusDays(1))
                .latestOpponent("マンチェスター・シティ")
                .latestResult("1-1引分")
                .build();
        
        // 冨安健洋（アヤックスに移籍）
        JapanesePlayer tomiyasu = JapanesePlayer.builder()
                .playerName("冨安健洋")
                .teamName("アヤックス")
                .league("エールディヴィジ")
                .position("DF")
                .jerseyNumber(3)
                .goals(0)
                .assists(1)
                .matchesPlayed(15)
                .latestRating(7.4)
                .latestDistance(9.8)
                .latestMatchDate(LocalDateTime.now().minusDays(2))
                .latestOpponent("PSV")
                .latestResult("1-1引分")
                .build();
        
        // 遠藤航
        JapanesePlayer endo = JapanesePlayer.builder()
                .playerName("遠藤航")
                .teamName("リヴァプール")
                .league("プレミアリーグ")
                .position("MF")
                .jerseyNumber(3)
                .goals(2)
                .assists(3)
                .matchesPlayed(25)
                .latestRating(7.3)
                .latestDistance(11.5)
                .latestMatchDate(LocalDateTime.now().minusDays(3))
                .latestOpponent("アーセナル")
                .latestResult("0-2敗北")
                .build();
        
        // 鎌田大地
        JapanesePlayer kamada = JapanesePlayer.builder()
                .playerName("鎌田大地")
                .teamName("クリスタル・パレス")
                .league("プレミアリーグ")
                .position("MF")
                .jerseyNumber(18)
                .goals(4)
                .assists(6)
                .matchesPlayed(21)
                .latestRating(7.6)
                .latestDistance(10.3)
                .latestMatchDate(LocalDateTime.now().minusDays(4))
                .latestOpponent("チェルシー")
                .latestResult("1-1引分")
                .build();
        
        playerRepository.saveAll(List.of(kubo, mitoma, tomiyasu, endo, kamada));
        log.info("日本人選手のデモデータを5件投入しました");
    }
}
