package com.soccer.news.controller;

import com.soccer.news.model.ニュース記事;
import com.soccer.news.service.スクレイピングサービス;
import com.soccer.news.service.JapanesePlayerUpdateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

/**
 * ニュース表示用コントローラー
 * Thymeleafテンプレートを使用してニュース一覧を表示
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class ニュースコントローラー {

    private final スクレイピングサービス スクレイピングサービス;
    private final JapanesePlayerUpdateService playerUpdateService;

    /**
     * トップページ - ニュース一覧表示
     * Virtual Threadsでスクレイピングを実行
     */
    @GetMapping("/")
    public String ホーム画面(Model model) {
        log.info("トップページアクセス - ニュース取得開始");
        
        try {
            // BBC Sportからニュース取得（Virtual Threads並行処理）
            List<ニュース記事> 記事リスト = スクレイピングサービス.BBCスポーツからニュース取得();
            
            log.info("スクレイピング完了: {} 件の記事を取得", 記事リスト.size());
            
            // 記事が取得できなかった場合
            if (記事リスト.isEmpty()) {
                log.warn("記事が取得できませんでした");
                model.addAttribute("タイトル", "海外サッカーニュース");
                model.addAttribute("エラーメッセージ", "現在、ニュースを取得できません。しばらくしてから再度お試しください。");
                return "index";
            }
            
            model.addAttribute("タイトル", "海外サッカーニュース");
            model.addAttribute("記事リスト", 記事リスト);
            model.addAttribute("記事数", 記事リスト.size());
            
            log.info("ニュース取得完了: {} 件", 記事リスト.size());
            
        } catch (Exception e) {
            log.error("ニュース取得エラー", e);
            model.addAttribute("タイトル", "海外サッカーニュース");
            model.addAttribute("エラーメッセージ", "ニュースの取得に失敗しました: " + e.getMessage());
        }
        
        return "index";
    }

    /**
     * ニュース再取得API
     * 手動でニュースを更新する場合に使用
     */
    @GetMapping("/refresh")
    public String ニュース再取得(Model model) {
        log.info("ニュース再取得リクエスト");
        return "redirect:/";
    }
    
    /**
     * 日本人選手情報を手動更新
     * 管理者が最新情報を即座に反映したい場合に使用
     */
    @PostMapping("/api/players/update")
    public String 選手情報更新(RedirectAttributes redirectAttributes) {
        log.info("日本人選手情報の手動更新リクエスト");
        
        try {
            playerUpdateService.updatePlayerStatsManually();
            redirectAttributes.addFlashAttribute("successMessage", "日本人選手情報を最新に更新しました！");
            log.info("日本人選手情報の手動更新が完了しました");
        } catch (Exception e) {
            log.error("日本人選手情報の更新中にエラーが発生しました", e);
            redirectAttributes.addFlashAttribute("errorMessage", "選手情報の更新に失敗しました: " + e.getMessage());
        }
        
        return "redirect:/players";
    }
}
