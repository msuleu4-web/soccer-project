package com.soccer.news.service;

import com.soccer.news.model.ニュース記事;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

/**
 * Webスクレイピングサービス
 * Java 21のVirtual Threadsを活用した高速並行スクレイピング
 * 
 * 【技術的アピールポイント】
 * - Virtual Threads (Project Loom) による軽量スレッド実装
 * - 従来のスレッドプールと比較して、数千のタスクを同時実行可能
 * - ブロッキングI/O処理でも高効率な並行処理を実現
 */
@Slf4j
@Service
public class スクレイピングサービス {

    // Virtual Threads専用のExecutorService
    // 従来のFixedThreadPoolと異なり、スレッド数の制限なく軽量に並行処理可能
    private final ExecutorService virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();
    
    private static final int 最大記事取得数 = 5;
    private static final int タイムアウト秒 = 10;
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    /**
     * BBC Sport Footballからニュース記事を取得
     * 
     * 処理フロー:
     * 1. トップページから最新記事のURLリストを取得
     * 2. Virtual Threadsで各記事詳細ページに並行アクセス
     * 3. タイトルと本文を抽出してニュース記事オブジェクトを生成
     * 
     * @return ニュース記事のリスト
     */
    public List<ニュース記事> BBCスポーツからニュース取得() {
        String bbcFootballUrl = "https://www.bbc.com/sport/football";
        log.info("【Virtual Threads並行処理開始】BBC Sport Footballからニュース取得: {}", bbcFootballUrl);
        
        long 開始時刻 = System.currentTimeMillis();
        
        try {
            // ステップ1: トップページから記事URLリストを取得
            List<String> 記事URLリスト = トップページから記事URL取得(bbcFootballUrl);
            log.info("記事URL取得完了: {} 件", 記事URLリスト.size());
            
            // ステップ2: Virtual Threadsで各記事を並行取得
            List<ニュース記事> 記事リスト = 記事URLリスト.stream()
                .limit(最大記事取得数)
                .map(url -> CompletableFuture.supplyAsync(
                    () -> 記事詳細取得(url), 
                    virtualThreadExecutor  // Virtual Threads使用
                ))
                .collect(Collectors.toList())
                .stream()
                .map(CompletableFuture::join)  // 全タスクの完了を待機
                .filter(記事 -> 記事 != null)  // nullを除外
                .collect(Collectors.toList());
            
            long 処理時間 = System.currentTimeMillis() - 開始時刻;
            log.info("【Virtual Threads並行処理完了】取得記事数: {} 件, 処理時間: {} ms", 記事リスト.size(), 処理時間);
            
            return 記事リスト;
            
        } catch (Exception e) {
            log.error("BBC Sportからのニュース取得エラー", e);
            return new ArrayList<>();
        }
    }

    /**
     * トップページから記事URLのリストを抽出
     * 
     * @param トップページURL BBC Sport Footballのトップページ
     * @return 記事URLのリスト
     */
    private List<String> トップページから記事URL取得(String トップページURL) {
        List<String> 記事URLリスト = new ArrayList<>();
        
        try {
            log.info("トップページ解析開始: {}", トップページURL);
            
            Document doc = Jsoup.connect(トップページURL)
                .userAgent(USER_AGENT)
                .timeout(タイムアウト秒 * 1000)
                .followRedirects(true)
                .get();
            
            log.info("ページ取得成功。タイトル: {}", doc.title());
            
            // すべてのリンクから記事URLをフィルタリング
            Elements すべてのリンク = doc.select("a[href]");
            log.info("全リンク数: {} 件", すべてのリンク.size());
            
            // すべてのリンクから記事URLを抽出
            for (Element link : すべてのリンク) {
                String href = link.attr("abs:href");
                
                // サッカー関連の記事のみフィルタリング
                // パターン1: /sport/football/articles/
                // パターン2: /sport/football/ で始まり、記事IDを含む
                if ((href.contains("/sport/football/articles/") || 
                     (href.contains("/sport/football/") && href.matches(".*[a-z0-9]{8,}.*"))) &&
                    !href.contains("/live/") && 
                    !href.contains("/scores-fixtures") &&
                    !href.contains("/tables") &&
                    !href.contains("/video") &&
                    !href.contains("/gossip") &&
                    !記事URLリスト.contains(href)) {  // 重複除外
                    
                    記事URLリスト.add(href);
                    log.info("記事URL発見 [{}]: {}", 記事URLリスト.size(), href);
                }
                
                // 最大取得数に達したら終了
                if (記事URLリスト.size() >= 最大記事取得数 * 2) {
                    break;
                }
            }
            
            log.info("トップページから {} 件の記事URLを抽出", 記事URLリスト.size());
            
            // 記事が見つからない場合、デバッグ用にいくつかのリンクを出力
            if (記事URLリスト.isEmpty()) {
                log.warn("記事URLが見つかりませんでした。サンプルリンクを出力:");
                すべてのリンク.stream()
                    .limit(10)
                    .forEach(link -> log.warn("  - {}", link.attr("abs:href")));
            }
            
        } catch (Exception e) {
            log.error("トップページ解析エラー: {}", トップページURL, e);
        }
        
        return 記事URLリスト;
    }

    /**
     * 個別記事ページから詳細情報を取得
     * Virtual Threadで並行実行される
     * 
     * @param 記事URL 記事詳細ページのURL
     * @return ニュース記事オブジェクト
     */
    private ニュース記事 記事詳細取得(String 記事URL) {
        // 現在のスレッド情報をログ出力（Virtual Threadであることを確認）
        Thread currentThread = Thread.currentThread();
        log.info("【Virtual Thread実行】記事取得開始: {} (Thread: {})", 
            記事URL, currentThread.isVirtual() ? "Virtual Thread" : "Platform Thread");
        
        try {
            Document doc = Jsoup.connect(記事URL)
                .userAgent(USER_AGENT)
                .timeout(タイムアウト秒 * 1000)
                .followRedirects(true)
                .get();
            
            // タイトル抽出
            String タイトル = doc.select("h1").first() != null 
                ? doc.select("h1").first().text() 
                : "タイトル不明";
            
            log.info("記事タイトル: {}", タイトル);
            
            // 本文抽出（複数のセレクタを試行）
            StringBuilder 本文 = new StringBuilder();
            
            // 方法1: article内のp要素
            Elements 本文要素1 = doc.select("article p");
            log.info("方法1 (article p): {} 個の段落", 本文要素1.size());
            
            // 方法2: data-component='text-block'内のp要素
            Elements 本文要素2 = doc.select("div[data-component='text-block'] p");
            log.info("方法2 (text-block p): {} 個の段落", 本文要素2.size());
            
            // 方法3: main内のp要素
            Elements 本文要素3 = doc.select("main p");
            log.info("方法3 (main p): {} 個の段落", 本文要素3.size());
            
            // 方法4: すべてのp要素（フィルタリング付き）
            Elements 本文要素4 = doc.select("p");
            log.info("方法4 (all p): {} 個の段落", 本文要素4.size());
            
            // 最も多くの段落を持つ方法を選択
            Elements 選択された本文要素 = 本文要素1;
            if (本文要素2.size() > 選択された本文要素.size()) 選択された本文要素 = 本文要素2;
            if (本文要素3.size() > 選択された本文要素.size()) 選択された本文要素 = 本文要素3;
            
            // 本文が見つからない場合は全てのp要素から抽出
            if (選択された本文要素.isEmpty()) {
                選択された本文要素 = 本文要素4;
            }
            
            log.info("選択されたセレクタ: {} 個の段落", 選択された本文要素.size());
            
            for (Element p : 選択された本文要素) {
                String text = p.text();
                
                // デバッグ: 最初の3つの段落を出力
                if (本文.length() < 100) {
                    log.info("段落テキスト (長さ: {}): {}", text.length(), 
                        text.length() > 100 ? text.substring(0, 100) + "..." : text);
                }
                
                if (!text.isEmpty() && text.length() > 20) {  // 短すぎるテキストは除外
                    本文.append(text).append(" ");
                }
                
                // 本文が十分な長さになったら終了
                if (本文.length() > 500) {
                    break;
                }
            }
            
            // 本文が取得できない場合、記事全体のテキストを取得
            if (本文.length() < 50) {
                log.warn("本文が短すぎます。記事全体から抽出を試みます。");
                String 全テキスト = doc.select("article, main").text();
                if (全テキスト.length() > 100) {
                    本文 = new StringBuilder(全テキスト.substring(0, Math.min(全テキスト.length(), 1000)));
                    log.info("記事全体から抽出: {} 文字", 本文.length());
                }
            }
            
            // 画像URL抽出（複数のセレクタを試行）
            String 画像URL = null;
            
            // 方法1: og:image メタタグから取得（最も信頼性が高い）
            Element ogImage = doc.select("meta[property=og:image]").first();
            if (ogImage != null) {
                画像URL = ogImage.attr("content");
                log.info("画像URL取得 (og:image): {}", 画像URL);
            }
            
            // 方法2: twitter:image メタタグから取得
            if (画像URL == null || 画像URL.isEmpty()) {
                Element twitterImage = doc.select("meta[name=twitter:image]").first();
                if (twitterImage != null) {
                    画像URL = twitterImage.attr("content");
                    log.info("画像URL取得 (twitter:image): {}", 画像URL);
                }
            }
            
            // 方法3: 記事内の最初の画像から取得
            if (画像URL == null || 画像URL.isEmpty()) {
                Element firstImage = doc.select("article img, figure img, main img, picture img").first();
                if (firstImage != null) {
                    画像URL = firstImage.attr("abs:src");
                    if (画像URL.isEmpty()) {
                        画像URL = firstImage.attr("src");
                    }
                    // data-src属性もチェック（遅延読み込み対応）
                    if (画像URL.isEmpty()) {
                        画像URL = firstImage.attr("data-src");
                    }
                    log.info("画像URL取得 (article img): {}", 画像URL);
                }
            }
            
            // 画像URLが相対パスの場合、絶対パスに変換
            if (画像URL != null && !画像URL.isEmpty() && !画像URL.startsWith("http")) {
                if (画像URL.startsWith("//")) {
                    画像URL = "https:" + 画像URL;
                } else if (画像URL.startsWith("/")) {
                    画像URL = "https://www.bbc.com" + 画像URL;
                }
                log.info("画像URL絶対パス変換: {}", 画像URL);
            }
            
            String 最終本文 = 本文.toString().trim();
            
            ニュース記事 記事 = ニュース記事.builder()
                .タイトル(タイトル)
                .URL(記事URL)
                .本文(最終本文)
                .ソース名("BBC Sport Football")
                .取得日時(LocalDateTime.now())
                .画像URL(画像URL)
                .build();
            
            log.info("記事取得成功: {} (本文長: {} 文字)", タイトル, 最終本文.length());
            
            return 記事;
            
        } catch (Exception e) {
            log.error("記事詳細取得エラー: {}", 記事URL, e);
            return null;
        }
    }

    /**
     * 複数のニュースソースから並行してニュースを取得
     * 汎用メソッド（将来的に複数ソース対応時に使用）
     * 
     * @param ソースURLリスト ニュースソースのURLリスト
     * @return 全ソースから取得したニュース記事のリスト
     */
    public List<ニュース記事> 複数ソースからニュース取得(List<String> ソースURLリスト) {
        log.info("【Virtual Threads並行処理】複数ソースからニュース取得開始: {} 件のソース", ソースURLリスト.size());
        
        // 各ソースに対してVirtual Threadで並行処理
        List<CompletableFuture<List<ニュース記事>>> 非同期タスク = ソースURLリスト.stream()
            .map(url -> CompletableFuture.supplyAsync(
                () -> {
                    if (url.contains("bbc.com")) {
                        return BBCスポーツからニュース取得();
                    } else {
                        // 他のソースは今後実装
                        log.warn("未対応のニュースソース: {}", url);
                        return new ArrayList<ニュース記事>();
                    }
                },
                virtualThreadExecutor
            ))
            .toList();
        
        // 全タスクの完了を待機して結果を統合
        return 非同期タスク.stream()
            .map(CompletableFuture::join)
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }
}
