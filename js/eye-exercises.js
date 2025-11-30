// Eye Exercises Data
const eyeExercises = {
    palming: {
        name: "Palming Relaxation",
        duration: 30,
        description: "Relaxes eye muscles and reduces strain",
        steps: [
            { duration: 5, instruction: "Rub your hands together to warm them" },
            { duration: 20, instruction: "Close eyes and cup palms over them" },
            { duration: 5, instruction: "Slowly remove hands and open eyes" }
        ]
    },
    figureEight: {
        name: "Figure Eight Tracing",
        duration: 60,
        description: "Improves eye coordination and flexibility",
        reps: 5
    },
    focusSwitching: {
        name: "Near-Far Focus",
        duration: 60,
        description: "Exercises focusing muscles",
        reps: 10
    },
    directional: {
        name: "Directional Movements",
        duration: 45,
        description: "Strengthens eye muscles in all directions",
        reps: 3
    },
    zooming: {
        name: "Zooming Exercise",
        duration: 45,
        description: "Works on accommodation ability",
        reps: 8
    },
    blinking: {
        name: "Blinking Exercise",
        duration: 30,
        description: "Prevents dry eyes and refreshes vision",
        reps: 10
    }
};

// App State
let currentExercise = null;
let isRunning = false;
let isPaused = false;
let timeLeft = 0;
let currentStep = 0;
let totalReps = 0;
let sessionDuration = 2; // minutes
let sessionTotalSeconds = 0;
let sessionTimeLeft = 0;
let sessionTimerInterval = null;
let exerciseInterval = null;
let soundMode = 'none';
let volume = 0.5;
let audioContext = null;
let gainNode = null;

// DOM Elements
const elements = {
    exerciseGrid: document.getElementById('exerciseGrid'),
    exerciseInterface: document.getElementById('exerciseInterface'),
    exerciseAnimation: document.getElementById('exerciseAnimation'),
    animationContainer: document.getElementById('animationContainer'),
    exerciseInstruction: document.getElementById('exerciseInstruction'),
    exerciseTimer: document.getElementById('exerciseTimer'),
    repsCounter: document.getElementById('repsCounter'),
    exerciseName: document.getElementById('exerciseName'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    sessionLength: document.getElementById('sessionLength'),
    backToExercises: document.getElementById('backToExercises')
};

// Initialize the app
function init() {
    renderExerciseGrid();
    setupEventListeners();
}

// Render exercise selection grid
function renderExerciseGrid() {
    elements.exerciseGrid.innerHTML = Object.entries(eyeExercises).map(([key, exercise]) => `
        <div class="exercise-card" data-exercise="${key}">
            <h3 class="exercise-name">${exercise.name}</h3>
            <p class="exercise-desc">${exercise.description}</p>
            <div class="exercise-duration">${exercise.duration} seconds</div>
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
            sessionTimeLeft = sessionDuration * 60;
            updateSessionTimer();
        }
    });

    // Sound controls
    document.getElementById('soundMode').addEventListener('change', handleSoundModeChange);
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        updateVolume(parseInt(e.target.value));
    });

    // Initialize audio on first user interaction
    document.addEventListener('click', function initAudioOnInteraction() {
        initAudio();
        document.removeEventListener('click', initAudioOnInteraction);
    }, { once: true });
}

// Initialize audio system
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0;
    }
}

// Select an exercise
function selectExercise(exercise) {
    currentExercise = exercise;
    showExerciseInterface();
    elements.exerciseName.textContent = eyeExercises[exercise].name;
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

// Show exercise selector
function showExerciseSelector() {
    elements.exerciseGrid.hidden = false;
    elements.exerciseInterface.hidden = true;
    stopExercise();
}

// Start exercise
function startExercise() {
    if (isRunning) return;

    isRunning = true;
    isPaused = false;
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;

    // Calculate session time
    sessionTotalSeconds = sessionDuration * 60;
    sessionTimeLeft = sessionTotalSeconds;
    updateSessionTimer();
    startSessionTimer();

    // Initialize exercise-specific state
    totalReps = 0;
    currentStep = 0;
    elements.repsCounter.textContent = `Reps: ${totalReps}`;

    // Start the exercise
    runExercise();
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;
    elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';

    if (isPaused) {
        if (sessionTimerInterval) {
            clearInterval(sessionTimerInterval);
            sessionTimerInterval = null;
        }
        if (exerciseInterval) {
            clearInterval(exerciseInterval);
        }
    } else {
        if (isRunning) {
            startSessionTimer();
            runExercise();
        }
    }
}

// Reset exercise
function resetExercise() {
    stopExercise();
    timeLeft = 0;
    totalReps = 0;
    currentStep = 0;

    elements.exerciseInstruction.textContent = 'Get Ready';
    elements.exerciseTimer.textContent = '0:30';
    elements.repsCounter.textContent = 'Reps: 0';
    clearAnimationContainer();

    // Reset session timer
    sessionTimeLeft = sessionDuration * 60;
    updateSessionTimer();
}

// Stop exercise
function stopExercise() {
    isRunning = false;
    isPaused = false;
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';

    if (sessionTimerInterval) {
        clearInterval(sessionTimerInterval);
        sessionTimerInterval = null;
    }
    if (exerciseInterval) {
        clearInterval(exerciseInterval);
    }
}

// Start session timer
function startSessionTimer() {
    if (sessionTimerInterval) {
        clearInterval(sessionTimerInterval);
    }

    sessionTimerInterval = setInterval(() => {
        if (!isPaused && isRunning) {
            sessionTimeLeft--;
            updateSessionTimer();

            if (sessionTimeLeft <= 0) {
                endSession();
            }
        }
    }, 1000);
}

// Update session timer display
function updateSessionTimer() {
    const timerElement = document.getElementById('sessionTimer');
    const minutes = Math.floor(sessionTimeLeft / 60);
    const seconds = sessionTimeLeft % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    timerElement.textContent = formattedTime;
    timerElement.classList.remove('warning', 'completed');

    if (sessionTimeLeft <= 0) {
        timerElement.classList.add('completed');
    } else if (sessionTimeLeft <= 30) {
        timerElement.classList.add('warning');
    }
}

// Main exercise runner
function runExercise() {
    if (!isRunning || isPaused) return;

    const exercise = eyeExercises[currentExercise];

    switch (currentExercise) {
        case 'palming':
            runPalmingExercise();
            break;
        case 'figureEight':
            runFigureEightExercise();
            break;
        case 'focusSwitching':
            runFocusSwitchingExercise();
            break;
        case 'directional':
            runDirectionalExercise();
            break;
        case 'zooming':
            runZoomingExercise();
            break;
        case 'blinking':
            runBlinkingExercise();
            break;
    }
}

// Palming Exercise
function runPalmingExercise() {
    const steps = eyeExercises.palming.steps;
    
    if (currentStep >= steps.length) {
        completeExercise();
        return;
    }

    const step = steps[currentStep];
    timeLeft = step.duration;
    elements.exerciseInstruction.textContent = step.instruction;
    
    // Visual for palming
    clearAnimationContainer();
    if (currentStep === 1) {
        // Show dark overlay for palming
        const overlay = document.createElement('div');
        overlay.className = 'palming-overlay';
        overlay.innerHTML = '<div class="palming-hands">👐</div>';
        elements.animationContainer.appendChild(overlay);
    } else if (currentStep === 0) {
        // Show breathing circle for warming hands
        const circle = document.createElement('div');
        circle.className = 'breathing-circle';
        elements.animationContainer.appendChild(circle);
    }

    updateExerciseTimer();

    exerciseInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(exerciseInterval);
            return;
        }

        timeLeft--;
        updateExerciseTimer();

        if (timeLeft <= 0) {
            clearInterval(exerciseInterval);
            currentStep++;
            runExercise();
        }
    }, 1000);
}

// Figure Eight Exercise
function runFigureEightExercise() {
    const reps = eyeExercises.figureEight.reps;
    
    if (totalReps >= reps) {
        completeExercise();
        return;
    }

    elements.exerciseInstruction.textContent = `Follow the dot - Rep ${totalReps + 1}/${reps}`;
    timeLeft = 12; // 12 seconds per rep for smooth movement
    updateExerciseTimer();

    // Create figure eight animation
    clearAnimationContainer();
    createFigureEightAnimation();

    exerciseInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(exerciseInterval);
            return;
        }

        timeLeft--;
        updateExerciseTimer();

        if (timeLeft <= 0) {
            clearInterval(exerciseInterval);
            totalReps++;
            elements.repsCounter.textContent = `Reps: ${totalReps}`;
            runExercise();
        }
    }, 1000);
}

// Create figure eight animation
function createFigureEightAnimation() {
    const container = elements.animationContainer;
    
    // Create path
    const path = document.createElement('div');
    path.className = 'eye-path';
    path.style.width = '180px';
    path.style.height = '100px';
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

        progress = (progress + 0.02) % 1;
        const x = Math.sin(progress * Math.PI * 2) * 80;
        const y = Math.sin(progress * Math.PI * 4) * 40;
        
        target.style.transform = `translate(${x}px, ${y}px)`;
    }, 50);
}

// Focus Switching Exercise
function runFocusSwitchingExercise() {
    const reps = eyeExercises.focusSwitching.reps;
    
    if (totalReps >= reps) {
        completeExercise();
        return;
    }

    elements.exerciseInstruction.textContent = `Switch focus - Rep ${totalReps + 1}/${reps}`;
    timeLeft = 6; // 6 seconds per rep
    updateExerciseTimer();

    clearAnimationContainer();
    createFocusSwitchingAnimation();

    exerciseInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(exerciseInterval);
            return;
        }

        timeLeft--;
        updateExerciseTimer();

        if (timeLeft <= 0) {
            clearInterval(exerciseInterval);
            totalReps++;
            elements.repsCounter.textContent = `Reps: ${totalReps}`;
            runExercise();
        }
    }, 1000);
}

// Create focus switching animation
function createFocusSwitchingAnimation() {
    const container = elements.animationContainer;
    
    // Create near and far points
    const nearPoint = document.createElement('div');
    nearPoint.className = 'eye-target';
    nearPoint.style.width = '30px';
    nearPoint.style.height = '30px';
    nearPoint.style.background = '#e53e3e';
    nearPoint.style.transform = 'translate(0, 0)';
    container.appendChild(nearPoint);

    const farPoint = document.createElement('div');
    farPoint.className = 'eye-target';
    farPoint.style.width = '15px';
    farPoint.style.height = '15px';
    farPoint.style.background = '#4299e1';
    farPoint.style.transform = 'translate(80px, 0)';
    container.appendChild(farPoint);

    // Alternate highlighting
    let currentPoint = 'near';
    const switchInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(switchInterval);
            return;
        }

        if (currentPoint === 'near') {
            nearPoint.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.5)';
            farPoint.style.boxShadow = 'none';
            currentPoint = 'far';
        } else {
            farPoint.style.boxShadow = '0 0 0 3px rgba(66, 153, 225, 0.5)';
            nearPoint.style.boxShadow = 'none';
            currentPoint = 'near';
        }
    }, 2000);
}

// Directional Movements Exercise
function runDirectionalExercise() {
    const reps = eyeExercises.directional.reps;
    const directions = ['up', 'right', 'down', 'left'];
    
    if (totalReps >= reps * directions.length) {
        completeExercise();
        return;
    }

    const currentDirection = directions[totalReps % directions.length];
    elements.exerciseInstruction.textContent = `Look ${currentDirection}`;
    timeLeft = 3; // 3 seconds per direction
    updateExerciseTimer();

    clearAnimationContainer();
    createDirectionalAnimation(currentDirection);

    exerciseInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(exerciseInterval);
            return;
        }

        timeLeft--;
        updateExerciseTimer();

        if (timeLeft <= 0) {
            clearInterval(exerciseInterval);
            totalReps++;
            elements.repsCounter.textContent = `Reps: ${Math.ceil(totalReps / directions.length)}`;
            runExercise();
        }
    }, 1000);
}

// Create directional animation
function createDirectionalAnimation(direction) {
    const container = elements.animationContainer;
    const target = document.createElement('div');
    target.className = 'eye-target';
    
    let position = { x: 0, y: 0 };
    switch (direction) {
        case 'up': position.y = -60; break;
        case 'right': position.x = 60; break;
        case 'down': position.y = 60; break;
        case 'left': position.x = -60; break;
    }
    
    target.style.transform = `translate(${position.x}px, ${position.y}px)`;
    container.appendChild(target);
}

// Zooming Exercise
function runZoomingExercise() {
    const reps = eyeExercises.zooming.reps;
    
    if (totalReps >= reps) {
        completeExercise();
        return;
    }

    elements.exerciseInstruction.textContent = `Follow the circle - Rep ${totalReps + 1}/${reps}`;
    timeLeft = 6; // 6 seconds per rep
    updateExerciseTimer();

    clearAnimationContainer();
    createZoomingAnimation();

    exerciseInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(exerciseInterval);
            return;
        }

        timeLeft--;
        updateExerciseTimer();

        if (timeLeft <= 0) {
            clearInterval(exerciseInterval);
            totalReps++;
            elements.repsCounter.textContent = `Reps: ${totalReps}`;
            runExercise();
        }
    }, 1000);
}

// Create zooming animation
function createZoomingAnimation() {
    const container = elements.animationContainer;
    const circle = document.createElement('div');
    circle.className = 'eye-target';
    circle.style.borderRadius = '50%';
    circle.style.background = 'transparent';
    circle.style.border = '3px solid #4299e1';
    container.appendChild(circle);

    let scale = 0.3;
    let growing = true;
    
    const zoomInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(zoomInterval);
            return;
        }

        if (growing) {
            scale += 0.05;
            if (scale >= 1.5) growing = false;
        } else {
            scale -= 0.05;
            if (scale <= 0.3) growing = true;
        }
        
        circle.style.width = `${scale * 50}px`;
        circle.style.height = `${scale * 50}px`;
    }, 100);
}

// Blinking Exercise
function runBlinkingExercise() {
    const reps = eyeExercises.blinking.reps;
    
    if (totalReps >= reps) {
        completeExercise();
        return;
    }

    elements.exerciseInstruction.textContent = `Blink slowly - Rep ${totalReps + 1}/${reps}`;
    timeLeft = 3; // 3 seconds per blink
    updateExerciseTimer();

    clearAnimationContainer();
    createBlinkingAnimation();

    exerciseInterval = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(exerciseInterval);
            return;
        }

        timeLeft--;
        updateExerciseTimer();

        if (timeLeft <= 0) {
            clearInterval(exerciseInterval);
            totalReps++;
            elements.repsCounter.textContent = `Reps: ${totalReps}`;
            runExercise();
        }
    }, 1000);
}

// Create blinking animation
function createBlinkingAnimation() {
    const container = elements.animationContainer;
    const eye = document.createElement('div');
    eye.className = 'blinking-eye';
    eye.textContent = '👁️';
    container.appendChild(eye);
}

// Update exercise timer display
function updateExerciseTimer() {
    const seconds = timeLeft.toString().padStart(2, '0');
    elements.exerciseTimer.textContent = `0:${seconds}`;
}

// Clear animation container
function clearAnimationContainer() {
    elements.animationContainer.innerHTML = '';
}

// Complete current exercise
function completeExercise() {
    showCompletionMessage();
    
    setTimeout(() => {
        if (isRunning) {
            resetExercise();
            elements.exerciseInstruction.textContent = 'Exercise Complete!';
        }
    }, 3000);
}

// Show completion message
function showCompletionMessage() {
    const overlay = document.createElement('div');
    overlay.className = 'completion-overlay';
    overlay.innerHTML = `
        <div class="completion-message">✓ Complete!</div>
        <div class="completion-subtitle">Great job taking care of your eyes</div>
    `;
    elements.exerciseAnimation.appendChild(overlay);
}

// End session
function endSession() {
    stopExercise();
    showCompletionMessage();
    
    setTimeout(() => {
        if (!isRunning) {
            resetExercise();
        }
    }, 3000);
}

// Handle sound mode change
function handleSoundModeChange() {
    const mode = document.getElementById('soundMode').value;
    soundMode = mode;
    const volumeControl = document.getElementById('volumeControl');

    if (mode === 'none') {
        volumeControl.classList.add('hidden');
        if (gainNode) gainNode.gain.value = 0;
    } else {
        initAudio();
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        volumeControl.classList.remove('hidden');
        updateVolume(volume * 100);
        if (gainNode) gainNode.gain.value = volume;
    }
}

// Update volume
function updateVolume(value) {
    volume = value / 100;
    if (gainNode) {
        gainNode.gain.value = volume;
    }
    document.getElementById('volumeValue').textContent = `${value}%`;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);