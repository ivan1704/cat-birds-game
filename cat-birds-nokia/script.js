// Game variables
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
const GRID_SIZE = 12;
const CANVAS_WIDTH = 240;
const CANVAS_HEIGHT = 180;
const GRID_COUNT_X = CANVAS_WIDTH / GRID_SIZE;
const GRID_COUNT_Y = CANVAS_HEIGHT / GRID_SIZE;

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let direction = {x: 0, y: 0};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let currentSpeed = 5;
let baseDelay = 150;

// Initialize game
function init() {
    updateHighScore();
    generateFood();
    draw();
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyPress);
    speedSlider.addEventListener('input', updateSpeed);
    
    // Make canvas focusable for better keyboard handling
    canvas.tabIndex = 1;
    canvas.focus();
    
    // Initialize speed display
    updateSpeedDisplay();
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
        
        // Note: Speed is now controlled by the slider, not by score
    }
    
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

// Check if snake collides with itself (no wall collision anymore!)
function checkCollision() {
    const head = snake[0];
    
    // Self collision only - walls no longer end the game
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
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
        if (event.code === 'Space') {
            startGame();
        }
        return;
    }
    
    if (gameState === 'gameOver') {
        if (event.code === 'Space') {
            showMenu();
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
    showOverlay('Welcome to Cat & Birds!', 'Use arrow keys to control the cat<br>Catch the birds to grow and increase your score', 'Start Game');
}

// Show overlay with message
function showOverlay(title, message, buttonText) {
    gameMessage.innerHTML = `
        <h2>${title}</h2>
        <p>${message}</p>
        <button id="startBtn" class="game-btn">${buttonText}</button>
    `;
    
    // Re-attach event listener to new button
    const newBtn = gameMessage.querySelector('#startBtn');
    newBtn.addEventListener('click', () => {
        if (gameState === 'gameOver' || gameState === 'menu') {
            startGame();
        } else if (gameState === 'paused') {
            togglePause();
        }
    });
    
    gameOverlay.classList.remove('hidden');
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
    currentSpeed = parseInt(speedSlider.value);
    updateSpeedDisplay();
    
    // If game is running, restart the loop with new speed
    if (gameState === 'playing') {
        clearInterval(gameLoop);
        const delay = calculateDelay();
        gameLoop = setInterval(update, delay);
    }
}

// Update speed display
function updateSpeedDisplay() {
    speedValueElement.textContent = currentSpeed;
}

// Draw a tiny cat (12x12 pixels)
function drawCat(x, y) {
    ctx.fillStyle = '#9ACD32';
    
    // Cat face outline
    ctx.fillRect(x + 2, y + 3, 8, 7);
    
    // Cat ears
    ctx.fillRect(x + 2, y + 1, 2, 3);
    ctx.fillRect(x + 8, y + 1, 2, 3);
    
    // Inner ears
    ctx.fillStyle = '#1a2f1a';
    ctx.fillRect(x + 3, y + 2, 1, 1);
    ctx.fillRect(x + 8, y + 2, 1, 1);
    
    // Eyes
    ctx.fillStyle = '#1a2f1a';
    ctx.fillRect(x + 4, y + 5, 1, 1);
    ctx.fillRect(x + 7, y + 5, 1, 1);
    
    // Nose
    ctx.fillRect(x + 5, y + 6, 2, 1);
    
    // Mouth
    ctx.fillRect(x + 5, y + 7, 1, 1);
    ctx.fillRect(x + 6, y + 7, 1, 1);
    ctx.fillRect(x + 4, y + 8, 1, 1);
    ctx.fillRect(x + 7, y + 8, 1, 1);
}

// Draw a tiny bird (12x12 pixels)
function drawBird(x, y) {
    ctx.fillStyle = '#9ACD32';
    
    // Bird body
    ctx.fillRect(x + 4, y + 5, 4, 4);
    
    // Bird head
    ctx.fillRect(x + 3, y + 3, 3, 3);
    
    // Beak
    ctx.fillRect(x + 2, y + 4, 1, 1);
    
    // Eye
    ctx.fillStyle = '#1a2f1a';
    ctx.fillRect(x + 4, y + 4, 1, 1);
    
    // Wing details
    ctx.fillStyle = '#9ACD32';
    ctx.fillRect(x + 5, y + 6, 2, 1);
    ctx.fillRect(x + 6, y + 7, 2, 1);
    
    // Tail feathers
    ctx.fillRect(x + 8, y + 6, 2, 1);
    ctx.fillRect(x + 9, y + 7, 2, 1);
    
    // Feet
    ctx.fillRect(x + 4, y + 9, 1, 1);
    ctx.fillRect(x + 6, y + 9, 1, 1);
}

// Draw everything on canvas
function draw() {
    // Clear canvas with Nokia LCD background
    ctx.fillStyle = '#1a2f1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // No grid for authentic Nokia LCD look
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Snake head - Tiny cat!
            drawCat(segment.x * GRID_SIZE, segment.y * GRID_SIZE);
        } else {
            // Snake body - Nokia style blocks
            ctx.fillStyle = '#9ACD32';
            ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
    });
    
    // Draw food - Tiny bird!
    drawBird(food.x * GRID_SIZE, food.y * GRID_SIZE);
}

// Animation loop for visual effects
function animate() {
    if (gameState === 'playing' || gameState === 'paused') {
        draw();
    }
    requestAnimationFrame(animate);
}

// Initialize the game when page loads
window.addEventListener('load', () => {
    init();
    animate();
});

// Prevent arrow keys from scrolling the page
window.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }
}); 