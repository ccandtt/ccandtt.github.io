@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 18 or later is required. Alternatively, run: py -m http.server 4174
  pause
  exit /b 1
)
start "Xinchang Wang - Local Preview" cmd /k node scripts\serve.mjs
timeout /t 2 /nobreak >nul
start "" http://localhost:4174/
