# エラー原因分析

## エラー内容
```
[ERROR] パッケージorg.springframework.security.config.annotation.web.buildersは存在しません
[ERROR] パッケージorg.springframework.security.config.annotation.web.configurationは存在しません
[ERROR] パッケージorg.springframework.security.webは存在しません
```

## 根本原因

**Spring Securityの依存関係が不足しています。**

### 現在の状況
`pom.xml`には以下の依存関係のみが含まれています：
```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>
```

これは**パスワードの暗号化機能のみ**を提供するライブラリです。

### 問題点
`SecurityConfig.java`では以下のクラスを使用していますが、これらは`spring-security-crypto`には含まれていません：
- `HttpSecurity` (spring-security-web)
- `EnableWebSecurity` (spring-security-config)
- `SecurityFilterChain` (spring-security-web)

## 解決方法

**`spring-boot-starter-security`を追加する必要があります。**

このスターターには以下が含まれます：
- spring-security-web
- spring-security-config
- spring-security-crypto
- その他必要なSpring Securityコンポーネント

### 修正内容
`pom.xml`の依存関係を以下のように変更：

**変更前：**
```xml
<!-- Spring Security Crypto (パスワードハッシュ化) -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>
```

**変更後：**
```xml
<!-- Spring Security (セキュリティ機能全般) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

## まとめ
- **原因**: Spring Securityの完全な依存関係が不足
- **解決**: `spring-boot-starter-security`を追加
- **効果**: SecurityConfig.javaで必要な全てのクラスが利用可能になる
