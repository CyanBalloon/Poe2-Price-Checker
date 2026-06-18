@echo off
cd /d "%~dp0"
echo ===================================================
echo Starting Poe2 Price Checker (Dev Standalone Mode)
echo ===================================================
echo.

:: Check for node_modules to help avoid common startup errors
if not exist "renderer\node_modules\" (
    echo [WARNING] renderer\node_modules not found. Running installation...
    call npm run install:all
) else if not exist "main\node_modules\" (
    echo [WARNING] main\node_modules not found. Running installation...
    call npm run install:all
)

echo Starting Frontend (Renderer) in a new window...
start "Poe2 Renderer" cmd /c "npm run dev:renderer"

echo Starting Backend (Main Standalone) in a new window...
start "Poe2 Standalone" cmd /c "npm run dev:standalone"

echo.
echo Both processes started! Keep their respective windows open.
echo Exiting launcher in 3 seconds...
timeout /t 3 >nul
