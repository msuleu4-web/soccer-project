package com.soccer.news.service;

import com.soccer.news.model.User;
import com.soccer.news.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ユーザーサービス
 * ユーザー登録、認証、管理機能を提供
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService implements UserDetailsService {
    
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    
    /**
     * Spring Securityの認証用メソッド
     * ユーザー名でユーザー情報を取得
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("ユーザー認証: {}", username);
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("ユーザーが見つかりません: " + username));
        
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .roles(user.getRole())
            .disabled(!user.isEnabled())
            .build();
    }
    
    /**
     * 新規ユーザー登録
     * @param username ユーザー名
     * @param password パスワード（平文）
     * @param email メールアドレス
     * @param displayName 表示名
     * @return 登録されたユーザー
     * @throws IllegalArgumentException ユーザー名またはメールアドレスが既に存在する場合
     */
    @Transactional
    public User registerUser(String username, String password, String email, String displayName) {
        log.info("新規ユーザー登録: {}", username);
        
        // ユーザー名の重複チェック
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("このユーザー名は既に使用されています: " + username);
        }
        
        // メールアドレスの重複チェック
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("このメールアドレスは既に使用されています: " + email);
        }
        
        // ユーザーエンティティの作成
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));  // パスワードをハッシュ化
        user.setEmail(email);
        user.setDisplayName(displayName != null && !displayName.isEmpty() ? displayName : username);
        user.setEnabled(true);
        user.setRole("USER");
        
        // データベースに保存
        User savedUser = userRepository.save(user);
        log.info("ユーザー登録完了: ID={}, ユーザー名={}", savedUser.getId(), savedUser.getUsername());
        
        return savedUser;
    }
    
    /**
     * ユーザー名でユーザーを検索
     * @param username ユーザー名
     * @return ユーザー情報（Optional）
     */
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
    
    /**
     * ユーザー名の存在確認
     * @param username ユーザー名
     * @return 存在する場合true
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    /**
     * メールアドレスの存在確認
     * @param email メールアドレス
     * @return 存在する場合true
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
