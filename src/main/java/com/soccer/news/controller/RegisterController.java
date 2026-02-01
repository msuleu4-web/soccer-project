package com.soccer.news.controller;

import com.soccer.news.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * 会員登録コントローラー
 * 新規ユーザー登録機能を提供
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class RegisterController {
    
    private final UserService userService;
    
    /**
     * 会員登録ページを表示
     * @return 会員登録ページのテンプレート名
     */
    @GetMapping("/register")
    public String showRegisterForm() {
        return "register";
    }
    
    /**
     * 会員登録処理
     * @param username ユーザー名
     * @param password パスワード
     * @param email メールアドレス
     * @param displayName 表示名
     * @param redirectAttributes リダイレクト時の属性
     * @return リダイレクト先
     */
    @PostMapping("/register")
    public String registerUser(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String email,
            @RequestParam(required = false) String displayName,
            RedirectAttributes redirectAttributes) {
        
        try {
            // 入力値の検証
            if (username == null || username.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "ユーザー名を入力してください");
                return "redirect:/register";
            }
            
            if (password == null || password.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "パスワードを入力してください");
                return "redirect:/register";
            }
            
            if (email == null || email.trim().isEmpty()) {
                redirectAttributes.addFlashAttribute("error", "メールアドレスを入力してください");
                return "redirect:/register";
            }
            
            // パスワードの長さチェック
            if (password.length() < 6) {
                redirectAttributes.addFlashAttribute("error", "パスワードは6文字以上で入力してください");
                return "redirect:/register";
            }
            
            // ユーザー登録
            userService.registerUser(username.trim(), password, email.trim(), displayName);
            
            log.info("新規ユーザー登録成功: {}", username);
            redirectAttributes.addFlashAttribute("success", "会員登録が完了しました。ログインしてください。");
            return "redirect:/login";
            
        } catch (IllegalArgumentException e) {
            log.warn("会員登録失敗: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/register";
        } catch (Exception e) {
            log.error("会員登録エラー", e);
            redirectAttributes.addFlashAttribute("error", "会員登録中にエラーが発生しました");
            return "redirect:/register";
        }
    }
}
