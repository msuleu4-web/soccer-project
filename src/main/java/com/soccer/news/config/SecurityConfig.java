package com.soccer.news.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * セキュリティ設定
 * パイロットプロジェクト: 任意の認証情報でログイン可能
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
     * パイロットプロジェクト用のカスタムUserDetailsService
     * 任意のユーザー名/パスワードでログインを許可
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            // パイロットプロジェクト: 任意のユーザー名を受け入れる
            // パスワードは空文字列でエンコード（実際のパスワードチェックは後で無効化）
            UserDetails user = User.builder()
                .username(username)
                .password(passwordEncoder().encode(""))  // ダミーパスワード
                .roles("USER")
                .build();
            return user;
        };
    }
    
    /**
     * セキュリティフィルタチェーン設定
     * - ログインページ以外は認証が必要
     * - パイロットプロジェクト: 任意の認証情報を受け入れる
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/css/**", "/js/**", "/images/**").permitAll()  // ログインページと静的リソースは許可
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
            )
            // パイロットプロジェクト: パスワード検証を無効化
            .authenticationProvider(new org.springframework.security.authentication.dao.DaoAuthenticationProvider() {
                {
                    setUserDetailsService(userDetailsService());
                    setPasswordEncoder(new org.springframework.security.crypto.password.PasswordEncoder() {
                        @Override
                        public String encode(CharSequence rawPassword) {
                            return "";
                        }
                        
                        @Override
                        public boolean matches(CharSequence rawPassword, String encodedPassword) {
                            // パイロットプロジェクト: 常にtrueを返す（任意のパスワードを受け入れる）
                            return true;
                        }
                    });
                }
            });
        
        return http.build();
    }
}
