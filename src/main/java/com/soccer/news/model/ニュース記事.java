package com.soccer.news.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ニュース記事のデータモデル
 * スクレイピングで取得した記事情報とAI要約を保持
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ニュース記事 {
    
    /** 記事タイトル */
    private String タイトル;
    
    /** 記事URL */
    private String URL;
    
    /** 元の記事本文 */
    private String 本文;
    
    /** AI生成の要約文 (日本語) */
    private String 要約;
    
    /** ニュースソース名 */
    private String ソース名;
    
    /** 取得日時 */
    private LocalDateTime 取得日時;
    
    /** サムネイル画像URL */
    private String 画像URL;
}
