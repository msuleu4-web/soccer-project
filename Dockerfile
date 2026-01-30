# マルチステージビルド - 最適化されたDockerイメージ作成
# Stage 1: ビルドステージ
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Mavenラッパーとpom.xmlをコピー
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# 依存関係を事前ダウンロード (キャッシュ最適化)
RUN ./mvnw dependency:go-offline -B

# ソースコードをコピー
COPY src src

# アプリケーションをビルド (テストスキップ)
RUN ./mvnw clean package -DskipTests

# Stage 2: 実行ステージ
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# ビルド成果物をコピー
COPY --from=builder /app/target/*.jar app.jar

# Virtual Threads を最大限活用するためのJVMオプション
ENV JAVA_OPTS="-XX:+UseZGC -XX:+ZGenerational -Xms512m -Xmx1024m"

# ポート公開
EXPOSE 8080

# アプリケーション起動
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
