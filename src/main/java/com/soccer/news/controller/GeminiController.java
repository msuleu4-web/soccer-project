package com.soccer.news.controller;

import com.soccer.news.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Gemini AIを活用したニュース要約APIを提供するコントローラークラス。
 * フロントエンドからのリクエストを受け付け、サービス層へ処理を委譲します。
 */
@Controller
public class GeminiController {

    // サービス層の依存性注入 (Dependency Injection)
    @Autowired
    private GeminiService geminiService;

    /**
     * Gemini AI要約ページを表示するエンドポイント
     * @return gemini.htmlテンプレート
     */
    @GetMapping("/gemini")
    public String geminiPage() {
        return "gemini";
    }

    /**
     * ニュース記事のテキストを受け取り、AIによる要約を返却するエンドポイント。
     * * @param newsText 要約対象のニュース記事本文 (Raw Text)
     * @return 「なんJ」風に変換された3行要約テキスト
     */
    @PostMapping("/api/gemini/summarize")
    @ResponseBody
    public String summarize(@RequestBody String newsText) {
        // サービス層のメソッドを呼び出し、結果をクライアントに返却
        return geminiService.getSoccerSummary(newsText);
    }
}
