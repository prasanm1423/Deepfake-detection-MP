@echo off
echo 🚀 DeepGuard Setup Script
echo ==========================

REM Check if .env already exists
if exist ".env" (
    echo ⚠️  .env file already exists!
    echo    If you want to start fresh, delete .env and run this script again.
    echo    Current .env file will be preserved.
    pause
    exit /b 0
)

REM Copy .env.example to .env
if exist ".env.example" (
    copy ".env.example" ".env" >nul
    echo ✅ Created .env file from .env.example
    echo.
    echo 📝 Next steps:
    echo 1. Edit .env file and add your API keys:
    echo    - SIGHTENGINE_USER and SIGHTENGINE_SECRET from https://sightengine.com/
    echo    - RESEMBLE_API_KEY from https://www.resemble.ai/detect/
    echo.
    echo 2. Start the development server:
    echo    pnpm dev
    echo.
    echo 3. Visit http://localhost:8080
    echo.
    echo 💡 Note: The app works in demo mode without API keys!
) else (
    echo ❌ .env.example file not found!
    echo    Please make sure you're in the project root directory.
    pause
    exit /b 1
)

pause
