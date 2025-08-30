@echo off
REM MOZ SOLIDÁRIA - Windows Deployment Script

echo 🚀 Starting MOZ SOLIDÁRIA deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✓ Node.js version check passed: 
node --version

REM Install dependencies
echo ✓ Installing dependencies...
call npm ci --production=false
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Run linting
echo ✓ Running code quality checks...
call npm run lint
if %errorlevel% neq 0 (
    echo ⚠ Linting completed with warnings
)

REM Clean previous build
echo ✓ Cleaning previous build...
if exist dist rmdir /s /q dist

REM Build for production
echo ✓ Building for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

REM Check if build was successful
if not exist dist (
    echo ❌ Build failed - dist directory not found
    pause
    exit /b 1
)

echo ✓ Build completed successfully!

echo.
echo 📊 Build Information:
echo 📁 Output directory: dist/
echo 📄 Build completed with optimized assets

echo.
echo 🎉 Deployment preparation completed!
echo.
echo 📋 Next steps:
echo 1. Upload the 'dist/' folder to your web server
echo 2. Configure server for SPA routing (see DEPLOYMENT.md)
echo 3. Set up environment variables for production
echo 4. Configure SSL certificate
echo 5. Test the deployment

echo.
echo 📚 For detailed instructions, see DEPLOYMENT.md

pause
