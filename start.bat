@echo off
title MindHelix AI - Enterprise Suite
chcp 65001 >nul
cls

echo ======================================================================
echo    🧬  M I N D H E L I X   A I   —   1 - C L I C K   L A U N C H E R
echo ======================================================================
echo.

:: 1. Verify Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH!
    echo Please install Node.js from https://nodejs.org/ (v18 or higher)
    echo.
    pause
    exit /b 1
)

:: 2. Check dependencies
if not exist "node_modules" (
    echo [INFO] First-time setup detected. Installing dependencies...
    call npm install --omit=dev
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

:: 3. Launch Platform
echo [INFO] Starting MindHelix AI Platform...
echo.
node bin/mindhelix.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo [EXIT] Server stopped.
    pause
)
