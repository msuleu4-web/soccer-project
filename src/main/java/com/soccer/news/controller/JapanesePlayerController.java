package com.soccer.news.controller;

import com.soccer.news.model.JapanesePlayer;
import com.soccer.news.service.JapanesePlayerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

/**
 * 日本人選手情報表示コントローラー
 */
@Slf4j
@Controller
@RequestMapping("/players")
@RequiredArgsConstructor
public class JapanesePlayerController {
    
    private final JapanesePlayerService playerService;
    
    /**
     * 日本人選手一覧ページ
     */
    @GetMapping
    public String listPlayers(Model model) {
        log.info("日本人選手一覧ページアクセス");
        
        try {
            // 全選手を活躍度順に取得
            List<JapanesePlayer> players = playerService.getTopPlayers(50);
            
            model.addAttribute("タイトル", "欧州で活躍する日本人選手");
            model.addAttribute("選手リスト", players);
            model.addAttribute("選手数", players.size());
            
            log.info("日本人選手情報取得完了: {} 件", players.size());
            
        } catch (Exception e) {
            log.error("日本人選手情報取得エラー", e);
            model.addAttribute("タイトル", "欧州で活躍する日本人選手");
            model.addAttribute("エラーメッセージ", "選手情報の取得に失敗しました: " + e.getMessage());
        }
        
        return "players/list";
    }
    
    /**
     * 最新試合情報がある選手一覧
     */
    @GetMapping("/latest")
    public String latestMatches(Model model) {
        log.info("最新試合情報ページアクセス");
        
        try {
            List<JapanesePlayer> players = playerService.getPlayersWithLatestMatches();
            
            model.addAttribute("タイトル", "最新試合情報");
            model.addAttribute("選手リスト", players);
            model.addAttribute("選手数", players.size());
            
            log.info("最新試合情報取得完了: {} 件", players.size());
            
        } catch (Exception e) {
            log.error("最新試合情報取得エラー", e);
            model.addAttribute("タイトル", "最新試合情報");
            model.addAttribute("エラーメッセージ", "試合情報の取得に失敗しました: " + e.getMessage());
        }
        
        return "players/list";
    }
}
