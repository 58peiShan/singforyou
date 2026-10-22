@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 潮約之歌 - 立繪去背
echo 把 img\立繪\ 裡的新立繪去背、放進遊戲，然後重新建置。
echo.
where python >nul 2>nul
if errorlevel 1 (
  echo 找不到 Python。請到 https://www.python.org 下載安裝（安裝時勾選 Add python.exe to PATH），再重新雙擊。
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo 找不到 Node.js。請先到 https://nodejs.org 下載安裝 LTS 版本，再重新雙擊。
  pause
  exit /b 1
)
python -c "import PIL, numpy, scipy" >nul 2>nul
if errorlevel 1 (
  echo 第一次執行：安裝影像處理套件，約 1～2 分鐘...
  python -m pip install --user --quiet pillow numpy scipy
)
python tools\cut_sprites.py %*
if errorlevel 1 (
  echo.
  echo ============================================================
  echo  去背失敗：請把上面的訊息貼給 Claude。
  echo ============================================================
  pause
  exit /b 1
)
echo.
node tools\build.js
if errorlevel 1 (
  echo.
  echo  建置失敗：請依照上面的【錯誤】訊息修正劇本後再試一次。
) else (
  echo.
  echo ============================================================
  echo  完成！雙擊 game\index.html 即可看到新立繪（已開啟的話請重新整理）。
  echo ============================================================
)
echo.
pause
