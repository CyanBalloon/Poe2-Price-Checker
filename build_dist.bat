@echo off
cd /d "%~dp0"
echo ===================================================
echo Building Poe2 Price Checker Executable...
echo Please ensure you ran this as Administrator!
echo ===================================================
echo.

echo [1/3] Compiling frontend (Renderer)...
call npm run build --prefix renderer
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Compiling backend (Main)...
call npm run build --prefix main
if %errorlevel% neq 0 (
    echo Backend build failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Packaging Executables (Electron Builder)...
echo (This may take a few minutes as it downloads dependencies)
call npm run package --prefix main
if %errorlevel% neq 0 (
    echo Packaging failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo SUCCESS! 
echo Your compiled executables are located in:
echo Modern-Exiled-Exchange-2\main\dist\
echo ===================================================
pause
