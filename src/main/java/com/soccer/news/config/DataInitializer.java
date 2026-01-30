package com.soccer.news.config;

import com.soccer.news.service.JapanesePlayerUpdateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * アプリケーション起動時のデータ初期化
 * Football-Data.org APIから実データを取得
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final JapanesePlayerUpdateService japanesePlayerUpdateService;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("=== データ初期化を開始します（Football-Data.org APIから取得） ===");
        
        try {
            // Football-Data.org APIから日本人選手データを取得
            japanesePlayerUpdateService.updatePlayerStatsManually();
            
            log.info("=== データ初期化が完了しました ===");
        } catch (Exception e) {
            log.error("データ初期化中にエラーが発生しました", e);
        }
    }
}
