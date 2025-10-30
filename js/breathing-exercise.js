// Breathing Techniques Data
const breathingTechniques = {
    box: {
        name: "Box Breathing",
        pattern: [4, 4, 4, 4],
        description: "Perfect for focus and stress reduction",
    },
    relaxing: {
        name: "4-7-8 Relaxing",
        pattern: [4, 7, 8, 0],
        description: "Calms anxiety and prepares for sleep",
    },
    deep: {
        name: "Deep Breathing",
        pattern: [4, 0, 4, 0],
        description: "Simple mindfulness for beginners",
    },
    energizing: {
        name: "Energizing Breath",
        pattern: [2, 1, 2, 0],
        description: "Quick boost of energy and alertness",
    },
    stimulating: {
        name: "Stimulating Breath",
        pattern: [1, 0, 1, 0],
        description: "Rapid breathing for mental alertness",
    },
    custom: {
        name: "Custom Breathing",
        pattern: null,
        description: "Create your own breathing pattern",
    }
};

// App State
let currentTechnique = null;
let isRunning = false;
let isPaused = false;
let currentPhase = 0;
let timeLeft = 0;
let totalBreaths = 0;
let sessionTimer = null;
let sessionDuration = 3; // minutes
let customPattern = [4, 4, 4, 4];

// DOM Elements
const elements = {
    techniqueGrid: document.getElementById('techniqueGrid'),
    breathingInterface: document.getElementById('breathingInterface'),
    customBreath: document.getElementById('customBreath'),
    breathCircle: document.getElementById('breathCircle'),
    breathText: document.getElementById('breathText'),
    breathTimer: document.getElementById('breathTimer'),
    breathCounter: document.getElementById('breathCounter'),
    techniqueName: document.getElementById('techniqueName'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    sessionLength: document.getElementById('sessionLength'),
    backToTechniques: document.getElementById('backToTechniques'),
    startCustomBtn: document.getElementById('startCustomBtn'),
    backFromCustom: document.getElementById('backFromCustom')
};

// Phase names for display
const phaseNames = ['Inhale', 'Hold', 'Exhale', 'Hold'];

// Initialize the app
function init() {
    renderTechniqueGrid();
    setupEventListeners();
}

// Render technique selection grid
function renderTechniqueGrid() {
    elements.techniqueGrid.innerHTML = Object.entries(breathingTechniques).map(([key, tech]) => `
        <div class="technique-card" data-technique="${key}">
            <h3 class="tech-name">${tech.name}</h3>
            ${tech.pattern ? `<div class="tech-pattern">${tech.pattern.join('-')}</div>` : ''}
            <p class="tech-desc">${tech.description}</p>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Technique selection
    elements.techniqueGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.technique-card');
        if (card) {
            const technique = card.dataset.technique;
            selectTechnique(technique);
        }
    });

    // Control buttons
    elements.startBtn.addEventListener('click', startBreathing);
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.resetBtn.addEventListener('click', resetBreathing);
    elements.backToTechniques.addEventListener('click', showTechniqueSelector);
    elements.backFromCustom.addEventListener('click', showTechniqueSelector);
    elements.startCustomBtn.addEventListener('click', startCustomBreathing);

    // Session duration
    elements.sessionLength.addEventListener('change', (e) => {
        sessionDuration = parseInt(e.target.value);
    });

    // Custom breathing sliders
    document.querySelectorAll('.phase-slider').forEach(slider => {
        slider.addEventListener('input', updateCustomPattern);
    });
}

// Select a breathing technique
function selectTechnique(technique) {
    currentTechnique = technique;

    if (technique === 'custom') {
        showCustomBreathing();
        // Scroll to custom breathing interface
        setTimeout(() => {
            const customSection = document.getElementById('customBreath');
            customSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Focus on the first interactive element for accessibility
            document.getElementById('startCustomBtn').focus();
        }, 100);
    } else {
        showBreathingInterface();
        elements.techniqueName.textContent = breathingTechniques[technique].name;
        resetBreathing();

        // Scroll to breathing interface
        setTimeout(() => {
            const breathingSection = document.getElementById('breathingInterface');
            breathingSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Focus on start button for accessibility
            document.getElementById('startBtn').focus();
        }, 100);
    }
}

// Show breathing interface
function showBreathingInterface() {
    elements.techniqueGrid.hidden = true;
    elements.breathingInterface.hidden = false;
    elements.customBreath.hidden = true;
}

// Show custom breathing builder
function showCustomBreathing() {
    elements.techniqueGrid.hidden = true;
    elements.breathingInterface.hidden = true;
    elements.customBreath.hidden = false;
}

// Show technique selector
function showTechniqueSelector() {
    elements.techniqueGrid.hidden = false;
    elements.breathingInterface.hidden = true;
    elements.customBreath.hidden = true;
    stopBreathing();
}

// Update custom pattern from sliders
function updateCustomPattern() {
    customPattern = [
        parseInt(document.getElementById('inhaleSlider').value),
        parseInt(document.getElementById('hold1Slider').value),
        parseInt(document.getElementById('exhaleSlider').value),
        parseInt(document.getElementById('hold2Slider').value)
    ];

    // Update display values
    document.getElementById('inhaleValue').textContent = customPattern[0];
    document.getElementById('hold1Value').textContent = customPattern[1];
    document.getElementById('exhaleValue').textContent = customPattern[2];
    document.getElementById('hold2Value').textContent = customPattern[3];
}


// Start custom breathing
function startCustomBreathing() {
    currentTechnique = 'custom';
    showBreathingInterface();
    elements.techniqueName.textContent = 'Custom Breathing';
    resetBreathing();
}

// Start breathing exercise
function startBreathing() {
    if (isRunning) return;

    isRunning = true;
    isPaused = false;
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;

    // Set session timeout
    const sessionMs = sessionDuration * 60 * 1000;
    sessionTimer = setTimeout(endSession, sessionMs);

    nextPhase();
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;
    elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';

    if (!isPaused && isRunning) {
        nextPhase();
    }
}

// Reset breathing exercise
function resetBreathing() {
    stopBreathing();
    currentPhase = 0;
    totalBreaths = 0;
    timeLeft = 0;

    elements.breathText.textContent = 'Ready to Begin';
    elements.breathTimer.textContent = '0:00';
    elements.breathCounter.textContent = 'Breath: 0';
    elements.breathCircle.className = 'breath-circle';
}

// Stop breathing exercise
function stopBreathing() {
    isRunning = false;
    isPaused = false;
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';

    if (sessionTimer) {
        clearTimeout(sessionTimer);
        sessionTimer = null;
    }
}

// Move to next phase
// function nextPhase() {
//     if (!isRunning || isPaused) return;

//     const pattern = currentTechnique === 'custom' ? customPattern : breathingTechniques[currentTechnique].pattern;

//     // Skip zero-duration phases
//     while (pattern[currentPhase] === 0) {
//         currentPhase = (currentPhase + 1) % pattern.length;
//     }

//     const phaseDuration = pattern[currentPhase];
//     timeLeft = phaseDuration;

//     // Update display
//     elements.breathText.textContent = phaseNames[currentPhase];
//     elements.breathCircle.className = `breath-circle ${currentPhase === 0 ? 'inhale' : currentPhase === 2 ? 'exhale' : ''}`;

//     updateTimer();

//     // Count completed breaths
//     if (currentPhase === 2) { // Exhale phase
//         totalBreaths++;
//         elements.breathCounter.textContent = `Breath: ${totalBreaths}`;
//     }

//     // Schedule next phase
//     const phaseTimer = setInterval(() => {
//         if (!isRunning || isPaused) {
//             clearInterval(phaseTimer);
//             return;
//         }

//         timeLeft--;
//         updateTimer();

//         if (timeLeft <= 0) {
//             clearInterval(phaseTimer);
//             currentPhase = (currentPhase + 1) % pattern.length;
//             nextPhase();
//         }
//     }, 1000);
// }
function nextPhase() {
    if (!isRunning || isPaused) return;
    
    const pattern = currentTechnique === 'custom' ? customPattern : breathingTechniques[currentTechnique].pattern;
    
    // Skip zero-duration phases
    while (pattern[currentPhase] === 0) {
        currentPhase = (currentPhase + 1) % pattern.length;
    }
    
    const phaseDuration = pattern[currentPhase];
    timeLeft = phaseDuration;
    
    // Update display with separate hold states
    let phaseClass = '';
    let instructionText = '';
    
    switch(currentPhase) {
        case 0:
            phaseClass = 'inhale';
            instructionText = 'Breathe In';
            break;
        case 1:
            phaseClass = 'hold-inhale';
            instructionText = 'Hold';
            break;
        case 2:
            phaseClass = 'exhale';
            instructionText = 'Breathe Out';
            break;
        case 3:
            phaseClass = 'hold-exhale';
            instructionText = 'Hold';
            break;
    }
    
    elements.breathText.textContent = instructionText;
    elements.breathCircle.className = `breath-circle ${phaseClass}`;
    
    updateTimer();
    
    // Count completed breaths
    if (currentPhase === 2) { // Exhale phase
        totalBreaths++;
        elements.breathCounter.textContent = `Breath: ${totalBreaths}`;
    }
    
    // Schedule next phase
    const phaseTimer = setInterval(() => {
        if (!isRunning || isPaused) {
            clearInterval(phaseTimer);
            return;
        }
        
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 0) {
            clearInterval(phaseTimer);
            currentPhase = (currentPhase + 1) % pattern.length;
            nextPhase();
        }
    }, 1000);
}

// Update timer display
function updateTimer() {
    const seconds = timeLeft.toString().padStart(2, '0');
    elements.breathTimer.textContent = `0:${seconds}`;
}

// End session
function endSession() {
    stopBreathing();
    elements.breathText.textContent = 'Session Complete!';
    elements.breathCircle.className = 'breath-circle';

    // Show completion message for 3 seconds, then reset
    setTimeout(() => {
        if (!isRunning) {
            resetBreathing();
        }
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);