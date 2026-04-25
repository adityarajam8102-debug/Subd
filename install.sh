#!/bin/bash

# SecureAxis Installation Script
echo "🚀 Installing SecureAxis..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd ../backend
npm install

# Install reconnaissance tools
echo "🔧 Installing reconnaissance tools..."
echo "Installing Amass..."
go install github.com/owasp-amass/amass/v4/...@latest

echo "Installing Subfinder..."
go install github.com/projectdiscovery/subfinder/v2/...@latest

# Check if tools are installed
echo "✅ Verifying installation..."
if command -v amass &> /dev/null; then
    echo "✅ Amass installed successfully"
else
    echo "❌ Amass installation failed. Please add \$HOME/go/bin to your PATH"
fi

if command -v subfinder &> /dev/null; then
    echo "✅ Subfinder installed successfully"
else
    echo "❌ Subfinder installation failed. Please add \$HOME/go/bin to your PATH"
fi

# Go back to root directory
cd ..

echo "🎉 Installation completed!"
echo ""
echo "Next steps:"
echo "1. Configure your Supabase credentials in frontend/.env.local"
echo "2. Run 'npm run dev' to start the application"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Make sure \$HOME/go/bin is in your PATH for the reconnaissance tools to work."
