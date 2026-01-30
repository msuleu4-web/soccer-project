package com.soccer.news;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 海外サッカーニュースアプリケーションのメインクラス
 * Spring AI と Virtual Threads を活用した次世代ニュース分析プラットフォーム
 * 
 * 主な機能:
 * - 海外サッカーメディアからのニュース自動収集 (Jsoup)
 * - LLMによる高度なニュース要約 (Spring AI)
 * - Virtual Threadsによる高速並行処理 (Java 21)
 */
@SpringBootApplication
public class SoccerNewsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SoccerNewsApplication.class, args);
    }
}
