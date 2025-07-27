# 🐱 Cat & Birds - Modern Snake Game

A beautifully designed Snake game featuring cats chasing birds, optimized for mobile devices and following Apple's Human Interface Guidelines.

## 🎮 Features

- **🐱 Two Playable Cats**: Floopy (blue) and Mochi (orange)
- **🐦 Bird Food**: Collect birds to grow and score points
- **🐕 Dog Obstacles**: Avoid dogs that appear randomly
- **🐟 Tuna Bonus**: Collect tuna cans for extra points
- **⚡ Speed Control**: Choose from 3 speed levels with funny labels
- **📱 Mobile Optimized**: Touch controls and responsive design
- **🎨 Modern UI**: iOS-inspired design with glassmorphism effects
- **🏆 High Score Tracking**: Persistent high scores using localStorage
- **🎵 Haptic Feedback**: Vibration feedback on mobile devices

## 🚀 Live Demo

Play the game online: [Your Render URL will go here]

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Graphics**: HTML5 Canvas API
- **Mobile**: Progressive Web App (PWA) features
- **Hosting**: Render.com (Static Site)

## 📱 Mobile Features

- **Touch Controls**: Swipe to control the cat
- **PWA Support**: Add to home screen functionality
- **iOS Optimized**: Follows Apple's Human Interface Guidelines
- **Responsive Design**: Works on all screen sizes
- **Haptic Feedback**: Vibration on game events

## 🎯 Game Rules

1. **Control**: Use arrow keys (desktop) or swipe (mobile)
2. **Objective**: Eat birds to grow and score points
3. **Obstacles**: Avoid dogs that appear randomly
4. **Bonuses**: Collect tuna cans for +50 points
5. **Walls**: Wrap around screen edges
6. **Game Over**: Collide with dogs or your own tail

## 🚀 Deployment

### Deploy to Render.com

1. **Fork/Clone** this repository
2. **Connect** to Render.com
3. **Create** a new Static Site
4. **Deploy** automatically

### Manual Deployment

```bash
# Clone the repository
git clone [your-repo-url]
cd cat-birds-game

# Start local development server
python3 -m http.server 8000

# Open http://localhost:8000 in your browser
```

## 📁 Project Structure

```
cat-birds-game/
├── index.html          # Main HTML file
├── style.css           # All styling and animations
├── script.js           # Game logic and mechanics
├── manifest.json       # PWA manifest
├── package.json        # Project configuration
├── render.yaml         # Render deployment config
└── README.md           # This file
```

## 🎨 Design Philosophy

- **iOS-Inspired**: Clean, modern interface following Apple's guidelines
- **Accessibility**: High contrast, readable text, keyboard navigation
- **Performance**: Optimized for 60fps gameplay on mobile devices
- **User Experience**: Intuitive controls and clear visual feedback

## 🔧 Development

### Local Development

```bash
# Install dependencies (none required for static site)
# Start development server
python3 -m http.server 8000

# Open http://localhost:8000
```

### Building for Production

No build process required - this is a static site that can be served directly.

## 📱 PWA Features

- **Offline Support**: Game works without internet connection
- **Home Screen**: Add to home screen on mobile devices
- **App-like Experience**: Full-screen mode and native feel
- **Fast Loading**: Optimized assets and minimal dependencies

## 🎮 Game Mechanics

### Cat Characters
- **Floopy** (Blue): Playful and energetic
- **Mochi** (Orange): Clever and cunning

### Speed Levels
- **Best Sleepy Cats** (Slow): Take your time, enjoy the journey
- **Playful Cats** (Medium): Perfect balance of fun and challenge  
- **Hungry Cats** (Fast): For the speed demons!

### Scoring System
- **Bird**: +10 points
- **Tuna Can**: +50 points
- **High Score**: Persisted in browser

## 🌟 Future Enhancements

- [ ] Sound effects and background music
- [ ] More cat characters and customization
- [ ] Power-ups and special abilities
- [ ] Multiplayer mode
- [ ] Leaderboards
- [ ] Achievement system

## 📄 License

MIT License - feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Enjoy playing Cat & Birds!** 🐱🐦✨ 