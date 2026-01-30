package com.soccer.news.repository;

import com.soccer.news.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 掲示板投稿リポジトリ
 * スレッド一覧、検索、カテゴリフィルタリングなどのデータアクセス
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    /**
     * カテゴリ別にスレッド一覧を取得（ページング対応）
     */
    Page<Post> findByCategory(String category, Pageable pageable);
    
    /**
     * 全スレッド一覧を取得（ページング対応）
     */
    Page<Post> findAll(Pageable pageable);
    
    /**
     * タイトルまたは本文で検索
     */
    @Query("SELECT p FROM Post p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
    Page<Post> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * カテゴリ別のスレッド数を取得
     */
    long countByCategory(String category);
    
    /**
     * おすすめ数の多い人気スレッドを取得
     */
    @Query("SELECT p FROM Post p ORDER BY p.recommendCount DESC, p.createdAt DESC")
    List<Post> findTopRecommendedPosts(Pageable pageable);
    
    /**
     * 閲覧数を増加させる（楽観的ロック回避のため直接UPDATE）
     */
    @Modifying
    @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :postId")
    void incrementViewCount(@Param("postId") Long postId);
    
    /**
     * おすすめ数を増加させる
     */
    @Modifying
    @Query("UPDATE Post p SET p.recommendCount = p.recommendCount + 1 WHERE p.id = :postId")
    void incrementRecommendCount(@Param("postId") Long postId);
}
