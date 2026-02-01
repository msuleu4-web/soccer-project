package com.soccer.news.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ユーザーエンティティ
 * 会員登録とログイン機能のためのユーザー情報を管理
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * ユーザー名（ログインID）
     * 一意である必要がある
     */
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    /**
     * パスワード（ハッシュ化されて保存）
     */
    @Column(nullable = false)
    private String password;
    
    /**
     * メールアドレス
     * 一意である必要がある
     */
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    /**
     * 表示名（ニックネーム）
     */
    @Column(length = 50)
    private String displayName;
    
    /**
     * アカウント有効フラグ
     */
    @Column(nullable = false)
    private boolean enabled = true;
    
    /**
     * ユーザーロール（USER, ADMIN等）
     */
    @Column(nullable = false, length = 20)
    private String role = "USER";
    
    /**
     * 登録日時
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 最終更新日時
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * エンティティ保存前の処理
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * エンティティ更新前の処理
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
