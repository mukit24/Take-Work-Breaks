// Eye Exercises Data - Updated for all instruction-based exercises
const eyeExercises = {
    palming: {
        name: "Palming Relaxation",
        description: "Relieve eye strain and reduce fatigue by warming and relaxing your eye muscles",
        type: "Instruction-based",
        instructionType: "two-steps",
        steps: [
            {
                instruction: "Rub your hands together vigorously",
                duration: 10,
                voice: "assets/sounds/rub-hands.mp3"
            },
            {
                instruction: "Close eyes and cup palms gently over them",
                duration: 5,
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
        instructionType: "two-steps",
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
        instructionType: "two-steps",
        steps: [
            {
                instruction: "Close your eyes gently",
                duration: 3,
                voice: "assets/sounds/blink-close.mp3"
            },
            {
                instruction: "Open eyes and blink normally",
                duration: 3,
                voice: "assets/sounds/blink-open.mp3"
            }
        ]
    }
};

const completionVoice = "assets/sounds/session_complete.mp3";

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
let volume = 0.5; // Default volume 50%

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
        // Create instruction layout
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
                                    <span class="step-text">${step.instruction} for ${step.duration} seconds</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="voice-control">
                            <label class="voice-toggle">
                                <input type="checkbox" id="voiceToggle">
                                <span class="checkmark"></span>
                                Enable Voice Guidance
                            </label>
                            <div class="volume-control" id="volumeControl">
                                <label for="volumeSlider">Volume:</label>
                                <input type="range" id="volumeSlider" min="0" max="100" value="50" class="volume-slider">
                                <span id="volumeValue">50%</span>
                            </div>
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
                                    <span class="step-text">${step.instruction} for ${step.duration} seconds</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="voice-control">
                            <label class="voice-toggle">
                                <input type="checkbox" id="voiceToggle">
                                <span class="checkmark"></span>
                                Enable Voice Guidance
                            </label>
                            <div class="volume-control" id="volumeControl">
                                <label for="volumeSlider">Volume:</label>
                                <input type="range" id="volumeSlider" min="0" max="100" value="50" class="volume-slider">
                                <span id="volumeValue">50%</span>
                            </div>
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
                                    <span class="step-text">${step.instruction} for ${step.duration} seconds</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="voice-control">
                            <label class="voice-toggle">
                                <input type="checkbox" id="voiceToggle">
                                <span class="checkmark"></span>
                                Enable Voice Guidance
                            </label>
                            <div class="volume-control" id="volumeControl">
                                <label for="volumeSlider">Volume:</label>
                                <input type="range" id="volumeSlider" min="0" max="100" value="50" class="volume-slider">
                                <span id="volumeValue">50%</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        elements.animationContainer.innerHTML = layoutHTML;
        
        // Set voice toggle event listener
        const voiceToggle = document.getElementById('voiceToggle');
        const volumeControl = document.getElementById('volumeControl');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        
        if (voiceToggle) {
            voiceToggle.addEventListener('change', (e) => {
                useVoice = e.target.checked;
                if (volumeControl) {
                    if (useVoice) {
                        volumeControl.classList.add('visible');
                    } else {
                        volumeControl.classList.remove('visible');
                    }
                }
            });
        }
        
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (e) => {
                volume = parseInt(e.target.value) / 100;
                volumeValue.textContent = `${e.target.value}%`;
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
    hideCompletionDisplay();
    
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
    timeLeft = sessionDuration;
    
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
        timeLeft = sessionDuration;
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
    const timeElapsed = sessionDuration - timeLeft;
    
    if (exercise.instructionType === "two-steps") {
        const totalStepDuration = exercise.steps[0].duration + exercise.steps[1].duration;
        const timeInCurrentCycle = timeElapsed % totalStepDuration;
        
        let newStepIndex;
        if (timeInCurrentCycle < exercise.steps[0].duration) {
            newStepIndex = 0;
        } else {
            newStepIndex = 1;
        }
        
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
    hideCompletionDisplay();
    
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
        const volumeControl = document.getElementById('volumeControl');
        if (volumeControl) {
            volumeControl.classList.remove('visible');
        }
    }
    
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

// Play voice audio with volume control
function playVoice(audioPath) {
    if (!useVoice || !audioPath) return;
    
    // Stop any current audio first
    if (voiceAudio) {
        voiceAudio.pause();
        voiceAudio.currentTime = 0;
    }

    voiceAudio = new Audio(audioPath);
    voiceAudio.volume = volume; // Use volume setting
    
    // Use a promise chain to handle playback
    const playPromise = voiceAudio.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            // Only log errors that aren't aborts
            if (error.name !== 'AbortError') {
                console.log("Voice playback failed:", error);
            }
        });
    }
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

// Complete exercise - Updated to show completion in interface
function completeExercise() {
    stopExercise();
    
    // Play completion voice only if voice guidance was enabled
    setTimeout(() => {
        if (useVoice) {
            playVoice(completionVoice);
        }
    }, 100);
    
    // Show completion message in interface (hide timer, show completion text)
    showCompletionDisplay();
    
    // Wait 3 seconds then reset to initial phase
    setTimeout(() => {
        hideCompletionDisplay();
        stopExercise();
        timeLeft = sessionDuration;
        currentStepIndex = 0;
        // Keep useVoice as user selected (don't reset)
        stopVoice();
        setupInitialDisplay();
        elements.animationContainer.style.display = "flex";
        document.querySelector('.session-controls-group').classList.remove('running');
        updateTimerDisplay();
    }, 3000);
}

// Show completion display in interface
function showCompletionDisplay() {
    // Hide timer and instruction
    elements.exerciseTimer.style.display = 'none';
    elements.exerciseInstruction.style.display = 'none';
    
    // Create completion message
    const completionHTML = `
        <div class="completion-message">✓ Exercise Complete!</div>
        <div class="completion-subtitle">Great job taking care of your eyes</div>
    `;
    
    // Insert completion message
    const instructionArea = document.querySelector('.instruction-timer-area');
    if (instructionArea) {
        instructionArea.innerHTML = completionHTML;
        instructionArea.style.display = 'flex';
        instructionArea.style.flexDirection = 'column';
        instructionArea.style.justifyContent = 'center';
        instructionArea.style.alignItems = 'center';
        instructionArea.style.height = '150px';
    }
}

// Hide completion display
function hideCompletionDisplay() {
    // Show timer and instruction again
    elements.exerciseTimer.style.display = 'block';
    elements.exerciseInstruction.style.display = 'block';
    
    // Restore original instruction/timer area
    const instructionArea = document.querySelector('.instruction-timer-area');
    
    if (instructionArea) {
        instructionArea.innerHTML = `
            <div class="exercise-instruction" id="exerciseInstruction"></div>
            <div class="exercise-timer" id="exerciseTimer"></div>
        `;
        // Re-get elements after changing HTML
        elements.exerciseInstruction = document.getElementById('exerciseInstruction');
        elements.exerciseTimer = document.getElementById('exerciseTimer');
    }
}

// Clear animation container
function clearAnimationContainer() {
    elements.animationContainer.innerHTML = '';
}

// Setup screen-based exercises
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

function createFigureEightAnimation() {
    const container = elements.animationContainer;
    
    // Clear container
    container.innerHTML = '';
    
    // Create the figure-eight path visualization
    const path = document.createElement('div');
    path.className = 'figure-eight-path';
    container.appendChild(path);
    
    // Create the main dot
    const dot = document.createElement('div');
    dot.className = 'figure-eight-dot';
    container.appendChild(dot);
    
    // Animation variables
    let progress = 0;
    let animationId = null;
    let lastTimestamp = 0;
    
    // Calculate position on figure-eight path
    function calculatePosition(t) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Use container dimensions for responsive sizing
        const amplitudeX = containerWidth * 0.42;
        const amplitudeY = containerHeight * 0.3;
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        // Figure-eight (lemniscate) parametric equations
        const x = centerX + amplitudeX * Math.sin(t * Math.PI * 2);
        const y = centerY + amplitudeY * Math.sin(t * Math.PI * 2) * Math.cos(t * Math.PI * 2);
        
        return { x, y };
    }
    
    // Main animation function
    function animate(timestamp) {
        if (!lastTimestamp) lastTimestamp = timestamp;
        
        // Calculate time-based progress (slower movement)
        const deltaTime = timestamp - lastTimestamp;
        const speed = 0.00012; // Adjust for speed (lower = slower)
        progress = (progress + (deltaTime * speed)) % 1;
        lastTimestamp = timestamp;
        
        // Calculate new position
        const { x, y } = calculatePosition(progress);
        
        // Update dot position with smooth transition
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        
        // Add subtle pulsing effect
        const pulseScale = 1 + 0.05 * Math.sin(progress * Math.PI * 8);
        dot.style.transform = `translate(-50%, -50%) scale(${pulseScale})`;
        
        // Continue animation only if exercise is running and not paused
        if (isRunning && !isPaused) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    // Start the animation
    function startAnimation() {
        if (!animationId) {
            // Set initial position
            const initialPos = calculatePosition(0);
            dot.style.left = `${initialPos.x}px`;
            dot.style.top = `${initialPos.y}px`;
            
            // Start animation loop
            lastTimestamp = 0;
            animationId = requestAnimationFrame(animate);
        }
    }
    
    // Stop the animation
    function stopAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    
    // Store cleanup reference
    let cleanupFunction = null;
    
    // Listen for exercise state changes
    const checkAnimationState = () => {
        if (isRunning && !isPaused && !animationId) {
            startAnimation();
        } else if ((!isRunning || isPaused) && animationId) {
            stopAnimation();
        }
    };
    
    // Set up state monitoring
    const stateCheckInterval = setInterval(checkAnimationState, 100);
    
    // Initial check
    checkAnimationState();
    
    // Cleanup function
    cleanupFunction = () => {
        stopAnimation();
        clearInterval(stateCheckInterval);
    };
    
    return cleanupFunction;
}

function createDirectionalAnimation() {
    const container = elements.animationContainer;
    const target = document.createElement('div');
    target.className = 'eye-target';
    container.appendChild(target);

    const positions = [
        { x: 0, y: -100 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
        { x: -100, y: 0 },
        { x: -70, y: -70 },
        { x: 70, y: -70 },
        { x: 70, y: 70 },
        { x: -70, y: 70 }
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