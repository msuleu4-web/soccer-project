package com.soccer.news.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * アンケート（投票）エンティティ
 * 「今日のMVPは誰？」などの簡易投票機能
 */
@Entity
@Table(name = "polls", indexes = {
    @Index(name = "idx_post_id", columnList = "post_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Poll {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /** アンケートタイトル */
    @Column(nullable = false, length = 200)
    private String question;
    
    /** 作成日時 */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /** 親スレッド */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    /** 投票選択肢 */
    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @Builder.Default
    private List<PollOption> options = new ArrayList<>();
    
    /**
     * 総投票数を取得
     */
    public int getTotalVotes() {
        return options.stream()
                .mapToInt(PollOption::getVoteCount)
                .sum();
    }
}
