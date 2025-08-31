#!/bin/bash

echo "🚀 DeepGuard Setup Script"
echo "=========================="

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    echo "   If you want to start fresh, delete .env and run this script again."
    echo "   Current .env file will be preserved."
    exit 0
fi

# Copy .env.example to .env
if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo ""
    echo "📝 Next steps:"
    echo "1. Edit .env file and add your API keys:"
    echo "   - SIGHTENGINE_USER and SIGHTENGINE_SECRET from https://sightengine.com/"
    echo "   - RESEMBLE_API_KEY from https://www.resemble.ai/detect/"
    echo ""
    echo "2. Start the development server:"
    echo "   pnpm dev"
    echo ""
    echo "3. Visit http://localhost:8080"
    echo ""
    echo "💡 Note: The app works in demo mode without API keys!"
else
    echo "❌ .env.example file not found!"
    echo "   Please make sure you're in the project root directory."
    exit 1
fi
