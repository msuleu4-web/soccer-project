package com.soccer.news.service;

import com.soccer.news.model.Comment;
import com.soccer.news.model.Reaction;
import com.soccer.news.repository.CommentRepository;
import com.soccer.news.repository.ReactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

/**
 * リアクションサービス
 * コメントへのスタンプ機能を管理
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReactionService {
    
    private final ReactionRepository reactionRepository;
    private final CommentRepository commentRepository;
    
    /**
     * リアクションを追加
     * 同じIPからの重複リアクションは防止
     */
    @Transactional
    public boolean addReaction(Long commentId, Reaction.ReactionType reactionType, String userIp) {
        try {
            // コメントの存在確認
            Optional<Comment> commentOpt = commentRepository.findById(commentId);
            if (commentOpt.isEmpty()) {
                log.warn("コメントが見つかりません: {}", commentId);
                return false;
            }
            
            // 同じIPからの同じリアクションタイプの重複チェック
            Optional<Reaction> existing = reactionRepository.findByCommentIdAndUserIp(commentId, userIp);
            if (existing.isPresent()) {
                // 既にリアクション済みの場合は削除（トグル動作）
                reactionRepository.delete(existing.get());
                log.info("リアクションを削除しました: commentId={}, type={}, ip={}", commentId, reactionType, userIp);
                return true;
            }
            
            // 新規リアクションを作成
            Reaction reaction = Reaction.builder()
                    .reactionType(reactionType)
                    .userIp(userIp)
                    .comment(commentOpt.get())
                    .build();
            
            reactionRepository.save(reaction);
            log.info("リアクションを追加しました: commentId={}, type={}, ip={}", commentId, reactionType, userIp);
            return true;
            
        } catch (Exception e) {
            log.error("リアクション追加エラー", e);
            return false;
        }
    }
    
    /**
     * コメントのリアクション統計を取得
     */
    public Map<Reaction.ReactionType, Long> getReactionStats(Long commentId) {
        Optional<Comment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            return Map.of();
        }
        return commentOpt.get().getReactionCounts();
    }
    
    /**
     * ユーザーが既にリアクションしているかチェック
     */
    public boolean hasUserReacted(Long commentId, String userIp) {
        return reactionRepository.findByCommentIdAndUserIp(commentId, userIp).isPresent();
    }
}
