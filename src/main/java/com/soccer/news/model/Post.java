package com.soccer.news.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 掲示板スレッド（投稿）エンティティ
 * DCinside/2chスタイルの匿名掲示板システム
 */
@Entity
@Table(name = "posts", indexes = {
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_recommend_count", columnList = "recommend_count")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /** スレッドタイトル */
    @Column(nullable = false, length = 200)
    private String title;
    
    /** 投稿本文 */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    /** 投稿者名（匿名ニックネーム） */
    @Column(nullable = false, length = 50)
    private String author;
    
    /** 削除用パスワード（ハッシュ化して保存） */
    @Column(nullable = false, length = 255)
    private String password;
    
    /** カテゴリ（プレミアリーグ、ラ・リーガ、セリエA、代表戦など） */
    @Column(nullable = false, length = 50)
    private String category;
    
    /** おすすめ（イイネ）カウント */
    @Builder.Default
    @Column(name = "recommend_count", nullable = false)
    private Integer recommendCount = 0;
    
    /** 閲覧数 */
    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;
    
    /** 作成日時 */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /** 更新日時 */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    /** このスレッドに対するコメント（レス）一覧 */
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();
    
    /**
     * 閲覧数を増加させる
     */
    public void incrementViewCount() {
        this.viewCount++;
    }
    
    /**
     * おすすめ数を増加させる
     */
    public void incrementRecommendCount() {
        this.recommendCount++;
    }
    
    /**
     * コメント数を取得
     */
    public int getCommentCount() {
        return comments != null ? comments.size() : 0;
    }
}
