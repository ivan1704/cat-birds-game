# Nokia 3310 "Cat & Birds" Game - Educational Project

A delightful variation of the classic Snake game from the Nokia 3310 phone, featuring an adorable pixel cat chasing birds! Built with vanilla HTML5, CSS3, and JavaScript. This project demonstrates fundamental game development concepts, DOM manipulation, canvas rendering, and whimsical pixel art design.

**🐱 Special Feature:** The traditional snake head has been replaced with a charming pixel art cat, and the food dots are now tiny birds that the cat chases and catches!

![Nokia 3310 Cat & Birds Game](./preview.png)

## 🎯 Learning Objectives

This project is designed to teach:
- **Game Development Fundamentals**: Game loops, state management, collision detection
- **HTML5 Canvas API**: 2D rendering, pixel manipulation, animation
- **JavaScript ES6+**: Modern syntax, modules, event handling
- **CSS3 Advanced**: Gradients, transforms, responsive design, pseudo-elements
- **Web Performance**: Efficient rendering, memory management
- **UI/UX Design**: Retro styling, authentic recreation techniques
- **Pixel Art**: Creating detailed sprites within grid constraints

## 🐾 Cat & Birds Features

### 🐱 Adorable Cat Sprite
- **12x12 pixel perfect cat head** with:
  - Pointed ears with inner ear details
  - Expressive eyes and nose
  - Cute little mouth
  - Authentic Nokia LCD green color scheme

### 🐦 Charming Bird Sprites  
- **Detailed tiny birds** featuring:
  - Round body and head
  - Pointed beak
  - Wing and tail feathers
  - Little feet
  - Single pixel eye

### 🎮 Enhanced Gameplay
- Cat chases and catches birds instead of eating dots
- Each bird caught makes the cat's "tail" longer
- Wall wrapping allows the cat to teleport through edges
- Variable speed control (1-10 scale)
- Authentic Nokia 3310 phone design

## �� Project Structure

```
game/
├── index.html          # Main HTML structure and layout
├── style.css           # Complete styling and Nokia 3310 design
├── script.js           # Game logic, rendering, and interactions
└── README.md           # This comprehensive guide
```

## 🛠 Technologies Used

- **HTML5**: Semantic structure, Canvas API
- **CSS3**: Advanced styling, flexbox, gradients, responsive design
- **JavaScript (ES6+)**: Game logic, DOM manipulation, localStorage
- **Google Fonts**: Orbitron font for authentic retro feel

## 🏗 Game Architecture

### Core Components

#### 1. Game State Management
```javascript
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
```
The game uses a finite state machine pattern to manage different screens and behaviors.

#### 2. Game Loop Pattern
```javascript
function update() {
    if (gameState !== 'playing') return;
    
    moveSnake();
    if (checkCollision()) gameOver();
    if (eatFood()) handleFoodConsumption();
    draw();
}
```
Classic game loop: Update → Check Collisions → Render

#### 3. Grid-Based Movement System
```javascript
const GRID_SIZE = 12;
const GRID_COUNT_X = CANVAS_WIDTH / GRID_SIZE;  // 20 columns
const GRID_COUNT_Y = CANVAS_HEIGHT / GRID_SIZE; // 15 rows
```
Movement is constrained to a grid system, typical for classic arcade games.

## 🎮 Development Process

### Phase 1: Basic Game Structure
1. **HTML Foundation**: Created semantic structure with canvas element
2. **CSS Base Styling**: Basic layout and modern design
3. **JavaScript Game Loop**: Implemented core update/render cycle
4. **Snake Movement**: Basic directional movement with arrow keys

### Phase 2: Game Mechanics
1. **Food Generation**: Random food placement with collision avoidance
2. **Growth System**: Snake grows when eating food
3. **Collision Detection**: Wall and self-collision detection
4. **Scoring System**: Points for food consumption

### Phase 3: Enhanced Features
1. **Wall Wrapping**: Snake teleports through walls (modern twist)
2. **Speed Control**: Dynamic speed slider (1-10 scale)
3. **State Management**: Menu, pause, game over screens
4. **Local Storage**: Persistent high score tracking

### Phase 4: Nokia 3310 Transformation
1. **Visual Redesign**: Authentic Nokia phone appearance
2. **LCD Simulation**: Green monochrome display
3. **Retro Typography**: Orbitron font for digital aesthetic
4. **Physical Button Styling**: 3D button effects

## 💻 Key Code Concepts

### 1. Canvas Rendering Optimization
```javascript
function draw() {
    // Clear entire canvas
    ctx.fillStyle = '#1a2f1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw all game objects
    drawSnake();
    drawFood();
}
```
**Learning Point**: Always clear the canvas before redrawing to prevent visual artifacts.

### 2. Collision Detection Algorithm
```javascript
function checkCollision() {
    const head = snake[0];
    
    // Self collision check
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}
```
**Learning Point**: Efficient collision detection using coordinate comparison in grid-based games.

### 3. Wall Wrapping Implementation
```javascript
if (head.x < 0) {
    head.x = GRID_COUNT_X - 1; // Teleport to right side
} else if (head.x >= GRID_COUNT_X) {
    head.x = 0; // Teleport to left side
}
```
**Learning Point**: Modular arithmetic for seamless world wrapping.

### 4. Event-Driven Input System
```javascript
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    if (gameState !== 'playing') return;
    
    switch (event.code) {
        case 'ArrowUp':
            if (direction.y !== 1) direction = {x: 0, y: -1};
            break;
        // ... other directions
    }
    event.preventDefault(); // Prevent page scrolling
}
```
**Learning Point**: Prevent opposite direction movement to avoid instant death.

### 5. Dynamic Speed Control
```javascript
function calculateDelay() {
    return Math.max(50, 350 - (currentSpeed * 30));
}

function updateSpeed() {
    currentSpeed = parseInt(speedSlider.value);
    if (gameState === 'playing') {
        clearInterval(gameLoop);
        gameLoop = setInterval(update, calculateDelay());
    }
}
```
**Learning Point**: Real-time game parameter adjustment without disrupting gameplay.

## 🎨 CSS Design Techniques

### 1. Nokia Phone Recreation
```css
.game-container {
    background: linear-gradient(145deg, #1e3a5f 0%, #2c5282 50%, #1e3a5f 100%);
    border: 3px solid #34495e;
    box-shadow: 
        inset 0 2px 10px rgba(255, 255, 255, 0.1),
        inset 0 -2px 10px rgba(0, 0, 0, 0.3),
        0 15px 35px rgba(0, 0, 0, 0.4);
}
```
**Learning Point**: Multiple inset shadows create realistic 3D depth effects.

### 2. LCD Screen Simulation
```css
#gameCanvas {
    background: #1a2f1a;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.9);
    border: 1px solid #0a0a0a;
}
```
**Learning Point**: Dark backgrounds with inset shadows simulate LCD depth.

### 3. Responsive Design
```css
@media (max-width: 480px) {
    .game-container {
        max-width: 260px;
        padding: 15px;
    }
    #gameCanvas {
        width: 180px;
        height: 135px;
    }
}
```
**Learning Point**: Mobile-first approach with proportional scaling.

## 🚀 Running the Game

### Local Development
1. **Clone/Download** the project files
2. **Start a local server**:
   ```bash
   python3 -m http.server 8000
   ```
3. **Open browser**: Navigate to `http://localhost:8000`

### Alternative Methods
- **File Protocol**: Open `index.html` directly (may have limitations)
- **Live Server**: Use VS Code Live Server extension
- **Static Hosting**: Deploy to GitHub Pages, Netlify, or Vercel

## 🎯 Game Features

### Core Gameplay
- ✅ **Classic Snake Movement**: Arrow key controls
- ✅ **Food Consumption**: Snake grows when eating
- ✅ **Collision Detection**: Self-collision ends game
- ✅ **Score System**: 10 points per food item

### Modern Enhancements
- ✅ **Wall Wrapping**: Snake teleports through boundaries
- ✅ **Variable Speed**: 1-10 speed control slider
- ✅ **Pause Function**: Spacebar to pause/resume
- ✅ **High Score**: Persistent browser storage

### Authentic Nokia Features
- ✅ **Monochrome Display**: Green pixels on dark background
- ✅ **Blocky Graphics**: Pixel-perfect square rendering
- ✅ **Phone Design**: Realistic Nokia 3310 appearance
- ✅ **Retro Typography**: Digital-style fonts

## 📚 Advanced Concepts Demonstrated

### 1. Game Programming Patterns
- **State Machine**: Clean state management
- **Component System**: Modular game objects
- **Observer Pattern**: Event-driven architecture

### 2. Performance Optimization
- **Efficient Rendering**: Only redraw when necessary
- **Memory Management**: Prevent memory leaks
- **Event Throttling**: Prevent excessive input processing

### 3. Code Organization
- **Separation of Concerns**: Logic, rendering, and styling separated
- **Modular Functions**: Single responsibility principle
- **Clean Code**: Readable, maintainable structure

## 🛠 Modification Guide

### Adding New Features

#### Custom Snake Colors
```javascript
// In draw() function, modify snake rendering:
ctx.fillStyle = '#FF0000'; // Red snake
ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
```

#### Power-ups System
```javascript
let powerUps = [];

function generatePowerUp() {
    powerUps.push({
        x: Math.floor(Math.random() * GRID_COUNT_X),
        y: Math.floor(Math.random() * GRID_COUNT_Y),
        type: 'speed_boost'
    });
}
```

#### Sound Effects
```javascript
const eatSound = new Audio('eat.wav');
const gameOverSound = new Audio('gameover.wav');

function eatFood() {
    eatSound.play();
    // ... existing food logic
}
```

### Performance Improvements

#### Canvas Optimization
```javascript
// Use requestAnimationFrame for smoother animation
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
```

#### Memory Management
```javascript
// Clear event listeners when game ends
function cleanup() {
    document.removeEventListener('keydown', handleKeyPress);
    clearInterval(gameLoop);
}
```

## 🎓 Educational Extensions

### Beginner Projects
1. **Color Customization**: Add theme selection
2. **Sound Integration**: Implement audio feedback
3. **Additional Game Modes**: Time trial, obstacles

### Intermediate Projects
1. **Multiplayer Support**: Local two-player mode
2. **AI Snake**: Computer-controlled opponents
3. **Level System**: Progressive difficulty

### Advanced Projects
1. **WebGL Rendering**: 3D graphics upgrade
2. **Network Multiplayer**: Real-time online play
3. **Mobile App**: Cordova/PhoneGap conversion

## 🔧 Troubleshooting

### Common Issues

#### Game Not Loading
- Check browser console for JavaScript errors
- Ensure local server is running
- Verify all files are in correct directory

#### Controls Not Working
- Click on game area to ensure focus
- Check if browser is blocking event listeners
- Verify arrow key event prevention is working

#### Performance Issues
- Reduce canvas size for slower devices
- Implement frame rate limiting
- Optimize draw calls

## 📖 Learning Resources

### Web Development
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [CSS Grid and Flexbox Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [JavaScript ES6 Features](https://es6-features.org/)

### Game Development
- [HTML5 Game Development](https://gamedev.stackexchange.com/)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Canvas Tutorials](https://www.html5canvastutorials.com/)

## 🤝 Contributing

This educational project welcomes contributions:
1. **Bug Fixes**: Improve code quality
2. **Documentation**: Enhance explanations
3. **Features**: Add educational value
4. **Examples**: Provide learning extensions

## 📄 License

This project is created for educational purposes. Feel free to use, modify, and distribute for learning and teaching.

---

**Happy Coding!** 🎮✨

*This project demonstrates that complex, engaging applications can be built with fundamental web technologies. The key is understanding core concepts and applying them creatively.* 