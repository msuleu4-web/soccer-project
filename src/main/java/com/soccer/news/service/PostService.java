package com.soccer.news.service;

import com.soccer.news.model.Comment;
import com.soccer.news.model.Post;
import com.soccer.news.repository.CommentRepository;
import com.soccer.news.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.util.List;
import java.util.Optional;

/**
 * 掲示板サービス
 * スレッドとコメントのビジネスロジック
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
    
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    /**
     * スレッド一覧を取得（ページング対応）
     */
    @Transactional(readOnly = true)
    public Page<Post> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.findAll(pageable);
    }
    
    /**
     * カテゴリ別スレッド一覧を取得
     */
    @Transactional(readOnly = true)
    public Page<Post> getPostsByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.findByCategory(category, pageable);
    }
    
    /**
     * キーワード検索
     */
    @Transactional(readOnly = true)
    public Page<Post> searchPosts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return postRepository.searchByKeyword(keyword, pageable);
    }
    
    /**
     * 人気スレッド一覧を取得
     */
    @Transactional(readOnly = true)
    public List<Post> getTopRecommendedPosts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return postRepository.findTopRecommendedPosts(pageable);
    }
    
    /**
     * スレッド詳細を取得（閲覧数を増加）
     */
    @Transactional
    public Optional<Post> getPostById(Long id) {
        Optional<Post> post = postRepository.findById(id);
        if (post.isPresent()) {
            // 閲覧数を増加
            postRepository.incrementViewCount(id);
        }
        return post;
    }
    
    /**
     * 新規スレッドを作成（XSS対策でHTMLエスケープ）
     */
    @Transactional
    public Post createPost(String title, String content, String author, String password, String category) {
        // XSS対策: HTMLエスケープ
        String escapedTitle = HtmlUtils.htmlEscape(title);
        String escapedContent = HtmlUtils.htmlEscape(content);
        String escapedAuthor = HtmlUtils.htmlEscape(author);
        
        // パスワードをハッシュ化
        String hashedPassword = passwordEncoder.encode(password);
        
        Post post = Post.builder()
                .title(escapedTitle)
                .content(escapedContent)
                .author(escapedAuthor)
                .password(hashedPassword)
                .category(category)
                .recommendCount(0)
                .viewCount(0)
                .build();
        
        Post savedPost = postRepository.save(post);
        log.info("新規スレッド作成: ID={}, タイトル={}", savedPost.getId(), savedPost.getTitle());
        return savedPost;
    }
    
    /**
     * スレッドを削除（パスワード認証）
     */
    @Transactional
    public boolean deletePost(Long id, String password) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isEmpty()) {
            return false;
        }
        
        Post post = postOpt.get();
        // パスワード検証
        if (!passwordEncoder.matches(password, post.getPassword())) {
            log.warn("スレッド削除失敗: パスワード不一致 ID={}", id);
            return false;
        }
        
        postRepository.delete(post);
        log.info("スレッド削除: ID={}", id);
        return true;
    }
    
    /**
     * おすすめ（イイネ）を追加
     */
    @Transactional
    public void recommendPost(Long id) {
        postRepository.incrementRecommendCount(id);
        log.info("おすすめ追加: スレッドID={}", id);
    }
    
    /**
     * コメントを追加（XSS対策でHTMLエスケープ）
     */
    @Transactional
    public Comment addComment(Long postId, String content, String author, String password) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            throw new IllegalArgumentException("スレッドが見つかりません: ID=" + postId);
        }
        
        Post post = postOpt.get();
        
        // XSS対策: HTMLエスケープ
        String escapedContent = HtmlUtils.htmlEscape(content);
        String escapedAuthor = HtmlUtils.htmlEscape(author);
        
        // パスワードをハッシュ化
        String hashedPassword = passwordEncoder.encode(password);
        
        // コメント番号を自動採番
        Integer maxCommentNumber = commentRepository.findMaxCommentNumberByPostId(postId);
        int nextCommentNumber = (maxCommentNumber == null) ? 1 : maxCommentNumber + 1;
        
        Comment comment = Comment.builder()
                .content(escapedContent)
                .author(escapedAuthor)
                .password(hashedPassword)
                .post(post)
                .commentNumber(nextCommentNumber)
                .build();
        
        Comment savedComment = commentRepository.save(comment);
        log.info("コメント追加: スレッドID={}, コメント番号={}", postId, nextCommentNumber);
        return savedComment;
    }
    
    /**
     * コメントを削除（パスワード認証）
     */
    @Transactional
    public boolean deleteComment(Long commentId, String password) {
        Optional<Comment> commentOpt = commentRepository.findById(commentId);
        if (commentOpt.isEmpty()) {
            return false;
        }
        
        Comment comment = commentOpt.get();
        // パスワード検証
        if (!passwordEncoder.matches(password, comment.getPassword())) {
            log.warn("コメント削除失敗: パスワード不一致 ID={}", commentId);
            return false;
        }
        
        commentRepository.delete(comment);
        log.info("コメント削除: ID={}", commentId);
        return true;
    }
    
    /**
     * スレッドのコメント一覧を取得
     */
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }
}
