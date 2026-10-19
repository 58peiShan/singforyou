@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 潮約之歌 - 建置劇本
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo 找不到 Node.js。請先到 https://nodejs.org 下載安裝 LTS 版本，再重新雙擊 build.bat。
  echo.
  pause
  exit /b 1
)
node tools\build.js %*
if errorlevel 1 (
  echo.
  echo ============================================================
  echo  建置失敗：請依照上面的【錯誤】訊息（檔名:行號）修正劇本。
  echo  遊戲仍會使用上一次成功建置的版本。
  echo ============================================================
) else (
  echo.
  echo ============================================================
  echo  建置完成！雙擊 game\index.html 即可遊玩（已開啟的話請重新整理）。
  echo ============================================================
)
echo.
pause
