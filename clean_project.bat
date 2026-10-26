@echo off
title FYDP-3 Clean Temporary Files
echo ========================================================
echo FYDP-3: Cleaning Temporary Cache and Environment Files
echo ========================================================
echo.
echo Cleaning backend\venv ...
if exist "%~dp0backend\venv" rmdir /s /q "%~dp0backend\venv"

echo Cleaning frontend\node_modules ...
if exist "%~dp0frontend\node_modules" rmdir /s /q "%~dp0frontend\node_modules"

echo Cleaning frontend\dist ...
if exist "%~dp0frontend\dist" rmdir /s /q "%~dp0frontend\dist"

echo Cleaning Python __pycache__ folders ...
for /d /r "%~dp0" %%d in (__pycache__) do @if exist "%%d" rmdir /s /q "%%d"

echo Cleaning pip cache on C: drive (if any) ...
if exist "%LOCALAPPDATA%\pip\cache" rmdir /s /q "%LOCALAPPDATA%\pip\cache"

echo.
echo ========================================================
echo SUCCESS: All temporary files removed!
echo Folder size is now minimized.
echo ========================================================
echo.
pause
