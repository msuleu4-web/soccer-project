package com.soccer.news.repository;

import com.soccer.news.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * コメント（レス）リポジトリ
 * スレッドに対するコメントのデータアクセス
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    /**
     * 特定のスレッドに対するコメント一覧を取得（作成日時順）
     */
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
    
    /**
     * 特定のスレッドのコメント数を取得
     */
    long countByPostId(Long postId);
    
    /**
     * 特定のスレッドの最新コメント番号を取得
     */
    @Query("SELECT MAX(c.commentNumber) FROM Comment c WHERE c.post.id = :postId")
    Integer findMaxCommentNumberByPostId(@Param("postId") Long postId);
}
