package com.soccer.news.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 日本人選手エンティティ
 * 欧州5大リーグで活躍する日本人選手の情報を管理
 */
@Entity
@Table(name = "japanese_players", indexes = {
    @Index(name = "idx_player_name", columnList = "player_name"),
    @Index(name = "idx_league", columnList = "league")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JapanesePlayer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /** 選手名 */
    @Column(name = "player_name", nullable = false, length = 100)
    private String playerName;
    
    /** 所属チーム */
    @Column(name = "team_name", nullable = false, length = 100)
    private String teamName;
    
    /** リーグ名 */
    @Column(nullable = false, length = 50)
    private String league;
    
    /** ポジション */
    @Column(length = 20)
    private String position;
    
    /** 背番号 */
    @Column(name = "jersey_number")
    private Integer jerseyNumber;
    
    /** 今シーズンのゴール数 */
    @Builder.Default
    @Column(nullable = false)
    private Integer goals = 0;
    
    /** 今シーズンのアシスト数 */
    @Builder.Default
    @Column(nullable = false)
    private Integer assists = 0;
    
    /** 今シーズンの出場試合数 */
    @Builder.Default
    @Column(name = "matches_played", nullable = false)
    private Integer matchesPlayed = 0;
    
    /** 最新試合の評価点（0.0〜10.0） */
    @Column(name = "latest_rating")
    private Double latestRating;
    
    /** 最新試合の走行距離（km） */
    @Column(name = "latest_distance")
    private Double latestDistance;
    
    /** 最新試合の日時 */
    @Column(name = "latest_match_date")
    private LocalDateTime latestMatchDate;
    
    /** 最新試合の対戦相手 */
    @Column(name = "latest_opponent", length = 100)
    private String latestOpponent;
    
    /** 最新試合の結果（例：2-1勝利） */
    @Column(name = "latest_result", length = 50)
    private String latestResult;
    
    /** 外部API ID（API-Football等） */
    @Column(name = "api_player_id")
    private String apiPlayerId;
    
    /** 更新日時 */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * 選手の活躍度を計算（ゴール×3 + アシスト×2 + 試合数）
     */
    public int getActivityScore() {
        return (goals * 3) + (assists * 2) + matchesPlayed;
    }
    
    /**
     * 最新試合があるかチェック
     */
    public boolean hasLatestMatch() {
        return latestMatchDate != null;
    }
}
