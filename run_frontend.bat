@echo off
title FYDP-3 Frontend (Vite + React)
echo ========================================================
echo Starting FYDP-3 Bangla Sign Language Frontend (Vite+React)
echo ========================================================
cd /d "%~dp0frontend"

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ========================================================
    echo [ERROR] Node.js and npm are not installed or not in PATH!
    echo.
    echo Please download and install Node.js (LTS recommended) from:
    echo https://nodejs.org/
    echo.
    echo During installation, keep default settings with "Add to PATH" checked.
    echo After installing, restart this batch file.
    echo ========================================================
    pause
    exit /b 1
)

if not exist "node_modules\vite" (
    echo.
    echo [Setup] Packages or Vite not installed yet. Running npm install...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install encountered an issue. Please check your internet connection.
        pause
        exit /b 1
    )
    echo [Setup] Packages installed successfully!
    echo.
)

echo Starting Vite development server...
call npm run dev
pause
