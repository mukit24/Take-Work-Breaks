// Timer Types
const timerTypes = {
    pomodoro: {
        name: "Pomodoro",
        icon: "🍅",
        workTime: 25, // minutes
        breakTime: 5,
        description: "Classic 25/5 technique for balanced productivity"
    },
    deepwork: {
        name: "Deep Work",
        icon: "🧠",
        workTime: 50,
        breakTime: 10,
        description: "Extended 50/10 sessions for complex tasks"
    },
    custom: {
        name: "Custom",
        icon: "⚙️",
        workTime: 25,
        breakTime: 5,
        description: "Set your own work and break times"
    }
};

// Break Activity Suggestions
const breakActivities = [
    {
        name: "Breathing Exercise",
        description: "Calm your mind in 2 minutes",
        icon: "🧘‍♂️",
        link: "breathing-exercise.html"
    },
    {
        name: "Desk Stretches",
        description: "Relieve tension in 3 minutes",
        icon: "💪",
        link: "desk-stretches.html"
    },
    {
        name: "Quick Meditation",
        description: "Reset with 3-minute meditation",
        icon: "🧠",
        link: "meditation.html"
    },
    {
        name: "Eye Exercises",
        description: "Reduce eye strain in 2 minutes",
        icon: "👁️",
        link: "eye-exercises.html"
    },
    {
        name: "Thought Dump",
        description: "Clear mental clutter in 4 minutes",
        icon: "📝",
        link: "thought-dump.html"
    },
    {
        name: "Gratitude Journal",
        description: "Practice thankfulness in 3 minutes",
        icon: "🙏",
        link: "gratitude-journal.html"
    }
];

// App State
let currentTimerType = null;
let currentSession = 1;
let totalSessions = 4;
let currentPhase = 'work'; // 'work' or 'break'
let timeLeft = 0; // in seconds
let isRunning = false;
let isPaused = false;
let timerInterval = null;
let autoCycle = false;
let soundsEnabled = true;
let volume = 0.5;
let audioContext = null;
let currentTask = '';
let tasks = {}; // Store tasks for each session

// Today's data for reporting
let todayData = {
    date: new Date().toDateString(),
    sessions: [],
    totalWorkTime: 0,
    totalBreakTime: 0,
    tasks: {}
};

// DOM Elements
const elements = {
    // Overview
    overviewCard: document.getElementById('overviewCard'),
    overviewStats: document.getElementById('overviewStats'),
    clearTodayBtn: document.getElementById('clearTodayBtn'),
    generateReportBtn: document.getElementById('generateReportBtn'),
    continueTimerBtn: document.getElementById('continueTimerBtn'),

    // Timer Selection
    timerSelector: document.getElementById('timerSelector'),
    timerGrid: document.getElementById('timerGrid'),

    // Setup Interface
    setupInterface: document.getElementById('setupInterface'),
    setupTitle: document.getElementById('setupTitle'),
    sessionCount: document.getElementById('sessionCount'),
    autoCycle: document.getElementById('autoCycle'),
    customTimesGroup: document.getElementById('customTimesGroup'),
    workTime: document.getElementById('workTime'),
    breakTime: document.getElementById('breakTime'),
    soundToggle: document.getElementById('soundToggle'),
    volumeControl: document.getElementById('volumeControl'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue'),
    startSessionBtn: document.getElementById('startSessionBtn'),
    backToSelection: document.getElementById('backToSelection'),

    // Running Interface
    runningInterface: document.getElementById('runningInterface'),
    sessionCounter: document.getElementById('sessionCounter'),
    runningTimerType: document.getElementById('runningTimerType'),
    phaseIcon: document.getElementById('phaseIcon'),
    phaseText: document.getElementById('phaseText'),
    timerCircle: document.getElementById('timerCircle'),
    timerTime: document.getElementById('timerTime'),
    timerLabel: document.getElementById('timerLabel'),
    currentTaskInput: document.getElementById('currentTaskInput'),
    saveTaskBtn: document.getElementById('saveTaskBtn'),
    startPauseBtn: document.getElementById('startPauseBtn'),
    startPauseIcon: document.getElementById('startPauseIcon'),
    startPauseText: document.getElementById('startPauseText'),
    resetTimerBtn: document.getElementById('resetTimerBtn'),
    skipPhaseBtn: document.getElementById('skipPhaseBtn'),
    progressFill: document.getElementById('progressFill'),
    completedSessions: document.getElementById('completedSessions'),
    totalTimeToday: document.getElementById('totalTimeToday'),
    breakSuggestions: document.getElementById('breakSuggestions'),
    suggestionsGrid: document.getElementById('suggestionsGrid'),
    endSessionBtn: document.getElementById('endSessionBtn'),
    backToSetup: document.getElementById('backToSetup'),

    // Complete Interface
    completeInterface: document.getElementById('completeInterface'),
    completeIcon: document.getElementById('completeIcon'),
    completeTitle: document.getElementById('completeTitle'),
    completeSubtitle: document.getElementById('completeSubtitle'),
    sessionSummary: document.getElementById('sessionSummary'),
    startNextSessionBtn: document.getElementById('startNextSessionBtn'),
    takeBreakBtn: document.getElementById('takeBreakBtn'),
    endAllSessionsBtn: document.getElementById('endAllSessionsBtn'),
    generatePdfBtn: document.getElementById('generatePdfBtn'),
    generateImageBtn: document.getElementById('generateImageBtn'),
    copyReportBtn: document.getElementById('copyReportBtn'),

    // Report Modal
    reportModal: document.getElementById('reportModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalReportContent: document.getElementById('modalReportContent')
};

// Initialize the app
function init() {
    elements.reportModal.hidden = true;

    loadTodayData();
    checkShowOverview();
    renderTimerGrid();
    renderBreakSuggestions();
    setupEventListeners();
    initAudio();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Load today's data from localStorage
function loadTodayData() {
    const savedData = localStorage.getItem('productivity_timer_today');
    if (savedData) {
        todayData = JSON.parse(savedData);

        // Check if it's still today
        if (todayData.date !== new Date().toDateString()) {
            // It's a new day, clear old data
            todayData = {
                date: new Date().toDateString(),
                sessions: [],
                totalWorkTime: 0,
                totalBreakTime: 0,
                tasks: {}
            };
            saveTodayData();
        }
    }
}

// Save today's data to localStorage
function saveTodayData() {
    localStorage.setItem('productivity_timer_today', JSON.stringify(todayData));
}

// Check if we should show overview card
function checkShowOverview() {
    if (todayData.sessions.length > 0) {
        showOverviewCard();
    } else {
        hideOverviewCard();
    }
}

// Show overview card with today's stats
function showOverviewCard() {
    // Update stats display
    const totalSessions = todayData.sessions.length;
    const totalWorkMinutes = Math.floor(todayData.totalWorkTime / 60);
    const totalTasks = Object.keys(todayData.tasks).length;

    elements.overviewStats.innerHTML = `
        <div class="stat-item">
            <span class="stat-value">${totalSessions}</span>
            <span class="stat-label">Sessions</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${totalWorkMinutes}</span>
            <span class="stat-label">Minutes</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${totalTasks}</span>
            <span class="stat-label">Tasks</span>
        </div>
    `;

    elements.overviewCard.hidden = false;
    elements.timerSelector.hidden = true;
}

function hideOverviewCard() {
    elements.overviewCard.hidden = true;
    elements.timerSelector.hidden = false;
}

// Render timer selection grid
function renderTimerGrid() {
    elements.timerGrid.innerHTML = Object.entries(timerTypes).map(([key, timer]) => `
        <div class="timer-card" data-timer="${key}">
            <div class="timer-icon">${timer.icon}</div>
            <h3 class="timer-title">${timer.name}</h3>
            <div class="timer-times">${key === 'custom' ? 'X/X min' : `${timer.workTime}/${timer.breakTime} min`}</div>
            <p class="timer-desc">${timer.description}</p>
        </div>
    `).join('');
}

// Render break suggestions
function renderBreakSuggestions() {
    elements.suggestionsGrid.innerHTML = breakActivities.map(activity => `
        <div class="suggestion-item" onclick="window.location.href='${activity.link}'">
            <div class="suggestion-icon">${activity.icon}</div>
            <div class="suggestion-text">
                <strong>${activity.name}</strong>
                <small>${activity.description}</small>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Overview buttons
    elements.clearTodayBtn.addEventListener('click', clearTodayData);
    elements.generateReportBtn.addEventListener('click', generateReport);
    elements.continueTimerBtn.addEventListener('click', hideOverviewCard);

    // Timer selection
    elements.timerGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.timer-card');
        if (card) {
            const timerType = card.dataset.timer;
            selectTimerType(timerType);
        }
    });

    // Setup controls
    elements.sessionCount.addEventListener('change', updateSessionCount);
    elements.workTime.addEventListener('change', updateCustomTimes);
    elements.breakTime.addEventListener('change', updateCustomTimes);
    elements.soundToggle.addEventListener('change', toggleSounds);
    elements.volumeSlider.addEventListener('input', updateVolume);
    elements.startSessionBtn.addEventListener('click', startTimerSession);
    elements.backToSelection.addEventListener('click', showTimerSelector);

    // Running controls
    elements.saveTaskBtn.addEventListener('click', saveCurrentTask);
    elements.startPauseBtn.addEventListener('click', toggleTimer);
    elements.resetTimerBtn.addEventListener('click', resetCurrentPhase);
    elements.skipPhaseBtn.addEventListener('click', skipCurrentPhase);
    elements.endSessionBtn.addEventListener('click', endTimerSession);
    elements.backToSetup.addEventListener('click', showSetupInterface);
    

    // Complete interface
    elements.startNextSessionBtn.addEventListener('click', startNextSession);
    elements.takeBreakBtn.addEventListener('click', startBreak);
    elements.endAllSessionsBtn.addEventListener('click', endAllSessions);
    elements.generatePdfBtn.addEventListener('click', generatePdfReport);
    elements.generateImageBtn.addEventListener('click', generateImageReport);
    elements.copyReportBtn.addEventListener('click', copyReportToClipboard);

    // Report modal
    elements.closeModalBtn.addEventListener('click', () => {
        elements.reportModal.hidden = true;
    });

    // Close modal on background click
    elements.reportModal.addEventListener('click', (e) => {
        if (e.target === elements.reportModal) {
            elements.reportModal.hidden = true;
        }
    });
}

// Initialize audio
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Clear today's data
function clearTodayData() {
    if (confirm('Clear all data from today? This cannot be undone.')) {
        todayData = {
            date: new Date().toDateString(),
            sessions: [],
            totalWorkTime: 0,
            totalBreakTime: 0,
            tasks: {}
        };
        saveTodayData();
        hideOverviewCard();
        showToast('Today\'s data cleared');
    }
}

// Select timer type
function selectTimerType(timerType) {
    currentTimerType = timerType;
    const timer = timerTypes[timerType];

    // Update setup interface
    elements.setupTitle.textContent = `Setup ${timer.name} Timer`;
    // Show/hide custom times
    elements.customTimesGroup.hidden = timerType !== 'custom';

    // Set default values
    if (timerType === 'custom') {
        elements.workTime.value = timer.workTime;
        elements.breakTime.value = timer.breakTime;
    }

    // Show setup interface
    showSetupInterface();
}

// Show setup interface
function showSetupInterface() {
    stopTimer();
    elements.overviewCard.hidden = true;
    elements.timerSelector.hidden = true;
    elements.setupInterface.hidden = false;
    elements.runningInterface.hidden = true;
    elements.completeInterface.hidden = true;
}

// Show timer selector
function showTimerSelector() {
    elements.overviewCard.hidden = true;
    elements.timerSelector.hidden = false;
    elements.setupInterface.hidden = true;
    elements.runningInterface.hidden = true;
    elements.completeInterface.hidden = true;
}

// Update session count
function updateSessionCount() {
    totalSessions = parseInt(elements.sessionCount.value);
}

// Update custom times
function updateCustomTimes() {
    if (currentTimerType === 'custom') {
        timerTypes.custom.workTime = parseInt(elements.workTime.value);
        timerTypes.custom.breakTime = parseInt(elements.breakTime.value);
    }
}

// Toggle sounds
function toggleSounds() {
    soundsEnabled = elements.soundToggle.checked;
    elements.volumeControl.style.display = soundsEnabled ? 'flex' : 'none';
}

// Update volume
function updateVolume() {
    volume = elements.volumeSlider.value / 100;
    elements.volumeValue.textContent = `${elements.volumeSlider.value}%`;
}

// Start timer session
function startTimerSession() {
    totalSessions = parseInt(elements.sessionCount.value);
    autoCycle = elements.autoCycle.checked;
    currentSession = 1;
    tasks = {};

    // Initialize first session
    startNewSession();

    // Show running interface
    showRunningInterface();
}

// Show running interface
function showRunningInterface() {
    elements.setupInterface.hidden = true;
    elements.runningInterface.hidden = false;
    elements.completeInterface.hidden = true;

    // Update UI
    updateRunningUI();
    updateProgress();
}

// Start new session
function startNewSession() {
    currentPhase = 'work';
    const timer = timerTypes[currentTimerType];
    timeLeft = timer.workTime * 60;

    // Update UI
    elements.phaseIcon.textContent = '🎯';
    elements.phaseText.textContent = 'WORK TIME';
    elements.timerLabel.textContent = 'Focus Time';
    elements.timerCircle.className = 'timer-circle work';

    // Clear task input
    elements.currentTaskInput.value = tasks[currentSession] || '';
    currentTask = tasks[currentSession] || '';

    // Update session counter
    elements.sessionCounter.textContent = `Session ${currentSession} of ${totalSessions}`;
    elements.runningTimerType.textContent = `${timer.icon} ${timer.name}`;

    // Update timer display
    updateTimerDisplay();

    // Reset buttons
    elements.startPauseBtn.disabled = false;
    elements.startPauseIcon.textContent = '▶️';
    elements.startPauseText.textContent = 'Start';
    elements.skipPhaseBtn.disabled = true;

    // Hide break suggestions
    elements.breakSuggestions.hidden = true;
}

// Update running UI
function updateRunningUI() {
    updateTimerDisplay();
    updateProgress();
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    elements.timerTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Visual warning for last minute
    if (timeLeft <= 60) {
        elements.timerCircle.classList.add('warning');
    } else {
        elements.timerCircle.classList.remove('warning');
    }
}

// Save current task
function saveCurrentTask() {
    currentTask = elements.currentTaskInput.value.trim();
    if (currentTask) {
        tasks[currentSession] = currentTask;
        showToast('Task saved for this session');
    }
}

// Toggle timer (start/pause)
function toggleTimer() {
    if (!isRunning) {
        startTimer();
        elements.startPauseIcon.textContent = '⏸️';
        elements.startPauseText.textContent = 'Pause';
        elements.skipPhaseBtn.disabled = false;
    } else {
        if (isPaused) {
            resumeTimer();
            elements.startPauseIcon.textContent = '⏸️';
            elements.startPauseText.textContent = 'Pause';
        } else {
            pauseTimer();
            elements.startPauseIcon.textContent = '▶️';
            elements.startPauseText.textContent = 'Resume';
        }
    }
}

// Start timer
function startTimer() {
    if (isRunning) return;

    isRunning = true;
    isPaused = false;

    // Play start sound
    if (soundsEnabled) {
        playSound(currentPhase === 'work' ? 'work_start' : 'break_start');
    }

    // Send notification
    sendNotification(`${currentPhase === 'work' ? 'Work' : 'Break'} session started!`);

    timerInterval = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                isRunning = false;

                // Phase completed
                completeCurrentPhase();
            }
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    isPaused = true;
    if (soundsEnabled) {
        playSound('pause');
    }
}

// Resume timer
function resumeTimer() {
    isPaused = false;
    if (soundsEnabled) {
        playSound('resume');
    }
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

// Reset current phase
function resetCurrentPhase() {
    stopTimer();

    const timer = timerTypes[currentTimerType];
    timeLeft = currentPhase === 'work' ? timer.workTime * 60 : timer.breakTime * 60;

    updateTimerDisplay();
    elements.startPauseIcon.textContent = '▶️';
    elements.startPauseText.textContent = 'Start';
    elements.skipPhaseBtn.disabled = true;
}

// Skip current phase
function skipCurrentPhase() {
    if (!confirm(`Skip current ${currentPhase} session?`)) return;

    stopTimer();
    completeCurrentPhase();
}

// Complete current phase
function completeCurrentPhase() {
    // Play completion sound
    if (soundsEnabled) {
        playSound(currentPhase === 'work' ? 'work_end' : 'break_end');
    }

    // Send notification
    sendNotification(`${currentPhase === 'work' ? 'Work' : 'Break'} session completed!`);

    // Record session data
    if (currentPhase === 'work') {
        recordWorkSession();
    } else {
        recordBreakSession();
    }

    // Determine next action
    if (currentPhase === 'work') {
        // Work session completed, start break or next work session
        if (autoCycle) {
            startBreak();
        } else {
            showCompleteInterface('work');
        }
    } else {
        // Break completed, start next work session or finish
        if (currentSession >= totalSessions) {
            // All sessions completed
            showCompleteInterface('all');
        } else {
            currentSession++;
            if (autoCycle) {
                startNewSession();
                startTimer();
            } else {
                showCompleteInterface('break');
            }
        }
    }
}

// Record work session
function recordWorkSession() {
    const timer = timerTypes[currentTimerType];
    const sessionData = {
        sessionNumber: currentSession,
        type: currentTimerType,
        phase: 'work',
        duration: timer.workTime,
        task: tasks[currentSession] || '',
        timestamp: new Date().toISOString()
    };

    todayData.sessions.push(sessionData);
    todayData.totalWorkTime += timer.workTime * 60;

    if (tasks[currentSession]) {
        todayData.tasks[currentSession] = tasks[currentSession];
    }

    saveTodayData();
    updateProgress();
}

// Record break session
function recordBreakSession() {
    const timer = timerTypes[currentTimerType];
    const sessionData = {
        sessionNumber: currentSession,
        type: currentTimerType,
        phase: 'break',
        duration: timer.breakTime,
        task: '',
        timestamp: new Date().toISOString()
    };

    todayData.sessions.push(sessionData);
    todayData.totalBreakTime += timer.breakTime * 60;

    saveTodayData();
    updateProgress();
}

// Start break
function startBreak() {
    currentPhase = 'break';
    const timer = timerTypes[currentTimerType];
    timeLeft = timer.breakTime * 60;

    // Update UI
    elements.phaseIcon.textContent = '☕';
    elements.phaseText.textContent = 'BREAK TIME';
    elements.timerLabel.textContent = 'Break Time';
    elements.timerCircle.className = 'timer-circle break';

    // Show break suggestions
    elements.breakSuggestions.hidden = false;

    // Update timer display
    updateTimerDisplay();

    // Reset buttons
    elements.startPauseBtn.disabled = false;
    elements.startPauseIcon.textContent = '▶️';
    elements.startPauseText.textContent = 'Start Break';
    elements.skipPhaseBtn.disabled = false;

    if (autoCycle) {
        startTimer();
    }
}

// Show complete interface
function showCompleteInterface(type) {
    elements.runningInterface.hidden = true;
    elements.completeInterface.hidden = false;

    // Update based on completion type
    if (type === 'work') {
        elements.completeIcon.textContent = '🎯';
        elements.completeTitle.textContent = 'Work Session Complete!';
        elements.completeSubtitle.textContent = 'Time for a break';
        elements.startNextSessionBtn.textContent = 'Start Break';
        elements.startNextSessionBtn.onclick = startBreak;
    } else if (type === 'break') {
        elements.completeIcon.textContent = '☕';
        elements.completeTitle.textContent = 'Break Complete!';
        elements.completeSubtitle.textContent = 'Ready for next session?';
        elements.startNextSessionBtn.textContent = 'Start Next Session';
        elements.startNextSessionBtn.onclick = startNextSession;
    } else {
        elements.completeIcon.textContent = '🏆';
        elements.completeTitle.textContent = 'All Sessions Complete!';
        elements.completeSubtitle.textContent = 'Great work today!';
        elements.startNextSessionBtn.style.display = 'none';
    }

    // Update session summary
    updateSessionSummary();
}

// Update session summary
function updateSessionSummary() {
    const timer = timerTypes[currentTimerType];
    const completedWorkSessions = todayData.sessions.filter(s => s.phase === 'work').length;
    const totalWorkMinutes = Math.floor(todayData.totalWorkTime / 60);

    elements.sessionSummary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Timer Type:</span>
            <span class="summary-value">${timer.name}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Completed Sessions:</span>
            <span class="summary-value">${completedWorkSessions} of ${totalSessions}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Focus Time:</span>
            <span class="summary-value">${totalWorkMinutes} minutes</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Current Task:</span>
            <span class="summary-value">${tasks[currentSession] || 'No task set'}</span>
        </div>
    `;
}

// Start next session
function startNextSession() {
    if (currentPhase === 'work') {
        startBreak();
    } else {
        startNewSession();
    }
    showRunningInterface();
}

// End timer session
function endTimerSession() {
    if (confirm('End current timer session? Progress will be saved.')) {
        stopTimer();
        showSetupInterface();
    }
}

// End all sessions
function endAllSessions() {
    if (confirm('End all timer sessions?')) {
        stopTimer();
        showTimerSelector();
    }
}

// Update progress display
function updateProgress() {
    const completedWorkSessions = todayData.sessions.filter(s => s.phase === 'work').length;
    const totalWorkMinutes = Math.floor(todayData.totalWorkTime / 60);

    // Update progress bar
    const progressPercent = totalSessions > 0 ? (completedWorkSessions / totalSessions) * 100 : 0;
    elements.progressFill.style.width = `${progressPercent}%`;

    // Update labels
    elements.completedSessions.textContent = `${completedWorkSessions} sessions done`;
    elements.totalTimeToday.textContent = `${totalWorkMinutes} min today`;
}

// Play sound
function playSound(type) {
    if (!soundsEnabled || !audioContext || audioContext.state !== 'running') return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different events
    const frequencies = {
        work_start: 600,
        work_end: 800,
        break_start: 500,
        break_end: 400,
        pause: 300,
        resume: 350
    };

    oscillator.frequency.setValueAtTime(frequencies[type] || 440, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Send browser notification
function sendNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Take Work Breaks Timer', {
            body: message,
            icon: '/assets/images/favicon.ico'
        });
    }
}

// Generate report
function generateReport() {
    if (todayData.sessions.length === 0) {
        showToast('No sessions recorded today');
        return;
    }

    showReportModal();
}

// Show report modal
// Show report modal (only when explicitly called)
function showReportModal() {
    // Generate report content
    const totalWorkMinutes = Math.floor(todayData.totalWorkTime / 60);
    const totalBreakMinutes = Math.floor(todayData.totalBreakTime / 60);
    const totalTasks = Object.keys(todayData.tasks).length;
    const workSessions = todayData.sessions.filter(s => s.phase === 'work').length;

    let sessionsHTML = '';
    todayData.sessions.forEach((session, index) => {
        const time = new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sessionsHTML += `
            <div class="session-item">
                <strong>Session ${session.sessionNumber} (${time}):</strong>
                ${session.phase === 'work' ? '🎯 Work' : '☕ Break'} - ${session.duration} minutes
                ${session.task ? `<br><em>Task: ${session.task}</em>` : ''}
            </div>
        `;
    });

    elements.modalReportContent.innerHTML = `
        <div class="report-header">
            <h4>📊 Today's Productivity Report</h4>
            <p>${todayData.date}</p>
        </div>
        
        <div class="report-summary">
            <div class="summary-stats">
                <div class="stat">
                    <strong>${workSessions}</strong>
                    <span>Work Sessions</span>
                </div>
                <div class="stat">
                    <strong>${totalWorkMinutes}</strong>
                    <span>Focus Minutes</span>
                </div>
                <div class="stat">
                    <strong>${totalBreakMinutes}</strong>
                    <span>Break Minutes</span>
                </div>
                <div class="stat">
                    <strong>${totalTasks}</strong>
                    <span>Tasks Tracked</span>
                </div>
            </div>
        </div>
        
        <div class="report-sessions">
            <h5>Session Details:</h5>
            ${sessionsHTML}
        </div>
        
        <div class="report-footer">
            <p>Generated by Take Work Breaks • ${new Date().toLocaleString()}</p>
        </div>
    `;

    // Show the modal
    elements.reportModal.hidden = false;
}

// Generate PDF report
async function generatePdfReport() {
    showToast('Generating PDF report...');

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Report title
        doc.setFontSize(20);
        doc.setTextColor(90, 103, 216);
        doc.text('Today\'s Productivity Report', 105, 20, { align: 'center' });

        // Date
        doc.setFontSize(12);
        doc.setTextColor(74, 85, 104);
        doc.text(`Date: ${todayData.date}`, 20, 35);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 42);

        let y = 55;

        // Summary stats
        const totalWorkMinutes = Math.floor(todayData.totalWorkTime / 60);
        const totalBreakMinutes = Math.floor(todayData.totalBreakTime / 60);
        const workSessions = todayData.sessions.filter(s => s.phase === 'work').length;
        const totalTasks = Object.keys(todayData.tasks).length;

        doc.setFontSize(14);
        doc.setTextColor(45, 55, 72);
        doc.text('Summary:', 20, y);
        y += 10;

        doc.setFontSize(11);
        doc.text(`Work Sessions: ${workSessions}`, 25, y);
        y += 7;
        doc.text(`Focus Time: ${totalWorkMinutes} minutes`, 25, y);
        y += 7;
        doc.text(`Break Time: ${totalBreakMinutes} minutes`, 25, y);
        y += 7;
        doc.text(`Tasks Tracked: ${totalTasks}`, 25, y);
        y += 15;

        // Session details
        if (todayData.sessions.length > 0) {
            doc.setFontSize(14);
            doc.text('Session Details:', 20, y);
            y += 10;

            doc.setFontSize(10);
            todayData.sessions.forEach((session, index) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }

                const time = new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const sessionText = `Session ${session.sessionNumber} (${time}): ${session.phase === 'work' ? 'Work' : 'Break'} - ${session.duration} minutes`;

                const lines = doc.splitTextToSize(sessionText, 170);
                lines.forEach(line => {
                    doc.text(line, 25, y);
                    y += 6;
                });

                if (session.task) {
                    const taskLines = doc.splitTextToSize(`Task: ${session.task}`, 165);
                    taskLines.forEach(line => {
                        doc.text(line, 30, y);
                        y += 6;
                    });
                }

                y += 4;
            });
        }

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(113, 128, 150);
        doc.text('Generated by Take Work Breaks • takeworkbreaks.com', 105, 285, { align: 'center' });

        // Save PDF
        const fileName = `productivity-report-${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(fileName);

        showToast('PDF report downloaded!');

    } catch (error) {
        console.error('PDF generation failed:', error);
        showToast('Failed to generate PDF report');
    }
}

// Generate image report
async function generateImageReport() {
    showToast('Generating image report...');

    try {
        // Create temporary container for the report
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: fixed;
            top: -10000px;
            left: -10000px;
            width: 800px;
            background: white;
            padding: 2rem;
            border-radius: 15px;
            z-index: 10000;
            font-family: sans-serif;
        `;

        // Generate report content
        const totalWorkMinutes = Math.floor(todayData.totalWorkTime / 60);
        const totalBreakMinutes = Math.floor(todayData.totalBreakTime / 60);
        const workSessions = todayData.sessions.filter(s => s.phase === 'work').length;
        const totalTasks = Object.keys(todayData.tasks).length;

        tempContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0;">
                <h1 style="color: #5a67d8; margin: 0 0 0.5rem 0;">Today's Productivity Report</h1>
                <p style="color: #718096; margin: 0;">${todayData.date}</p>
                <p style="color: #a0aec0; margin: 0.5rem 0 0 0;">Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="text-align: center; padding: 1rem; background: #f7fafc; border-radius: 10px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${workSessions}</div>
                    <div style="color: #718096; font-size: 0.9rem;">Work Sessions</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: #f7fafc; border-radius: 10px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${totalWorkMinutes}</div>
                    <div style="color: #718096; font-size: 0.9rem;">Focus Minutes</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: #f7fafc; border-radius: 10px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${totalBreakMinutes}</div>
                    <div style="color: #718096; font-size: 0.9rem;">Break Minutes</div>
                </div>
                <div style="text-align: center; padding: 1rem; background: #f7fafc; border-radius: 10px;">
                    <div style="font-size: 2rem; font-weight: bold; color: #667eea;">${totalTasks}</div>
                    <div style="color: #718096; font-size: 0.9rem;">Tasks Tracked</div>
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #2d3748; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0;">Session Details</h3>
                ${todayData.sessions.map(session => {
            const time = new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
                        <div style="padding: 0.75rem; border-bottom: 1px solid #f7fafc;">
                            <div style="display: flex; justify-content: space-between;">
                                <strong style="color: #4a5568;">Session ${session.sessionNumber} (${time})</strong>
                                <span style="color: ${session.phase === 'work' ? '#667eea' : '#48bb78'}; font-weight: bold;">
                                    ${session.phase === 'work' ? '🎯 Work' : '☕ Break'} - ${session.duration} min
                                </span>
                            </div>
                            ${session.task ? `<div style="color: #718096; margin-top: 0.25rem; font-style: italic;">Task: ${session.task}</div>` : ''}
                        </div>
                    `;
        }).join('')}
            </div>
            
            <div style="text-align: center; padding-top: 1.5rem; border-top: 2px solid #e2e8f0; color: #a0aec0; font-size: 0.9rem;">
                Generated by Take Work Breaks • takeworkbreaks.com
            </div>
        `;

        document.body.appendChild(tempContainer);

        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
        });

        document.body.removeChild(tempContainer);

        // Convert to image and download
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `productivity-report-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Image report saved!');

    } catch (error) {
        console.error('Image generation failed:', error);
        showToast('Failed to generate image report');
    }
}

// Copy report to clipboard
async function copyReportToClipboard() {
    const totalWorkMinutes = Math.floor(todayData.totalWorkTime / 60);
    const totalBreakMinutes = Math.floor(todayData.totalBreakTime / 60);
    const workSessions = todayData.sessions.filter(s => s.phase === 'work').length;
    const totalTasks = Object.keys(todayData.tasks).length;

    let reportText = `📊 TODAY'S PRODUCTIVITY REPORT\n`;
    reportText += `Date: ${todayData.date}\n`;
    reportText += `Generated: ${new Date().toLocaleString()}\n\n`;

    reportText += `📈 SUMMARY\n`;
    reportText += `Work Sessions: ${workSessions}\n`;
    reportText += `Focus Time: ${totalWorkMinutes} minutes\n`;
    reportText += `Break Time: ${totalBreakMinutes} minutes\n`;
    reportText += `Tasks Tracked: ${totalTasks}\n\n`;

    reportText += `📋 SESSION DETAILS\n`;
    todayData.sessions.forEach(session => {
        const time = new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        reportText += `Session ${session.sessionNumber} (${time}): ${session.phase === 'work' ? 'Work' : 'Break'} - ${session.duration} minutes\n`;
        if (session.task) {
            reportText += `  Task: ${session.task}\n`;
        }
    });

    reportText += `\n---\nGenerated by Take Work Breaks • takeworkbreaks.com`;

    try {
        await navigator.clipboard.writeText(reportText);
        showToast('Report copied to clipboard!');
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('Failed to copy report');
    }
}

// Show toast notification
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

// Keep audio context alive when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden
        if (audioContext && audioContext.state === 'running') {
            // Audio context will continue to work in background
        }
    }
});