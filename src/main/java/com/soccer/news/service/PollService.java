package com.soccer.news.service;

import com.soccer.news.model.Poll;
import com.soccer.news.model.PollOption;
import com.soccer.news.model.Post;
import com.soccer.news.repository.PollOptionRepository;
import com.soccer.news.repository.PollRepository;
import com.soccer.news.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * アンケート（投票）サービス
 * スレッド内での簡易投票機能を管理
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PollService {
    
    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PostRepository postRepository;
    
    /**
     * アンケートを作成
     */
    @Transactional
    public Poll createPoll(Long postId, String question, List<String> options) {
        try {
            // スレッドの存在確認
            Optional<Post> postOpt = postRepository.findById(postId);
            if (postOpt.isEmpty()) {
                throw new IllegalArgumentException("スレッドが見つかりません");
            }
            
            // アンケートを作成
            Poll poll = Poll.builder()
                    .question(question)
                    .post(postOpt.get())
                    .build();
            
            poll = pollRepository.save(poll);
            
            // 選択肢を作成
            for (String optionText : options) {
                PollOption option = PollOption.builder()
                        .optionText(optionText)
                        .poll(poll)
                        .build();
                pollOptionRepository.save(option);
            }
            
            log.info("アンケートを作成しました: postId={}, question={}", postId, question);
            return poll;
            
        } catch (Exception e) {
            log.error("アンケート作成エラー", e);
            throw e;
        }
    }
    
    /**
     * スレッドのアンケートを取得
     */
    public Optional<Poll> getPollByPostId(Long postId) {
        return pollRepository.findFirstByPostId(postId);
    }
    
    /**
     * 投票する
     */
    @Transactional
    public boolean vote(Long optionId) {
        try {
            Optional<PollOption> optionOpt = pollOptionRepository.findById(optionId);
            if (optionOpt.isEmpty()) {
                log.warn("選択肢が見つかりません: {}", optionId);
                return false;
            }
            
            PollOption option = optionOpt.get();
            option.incrementVoteCount();
            pollOptionRepository.save(option);
            
            log.info("投票しました: optionId={}, text={}", optionId, option.getOptionText());
            return true;
            
        } catch (Exception e) {
            log.error("投票エラー", e);
            return false;
        }
    }
    
    /**
     * アンケート結果を取得
     */
    public List<PollOption> getPollResults(Long pollId) {
        return pollOptionRepository.findByPollId(pollId);
    }
}
