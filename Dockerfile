# 1. JAVA21
FROM eclipse-temurin:21-jdk-alpine

# 2. フォルダー指定
WORKDIR /app

# 3. ビルドファイルコピー
COPY target/*.jar app.jar

# 4. 実行
ENTRYPOINT ["java", "-jar", "app.jar"]