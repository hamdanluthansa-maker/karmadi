@echo off
title Si Caker - Smart Career & Job Portal
color 09
cd /d "%~dp0"

echo ======================================================================
echo          SI CAKER - SMART CAREER & RECRUITMENT PORTAL
echo       Platform Informasi & Ekstraksi AI Lowongan Kerja Pintar
echo ======================================================================
echo.

:: 1. Cek instalasi Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js tidak ditemukan di komputer ini!
    echo Silakan unduh dan pasang Node.js terlebih dahulu melalui:
    echo https://nodejs.org/
    echo.
    pause
    exit /b
)

:: 2. Cek dependensi node_modules
if not exist "node_modules\" (
    echo [INFO] Folder node_modules belum ditemukan.
    echo Sedang memasang dependensi aplikasi (npm install)...
    echo Mohon tunggu sebentar...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] Gagal memasang dependensi npm!
        pause
        exit /b
    )
    echo.
    echo [SUKSES] Dependensi berhasil dipasang!
    echo.
)

:: 3. Otomatis buka browser setelah server siap
echo [INFO] Menyiapkan server lokal Si Caker...
echo [INFO] Membuka browser otomatis dalam 3 detik...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173/"

echo.
echo ======================================================================
echo   Aplikasi Si Caker SEDANG BERJALAN:
echo   - Portal Publik : http://localhost:5173/
echo   - Admin AI      : http://localhost:5173/admin
echo.
echo   * Jangan tutup jendela ini selama menggunakan aplikasi.
echo   * Tekan CTRL + C di jendela ini untuk mematikan server.
echo ======================================================================
echo.

:: 4. Jalankan Vite dev server
call npm run dev -- --host

pause
