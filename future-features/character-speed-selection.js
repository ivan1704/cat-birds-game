// Future Features: Character and Speed Selection
// This file contains the character selection and speed selection functionality
// that was removed from the main game flow for faster game start.

// Multi-step welcome flow
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

// Step 1: Character Selection
function showStep1_CharacterSelection() {
    gameMessage.innerHTML = `
        <div class="welcome-container step-container">
            <div class="step-indicator">
                <div class="step-dot active"></div>
                <div class="step-dot"></div>
                <div class="step-dot"></div>
            </div>
            
            <div class="welcome-header">
                <h2 class="welcome-title">
                    <span class="title-icon">🐱</span>
                    Choose Your Cat
                </h2>
                <p class="welcome-subtitle">Pick the perfect feline friend for your adventure</p>
            </div>
            
            <div class="cat-selection-section">
                <div class="cat-grid">
                    ${Object.entries(catTypes).map(([type, info]) => `
                        <div class="cat-option ${selectedCat === type ? 'selected' : ''}" data-cat="${type}">
                            <div class="cat-preview" id="preview-${type}"></div>
                            <div class="cat-info">
                                <div class="cat-name">${info.name}</div>
                            </div>
                            <div class="selection-indicator">
                                <div class="check-icon">✓</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="step-navigation">
                <button id="nextStepBtn" class="step-btn next-btn" disabled>
                    <span class="btn-icon">→</span>
                    <span class="btn-text">Next: Choose Speed</span>
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

// Step 2: Speed Selection
function showStep2_SpeedSelection() {
    gameMessage.innerHTML = `
        <div class="welcome-container step-container">
            <div class="step-indicator">
                <div class="step-dot completed"></div>
                <div class="step-dot active"></div>
                <div class="step-dot"></div>
            </div>
            
            <div class="welcome-header">
                <h2 class="welcome-title">
                    <span class="title-icon">⚡</span>
                    Pick Your Pace
                </h2>
                <p class="welcome-subtitle">How fast should ${catTypes[selectedCat].name} chase those birds?</p>
            </div>
            
            <div class="speed-selection-section">
                <div class="speed-presets">
                    <button class="preset-btn ${currentSpeed <= 3 ? 'active' : ''}" data-speed="2">
                        <span class="preset-icon">😴</span>
                        <span class="preset-name">Best Sleepy Cats</span>
                        <span class="preset-desc">Take your time, enjoy the journey</span>
                    </button>
                    <button class="preset-btn ${currentSpeed >= 4 && currentSpeed <= 6 ? 'active' : ''}" data-speed="5">
                        <span class="preset-icon">😸</span>
                        <span class="preset-name">Playful Cats</span>
                        <span class="preset-desc">Perfect balance of fun and challenge</span>
                    </button>
                    <button class="preset-btn ${currentSpeed >= 7 ? 'active' : ''}" data-speed="8">
                        <span class="preset-icon">😼</span>
                        <span class="preset-name">Hungry Cats</span>
                        <span class="preset-desc">Fast-paced action for the brave</span>
                    </button>
                </div>
                
                <div class="speed-slider-container">
                    <label for="menuSpeedSlider">Fine-tune: <span id="menuSpeedValue">${currentSpeed}</span>/10</label>
                    <input type="range" id="menuSpeedSlider" min="1" max="10" value="${currentSpeed}" class="slider">
                    <div class="speed-preview">
                        <div class="speed-indicator" style="animation-duration: ${(11 - currentSpeed) * 0.2}s"></div>
                    </div>
                </div>
            </div>
            
            <div class="step-navigation">
                <button id="prevStepBtn" class="step-btn prev-btn">
                    <span class="btn-icon">←</span>
                    <span class="btn-text">Back to Cats</span>
                </button>
                <button id="nextStepBtn" class="step-btn next-btn">
                    <span class="btn-icon">→</span>
                    <span class="btn-text">Next: How to Play</span>
                </button>
            </div>
        </div>
    `;
    
    setupStep2SpeedSelection();
}

// Step 3: Instructions
function showStep3_Instructions() {
    gameMessage.innerHTML = `
        <div class="welcome-container step-container">
            <div class="step-indicator">
                <div class="step-dot completed"></div>
                <div class="step-dot completed"></div>
                <div class="step-dot active"></div>
            </div>
            
            <div class="welcome-header">
                <h2 class="welcome-title">
                    <span class="title-icon">📚</span>
                    How to Play
                </h2>
                <p class="welcome-subtitle">Get ready for ${catTypes[selectedCat].name}'s adventure!</p>
            </div>
            
            <div class="instructions-section">
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-icon-large">🎯</div>
                        <h4>Objective</h4>
                        <p>Guide ${catTypes[selectedCat].name} to catch birds and grow longer while avoiding obstacles</p>
                    </div>
                    <div class="info-item">
                        <div class="info-icon-large">🕹️</div>
                        <h4>Controls</h4>
                        <p>Use arrow keys, WASD, or swipe gestures to move your cat</p>
                    </div>
                    <div class="info-item">
                        <div class="info-icon-large">🐶</div>
                        <h4>Obstacles</h4>
                        <p>Dogs guard birds for 10 seconds - plan your route carefully!</p>
                    </div>
                    <div class="info-item">
                        <div class="info-icon-large">🥫</div>
                        <h4>Bonus Items</h4>
                        <p>Tuna cans give 50 points but disappear quickly - risk vs reward!</p>
                    </div>
                </div>
            </div>
            
            <div class="step-navigation">
                <button id="prevStepBtn" class="step-btn prev-btn">
                    <span class="btn-icon">←</span>
                    <span class="btn-text">Back to Speed</span>
                </button>
                <button id="startBtn" class="step-btn start-btn">
                    <span class="btn-icon">🎮</span>
                    <span class="btn-text">Start Adventure!</span>
                </button>
            </div>
        </div>
    `;
    
    setupStep3Instructions();
}

// Step 1: Setup character selection
function setupStep1CatSelection() {
    const catOptions = gameMessage.querySelectorAll('.cat-option');
    const nextBtn = gameMessage.querySelector('#nextStepBtn');
    
    catOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selection from all options
            catOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selection to clicked option
            option.classList.add('selected');
            
            selectedCat = option.dataset.cat;
            localStorage.setItem('selectedCat', selectedCat);
            
            // Enable next button
            nextBtn.disabled = false;
            hapticFeedback([5]);
            
            // Update text
            nextBtn.querySelector('.btn-text').textContent = 'Next: Choose Speed';
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

// Step 2: Setup speed selection
function setupStep2SpeedSelection() {
    const speedSlider = gameMessage.querySelector('#menuSpeedSlider');
    const speedValue = gameMessage.querySelector('#menuSpeedValue');
    const presetBtns = gameMessage.querySelectorAll('.preset-btn');
    const prevBtn = gameMessage.querySelector('#prevStepBtn');
    const nextBtn = gameMessage.querySelector('#nextStepBtn');
    
    // Update speed display
    function updateSpeedDisplay() {
        speedValue.textContent = currentSpeed;
        
        // Update preset button states
        presetBtns.forEach(btn => btn.classList.remove('active'));
        if (currentSpeed <= 3) {
            presetBtns[0].classList.add('active');
        } else if (currentSpeed >= 4 && currentSpeed <= 6) {
            presetBtns[1].classList.add('active');
        } else if (currentSpeed >= 7) {
            presetBtns[2].classList.add('active');
        }
        
        // Update speed preview animation
        const speedIndicator = gameMessage.querySelector('.speed-indicator');
        if (speedIndicator) {
            speedIndicator.style.animationDuration = `${(11 - currentSpeed) * 0.2}s`;
        }
    }
    
    // Speed slider
    speedSlider.addEventListener('input', (e) => {
        currentSpeed = parseInt(e.target.value);
        localStorage.setItem('gameSpeed', currentSpeed);
        updateSpeedDisplay();
        hapticFeedback([3]);
    });
    
    // Preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentSpeed = parseInt(btn.dataset.speed);
            speedSlider.value = currentSpeed;
            localStorage.setItem('gameSpeed', currentSpeed);
            updateSpeedDisplay();
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
    
    updateSpeedDisplay();
}

// Step 3: Setup instructions
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