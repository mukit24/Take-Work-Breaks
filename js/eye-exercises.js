// Eye Exercises Data - Updated for all instruction-based exercises
const eyeExercises = {
    palming: {
        name: "Palming Relaxation",
        description: "Relieve eye strain and reduce fatigue by warming and relaxing your eye muscles",
        type: "Instruction-based",
        instructionType: "two-steps", // Two alternating steps
        steps: [
            {
                instruction: "Rub your hands together vigorously",
                duration: 10, // First 10 seconds
                voice: "assets/sounds/rub-hands.mp3"
            },
            {
                instruction: "Close eyes and cup palms gently over them",
                duration: 5, // Next 5 seconds
                voice: "assets/sounds/close-eyes-palm.mp3"
            }
        ]
    },
    figureEight: {
        name: "Figure Eight Tracing",
        description: "Improve eye coordination and flexibility while reducing digital screen fatigue",
        type: "Screen-based",
    },
    focusSwitching: {
        name: "Near-Far Focus",
        description: "Prevent eye strain from prolonged screen use by exercising your focusing ability",
        type: "Instruction-based",
        instructionType: "two-steps", // Two alternating steps
        steps: [
            {
                instruction: "Focus on a distant object",
                duration: 10,
                voice: "assets/sounds/focus-far.mp3"
            },
            {
                instruction: "Focus on a nearby object",
                duration: 10,
                voice: "assets/sounds/focus-near.mp3"
            }
        ]
    },
    directional: {
        name: "Directional Movements",
        description: "Strengthen eye muscles and increase blood circulation to reduce tension",
        type: "Screen-based",
    },
    zooming: {
        name: "Zooming Exercise",
        description: "Enhance visual flexibility and prevent accommodative spasms from screen work",
        type: "Screen-based",
    },
    blinking: {
        name: "Blinking Exercise",
        description: "Refresh tear film and prevent dry eyes caused by reduced blinking at screens",
        type: "Instruction-based",
        instructionType: "two-steps", // Changed from "single-step" to "two-steps"
        steps: [
            {
                instruction: "Close your eyes gently",
                duration: 3, // Close eyes for 3 seconds
                voice: "assets/sounds/blink-close.mp3"
            },
            {
                instruction: "Open eyes and blink normally",
                duration: 2, // Open and blink for 2 seconds
                voice: "assets/sounds/blink-open.mp3"
            }
        ]
    }
};

// App State
let currentExercise = null;
let isRunning = false;
let isPaused = false;
let timeLeft = 0;
let exerciseInterval = null;
let useVoice = false;
let voiceAudio = null;
let currentStepIndex = 0;
let sessionDuration = 60;

// DOM Elements
let elements = {};

// Initialize the app
function init() {
    elements = {
        exerciseGrid: document.getElementById('exerciseGrid'),
        exerciseInterface: document.getElementById('exerciseInterface'),
        exerciseAnimation: document.getElementById('exerciseAnimation'),
        animationContainer: document.getElementById('animationContainer'),
        exerciseInstruction: document.getElementById('exerciseInstruction'),
        exerciseTimer: document.getElementById('exerciseTimer'),
        startBtn: document.getElementById('startBtn'),
        pauseBtn: document.getElementById('pauseBtn'),
        resetBtn: document.getElementById('resetBtn'),
        backToExercises: document.getElementById('backToExercises'),
        sessionLength: document.getElementById('sessionLength')
    };

    renderExerciseGrid();
    setupEventListeners();

    // Ensure interface is hidden initially
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

    // Session duration
    elements.sessionLength.addEventListener('change', (e) => {
        sessionDuration = parseInt(e.target.value);
        if (!isRunning) {
            timeLeft = sessionDuration;
            updateTimerDisplay();
        }
    });
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
    }, 100);
}

// Show exercise interface
function showExerciseInterface() {
    elements.exerciseGrid.hidden = true;
    elements.exerciseInterface.hidden = false;

    // Setup the initial display
    setupInitialDisplay();
}

// Setup initial display for exercise
function setupInitialDisplay() {
    clearAnimationContainer();
    const exercise = eyeExercises[currentExercise];
    
    if (exercise.type === "Instruction-based") {
        // Create instruction layout - update step descriptions to show relative timing
        let layoutHTML = '';
        
        if (currentExercise === 'palming') {
            layoutHTML = `
                <div class="instruction-layout">
                    <div class="instruction-image">
                        <img src="assets/images/palming-exercise.jpg" alt="Palming Exercise Demonstration">
                    </div>
                    <div class="instruction-content">
                        <h3>${exercise.name}</h3>
                        <div class="instructions-list">
                            ${exercise.steps.map((step, index) => `
                                <div class="instruction-step">
                                    <span class="step-number">${index + 1}</span>
                                    <span class="step-text">${step.instruction} (${step.duration}s each)</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="voice-control">
                            <label class="voice-toggle">
                                <input type="checkbox" id="voiceToggle">
                                <span class="checkmark"></span>
                                Enable Voice Guidance
                            </label>
                        </div>
                    </div>
                </div>
            `;
        } else if (currentExercise === 'focusSwitching') {
            layoutHTML = `
                <div class="instruction-layout">
                    <div class="instruction-image">
                        <img src="assets/images/near-far-exercise.jpg" alt="Near-Far Focus Exercise">
                    </div>
                    <div class="instruction-content">
                        <h3>${exercise.name}</h3>
                        <div class="instructions-list">
                            ${exercise.steps.map((step, index) => `
                                <div class="instruction-step">
                                    <span class="step-number">${index + 1}</span>
                                    <span class="step-text">${step.instruction} (${step.duration}s each)</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="voice-control">
                            <label class="voice-toggle">
                                <input type="checkbox" id="voiceToggle">
                                <span class="checkmark"></span>
                                Enable Voice Guidance
                            </label>
                        </div>
                    </div>
                </div>
            `;
        } else if (currentExercise === 'blinking') {
            layoutHTML = `
                <div class="instruction-layout">
                    <div class="instruction-image">
                        <img src="assets/images/blinking-exercise.jpg" alt="Blinking Exercise">
                    </div>
                    <div class="instruction-content">
                        <h3>${exercise.name}</h3>
                        <div class="instructions-list">
                            ${exercise.steps.map((step, index) => `
                                <div class="instruction-step">
                                    <span class="step-number">${index + 1}</span>
                                    <span class="step-text">${step.instruction} (${step.duration}s each)</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="voice-control">
                            <label class="voice-toggle">
                                <input type="checkbox" id="voiceToggle">
                                <span class="checkmark"></span>
                                Enable Voice Guidance
                            </label>
                        </div>
                    </div>
                </div>
            `;
        }
        
        elements.animationContainer.innerHTML = layoutHTML;
        
        // Set voice toggle event listener
        const voiceToggle = document.getElementById('voiceToggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('change', (e) => {
                useVoice = e.target.checked;
            });
        }
        
        // Set initial display text
        elements.exerciseInstruction.textContent = "";
        elements.exerciseTimer.textContent = formatTime(sessionDuration);
        
    } else {
        // For screen-based exercises
        setupExerciseDisplay();
    }
}

// Helper function to format time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Setup display for screen-based exercises
function setupExerciseDisplay() {
    const exercise = eyeExercises[currentExercise];
    timeLeft = sessionDuration;
    updateTimerDisplay();
    elements.exerciseInstruction.textContent = "Get Ready";

    setupScreenBasedExercise();
}

// Show exercise selector
function showExerciseSelector() {
    elements.exerciseGrid.hidden = false;
    elements.exerciseInterface.hidden = true;
    stopExercise();
    hideCompletionMessage();
    
    // Reset session duration to 1 minute when leaving exercise
    sessionDuration = 60;
    elements.sessionLength.value = "60";
}

// Start exercise
function startExercise() {
    if (isRunning) return;

    isRunning = true;
    isPaused = false;
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    
    // Hide session controls when exercise is running
    document.querySelector('.session-controls-group').classList.add('running');

    const exercise = eyeExercises[currentExercise];
    timeLeft = sessionDuration; // Always use sessionDuration
    
    if (exercise.type === "Instruction-based") {
        // For instruction-based exercises, hide animation container
        clearAnimationContainer();
        elements.animationContainer.style.display = "none";
        
        // Start with first step
        currentStepIndex = 0;
        updateInstructionStep();
        
        // Play first voice if enabled
        if (useVoice && exercise.steps[currentStepIndex].voice) {
            playVoice(exercise.steps[currentStepIndex].voice);
        }
    } else {
        // For screen-based exercises, keep animation container visible
        elements.animationContainer.style.display = "flex";
        timeLeft = sessionDuration; // Ensure sessionDuration is used
        updateTimerDisplay();
        setupScreenBasedExercise();
    }
    
    updateTimerDisplay();
    
    // Start the timer
    exerciseInterval = setInterval(() => {
        if (!isRunning || isPaused) return;

        timeLeft--;
        updateTimerDisplay();
        
        // Handle instruction step changes for instruction-based exercises
        if (eyeExercises[currentExercise].type === "Instruction-based") {
            handleInstructionStepChange();
        }

        if (timeLeft <= 0) {
            completeExercise();
        }
    }, 1000);
}

// Handle instruction step changes based on time
function handleInstructionStepChange() {
    const exercise = eyeExercises[currentExercise];
    const timeElapsed = sessionDuration - timeLeft; // Use sessionDuration
    
    if (exercise.instructionType === "two-steps") {
        // For two-step exercises
        const totalStepDuration = exercise.steps[0].duration + exercise.steps[1].duration;
        const timeInCurrentCycle = timeElapsed % totalStepDuration;
        
        let newStepIndex;
        if (timeInCurrentCycle < exercise.steps[0].duration) {
            newStepIndex = 0;
        } else {
            newStepIndex = 1;
        }
        
        // If step changed, update instruction and play voice
        if (newStepIndex !== currentStepIndex) {
            currentStepIndex = newStepIndex;
            updateInstructionStep();
            
            if (useVoice && exercise.steps[currentStepIndex].voice) {
                playVoice(exercise.steps[currentStepIndex].voice);
            }
        }
    }
}

// Update instruction step display
function updateInstructionStep() {
    const exercise = eyeExercises[currentExercise];
    const step = exercise.steps[currentStepIndex];
    elements.exerciseInstruction.textContent = step.instruction;
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;
    elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';

    if (isPaused) {
        stopVoice();
    } else if (eyeExercises[currentExercise].type === "Instruction-based" && useVoice) {
        // Resume voice for current step
        const exercise = eyeExercises[currentExercise];
        const step = exercise.steps[currentStepIndex];
        if (step && step.voice) {
            playVoice(step.voice);
        }
    }
}

// Reset exercise
function resetExercise() {
    stopExercise();
    
    // Reset session duration to 1 minute
    sessionDuration = 60;
    elements.sessionLength.value = "60";
    
    timeLeft = sessionDuration;
    currentStepIndex = 0;
    useVoice = false;
    stopVoice();
    hideCompletionMessage();
    
    // Reset to initial display
    setupInitialDisplay();
    
    // Reset animation container display
    elements.animationContainer.style.display = "flex";
    
    // Show session controls again
    document.querySelector('.session-controls-group').classList.remove('running');
    
    // Reset voice toggle if exists
    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) {
        voiceToggle.checked = false;
    }
    
    // Update timer display with current session duration
    updateTimerDisplay();
}

// Stop exercise
function stopExercise() {
    isRunning = false;
    isPaused = false;
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';
    stopVoice();

    if (exerciseInterval) {
        clearInterval(exerciseInterval);
        exerciseInterval = null;
    }
}

// Play voice audio
function playVoice(audioPath) {
    if (voiceAudio) {
        voiceAudio.pause();
        voiceAudio.currentTime = 0;
    }

    voiceAudio = new Audio(audioPath);
    voiceAudio.volume = 1.0;
    voiceAudio.play().catch(e => {
        console.log("Voice playback failed:", e);
    });
}

// Stop voice audio
function stopVoice() {
    if (voiceAudio) {
        voiceAudio.pause();
        voiceAudio.currentTime = 0;
    }
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    elements.exerciseTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Complete exercise
function completeExercise() {
    stopExercise();
    showCompletionMessage();
    
    // Wait 3 seconds then reset to initial phase
    setTimeout(() => {
        hideCompletionMessage();
        resetExercise(); // This will reset dropdown to 1 minute
    }, 3000);
}


// Show completion message
function showCompletionMessage() {
    hideCompletionMessage();

    const overlay = document.createElement('div');
    overlay.className = 'completion-overlay';
    overlay.innerHTML = `
        <div class="completion-message">✓ Exercise Complete!</div>
        <div class="completion-subtitle">Great job taking care of your eyes</div>
    `;
    elements.exerciseAnimation.appendChild(overlay);
}

// Hide completion message
function hideCompletionMessage() {
    const overlay = elements.exerciseAnimation.querySelector('.completion-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Clear animation container
function clearAnimationContainer() {
    elements.animationContainer.innerHTML = '';
}

// Setup screen-based exercises (for non-instruction-based exercises)
function setupScreenBasedExercise() {
    const exercise = eyeExercises[currentExercise];

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

// Animation functions for screen-based exercises
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);