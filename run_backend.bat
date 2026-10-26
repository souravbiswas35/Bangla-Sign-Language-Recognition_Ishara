@echo off
setlocal enabledelayedexpansion
title FYDP-3 Backend Server
echo ========================================================
echo Starting FYDP-3 Bangla Sign Language Backend (FastAPI)
echo ========================================================
cd /d "%~dp0backend"

:: Check if virtual environment exists and is functional
set "VENV_OK=0"
if exist venv\Scripts\python.exe (
    venv\Scripts\python.exe -c "import sys" 2>nul
    if !errorlevel! equ 0 set "VENV_OK=1"
)

if "!VENV_OK!"=="0" (
    echo.
    echo [Setup] Setting up a clean Python virtual environment...
    
    :: Attempt to locate Python (prefer 3.11 or 3.12 for TensorFlow compatibility)
    set "PY_CMD="
    py -3.11 -c "import sys" 2>nul && set "PY_CMD=py -3.11"
    if "!PY_CMD!"=="" py -3.12 -c "import sys" 2>nul && set "PY_CMD=py -3.12"
    if "!PY_CMD!"=="" python -c "import sys" 2>nul && set "PY_CMD=python"

    if "!PY_CMD!"=="" (
        echo ========================================================
        echo [ERROR] Python 3.11 or 3.12 is required but not found!
        echo (Note: Python 3.14 preview is NOT supported by TensorFlow)
        echo.
        echo Please install Python 3.11 (64-bit) from:
        echo https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
        echo.
        echo **IMPORTANT**: Make sure to tick the checkbox:
        echo   "[x] Add python.exe to PATH" during setup.
        echo ========================================================
        pause
        exit /b 1
    )

    if exist venv (
        echo [Setup] Removing old or invalid virtual environment...
        rd /s /q venv
    )

    echo [Setup] Creating venv using !PY_CMD!...
    !PY_CMD! -m venv venv
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create venv.
        pause
        exit /b 1
    )

    echo [Setup] Installing required packages from requirements.txt...
    call venv\Scripts\activate.bat
    python -m pip install --no-cache-dir --upgrade pip
    pip install --no-cache-dir -r requirements.txt
    if !errorlevel! neq 0 (
        echo [WARNING] Some packages failed to install. Continuing anyway...
    )
    echo [Setup] Setup complete!
    echo.
) else (
    call venv\Scripts\activate.bat
)

echo Starting FastAPI server at http://127.0.0.1:8000 ...
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
