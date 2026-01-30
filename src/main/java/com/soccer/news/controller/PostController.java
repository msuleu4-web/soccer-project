package com.soccer.news.controller;

import com.soccer.news.model.*;
import com.soccer.news.service.JapanesePlayerService;
import com.soccer.news.service.PollService;
import com.soccer.news.service.PostService;
import com.soccer.news.service.ReactionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

/**
 * 掲示板コントローラー
 * スレッド一覧、詳細、作成、削除などのエンドポイント
 */
@Controller
@RequestMapping("/bbs")
@RequiredArgsConstructor
@Slf4j
public class PostController {
    
    private final PostService postService;
    private final ReactionService reactionService;
    private final PollService pollService;
    private final JapanesePlayerService japanesePlayerService;
    
    // カテゴリ一覧（定数）
    private static final String[] CATEGORIES = {
        "全般", "プレミアリーグ", "ラ・リーガ", "セリエA", 
        "ブンデスリーガ", "リーグ・アン", "代表戦", "その他"
    };
    
    /**
     * スレッド一覧画面
     */
    @GetMapping
    public String listPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            Model model) {
        
        Page<Post> posts;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            // キーワード検索
            posts = postService.searchPosts(keyword, page, size);
            model.addAttribute("keyword", keyword);
        } else if (category != null && !category.isEmpty() && !category.equals("全般")) {
            // カテゴリフィルタ
            posts = postService.getPostsByCategory(category, page, size);
            model.addAttribute("selectedCategory", category);
        } else {
            // 全件表示
            posts = postService.getAllPosts(page, size);
        }
        
        // 人気スレッド（サイドバー用）
        List<Post> topPosts = postService.getTopRecommendedPosts(5);
        
        // 日本人選手情報（サイドバー用）
        List<JapanesePlayer> topPlayers = japanesePlayerService.getTopPlayers(5);
        
        model.addAttribute("posts", posts);
        model.addAttribute("topPosts", topPosts);
        model.addAttribute("topPlayers", topPlayers);
        model.addAttribute("categories", CATEGORIES);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", posts.getTotalPages());
        
        return "bbs/list";
    }
    
    /**
     * スレッド詳細画面
     */
    @GetMapping("/{id}")
    public String viewPost(@PathVariable Long id, Model model, RedirectAttributes redirectAttributes) {
        Optional<Post> postOpt = postService.getPostById(id);
        
        if (postOpt.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "スレッドが見つかりません");
            return "redirect:/bbs";
        }
        
        Post post = postOpt.get();
        List<Comment> comments = postService.getCommentsByPostId(id);
        
        // アンケート情報を取得
        Optional<Poll> poll = pollService.getPollByPostId(id);
        
        // リアクションタイプ一覧
        Reaction.ReactionType[] reactionTypes = Reaction.ReactionType.values();
        
        model.addAttribute("post", post);
        model.addAttribute("comments", comments);
        model.addAttribute("poll", poll.orElse(null));
        model.addAttribute("reactionTypes", reactionTypes);
        model.addAttribute("categories", CATEGORIES);
        
        return "bbs/detail";
    }
    
    /**
     * 新規スレッド作成フォーム表示
     */
    @GetMapping("/new")
    public String newPostForm(Model model) {
        model.addAttribute("categories", CATEGORIES);
        return "bbs/new";
    }
    
    /**
     * 新規スレッド作成処理
     */
    @PostMapping("/create")
    public String createPost(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam String author,
            @RequestParam String password,
            @RequestParam String category,
            RedirectAttributes redirectAttributes) {
        
        try {
            // バリデーション
            if (title == null || title.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "タイトルを入力してください");
                return "redirect:/bbs/new";
            }
            if (content == null || content.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "本文を入力してください");
                return "redirect:/bbs/new";
            }
            if (author == null || author.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "名前を入力してください");
                return "redirect:/bbs/new";
            }
            if (password == null || password.length() < 4) {
                redirectAttributes.addFlashAttribute("error", "パスワードは4文字以上で入力してください");
                return "redirect:/bbs/new";
            }
            
            Post post = postService.createPost(title, content, author, password, category);
            redirectAttributes.addFlashAttribute("success", "スレッドを作成しました");
            return "redirect:/bbs/" + post.getId();
            
        } catch (Exception e) {
            log.error("スレッド作成エラー", e);
            redirectAttributes.addFlashAttribute("error", "スレッドの作成に失敗しました");
            return "redirect:/bbs/new";
        }
    }
    
    /**
     * スレッド削除処理
     */
    @PostMapping("/{id}/delete")
    public String deletePost(
            @PathVariable Long id,
            @RequestParam String password,
            RedirectAttributes redirectAttributes) {
        
        boolean deleted = postService.deletePost(id, password);
        
        if (deleted) {
            redirectAttributes.addFlashAttribute("success", "スレッドを削除しました");
        } else {
            redirectAttributes.addFlashAttribute("error", "削除に失敗しました（パスワードが間違っています）");
            return "redirect:/bbs/" + id;
        }
        
        return "redirect:/bbs";
    }
    
    /**
     * おすすめ（イイネ）追加
     */
    @PostMapping("/{id}/recommend")
    public String recommendPost(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            postService.recommendPost(id);
            redirectAttributes.addFlashAttribute("success", "おすすめしました");
        } catch (Exception e) {
            log.error("おすすめ追加エラー", e);
            redirectAttributes.addFlashAttribute("error", "おすすめに失敗しました");
        }
        return "redirect:/bbs/" + id;
    }
    
    /**
     * コメント追加処理
     */
    @PostMapping("/{id}/comment")
    public String addComment(
            @PathVariable Long id,
            @RequestParam String content,
            @RequestParam String author,
            @RequestParam String password,
            RedirectAttributes redirectAttributes) {
        
        try {
            // バリデーション
            if (content == null || content.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "コメント内容を入力してください");
                return "redirect:/bbs/" + id;
            }
            if (author == null || author.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "名前を入力してください");
                return "redirect:/bbs/" + id;
            }
            if (password == null || password.length() < 4) {
                redirectAttributes.addFlashAttribute("error", "パスワードは4文字以上で入力してください");
                return "redirect:/bbs/" + id;
            }
            
            postService.addComment(id, content, author, password);
            redirectAttributes.addFlashAttribute("success", "コメントを投稿しました");
            
        } catch (Exception e) {
            log.error("コメント追加エラー", e);
            redirectAttributes.addFlashAttribute("error", "コメントの投稿に失敗しました");
        }
        
        return "redirect:/bbs/" + id;
    }
    
    /**
     * コメント削除処理
     */
    @PostMapping("/comment/{commentId}/delete")
    public String deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long postId,
            @RequestParam String password,
            RedirectAttributes redirectAttributes) {
        
        boolean deleted = postService.deleteComment(commentId, password);
        
        if (deleted) {
            redirectAttributes.addFlashAttribute("success", "コメントを削除しました");
        } else {
            redirectAttributes.addFlashAttribute("error", "削除に失敗しました（パスワードが間違っています）");
        }
        
        return "redirect:/bbs/" + postId;
    }
    
    /**
     * リアクション追加処理
     */
    @PostMapping("/comment/{commentId}/reaction")
    public String addReaction(
            @PathVariable Long commentId,
            @RequestParam String reactionType,
            @RequestParam Long postId,
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {
        
        try {
            String userIp = getClientIp(request);
            Reaction.ReactionType type = Reaction.ReactionType.valueOf(reactionType);
            
            boolean success = reactionService.addReaction(commentId, type, userIp);
            
            if (success) {
                redirectAttributes.addFlashAttribute("success", "リアクションしました");
            } else {
                redirectAttributes.addFlashAttribute("error", "リアクションに失敗しました");
            }
            
        } catch (Exception e) {
            log.error("リアクション追加エラー", e);
            redirectAttributes.addFlashAttribute("error", "リアクションに失敗しました");
        }
        
        return "redirect:/bbs/" + postId;
    }
    
    /**
     * アンケート投票処理
     */
    @PostMapping("/poll/{optionId}/vote")
    public String votePoll(
            @PathVariable Long optionId,
            @RequestParam Long postId,
            RedirectAttributes redirectAttributes) {
        
        try {
            boolean success = pollService.vote(optionId);
            
            if (success) {
                redirectAttributes.addFlashAttribute("success", "投票しました");
            } else {
                redirectAttributes.addFlashAttribute("error", "投票に失敗しました");
            }
            
        } catch (Exception e) {
            log.error("投票エラー", e);
            redirectAttributes.addFlashAttribute("error", "投票に失敗しました");
        }
        
        return "redirect:/bbs/" + postId;
    }
    
    /**
     * クライアントIPアドレスを取得
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
