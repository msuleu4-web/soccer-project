package com.soccer.news.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * アンケート選択肢エンティティ
 */
@Entity
@Table(name = "poll_options", indexes = {
    @Index(name = "idx_poll_id", columnList = "poll_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PollOption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /** 選択肢テキスト */
    @Column(nullable = false, length = 100)
    private String optionText;
    
    /** 投票数 */
    @Builder.Default
    @Column(name = "vote_count", nullable = false)
    private Integer voteCount = 0;
    
    /** 親アンケート */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;
    
    /**
     * 投票数を増加させる
     */
    public void incrementVoteCount() {
        this.voteCount++;
    }
    
    /**
     * 投票率を計算（パーセンテージ）
     */
    public double getVotePercentage() {
        int totalVotes = poll.getTotalVotes();
        if (totalVotes == 0) {
            return 0.0;
        }
        return (double) voteCount / totalVotes * 100.0;
    }
}
