package com.soccer.news.repository;

import com.soccer.news.model.PollOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * アンケート選択肢リポジトリ
 */
@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Long> {
    
    /**
     * アンケートIDで選択肢を取得
     */
    List<PollOption> findByPollId(Long pollId);
}
