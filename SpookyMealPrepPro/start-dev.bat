@echo off
setlocal
pushd "%~dp0"

REM --- Backend window ---
start "Spooky Backend" cmd /k ^
"cd backend && ^
 if not exist node_modules npm i && ^
 if not exist .env copy .env.example .env && ^
 echo. && echo 👉 Edit backend\.env and set OPENAI_API_KEY if you haven't yet. && ^
 npm run dev"

REM --- Frontend window ---
start "Spooky Frontend" cmd /k ^
"cd frontend && ^
 if not exist node_modules npm i && ^
 if not exist .env (echo VITE_API_BASE=http://localhost:8787> .env) && ^
 npm run dev"

popd
endlocal
