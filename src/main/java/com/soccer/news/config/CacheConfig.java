package com.soccer.news.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * キャッシュ設定
 * Football-Data.org APIのレート制限対策として、
 * 1時間のキャッシュを設定
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    /**
     * Caffeineキャッシュマネージャーの設定
     * - footballDataScorers: 得点ランキング用（1時間キャッシュ）
     * - footballDataSquad: チームスカッド用（24時間キャッシュ）
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                "footballDataScorers", 
                "footballDataSquad"
        );
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats());
        return cacheManager;
    }
    
    /**
     * チームスカッド専用のキャッシュマネージャー
     * 24時間キャッシュで、1日1回の更新に対応
     */
    @Bean
    public Caffeine<Object, Object> squadCaffeineConfig() {
        return Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(24, TimeUnit.HOURS)
                .recordStats();
    }
}
