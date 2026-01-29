// Pomodoro Timer Presets
const timerPresets = {
    pomodoro: {
        name: "Pomodoro",
        icon: "🍅",
        focus: 25,
        break: 5,
        description: "Classic 25/5 technique for balanced workflow",
        color: "#667eea"
    },
    deepwork: {
        name: "Deep Work",
        icon: "🧠",
        focus: 50,
        break: 10,
        description: "Extended sessions for complex tasks",
        color: "#764ba2"
    },
    sprint: {
        name: "Quick Sprint",
        icon: "⚡",
        focus: 15,
        break: 3,
        description: "Short bursts for immediate tasks",
        color: "#ed8936"
    },
    custom: {
        name: "Custom Timer",
        icon: "⚙️",
        focus: 25,
        break: 5,
        description: "Set your own work/break duration",
        color: "#718096"
    }
};

// Break Activity Suggestions (Link to your existing features)
const breakActivities = [
    {
        name: "Breathing Exercise",
        description: "Calm your mind with guided breathing",
        icon: "🧘‍♂️",
        duration: "2 min",
        link: "breathing-exercise.html",
        color: "#4a6fa5"
    },
    {
        name: "Desk Stretches",
        description: "Relieve tension with quick stretches",
        icon: "💪",
        duration: "3 min",
        link: "desk-stretches.html",
        color: "#6ba368"
    },
    {
        name: "Quick Meditation",
        description: "Reset with a short meditation",
        icon: "🧠",
        duration: "3 min",
        link: "meditation.html",
        color: "#9B5DE5"
    },
    {
        name: "Eye Exercises",
        description: "Reduce digital eye strain",
        icon: "👁️",
        duration: "2 min",
        link: "eye-exercises.html",
        color: "#00BBF9"
    },
    {
        name: "Thought Dump",
        description: "Clear mental clutter",
        icon: "📝",
        duration: "4 min",
        link: "thought-dump.html",
        color: "#FF9F1C"
    },
    {
        name: "Gratitude Journal",
        description: "Practice thankfulness",
        icon: "🙏",
        duration: "3 min",
        link: "gratitude-journal.html",
        color: "#FF6B6B"
    }
];

// App State
let currentPreset = null;
let isRunning = false;
let isPaused = false;
let isBreakTime = false;
let currentPhase = 'focus'; // 'focus' or 'break'
let timeLeft = 0; // in seconds
let totalFocusTime = 0;
let completedSessions = 0;
let sessionsGoal = 4;
let currentSession = 1;
let timerInterval = null;
let autoBreakEnabled = true;
let soundMode = 'tones';
let volume = 0.5;
let currentTask = '';
let tasksCompleted = 0;
let streakDays = 0;
let audioContext = null;

// DOM Elements
const elements = {
    presetGrid: document.getElementById('presetGrid'),
    presetSelector: document.getElementById('presetSelector'),
    timerInterface: document.getElementById('timerInterface'),
    breakInterface: document.getElementById('breakInterface'),
    completeInterface: document.getElementById('completeInterface'),

    // Timer Interface
    timerCircle: document.getElementById('timerCircle'),
    timerPhase: document.getElementById('timerPhase'),
    timerDisplay: document.getElementById('timerDisplay'),
    sessionInfo: document.getElementById('sessionInfo'),
    taskInput: document.getElementById('taskInput'),
    taskCounter: document.getElementById('taskCounter'),
    focusStreak: document.getElementById('focusStreak'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resetBtn: document.getElementById('resetBtn'),
    autoBreak: document.getElementById('autoBreak'),
    soundMode: document.getElementById('soundMode'),
    volumeControl: document.getElementById('volumeControl'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    backToPresets: document.getElementById('backToPresets'),

    // Break Interface
    breakDuration: document.getElementById('breakDuration'),
    breakCircle: document.getElementById('breakCircle'),
    breakTimer: document.getElementById('breakTimer'),
    breakSuggestion: document.getElementById('breakSuggestion'),
    suggestionsGrid: document.getElementById('suggestionsGrid'),
    skipBreakBtn: document.getElementById('skipBreakBtn'),
    startBreakBtn: document.getElementById('startBreakBtn'),

    // Complete Interface
    completedSessions: document.getElementById('completedSessions'),
    totalFocusTime: document.getElementById('totalFocusTime'),
    streakDays: document.getElementById('streakDays'),
    accomplishmentInput: document.getElementById('accomplishmentInput'),
    saveAccomplishment: document.getElementById('saveAccomplishment'),
    startNextBtn: document.getElementById('startNextBtn'),
    takeBreakBtn: document.getElementById('takeBreakBtn'),
    endSessionBtn: document.getElementById('endSessionBtn')
};

// Initialize the app
function init() {
    renderPresetGrid();
    renderBreakSuggestions();
    setupEventListeners();
    loadUserStats();
    updateTaskCounter();
    updateStreak();
}

// Render preset selection grid
function renderPresetGrid() {
    elements.presetGrid.innerHTML = Object.entries(timerPresets).map(([key, preset]) => `
        <div class="preset-card" data-preset="${key}">
            <div class="preset-icon">${preset.icon}</div>
            <h3 class="preset-title">${preset.name}</h3>
            <div class="preset-times">${preset.focus}/${preset.break} min</div>
            <p class="preset-desc">${preset.description}</p>
        </div>
    `).join('');
}

// Render break activity suggestions
function renderBreakSuggestions() {
    elements.suggestionsGrid.innerHTML = breakActivities.map(activity => `
        <div class="suggestion-card" onclick="window.location.href='${activity.link}'">
            <div class="suggestion-icon">${activity.icon}</div>
            <div class="suggestion-content">
                <h4>${activity.name}</h4>
                <p>${activity.description} • ${activity.duration}</p>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Preset selection
    elements.presetGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.preset-card');
        if (card) {
            const preset = card.dataset.preset;
            selectPreset(preset);
        }
    });

    // Timer controls
    elements.startBtn.addEventListener('click', startTimer);
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.resetBtn.addEventListener('click', resetTimer);
    elements.backToPresets.addEventListener('click', showPresetSelector);

    // Break controls
    elements.skipBreakBtn.addEventListener('click', skipBreak);
    elements.startBreakBtn.addEventListener('click', startBreakTimer);

    // Complete interface
    elements.startNextBtn.addEventListener('click', startNextSession);
    elements.takeBreakBtn.addEventListener('click', () => showBreakInterface(true));
    elements.endSessionBtn.addEventListener('click', endSession);
    elements.saveAccomplishment.addEventListener('click', saveAccomplishment);

    // Task input
    elements.taskInput.addEventListener('change', (e) => {
        currentTask = e.target.value.trim();
        if (currentTask) {
            localStorage.setItem('pomodoro_current_task', currentTask);
        }
    });

    // Settings
    elements.autoBreak.addEventListener('change', (e) => {
        autoBreakEnabled = e.target.checked;
        localStorage.setItem('pomodoro_auto_break', autoBreakEnabled);
    });

    elements.soundMode.addEventListener('change', handleSoundModeChange);
    elements.volumeSlider.addEventListener('input', (e) => {
        updateVolume(parseInt(e.target.value));
    });

    // Load saved task
    const savedTask = localStorage.getItem('pomodoro_current_task');
    if (savedTask) {
        elements.taskInput.value = savedTask;
        currentTask = savedTask;
    }

    // Load auto-break setting
    const savedAutoBreak = localStorage.getItem('pomodoro_auto_break');
    if (savedAutoBreak !== null) {
        elements.autoBreak.checked = savedAutoBreak === 'true';
        autoBreakEnabled = elements.autoBreak.checked;
    }
}

// Load user statistics
function loadUserStats() {
    const stats = JSON.parse(localStorage.getItem('pomodoro_stats') || '{}');
    completedSessions = stats.completedSessions || 0;
    totalFocusTime = stats.totalFocusTime || 0;
    tasksCompleted = stats.tasksCompleted || 0;

    // Calculate streak
    const lastDate = localStorage.getItem('pomodoro_last_date');
    const today = new Date().toDateString();

    if (lastDate === today) {
        // Already used today, streak continues
        streakDays = parseInt(localStorage.getItem('pomodoro_streak') || '0');
    } else if (lastDate && isYesterday(lastDate)) {
        // Used yesterday, increment streak
        streakDays = parseInt(localStorage.getItem('pomodoro_streak') || '0') + 1;
        localStorage.setItem('pomodoro_streak', streakDays);
        localStorage.setItem('pomodoro_last_date', today);
    } else {
        // Broken streak or first time
        streakDays = 1;
        localStorage.setItem('pomodoro_streak', '1');
        localStorage.setItem('pomodoro_last_date', today);
    }
}

function isYesterday(dateString) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString() === dateString;
}

// Update task counter
function updateTaskCounter() {
    elements.taskCounter.textContent = `Tasks: ${tasksCompleted}`;
}

// Update streak display
function updateStreak() {
    elements.focusStreak.textContent = `🔥 ${streakDays}-day streak`;
}

// Select a preset
function selectPreset(presetKey) {
    currentPreset = presetKey;
    const preset = timerPresets[presetKey];

    // Reset to focus phase
    currentPhase = 'focus';
    isBreakTime = false;
    timeLeft = preset.focus * 60;
    currentSession = 1;

    // Update UI
    updateTimerDisplay();
    elements.timerPhase.textContent = 'Focus Time';
    elements.sessionInfo.textContent = `Session ${currentSession} of ${sessionsGoal}`;
    elements.timerCircle.className = 'timer-circle focus';

    // Show timer interface
    showTimerInterface();

    // Scroll to interface
    setTimeout(() => {
        elements.timerInterface.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// Show timer interface
function showTimerInterface() {
    elements.presetSelector.hidden = true;
    elements.timerInterface.hidden = false;
    elements.breakInterface.hidden = true;
    elements.completeInterface.hidden = true;
}

// Show preset selector
function showPresetSelector() {
    stopTimer();
    elements.presetSelector.hidden = false;
    elements.timerInterface.hidden = true;
    elements.breakInterface.hidden = true;
    elements.completeInterface.hidden = true;
}

// Show break interface
function showBreakInterface(manual = false) {
    if (!manual && !autoBreakEnabled) {
        // Auto-break disabled, go to next focus session
        startNextSession();
        return;
    }

    isBreakTime = true;
    const preset = timerPresets[currentPreset];
    timeLeft = preset.break * 60;

    elements.breakDuration.textContent = preset.break;
    updateBreakTimerDisplay();

    // Random break suggestion
    const randomActivity = breakActivities[Math.floor(Math.random() * breakActivities.length)];
    elements.breakSuggestion.textContent = randomActivity.name;

    elements.timerInterface.hidden = true;
    elements.breakInterface.hidden = false;

    // Play break start sound
    playSound('break_start');
}

// Show completion interface
function showCompletionInterface() {
    // Update stats
    elements.completedSessions.textContent = completedSessions;
    elements.totalFocusTime.textContent = totalFocusTime;
    elements.streakDays.textContent = streakDays;

    elements.timerInterface.hidden = true;
    elements.breakInterface.hidden = true;
    elements.completeInterface.hidden = false;

    // Play completion sound
    playSound('session_complete');
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    elements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update session info
    elements.sessionInfo.textContent = `Session ${currentSession} of ${sessionsGoal}`;

    // Visual warning when time is running low
    if (timeLeft <= 60 && timeLeft > 0) { // Last minute
        elements.timerCircle.classList.add('warning');
    } else if (currentPhase === 'focus') {
        elements.timerCircle.className = 'timer-circle focus';
    } else {
        elements.timerCircle.className = 'timer-circle break';
    }
}

// Update break timer display
function updateBreakTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    elements.breakTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Start timer
function startTimer() {
    if (isRunning) return;

    isRunning = true;
    isPaused = false;
    elements.startBtn.disabled = true;
    elements.pauseBtn.disabled = false;
    elements.pauseBtn.textContent = 'Pause';

    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeLeft--;

            if (currentPhase === 'focus') {
                updateTimerDisplay();
            } else {
                updateBreakTimerDisplay();
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;

                if (currentPhase === 'focus') {
                    // Focus session completed
                    completeFocusSession();
                } else {
                    // Break completed
                    completeBreakSession();
                }
            }
        }
    }, 1000);
}

// Toggle pause
function togglePause() {
    isPaused = !isPaused;
    elements.pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';

    if (isPaused) {
        playSound('pause');
    } else {
        playSound('resume');
    }
}

// Reset timer
function resetTimer() {
    stopTimer();

    const preset = timerPresets[currentPreset];
    timeLeft = currentPhase === 'focus' ? preset.focus * 60 : preset.break * 60;

    if (currentPhase === 'focus') {
        updateTimerDisplay();
    } else {
        updateBreakTimerDisplay();
    }

    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
    elements.pauseBtn.textContent = 'Pause';
}

// Stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isRunning = false;
    isPaused = false;
}

// Complete focus session
function completeFocusSession() {
    stopTimer();

    // Update statistics
    const preset = timerPresets[currentPreset];
    completedSessions++;
    totalFocusTime += preset.focus;

    if (currentTask) {
        tasksCompleted++;
        updateTaskCounter();
        currentTask = '';
        elements.taskInput.value = '';
        localStorage.removeItem('pomodoro_current_task');
    }

    // Save stats
    saveStats();

    // Check if reached goal
    if (currentSession >= sessionsGoal) {
        showCompletionInterface();
    } else {
        currentSession++;
        showBreakInterface();
    }

    playSound('focus_complete');
}

// Start break timer
function startBreakTimer() {
    isBreakTime = true;
    currentPhase = 'break';
    elements.breakInterface.hidden = true;
    elements.timerInterface.hidden = false;

    elements.timerPhase.textContent = 'Break Time';
    elements.timerCircle.className = 'timer-circle break';
    updateTimerDisplay();

    startTimer();
}

// Skip break
function skipBreak() {
    startNextSession();
}

// Complete break session
function completeBreakSession() {
    stopTimer();
    playSound('break_complete');
    startNextSession();
}

// Start next focus session
function startNextSession() {
    isBreakTime = false;
    currentPhase = 'focus';

    const preset = timerPresets[currentPreset];
    timeLeft = preset.focus * 60;

    elements.timerPhase.textContent = 'Focus Time';
    elements.timerCircle.className = 'timer-circle focus';
    updateTimerDisplay();

    elements.breakInterface.hidden = true;
    elements.completeInterface.hidden = true;
    elements.timerInterface.hidden = false;

    elements.startBtn.disabled = false;
    elements.pauseBtn.disabled = true;
}

// End session
function endSession() {
    showPresetSelector();
}

// Save accomplishment note
function saveAccomplishment() {
    const note = elements.accomplishmentInput.value.trim();
    if (note) {
        const notes = JSON.parse(localStorage.getItem('pomodoro_notes') || '[]');
        notes.push({
            date: new Date().toISOString(),
            note: note,
            sessions: completedSessions,
            focusTime: totalFocusTime
        });
        localStorage.setItem('pomodoro_notes', JSON.stringify(notes));

        elements.accomplishmentInput.value = '';
        showToast('Note saved!');
    }
}

// Save statistics
function saveStats() {
    const stats = {
        completedSessions: completedSessions,
        totalFocusTime: totalFocusTime,
        tasksCompleted: tasksCompleted,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('pomodoro_stats', JSON.stringify(stats));
}

// Sound functions (similar to breathing exercise)
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (soundMode === 'none' || !audioContext) return;

    if (soundMode === 'tones') {
        playToneSound(type);
    }
    // Voice sounds could be added later
}

function playToneSound(type) {
    if (audioContext.state !== 'running') return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies = {
        focus_complete: 800,
        break_start: 600,
        break_complete: 400,
        pause: 300,
        resume: 500,
        session_complete: [800, 600, 800]
    };

    if (type === 'session_complete') {
        // Play a sequence for session complete
        frequencies.session_complete.forEach((freq, index) => {
            setTimeout(() => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);

                osc.frequency.setValueAtTime(freq, audioContext.currentTime);
                gain.gain.setValueAtTime(0, audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

                osc.start();
                osc.stop(audioContext.currentTime + 0.3);
            }, index * 200);
        });
        return;
    }

    oscillator.frequency.setValueAtTime(frequencies[type] || 440, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

function handleSoundModeChange() {
    const mode = document.getElementById('soundMode').value;
    soundMode = mode;

    if (mode === 'none') {
        elements.volumeControl.classList.add('hidden');
    } else {
        initAudio();
        elements.volumeControl.classList.remove('hidden');
    }
}

function updateVolume(value) {
    volume = value / 100;
    elements.volumeValue.textContent = `${value}%`;
    localStorage.setItem('pomodoro_volume', value);
}

// Toast notification
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

// Load saved volume
const savedVolume = localStorage.getItem('pomodoro_volume');
if (savedVolume) {
    elements.volumeSlider.value = savedVolume;
    updateVolume(parseInt(savedVolume));
}