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
        pattern: ['X', 'X', 'X', 'X'],
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
let sessionTotalSeconds = 0;
let sessionTimeLeft = 0;
let sessionTimerInterval = null;
let savedPattern = null;
let soundMode = 'none'; // 'none', 'tones', 'voice'
let volume = 0.5;
let audioContext = null;
let gainNode = null;

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

// Voice sounds (add this after your existing state)
const voiceSounds = {
    inhale: new Audio('assets/sounds/breathe_in.mp3'),
    exhale: new Audio('assets/sounds/breathe_out.mp3'),
    hold: new Audio('assets/sounds/hold.mp3'),
    complete: new Audio('assets/sounds/session_complete.mp3')
};

// Initialize the app
function init() {
    renderTechniqueGrid();
    setupEventListeners();
    initSavedPattern();
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

// Initialize - load saved pattern on page load
function initSavedPattern() {
    const stored = localStorage.getItem('breathingCustomPattern');
    if (stored) {
        savedPattern = JSON.parse(stored);
        updateCustomPatternDisplay();
    }
}

// Preload voice sounds
function preloadVoiceSounds() {
    Object.values(voiceSounds).forEach(audio => {
        audio.preload = 'auto';
        audio.volume = volume;
    });
}

// Render technique selection grid
function renderTechniqueGrid() {
    elements.techniqueGrid.innerHTML = Object.entries(breathingTechniques).map(([key, tech]) => `
        <div class="technique-card" data-technique="${key}">
            <h3 class="tech-name">${tech.name}</h3>
            <div class="tech-pattern" ${key === 'custom' ? 'id="customPatternDisplay"' : ''}>${tech.pattern.join('-')}</div>
            <p class="tech-desc" ${key === 'custom' ? 'id="customPatternDesc"' : ''}>${tech.description}</p>
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
        if (!isRunning) {
            sessionTimeLeft = sessionDuration * 60;
            updateSessionTimer();
        }
    });

    // Custom breathing sliders
    document.querySelectorAll('.phase-slider').forEach(slider => {
        slider.addEventListener('input', updateCustomPattern);
    });

    // Sound controls
    document.getElementById('soundMode').addEventListener('change', handleSoundModeChange);
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        updateVolume(parseInt(e.target.value));
    });

    // Initialize audio on first user interaction
    document.addEventListener('click', function initAudioOnInteraction() {
        initAudio();
        preloadVoiceSounds();
        document.removeEventListener('click', initAudioOnInteraction);
    }, { once: true });
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

    // Load saved pattern if it exists
    if (savedPattern) {
        loadSavedPattern();
    }
}

// Show technique selector
function showTechniqueSelector() {
    elements.techniqueGrid.hidden = false;
    elements.breathingInterface.hidden = true;
    elements.customBreath.hidden = true;
    stopBreathing();
}

// Save current pattern to localStorage
function saveCurrentPattern() {
    savedPattern = [...customPattern]; // Copy current pattern
    localStorage.setItem('breathingCustomPattern', JSON.stringify(savedPattern));
    updateCustomPatternDisplay();

    // Show quick confirmation
    showPatternSavedMessage();
}

// Load saved pattern into sliders
function loadSavedPattern() {
    if (!savedPattern) return;

    // Update sliders with saved values
    document.getElementById('inhaleSlider').value = savedPattern[0];
    document.getElementById('hold1Slider').value = savedPattern[1];
    document.getElementById('exhaleSlider').value = savedPattern[2];
    document.getElementById('hold2Slider').value = savedPattern[3];

    // Update the display
    updateCustomPattern();
}

// Update custom pattern display on the card
function updateCustomPatternDisplay() {
    const patternDesc = document.getElementById('customPatternDesc');
    const patternDisplay = document.getElementById('customPatternDisplay');

    if (savedPattern) {
        patternDesc.textContent = 'Your saved custom pattern';
        patternDisplay.textContent = savedPattern.join('-');
    } else {
        patternDesc.textContent = 'Create your own breathing pattern';
        patternDisplay.textContent = 'X-X-X-X';
    }
}

// Show temporary saved message
function showPatternSavedMessage() {
    const saveBtn = document.getElementById('savePatternBtn');
    const originalText = saveBtn.textContent;

    saveBtn.textContent = '✓ Saved!';
    saveBtn.style.background = '#48bb78';
    saveBtn.style.color = 'white';
    saveBtn.style.borderColor = '#48bb78';

    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
        saveBtn.style.color = '';
        saveBtn.style.borderColor = '';
    }, 2000);
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

    // Calculate session time
    sessionTotalSeconds = sessionDuration * 60;
    sessionTimeLeft = sessionTotalSeconds;

    // Update timer display
    updateSessionTimer();

    // Start session timer
    startSessionTimer();

    nextPhase();
}

// Toggle pause state
function togglePause() {
    isPaused = !isPaused;
    elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';

    if (isPaused) {
        // Pause session timer
        if (sessionTimerInterval) {
            clearInterval(sessionTimerInterval);
            sessionTimerInterval = null;
        }
    } else {
        // Resume session timer
        if (isRunning) {
            startSessionTimer();
            nextPhase();
        }
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

    // Reset session timer
    sessionTimeLeft = sessionDuration * 60;
    updateSessionTimer();

    // Reset audio
    resetAudio();
}

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

function updateSessionTimer() {
    const timerElement = document.getElementById('sessionTimer');
    const minutes = Math.floor(sessionTimeLeft / 60);
    const seconds = sessionTimeLeft % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    timerElement.textContent = formattedTime;

    // Update visual states
    timerElement.classList.remove('warning', 'completed');

    if (sessionTimeLeft <= 0) {
        timerElement.classList.add('completed');
    } else if (sessionTimeLeft <= 30) {
        timerElement.classList.add('warning');
    }
}

// Stop breathing exercise
function stopBreathing() {
    isRunning = false;
    isPaused = false;
    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';

    if (sessionTimerInterval) {
        clearInterval(sessionTimerInterval);
        sessionTimerInterval = null;
    }
}

// Move to next phase
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
    let soundPhase = '';

    switch (currentPhase) {
        case 0:
            phaseClass = 'inhale';
            instructionText = 'Breathe In';
            soundPhase = 'inhale';
            break;
        case 1:
            phaseClass = 'hold-inhale';
            instructionText = 'Hold';
            soundPhase = 'hold';
            break;
        case 2:
            phaseClass = 'exhale';
            instructionText = 'Breathe Out';
            soundPhase = 'exhale';
            break;
        case 3:
            phaseClass = 'hold-exhale';
            instructionText = 'Hold';
            soundPhase = 'hold';
            break;
    }

    elements.breathText.textContent = instructionText;
    elements.breathCircle.className = `breath-circle ${phaseClass}`;

    // Play phase sound
    playPhaseSound(soundPhase);

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
    elements.breathTimer.textContent = '';

    // Play completion sound
    playCompleteSound();

    setTimeout(() => {
        if (!isRunning) {
            resetBreathing();
        }
    }, 3000);
}

// Play sound based on current mode (replace playPhaseSound)
function playPhaseSound(phase) {
    if (soundMode === 'none' || !audioContext) return;

    if (soundMode === 'tones') {
        playToneSound(phase);
    } else if (soundMode === 'voice') {
        playVoiceSound(phase);
    }
}


// Play sound for breathing phase
function playToneSound(phase) {
    if (audioContext.state !== 'running') return;

    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();

    oscillator.connect(envelope);
    envelope.connect(gainNode);

    const frequencies = {
        inhale: 600,
        exhale: 400,
        hold: 500,
        complete: 800
    };

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[phase], audioContext.currentTime);

    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    envelope.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.8);
}

// Voice sounds
function playVoiceSound(phase) {
    const sound = voiceSounds[phase];
    if (sound) {
        sound.volume = volume;
        sound.currentTime = 0; // Reset to start
        sound.play().catch(e => console.log('Voice play failed:', e));
    }
}

// Play session complete sound (more celebratory)
function playCompleteSound() {
    if (soundMode === 'none') return;

    if (soundMode === 'tones') {
        playToneSound('complete');
    } else if (soundMode === 'voice') {
        playVoiceSound('complete');
    }
}

// Toggle sound on/off
function handleSoundModeChange() {
    const mode = document.getElementById('soundMode').value;
    soundMode = mode;
    const volumeControl = document.getElementById('volumeControl');

    if (mode === 'none') {
        // No sound - hide volume, mute everything
        volumeControl.classList.add('hidden');
        if (gainNode) gainNode.gain.value = 0;
    } else {
        // Sound enabled - show volume, initialize audio
        initAudio();
        preloadVoiceSounds();

        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }

        volumeControl.classList.remove('hidden');
        updateVolume(volume * 100); // Apply current volume

        // Set volume for both systems
        if (gainNode) gainNode.gain.value = volume;
        Object.values(voiceSounds).forEach(audio => {
            audio.volume = volume;
        });
    }
}

// Update volume
function updateVolume(value) {
    volume = value / 100;

    // Update tone volume
    if (gainNode) {
        gainNode.gain.value = volume;
    }

    // Update voice volume
    Object.values(voiceSounds).forEach(audio => {
        audio.volume = volume;
    });

    document.getElementById('volumeValue').textContent = `${value}%`;
}

// Reset audio state
function resetAudio() {
    soundMode = 'none';

    // Update UI
    document.getElementById('soundMode').value = 'none';
    document.getElementById('volumeControl').classList.add('hidden');
    document.getElementById('volumeSlider').value = 50;
    document.getElementById('volumeValue').textContent = '50%';

    // Mute everything
    if (gainNode) gainNode.gain.value = 0;
    Object.values(voiceSounds).forEach(audio => {
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add event listener for save button
document.getElementById('savePatternBtn').addEventListener('click', saveCurrentPattern);