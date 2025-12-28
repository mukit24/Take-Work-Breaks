// Meditation Sessions Data
const meditationSessions = [
    {
        id: 'purposeful-pause',
        title: 'The Purposeful Pause',
        time: '30 sec',
        duration: 30, // seconds
        goal: 'Break a stress loop instantly',
        description: 'Focuses on three "anchor breaths" to lower the heart rate after a stressful email or notification.',
        audioFile: 'assets/sounds/close-eyes-palm.mp3'
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

// Nature Sounds Data - Add duration if known (optional)
const natureSounds = {
    forest: {
        name: 'Forest',
        file: 'assets/sounds/nature-forest.mp3',
        color: '#38b2ac',
        duration: null // Will be populated when loaded
    },
    rain: {
        name: 'Rain',
        file: 'assets/sounds/nature-rain.mp3',
        color: '#4c51bf',
        duration: null
    },
    waves: {
        name: 'Ocean Waves',
        file: 'assets/sounds/nature-waves.mp3',
        color: '#3182ce',
        duration: null
    },
    stream: {
        name: 'Mountain Stream',
        file: 'assets/sounds/nature-stream.mp3',
        color: '#319795',
        duration: null
    },
    thunder: {
        name: 'Distant Thunder',
        file: 'assets/sounds/nature-thunder.mp3',
        color: '#553c9a',
        duration: null
    }
};

// App State
let currentView = 'categories'; // 'categories', 'guided', 'selfguided'
let currentTool = ''; // 'nature', 'silent', 'mantra'
let currentSession = null;

// Guided Meditation State
let isPlaying = false;
let isPaused = false;
let currentTime = 0;
let totalDuration = 0;
let timerInterval = null;
let audioElement = null;

// Nature Sounds State (SEPARATE from guided meditation)
let natureAudio = null;
let isNaturePlaying = false;
let isNaturePaused = false;
let natureTimerInterval = null;
let natureCurrentTime = 0;
let natureSessionDuration = 0; // User-selected session time
let currentNatureSound = null;
let isNatureLoading = false;
let natureLoadingAbortController = null;

// Other State
let bellAudio = null;
let currentMantra = 'Peace';
let mantraAnimation = 'fade';

// DOM Elements
const elements = {
    guidedCard: document.getElementById('guidedCard'),
    selfGuidedCard: document.getElementById('selfGuidedCard'),
    categorySelector: document.querySelector('.category-selector'),
    guidedInterface: document.getElementById('guidedInterface'),
    selfGuidedInterface: document.getElementById('selfGuidedInterface'),
    sessionGrid: document.getElementById('sessionGrid'),
    meditationPlayer: document.getElementById('meditationPlayer'),
    currentSessionTitle: document.getElementById('currentSessionTitle'),
    currentSessionGoal: document.getElementById('currentSessionGoal'),
    meditationTimer: document.getElementById('meditationTimer'),
    meditationStatus: document.getElementById('meditationStatus'),
    meditationCircle: document.getElementById('meditationCircle'),
    progressFill: document.getElementById('progressFill'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    playBtn: document.getElementById('playBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    stopBtn: document.getElementById('stopBtn'),
    backToGuided: document.getElementById('backToGuided'),
    naturePlayer: document.getElementById('naturePlayer'),
    silentPlayer: document.getElementById('silentPlayer'),
    mantraPlayer: document.getElementById('mantraPlayer'),
    backToCategories: document.getElementById('backToCategories'),
    natureStartBtn: document.getElementById('natureStartBtn'),
    naturePauseBtn: document.getElementById('naturePauseBtn'),
    natureStopBtn: document.getElementById('natureStopBtn'),
    soundTimer: document.getElementById('soundTimer'),
    soundName: document.getElementById('soundName'),
    soundCircle: document.getElementById('soundCircle')
};

// Initialize the app
function init() {
    renderSessions();
    setupEventListeners();
    preloadBellSound();
}

// Preload only bell sound (small file)
function preloadBellSound() {
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
    elements.backToGuided.addEventListener('click', function () {
        document.querySelector('.session-selector').hidden = false;
        elements.meditationPlayer.hidden = true;
        stopMeditation();
    });

    // Back to categories
    elements.backToCategories.addEventListener('click', showCategories);

    // Tool back buttons
    document.querySelectorAll('.tool-back').forEach(btn => {
        btn.addEventListener('click', function () {
            showSelfGuided();
        });
    });

    // Nature sounds controls
    elements.natureStartBtn.addEventListener('click', startNatureSound);
    elements.naturePauseBtn.addEventListener('click', toggleNaturePause);
    elements.natureStopBtn.addEventListener('click', stopNatureSound);
    document.getElementById('natureVolume').addEventListener('input', updateNatureVolume);
    document.getElementById('soundSelect').addEventListener('change', handleSoundChange);

    // Load sound when dropdown changes
    document.getElementById('soundSelect').addEventListener('change', function () {
        const soundId = this.value;
        loadNatureSound(soundId);
    });

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

    // Reset any hidden states
    document.querySelector('.tool-selector').hidden = false;
    document.querySelector('.session-selector').hidden = false;
    elements.meditationPlayer.hidden = true;
    elements.naturePlayer.hidden = true;
    elements.silentPlayer.hidden = true;
    elements.mantraPlayer.hidden = true;
}

// Show guided meditation
function showGuidedMeditation() {
    currentView = 'guided';
    elements.categorySelector.hidden = true;
    elements.guidedInterface.hidden = false;
    elements.selfGuidedInterface.hidden = true;
    elements.backToCategories.hidden = false;
    stopAllPlayers();

    // Reset to session selector view
    document.querySelector('.session-selector').hidden = false;
    elements.meditationPlayer.hidden = true;

    // Hide any tool players that might be visible
    elements.naturePlayer.hidden = true;
    elements.silentPlayer.hidden = true;
    elements.mantraPlayer.hidden = true;
}

// Show self-guided tools
function showSelfGuided() {
    currentView = 'selfguided';
    elements.categorySelector.hidden = true;
    elements.guidedInterface.hidden = true;
    elements.selfGuidedInterface.hidden = false;
    elements.backToCategories.hidden = false;

    // Show tool selector and hide all tool players
    document.querySelector('.tool-selector').hidden = false;
    elements.naturePlayer.hidden = true;
    elements.silentPlayer.hidden = true;
    elements.mantraPlayer.hidden = true;

    // Hide meditation player if it was visible
    elements.meditationPlayer.hidden = true;
    document.querySelector('.session-selector').hidden = true;

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

    // Show player and hide session selector
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

    // Hide tool selector
    document.querySelector('.tool-selector').hidden = true;

    // Hide all tool players first
    elements.naturePlayer.hidden = true;
    elements.silentPlayer.hidden = true;
    elements.mantraPlayer.hidden = true;

    // Show the selected tool
    switch (tool) {
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

// ==================== NATURE SOUNDS FUNCTIONS ====================

function initNatureSound() {
    // Get initial sound from dropdown
    const soundId = document.getElementById('soundSelect').value;
    const duration = parseInt(document.getElementById('natureDuration').value);

    // Update visual and load sound
    updateSoundVisual(soundId);
    updateNatureTimer(duration);

    // Load the sound asynchronously
    loadNatureSound(soundId);
}

function updateSoundVisual(soundId) {
    const sound = natureSounds[soundId];
    if (sound) {
        elements.soundName.textContent = sound.name;
        elements.soundCircle.style.background = `linear-gradient(135deg, ${sound.color}, #2d3748)`;
    }
}

function handleSoundChange(e) {
    const soundId = e.target.value;
    updateSoundVisual(soundId);

    // If sound is currently playing, stop it and load new one
    if (isNaturePlaying && currentNatureSound === soundId) {
        return; // Already playing this sound
    }

    if (isNaturePlaying) {
        stopNatureSound();
    }

    loadNatureSound(soundId);
}

// Efficient lazy loading of nature sounds
async function loadNatureSound(soundId) {
    const sound = natureSounds[soundId];
    if (!sound) return;

    // Cancel previous loading if any
    if (natureLoadingAbortController) {
        natureLoadingAbortController.abort();
    }

    // Set loading state
    isNatureLoading = true;
    currentNatureSound = soundId;

    // Disable play button while loading
    elements.natureStartBtn.disabled = true;
    elements.natureStartBtn.textContent = 'Loading...';

    // Create new abort controller
    natureLoadingAbortController = new AbortController();

    try {
        // Clean up previous audio
        if (natureAudio) {
            natureAudio.pause();
            natureAudio = null;
        }

        // Create new audio element
        natureAudio = new Audio(sound.file);

        // Set up event listeners with abort signal
        const signal = natureLoadingAbortController.signal;

        // Wait for audio to be ready
        await new Promise((resolve, reject) => {
            if (signal.aborted) {
                reject(new Error('Loading cancelled'));
                return;
            }

            const onLoaded = () => {
                if (!signal.aborted) {
                    resolve();
                }
                cleanup();
            };

            const onError = (e) => {
                if (!signal.aborted) {
                    reject(e);
                }
                cleanup();
            };

            const cleanup = () => {
                natureAudio.removeEventListener('canplaythrough', onLoaded);
                natureAudio.removeEventListener('error', onError);
                signal.removeEventListener('abort', onAbort);
            };

            const onAbort = () => {
                reject(new Error('Loading cancelled'));
                cleanup();
            };

            natureAudio.addEventListener('canplaythrough', onLoaded, { once: true });
            natureAudio.addEventListener('error', onError, { once: true });
            signal.addEventListener('abort', onAbort, { once: true });

            // Start loading
            natureAudio.preload = 'auto';
            natureAudio.load();
        });

        // Audio loaded successfully
        console.log(`Loaded nature sound: ${sound.name}`);

        // Configure audio properties
        natureAudio.loop = true;
        natureAudio.volume = parseInt(document.getElementById('natureVolume').value) / 100;

        // Set up smooth loop
        setupSmoothLoop(natureAudio);

        // Enable play button
        elements.natureStartBtn.disabled = false;
        elements.natureStartBtn.textContent = 'Start Soundscape';

        // Store duration if not already known
        if (!sound.duration || sound.duration !== natureAudio.duration) {
            sound.duration = natureAudio.duration;
        }

    } catch (error) {
        if (error.message !== 'Loading cancelled') {
            console.error('Failed to load nature sound:', error);

            // Show error state
            elements.natureStartBtn.textContent = 'Load Failed';
            elements.natureStartBtn.disabled = true;

            // Reset after delay
            setTimeout(() => {
                if (currentNatureSound === soundId) {
                    elements.natureStartBtn.textContent = 'Start Soundscape';
                    elements.natureStartBtn.disabled = false;
                }
            }, 2000);
        }
    } finally {
        isNatureLoading = false;
        natureLoadingAbortController = null;
    }
}

// Simple fade-based solution using only standard Audio API
function setupSmoothLoop(audioElement) {
    // Ensure loop is enabled
    audioElement.loop = true;

    // Remove any existing listener to avoid duplicates
    audioElement.removeEventListener('timeupdate', handleSmoothFade);

    // Define the fade handler
    function handleSmoothFade() {
        const fadeTime = 3; // 3-second fade
        const currentTime = audioElement.currentTime;
        const duration = audioElement.duration;

        // Safety check
        if (!duration || !isFinite(duration) || duration <= 0) return;

        // Get current volume from slider
        const volumeSlider = document.getElementById('natureVolume');
        const targetVolume = volumeSlider ? parseInt(volumeSlider.value) / 100 : 0.5;

        // Fade out at the end (last 3 seconds)
        if (duration - currentTime < fadeTime) {
            const fadeProgress = (duration - currentTime) / fadeTime;
            audioElement.volume = Math.max(0.01, fadeProgress * targetVolume); // Never go to 0
        }
        // Fade in at the start (first 3 seconds after loop)
        else if (currentTime < fadeTime) {
            const fadeProgress = currentTime / fadeTime;
            audioElement.volume = Math.min(1, fadeProgress * targetVolume);
        }
        // Middle section - full target volume
        else {
            audioElement.volume = targetVolume;
        }
    }

    // Add the event listener
    audioElement.addEventListener('timeupdate', handleSmoothFade);

    // Also update volume when slider changes
    const volumeSlider = document.getElementById('natureVolume');
    if (volumeSlider) {
        // Remove existing listener to avoid duplicates
        volumeSlider.removeEventListener('input', updateVolumeForLoop);

        function updateVolumeForLoop() {
            const targetVolume = parseInt(volumeSlider.value) / 100;

            // If currently in fade zone, don't override fade
            const currentTime = audioElement.currentTime;
            const duration = audioElement.duration;
            const fadeTime = 3;

            if (duration && isFinite(duration)) {
                // Only update if not in fade zone
                if (!(duration - currentTime < fadeTime) && !(currentTime < fadeTime)) {
                    audioElement.volume = targetVolume;
                }
            }
        }

        volumeSlider.addEventListener('input', updateVolumeForLoop);
    }
}

function startNatureSound() {
    if (!natureAudio || isNatureLoading) return;
    // QUICK FIX: Reset volume and position
    natureAudio.volume = parseInt(document.getElementById('natureVolume').value) / 100;
    natureAudio.currentTime = 0;
    const sessionDuration = parseInt(document.getElementById('natureDuration').value);

    // Start playing
    natureAudio.play().then(() => {
        isNaturePlaying = true;
        isNaturePaused = false;

        // Update UI
        elements.natureStartBtn.disabled = true;
        elements.naturePauseBtn.disabled = false;

        // Start timer
        if (sessionDuration === 0) {
            // "No limit" mode
            startUnlimitedNatureTimer();
        } else {
            // Fixed duration mode
            natureSessionDuration = sessionDuration * 60;
            natureCurrentTime = 0;
            startNatureCountdownTimer();
        }

    }).catch(error => {
        console.error('Failed to play nature sound:', error);
        elements.natureStartBtn.textContent = 'Play Failed';
    });
}

function toggleNaturePause() {
    if (!natureAudio || !isNaturePlaying) return;

    if (isNaturePaused) {
        // Resume
        natureAudio.play();
        isNaturePaused = false;
        elements.naturePauseBtn.textContent = 'Pause';

        // Resume timer
        const sessionDuration = parseInt(document.getElementById('natureDuration').value);
        if (sessionDuration === 0) {
            resumeUnlimitedNatureTimer();
        } else {
            resumeNatureCountdownTimer();
        }
    } else {
        // Pause
        natureAudio.pause();
        isNaturePaused = true;
        elements.naturePauseBtn.textContent = 'Resume';

        // Pause timer
        clearInterval(natureTimerInterval);
    }
}

function stopNatureSound() {
    // Stop audio
    if (natureAudio) {
        natureAudio.pause();
        natureAudio.currentTime = 0;
    }

    // Stop timer
    clearInterval(natureTimerInterval);

    // Reset state
    isNaturePlaying = false;
    isNaturePaused = false;
    natureCurrentTime = 0;

    // Reset UI
    elements.natureStartBtn.disabled = false;
    elements.naturePauseBtn.disabled = true;
    elements.naturePauseBtn.textContent = 'Pause';

    // Reset timer display
    const duration = parseInt(document.getElementById('natureDuration').value);
    updateNatureTimer(duration);

    // Reset circle animation
    elements.soundCircle.style.transform = 'scale(1)';
}

function startNatureCountdownTimer() {
    clearInterval(natureTimerInterval);

    natureTimerInterval = setInterval(() => {
        if (!natureAudio || natureAudio.paused || isNaturePaused) return;

        natureCurrentTime++;
        const timeLeft = Math.max(0, natureSessionDuration - natureCurrentTime);

        // Update display
        elements.soundTimer.textContent = formatTime(timeLeft);

        // Animate circle
        const scale = 1 + (Math.sin(natureCurrentTime * 0.5) * 0.03);
        elements.soundCircle.style.transform = `scale(${scale})`;

        // Check if session ended
        if (natureCurrentTime >= natureSessionDuration) {
            clearInterval(natureTimerInterval);
            stopNatureSound();
        }
    }, 1000);
}

function startUnlimitedNatureTimer() {
    clearInterval(natureTimerInterval);
    natureCurrentTime = 0;

    // Show infinity symbol
    elements.soundTimer.textContent = '∞';

    natureTimerInterval = setInterval(() => {
        if (!natureAudio || natureAudio.paused || isNaturePaused) return;

        natureCurrentTime++;

        // Update display (count up)
        elements.soundTimer.textContent = formatTime(natureCurrentTime);

        // Animate circle
        const scale = 1 + (Math.sin(natureCurrentTime * 0.5) * 0.03);
        elements.soundCircle.style.transform = `scale(${scale})`;
    }, 1000);
}

function resumeNatureCountdownTimer() {
    // Get remaining time from display
    const timerText = elements.soundTimer.textContent;
    if (timerText === '∞') return;

    const [mins, secs] = timerText.split(':').map(Number);
    const timeLeft = mins * 60 + secs;

    natureCurrentTime = natureSessionDuration - timeLeft;
    startNatureCountdownTimer();
}

function resumeUnlimitedNatureTimer() {
    // Get current time from display
    const timerText = elements.soundTimer.textContent;
    if (timerText !== '∞') {
        const [mins, secs] = timerText.split(':').map(Number);
        natureCurrentTime = mins * 60 + secs;
    }
    startUnlimitedNatureTimer();
}

function updateNatureTimer(minutes) {
    if (minutes === 0) {
        elements.soundTimer.textContent = '∞';
    } else {
        const seconds = minutes * 60;
        elements.soundTimer.textContent = formatTime(seconds);
    }
}

function updateNatureVolume(e) {
    const value = e.target.value;
    document.getElementById('natureVolumeValue').textContent = `${value}%`;
    
    // Update audio volume if playing
    if (natureAudio) {
        const targetVolume = value / 100;
        const currentTime = natureAudio.currentTime;
        const duration = natureAudio.duration;
        const fadeTime = 3;
        
        // Only update if not currently in a fade zone
        if (duration && isFinite(duration)) {
            const isFadingOut = (duration - currentTime < fadeTime);
            const isFadingIn = (currentTime < fadeTime);
            
            if (!isFadingOut && !isFadingIn) {
                natureAudio.volume = targetVolume;
            }
            // If in fade zone, the timeupdate handler will adjust it
        }
    }
}

function updateNatureDuration() {
    const duration = parseInt(document.getElementById('natureDuration').value);
    updateNatureTimer(duration);

    // If currently playing with a fixed duration, update the timer
    if (isNaturePlaying && !isNaturePaused && duration !== 0) {
        const sessionDuration = duration * 60;
        const progress = natureCurrentTime / natureSessionDuration;
        natureSessionDuration = sessionDuration;
        natureCurrentTime = Math.floor(sessionDuration * progress);

        // Restart timer with new duration
        clearInterval(natureTimerInterval);
        startNatureCountdownTimer();
    }
}

// ==================== GUIDED MEDITATION FUNCTIONS ====================

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

function updateMeditationProgress() {
    if (!audioElement) return;

    currentTime = audioElement.currentTime;
    const progress = (currentTime / totalDuration) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.currentTime.textContent = formatTime(currentTime);
}

function onMeditationEnded() {
    isPlaying = false;
    elements.playBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.meditationStatus.textContent = 'Complete';
    clearInterval(timerInterval);
}

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

// ==================== SILENT MODE FUNCTIONS ====================

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
            if (bellOption === 'all' && Math.abs(currentTime - totalDuration / 2) < 1) {
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

// ==================== MANTRA FOCUS FUNCTIONS ====================

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

// ==================== UTILITY FUNCTIONS ====================

function formatTime(seconds) {
    if (seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function stopAllPlayers() {
    // Stop guided meditation
    if (isPlaying) {
        stopMeditation();
    }

    // Stop nature sounds
    if (isNaturePlaying) {
        stopNatureSound();
    }

    // Stop silent mode
    if (document.getElementById('silentStartBtn')) {
        document.getElementById('silentStartBtn').disabled = false;
        document.getElementById('silentPauseBtn').disabled = true;
    }

    // Stop mantra focus
    if (document.getElementById('mantraStartBtn')) {
        document.getElementById('mantraStartBtn').disabled = false;
        document.getElementById('mantraPauseBtn').disabled = true;
    }

    // Clear any intervals
    clearInterval(timerInterval);
    clearInterval(natureTimerInterval);
    isPlaying = false;
    isPaused = false;
    isNaturePlaying = false;
    isNaturePaused = false;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);