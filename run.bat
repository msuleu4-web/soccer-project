@echo off
chcp 65001 >nul

REM ============================================================
REM [핵심] 실행 위치를 run.bat가 있는 폴더로 강제 이동
REM ============================================================
cd /d %~dp0

REM [설정] 자바 경로 지정 (jdk-21.0.10)
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.10
set PATH=%JAVA_HOME%\bin;%PATH%

echo ========================================
echo Soccer News Platform
echo ========================================
echo.
echo BBC Sport Football News Scraper
echo.

REM 자바 확인
java -version 2>&1 | findstr /C:"21" >nul
if errorlevel 1 (
    echo [Error] Java 21 not found.
    echo Path: %JAVA_HOME%
    pause
    exit /b 1
)

echo.
echo Starting Application...
echo.

REM 실행 (Maven Wrapper)
if exist mvnw.cmd (
    call mvnw.cmd spring-boot:run
) else (
    echo [Error] mvnw.cmd not found.
    echo Current Location: %cd%
    echo Please make sure run.bat is inside 'soccer_project' folder.
    pause
    exit /b 1
)

pause