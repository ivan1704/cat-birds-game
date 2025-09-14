// Game variables - SCRIPT UPDATED AT 2024-07-27 10:30
console.log('Script loaded - version with override functions active');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameOverlay = document.getElementById('gameOverlay');
const gameMessage = document.getElementById('gameMessage');
const startBtn = document.getElementById('startBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValueElement = document.getElementById('speedValue');

// Game constants
const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 540;
const GRID_COUNT_X = CANVAS_WIDTH / GRID_SIZE;
const GRID_COUNT_Y = CANVAS_HEIGHT / GRID_SIZE;

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
// let welcomeStep = 1; // Welcome screen step: 1=character, 2=speed, 3=instructions (commented out - no longer needed)
let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let direction = {x: 0, y: 0};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let currentSpeed = 5;
let baseDelay = 150;
let isEating = false;
let eatingAnimation = 0;
let selectedCat = localStorage.getItem('selectedCat') || '';
let dogs = []; // Array to store active dogs
let birdsEaten = 0; // Count birds eaten
let nextDogSpawn = 2 + Math.floor(Math.random() * 2); // Next dog spawns after 2-3 birds
let tunaCans = []; // Array to store active tuna cans
let tunaSpawnTimer = 0;
let tunaSpawnInterval = 300; // Spawn tuna can every 5-10 seconds (varies)

// Cat character types
const catTypes = {
    blue: { name: 'Floopy', emoji: '💙' },
    orange: { name: 'Mochi', emoji: '🧡' }
};

// iOS-specific initialization
function init() {
    updateHighScore();
    generateFood();
    
    // iOS-specific setup
    setupIOSFeatures();
    
    // Event listeners
    document.addEventListener('keydown', handleKeyPress);
    if (speedSlider) {
        speedSlider.addEventListener('input', updateSpeed);
    }
    
    // Touch controls
    initTouchControls();
    
    // Swipe gesture controls
    initSwipeControls();
    
    // Make canvas focusable for better keyboard handling
    canvas.tabIndex = 1;
    canvas.focus();
    
    // Initialize speed display
    updateSpeedDisplay();
    
    // Always start with menu state
    gameState = 'menu';
    // welcomeStep = 1; // Commented out - no longer needed
}

// iOS-specific features setup
function setupIOSFeatures() {
    // Prevent iOS safari bounce/zoom
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // Prevent iOS context menu on long press
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Handle iOS app lifecycle
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && gameState === 'playing') {
            // Auto-pause when app goes to background
            togglePause();
        }
    });
    
    // iOS status bar integration
    if (window.navigator.standalone) {
        document.body.classList.add('ios-standalone');
    }
    
    // Haptic feedback support (if available)
    if ('vibrate' in navigator) {
        window.hapticFeedback = function(pattern) {
            navigator.vibrate(pattern);
        };
    } else {
        window.hapticFeedback = function() {};
    }
    
    // iOS performance optimization
    setupPerformanceOptimizations();
}

// Performance optimizations for iOS
function setupPerformanceOptimizations() {
    // Optimize canvas for iOS
    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    
    // Use RAF for better performance
    let lastFrameTime = 0;
    function gameFrame(currentTime) {
        if (currentTime - lastFrameTime >= calculateDelay()) {
            update();
            lastFrameTime = currentTime;
        }
        if (gameState === 'playing') {
            requestAnimationFrame(gameFrame);
        }
    }
    
    // Replace setInterval with RAF for better iOS performance
    const originalStartGame = startGame;
    window.startGame = function() {
        resetGame();
        gameState = 'playing';
        hideOverlay();
        
        // Start the snake moving right automatically
        direction = {x: 1, y: 0};
        
        // Use RAF instead of setInterval
        requestAnimationFrame(gameFrame);
        
        // Haptic feedback
        hapticFeedback([10]);
    };
}

// iOS-optimized touch controls
function initTouchControls() {
    const touchButtons = document.querySelectorAll('.touch-button[data-direction]');
    const pauseBtn = document.getElementById('pauseBtn');
    
    touchButtons.forEach(button => {
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const direction = button.dataset.direction;
            handleTouchDirection(direction);
        });
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const direction = button.dataset.direction;
            handleTouchDirection(direction);
        });
    });
    
    pauseBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        togglePause();
    });
    
    pauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        togglePause();
    });
}

// Handle touch direction input
function handleTouchDirection(dir) {
    if (gameState !== 'playing') return;
    
    switch (dir) {
        case 'up':
            if (direction.y !== 1) direction = {x: 0, y: -1};
            break;
        case 'down':
            if (direction.y !== -1) direction = {x: 0, y: 1};
            break;
        case 'left':
            if (direction.x !== 1) direction = {x: -1, y: 0};
            break;
        case 'right':
            if (direction.x !== -1) direction = {x: 1, y: 0};
            break;
    }
}

// Swipe gesture detection
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function initSwipeControls() {
    const gameArea = document.querySelector('.game-area') || document.body;
    
    gameArea.addEventListener('touchstart', (e) => {
        if (gameState !== 'playing') return;
        
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    gameArea.addEventListener('touchend', (e) => {
        if (gameState !== 'playing') return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        handleSwipeGesture();
    }, { passive: true });
}

function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30; // Minimum distance for a swipe
    
    // Check if the swipe distance is significant enough
    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
        return; // Not a swipe, just a tap
    }
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
            handleTouchDirection('right');
        } else {
            handleTouchDirection('left');
        }
    } else {
        // Vertical swipe
        if (deltaY > 0) {
            handleTouchDirection('down');
        } else {
            handleTouchDirection('up');
        }
    }
}

// Start the game
function startGame() {
    resetGame();
    gameState = 'playing';
    hideOverlay();
    
    // Start the snake moving right automatically
    direction = {x: 1, y: 0};
    
    // Start game loop with current speed
    const delay = calculateDelay();
    gameLoop = setInterval(update, delay);
}

// Reset game to initial state
function resetGame() {
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    score = 0;
    isEating = false;
    eatingAnimation = 0;
    dogs = [];
    birdsEaten = 0;
    nextDogSpawn = 2 + Math.floor(Math.random() * 2);
    tunaCans = [];
    tunaSpawnTimer = 0;
    tunaSpawnInterval = Math.floor(Math.random() * 300) + 200; // 3-8 seconds
    updateScore();
    generateFood();
}

// Game update loop
function update() {
    if (gameState !== 'playing') return;
    
    moveSnake();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    if (eatFood()) {
        score += 10;
        updateScore();
        generateFood();
        
        // Trigger eating animation
        isEating = true;
        eatingAnimation = 10; // Animation frames
        
        // Count birds eaten and potentially spawn dog
        birdsEaten++;
        if (birdsEaten >= nextDogSpawn) {
            spawnDog();
            birdsEaten = 0;
            nextDogSpawn = 2 + Math.floor(Math.random() * 2); // Next dog in 2-3 birds
        }
        
        // Note: Speed is now controlled by the slider, not by score
    }
    
    // Check if cat eats tuna can
    if (eatTunaCan()) {
        score += 50; // Bonus points for tuna can!
        updateScore();
        
        // Trigger eating animation
        isEating = true;
        eatingAnimation = 10; // Animation frames
    }
    
    // Update dogs
    updateDogs();
    
    // Update tuna cans
    updateTunaCans();
    
    draw();
}

// Move the snake
function moveSnake() {
    if (direction.x === 0 && direction.y === 0) return;
    
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    // Wrap around walls - teleport to opposite side
    if (head.x < 0) {
        head.x = GRID_COUNT_X - 1; // Left wall -> appear on right
    } else if (head.x >= GRID_COUNT_X) {
        head.x = 0; // Right wall -> appear on left
    }
    
    if (head.y < 0) {
        head.y = GRID_COUNT_Y - 1; // Top wall -> appear on bottom
    } else if (head.y >= GRID_COUNT_Y) {
        head.y = 0; // Bottom wall -> appear on top
    }
    
    snake.unshift(head);
    
    // Remove tail if no food eaten
    if (head.x !== food.x || head.y !== food.y) {
        snake.pop();
    }
}

// Check if snake collides with itself or dogs (no wall collision anymore!)
function checkCollision() {
    const head = snake[0];
    
    // Self collision only - walls no longer end the game
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    // Check dog collision
    for (let dog of dogs) {
        if (head.x === dog.x && head.y === dog.y) {
            return true;
        }
    }
    
    return false;
}

// Check if snake eats food
function eatFood() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

// Generate new food position
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_COUNT_X),
            y: Math.floor(Math.random() * GRID_COUNT_Y)
        };
    } while (isSnakePosition(food.x, food.y));
}

// Check if position is occupied by snake
function isSnakePosition(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Handle keyboard input
function handleKeyPress(event) {
    
    if (gameState === 'menu') {
        // No keyboard shortcuts needed in menu - use UI buttons
        return;
    }
    
    if (gameState === 'gameOver') {
        if (event.code === 'Space') {
            showTapToStart();
        }
        return;
    }
    
    // Pause/resume
    if (event.code === 'Space') {
        event.preventDefault();
        togglePause();
        return;
    }
    
    if (gameState !== 'playing') {
        return;
    }
    
    // Movement controls - simplified logic
    switch (event.code) {
        case 'ArrowUp':
            if (direction.y !== 1) { // Can't go up if moving down
                direction = {x: 0, y: -1};
            }
            break;
        case 'ArrowDown':
            if (direction.y !== -1) { // Can't go down if moving up
                direction = {x: 0, y: 1};
            }
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) { // Can't go left if moving right
                direction = {x: -1, y: 0};
            }
            break;
        case 'ArrowRight':
            if (direction.x !== -1) { // Can't go right if moving left
                direction = {x: 1, y: 0};
            }
            break;
    }
    
    event.preventDefault();
}

// Toggle pause state
function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        clearInterval(gameLoop);
        showOverlay('Game Paused', 'Press Space to Resume', 'Resume');
    } else if (gameState === 'paused') {
        gameState = 'playing';
        hideOverlay();
        const delay = calculateDelay();
        gameLoop = setInterval(update, delay);
    }
}

// Game over
function gameOver() {
    gameState = 'gameOver';
    clearInterval(gameLoop);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        updateHighScore();
        showOverlay('New High Score!', `You scored ${score} points!`, 'Play Again');
    } else {
        showOverlay('Game Over!', `Score: ${score}`, 'Play Again');
    }
}

// Show menu
function showMenu() {
    gameState = 'menu';
    resetGame();
    draw();
    showTapToStart();
}

// Show simple tap to start screen
function showTapToStart() {
    console.log('showTapToStart called'); // Debug log
    
    if (!gameMessage) {
        console.error('gameMessage element not found');
        return;
    }
    
    if (!gameOverlay) {
        console.error('gameOverlay element not found');
        return;
    }
    
    gameMessage.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; background: rgba(0, 0, 0, 0.9); border-radius: 15px;">
            <h1 style="color: #FFFFFF; font-size: 2.5rem; font-weight: 800; text-shadow: 0 3px 6px rgba(0, 0, 0, 1); margin-bottom: 20px; text-align: center;">
                🐱 bird?
            </h1>
            <p style="color: #FFFFFF; font-size: 1.2rem; font-weight: 600; text-shadow: 0 2px 4px rgba(0, 0, 0, 1); margin-bottom: 30px; text-align: center;">
                A fun snake game with cats!
            </p>
            <button id="tapToStartBtn" style="
                background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
                border: 3px solid rgba(255, 255, 255, 0.4);
                color: #FFFFFF;
                font-size: 1.5rem;
                font-weight: 700;
                padding: 20px 40px;
                border-radius: 25px;
                cursor: pointer;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
                box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3);
                transition: all 0.3s ease;
                outline: none;
                min-width: 200px;
            ">
                🎮 Tap to Start
            </button>
        </div>
    `;
    
    // Show the overlay - force visibility
    gameOverlay.style.display = 'flex';
    gameOverlay.style.opacity = '1';
    gameOverlay.style.pointerEvents = 'auto';
    gameOverlay.style.visibility = 'visible';
    gameOverlay.classList.remove('hidden');
    console.log('Overlay should be visible now', gameOverlay.style.display); // Debug log
    
    // Add event listener to the tap to start button
    const tapBtn = gameMessage.querySelector('#tapToStartBtn');
    if (tapBtn) {
        tapBtn.addEventListener('click', () => {
            console.log('Tap to start clicked - showing character selection');
            showCharacterSelection();
            hapticFeedback([10]);
        });
        
        // Add hover effect for desktop
        tapBtn.addEventListener('mouseenter', () => {
            tapBtn.style.transform = 'scale(1.05)';
            tapBtn.style.boxShadow = '0 12px 30px rgba(0, 122, 255, 0.4)';
        });
        
        tapBtn.addEventListener('mouseleave', () => {
            tapBtn.style.transform = 'scale(1)';
            tapBtn.style.boxShadow = '0 8px 20px rgba(0, 122, 255, 0.3)';
        });
    } else {
        console.error('tapToStartBtn not found after setting innerHTML');
    }
}

// Fallback button creation
function createFallbackButton() {
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) {
        console.error('Game area not found');
        return;
    }
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.9);
        padding: 30px;
        border-radius: 15px;
        border: 3px solid rgba(255, 255, 255, 0.4);
    `;
    
    // Create title
    const title = document.createElement('h1');
    title.style.cssText = `
        color: #FFFFFF;
        font-size: 2rem;
        font-weight: 800;
        text-shadow: 0 3px 6px rgba(0, 0, 0, 1);
        margin-bottom: 15px;
        text-align: center;
        margin: 0 0 15px 0;
    `;
    title.innerHTML = '🐱 bird?';
    
    // Create button
    const button = document.createElement('button');
    button.id = 'fallbackStartBtn';
    button.style.cssText = `
        background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
        border: 3px solid rgba(255, 255, 255, 0.4);
        color: #FFFFFF;
        font-size: 1.5rem;
        font-weight: 700;
        padding: 20px 40px;
        border-radius: 25px;
        cursor: pointer;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
        box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3);
        transition: all 0.3s ease;
        outline: none;
        min-width: 200px;
    `;
    button.innerHTML = '🎮 Tap to Start';
    
    // Add click handler
    button.addEventListener('click', () => {
        console.log('Fallback button clicked');
        buttonContainer.remove();
        startGame();
        hapticFeedback([10]);
    });
    
    // Add hover effects
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
    
    // Append to DOM
    buttonContainer.appendChild(title);
    buttonContainer.appendChild(button);
    gameArea.appendChild(buttonContainer);
    
    console.log('Fallback button created and added to DOM');
}

// Show overlay with message
function showOverlay(title, message, buttonText) {
    if (gameState === 'menu') {
        startGame();
    } else {
        gameMessage.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
            <button id="startBtn" class="game-btn">${buttonText}</button>
        `;
        
        // Re-attach event listener to new button
        const newBtn = gameMessage.querySelector('#startBtn');
        newBtn.addEventListener('click', () => {
            if (gameState === 'gameOver') {
                showTapToStart();
            } else if (gameState === 'paused') {
                togglePause();
            }
        });
    }
    
    gameOverlay.classList.remove('hidden');
}

// Multi-step welcome flow for character and speed selection
const totalSteps = 3;
let welcomeStep = 1;

// Show step-by-step welcome sequence
function showCharacterSelection() {
    if (welcomeStep === 1) {
        showStep1_CharacterSelection();
    } else if (welcomeStep === 2) {
        showStep2_SpeedSelection();
    } else if (welcomeStep === 3) {
        showStep3_Instructions();
    }
}

// Step 1: Compact Character Selection (fits 390x420px)
function showStep1_CharacterSelection() {
    gameMessage.innerHTML = `
        <div class="compact-welcome-container">
            <div class="compact-step-indicator">
                <div class="step-dot active"></div>
                <div class="step-dot"></div>
                <div class="step-dot"></div>
            </div>
            
            <div class="compact-header">
                <h2 class="compact-title">
                    <span class="title-icon">🐱</span>
                    Choose Your Cat
                </h2>
            </div>
            
            <div class="compact-cat-grid">
                ${Object.entries(catTypes).map(([type, info]) => `
                    <div class="compact-cat-option ${selectedCat === type ? 'selected' : ''}" data-cat="${type}">
                        <div class="compact-cat-preview" id="preview-${type}"></div>
                        <div class="compact-cat-name">${info.name}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="compact-navigation">
                <button id="nextStepBtn" class="compact-btn next-btn" disabled>
                    Next: Speed →
                </button>
            </div>
        </div>
    `;
    
    // Draw cat previews
    setTimeout(() => {
        Object.keys(catTypes).forEach(type => {
            drawCatPreview(type);
        });
    }, 50);
    
    // Setup character selection
    setupStep1CatSelection();
}



// Step 2: Compact Speed Selection (fits 390x420px)
function showStep2_SpeedSelection() {
    gameMessage.innerHTML = `
        <div class="compact-welcome-container">
            <div class="compact-step-indicator">
                <div class="step-dot completed"></div>
                <div class="step-dot active"></div>
                <div class="step-dot"></div>
            </div>
            
            <div class="compact-header">
                <h2 class="compact-title">
                    <span class="title-icon">⚡</span>
                    Pick Your Pace
                </h2>
            </div>
            
            <div class="compact-speed-section">
                <div class="compact-speed-presets">
                    <button class="compact-preset-btn ${currentSpeed <= 3 ? 'active' : ''}" data-speed="2">
                        <span class="preset-icon">😴</span>
                        <span class="preset-name">Sleepy</span>
                    </button>
                    <button class="compact-preset-btn ${currentSpeed >= 4 && currentSpeed <= 6 ? 'active' : ''}" data-speed="5">
                        <span class="preset-icon">😸</span>
                        <span class="preset-name">Playful</span>
                    </button>
                    <button class="compact-preset-btn ${currentSpeed >= 7 ? 'active' : ''}" data-speed="8">
                        <span class="preset-icon">😼</span>
                        <span class="preset-name">Hungry</span>
                    </button>
                </div>
                
                <div class="compact-speed-slider">
                    <label>Speed: <span id="menuSpeedValue">${currentSpeed}</span>/10</label>
                    <input type="range" id="menuSpeedSlider" min="1" max="10" value="${currentSpeed}" class="compact-slider">
                </div>
            </div>
            
            <div class="compact-navigation">
                <button id="prevStepBtn" class="compact-btn prev-btn">
                    ← Back
                </button>
                <button id="nextStepBtn" class="compact-btn next-btn">
                    Next: How to Play →
                </button>
            </div>
        </div>
    `;
    
    setupStep2SpeedSelection();
}

// Step 3: Compact Instructions (fits 390x420px)
function showStep3_Instructions() {
    gameMessage.innerHTML = `
        <div class="compact-welcome-container">
            <div class="compact-step-indicator">
                <div class="step-dot completed"></div>
                <div class="step-dot completed"></div>
                <div class="step-dot active"></div>
            </div>
            
            <div class="compact-header">
                <h2 class="compact-title">
                    <span class="title-icon">📚</span>
                    How to Play
                </h2>
            </div>
            
            <div class="compact-instructions">
                <div class="compact-info-grid">
                    <div class="compact-info-item">
                        <span class="info-icon">🎯</span>
                        <span>Catch birds to grow longer</span>
                    </div>
                    <div class="compact-info-item">
                        <span class="info-icon">🕹️</span>
                        <span>Use arrows or swipe to move</span>
                    </div>
                    <div class="compact-info-item">
                        <span class="info-icon">🐶</span>
                        <span>Avoid dogs guarding birds</span>
                    </div>
                    <div class="compact-info-item">
                        <span class="info-icon">🥫</span>
                        <span>Collect tuna for bonus points</span>
                    </div>
                </div>
            </div>
            
            <div class="compact-navigation">
                <button id="prevStepBtn" class="compact-btn prev-btn">
                    ← Back
                </button>
                <button id="startBtn" class="compact-btn start-btn">
                    🎮 Start Game
                </button>
            </div>
        </div>
    `;
    
    setupStep3Instructions();
}

// Get cat personality trait
function getCatTrait(catType) {
    const traits = {
        blue: 'Playful & Energetic',
        orange: 'Clever & Cunning'
    };
    return traits[catType] || 'Special Cat';
}

// Step 1: Setup compact character selection
function setupStep1CatSelection() {
    const catOptions = gameMessage.querySelectorAll('.compact-cat-option');
    const nextBtn = gameMessage.querySelector('#nextStepBtn');
    
    catOptions.forEach(option => {
        option.addEventListener('click', () => {
            catOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            selectedCat = option.dataset.cat;
            localStorage.setItem('selectedCat', selectedCat);
            
            nextBtn.disabled = false;
            hapticFeedback([5]);
        });
    });
    
    nextBtn.addEventListener('click', () => {
        if (!nextBtn.disabled) {
            welcomeStep = 2;
            showCharacterSelection();
            hapticFeedback([5]);
        }
    });
    
    // Auto-select if we have a saved selection
    if (selectedCat) {
        const selectedOption = gameMessage.querySelector(`[data-cat="${selectedCat}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            nextBtn.disabled = false;
        }
    }
}

// Step 2: Setup compact speed selection
function setupStep2SpeedSelection() {
    const menuSpeedSlider = gameMessage.querySelector('#menuSpeedSlider');
    const menuSpeedValue = gameMessage.querySelector('#menuSpeedValue');
    const presetBtns = gameMessage.querySelectorAll('.compact-preset-btn');
    const prevBtn = gameMessage.querySelector('#prevStepBtn');
    const nextBtn = gameMessage.querySelector('#nextStepBtn');
    
    // Slider handling
    menuSpeedSlider.addEventListener('input', () => {
        currentSpeed = parseInt(menuSpeedSlider.value);
        menuSpeedValue.textContent = currentSpeed;
        localStorage.setItem('gameSpeed', currentSpeed);
        updatePresetButtons();
        hapticFeedback([3]);
    });
    
    // Preset button handling
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const speed = parseInt(btn.dataset.speed);
            currentSpeed = speed;
            menuSpeedSlider.value = speed;
            menuSpeedValue.textContent = speed;
            localStorage.setItem('gameSpeed', currentSpeed);
            updatePresetButtons();
            hapticFeedback([5]);
        });
    });
    
    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        welcomeStep = 1;
        showCharacterSelection();
        hapticFeedback([5]);
    });
    
    nextBtn.addEventListener('click', () => {
        welcomeStep = 3;
        showCharacterSelection();
        hapticFeedback([5]);
    });
    
    function updatePresetButtons() {
        presetBtns.forEach(btn => btn.classList.remove('active'));
        
        if (currentSpeed <= 3) {
            presetBtns[0].classList.add('active');
        } else if (currentSpeed <= 6) {
            presetBtns[1].classList.add('active');
        } else {
            presetBtns[2].classList.add('active');
        }
    }
    
    updatePresetButtons();
}

// Step 3: Setup compact instructions
function setupStep3Instructions() {
    const prevBtn = gameMessage.querySelector('#prevStepBtn');
    const startBtn = gameMessage.querySelector('#startBtn');
    
    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        welcomeStep = 2;
        showCharacterSelection();
        hapticFeedback([5]);
    });
    
    startBtn.addEventListener('click', () => {
        startGame();
        hapticFeedback([10, 20]);
    });
}

// Hide overlay
function hideOverlay() {
    gameOverlay.classList.add('hidden');
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
}

// Update high score display
function updateHighScore() {
    highScoreElement.textContent = highScore;
}

// Calculate delay based on current speed (1-10 scale)
function calculateDelay() {
    // Speed 1 = 320ms (slow), Speed 10 = 50ms (very fast)
    return Math.max(50, 350 - (currentSpeed * 30));
}

// Update speed from slider
function updateSpeed() {
    if (speedSlider) {
        currentSpeed = parseInt(speedSlider.value);
        updateSpeedDisplay();
        
        // If game is running, restart the loop with new speed
        if (gameState === 'playing') {
            clearInterval(gameLoop);
            const delay = calculateDelay();
            gameLoop = setInterval(update, delay);
        }
    }
}

// Update speed display
function updateSpeedDisplay() {
    if (speedValueElement) {
        speedValueElement.textContent = currentSpeed;
    }
}

// Draw a bigger, cuter cat (20x20 pixels - fills entire grid cell!)
function drawCat(x, y, catType = 'blue') {
    // Update eating animation
    if (isEating && eatingAnimation > 0) {
        eatingAnimation--;
        if (eatingAnimation === 0) {
            isEating = false;
        }
    }
    
    // Enhanced glow effect
    ctx.shadowColor = isEating ? '#ff6b9d' : '#00d4ff';
    ctx.shadowBlur = isEating ? 15 : 10;
    
    // Scale effect when eating
    const scale = isEating ? 1 + (eatingAnimation * 0.05) : 1;
    const offsetX = (1 - scale) * GRID_SIZE / 2;
    const offsetY = (1 - scale) * GRID_SIZE / 2;
    
    ctx.save();
    ctx.translate(x + offsetX, y + offsetY);
    ctx.scale(scale, scale);
    
    // Cat body with enhanced gradient based on type
    const gradient = ctx.createRadialGradient(GRID_SIZE/2, GRID_SIZE/2, 0, GRID_SIZE/2, GRID_SIZE/2, GRID_SIZE/1.5);
    const colors = getCatColors(catType, isEating);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.6, colors.secondary);
    gradient.addColorStop(1, colors.tertiary);
    ctx.fillStyle = gradient;
    
    // Larger cat face (almost fills entire grid)
    ctx.fillRect(2, 4, 16, 14);
    ctx.fillRect(3, 3, 14, 16);
    ctx.fillRect(4, 2, 12, 18);
    
    // Bigger, more prominent ears
    ctx.fillRect(2, 1, 5, 6);
    ctx.fillRect(13, 1, 5, 6);
    ctx.fillRect(1, 2, 3, 4);
    ctx.fillRect(16, 2, 3, 4);
    
    // Inner ears with cat-specific colors
    ctx.fillStyle = getCatEarColor(catType, isEating);
    ctx.fillRect(3, 2, 3, 3);
    ctx.fillRect(14, 2, 3, 3);
    
    // Bigger, more expressive eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 8, 3, 3);
    ctx.fillRect(11, 8, 3, 3);
    
    // Eye shine/sparkle
    ctx.fillStyle = '#e0f7ff';
    ctx.fillRect(7, 8, 1, 1);
    ctx.fillRect(12, 8, 1, 1);
    
    // Eye pupils - bigger for cuteness
    ctx.fillStyle = '#000033';
    ctx.fillRect(7, 9, 2, 2);
    ctx.fillRect(12, 9, 2, 2);
    
    // Cute nose - heart shape!
    ctx.fillStyle = getCatNoseColor(catType);
    ctx.fillRect(9, 11, 2, 2);
    ctx.fillRect(8, 12, 1, 1);
    ctx.fillRect(11, 12, 1, 1);
    ctx.fillRect(9, 13, 2, 1);
    
    // Add special features based on cat type
    drawCatSpecialFeatures(catType, isEating);
    
    // Mouth - changes when eating!
    ctx.fillStyle = '#003366';
    if (isEating && eatingAnimation > 5) {
        // Wide open mouth (Pac-Man style)
        ctx.fillRect(7, 14, 6, 2);
        ctx.fillRect(6, 15, 8, 2);
        ctx.fillRect(8, 16, 4, 1);
        
        // Tongue when eating
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(9, 16, 2, 1);
    } else {
        // Normal cute smile
        ctx.fillRect(8, 14, 4, 1);
        ctx.fillRect(7, 15, 2, 1);
        ctx.fillRect(11, 15, 2, 1);
        ctx.fillRect(6, 16, 2, 1);
        ctx.fillRect(12, 16, 2, 1);
    }
    
    // Cute whiskers
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 10, 2, 1);
    ctx.fillRect(16, 10, 2, 1);
    ctx.fillRect(1, 11, 2, 1);
    ctx.fillRect(17, 11, 2, 1);
    ctx.fillRect(2, 12, 2, 1);
    ctx.fillRect(16, 12, 2, 1);
    
    ctx.restore();
    
    // Eating particle effect
    if (isEating) {
        drawEatingEffect(x, y);
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Draw eating particle effect
function drawEatingEffect(x, y) {
    const particles = 8;
    const time = (10 - eatingAnimation) * 0.1;
    
    for (let i = 0; i < particles; i++) {
        const angle = (i / particles) * Math.PI * 2;
        const distance = time * 30;
        const px = x + GRID_SIZE/2 + Math.cos(angle) * distance;
        const py = y + GRID_SIZE/2 + Math.sin(angle) * distance;
        
        ctx.fillStyle = `rgba(255, 107, 157, ${1 - time})`;
        ctx.fillRect(px - 1, py - 1, 2, 2);
        
        ctx.fillStyle = `rgba(255, 215, 0, ${1 - time})`;
        ctx.fillRect(px, py, 1, 1);
    }
}

// Get cat colors based on type
function getCatColors(catType, isEating) {
    if (isEating) {
        return { primary: '#ff3d6f', secondary: '#d4336f', tertiary: '#b8246f' };
    }
    
    switch (catType) {
        case 'blue':
            return { primary: '#00d4ff', secondary: '#0099cc', tertiary: '#006699' };
        case 'orange':
            return { primary: '#ff8c42', secondary: '#e6673d', tertiary: '#cc4125' };
        case 'pink':
            return { primary: '#ff69b4', secondary: '#e64aa3', tertiary: '#cc2b92' };
        case 'black':
            return { primary: '#4a4a4a', secondary: '#333333', tertiary: '#1a1a1a' };
        case 'white':
            return { primary: '#ffffff', secondary: '#f0f0f0', tertiary: '#d0d0d0' };
        default:
            return { primary: '#00d4ff', secondary: '#0099cc', tertiary: '#006699' };
    }
}

// Get ear color based on cat type
function getCatEarColor(catType, isEating) {
    if (isEating) return '#ffaa00';
    
    switch (catType) {
        case 'blue': return '#ff6b9d';
        case 'orange': return '#ff6b42';
        case 'pink': return '#ff1493';
        case 'black': return '#666666';
        case 'white': return '#ffb6c1';
        default: return '#ff6b9d';
    }
}

// Get nose color based on cat type
function getCatNoseColor(catType) {
    switch (catType) {
        case 'blue': return '#ff6b9d';
        case 'orange': return '#ff4500';
        case 'pink': return '#ff1493';
        case 'black': return '#ff69b4';
        case 'white': return '#ff69b4';
        default: return '#ff6b9d';
    }
}

// Draw special features for each cat type
function drawCatSpecialFeatures(catType, isEating) {
    switch (catType) {
        case 'orange':
            // Tabby stripes
            ctx.fillStyle = 'rgba(204, 65, 37, 0.6)';
            ctx.fillRect(5, 6, 10, 1);
            ctx.fillRect(6, 8, 8, 1);
            ctx.fillRect(7, 10, 6, 1);
            ctx.fillRect(5, 12, 10, 1);
            ctx.fillRect(6, 14, 8, 1);
            break;
            
        case 'pink':
            // Princess crown/bow
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(7, 0, 6, 2);
            ctx.fillRect(6, 1, 8, 1);
            ctx.fillRect(8, -1, 4, 1);
            // Crown jewels
            ctx.fillStyle = '#ff1493';
            ctx.fillRect(8, 0, 1, 1);
            ctx.fillRect(10, 0, 1, 1);
            ctx.fillRect(12, 0, 1, 1);
            break;
            
        case 'black':
            // Glowing eyes effect
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(5, 7, 5, 5);
            ctx.fillRect(10, 7, 5, 5);
            break;
            
        case 'white':
            // Extra fluffy cheeks
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(1, 9, 3, 3);
            ctx.fillRect(16, 9, 3, 3);
            ctx.fillRect(2, 8, 2, 5);
            ctx.fillRect(16, 8, 2, 5);
            break;
    }
}

// Draw cat preview for selection screen
function drawCatPreview(catType) {
    const previewElement = document.getElementById(`preview-${catType}`);
    if (!previewElement) return;
    
    // Clear any existing content
    previewElement.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const previewCtx = canvas.getContext('2d');
    
    // Set up preview rendering - simpler approach
    previewCtx.imageSmoothingEnabled = false; // Keep pixel art crisp
    
    // Clear with a nice background
    const bgGradient = previewCtx.createRadialGradient(24, 24, 0, 24, 24, 24);
    bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    bgGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
    previewCtx.fillStyle = bgGradient;
    previewCtx.fillRect(0, 0, 48, 48);
    
    // Draw the cat directly using simple shapes - scale 2x for better visibility
    previewCtx.scale(2.4, 2.4);
    
    // Get cat colors
    const colors = getCatColors(catType, false);
    
    // Draw simplified cat
    // Cat body
    const gradient = previewCtx.createRadialGradient(10, 10, 0, 10, 10, 8);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.6, colors.secondary);
    gradient.addColorStop(1, colors.tertiary);
    previewCtx.fillStyle = gradient;
    previewCtx.fillRect(4, 6, 12, 8);
    
    // Cat ears
    previewCtx.fillStyle = colors.secondary;
    previewCtx.fillRect(4, 4, 3, 3);
    previewCtx.fillRect(13, 4, 3, 3);
    
    // Inner ears
    previewCtx.fillStyle = getCatEarColor(catType, false);
    previewCtx.fillRect(5, 5, 1, 1);
    previewCtx.fillRect(14, 5, 1, 1);
    
    // Cat eyes
    previewCtx.fillStyle = '#000000';
    previewCtx.fillRect(7, 8, 1, 1);
    previewCtx.fillRect(12, 8, 1, 1);
    
    // Eye highlights
    previewCtx.fillStyle = '#ffffff';
    previewCtx.fillRect(7, 8, 0.5, 0.5);
    previewCtx.fillRect(12, 8, 0.5, 0.5);
    
    // Cat nose
    previewCtx.fillStyle = getCatNoseColor(catType);
    previewCtx.fillRect(9, 10, 2, 1);
    
    // Cat whiskers
    previewCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    previewCtx.fillRect(3, 9, 1, 0.5);
    previewCtx.fillRect(16, 9, 1, 0.5);
    previewCtx.fillRect(3, 11, 1, 0.5);
    previewCtx.fillRect(16, 11, 1, 0.5);
    
    // Add special features for different cats
    switch (catType) {
        case 'orange':
            // Tabby stripes
            previewCtx.fillStyle = 'rgba(204, 65, 37, 0.4)';
            previewCtx.fillRect(6, 7, 8, 0.5);
            previewCtx.fillRect(7, 9, 6, 0.5);
            previewCtx.fillRect(6, 11, 8, 0.5);
            break;
        case 'pink':
            // Princess crown
            previewCtx.fillStyle = '#ffd700';
            previewCtx.fillRect(8, 3, 4, 1);
            previewCtx.fillStyle = '#ff1493';
            previewCtx.fillRect(9, 3, 1, 0.5);
            previewCtx.fillRect(11, 3, 1, 0.5);
            break;
        case 'black':
            // Glowing eyes
            previewCtx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            previewCtx.fillRect(6, 7, 3, 3);
            previewCtx.fillRect(11, 7, 3, 3);
            break;
        case 'white':
            // Extra fluffy cheeks
            previewCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            previewCtx.fillRect(2, 9, 2, 2);
            previewCtx.fillRect(16, 9, 2, 2);
            break;
    }
    
    previewElement.appendChild(canvas);
}

// Update tuna cans system
function updateTunaCans() {
    // Update spawn timer
    tunaSpawnTimer++;
    
    // Spawn new tuna can periodically
    if (tunaSpawnTimer >= tunaSpawnInterval) {
        spawnTunaCan();
        tunaSpawnTimer = 0;
        tunaSpawnInterval = Math.floor(Math.random() * 400) + 300; // 5-11 seconds until next spawn
    }
    
    // Update existing tuna cans (decrease their timer)
    tunaCans = tunaCans.filter(tuna => {
        tuna.timer--;
        return tuna.timer > 0;
    });
}

// Spawn a new tuna can at random location
function spawnTunaCan() {
    for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * GRID_COUNT_X);
        const y = Math.floor(Math.random() * GRID_COUNT_Y);
        
        if (!isTunaPositionOccupied(x, y)) {
            // Make tuna display time speed-dependent for fairness
            // Slower speeds get more time, faster speeds get less time
            // Base time: 8 seconds for speed 1, 3 seconds for speed 10
            const baseTimeMs = Math.max(3000, 8000 - (currentSpeed * 500)); // 8000ms to 3000ms
            const tunaTimer = Math.floor(baseTimeMs / calculateDelay());
            tunaCans.push({ x, y, timer: tunaTimer });
            return;
        }
    }
}

// Check if position is occupied by snake, food, dogs, or other tuna cans
function isTunaPositionOccupied(x, y) {
    // Check snake
    for (let segment of snake) {
        if (segment.x === x && segment.y === y) {
            return true;
        }
    }
    
    // Check food
    if (food.x === x && food.y === y) {
        return true;
    }
    
    // Check dogs
    for (let dog of dogs) {
        if (dog.x === x && dog.y === y) {
            return true;
        }
    }
    
    // Check other tuna cans
    for (let tuna of tunaCans) {
        if (tuna.x === x && tuna.y === y) {
            return true;
        }
    }
    
    return false;
}

// Check if cat eats tuna can
function eatTunaCan() {
    const head = snake[0];
    
    for (let i = 0; i < tunaCans.length; i++) {
        if (head.x === tunaCans[i].x && head.y === tunaCans[i].y) {
            tunaCans.splice(i, 1); // Remove the eaten tuna can
            return true;
        }
    }
    
    return false;
}

// Draw a delicious tuna can bonus item
function drawTunaCan(x, y, timer) {
    ctx.save();
    
    // Translate to the correct position
    ctx.translate(x, y);
    
    // Calculate warning threshold for last 1 second
    const warningFrames = Math.floor(1000 / calculateDelay()); 
    
    // Warning flash effect when tuna can is about to disappear
    const flashEffect = timer < warningFrames && Math.floor(timer / 5) % 2 === 0;
    if (flashEffect) {
        ctx.globalAlpha = 0.7;
    }
    
    // Tuna can body (cylindrical silver can)
    const gradient = ctx.createLinearGradient(0, 0, GRID_SIZE, GRID_SIZE);
    gradient.addColorStop(0, '#e6e6e6');
    gradient.addColorStop(0.3, '#cccccc');
    gradient.addColorStop(0.7, '#b3b3b3');
    gradient.addColorStop(1, '#999999');
    ctx.fillStyle = gradient;
    
    // Can shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Main can body
    ctx.fillRect(3, 5, 14, 10);
    
    // Can top (lid)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(2, 4, 16, 3);
    
    // Can bottom
    ctx.fillStyle = '#999999';
    ctx.fillRect(2, 15, 16, 3);
    
    // Label design (red and white)
    ctx.fillStyle = '#dc143c';
    ctx.fillRect(4, 7, 12, 6);
    
    // Label text area (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 8, 10, 4);
    
    // Simplified "TUNA" text using rectangles
    ctx.fillStyle = '#dc143c';
    // T
    ctx.fillRect(6, 9, 1, 2);
    ctx.fillRect(5, 9, 3, 1);
    // U
    ctx.fillRect(8, 9, 1, 2);
    ctx.fillRect(10, 9, 1, 2);
    ctx.fillRect(8, 11, 3, 1);
    // N
    ctx.fillRect(12, 9, 1, 2);
    ctx.fillRect(14, 9, 1, 2);
    ctx.fillRect(13, 10, 1, 1);
    
    // Can highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(3, 5, 2, 8);
    ctx.fillRect(2, 4, 3, 2);
    
    // Sparkle effect for bonus item
    const sparkleTime = Date.now() * 0.005;
    ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(sparkleTime) * 0.3})`;
    ctx.fillRect(1, 2, 2, 2);
    ctx.fillRect(17, 3, 2, 2);
    ctx.fillRect(2, 16, 2, 2);
    ctx.fillRect(16, 17, 2, 2);
    
    // Warning indicator when timer is low
    if (timer < warningFrames) {
        ctx.fillStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(Date.now() * 0.03) * 0.3})`;
        ctx.fillRect(-2, -2, GRID_SIZE + 4, GRID_SIZE + 4);
    }
    
    // Reset shadow and restore context
    ctx.shadowBlur = 0;
    ctx.restore();
}

// Update dogs system
function updateDogs() {
    // Update existing dogs (decrease their timer)
    dogs = dogs.filter(dog => {
        dog.timer--;
        return dog.timer > 0;
    });
}

// Spawn a new dog closer to the bird/food
function spawnDog() {
    // Simplified approach: try random positions near the bird
    for (let attempt = 0; attempt < 50; attempt++) {
        // Generate position within 3-6 squares of the bird
        const offsetX = (Math.random() - 0.5) * 12; // -6 to +6
        const offsetY = (Math.random() - 0.5) * 12; // -6 to +6
        
        const x = Math.floor(food.x + offsetX);
        const y = Math.floor(food.y + offsetY);
        
        // Make sure position is within bounds
        if (x >= 0 && x < GRID_COUNT_X && y >= 0 && y < GRID_COUNT_Y) {
            if (!isPositionOccupied(x, y)) {
                const catDistance = Math.max(Math.abs(snake[0].x - x), Math.abs(snake[0].y - y));
                
                        if (catDistance >= 2) { // Minimum 2 squares from cat
            const dogTimer = Math.floor(10000 / calculateDelay()); // 10 seconds worth of frames
            dogs.push({ x, y, timer: dogTimer });
            return;
        }
            }
        }
    }
    
    // Super simple fallback: just place anywhere that's not occupied and not too close to cat
    for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * GRID_COUNT_X);
        const y = Math.floor(Math.random() * GRID_COUNT_Y);
        
        if (!isPositionOccupied(x, y)) {
            const catDistance = Math.max(Math.abs(snake[0].x - x), Math.abs(snake[0].y - y));
            if (catDistance >= 2) {
                const dogTimer = Math.floor(10000 / calculateDelay()); // 10 seconds worth of frames
                dogs.push({ x, y, timer: dogTimer });
                return;
            }
        }
    }
}

// Check if position is occupied by snake or food
function isPositionOccupied(x, y) {
    // Check snake
    for (let segment of snake) {
        if (segment.x === x && segment.y === y) {
            return true;
        }
    }
    
    // Check food
    if (food.x === x && food.y === y) {
        return true;
    }
    
    // Check other dogs
    for (let dog of dogs) {
        if (dog.x === x && dog.y === y) {
            return true;
        }
    }
    
    return false;
}

// Check if position is proper distance from cat (3-10 squares away)
function isProperDistanceFromCat(x, y) {
    const head = snake[0];
    const dx = Math.abs(head.x - x);
    const dy = Math.abs(head.y - y);
    const distance = Math.max(dx, dy); // Use Chebyshev distance (max of x and y difference)
    
    return distance >= 3 && distance <= 10;
}

// Check if position is at least minimum distance from cat (for fallback)
function isMinimumDistanceFromCat(x, y, minDistance) {
    const head = snake[0];
    const dx = Math.abs(head.x - x);
    const dy = Math.abs(head.y - y);
    const distance = Math.max(dx, dy);
    
    return distance >= minDistance;
}

// Draw a cute but menacing dog obstacle
function drawDog(x, y, timer) {
    ctx.save();
    
    // Translate to the correct position
    ctx.translate(x, y);
    
    // Calculate warning threshold once
    const warningFrames = Math.floor(3000 / calculateDelay()); // 3 seconds worth of frames
    
    // Warning flash effect when dog is about to disappear (last 3 seconds)
    const flashEffect = timer < warningFrames && Math.floor(timer / 10) % 2 === 0;
    if (flashEffect) {
        ctx.globalAlpha = 0.5;
    }
    
    // Dog body with brown gradient
    const gradient = ctx.createRadialGradient(GRID_SIZE/2, GRID_SIZE/2, 0, GRID_SIZE/2, GRID_SIZE/2, GRID_SIZE/1.5);
    gradient.addColorStop(0, '#d2691e');
    gradient.addColorStop(0.6, '#a0522d');
    gradient.addColorStop(1, '#8b4513');
    ctx.fillStyle = gradient;
    
    // Dog shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Main body (round)
    ctx.fillRect(2, 4, 16, 12);
    
    // Dog head
    ctx.fillRect(4, 2, 12, 8);
    
    // Dog ears (floppy)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(2, 1, 4, 6);
    ctx.fillRect(14, 1, 4, 6);
    
    // Inner ears
    ctx.fillStyle = '#cd853f';
    ctx.fillRect(3, 2, 2, 4);
    ctx.fillRect(15, 2, 2, 4);
    
    // Dog eyes (alert and watching!)
    ctx.fillStyle = '#000000';
    ctx.fillRect(6, 4, 2, 2);
    ctx.fillRect(12, 4, 2, 2);
    
    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 4, 1, 1);
    ctx.fillRect(12, 4, 1, 1);
    
    // Dog nose (black)
    ctx.fillStyle = '#000000';
    ctx.fillRect(9, 6, 2, 2);
    
    // Dog mouth (slight frown - he's guarding!)
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 8, 1, 1);
    ctx.fillRect(11, 8, 1, 1);
    ctx.fillRect(9, 9, 2, 1);
    
    // Dog legs
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(4, 14, 3, 4);
    ctx.fillRect(7, 14, 3, 4);
    ctx.fillRect(10, 14, 3, 4);
    ctx.fillRect(13, 14, 3, 4);
    
    // Dog tail (wagging - but still dangerous!)
    const tailWag = Math.sin(Date.now() * 0.01) * 2;
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(17 + tailWag, 6, 2, 6);
    
    // Warning indicator when timer is low (last 3 seconds)
    if (timer < warningFrames) {
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(Date.now() * 0.02) * 0.2})`;
        ctx.fillRect(-2, -2, GRID_SIZE + 4, GRID_SIZE + 4);
    }
    
    // Reset shadow and restore context
    ctx.shadowBlur = 0;
    ctx.restore();
}

// Draw a bigger, more detailed bird (20x20 pixels)
function drawBird(x, y) {
    // Add animated glow effect
    const time = Date.now() * 0.003;
    const glowIntensity = 0.7 + 0.3 * Math.sin(time);
    
    ctx.shadowColor = '#ff6b9d';
    ctx.shadowBlur = 8 * glowIntensity;
    
    // Bird body with animated gradient
    const gradient = ctx.createRadialGradient(x + GRID_SIZE/2, y + GRID_SIZE/2, 0, x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE/1.5);
    gradient.addColorStop(0, '#ff6b9d');
    gradient.addColorStop(0.6, '#e6518a');
    gradient.addColorStop(1, '#cc3366');
    ctx.fillStyle = gradient;
    
    // Bigger bird body (rounded)
    ctx.fillRect(x + 7, y + 9, 8, 6);
    ctx.fillRect(x + 8, y + 8, 6, 8);
    ctx.fillRect(x + 9, y + 7, 4, 10);
    
    // Bigger bird head
    ctx.fillRect(x + 5, y + 6, 6, 6);
    ctx.fillRect(x + 6, y + 5, 4, 8);
    ctx.fillRect(x + 7, y + 4, 2, 10);
    
    // Prominent beak
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(x + 3, y + 7, 3, 3);
    ctx.fillRect(x + 2, y + 8, 2, 1);
    
    // Bigger, more expressive eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 7, y + 7, 3, 3);
    
    // Eye shine
    ctx.fillStyle = '#e0f7ff';
    ctx.fillRect(x + 8, y + 7, 1, 1);
    
    // Eye pupil
    ctx.fillStyle = '#000033';
    ctx.fillRect(x + 8, y + 8, 2, 2);
    
    // Wing details with feather texture
    ctx.fillStyle = '#cc3366';
    ctx.fillRect(x + 9, y + 10, 4, 3);
    ctx.fillRect(x + 10, y + 13, 3, 2);
    
    // More detailed tail feathers
    ctx.fillRect(x + 13, y + 10, 4, 2);
    ctx.fillRect(x + 14, y + 12, 4, 2);
    ctx.fillRect(x + 15, y + 14, 3, 2);
    
    // Wing pattern
    ctx.fillStyle = '#b8246f';
    ctx.fillRect(x + 10, y + 11, 2, 1);
    ctx.fillRect(x + 11, y + 12, 2, 1);
    
    // Cute little feet
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(x + 7, y + 16, 1, 2);
    ctx.fillRect(x + 9, y + 16, 1, 2);
    ctx.fillRect(x + 6, y + 17, 3, 1);
    ctx.fillRect(x + 8, y + 17, 3, 1);
    
    // Tiny claws
    ctx.fillStyle = '#cc6600';
    ctx.fillRect(x + 6, y + 18, 1, 1);
    ctx.fillRect(x + 8, y + 18, 1, 1);
    ctx.fillRect(x + 10, y + 18, 1, 1);
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Draw everything on canvas
function draw() {
    // Only draw game elements when actually playing
    if (gameState !== 'playing' && gameState !== 'paused') {
        return;
    }
    
    // Clear canvas with modern gradient background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Subtle grid for modern aesthetic
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COUNT_X; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i <= GRID_COUNT_Y; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_WIDTH, i * GRID_SIZE);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Snake head - Selected cat character!
            drawCat(segment.x * GRID_SIZE, segment.y * GRID_SIZE, selectedCat);
        } else {
            // Snake body with modern gradient and glow
            ctx.shadowColor = isEating ? '#ff6b9d' : '#00d4ff';
            ctx.shadowBlur = isEating ? 8 : 4;
            
            const bodyGradient = ctx.createRadialGradient(
                segment.x * GRID_SIZE + GRID_SIZE/2, 
                segment.y * GRID_SIZE + GRID_SIZE/2, 
                0,
                segment.x * GRID_SIZE + GRID_SIZE/2, 
                segment.y * GRID_SIZE + GRID_SIZE/2, 
                GRID_SIZE/2
            );
            
            if (isEating) {
                bodyGradient.addColorStop(0, '#ff3d6f');
                bodyGradient.addColorStop(0.7, '#d4336f');
                bodyGradient.addColorStop(1, '#b8246f');
            } else {
                bodyGradient.addColorStop(0, '#00b8d4');
                bodyGradient.addColorStop(0.7, '#0088aa');
                bodyGradient.addColorStop(1, '#005577');
            }
            ctx.fillStyle = bodyGradient;
            
            // Slightly bigger, more rounded body segments
            ctx.fillRect(segment.x * GRID_SIZE + 3, segment.y * GRID_SIZE + 3, GRID_SIZE - 6, GRID_SIZE - 6);
            ctx.fillRect(segment.x * GRID_SIZE + 2, segment.y * GRID_SIZE + 4, GRID_SIZE - 4, GRID_SIZE - 8);
            ctx.fillRect(segment.x * GRID_SIZE + 4, segment.y * GRID_SIZE + 2, GRID_SIZE - 8, GRID_SIZE - 4);
            
            ctx.shadowBlur = 0;
        }
    });
    
    // Draw food - Tiny bird!
    drawBird(food.x * GRID_SIZE, food.y * GRID_SIZE);
    
    // Draw dogs
    dogs.forEach(dog => {
        drawDog(dog.x * GRID_SIZE, dog.y * GRID_SIZE, dog.timer);
    });
    
    // Draw tuna cans
    tunaCans.forEach(tuna => {
        drawTunaCan(tuna.x * GRID_SIZE, tuna.y * GRID_SIZE, tuna.timer);
    });
}

// Animation loop for visual effects
function animate() {
    if (gameState === 'playing' || gameState === 'paused') {
        draw();
    } else if (gameState === 'menu') {
        // Draw a simple background for menu state
        drawMenuBackground();
    }
    requestAnimationFrame(animate);
}

// Draw background for menu state
function drawMenuBackground() {
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Subtle grid for modern aesthetic
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COUNT_X; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i <= GRID_COUNT_Y; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_WIDTH, i * GRID_SIZE);
        ctx.stroke();
    }
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, starting initialization'); // Debug log
    
    try {
        init();
        animate();
        
        // Always show tap to start first
        gameState = 'menu';
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            console.log('Calling showTapToStart'); // Debug log
            try {
                showTapToStart();
            } catch (error) {
                console.error('Error in showTapToStart:', error);
                createFallbackButton();
            }
            
            // Fallback: If overlay doesn't work, add button to canvas container
            setTimeout(() => {
                if (!document.querySelector('#tapToStartBtn') && !document.querySelector('#fallbackStartBtn')) {
                    console.log('Creating fallback button');
                    createFallbackButton();
                }
            }, 500);
        }, 100);
    } catch (error) {
        console.error('Initialization error:', error);
        // Force create fallback button if everything fails
        setTimeout(() => {
            createFallbackButton();
        }, 1000);
    }
});

// Prevent arrow keys from scrolling the page
window.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
}); 