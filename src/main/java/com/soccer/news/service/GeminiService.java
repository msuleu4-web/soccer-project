package com.soccer.news.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    public String getSoccerSummary(String text) {
        try {
            // ★ 수정됨: 사용자 리스트에 있는 'gemini-2.0-flash' 모델 사용 (404 해결)
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
            
            // JSON 깨짐 방지
            String safeText = text.replace("\"", "\\\"").replace("\n", " ");
            
            // ★ 프롬프트: 2ch 난J 스타일 (일본어)
            String prompt = "以下のサッカーニュースを、2ちゃんねる（5ch）の「なんJ」民のような口調（例：「～ンゴ」「～なんだが」「草不可避」「ワイ」など）を使って、3行以内で要約してくれ。:\\n\\n" + safeText;
            
            String jsonBody = "{ \"contents\": [{ \"parts\": [{ \"text\": \"" + prompt + "\" }] }] }";

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body(); 

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Server Error: " + e.getMessage() + "\"}";
        }
    }
}
