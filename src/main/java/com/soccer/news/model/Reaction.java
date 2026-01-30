package com.soccer.news.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * コメントへのリアクション（スタンプ）エンティティ
 * ⚽️（ゴォォォール！）、👏（ナイス）などのスタンプ機能
 */
@Entity
@Table(name = "reactions", indexes = {
    @Index(name = "idx_comment_id", columnList = "comment_id"),
    @Index(name = "idx_reaction_type", columnList = "reaction_type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /** リアクションタイプ（GOAL, NICE, FIRE, LAUGH, SAD） */
    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 20)
    private ReactionType reactionType;
    
    /** リアクションした人のIP（重複防止用） */
    @Column(name = "user_ip", length = 50)
    private String userIp;
    
    /** 作成日時 */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /** 親コメント */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id", nullable = false)
    private Comment comment;
    
    /**
     * リアクションタイプ列挙型
     */
    public enum ReactionType {
        GOAL("⚽️", "ゴォォォール！"),
        NICE("👏", "ナイス"),
        FIRE("🔥", "アツい"),
        LAUGH("😂", "ワロタ"),
        SAD("😢", "悲しい"),
        THINKING("🤔", "う〜ん");
        
        private final String emoji;
        private final String label;
        
        ReactionType(String emoji, String label) {
            this.emoji = emoji;
            this.label = label;
        }
        
        public String getEmoji() {
            return emoji;
        }
        
        public String getLabel() {
            return label;
        }
    }
}
