@echo off
cd /d "c:\Users\USER\Downloads\SICAKER"
set "PATH=C:\Program Files\nodejs;%PATH%"

netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 0
)

call npx vite --host --port 5173
