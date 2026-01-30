package com.soccer.news.repository;

import com.soccer.news.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * リアクションリポジトリ
 */
@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    
    /**
     * コメントIDでリアクションを取得
     */
    List<Reaction> findByCommentId(Long commentId);
    
    /**
     * コメントIDとIPアドレスでリアクションを検索（重複防止用）
     */
    Optional<Reaction> findByCommentIdAndUserIp(Long commentId, String userIp);
    
    /**
     * コメントIDとリアクションタイプでカウント
     */
    long countByCommentIdAndReactionType(Long commentId, Reaction.ReactionType reactionType);
}
