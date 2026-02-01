package com.soccer.news.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * セキュリティ設定
 * ログイン・会員登録機能を提供
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
     * - ログイン・会員登録ページは認証不要
     * - その他のページは認証が必要
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/register", "/css/**", "/js/**", "/images/**").permitAll()  // ログイン・登録ページと静的リソースは許可
                .anyRequest().authenticated()  // その他は認証が必要
            )
            .formLogin(form -> form
                .loginPage("/login")  // カスタムログインページ
                .defaultSuccessUrl("/", true)  // ログイン成功後のリダイレクト先
                .permitAll()
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/login?logout")
                .permitAll()
            )
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/h2-console/**", "/api/players/update")  // H2コンソールと選手更新APIはCSRF除外
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())  // H2コンソール用
            );
        
        return http.build();
    }
}
