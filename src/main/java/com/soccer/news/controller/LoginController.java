package com.soccer.news.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * ログインコントローラー
 * パイロットプロジェクト: 任意の認証情報でログイン可能
 */
@Controller
public class LoginController {
    
    /**
     * ログインページを表示
     * @return ログインページのテンプレート名
     */
    @GetMapping("/login")
    public String login() {
        return "login";
    }
}
