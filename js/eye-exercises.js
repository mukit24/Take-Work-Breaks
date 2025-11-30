// Eye Exercises Data
const eyeExercises = {
    palming: {
        name: "Palming Relaxation",
        description: "Close your eyes and cover them with your palms to relax eye muscles",
        type: "Instruction-based",
        duration: 60
    },
    figureEight: {
        name: "Figure Eight Tracing",
        description: "Follow the animated figure eight pattern with your eyes",
        type: "Screen-based",
        duration: 60
    },
    focusSwitching: {
        name: "Near-Far Focus",
        description: "Switch focus between near and distant objects in your environment",
        type: "Instruction-based", 
        duration: 60
    },
    directional: {
        name: "Directional Movements",
        description: "Move your eyes in different directions to strengthen eye muscles",
        type: "Screen-based",
        duration: 60
    },
    zooming: {
        name: "Zooming Exercise",
        description: "Follow the expanding and contracting circle with your eyes",
        type: "Screen-based",
        duration: 60
    },
    blinking: {
        name: "Blinking Exercise", 
        description: "Practice conscious blinking to refresh your eyes and prevent dryness",
        type: "Instruction-based",
        duration: 60
    }
};

// App State
let currentExercise = null;
let isRunning = false;
let isPaused = false;
let timeLeft = 60; // 1 minute default
let exerciseInterval = null;

// DOM Elements
const elements = {
    exerciseGrid: document.getElementById('exerciseGrid'),
    exerciseInterface: document.getElementById('exerciseInterface'),
    exerciseAnimation: document.getElementById('exerciseAnimation'),
    animationContainer: document.getElementById('animationContainer'),
    exerciseInstruction: document.getElementById('exerciseInstruction'),
    exerciseTimer: document.getElementById('exerciseTimer'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    backToExercises: document.getElementById('backToExercises')
};

// Initialize the app
function init() {
    renderExerciseGrid();
    setupEventListeners();
    
    // Ensure exercise interface is hidden initially
    elements.exerciseInterface.hidden = true;
    elements.exerciseGrid.hidden = false;
}

// Render exercise selection grid
function renderExerciseGrid() {
    elements.exerciseGrid.innerHTML = Object.entries(eyeExercises).map(([key, exercise]) => `
        <div class="exercise-card" data-exercise="${key}">
            <h3 class="exercise-name">${exercise.name}</h3>
            <p class="exercise-desc">${exercise.description}</p>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Exercise selection
    elements.exerciseGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.exercise-card');
        if (card) {
            const exercise = card.dataset.exercise;
            selectExercise(exercise);
        }
    });

    // Control buttons
    elements.startBtn.addEventListener('click', startExercise);
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.resetBtn.addEventListener('click', resetExercise);
    elements.backToExercises.addEventListener('click', showExerciseSelector);
}

// Select an exercise
function selectExercise(exercise) {
    currentExercise = exercise;
    showExerciseInterface();
    resetExercise();

    // Scroll to exercise interface
    setTimeout(() => {
        elements.exerciseInterface.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        elements.startBtn.focus();
    }, 100);
}

// Show exercise interface
function showExerciseInterface() {
    elements.exerciseGrid.hidden = true;
    elements.exerciseInterface.hidden = false;
}

function showExerciseSelector() {
    elements.exerciseGrid.hidden = false;
    elements.exerciseInterface.hidden = true;
    stopExercise();
    
    // Clear any completion overlay
    const existingOverlay = elements.exerciseAnimation.querySelector('.completion-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
}

// Start exercise
function startExercise() {
    if (isRunning) return;

    isRunning = true;
    isPaused = false;
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;

    // Initialize exercise
    setupExercise();
    updateTimerDisplay();

    // Start the timer
    exerciseInterval = setInterval(() => {
        if (!isRunning || isPaused) return;

        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            completeExercise();
        }
    }, 1000);
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;
    elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

// Reset exercise
function resetExercise() {
    stopExercise();
    timeLeft = 60;
    updateTimerDisplay();
    clearAnimationContainer();
    elements.exerciseInstruction.textContent = 'Get Ready';
    
    // Clear any completion overlay that might be lingering
    const existingOverlay = elements.exerciseAnimation.querySelector('.completion-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
}


// Stop exercise
function stopExercise() {
    isRunning = false;
    isPaused = false;
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';

    if (exerciseInterval) {
        clearInterval(exerciseInterval);
        exerciseInterval = null;
    }
}

// Setup exercise based on type
function setupExercise() {
    const exercise = eyeExercises[currentExercise];
    
    clearAnimationContainer();
    
    if (exercise.type === "Screen-based") {
        setupScreenBasedExercise();
    } else {
        setupInstructionBasedExercise();
    }
}

// Setup screen-based exercises
function setupScreenBasedExercise() {
    switch (currentExercise) {
        case 'figureEight':
            elements.exerciseInstruction.textContent = "Follow the dot along the figure eight path";
            createFigureEightAnimation();
            break;
        case 'directional':
            elements.exerciseInstruction.textContent = "Follow the dot as it moves around";
            createDirectionalAnimation();
            break;
        case 'zooming':
            elements.exerciseInstruction.textContent = "Follow the expanding and contracting circle";
            createZoomingAnimation();
            break;
    }
}

// Setup instruction-based exercises
function setupInstructionBasedExercise() {
    switch (currentExercise) {
        case 'palming':
            elements.exerciseInstruction.textContent = "Rub your hands together to warm them up";
            createPalmingAnimation();
            break;
        case 'focusSwitching':
            elements.exerciseInstruction.textContent = "Find a near object and a distant object";
            createFocusSwitchingInstruction();
            break;
        case 'blinking':
            elements.exerciseInstruction.textContent = "Get ready to practice conscious blinking";
            createBlinkingAnimation();
            break;
    }
}

// Screen-based exercise animations
function createFigureEightAnimation() {
    const container = elements.animationContainer;
    
    // Create path
    const path = document.createElement('div');
    path.className = 'eye-path';
    path.style.width = '300px';
    path.style.height = '150px';
    container.appendChild(path);

    // Create moving target
    const target = document.createElement('div');
    target.className = 'eye-target moving';
    container.appendChild(target);

    // Animate along figure eight path
    let progress = 0;
    const animation = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(animation);
            return;
        }

        progress = (progress + 0.01) % 1;
        const x = Math.sin(progress * Math.PI * 2) * 120;
        const y = Math.sin(progress * Math.PI * 4) * 60;
        
        target.style.transform = `translate(${x}px, ${y}px)`;
    }, 50);
}

function createDirectionalAnimation() {
    const container = elements.animationContainer;
    const target = document.createElement('div');
    target.className = 'eye-target';
    container.appendChild(target);

    const positions = [
        { x: 0, y: -100 },   // Up
        { x: 100, y: 0 },    // Right
        { x: 0, y: 100 },    // Down
        { x: -100, y: 0 },   // Left
        { x: -70, y: -70 },  // Top-left
        { x: 70, y: -70 },   // Top-right
        { x: 70, y: 70 },    // Bottom-right
        { x: -70, y: 70 }    // Bottom-left
    ];

    let currentPos = 0;
    
    const moveInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(moveInterval);
            return;
        }

        const pos = positions[currentPos];
        target.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        
        currentPos = (currentPos + 1) % positions.length;
    }, 2000);
}

function createZoomingAnimation() {
    const container = elements.animationContainer;
    const circle = document.createElement('div');
    circle.className = 'eye-target';
    circle.style.borderRadius = '50%';
    circle.style.background = 'transparent';
    circle.style.border = '4px solid #4299e1';
    container.appendChild(circle);

    let scale = 0.5;
    let growing = true;
    
    const zoomInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(zoomInterval);
            return;
        }

        if (growing) {
            scale += 0.03;
            if (scale >= 1.5) growing = false;
        } else {
            scale -= 0.03;
            if (scale <= 0.5) growing = true;
        }
        
        circle.style.width = `${scale * 80}px`;
        circle.style.height = `${scale * 80}px`;
    }, 80);
}

// Instruction-based exercise displays
function createPalmingAnimation() {
    const container = elements.animationContainer;
    const overlay = document.createElement('div');
    overlay.className = 'palming-overlay';
    overlay.innerHTML = `
        <div class="palming-hands">👐</div>
        <div class="palming-text">Close your eyes and cover them with your warm palms</div>
    `;
    container.appendChild(overlay);

    // Update instruction after 5 seconds
    setTimeout(() => {
        if (isRunning && !isPaused) {
            elements.exerciseInstruction.textContent = "Keep your eyes closed and relaxed";
        }
    }, 5000);
}

function createFocusSwitchingInstruction() {
    const container = elements.animationContainer;
    const instruction = document.createElement('div');
    instruction.className = 'instruction-text';
    instruction.innerHTML = `
        <p>1. Focus on an object close to you (like your finger)</p>
        <p>2. Then focus on something distant (across the room)</p>
        <p>3. Alternate between near and far every few seconds</p>
    `;
    container.appendChild(instruction);

    // Rotate instructions
    const instructions = [
        "Focus on a nearby object",
        "Now focus on something far away",
        "Keep alternating your focus",
        "Breathe deeply and relax your eyes"
    ];
    
    let instructionIndex = 0;
    const instructionInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(instructionInterval);
            return;
        }
        
        instructionIndex = (instructionIndex + 1) % instructions.length;
        elements.exerciseInstruction.textContent = instructions[instructionIndex];
    }, 8000);
}

function createBlinkingAnimation() {
    const container = elements.animationContainer;
    const eye = document.createElement('div');
    eye.className = 'blinking-eye';
    eye.textContent = '👁️';
    container.appendChild(eye);

    // Blink instruction rhythm
    const blinkInterval = setInterval(() => {
        if (!isRunning || isPaused) return;
        
        elements.exerciseInstruction.textContent = "Blink slowly and consciously";
        
        setTimeout(() => {
            if (isRunning && !isPaused) {
                elements.exerciseInstruction.textContent = "Keep your eyes open and relaxed";
            }
        }, 2000);
    }, 4000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    elements.exerciseTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Clear animation container
function clearAnimationContainer() {
    elements.animationContainer.innerHTML = '';
}

// Complete exercise
function completeExercise() {
    stopExercise();
    showCompletionMessage();
    
    // Wait 3 seconds then reset and go back to selector
    setTimeout(() => {
        resetExercise();
        showExerciseSelector();
    }, 3000);
}


// Show completion message
function showCompletionMessage() {
    // Clear any existing completion message first
    const existingOverlay = elements.exerciseAnimation.querySelector('.completion-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'completion-overlay';
    overlay.innerHTML = `
        <div class="completion-message">✓ Exercise Complete!</div>
        <div class="completion-subtitle">Great job taking care of your eyes</div>
    `;
    elements.exerciseAnimation.appendChild(overlay);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);