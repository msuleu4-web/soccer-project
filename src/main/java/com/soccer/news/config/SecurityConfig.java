package com.soccer.news.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * セキュリティ設定
 * CSRF保護を有効化し、BCryptPasswordEncoderをBean登録
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    /**
     * BCryptPasswordEncoderをBeanとして登録
     * パスワードのハッシュ化に使用
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * セキュリティフィルタチェーン設定
     * - 全エンドポイントへのアクセスを許可（認証不要）
     * - CSRF保護を有効化（Thymeleafフォームで自動対応）
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // 全てのリクエストを許可（匿名掲示板のため）
            )
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/h2-console/**")  // H2コンソールはCSRF除外
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())  // H2コンソール用
            );
        
        return http.build();
    }
}
