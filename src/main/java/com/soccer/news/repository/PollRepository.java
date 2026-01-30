package com.soccer.news.repository;

import com.soccer.news.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * アンケートリポジトリ
 */
@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {
    
    /**
     * スレッドIDでアンケートを取得
     */
    List<Poll> findByPostId(Long postId);
    
    /**
     * スレッドIDでアンケートを1件取得（最初のもの）
     */
    Optional<Poll> findFirstByPostId(Long postId);
}
