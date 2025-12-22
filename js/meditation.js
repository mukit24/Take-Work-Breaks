// Meditation Sessions Data
const meditationSessions = [
    {
        id: 'purposeful-pause',
        title: 'The Purposeful Pause',
        time: '30 sec',
        duration: 30, // seconds
        goal: 'Break a stress loop instantly',
        description: 'Focuses on three "anchor breaths" to lower the heart rate after a stressful email or notification.',
        audioFile: 'assets/audio/meditation-1.mp3'
    },
    {
        id: 'instant-grounding',
        title: 'Instant Grounding',
        time: '1 min',
        duration: 60,
        goal: 'Stop "head-spinning" thoughts',
        description: 'Focuses on the physical sensation of feet on floor and back against chair to bring you to present.',
        audioFile: 'assets/audio/meditation-2.mp3'
    },
    {
        id: 'post-meeting',
        title: 'Post-Meeting Decompress',
        time: '2 min',
        duration: 120,
        goal: 'Cleanse the "social heat" of a call',
        description: 'Uses "Exhale-Sigh" technique to release tension held in jaw and neck during video meetings.',
        audioFile: 'assets/audio/meditation-3.mp3'
    },
    {
        id: 'digital-reset',
        title: 'The Digital Reset',
        time: '2 min',
        duration: 120,
        goal: 'Soften "screen-stare" eyes',
        description: 'Guides you through a mental scan of face and eyes, encouraging you to look away from screen.',
        audioFile: 'assets/audio/meditation-4.mp3'
    },
    {
        id: 'creative-unblock',
        title: 'The Creative Unblock',
        time: '5 min',
        duration: 300,
        goal: 'Refresh the brain for new ideas',
        description: 'Visualization session imagining a "blank screen" or flowing river to clear mental clutter.',
        audioFile: 'assets/audio/meditation-5.mp3'
    },
    {
        id: 'work-transition',
        title: 'The Work Transition',
        time: '5 min',
        duration: 300,
        goal: 'Mentally "sign off" for the day',
        description: 'Deep body scan to systematically "shut down" work-mode and transition to personal time.',
        audioFile: 'assets/audio/meditation-6.mp3'
    }
];

// Nature Sounds Data
const natureSounds = {
    forest: {
        name: 'Forest',
        file: 'assets/audio/nature-forest.mp3',
        color: '#38b2ac'
    },
    rain: {
        name: 'Rain',
        file: 'assets/audio/nature-rain.mp3',
        color: '#4c51bf'
    },
    waves: {
        name: 'Ocean Waves',
        file: 'assets/audio/nature-waves.mp3',
        color: '#3182ce'
    },
    stream: {
        name: 'Mountain Stream',
        file: 'assets/audio/nature-stream.mp3',
        color: '#319795'
    },
    thunder: {
        name: 'Distant Thunder',
        file: 'assets/audio/nature-thunder.mp3',
        color: '#553c9a'
    },
    cafe: {
        name: 'Coffee Shop',
        file: 'assets/audio/nature-cafe.mp3',
        color: '#d69e2e'
    }
};

// App State
let currentView = 'categories'; // 'categories', 'guided', 'selfguided'
let currentTool = ''; // 'nature', 'silent', 'mantra'
let currentSession = null;
let isPlaying = false;
let isPaused = false;
let currentTime = 0;
let totalDuration = 0;
let timerInterval = null;
let audioElement = null;
let bellAudio = null;
let currentMantra = 'Peace';
let mantraAnimation = 'fade';

// DOM Elements
const elements = {
    // Category selection
    guidedCard: document.getElementById('guidedCard'),
    selfGuidedCard: document.getElementById('selfGuidedCard'),
    
    // Interfaces
    categorySelector: document.querySelector('.category-selector'),
    guidedInterface: document.getElementById('guidedInterface'),
    selfGuidedInterface: document.getElementById('selfGuidedInterface'),
    
    // Session selection
    sessionGrid: document.getElementById('sessionGrid'),
    meditationPlayer: document.getElementById('meditationPlayer'),
    
    // Player elements
    currentSessionTitle: document.getElementById('currentSessionTitle'),
    currentSessionGoal: document.getElementById('currentSessionGoal'),
    meditationTimer: document.getElementById('meditationTimer'),
    meditationStatus: document.getElementById('meditationStatus'),
    meditationCircle: document.getElementById('meditationCircle'),
    progressFill: document.getElementById('progressFill'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    
    // Control buttons
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    stopBtn: document.getElementById('stopBtn'),
    backToGuided: document.getElementById('backToGuided'),
    
    // Tool players
    naturePlayer: document.getElementById('naturePlayer'),
    silentPlayer: document.getElementById('silentPlayer'),
    mantraPlayer: document.getElementById('mantraPlayer'),
    
    // Back buttons
    backToCategories: document.getElementById('backToCategories')
};

// Initialize the app
function init() {
    renderSessions();
    setupEventListeners();
    preloadAudio();
}

// Preload bell sound
function preloadAudio() {
    bellAudio = new Audio('assets/sounds/bell.mp3');
    bellAudio.preload = 'auto';
    bellAudio.volume = 0.5;
}

// Render meditation sessions
function renderSessions() {
    elements.sessionGrid.innerHTML = meditationSessions.map(session => `
        <div class="session-card" data-session="${session.id}">
            <div class="session-header">
                <h4 class="session-title">${session.title}</h4>
                <span class="session-time">${session.time}</span>
            </div>
            <p class="session-goal">${session.goal}</p>
            <p class="session-desc">${session.description}</p>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Category selection
    elements.guidedCard.addEventListener('click', () => showGuidedMeditation());
    elements.selfGuidedCard.addEventListener('click', () => showSelfGuided());
    
    // Session selection
    elements.sessionGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.session-card');
        if (card) {
            const sessionId = card.dataset.session;
            selectSession(sessionId);
        }
    });
    
    // Tool selection
    document.querySelector('.tool-grid').addEventListener('click', (e) => {
        const card = e.target.closest('.tool-card');
        if (card) {
            const tool = card.dataset.tool;
            selectTool(tool);
        }
    });
    
    // Player controls
    elements.playBtn.addEventListener('click', playMeditation);
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.stopBtn.addEventListener('click', stopMeditation);
    elements.backToGuided.addEventListener('click', () => showGuidedMeditation());
    
    // Back to categories
    elements.backToCategories.addEventListener('click', showCategories);
    
    // Tool back buttons
    document.querySelectorAll('.tool-back').forEach(btn => {
        btn.addEventListener('click', () => showSelfGuided());
    });
    
    // Nature sounds controls
    document.getElementById('natureStartBtn').addEventListener('click', startNatureSound);
    document.getElementById('naturePauseBtn').addEventListener('click', toggleNaturePause);
    document.getElementById('natureStopBtn').addEventListener('click', stopNatureSound);
    document.getElementById('natureVolume').addEventListener('input', updateNatureVolume);
    document.getElementById('soundSelect').addEventListener('change', updateSoundVisual);
    
    // Silent mode controls
    document.getElementById('silentStartBtn').addEventListener('click', startSilentMode);
    document.getElementById('silentPauseBtn').addEventListener('click', toggleSilentPause);
    document.getElementById('silentStopBtn').addEventListener('click', stopSilentMode);
    document.getElementById('testBellBtn').addEventListener('click', testBell);
    document.getElementById('bellOption').addEventListener('change', updateBellSetting);
    
    // Mantra focus controls
    document.getElementById('mantraStartBtn').addEventListener('click', startMantraFocus);
    document.getElementById('mantraPauseBtn').addEventListener('click', toggleMantraPause);
    document.getElementById('mantraStopBtn').addEventListener('click', stopMantraFocus);
    document.getElementById('mantraInput').addEventListener('input', updateMantra);
    document.getElementById('mantraStyle').addEventListener('change', updateMantraStyle);
    document.getElementById('mantraBreath').addEventListener('change', updateMantraBreath);
    
    // Duration changes
    document.getElementById('natureDuration').addEventListener('change', updateNatureDuration);
    document.getElementById('silentDuration').addEventListener('change', updateSilentDuration);
    document.getElementById('mantraDuration').addEventListener('change', updateMantraDuration);
}

// Show categories view
function showCategories() {
    currentView = 'categories';
    elements.categorySelector.hidden = false;
    elements.guidedInterface.hidden = true;
    elements.selfGuidedInterface.hidden = true;
    elements.backToCategories.hidden = true;
    stopAllPlayers();
}

// Show guided meditation
function showGuidedMeditation() {
    currentView = 'guided';
    elements.categorySelector.hidden = true;
    elements.guidedInterface.hidden = false;
    elements.selfGuidedInterface.hidden = true;
    elements.meditationPlayer.hidden = true;
    elements.backToCategories.hidden = false;
    stopAllPlayers();
}

// Show self-guided tools
function showSelfGuided() {
    currentView = 'selfguided';
    elements.categorySelector.hidden = true;
    elements.guidedInterface.hidden = true;
    elements.selfGuidedInterface.hidden = false;
    elements.backToCategories.hidden = false;
    
    // Hide all tool players
    elements.naturePlayer.hidden = true;
    elements.silentPlayer.hidden = true;
    elements.mantraPlayer.hidden = true;
    
    // Show tool selector
    document.querySelector('.tool-selector').hidden = false;
    stopAllPlayers();
}

// Select a meditation session
function selectSession(sessionId) {
    currentSession = meditationSessions.find(s => s.id === sessionId);
    if (!currentSession) return;
    
    // Update UI
    elements.currentSessionTitle.textContent = currentSession.title;
    elements.currentSessionGoal.textContent = currentSession.goal;
    elements.meditationTimer.textContent = formatTime(currentSession.duration);
    elements.totalTime.textContent = formatTime(currentSession.duration);
    elements.currentTime.textContent = '0:00';
    elements.progressFill.style.width = '0%';
    
    // Show player
    document.querySelector('.session-selector').hidden = true;
    elements.meditationPlayer.hidden = false;
    
    // Reset controls
    elements.playBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.stopBtn.disabled = false;
    elements.playBtn.textContent = 'Play Session';
    elements.pauseBtn.textContent = 'Pause';
    
    // Create audio element
    if (audioElement) {
        audioElement.pause();
        audioElement = null;
    }
    
    audioElement = new Audio(currentSession.audioFile);
    audioElement.addEventListener('ended', onMeditationEnded);
    audioElement.addEventListener('timeupdate', updateMeditationProgress);
}

// Select a tool
function selectTool(tool) {
    currentTool = tool;
    document.querySelector('.tool-selector').hidden = true;
    
    switch(tool) {
        case 'nature':
            elements.naturePlayer.hidden = false;
            initNatureSound();
            break;
        case 'silent':
            elements.silentPlayer.hidden = false;
            initSilentMode();
            break;
        case 'mantra':
            elements.mantraPlayer.hidden = false;
            initMantraFocus();
            break;
    }
}

// Play meditation
function playMeditation() {
    if (!audioElement || !currentSession) return;
    
    isPlaying = true;
    isPaused = false;
    
    // Update buttons
    elements.playBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    
    // Play audio
    audioElement.play().catch(e => {
        console.error('Audio play failed:', e);
        isPlaying = false;
        elements.playBtn.disabled = false;
        elements.pauseBtn.disabled = true;
    });
    
    // Start timer
    startTimer(currentSession.duration);
}

// Toggle pause
function togglePause() {
    if (!audioElement) return;
    
    isPaused = !isPaused;
    elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (isPaused) {
        audioElement.pause();
        clearInterval(timerInterval);
    } else {
        audioElement.play();
        startTimer(totalDuration - currentTime);
    }
}

// Stop meditation
function stopMeditation() {
    isPlaying = false;
    isPaused = false;
    
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
    
    clearInterval(timerInterval);
    
    // Reset UI
    elements.playBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';
    elements.meditationTimer.textContent = formatTime(currentSession.duration);
    elements.currentTime.textContent = '0:00';
    elements.progressFill.style.width = '0%';
    elements.meditationStatus.textContent = 'Ready';
    elements.meditationCircle.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
}

// Update meditation progress
function updateMeditationProgress() {
    if (!audioElement) return;
    
    currentTime = audioElement.currentTime;
    const progress = (currentTime / totalDuration) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.currentTime.textContent = formatTime(currentTime);
}

// When meditation ends
function onMeditationEnded() {
    isPlaying = false;
    elements.playBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.meditationStatus.textContent = 'Complete';
    clearInterval(timerInterval);
}

// Start timer
function startTimer(duration) {
    totalDuration = duration;
    currentTime = 0;
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!isPaused && isPlaying) {
            currentTime++;
            const timeLeft = totalDuration - currentTime;
            elements.meditationTimer.textContent = formatTime(timeLeft);
            
            // Update circle animation
            const pulseValue = 1 + (Math.sin(currentTime) * 0.05);
            elements.meditationCircle.style.transform = `scale(${pulseValue})`;
            
            if (currentTime >= totalDuration) {
                clearInterval(timerInterval);
                onMeditationEnded();
            }
        }
    }, 1000);
}

// --- Nature Sounds Functions ---
function initNatureSound() {
    const soundSelect = document.getElementById('soundSelect');
    updateSoundVisual();
    
    // Set initial timer
    const duration = parseInt(document.getElementById('natureDuration').value);
    updateNatureTimer(duration);
}

function updateSoundVisual() {
    const soundId = document.getElementById('soundSelect').value;
    const sound = natureSounds[soundId];
    if (sound) {
        document.getElementById('soundName').textContent = sound.name;
        document.getElementById('soundCircle').style.background = `linear-gradient(135deg, ${sound.color}, ${darkenColor(sound.color, 20)})`;
    }
}

function startNatureSound() {
    const soundId = document.getElementById('soundSelect').value;
    const duration = parseInt(document.getElementById('natureDuration').value);
    
    // In a real implementation, you would play the audio file
    // For now, we'll simulate it with a timer
    
    isPlaying = true;
    isPaused = false;
    
    document.getElementById('natureStartBtn').disabled = true;
    document.getElementById('naturePauseBtn').disabled = false;
    
    startNatureTimer(duration * 60); // Convert to seconds
}

function toggleNaturePause() {
    isPaused = !isPaused;
    document.getElementById('naturePauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
    
    if (isPaused) {
        clearInterval(timerInterval);
    } else {
        const duration = parseInt(document.getElementById('natureDuration').value);
        startNatureTimer(duration * 60 - currentTime);
    }
}

function stopNatureSound() {
    isPlaying = false;
    isPaused = false;
    clearInterval(timerInterval);
    
    document.getElementById('natureStartBtn').disabled = false;
    document.getElementById('naturePauseBtn').disabled = true;
    document.getElementById('naturePauseBtn').textContent = 'Pause';
    
    const duration = parseInt(document.getElementById('natureDuration').value);
    updateNatureTimer(duration);
}

function startNatureTimer(duration) {
    totalDuration = duration;
    currentTime = 0;
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!isPaused && isPlaying) {
            currentTime++;
            const timeLeft = totalDuration - currentTime;
            document.getElementById('soundTimer').textContent = formatTime(timeLeft);
            
            // Animate circle
            const soundCircle = document.getElementById('soundCircle');
            const scale = 1 + (Math.sin(currentTime * 0.5) * 0.03);
            soundCircle.style.transform = `scale(${scale})`;
            
            if (currentTime >= totalDuration && totalDuration > 0) {
                clearInterval(timerInterval);
                stopNatureSound();
            }
        }
    }, 1000);
}

function updateNatureTimer(minutes) {
    const seconds = minutes * 60;
    document.getElementById('soundTimer').textContent = formatTime(seconds);
}

function updateNatureDuration() {
    const duration = parseInt(document.getElementById('natureDuration').value);
    updateNatureTimer(duration);
}

function updateNatureVolume(e) {
    const value = e.target.value;
    document.getElementById('natureVolumeValue').textContent = `${value}%`;
    // In real implementation: audioElement.volume = value / 100;
}

// --- Silent Mode Functions ---
function initSilentMode() {
    const duration = parseInt(document.getElementById('silentDuration').value);
    updateSilentTimer(duration);
}

function startSilentMode() {
    const duration = parseInt(document.getElementById('silentDuration').value);
    const bellOption = document.getElementById('bellOption').value;
    
    isPlaying = true;
    isPaused = false;
    
    document.getElementById('silentStartBtn').disabled = true;
    document.getElementById('silentPauseBtn').disabled = false;
    
    // Play start bell if selected
    if (bellOption !== 'none') {
        playBell();
    }
    
    startSilentTimer(duration * 60, bellOption);
}

function toggleSilentPause() {
    isPaused = !isPaused;
    document.getElementById('silentPauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
    
    if (isPaused) {
        clearInterval(timerInterval);
    } else {
        const duration = parseInt(document.getElementById('silentDuration').value);
        const bellOption = document.getElementById('bellOption').value;
        startSilentTimer(duration * 60 - currentTime, bellOption);
    }
}

function stopSilentMode() {
    isPlaying = false;
    isPaused = false;
    clearInterval(timerInterval);
    
    document.getElementById('silentStartBtn').disabled = false;
    document.getElementById('silentPauseBtn').disabled = true;
    document.getElementById('silentPauseBtn').textContent = 'Pause';
    
    const duration = parseInt(document.getElementById('silentDuration').value);
    updateSilentTimer(duration);
    document.getElementById('silentStatus').textContent = 'Silence';
}

function startSilentTimer(duration, bellOption) {
    totalDuration = duration;
    currentTime = 0;
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!isPaused && isPlaying) {
            currentTime++;
            const timeLeft = totalDuration - currentTime;
            document.getElementById('silentTimer').textContent = formatTime(timeLeft);
            
            // Update status with breathing guidance
            const breathPhase = (currentTime % 8 < 4) ? 'Breathe In' : 'Breathe Out';
            document.getElementById('silentStatus').textContent = breathPhase;
            
            // Animate circle for breathing
            const silentCircle = document.getElementById('silentCircle');
            const isInhale = (currentTime % 8 < 4);
            const scale = isInhale ? 1 + (currentTime % 4) * 0.025 : 1 - (currentTime % 4) * 0.025;
            silentCircle.style.transform = `scale(${scale})`;
            
            // Play middle bell
            if (bellOption === 'all' && Math.abs(currentTime - totalDuration/2) < 1) {
                playBell();
            }
            
            if (currentTime >= totalDuration) {
                clearInterval(timerInterval);
                // Play end bell if selected
                if (bellOption === 'startend' || bellOption === 'all') {
                    playBell();
                }
                stopSilentMode();
            }
        }
    }, 1000);
}

function updateSilentTimer(minutes) {
    const seconds = minutes * 60;
    document.getElementById('silentTimer').textContent = formatTime(seconds);
}

function updateSilentDuration() {
    const duration = parseInt(document.getElementById('silentDuration').value);
    updateSilentTimer(duration);
}

function updateBellSetting() {
    // No action needed, setting is read when starting
}

function testBell() {
    playBell();
}

function playBell() {
    if (bellAudio) {
        bellAudio.currentTime = 0;
        bellAudio.play().catch(e => console.log('Bell play failed:', e));
    }
}

// --- Mantra Focus Functions ---
function initMantraFocus() {
    updateMantra();
    updateMantraStyle();
    
    const duration = parseInt(document.getElementById('mantraDuration').value);
    updateMantraTimer(duration);
}

function updateMantra() {
    currentMantra = document.getElementById('mantraInput').value || 'Peace';
    document.getElementById('mantraText').textContent = currentMantra;
}

function updateMantraStyle() {
    mantraAnimation = document.getElementById('mantraStyle').value;
    const mantraText = document.getElementById('mantraText');
    
    // Remove all animation classes
    mantraText.classList.remove('mantra-fade', 'mantra-pulse', 'mantra-breath', 'mantra-still');
    
    // Add selected animation class
    if (mantraAnimation !== 'still') {
        mantraText.classList.add(`mantra-${mantraAnimation}`);
    }
}

function updateMantraBreath() {
    const breathSync = document.getElementById('mantraBreath').value;
    // This would sync animation with breath timing in real implementation
}

function startMantraFocus() {
    const duration = parseInt(document.getElementById('mantraDuration').value);
    
    isPlaying = true;
    isPaused = false;
    
    document.getElementById('mantraStartBtn').disabled = true;
    document.getElementById('mantraPauseBtn').disabled = false;
    
    startMantraTimer(duration * 60);
}

function toggleMantraPause() {
    isPaused = !isPaused;
    document.getElementById('mantraPauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
    
    const mantraText = document.getElementById('mantraText');
    if (isPaused) {
        clearInterval(timerInterval);
        mantraText.style.animationPlayState = 'paused';
    } else {
        const duration = parseInt(document.getElementById('mantraDuration').value);
        startMantraTimer(duration * 60 - currentTime);
        mantraText.style.animationPlayState = 'running';
    }
}

function stopMantraFocus() {
    isPlaying = false;
    isPaused = false;
    clearInterval(timerInterval);
    
    document.getElementById('mantraStartBtn').disabled = false;
    document.getElementById('mantraPauseBtn').disabled = true;
    document.getElementById('mantraPauseBtn').textContent = 'Pause';
    
    const duration = parseInt(document.getElementById('mantraDuration').value);
    updateMantraTimer(duration);
    
    // Reset animation
    const mantraText = document.getElementById('mantraText');
    mantraText.style.animationPlayState = 'running';
}

function startMantraTimer(duration) {
    totalDuration = duration;
    currentTime = 0;
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!isPaused && isPlaying) {
            currentTime++;
            const timeLeft = totalDuration - currentTime;
            document.getElementById('mantraTimer').textContent = formatTime(timeLeft);
            
            // Change mantra color gradually
            const hue = (currentTime * 0.5) % 360;
            document.getElementById('mantraDisplay').style.background = 
                `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${hue + 20}, 70%, 50%))`;
            
            if (currentTime >= totalDuration) {
                clearInterval(timerInterval);
                stopMantraFocus();
            }
        }
    }, 1000);
}

function updateMantraTimer(minutes) {
    const seconds = minutes * 60;
    document.getElementById('mantraTimer').textContent = formatTime(seconds);
}

function updateMantraDuration() {
    const duration = parseInt(document.getElementById('mantraDuration').value);
    updateMantraTimer(duration);
}

// --- Utility Functions ---
function formatTime(seconds) {
    if (seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function darkenColor(color, percent) {
    // Simple color darkening for gradients
    return color; // In real implementation, would calculate darker shade
}

function stopAllPlayers() {
    // Stop any currently playing audio/timers
    isPlaying = false;
    isPaused = false;
    clearInterval(timerInterval);
    
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);