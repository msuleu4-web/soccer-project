package com.soccer.news.repository;

import com.soccer.news.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ユーザーリポジトリ
 * ユーザー情報のデータベースアクセスを提供
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * ユーザー名でユーザーを検索
     * @param username ユーザー名
     * @return ユーザー情報（Optional）
     */
    Optional<User> findByUsername(String username);
    
    /**
     * メールアドレスでユーザーを検索
     * @param email メールアドレス
     * @return ユーザー情報（Optional）
     */
    Optional<User> findByEmail(String email);
    
    /**
     * ユーザー名の存在確認
     * @param username ユーザー名
     * @return 存在する場合true
     */
    boolean existsByUsername(String username);
    
    /**
     * メールアドレスの存在確認
     * @param email メールアドレス
     * @return 存在する場合true
     */
    boolean existsByEmail(String email);
}
