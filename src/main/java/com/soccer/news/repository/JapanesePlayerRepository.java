package com.soccer.news.repository;

import com.soccer.news.model.JapanesePlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 日本人選手リポジトリ
 */
@Repository
public interface JapanesePlayerRepository extends JpaRepository<JapanesePlayer, Long> {
    
    /**
     * 選手名で検索
     */
    Optional<JapanesePlayer> findByPlayerName(String playerName);
    
    /**
     * リーグで検索
     */
    List<JapanesePlayer> findByLeague(String league);
    
    /**
     * 活躍度順に取得（ゴール×3 + アシスト×2 + 試合数）
     */
    @Query("SELECT p FROM JapanesePlayer p ORDER BY (p.goals * 3 + p.assists * 2 + p.matchesPlayed) DESC")
    List<JapanesePlayer> findTopPlayersByActivity();
    
    /**
     * 最新試合日時順に取得
     */
    List<JapanesePlayer> findTop10ByOrderByLatestMatchDateDesc();
    
    /**
     * 全選手を活躍度順に取得
     */
    @Query("SELECT p FROM JapanesePlayer p ORDER BY (p.goals * 3 + p.assists * 2 + p.matchesPlayed) DESC")
    List<JapanesePlayer> findAllOrderByActivityScore();
}
