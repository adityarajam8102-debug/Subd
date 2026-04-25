@echo off
echo 🚀 Installing SecureAxis...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Go is installed
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Go is not installed. Please install Go first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd ..\backend
npm install

REM Install reconnaissance tools
echo 🔧 Installing reconnaissance tools...
echo Installing Amass...
go install github.com/owasp-amass/amass/v4/...@latest

echo Installing Subfinder...
go install github.com/projectdiscovery/subfinder/v2/...@latest

REM Go back to root directory
cd ..

echo ✅ Installation completed!
echo.
echo Next steps:
echo 1. Configure your Supabase credentials in frontend\.env.local
echo 2. Run 'npm run dev' to start the application
echo 3. Open http://localhost:3000 in your browser
echo.
echo Make sure %%USERPROFILE%%\go\bin is in your PATH for the reconnaissance tools to work.
pause
