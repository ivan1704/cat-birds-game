#!/bin/bash

# Cat & Birds Game Deployment Script
echo "🚀 Deploying Cat & Birds Game to Render.com"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Cat & Birds game"
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository as remote origin:"
    echo "   git remote add origin https://github.com/yourusername/cat-birds-game.git"
    echo "   git push -u origin main"
fi

echo "✅ Project ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Go to https://render.com"
echo "3. Create new Static Site"
echo "4. Connect your GitHub repository"
echo "5. Deploy automatically!"
echo ""
echo "🎮 Your game will be live at: https://your-app-name.onrender.com" 