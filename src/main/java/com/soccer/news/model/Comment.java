package com.soccer.news.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * コメント（レス）エンティティ
 * スレッドに対する返信を表現
 */
@Entity
@Table(name = "comments", indexes = {
    @Index(name = "idx_post_id", columnList = "post_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /** コメント本文 */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    /** コメント投稿者名（匿名ニックネーム） */
    @Column(nullable = false, length = 50)
    private String author;
    
    /** 削除用パスワード（ハッシュ化して保存） */
    @Column(nullable = false, length = 255)
    private String password;
    
    /** 作成日時 */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /** 親スレッド */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    /** コメント番号（スレッド内での連番） */
    @Column(name = "comment_number")
    private Integer commentNumber;
}
