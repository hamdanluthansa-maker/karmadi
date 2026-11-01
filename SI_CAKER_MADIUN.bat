@echo off
title Si Caker - Smart Career Portal
cd /d "c:\Users\USER\Downloads\SICAKER"

:: Cek jika server sudah aktif di background
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    start http://localhost:5173/
    exit /b 0
)

:: Jalankan di background secara tersembunyi lalu buka browser
wscript.exe "c:\Users\USER\Downloads\SICAKER\SiCaker_Hidden_Runner.vbs"
timeout /t 2 /nobreak >nul
start http://localhost:5173/
exit
