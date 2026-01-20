// Attention Training Games Application
class AttentionTrainingGame {
    constructor() {
        // Game data with orange color added
        this.games = [
            {
                id: 'color-word-stroop', // Changed from 'switching-task'
                name: 'Color-Word Stroop',
                description: 'Identify font color, ignore word meaning',
                skill: 'Cognitive Inhibition',
                instruction: 'Click the COLOR of the word, NOT what it says',
                difficulty: {
                    easy: {
                        words: ['RED', 'BLUE', 'GREEN'],
                        colors: ['red', 'blue', 'green'],
                        timeLimit: 4
                    },
                    medium: {
                        words: ['RED', 'BLUE', 'GREEN', 'YELLOW'],
                        colors: ['red', 'blue', 'green', 'yellow'],
                        timeLimit: 3
                    },
                    hard: {
                        words: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'],
                        colors: ['red', 'blue', 'green', 'yellow', 'purple'],
                        timeLimit: 2
                    }
                }
            },
            {
                id: 'memory-grid',
                name: 'Memory Grid',
                description: 'Remember and reproduce lit patterns',
                skill: 'Visual Memory',
                instruction: 'Memorize the pattern, then click cells in same order.',
                difficulty: {
                    easy: { gridSize: 3, sequenceLength: 3 },
                    medium: { gridSize: 4, sequenceLength: 4 },
                    hard: { gridSize: 4, sequenceLength: 6 }
                }
            },
            {
                id: 'visual-search',
                name: 'Visual Search',
                description: 'Find the odd pattern among distractors',
                skill: 'Visual Scanning',
                instruction: 'Find and click the different pattern. Be quick!',
                difficulty: {
                    easy: { gridSize: 3, patterns: 9, oddPatterns: 1, timeLimit: 4 },
                    medium: { gridSize: 4, patterns: 16, oddPatterns: 1, timeLimit: 3 },
                    hard: { gridSize: 5, patterns: 25, oddPatterns: 1, timeLimit: 2 }
                }
            },
            {
                id: 'color-reactor',
                name: 'Color Reactor',
                description: 'Click only red circles, ignore others',
                skill: 'Reaction & Inhibition',
                instruction: 'Click only RED circles. Ignore all other colors.',
                difficulty: {
                    easy: { targetColor: 'red', distractors: ['blue', 'green', 'orange'] },
                    medium: { targetColor: 'red', distractors: ['blue', 'green', 'yellow', 'orange'] },
                    hard: { targetColor: 'red', distractors: ['blue', 'green', 'yellow', 'purple', 'orange'] }
                }
            },
            {
                id: 'flanker-focus',
                name: 'Flanker Focus',
                description: 'Identify center arrow direction',
                skill: 'Selective Attention',
                instruction: 'Identify direction of CENTER arrow only',
                difficulty: {
                    easy: {
                        arrows: 3,
                        directionTypes: ['←', '→', '↑', '↓'], // All 4 directions
                        congruentOnly: false  // All arrows same direction
                    },
                    medium: {
                        arrows: 3,
                        directionTypes: ['←', '→', '↑', '↓'], // All 4 directions
                        congruentOnly: false  // Mixed directions
                    },
                    hard: {
                        arrows: 5,
                        directionTypes: ['←', '→', '↑', '↓'], // All 4 directions
                        congruentOnly: false  // Mixed directions
                    }
                }
            },
            {
                id: 'tracking-test',
                name: 'Tracking Test',
                description: 'Follow moving object among distractors',
                skill: 'Sustained Attention',
                instruction: 'Follow the BLUE circle. Click when it turns GREEN!',
                difficulty: {
                    easy: { targets: 1, distractors: 5, speed: 1 },
                    medium: { targets: 1, distractors: 10, speed: 1.5 },
                    hard: { targets: 1, distractors: 15, speed: 2 }
                }
            },
        ];

        // Game state
        this.currentGame = null;
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.timeLeft = 0;
        this.totalTime = 60; // 1 minute default
        this.difficulty = 'easy';
        this.currentRound = 0;
        this.totalRounds = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.reactionTimes = [];
        this.startTime = null;
        this.gameInterval = null;
        this.timerInterval = null;
        this.audioContext = null;
        this.gainNode = null;
        this.isShowingFeedback = false;

        // Memory grid specific tracking
        this.sequenceTimes = [];
        this.averageSequenceTime = 0;

        // Add these for cleanup
        this.gameTimeouts = [];  // Store timeouts for cleanup
        this.moveElementsInterval = null;
        this.clickableTimeout = null;

        // Audio elements for completion sound
        this.completionSound = null;
        this.loadCompletionSound();

        // DOM Elements
        this.elements = {
            gameGrid: document.getElementById('gameGrid'),
            gameInterface: document.getElementById('gameInterface'),
            resultsScreen: document.getElementById('resultsScreen'),

            // Game display
            gameName: document.getElementById('gameName'),
            gameScore: document.getElementById('gameScore'),
            gameTimer: document.getElementById('gameTimer'),
            gameContainer: document.getElementById('gameContainer'),
            gameInstructions: document.getElementById('gameInstructions'),

            // Control buttons
            startGameBtn: document.getElementById('startGameBtn'),
            pauseGameBtn: document.getElementById('pauseGameBtn'),
            restartGameBtn: document.getElementById('restartGameBtn'),
            backToGames: document.getElementById('backToGames'),

            // Session controls
            gameDuration: document.getElementById('gameDuration'),
            difficultyLevel: document.getElementById('difficultyLevel'),

            // Results screen
            finalScore: document.getElementById('finalScore'),
            finalAccuracy: document.getElementById('finalAccuracy'),
            finalReaction: document.getElementById('finalReaction'),
            finalStreak: document.getElementById('finalStreak'),
            reactionSkill: document.getElementById('reactionSkill'),
            memorySkill: document.getElementById('memorySkill'),
            focusSkill: document.getElementById('focusSkill'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            tryDifferentBtn: document.getElementById('tryDifferentBtn'),
            backToAllBtn: document.getElementById('backToAllBtn'),

            // Previous best scores elements
            previousScore: document.getElementById('previousScore'),
            previousAccuracy: document.getElementById('previousAccuracy'),
            previousReaction: document.getElementById('previousReaction'),
            previousStreak: document.getElementById('previousStreak'),

            // Tooltip container
            tooltipContainer: document.getElementById('tooltipContainer')
        };

        // Tooltips data
        this.tooltips = {
            score: {
                title: 'Final Score',
                content: 'Total points earned. Higher is better.'
            },
            accuracy: {
                title: 'Accuracy',
                content: 'Percentage of correct actions. 100% means perfect focus.'
            },
            reaction: {
                title: 'Reaction Time',
                content: 'Average time to respond. Lower is better.'
            },
            streak: {
                title: 'Best Streak',
                content: 'Longest sequence of correct actions in a row.'
            }
        };

        // Game-specific tooltips
        this.gameSpecificTooltips = {
            'color-reactor': {
                score: 'Points: +100 for correct red clicks, -50 for wrong colors.',
                reaction: 'Time from color change to your click. Tests visual processing speed.'
            },
            'memory-grid': {
                accuracy: 'How well you remembered the sequence of lit cells.',
                streak: 'Consecutive correctly remembered sequences.'
            },
            'visual-search': {
                accuracy: 'Correctly identifying the different pattern among identical ones.',
                reaction: 'Time to find and click the odd pattern. Tests visual scanning speed.'
            },
            'flanker-focus': {
                reaction: 'Time to identify center arrow direction despite flankers.',
                accuracy: 'Maintaining focus on center arrow while ignoring surrounding arrows.'
            },
            'switching-task': {
                accuracy: 'Correctly applying changing rules to shapes.',
                streak: 'Consistency in adapting to rule changes.'
            },
            'tracking-test': {
                reaction: 'Time to click moving target when it becomes clickable.',
                accuracy: 'Successfully tracking and clicking the target.'
            }
        };

        this.init();
    }

    init() {
        this.renderGameGrid();
        this.setupEventListeners();
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 1.0; // Full volume
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }

    loadCompletionSound() {
        // Create completion sound using Web Audio API
        this.completionSound = new Audio();
        // Use a simple beep sound (could be replaced with actual audio file)
        this.completionSound.volume = 1.0; // Full volume
    }

    playCompletionSound() {
        if (!this.audioContext) return;

        // Create a more pleasant completion sound
        const oscillator = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        oscillator.connect(envelope);
        envelope.connect(this.gainNode);

        // Play a short melody for completion
        oscillator.type = 'sine';

        // Play a short ascending scale
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[3], this.audioContext.currentTime + 0.5);

        envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
        envelope.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        envelope.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.6);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.6);
    }

    renderGameGrid() {
        this.elements.gameGrid.innerHTML = this.games.map(game => `
            <div class="game-card" data-game-id="${game.id}">
                <h3 class="game-title">${game.name}</h3>
                <span class="game-skill">
                    ${game.skill}
                </span>
                <p class="game-desc">${game.description}</p>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Add to setupEventListeners or create separate method
        window.addEventListener('resize', () => {
            if (this.currentGame && this.currentGame.id === 'flanker-focus') {
                this.checkDeviceType();
            }
        });
        // Game selection
        this.elements.gameGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.game-card');
            if (card) {
                const gameId = card.dataset.gameId;
                this.selectGame(gameId);
            }
        });

        // Control buttons
        this.elements.startGameBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseGameBtn.addEventListener('click', () => this.togglePause());
        this.elements.restartGameBtn.addEventListener('click', () => this.resetGame());
        this.elements.restartGameBtn.textContent = 'Reset';
        this.elements.backToGames.addEventListener('click', () => this.showGameGrid());

        // Session controls
        this.elements.gameDuration.addEventListener('change', (e) => {
            this.totalTime = parseInt(e.target.value);
            if (!this.isRunning) {
                this.timeLeft = this.totalTime;
                this.updateTimerDisplay();
            }
        });

        this.elements.difficultyLevel.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            if (!this.isRunning && this.currentGame) {
                this.setupGame();
            }
        });

        // Results screen buttons
        this.elements.playAgainBtn.addEventListener('click', () => {
            this.showGameInterface();
            this.restartGame();
        });

        this.elements.tryDifferentBtn.addEventListener('click', () => {
            this.showGameGrid();
        });

        this.elements.backToAllBtn.addEventListener('click', () => {
            this.showGameGrid();
        });
    }

    selectGame(gameId) {
        // Stop current game if running
        if (this.isRunning) {
            this.stopGame();
        }

        this.currentGame = this.games.find(g => g.id === gameId);
        if (!this.currentGame) return;

        this.showGameInterface();
        this.setupGame();
    }

    showGameInterface() {
        this.elements.gameGrid.hidden = true;
        this.elements.gameInterface.hidden = false;
        this.elements.resultsScreen.hidden = true;

        this.elements.gameName.textContent = this.currentGame.name;

        // Scroll to game interface
        setTimeout(() => {
            this.elements.gameInterface.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }

    showGameGrid() {
        this.stopGame();
        this.elements.gameGrid.hidden = false;
        this.elements.gameInterface.hidden = true;
        this.elements.resultsScreen.hidden = true;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showResultsScreen() {
        this.elements.gameInterface.hidden = true;
        this.elements.resultsScreen.hidden = false;
        this.updateResults();

        // Play completion sound
        this.playCompletionSound();

        // Scroll to results
        setTimeout(() => {
            this.elements.resultsScreen.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }

    setupGame() {
        this.setupGameElements();

        // Use the instruction property from game data
        if (this.currentGame && this.currentGame.instruction) {
            this.updateInstructions(this.currentGame.instruction);
        } else {
            this.updateInstructions('Ready to play!');
        }

        // Reset game state
        this.score = 0;
        this.level = 1;
        this.currentRound = 0;
        this.totalRounds = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.reactionTimes = [];
        this.sequenceTimes = [];
        this.averageSequenceTime = 0;
        this.timeLeft = this.totalTime;

        // Reset tracking-specific states
        if (this.currentGame.id === 'tracking-test') {
            this.isClickable = false;
            if (this.autoDisableTimeout) {
                clearTimeout(this.autoDisableTimeout);
                this.autoDisableTimeout = null;
            }
            if (this.clickableTimeout) {
                clearTimeout(this.clickableTimeout);
                this.clickableTimeout = null;
            }
        }

        // Show/hide pause button based on game
        this.updatePauseButtonVisibility();

        this.updateDisplay();
        this.updateTimerDisplay();
    }

    updatePauseButtonVisibility() {
        const pauseButton = this.elements.pauseGameBtn;
        if (!pauseButton) return;

        // Hide pause button for games where it could be used for cheating
        const gamesWithoutPause = ['visual-search'];

        if (this.currentGame && gamesWithoutPause.includes(this.currentGame.id)) {
            pauseButton.style.display = 'none';
        } else {
            pauseButton.style.display = 'inline-block';
        }
    }

    // Game 1: Color Reactor
    setupColorReactorElements() {
        const grid = document.createElement('div');
        grid.className = 'color-reactor-grid';

        for (let i = 0; i < 9; i++) {
            const circle = document.createElement('div');
            circle.className = 'color-circle';

            // Add neutral initial color (gray)
            circle.classList.add('gray');
            circle.style.opacity = '0.6';

            // Add click handler
            circle.addEventListener('click', (e) => this.handleColorReactorClick(e));
            grid.appendChild(circle);
        }

        this.elements.gameContainer.appendChild(grid);
    }

    startColorReactor() {
        if (!this.isRunning) return;

        // Remove initial gray state and make all circles active
        const circles = this.elements.gameContainer.querySelectorAll('.color-circle');
        circles.forEach(circle => {
            circle.style.opacity = '1';
            circle.style.cursor = 'pointer';
        });

        this.generateNewColors();
        this.startTime = Date.now();
    }

    handleColorReactorClick(e) {
        // Prevent clicking on gray (initial) circles
        const circle = e.target;
        if (circle.classList.contains('gray')) return;

        if (!this.isRunning || this.isPaused) return;

        const isCorrect = circle.classList.contains('red');

        this.totalAnswers++;
        this.startTime = this.startTime || Date.now();
        const reactionTime = Date.now() - this.startTime;
        this.reactionTimes.push(reactionTime);

        if (isCorrect) {
            this.score += 100;
            this.correctAnswers++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

            // Show point feedback
            this.showPointFeedback(100, true, circle);

            circle.classList.add('active');
            setTimeout(() => {
                circle.classList.remove('active');
                this.generateNewColors();
            }, 300);

            this.playSound('correct', 1.0);
        } else {
            this.score = Math.max(0, this.score - 50);
            this.currentStreak = 0;

            // Show point feedback
            this.showPointFeedback(-50, false, circle);

            circle.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                circle.style.animation = '';
            }, 500);

            this.playSound('wrong', 1.0);
        }

        this.startTime = Date.now();
        this.updateDisplay();
    }

    generateNewColors() {
        const difficulty = this.currentGame.difficulty[this.difficulty];
        const colors = [difficulty.targetColor, ...difficulty.distractors];
        const circles = this.elements.gameContainer.querySelectorAll('.color-circle');

        // Ensure at least one red circle
        let hasRed = false;

        circles.forEach(circle => {
            let randomColor;

            // If we haven't placed a red yet and this is the last circle, force red
            if (!hasRed && circle === circles[circles.length - 1]) {
                randomColor = difficulty.targetColor;
            } else {
                randomColor = colors[Math.floor(Math.random() * colors.length)];
            }

            if (randomColor === difficulty.targetColor) {
                hasRed = true;
            }

            circle.className = 'color-circle';
            circle.classList.add(randomColor);
        });

        // If still no red (shouldn't happen with above logic), add one
        if (!hasRed) {
            const randomCircle = circles[Math.floor(Math.random() * circles.length)];
            randomCircle.className = 'color-circle';
            randomCircle.classList.add(difficulty.targetColor);
        }
    }

    // Game 2: Memory Grid
    setupMemoryGridElements() {
        const difficulty = this.currentGame.difficulty[this.difficulty];
        const gridSize = difficulty.gridSize;
        const grid = document.createElement('div');
        grid.className = 'memory-grid';
        grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'memory-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', (e) => this.handleMemoryGridClick(e));
            grid.appendChild(cell);
        }

        this.elements.gameContainer.appendChild(grid);
        this.currentSequence = [];
        this.userSequence = [];
        this.isShowingSequence = false;
    }

    startMemoryGrid() {
        if (!this.isRunning) return;
        this.showMemorySequence();
    }

    showMemorySequence() {
        if (!this.isRunning) return;

        const difficulty = this.currentGame.difficulty[this.difficulty];
        const cells = this.elements.gameContainer.querySelectorAll('.memory-cell');
        this.currentSequence = [];

        // Generate random sequence
        for (let i = 0; i < difficulty.sequenceLength; i++) {
            const randomIndex = Math.floor(Math.random() * cells.length);
            this.currentSequence.push(randomIndex);
        }

        // Show sequence
        this.isShowingSequence = true;
        let index = 0;

        const showNext = () => {
            if (!this.isRunning || !this.isShowingSequence) return;

            if (index >= this.currentSequence.length) {
                this.isShowingSequence = false;
                if (this.isRunning) {
                    this.updateInstructions('Now click cells in the same order!');
                }
                return;
            }

            const cellIndex = this.currentSequence[index];
            const cell = cells[cellIndex];

            cell.classList.add('active');

            const timeout1 = setTimeout(() => {
                cell.classList.remove('active');
                const timeout2 = setTimeout(() => {
                    index++;
                    showNext();
                }, 200);
                this.gameTimeouts.push(timeout2);
            }, 500);

            this.gameTimeouts.push(timeout1);
        };

        showNext();
    }

    handleMemoryGridClick(e) {
        if (!this.isRunning || this.isPaused || this.isShowingSequence) return;

        const cell = e.target;
        const cellIndex = parseInt(cell.dataset.index);

        // Track sequence start time on first click
        if (this.userSequence.length === 0) {
            this.sequenceStartTime = Date.now();
        }

        this.userSequence.push(cellIndex);

        // COUNT EACH CLICK AS AN ATTEMPT
        this.totalAnswers++;

        cell.classList.add('active');
        setTimeout(() => cell.classList.remove('active'), 300);

        // Check if correct
        const currentIndex = this.userSequence.length - 1;
        const isCorrect = this.userSequence[currentIndex] === this.currentSequence[currentIndex];

        if (isCorrect) {
            // COUNT CORRECT CLICK
            this.correctAnswers++;

            // Show point feedback for correct click
            this.showPointFeedback(0, true, cell);

            this.playSound('correct', 1.0);

            if (this.userSequence.length === this.currentSequence.length) {
                // Complete sequence - track time
                const sequenceTime = Date.now() - this.sequenceStartTime;
                this.sequenceTimes.push(sequenceTime);

                // Calculate average sequence time
                this.averageSequenceTime = this.sequenceTimes.reduce((a, b) => a + b, 0) / this.sequenceTimes.length;

                // Give bonus points for completing sequence
                this.score += 500;
                this.currentStreak++;
                if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

                // Show completion bonus feedback
                this.showPointFeedback(500, true, cell);

                setTimeout(() => {
                    this.userSequence = [];
                    this.showMemorySequence();
                }, 1000);

                this.updateInstructions('Correct! Remember the next pattern...');
            }
        } else {
            // Wrong answer - track time for partial attempt
            if (this.userSequence.length > 0) {
                const sequenceTime = Date.now() - this.sequenceStartTime;
                this.sequenceTimes.push(sequenceTime);
            }

            this.playSound('wrong', 1.0);

            // Show point feedback for wrong answer
            this.showPointFeedback(-100, false, cell);

            cell.classList.add('wrong');
            setTimeout(() => cell.classList.remove('wrong'), 500);

            this.score = Math.max(0, this.score - 100);
            this.currentStreak = 0;
            this.userSequence = [];

            setTimeout(() => {
                this.showMemorySequence();
            }, 1000);

            this.updateInstructions('Wrong! Try to remember better...');
        }

        this.updateDisplay();
    }

    // Game 3: Visual Search (replaces Sound Hunter)
    setupVisualSearchElements() {
        const container = document.createElement('div');
        container.className = 'visual-search-container';

        const instructions = document.createElement('div');
        instructions.className = 'visual-search-instructions';
        instructions.innerHTML = `
        <p>Find the <strong>DIFFERENT</strong> pattern among identical ones</p>
    `;
        container.appendChild(instructions);

        const grid = document.createElement('div');
        grid.className = 'visual-search-grid';
        grid.id = 'visualSearchGrid';

        container.appendChild(grid);
        this.elements.gameContainer.appendChild(container);

        this.visualSearchTimeLimit = 0;
        this.visualSearchTimer = null;
        this.visualSearchTimeLeft = 0;
        this.visualSearchTargetIndex = -1;
        this.visualSearchPatterns = [];
        this.visualSearchCorrectPattern = null;
    }

    startVisualSearch() {
        if (!this.isRunning) return;

        // Reset game state
        this.visualSearchTargetIndex = -1;
        this.visualSearchPatterns = [];
        this.visualSearchCorrectPattern = null;

        // Set time limit based on difficulty
        const difficulty = this.currentGame.difficulty[this.difficulty];
        this.visualSearchTimeLimit = difficulty.timeLimit * 1000;

        // Clear any existing timers
        this.clearVisualSearchTimers();

        // Generate patterns
        this.generateVisualSearchPatterns();

        // Start timer display
        this.showVisualSearchTimer();
    }

    clearVisualSearchTimers() {
        if (this.visualSearchTimer) {
            clearInterval(this.visualSearchTimer);
            this.visualSearchTimer = null;
        }

        // Clear any timeouts in gameTimeouts related to visual search
        this.gameTimeouts = this.gameTimeouts.filter(timeout => {
            try {
                clearTimeout(timeout);
                return false;
            } catch (e) {
                return false;
            }
        });
    }

    showVisualSearchTimer() {
        const instructions = document.querySelector('.visual-search-instructions');
        if (!instructions) return;

        // Save original instructions
        if (!this.visualSearchOriginalInstructions) {
            this.visualSearchOriginalInstructions = instructions.innerHTML;
        }

        // Update with timer
        instructions.innerHTML = `
        <p class="timer-display" id="visualSearchTimerDisplay"></p>
    `;

        this.visualSearchTimeLeft = this.visualSearchTimeLimit;
        this.updateVisualSearchTimerDisplay();

        // Start timer interval
        this.visualSearchTimer = setInterval(() => {
            if (!this.isRunning || this.isPaused) {
                this.clearVisualSearchTimers();
                return;
            }

            this.visualSearchTimeLeft -= 100;
            this.updateVisualSearchTimerDisplay();

            if (this.visualSearchTimeLeft <= 0) {
                this.clearVisualSearchTimers();
                this.handleVisualSearchTimeOut();
            }
        }, 100);
    }

    updateVisualSearchTimerDisplay() {
        const timerDisplay = document.getElementById('visualSearchTimerDisplay');
        if (!timerDisplay) return;

        const secondsLeft = Math.ceil(this.visualSearchTimeLeft / 1000);
        const colorClass = secondsLeft <= 1 ? 'time-warning' : secondsLeft <= 2 ? 'time-low' : '';

        timerDisplay.innerHTML = `<span class="${colorClass}">Time: ${secondsLeft}s</span>`;
    }

    handleVisualSearchTimeOut() {
        if (!this.isRunning || this.isPaused) return;

        this.totalAnswers++;

        // Timeout counts as wrong answer
        this.score = Math.max(0, this.score - 100);
        this.currentStreak = 0;

        // Set feedback flag
        this.isShowingFeedback = true;

        // Play wrong sound
        this.playSound('wrong', 1.0);

        // Disable ALL cells immediately
        const allCells = document.querySelectorAll('.visual-search-cell');
        allCells.forEach(c => {
            c.style.pointerEvents = 'none';
            c.style.cursor = 'default';
        });

        // Highlight the correct target WITHOUT making it clickable
        if (this.visualSearchTargetIndex !== -1) {
            const targetCell = document.querySelector(`.visual-search-cell[data-index="${this.visualSearchTargetIndex}"]`);
            if (targetCell) {
                targetCell.style.backgroundColor = 'rgba(245, 101, 101, 0.3)';
                targetCell.style.border = '2px dashed #f56565';
                targetCell.style.animation = 'shake 0.5s ease';
                targetCell.style.pointerEvents = 'none';
            }
        }

        // Show timeout message
        const timerDisplay = document.getElementById('visualSearchTimerDisplay');
        if (timerDisplay) {
            timerDisplay.innerHTML = `<span class="time-warning">⏰ Time's up! -100 points</span>`;
        }

        this.updateDisplay();
        this.updateInstructions(`<span style="color: #f56565;">⏰ Too slow! -100 points</span>`);

        // Reset after delay
        setTimeout(() => {
            // Reset feedback flag
            this.isShowingFeedback = false;

            // Remove highlights
            const targetCell = document.querySelector(`.visual-search-cell[data-index="${this.visualSearchTargetIndex}"]`);
            if (targetCell) {
                targetCell.style.backgroundColor = '';
                targetCell.style.border = '';
                targetCell.style.animation = '';
                targetCell.style.pointerEvents = '';
            }

            // Re-enable ALL cells
            allCells.forEach(c => {
                c.style.pointerEvents = '';
                c.style.cursor = 'pointer';
            });

            // Restore original instructions
            const instructions = document.querySelector('.visual-search-instructions');
            if (instructions && this.visualSearchOriginalInstructions) {
                instructions.innerHTML = this.visualSearchOriginalInstructions;
            }

            if (this.isRunning && !this.isPaused) {
                setTimeout(() => {
                    if (this.isRunning && !this.isPaused) {
                        this.startVisualSearch();
                    }
                }, 800);
            }
        }, 1500);
    }

    generateVisualSearchPatterns() {
        const difficulty = this.currentGame.difficulty[this.difficulty];
        const grid = document.getElementById('visualSearchGrid');

        if (!grid) return;

        // Clear grid
        grid.innerHTML = '';

        // Set grid template
        grid.style.gridTemplateColumns = `repeat(${difficulty.gridSize}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${difficulty.gridSize}, 1fr)`;

        // Generate base pattern (majority pattern)
        const basePattern = this.generateRandomPattern();
        this.visualSearchCorrectPattern = basePattern;

        // Generate one different pattern (target) - ensure it's actually different
        let targetPattern;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            targetPattern = this.generateDifferentPattern(basePattern);
            attempts++;

            // Safety check to prevent infinite loop
            if (attempts >= maxAttempts) {
                // Force a different pattern by changing a core property
                targetPattern = { ...basePattern };
                if (basePattern.type === 'lines') {
                    targetPattern.angle = (basePattern.angle + 90) % 180;
                } else if (basePattern.type === 'circles') {
                    targetPattern.count = basePattern.count === 3 ? 5 : 3;
                } else if (basePattern.type === 'squares') {
                    targetPattern.rotation = (basePattern.rotation + 45) % 180;
                } else if (basePattern.type === 'triangles') {
                    targetPattern.orientation = basePattern.orientation === 'up' ? 'down' : 'up';
                } else if (basePattern.type === 'dots') {
                    targetPattern.arrangement = basePattern.arrangement === 'circle' ? 'square' : 'circle';
                } else if (basePattern.type === 'crosses') {
                    targetPattern.style = basePattern.style === 'plus' ? 'x' : 'plus';
                }
                break;
            }
        } while (this.arePatternsIdentical(basePattern, targetPattern));

        // Random position for target
        const targetPosition = Math.floor(Math.random() * difficulty.patterns);
        this.visualSearchTargetIndex = targetPosition;

        // Choose colors - all same color, including target
        const colors = ['#667eea', '#ed8936', '#48bb78', '#9f7aea', '#ed64a6'];
        const baseColor = colors[Math.floor(Math.random() * colors.length)];
        // Target gets same color - not green!
        const targetColor = baseColor;

        // Create all patterns
        for (let i = 0; i < difficulty.patterns; i++) {
            const patternCell = document.createElement('div');
            patternCell.className = 'visual-search-cell';
            patternCell.dataset.index = i;

            if (i === targetPosition) {
                // This is the target (different pattern) - SAME COLOR
                this.createPatternSVG(patternCell, targetPattern, targetColor);
                this.visualSearchPatterns.push({
                    type: 'target',
                    pattern: targetPattern,
                    color: targetColor
                });
            } else {
                // These are distractors (base pattern) - SAME COLOR
                this.createPatternSVG(patternCell, basePattern, baseColor);
                this.visualSearchPatterns.push({
                    type: 'distractor',
                    pattern: basePattern,
                    color: baseColor
                });
            }

            // Add click handler
            patternCell.addEventListener('click', (e) => this.handleVisualSearchClick(e));

            grid.appendChild(patternCell);
        }

        this.startTime = Date.now();
    }

    generateRandomPattern() {
        const patterns = [
            {
                type: 'lines',
                count: [2, 4][Math.floor(Math.random() * 2)],
                angle: [30, 90][Math.floor(Math.random() * 2)],
                thickness: 3
            },
            {
                type: 'circles',
                count: [2, 4][Math.floor(Math.random() * 2)],
                size: ['small', 'large'][Math.floor(Math.random() * 2)],
                arrangement: 'line'
            },
            {
                type: 'squares',
                count: [2, 4][Math.floor(Math.random() * 2)],
                rotation: [0, 30, 90][Math.floor(Math.random() * 3)],
                spacing: 'medium'
            },
            {
                type: 'triangles',
                count: [2, 4][Math.floor(Math.random() * 2)],
                orientation: ['down', 'left'][Math.floor(Math.random() * 2)],
                size: 'large'
            },
            {
                type: 'dots',
                count: [2, 5, 6][Math.floor(Math.random() * 3)],
                arrangement: ['circle', 'line'][Math.floor(Math.random() * 3)],
                size: 'large'
            },
            {
                type: 'crosses',
                count: [2][Math.floor(Math.random() * 1)],
                style: ['plus'][Math.floor(Math.random() * 1)],
                angle: 0
            }
        ];

        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    generateDifferentPattern(basePattern) {
        let newPattern = { ...basePattern };

        // Make a meaningful difference based on pattern type
        const patternModifications = {
            'lines': {
                properties: ['count', 'angle'],
                values: {
                    'angle': [150],
                    'count': [1, 3],
                }
            },
            'circles': {
                properties: ['size', 'count'],
                values: {
                    'size': ['medium'],
                    'count': [3, 1],
                }
            },
            'squares': {
                properties: ['count', 'rotation'],
                values: {
                    'rotation': [45, 60, 75],
                    'count': [3],
                }
            },
            'triangles': {
                properties: ['orientation', 'count',],
                values: {
                    'orientation': ['up', 'left'],
                    'count': [3],
                }
            },
            'dots': {
                properties: ['arrangement', 'count',],
                values: {
                    'arrangement': ['square', 'random'],
                    'count': [3, 5],
                }
            },
            'crosses': {
                properties: ['style', 'count'],
                values: {
                    'style': ['x'],
                    'count': [1],
                }
            }
        };

        const mods = patternModifications[basePattern.type];
        if (!mods) return newPattern;

        // Choose a property to modify
        const property = mods.properties[Math.floor(Math.random() * mods.properties.length)];
        const possibleValues = mods.values[property];

        if (possibleValues) {
            // Get current value
            const currentValue = basePattern[property];

            // Find a different value - ensure it's actually different
            let newValue;
            let attempts = 0;

            // Filter out current value first
            const differentValues = possibleValues.filter(val => {
                if (typeof val === 'number' && typeof currentValue === 'number') {
                    return Math.abs(val - currentValue) > 0.01; // Allow small floating point differences
                }
                return val !== currentValue;
            });

            // If we have different values, pick one randomly
            if (differentValues.length > 0) {
                newValue = differentValues[Math.floor(Math.random() * differentValues.length)];
            } else {
                // If all values are the same (shouldn't happen), use a fallback
                if (typeof currentValue === 'number') {
                    newValue = currentValue + 1; // Add 1 to number
                } else if (typeof currentValue === 'string') {
                    // For strings, try to modify them
                    if (property === 'orientation') {
                        newValue = currentValue === 'up' ? 'down' : 'up';
                    } else if (property === 'style') {
                        newValue = currentValue === 'plus' ? 'x' : 'plus';
                    } else if (property === 'size') {
                        newValue = currentValue === 'small' ? 'medium' :
                            currentValue === 'medium' ? 'large' : 'small';
                    } else if (property === 'arrangement') {
                        newValue = currentValue === 'circle' ? 'square' :
                            currentValue === 'square' ? 'line' : 'circle';
                    } else {
                        newValue = currentValue + '_diff'; // Fallback
                    }
                } else {
                    newValue = currentValue; // Can't find different value
                }
            }

            newPattern[property] = newValue;

            // Double-check that the pattern is actually different
            if (this.arePatternsIdentical(basePattern, newPattern)) {
                // Force a different property if patterns are still identical
                const otherProperties = mods.properties.filter(p => p !== property);
                if (otherProperties.length > 0) {
                    const backupProperty = otherProperties[0];
                    const backupValues = mods.values[backupProperty];
                    if (backupValues && backupValues.length > 0) {
                        newPattern[backupProperty] = backupValues[0];
                    }
                }
            }
        }

        return newPattern;
    }

    // Helper method to check if patterns are identical
    arePatternsIdentical(pattern1, pattern2) {
        // Check all properties
        const keys1 = Object.keys(pattern1);
        const keys2 = Object.keys(pattern2);

        if (keys1.length !== keys2.length) return false;

        for (const key of keys1) {
            if (pattern1[key] !== pattern2[key]) {
                return false; // Found a difference
            }
        }

        return true; // All properties are the same
    }

    createPatternSVG(container, pattern, color) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.opacity = "0";
        svg.style.transition = "opacity 0.3s ease";

        // Use the provided color (same for all patterns)
        const patternColor = color || '#667eea';

        switch (pattern.type) {
            case 'lines':
                this.createLinesPattern(svg, pattern, patternColor);
                break;
            case 'circles':
                this.createCirclesPattern(svg, pattern, patternColor);
                break;
            case 'squares':
                this.createSquaresPattern(svg, pattern, patternColor);
                break;
            case 'triangles':
                this.createTrianglesPattern(svg, pattern, patternColor);
                break;
            case 'dots':
                this.createDotsPattern(svg, pattern, patternColor);
                break;
            case 'crosses':
                this.createCrossesPattern(svg, pattern, patternColor);
                break;
        }

        container.appendChild(svg);

        // Fade in
        setTimeout(() => {
            svg.style.opacity = "1";
        }, 50);
    }

    createLinesPattern(svg, pattern, color) {
        const svgNS = svg.namespaceURI;
        const angle = pattern.angle || 45;
        const count = pattern.count || 3;
        const thickness = 4;

        for (let i = 0; i < count; i++) {
            const line = document.createElementNS(svgNS, "line");
            const x1 = 20 + (i * 60 / (count - 1));
            const y1 = 20;
            const x2 = x1 + 40 * Math.cos(angle * Math.PI / 180);
            const y2 = 80;

            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("stroke", color);
            line.setAttribute("stroke-width", thickness);
            line.setAttribute("stroke-linecap", "round");

            svg.appendChild(line);
        }
    }

    createCirclesPattern(svg, pattern, color) {
        const svgNS = svg.namespaceURI;
        const count = pattern.count || 4;
        const size = pattern.size === 'small' ? 8 : pattern.size === 'large' ? 15 : 12;

        for (let i = 0; i < count; i++) {
            const circle = document.createElementNS(svgNS, "circle");
            const cx = 20 + (i * 60 / (count - 1));
            const cy = 50;

            circle.setAttribute("cx", cx);
            circle.setAttribute("cy", cy);
            circle.setAttribute("r", size);
            circle.setAttribute("fill", color);

            svg.appendChild(circle);
        }
    }

    createSquaresPattern(svg, pattern, color) {
        const svgNS = svg.namespaceURI;
        const count = pattern.count || 3;
        const rotation = pattern.rotation || 0;
        const size = 15;

        for (let i = 0; i < count; i++) {
            const rect = document.createElementNS(svgNS, "rect");
            const x = 20 + (i * 60 / (count - 1)) - size / 2;
            const y = 50 - size / 2;

            rect.setAttribute("x", x);
            rect.setAttribute("y", y);
            rect.setAttribute("width", size);
            rect.setAttribute("height", size);
            rect.setAttribute("fill", color);
            rect.setAttribute("transform", `rotate(${rotation}, ${x + size / 2}, ${y + size / 2})`);

            svg.appendChild(rect);
        }
    }

    createTrianglesPattern(svg, pattern, color) {
        const svgNS = svg.namespaceURI;
        const count = pattern.count || 3;
        const orientation = pattern.orientation || 'up';
        const size = 12;

        for (let i = 0; i < count; i++) {
            const polygon = document.createElementNS(svgNS, "polygon");
            const cx = 20 + (i * 60 / (count - 1));
            const cy = 50;

            let points;
            switch (orientation) {
                case 'up':
                    points = `${cx},${cy - size} ${cx - size},${cy + size} ${cx + size},${cy + size}`;
                    break;
                case 'down':
                    points = `${cx},${cy + size} ${cx - size},${cy - size} ${cx + size},${cy - size}`;
                    break;
                case 'left':
                    points = `${cx - size},${cy} ${cx + size},${cy - size} ${cx + size},${cy + size}`;
                    break;
                case 'right':
                    points = `${cx + size},${cy} ${cx - size},${cy - size} ${cx - size},${cy + size}`;
                    break;
            }

            polygon.setAttribute("points", points);
            polygon.setAttribute("fill", color);

            svg.appendChild(polygon);
        }
    }

    createDotsPattern(svg, pattern, color) {
        const svgNS = svg.namespaceURI;
        const count = pattern.count || 6;
        const arrangement = pattern.arrangement || 'circle';
        const size = 6;

        for (let i = 0; i < count; i++) {
            const circle = document.createElementNS(svgNS, "circle");
            let cx, cy;

            switch (arrangement) {
                case 'circle':
                    const angle = (i * 2 * Math.PI) / count;
                    cx = 50 + 30 * Math.cos(angle);
                    cy = 50 + 30 * Math.sin(angle);
                    break;
                case 'square':
                    const positions = [
                        [30, 30], [70, 30], [30, 70], [70, 70],
                        [30, 50], [70, 50], [50, 30], [50, 70]
                    ];
                    [cx, cy] = positions[i] || [50, 50];
                    break;
                case 'line':
                    cx = 20 + (i * 60 / (count - 1));
                    cy = 50;
                    break;
                default: // random
                    cx = 20 + Math.random() * 60;
                    cy = 20 + Math.random() * 60;
                    break;
            }

            circle.setAttribute("cx", cx);
            circle.setAttribute("cy", cy);
            circle.setAttribute("r", size);
            circle.setAttribute("fill", color);

            svg.appendChild(circle);
        }
    }

    createCrossesPattern(svg, pattern, color) {
        const svgNS = svg.namespaceURI;
        const count = pattern.count || 2;
        const style = pattern.style || 'plus';
        const size = 10;

        for (let i = 0; i < count; i++) {
            const cx = 30 + (i * 40);
            const cy = 50;

            if (style === 'plus') {
                // Plus sign
                const line1 = document.createElementNS(svgNS, "line");
                line1.setAttribute("x1", cx - size);
                line1.setAttribute("y1", cy);
                line1.setAttribute("x2", cx + size);
                line1.setAttribute("y2", cy);
                line1.setAttribute("stroke", color);
                line1.setAttribute("stroke-width", "3");

                const line2 = document.createElementNS(svgNS, "line");
                line2.setAttribute("x1", cx);
                line2.setAttribute("y1", cy - size);
                line2.setAttribute("x2", cx);
                line2.setAttribute("y2", cy + size);
                line2.setAttribute("stroke", color);
                line2.setAttribute("stroke-width", "3");

                svg.appendChild(line1);
                svg.appendChild(line2);
            } else {
                // X shape
                const line1 = document.createElementNS(svgNS, "line");
                line1.setAttribute("x1", cx - size);
                line1.setAttribute("y1", cy - size);
                line1.setAttribute("x2", cx + size);
                line1.setAttribute("y2", cy + size);
                line1.setAttribute("stroke", color);
                line1.setAttribute("stroke-width", "3");

                const line2 = document.createElementNS(svgNS, "line");
                line2.setAttribute("x1", cx - size);
                line2.setAttribute("y1", cy + size);
                line2.setAttribute("x2", cx + size);
                line2.setAttribute("y2", cy - size);
                line2.setAttribute("stroke", color);
                line2.setAttribute("stroke-width", "3");

                svg.appendChild(line1);
                svg.appendChild(line2);
            }
        }
    }

    handleVisualSearchClick(e) {
        if (!this.isRunning || this.isPaused) return;

        const cell = e.target.closest('.visual-search-cell');
        if (!cell) return;

        // Prevent clicking if already showing timeout/wrong answer feedback
        if (this.isShowingFeedback) return;

        this.clearVisualSearchTimers();

        const clickedIndex = parseInt(cell.dataset.index);
        const isCorrect = clickedIndex === this.visualSearchTargetIndex;

        this.totalAnswers++;
        const reactionTime = Date.now() - this.startTime;
        this.reactionTimes.push(reactionTime);

        // Set feedback flag to prevent additional clicks
        this.isShowingFeedback = true;

        // Visual feedback with smooth transition
        cell.style.transform = 'scale(1.1)';
        cell.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';

        if (isCorrect) {
            // CORRECT
            this.score += 200;
            this.correctAnswers++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

            // Bonus for fast reaction
            let bonus = 0;
            if (reactionTime < 2000) {
                bonus = Math.round((2000 - reactionTime) / 10); // Up to 200 bonus points
                this.score += bonus;
            }

            // Show point feedback
            this.showPointFeedback(200 + bonus, true, cell);

            cell.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
            cell.style.border = '3px solid #10b981';
            cell.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';

            // Ripple effect
            this.createRippleEffect(cell, '#10b981');

            this.playSound('correct', 0.8);
            this.updateInstructions(`<span style="color: #10b981;">✓ Perfect! +${200 + bonus} points</span>`);
        } else {
            // WRONG
            this.score = Math.max(0, this.score - 100);
            this.currentStreak = 0;

            // Show point feedback
            this.showPointFeedback(-100, false, cell);

            cell.style.backgroundColor = 'rgba(245, 101, 101, 0.15)';
            cell.style.border = '3px solid #f56565';
            cell.style.boxShadow = '0 0 20px rgba(245, 101, 101, 0.4)';

            // Ripple effect
            this.createRippleEffect(cell, '#f56565');

            this.playSound('wrong', 0.8);
            this.updateInstructions(`<span style="color: #f56565;">✗ Wrong! -100 points</span>`);

            // Highlight the correct target WITHOUT making it clickable
            const targetCell = document.querySelector(`.visual-search-cell[data-index="${this.visualSearchTargetIndex}"]`);
            if (targetCell) {
                targetCell.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                targetCell.style.border = '2px dashed #10b981';
                targetCell.style.animation = 'subtle-pulse 1s ease 2';
                // Disable clicking on the correct cell
                targetCell.style.pointerEvents = 'none';
            }

            // Disable ALL cells during feedback period
            const allCells = document.querySelectorAll('.visual-search-cell');
            allCells.forEach(c => {
                c.style.pointerEvents = 'none';
                c.style.cursor = 'default';
            });
        }

        this.updateDisplay();

        // Store the timeout for cleanup
        const resetTimeout = setTimeout(() => {
            // Reset feedback flag
            this.isShowingFeedback = false;

            // Reset clicked cell
            if (cell) {
                cell.style.transform = '';
                cell.style.backgroundColor = '';
                cell.style.border = '';
                cell.style.boxShadow = '';
                cell.style.transition = '';
            }

            // Reset target cell if wrong
            if (!isCorrect) {
                const targetCell = document.querySelector(`.visual-search-cell[data-index="${this.visualSearchTargetIndex}"]`);
                if (targetCell) {
                    targetCell.style.backgroundColor = '';
                    targetCell.style.border = '';
                    targetCell.style.animation = '';
                    targetCell.style.pointerEvents = '';
                }

                // Re-enable ALL cells
                const allCells = document.querySelectorAll('.visual-search-cell');
                allCells.forEach(c => {
                    c.style.pointerEvents = '';
                    c.style.cursor = 'pointer';
                });
            }

            if (this.isRunning && !this.isPaused) {
                // Fade out current grid
                const grid = document.getElementById('visualSearchGrid');
                if (grid) {
                    grid.style.opacity = '0.5';
                    grid.style.transition = 'opacity 0.3s ease';
                }

                // Show original instructions
                const instructions = document.querySelector('.visual-search-instructions');
                if (instructions && this.visualSearchOriginalInstructions) {
                    instructions.innerHTML = this.visualSearchOriginalInstructions;
                }

                // Store the next round timeout
                const nextRoundTimeout = setTimeout(() => {
                    if (this.isRunning && !this.isPaused) {
                        // Reset grid opacity
                        if (grid) {
                            grid.style.opacity = '1';
                        }
                        this.startVisualSearch();
                    }
                }, 500);

                this.gameTimeouts.push(nextRoundTimeout);
            }
        }, 1500);

        this.gameTimeouts.push(resetTimeout);
    }

    // Add ripple effect method
    createRippleEffect(element, color) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: ${color};
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        opacity: 0.3;
    `;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width - size) / 2 + 'px';
        ripple.style.top = (rect.height - size) / 2 + 'px';

        element.style.position = 'relative';
        element.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode === element) {
                element.removeChild(ripple);
            }
        }, 600);
    }

    // Game 4: Flanker Focus - UPDATED VERSION
    setupFlankerFocusElements() {
        const container = document.createElement('div');
        container.className = 'flanker-container';

        // Create instructions section
        const instructions = document.createElement('div');
        instructions.className = 'flanker-instructions';
        instructions.innerHTML = `
        <p><strong>Identify direction of CENTER arrow only</strong></p>
        <p class="instruction-hint">Use keyboard arrows (← → ↑ ↓) or buttons below</p>
    `;
        container.appendChild(instructions);

        // Create arrows container
        const arrowsDiv = document.createElement('div');
        arrowsDiv.className = 'flanker-arrows';

        const difficulty = this.currentGame.difficulty[this.difficulty];
        this.currentArrows = [];

        // Create arrow boxes based on difficulty
        for (let i = 0; i < difficulty.arrows; i++) {
            const arrowBox = document.createElement('div');
            arrowBox.className = 'arrow-box';

            // Add spacing classes for 5-arrow layout (hard mode)
            if (difficulty.arrows === 5) {
                if (i === 0 || i === 4) {
                    arrowBox.classList.add('outer');
                } else if (i === 1 || i === 3) {
                    arrowBox.classList.add('middle');
                } else {
                    arrowBox.classList.add('center');
                }
            }

            if (i === Math.floor(difficulty.arrows / 2)) {
                arrowBox.classList.add('focus');
            }

            arrowsDiv.appendChild(arrowBox);
        }

        container.appendChild(arrowsDiv);

        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'flanker-controls-container';

        // Desktop keyboard controls (always visible)
        const desktopControls = document.createElement('div');
        desktopControls.className = 'desktop-controls';
        desktopControls.innerHTML = `
        <div class="key-row">
            <button class="key-button up-btn" title="Up Arrow (↑)">↑</button>
        </div>
        <div class="key-row">
            <button class="key-button left-btn" title="Left Arrow (←)">←</button>
            <button class="key-button down-btn" title="Down Arrow (↓)">↓</button>
            <button class="key-button right-btn" title="Right Arrow (→)">→</button>
        </div>
    `;
        controlsContainer.appendChild(desktopControls);

        container.appendChild(controlsContainer);
        this.elements.gameContainer.appendChild(container);

        // Set up event listeners for both desktop and mobile controls
        this.setupFlankerControls();

        // Remove device type check - show both controls always
    }

    setupFlankerControls() {
        // Keyboard controls for desktop - all 4 directions
        this.keydownHandler = (e) => {
            // Only prevent default for our game keys when game is running
            if (this.isRunning && !this.isPaused) {
                const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd'];
                const key = e.key.toLowerCase();

                // Check if pressed key is one of our game keys
                if (gameKeys.includes(e.key) || gameKeys.includes(key)) {
                    e.preventDefault(); // Prevent default scrolling behavior
                    e.stopPropagation(); // Stop event bubbling
                }
            }

            if (!this.isRunning || this.isPaused || e.repeat) return;

            let answer = null;
            let button = null;

            // Map arrow keys
            if (e.key === 'ArrowLeft') {
                answer = 'left';
                button = this.elements.gameContainer.querySelector('.left-btn');
            } else if (e.key === 'ArrowRight') {
                answer = 'right';
                button = this.elements.gameContainer.querySelector('.right-btn');
            } else if (e.key === 'ArrowUp') {
                answer = 'up';
                button = this.elements.gameContainer.querySelector('.up-btn');
            } else if (e.key === 'ArrowDown') {
                answer = 'down';
                button = this.elements.gameContainer.querySelector('.down-btn');
            }
            // Map WASD keys
            else if (e.key.toLowerCase() === 'a') {
                answer = 'left';
                button = this.elements.gameContainer.querySelector('.left-btn');
            } else if (e.key.toLowerCase() === 'd') {
                answer = 'right';
                button = this.elements.gameContainer.querySelector('.right-btn');
            } else if (e.key.toLowerCase() === 'w') {
                answer = 'up';
                button = this.elements.gameContainer.querySelector('.up-btn');
            } else if (e.key.toLowerCase() === 's') {
                answer = 'down';
                button = this.elements.gameContainer.querySelector('.down-btn');
            }

            if (answer) {
                // Add visual feedback for keyboard press
                if (button) {
                    button.classList.add('pressed');
                    setTimeout(() => button.classList.remove('pressed'), 200);
                }
                this.handleFlankerAnswer(answer);
                return false; // Prevent default and stop propagation
            }
        };

        // Button controls for both desktop and mobile
        const setupButtonListeners = (selector, className) => {
            const buttons = this.elements.gameContainer.querySelectorAll(selector);
            buttons.forEach(btn => {
                const answer = this.getAnswerFromButton(btn);
                if (answer) {
                    // Click event
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!this.isRunning || this.isPaused) return;
                        btn.classList.add('pressed');
                        setTimeout(() => btn.classList.remove('pressed'), 200);
                        this.handleFlankerAnswer(answer);
                        return false;
                    });

                    // Touch events for mobile
                    btn.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!this.isRunning || this.isPaused) return;
                        btn.classList.add('pressed');
                    });

                    btn.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!this.isRunning || this.isPaused) return;
                        btn.classList.remove('pressed');
                        this.handleFlankerAnswer(answer);
                    });

                    // Prevent context menu on long press
                    btn.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        return false;
                    });
                }
            });
        };

        // Setup both desktop and mobile button listeners
        setupButtonListeners('.key-button', 'key-button');
        setupButtonListeners('.flanker-btn', 'flanker-btn');

        document.addEventListener('keydown', this.keydownHandler, true); // Use capture phase
    }

    getAnswerFromButton(button) {
        if (button.classList.contains('left-btn')) return 'left';
        if (button.classList.contains('right-btn')) return 'right';
        if (button.classList.contains('up-btn')) return 'up';
        if (button.classList.contains('down-btn')) return 'down';
        return null;
    }

    startFlankerFocus() {
        if (!this.isRunning) return;
        this.generateFlankerArrows();
    }

    generateFlankerArrows() {
        if (!this.isRunning) return;

        const difficulty = this.currentGame.difficulty[this.difficulty];
        const arrows = this.elements.gameContainer.querySelectorAll('.arrow-box');
        const directions = difficulty.directionTypes;
        const centerIndex = Math.floor(difficulty.arrows / 2);

        // Remove previous feedback classes
        arrows.forEach(arrow => {
            arrow.classList.remove('correct', 'wrong');
        });

        // Choose center direction - can be any of the 4 directions
        const centerDirection = directions[Math.floor(Math.random() * directions.length)];

        // Determine answer based on center arrow
        this.correctAnswer = this.getDirectionName(centerDirection);

        arrows.forEach((arrow, index) => {
            // Remove previous content and classes
            arrow.textContent = '';
            arrow.classList.remove('active');

            if (index === centerIndex) {
                // CENTER ARROW - the one to identify
                arrow.textContent = centerDirection;
                arrow.classList.add('focus');

            } else {
                // FLANKER ARROWS - distractors around the center
                if (difficulty.congruentOnly) {
                    // EASY MODE: All flankers same direction as center
                    arrow.textContent = centerDirection;
                } else {
                    // MEDIUM/HARD MODE: Mix of directions
                    let flankerDirection;

                    if (Math.random() > 0.5) {
                        // 50% chance: CONGRUENT - same as center
                        flankerDirection = centerDirection;
                    } else {
                        // 50% chance: INCONGRUENT - different from center
                        const possibleDirections = directions.filter(dir => dir !== centerDirection);
                        flankerDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                    }

                    arrow.textContent = flankerDirection;
                }
            }
        });

        // Add a brief highlight to help identify center arrow
        setTimeout(() => {
            const centerArrow = arrows[centerIndex];
            if (centerArrow) {
                centerArrow.classList.add('active');
                setTimeout(() => {
                    centerArrow.classList.remove('active');
                }, 200);
            }
        }, 100);

        this.startTime = Date.now();
    }

    getDirectionName(directionSymbol) {
        const directionMap = {
            '←': 'left',
            '→': 'right',
            '↑': 'up',
            '↓': 'down'
        };
        return directionMap[directionSymbol] || 'left';
    }

    handleFlankerAnswer(userAnswer) {
        if (!this.isRunning || this.isPaused) return;

        this.totalAnswers++;
        const reactionTime = Date.now() - this.startTime;
        this.reactionTimes.push(reactionTime);

        const centerArrow = this.elements.gameContainer.querySelector('.arrow-box.center, .arrow-box.focus');

        if (userAnswer === this.correctAnswer) {
            this.score += 150;
            this.correctAnswers++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

            // Show point feedback
            this.showPointFeedback(150, true, centerArrow);

            // Visual feedback - green for correct
            if (centerArrow) {
                centerArrow.classList.add('correct');
            }
            this.playSound('correct', 1.0);
        } else {
            this.score = Math.max(0, this.score - 75);
            this.currentStreak = 0;

            // Show point feedback
            this.showPointFeedback(-75, false, centerArrow);

            // Visual feedback - red for wrong
            if (centerArrow) {
                centerArrow.classList.add('wrong');
            }
            this.playSound('wrong', 1.0);
        }

        this.updateDisplay();

        // Clear feedback and generate new arrows after delay
        setTimeout(() => {
            if (centerArrow) {
                centerArrow.classList.remove('correct', 'wrong');
            }

            if (this.isRunning && !this.isPaused) {
                this.generateFlankerArrows();
            }
        }, 500);
    }

    // Game 5: Color-Word Stroop - UPDATED VERSION
    setupStroopTaskElements() {
        const container = document.createElement('div');
        container.className = 'stroop-container';

        // Create instructions container
        const instructions = document.createElement('div');
        instructions.className = 'stroop-instructions';
        instructions.id = 'stroopInstructions';
        instructions.innerHTML = `
        <div>
            <p class="rule-text">Click the COLOR of the word, NOT the word itself</p>
        </div>
    `;
        container.appendChild(instructions);

        // Create target word display
        const targetDiv = document.createElement('div');
        targetDiv.className = 'stroop-target';
        targetDiv.id = 'stroopTarget';

        const wordDisplay = document.createElement('div');
        wordDisplay.className = 'stroop-word';
        wordDisplay.id = 'stroopWord';
        wordDisplay.textContent = 'READY';
        wordDisplay.style.color = '#4a5568'; // Default color

        targetDiv.appendChild(wordDisplay);
        container.appendChild(targetDiv);

        // Create color buttons (will be populated based on difficulty)
        const controls = document.createElement('div');
        controls.className = 'stroop-controls';

        const colorButtons = document.createElement('div');
        colorButtons.className = 'stroop-color-buttons';
        colorButtons.id = 'stroopColorButtons';

        controls.appendChild(colorButtons);

        container.appendChild(controls);
        this.elements.gameContainer.appendChild(container);

        // Initialize game state
        this.stroopTimeLimit = 0;
        this.stroopTimer = null;
        this.stroopTimerInterval = null;
        this.stroopTimeLeft = 0;
        this.stroopCurrentWord = '';
        this.stroopCurrentColor = '';
        this.stroopStreak = 0;
        this.stroopTotalCorrect = 0;
        this.stroopTotalAttempts = 0;
        this.stroopReactionTimes = [];
    }

    startStroopTask() {
        if (!this.isRunning) return;

        // Reset game state
        this.stroopStreak = 0;
        this.stroopTotalCorrect = 0;
        this.stroopTotalAttempts = 0;
        this.stroopReactionTimes = [];

        // Set time limit based on difficulty
        const difficulty = this.currentGame.difficulty[this.difficulty];
        this.stroopTimeLimit = difficulty.timeLimit * 1000; // Convert to milliseconds

        // Clear any existing timers
        this.clearStroopTimers();

        // Update difficulty indicator
        const difficultyElement = document.getElementById('stroopDifficulty');
        if (difficultyElement) {
            difficultyElement.innerHTML = `Difficulty: <span class="level">${this.difficulty.toUpperCase()}</span>`;
        }

        // Set up color buttons based on difficulty
        this.setupStroopColorButtons();

        // Replace instructions with timer display
        this.showTimerDisplay();

        // Generate first word
        this.generateStroopWord();
    }

    clearStroopTimers() {
        if (this.stroopTimer) {
            clearTimeout(this.stroopTimer);
            this.stroopTimer = null;
        }
        if (this.stroopTimerInterval) {
            clearInterval(this.stroopTimerInterval);
            this.stroopTimerInterval = null;
        }
    }

    showTimerDisplay() {
        const instructions = document.getElementById('stroopInstructions');
        if (!instructions) return;

        // Save original instructions for when game ends
        if (!this.stroopOriginalInstructions) {
            this.stroopOriginalInstructions = instructions.innerHTML;
        }

        // Show timer in place of instructions
        instructions.innerHTML = `
        <div>
            <p class="timer-display" id="stroopTimerDisplay"></p>
        </div>
    `;
    }

    showOriginalInstructions() {
        const instructions = document.getElementById('stroopInstructions');
        if (!instructions || !this.stroopOriginalInstructions) return;

        instructions.innerHTML = this.stroopOriginalInstructions;
    }

    setupStroopColorButtons() {
        const colorButtons = document.getElementById('stroopColorButtons');
        if (!colorButtons) return;

        // Clear existing buttons
        colorButtons.innerHTML = '';

        // Define colors based on difficulty
        let colors = [];

        if (this.difficulty === 'easy') {
            // Easy: 4 colors
            colors = [
                { name: 'red', display: 'RED', className: 'stroop-red', hex: '#f56565' },
                { name: 'blue', display: 'BLUE', className: 'stroop-blue', hex: '#4299e1' },
                { name: 'green', display: 'GREEN', className: 'stroop-green', hex: '#48bb78' },
                { name: 'yellow', display: 'YELLOW', className: 'stroop-yellow', hex: '#ecc94b' }
            ];
        } else {
            // Medium/Hard: 6 colors
            colors = [
                { name: 'red', display: 'RED', className: 'stroop-red', hex: '#f56565' },
                { name: 'blue', display: 'BLUE', className: 'stroop-blue', hex: '#4299e1' },
                { name: 'green', display: 'GREEN', className: 'stroop-green', hex: '#48bb78' },
                { name: 'yellow', display: 'YELLOW', className: 'stroop-yellow', hex: '#ecc94b' },
                { name: 'purple', display: 'PURPLE', className: 'stroop-purple', hex: '#9f7aea' },
                { name: 'orange', display: 'ORANGE', className: 'stroop-orange', hex: '#ed8936' }
            ];
        }

        // Store colors for game logic
        this.stroopColors = colors;
        this.stroopWords = colors.map(color => color.display);

        // Create buttons for each color
        colors.forEach(color => {
            const button = document.createElement('button');
            button.className = `stroop-btn ${color.className}`;
            button.dataset.color = color.name;
            button.textContent = color.display;
            button.addEventListener('click', () => this.handleStroopAnswer(color.name));

            // Touch support
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (!this.isRunning || this.isPaused) return;
                button.classList.add('pressed');
            });

            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                if (!this.isRunning || this.isPaused) return;
                button.classList.remove('pressed');
                this.handleStroopAnswer(color.name);
            });

            colorButtons.appendChild(button);
        });
    }

    generateStroopWord() {
        if (!this.isRunning) return;

        // Clear any existing timers
        this.clearStroopTimers();

        // Get random word and color (must be different to create conflict)
        let randomWord, randomColor;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            randomWord = this.stroopWords[Math.floor(Math.random() * this.stroopWords.length)];
            randomColor = this.stroopColors[Math.floor(Math.random() * this.stroopColors.length)].name;
            attempts++;

            // Prevent infinite loop
            if (attempts > maxAttempts) {
                // If we can't find a conflict after max attempts, just use any combination
                break;
            }
        } while (randomWord.toLowerCase() === randomColor); // Ensure conflict

        this.stroopCurrentWord = randomWord;
        this.stroopCurrentColor = randomColor;
        this.correctAnswer = randomColor; // Correct answer is the COLOR, not the word

        // Update display
        const wordElement = document.getElementById('stroopWord');
        if (wordElement) {
            wordElement.textContent = this.stroopCurrentWord;
            wordElement.style.color = this.getColorValue(this.stroopCurrentColor);
            wordElement.classList.remove('correct', 'wrong');
        }

        // Start timer for this word
        this.stroopTimeLeft = this.stroopTimeLimit;
        this.startStroopTimer();

        this.startTime = Date.now();
    }

    startStroopTimer() {
        const timerDisplay = document.getElementById('stroopTimerDisplay');

        // Update timer immediately
        this.updateStroopTimerDisplay();

        // Update timer every 100ms for smooth countdown
        this.stroopTimerInterval = setInterval(() => {
            if (!this.isRunning || this.isPaused) {
                this.clearStroopTimers();
                return;
            }

            this.stroopTimeLeft -= 100;
            this.updateStroopTimerDisplay();

            if (this.stroopTimeLeft <= 0) {
                this.clearStroopTimers();
                this.handleTimeOut();
            }
        }, 100);

        // Set timeout for word expiration
        this.stroopTimer = setTimeout(() => {
            if (this.stroopTimerInterval) {
                clearInterval(this.stroopTimerInterval);
                this.stroopTimerInterval = null;
            }
            if (this.isRunning && !this.isPaused) {
                this.handleTimeOut();
            }
        }, this.stroopTimeLimit);
    }

    updateStroopTimerDisplay() {
        const timerDisplay = document.getElementById('stroopTimerDisplay');
        if (!timerDisplay) return;

        const secondsLeft = Math.ceil(this.stroopTimeLeft / 1000);
        const colorClass = secondsLeft <= 1 ? 'time-warning' : secondsLeft <= 2 ? 'time-low' : '';

        timerDisplay.innerHTML = `<span class="${colorClass}">Time left: ${secondsLeft}s</span>`;
    }

    handleTimeOut() {
        if (!this.isRunning || this.isPaused) return;

        this.totalAnswers++;
        this.stroopTotalAttempts++;

        // Timeout counts as wrong answer
        this.score = Math.max(0, this.score - 50);
        this.currentStreak = 0;
        this.stroopStreak = 0;

        // Show point feedback
        this.showPointFeedback(-50, false);

        // Visual feedback for timeout
        const wordElement = document.getElementById('stroopWord');
        if (wordElement) {
            wordElement.classList.add('wrong');
        }

        this.playSound('wrong', 1.0);

        // Show timeout message in timer display area
        const timerDisplay = document.getElementById('stroopTimerDisplay');
        if (timerDisplay) {
            timerDisplay.innerHTML = `<span class="time-warning">Too slow! Time's up.</span>`;

            setTimeout(() => {
                if (this.isRunning && !this.isPaused) {
                    this.generateStroopWord();
                }
            }, 1000);
        } else {
            setTimeout(() => {
                if (this.isRunning && !this.isPaused) {
                    this.generateStroopWord();
                }
            }, 1000);
        }

        this.updateDisplay();
        this.updateStroopStreakDisplay();
    }

    getColorValue(colorName) {
        const colorMap = {
            'red': '#f56565',
            'blue': '#4299e1',
            'green': '#48bb78',
            'yellow': '#ecc94b',
            'purple': '#9f7aea',
            'orange': '#ed8936'
        };
        return colorMap[colorName] || '#4a5568';
    }

    handleStroopAnswer(userAnswer) {
        if (!this.isRunning || this.isPaused) return;

        // Clear timers since user responded
        this.clearStroopTimers();

        this.totalAnswers++;
        this.stroopTotalAttempts++;

        const reactionTime = Date.now() - this.startTime;
        this.reactionTimes.push(reactionTime);
        this.stroopReactionTimes.push(reactionTime);

        const wordElement = document.getElementById('stroopWord');

        if (userAnswer === this.correctAnswer) {
            // CORRECT: Identified the color correctly
            this.score += 150;
            this.correctAnswers++;
            this.currentStreak++;
            this.stroopStreak++;
            this.stroopTotalCorrect++;

            if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

            // Bonus for fast reaction (under 1 second)
            let bonus = 0;
            if (reactionTime < 1000) {
                bonus = 50; // Speed bonus
                this.score += bonus;
            }

            // Show point feedback
            this.showPointFeedback(150 + bonus, true, wordElement);

            // Visual feedback
            if (wordElement) {
                wordElement.classList.add('correct');
            }

            this.playSound('correct', 1.0);

        } else {
            // WRONG: Clicked based on word meaning or wrong color
            this.score = Math.max(0, this.score - 75);
            this.currentStreak = 0;
            this.stroopStreak = 0;

            // Show point feedback
            this.showPointFeedback(-75, false, wordElement);

            // Visual feedback
            if (wordElement) {
                wordElement.classList.add('wrong');
            }

            this.playSound('wrong', 1.0);
        }

        // Update display
        this.updateDisplay();
        this.updateStroopStreakDisplay();

        // Generate new word after delay
        setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.generateStroopWord();
            }
        }, 600);
    }

    updateStroopStreakDisplay() {
        // Update streak
        const streakElement = document.getElementById('stroopStreak');
        if (streakElement) {
            streakElement.textContent = this.stroopStreak;
        }
    }

    // Game 6: Tracking Test
    setupTrackingTestElements() {
        const container = document.createElement('div');
        container.className = 'tracking-container';

        const trackingArea = document.createElement('div');
        trackingArea.className = 'tracking-area';
        trackingArea.id = 'trackingArea';

        container.appendChild(trackingArea);
        this.elements.gameContainer.appendChild(container);

        this.trackingInterval = null;
        this.targetElement = null;
        this.distractorElements = [];
        this.isClickable = false;
    }

    startTrackingTest() {
        if (!this.isRunning) return;

        // Make sure we're not in paused state when starting
        if (this.isPaused) {
            this.isPaused = false;
        }

        // Clear any existing timeouts/intervals
        if (this.clickableTimeout) {
            clearTimeout(this.clickableTimeout);
            this.clickableTimeout = null;
        }

        if (this.moveElementsInterval) {
            clearInterval(this.moveElementsInterval);
            this.moveElementsInterval = null;
        }

        this.startTracking();
        this.scheduleClickable();
    }

    startTracking() {
        if (!this.isRunning) return;

        const difficulty = this.currentGame.difficulty[this.difficulty];
        const area = document.getElementById('trackingArea');

        // Clear previous elements
        area.innerHTML = '';
        this.distractorElements = [];

        // Create target
        this.targetElement = document.createElement('div');
        this.targetElement.className = 'tracking-target';
        this.targetElement.addEventListener('click', () => this.handleTrackingClick());

        // Create distractors
        for (let i = 0; i < difficulty.distractors; i++) {
            const distractor = document.createElement('div');
            distractor.className = 'tracking-target';
            distractor.style.background = 'linear-gradient(135deg, #718096, #a0aec0)';
            this.distractorElements.push(distractor);
            area.appendChild(distractor);
        }

        area.appendChild(this.targetElement);

        // Start movement
        this.moveElements();
        this.moveElementsInterval = setInterval(() => this.moveElements(), 50);

        // Randomly make target clickable
        this.scheduleClickable();
    }

    moveElements() {
        if (!this.isRunning) return;

        const difficulty = this.currentGame.difficulty[this.difficulty];
        const area = document.getElementById('trackingArea');
        const areaWidth = area.offsetWidth - 40;
        const areaHeight = area.offsetHeight - 40;

        // Move target
        let targetX = parseInt(this.targetElement.style.left || 0);
        let targetY = parseInt(this.targetElement.style.top || 0);

        if (!targetX || !targetY) {
            targetX = Math.random() * areaWidth;
            targetY = Math.random() * areaHeight;
        }

        targetX += (Math.random() - 0.5) * 20 * difficulty.speed;
        targetY += (Math.random() - 0.5) * 20 * difficulty.speed;

        // Keep within bounds
        targetX = Math.max(0, Math.min(areaWidth, targetX));
        targetY = Math.max(0, Math.min(areaHeight, targetY));

        this.targetElement.style.left = targetX + 'px';
        this.targetElement.style.top = targetY + 'px';

        // Move distractors
        this.distractorElements.forEach(distractor => {
            let x = parseInt(distractor.style.left || 0);
            let y = parseInt(distractor.style.top || 0);

            if (!x || !y) {
                x = Math.random() * areaWidth;
                y = Math.random() * areaHeight;
            }

            x += (Math.random() - 0.5) * 15 * difficulty.speed;
            y += (Math.random() - 0.5) * 15 * difficulty.speed;

            x = Math.max(0, Math.min(areaWidth, x));
            y = Math.max(0, Math.min(areaHeight, y));

            distractor.style.left = x + 'px';
            distractor.style.top = y + 'px';
        });
    }

    scheduleClickable() {
        if (!this.isRunning || this.isPaused) return;

        this.isClickable = false;
        if (this.targetElement) {
            this.targetElement.classList.remove('clickable');
            this.targetElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            this.targetElement.style.animation = '';
        }

        // Schedule when ball turns green (1-4 seconds random)
        const delay = Math.random() * 3000 + 1000; // 1-4 seconds

        this.clickableTimeout = setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.isClickable = true;
                if (this.targetElement) {
                    this.targetElement.classList.add('clickable');
                    this.targetElement.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                }
                this.startTime = Date.now();

                // Auto-disable after 2 seconds if not clicked
                this.autoDisableTimeout = setTimeout(() => {
                    if (this.isClickable && this.isRunning && !this.isPaused) {
                        // Timeout - user missed clicking the green ball
                        this.handleMissedClick();
                    }
                }, 2000);

                // Store this timeout for cleanup
                if (this.autoDisableTimeout) {
                    this.gameTimeouts.push(this.autoDisableTimeout);
                }
            }
        }, delay);
    }

    handleMissedClick() {
        if (!this.isRunning || this.isPaused || !this.isClickable) return;

        this.totalAnswers++;
        this.score = Math.max(0, this.score - 150); // More penalty for missing
        this.currentStreak = 0;

        // Visual feedback for missed click
        if (this.targetElement) {
            this.targetElement.style.animation = 'timeout-warning 0.5s ease 3';
            this.targetElement.style.background = 'linear-gradient(135deg, #ed8936, #dd6b20)';
        }

        // Play timeout sound
        this.playSound('wrong', 1.0);

        // Show point feedback
        this.showPointFeedback(-150, false);

        // Update instructions
        this.updateInstructions(`<span style="color: #ed8936;">⌛ Missed! -150 points (2s timeout)</span>`);

        this.isClickable = false;
        if (this.targetElement) {
            this.targetElement.classList.remove('clickable');

            // Reset to blue after delay
            setTimeout(() => {
                if (this.targetElement && !this.isClickable) {
                    this.targetElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                    this.targetElement.style.animation = '';
                }
            }, 1500);
        }

        this.updateDisplay();

        // Schedule next clickable state
        setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.scheduleClickable();
            }
        }, 2000);
    }

    showPointFeedback(points, isPositive, element = null) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'point-feedback';
        feedbackDiv.textContent = isPositive ? `+${points}` : `${points}`;

        // Default to center of screen if no element provided
        let positionStyle = `
        position: fixed;
        top: 50vh;
        left: 50vw;
        transform: translate(-50%, -50%);
        font-size: 2rem;
        font-weight: bold;
        color: ${isPositive ? '#10b981' : '#f56565'};
        text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        z-index: 10000;
        pointer-events: none;
        animation: float-up 1s ease forwards;
    `;

        // If element is provided, position relative to that element
        if (element) {
            const rect = element.getBoundingClientRect();
            positionStyle = `
            position: fixed;
            top: ${rect.top + rect.height / 2}px;
            left: ${rect.left + rect.width / 2}px;
            transform: translate(-50%, -50%);
            font-size: 1.5rem;
            font-weight: bold;
            color: ${isPositive ? '#10b981' : '#f56565'};
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            z-index: 10000;
            pointer-events: none;
            animation: float-up 1s ease forwards;
        `;
        }

        feedbackDiv.style.cssText = positionStyle;

        // Add CSS for animation if not already added
        if (!document.querySelector('#float-up-animation')) {
            const style = document.createElement('style');
            style.id = 'float-up-animation';
            style.textContent = `
            @keyframes float-up {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                50% {
                    opacity: 1;
                    transform: translate(-50%, -150%) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -250%) scale(1);
                }
            }
        `;
            document.head.appendChild(style);
        }

        document.body.appendChild(feedbackDiv);

        // Remove after animation
        setTimeout(() => {
            if (feedbackDiv.parentNode) {
                feedbackDiv.parentNode.removeChild(feedbackDiv);
            }
        }, 1000);
    }


    handleTrackingClick() {
        if (!this.isRunning || this.isPaused || !this.targetElement) return;

        // Check if target is currently clickable (green)
        const isCurrentlyClickable = this.isClickable && this.targetElement.classList.contains('clickable');

        if (isCurrentlyClickable) {
            // CORRECT: Clicked when green
            this.totalAnswers++;
            const reactionTime = Date.now() - this.startTime;
            this.reactionTimes.push(reactionTime);

            this.score += 250;
            this.correctAnswers++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

            // Visual feedback for correct click
            this.targetElement.style.animation = 'none';
            this.targetElement.style.transform = 'scale(1.3)';
            this.targetElement.style.background = 'linear-gradient(135deg, #10b981, #047857)';

            // Play correct sound
            this.playSound('correct', 1.0);

            // Show point feedback
            this.showPointFeedback(250, true);

            // Update instructions
            this.updateInstructions(`<span style="color: #10b981;">✓ Correct! +250 points</span>`);

        } else {
            // WRONG: Clicked when blue OR missed clicking when green
            this.totalAnswers++;
            this.score = Math.max(0, this.score - 100);
            this.currentStreak = 0;

            // Visual feedback for wrong click
            if (this.targetElement) {
                this.targetElement.style.animation = 'shake 0.5s ease';
                this.targetElement.style.background = 'linear-gradient(135deg, #f56565, #c53030)';
            }

            // Play wrong sound
            this.playSound('wrong', 1.0);

            // Show point feedback
            this.showPointFeedback(-100, false);

            // Update instructions
            this.updateInstructions(`<span style="color: #f56565;">✗ Wrong timing! -100 points</span>`);
        }

        // Reset clickable state
        this.isClickable = false;
        if (this.targetElement) {
            this.targetElement.classList.remove('clickable');
            this.targetElement.style.transform = '';

            // Reset to blue after delay
            setTimeout(() => {
                if (this.targetElement && !this.isClickable) {
                    this.targetElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                    this.targetElement.style.animation = '';
                }
            }, 500);
        }

        // Clear auto-disable timeout
        if (this.autoDisableTimeout) {
            clearTimeout(this.autoDisableTimeout);
            this.autoDisableTimeout = null;
        }

        this.updateDisplay();

        // Schedule next clickable state
        setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.scheduleClickable();
            }
        }, 1000);
    }


    // Common game methods
    startGame() {
        setTimeout(() => {
            this.elements.gameInterface.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);

        // Double-check we're not already running
        if (this.isRunning) {
            console.log('Game already running');
            return;
        }

        // Make sure we have a current game
        if (!this.currentGame) {
            console.error('No game selected');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.currentRound = 0;
        this.totalRounds = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.reactionTimes = [];
        this.timeLeft = this.totalTime;

        this.elements.startGameBtn.disabled = true;

        // Update pause button state
        this.updatePauseButtonVisibility();
        if (this.currentGame.id !== 'visual-search') {
            this.elements.pauseGameBtn.disabled = false;
        }

        this.updateDisplay();
        this.updateTimerDisplay();

        // Show game started message
        if (this.currentGame && this.currentGame.instruction) {
            this.updateInstructions(this.currentGame.instruction);
        }

        // Start game timer
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.timeLeft--;
                this.updateTimerDisplay();

                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);

        // Initialize game-specific logic
        setTimeout(() => {
            this.startGameSpecificLogic();
        }, 300);
    }

    startGameSpecificLogic() {
        // Make sure we're running and have a current game
        if (!this.isRunning || !this.currentGame) return;

        switch (this.currentGame.id) {
            case 'color-reactor':
                this.startColorReactor();
                break;
            case 'memory-grid':
                this.startMemoryGrid();
                break;
            case 'visual-search': // Changed from 'sound-hunter'
                this.startVisualSearch();
                break;
            case 'flanker-focus':
                this.startFlankerFocus();
                break;
            case 'color-word-stroop': // Changed from 'switching-task'
                this.startStroopTask();
                break;
            case 'tracking-test':
                this.startTrackingTest();
                break;
        }
    }

    togglePause() {
        // Disable pause for visual search to prevent cheating
        if (this.currentGame && this.currentGame.id === 'visual-search') {
            this.updateInstructions('Pause is disabled for Visual Search to prevent cheating');
            return; // Don't allow pausing
        }

        this.isPaused = !this.isPaused;
        this.elements.pauseGameBtn.textContent = this.isPaused ? 'Resume' : 'Pause';

        if (this.currentGame.id === 'tracking-test') {
            if (this.isPaused) {
                // Pause movement
                if (this.moveElementsInterval) {
                    clearInterval(this.moveElementsInterval);
                    this.moveElementsInterval = null;
                }

                // Pause the clickable timeout
                if (this.clickableTimeout) {
                    clearTimeout(this.clickableTimeout);
                    this.clickableTimeout = null;
                }

            } else {
                // Resume movement
                this.moveElementsInterval = setInterval(() => this.moveElements(), 50);

                // Resume the clickable scheduling if not currently clickable
                if (!this.isClickable && this.isRunning) {
                    this.scheduleClickable();
                }
            }
        }

        this.updateInstructions(this.isPaused ? 'Game Paused' : 'Game Resumed');
    }

    restartGame() {
        this.stopGame();
        this.setupGame();
        this.startGame();
    }

    resetGame() {
        this.stopGame();
        this.score = 0;
        this.level = 1;
        this.currentRound = 0;
        this.totalRounds = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.reactionTimes = [];
        this.sequenceTimes = [];
        this.averageSequenceTime = 0;
        this.timeLeft = this.totalTime;

        // Reset game state
        this.isRunning = false;
        this.isPaused = false;

        // Update UI
        this.updateDisplay();
        this.updateTimerDisplay();

        // Use game-specific instruction
        if (this.currentGame && this.currentGame.instruction) {
            this.updateInstructions(this.currentGame.instruction);
        } else {
            this.updateInstructions('Ready to play!');
        }

        // Reset game elements
        this.setupGameElements();

        // Enable/disable buttons
        this.elements.startGameBtn.disabled = false;

        // Update pause button
        this.updatePauseButtonVisibility();
        if (this.currentGame.id !== 'visual-search') {
            this.elements.pauseGameBtn.disabled = true;
            this.elements.pauseGameBtn.textContent = 'Pause';
        }
    }

    setupGameElements() {
        // Clear existing game elements
        this.elements.gameContainer.innerHTML = '';

        // Set up game-specific elements without starting
        switch (this.currentGame.id) {
            case 'color-reactor':
                this.setupColorReactorElements();
                this.updateInstructions(this.currentGame.instruction);
                break;
            case 'memory-grid':
                this.setupMemoryGridElements();
                this.updateInstructions(this.currentGame.instruction);
                break;
            case 'visual-search': // Changed from 'sound-hunter'
                this.setupVisualSearchElements();
                this.updateInstructions(this.currentGame.instruction);
                break;
            case 'flanker-focus':
                this.setupFlankerFocusElements();
                this.updateInstructions(this.currentGame.instruction);
                break;
            case 'color-word-stroop':
                this.setupStroopTaskElements();
                this.updateInstructions(this.currentGame.instruction);
                break;
            case 'tracking-test':
                this.setupTrackingTestElements();
                this.updateInstructions(this.currentGame.instruction);
                break;
        }
    }

    endGame() {
        this.stopGame();
        this.showResultsScreen();
    }

    stopGame() {
        this.isRunning = false;
        this.isPaused = false;

        this.elements.startGameBtn.disabled = false;
        this.elements.pauseGameBtn.disabled = true;
        this.elements.pauseGameBtn.textContent = 'Pause';

        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Stop tracking interval
        if (this.moveElementsInterval) {
            clearInterval(this.moveElementsInterval);
            this.moveElementsInterval = null;
        }

        // Remove keyboard listener for flanker game
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }

        // Clear any timeouts
        this.gameTimeouts.forEach(timeout => clearTimeout(timeout));
        this.gameTimeouts = [];

        // Clear clickable timeout
        if (this.clickableTimeout) {
            clearTimeout(this.clickableTimeout);
            this.clickableTimeout = null;
        }

        // Reset clickable state
        this.isClickable = false;

        // Clear visual search timers
        if (this.currentGame && this.currentGame.id === 'visual-search') {
            this.clearVisualSearchTimers();
            // Restore original instructions if needed
            const instructions = document.querySelector('.visual-search-instructions');
            if (instructions && this.visualSearchOriginalInstructions) {
                instructions.innerHTML = this.visualSearchOriginalInstructions;
            }
        }

        // Clear Stroop timers and restore instructions
        if (this.currentGame && this.currentGame.id === 'color-word-stroop') {
            this.clearStroopTimers();
            this.showOriginalInstructions();
        }

        // Reset game-specific states
        this.resetGameStates();
    }

    resetGameStates() {
        // Reset all game-specific flags and states
        this.isShowingSequence = false;
        this.currentSequence = [];
        this.userSequence = [];
        this.currentTones = [];
        this.isClickable = false;
        this.currentArrows = [];
        this.isShowingFeedback = false; // Add this

        // Clear any animation intervals
        if (this.moveElementsInterval) {
            clearInterval(this.moveElementsInterval);
            this.moveElementsInterval = null;
        }

        // Clear any scheduled clickable timeouts
        if (this.clickableTimeout) {
            clearTimeout(this.clickableTimeout);
            this.clickableTimeout = null;
        }

        // Clear auto-disable timeout
        if (this.autoDisableTimeout) {
            clearTimeout(this.autoDisableTimeout);
            this.autoDisableTimeout = null;
        }
    }

    updateDisplay() {
        this.elements.gameScore.textContent = this.score;
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.elements.gameTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    updateInstructions(text) {
        this.elements.gameInstructions.innerHTML = `<p>${text}</p>`;
    }

    playSound(type, volume = 1.0) {
        volume = 0.7; // lower volume
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        oscillator.connect(envelope);
        envelope.connect(this.gainNode);

        const frequencies = {
            correct: 800,
            wrong: 300,
            click: 500
        };

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequencies[type] || 500, this.audioContext.currentTime);

        envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
        envelope.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.1);
        envelope.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    playTone(frequency, duration) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();

        oscillator.connect(envelope);
        envelope.connect(this.gainNode);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
        envelope.gain.linearRampToValueAtTime(1.0, this.audioContext.currentTime + 0.05);
        envelope.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    updateResults() {
        const accuracy = this.totalAnswers > 0
            ? Math.round((this.correctAnswers / this.totalAnswers) * 100)
            : 0;

        const avgReaction = this.reactionTimes.length > 0
            ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
            : 0;

        // Update current results
        this.elements.finalScore.textContent = this.score;
        this.elements.finalAccuracy.textContent = `${accuracy}%`;
        this.elements.finalReaction.textContent = `${avgReaction}ms`;
        this.elements.finalStreak.textContent = this.bestStreak;

        // Save to localStorage and show previous best
        const savedData = this.saveScoreToStorage();
        const previousBest = this.loadPreviousBest();

        // Update previous best displays
        if (this.elements.previousScore) {
            this.elements.previousScore.textContent = previousBest ? `Previous best: ${previousBest.score}` : 'Previous best: --';
        }
        if (this.elements.previousAccuracy) {
            this.elements.previousAccuracy.textContent = previousBest ? `Previous best: ${previousBest.accuracy}%` : 'Previous best: --';
        }
        if (this.elements.previousReaction) {
            this.elements.previousReaction.textContent = previousBest && previousBest.reaction !== '--'
                ? `Previous best: ${previousBest.reaction}ms`
                : 'Previous best: --';
        }
        if (this.elements.previousStreak) {
            this.elements.previousStreak.textContent = previousBest ? `Previous best: ${previousBest.streak}` : 'Previous best: --';
        }

        // Hide irrelevant indicators
        this.hideIrrelevantIndicators();

        // Update skill meters with improved memory game calculation
        this.updateSkillMeters(accuracy, avgReaction);

        // Setup tooltip events
        this.setupTooltipEvents();
    }

    // Hide irrelevant indicators based on game
    hideIrrelevantIndicators() {
        // Get all result items
        const resultItems = document.querySelectorAll('.result-item');

        // Reaction time is the 3rd item (index 2)
        const reactionItem = resultItems[2];

        if (reactionItem && this.currentGame.id === 'memory-grid') {
            reactionItem.classList.add('hidden');
        } else if (reactionItem) {
            reactionItem.classList.remove('hidden');
        }
    }

    setupTooltipEvents() {
        const tooltipIcons = document.querySelectorAll('.tooltip-icon');
        const tooltipContainer = this.elements.tooltipContainer;

        // Add click event to all tooltip icons
        tooltipIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const tooltipType = icon.dataset.tooltip;
                this.showTooltip(tooltipType);
            });
        });

        // Close tooltip when clicking outside or on close button
        if (tooltipContainer) {
            tooltipContainer.addEventListener('click', (e) => {
                if (e.target === tooltipContainer || e.target.classList.contains('tooltip-close')) {
                    this.hideTooltip();
                }
            });
        }

        // Close tooltip with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && tooltipContainer && tooltipContainer.style.display === 'flex') {
                this.hideTooltip();
            }
        });
    }

    showTooltip(tooltipType) {
        const tooltipContainer = this.elements.tooltipContainer;
        const tooltipData = this.tooltips[tooltipType];

        if (!tooltipData || !tooltipContainer) return;

        // Get game-specific content if available
        let content = tooltipData.content;
        if (this.gameSpecificTooltips[this.currentGame.id] &&
            this.gameSpecificTooltips[this.currentGame.id][tooltipType]) {
            content = this.gameSpecificTooltips[this.currentGame.id][tooltipType];
        }

        tooltipContainer.innerHTML = `
        <div class="tooltip-content">
            <button class="tooltip-close">×</button>
            <h4>${tooltipData.title}</h4>
            <p>${content}</p>
            <p><small>Click outside or press ESC to close</small></p>
        </div>
    `;

        tooltipContainer.style.display = 'flex';
    }

    hideTooltip() {
        const tooltipContainer = this.elements.tooltipContainer;
        if (tooltipContainer) {
            tooltipContainer.style.display = 'none';
        }
    }

    formatTime(seconds) {
        if (seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Save score to localStorage
    saveScoreToStorage() {
        if (!this.currentGame) return null;

        const storageKey = `attention-game-${this.currentGame.id}-${this.totalTime}`;
        const previousData = JSON.parse(localStorage.getItem(storageKey)) || {
            score: 0,
            accuracy: 0,
            reaction: Infinity,
            streak: 0,
            count: 0
        };

        const accuracy = this.totalAnswers > 0
            ? Math.round((this.correctAnswers / this.totalAnswers) * 100)
            : 0;

        const avgReaction = this.reactionTimes.length > 0
            ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
            : 0;

        const newData = {
            score: Math.max(previousData.score, this.score),
            accuracy: Math.max(previousData.accuracy, accuracy),
            reaction: this.reactionTimes.length > 0 ? Math.min(previousData.reaction, avgReaction) : previousData.reaction,
            streak: Math.max(previousData.streak, this.bestStreak),
            count: previousData.count + 1,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(storageKey, JSON.stringify(newData));
        return newData;
    }

    // Load previous best scores
    loadPreviousBest() {
        if (!this.currentGame) return null;

        const storageKey = `attention-game-${this.currentGame.id}-${this.totalTime}`;
        const data = JSON.parse(localStorage.getItem(storageKey));

        if (!data) return null;

        return {
            score: data.score || 0,
            accuracy: data.accuracy || 0,
            reaction: data.reaction !== Infinity ? data.reaction : '--',
            streak: data.streak || 0
        };
    }

    // Update skill meters with improved calculation for memory games
    updateSkillMeters(accuracy, avgReaction) {
        let reactionSkill = 0;
        let memorySkill = 0;
        let focusSkill = 0;

        switch (this.currentGame.id) {
            case 'color-reactor':
                // Reaction skill = 60% accuracy + 40% reaction speed
                let reactionSpeedScore = 0;
                if (avgReaction > 0) {
                    // Convert reaction time to score: 300ms = 40, 1000ms = 0
                    reactionSpeedScore = Math.max(0, Math.min(40, 40 - (avgReaction - 300) / 17.5));
                }
                reactionSkill = Math.min(100, (accuracy * 0.6) + reactionSpeedScore);

                // Focus skill = 50% accuracy + 30% streak + 20% consistency
                const consistency = this.totalAnswers > 0 ? (this.correctAnswers / this.totalAnswers) * 20 : 0;
                focusSkill = Math.min(100, (accuracy * 0.5) + Math.min(30, this.bestStreak * 3) + consistency);
                break;
            case 'flanker-focus':
                // Reaction skill considers both speed and accuracy
                let reactionTimeScore = 0;
                if (avgReaction > 0) {
                    // More complex arrows = slower expected reaction time
                    const baseTime = this.currentGame.difficulty[this.difficulty].directionTypes.length > 2 ? 600 : 400;
                    const maxTime = baseTime * 2.5;
                    reactionTimeScore = Math.max(0, Math.min(40, 50 - ((avgReaction - baseTime) / (maxTime - baseTime) * 40)));
                }

                reactionSkill = Math.min(100, (accuracy * 0.7) + reactionTimeScore);

                // Focus skill: penalize errors more heavily in complex versions
                const errorPenalty = (this.totalAnswers - this.correctAnswers) * (this.difficulty === 'hard' ? 3 : 2);
                const baseFocus = (accuracy * 0.6) + Math.min(30, this.bestStreak * (this.difficulty === 'hard' ? 2.5 : 3));
                focusSkill = Math.max(0, Math.min(100, baseFocus - Math.min(25, errorPenalty)));
                break;

            case 'memory-grid':
                // IMPROVED MEMORY GAME CALCULATION
                const difficulty = this.currentGame.difficulty[this.difficulty];

                // 1. Base memory from accuracy (40% weight)
                const memoryFromAccuracy = accuracy * 0.4;

                // 2. Memory from sequence length (30% weight)
                // Longer sequences = better memory
                const maxSequenceLength = 6; // Hard difficulty
                const sequenceLengthBonus = (difficulty.sequenceLength / maxSequenceLength) * 30;

                // 3. Memory from consistency (30% weight)
                // Streak shows consistency in memory recall
                const consistencyBonus = Math.min(30, this.bestStreak * 3);

                // 4. Penalty for time (if tracking sequence completion time)
                let timePenalty = 0;
                if (this.averageSequenceTime > 0) {
                    // If average time > 10 seconds per sequence, apply penalty
                    const timePenaltyPercent = Math.max(0, (this.averageSequenceTime - 10000) / 100);
                    timePenalty = Math.min(15, timePenaltyPercent);
                }

                // Calculate final memory skill
                memorySkill = Math.min(100,
                    memoryFromAccuracy +
                    sequenceLengthBonus +
                    consistencyBonus -
                    timePenalty
                );

                // Focus calculation for memory grid
                // Focus = ability to maintain attention during memory task
                // 1. From accuracy (40%)
                const focusFromAccuracy = accuracy * 0.4;

                // 2. From streak - shows sustained focus (40%)
                const focusFromStreak = Math.min(40, this.bestStreak * 5);

                // 3. From grid size - larger grid requires more focus (20%)
                const maxGridSize = 4;
                const focusFromGridSize = (difficulty.gridSize / maxGridSize) * 20;

                focusSkill = Math.min(100,
                    focusFromAccuracy +
                    focusFromStreak +
                    focusFromGridSize
                );

                // Hide reaction skill for memory grid
                reactionSkill = 0;
                break;
            case 'visual-search': // Changed from 'sound-hunter'
                // Visual scanning skill: Fast and accurate pattern recognition
                let visualScanningScore = 0;
                if (avgReaction > 0) {
                    // Good visual search: 1500-2500ms depending on difficulty
                    const baseTime = this.difficulty === 'easy' ? 2500 :
                        this.difficulty === 'medium' ? 2000 : 1500;
                    const maxTime = baseTime * 2;
                    visualScanningScore = Math.max(0, Math.min(40, 40 - (avgReaction - baseTime) / ((maxTime - baseTime) / 40)));
                }

                reactionSkill = Math.min(100, (accuracy * 0.6) + visualScanningScore);

                // Focus skill: Sustained visual attention and scanning
                const visualStreakScore = Math.min(30, this.bestStreak * 3);
                const visualConsistencyScore = Math.min(40, accuracy * 0.4);

                focusSkill = Math.max(0, Math.min(100,
                    (accuracy * 0.3) +
                    visualStreakScore +
                    visualConsistencyScore
                ));
                break;
            case 'color-word-stroop': // Update game ID in your games array
                // Reaction skill: Very important in Stroop - faster = better
                let reactionTimeScoreForColorStroop = 0;
                if (avgReaction > 0) {
                    // Stroop effect makes reactions slower, so adjust expectations
                    const baseTime = 800; // Normal Stroop reaction is slower
                    const maxTime = 2000;
                    reactionTimeScoreForColorStroop = Math.max(0, Math.min(40, 40 - (avgReaction - baseTime) / 30));
                }
                reactionSkill = Math.min(100, (accuracy * 0.6) + reactionTimeScoreForColorStroop);

                // Focus skill: Ability to inhibit automatic reading response
                // Streak shows consistency in overcoming the Stroop effect
                const streakScore = Math.min(30, this.stroopStreak * 2);

                // Interference effect measurement (how much word meaning affects you)
                let interferenceScore = 0;
                if (this.stroopTotalAttempts > 10) {
                    // Higher accuracy = better inhibition of automatic reading
                    interferenceScore = Math.min(40, (this.stroopTotalCorrect / this.stroopTotalAttempts) * 40);
                }

                focusSkill = Math.max(0, Math.min(100,
                    (accuracy * 0.3) +
                    streakScore +
                    interferenceScore
                ));
                break;

            case 'tracking-test':
                // Get difficulty multiplier
                const difficultyMultiplier = {
                    'easy': 1.0,
                    'medium': 1.2,
                    'hard': 1.5
                }[this.difficulty];

                // Reaction skill: Important for tracking - faster = better
                let reactionTimeScoreForTracking = 0;
                if (avgReaction > 0) {
                    // Tracking requires visual processing and motor response
                    const baseTime = 1500; // Good tracking reaction time
                    const maxTime = 3000;
                    reactionTimeScoreForTracking = Math.max(0, Math.min(40, 40 - (avgReaction - baseTime) / 37.5));
                }
                reactionSkill = Math.min(100, (accuracy * 0.6) + reactionTimeScoreForTracking);

                // Focus skill: Ability to sustain attention on moving target
                // Streak shows consistency in tracking
                const streakScoreForTrackingTest = Math.min(30, this.bestStreak * 3);

                // Tracking consistency measurement (how well you maintain focus)
                let trackingConsistencyScore = 0;
                if (this.totalAnswers > 5) {
                    // Higher accuracy with more attempts = better sustained attention
                    trackingConsistencyScore = Math.min(40, (this.correctAnswers / this.totalAnswers) * 40);
                }

                // Difficulty bonus for harder tracking
                const difficultyBonus = (difficultyMultiplier - 1) * 10;

                focusSkill = Math.max(0, Math.min(100,
                    (accuracy * 0.3) +
                    streakScoreForTrackingTest +
                    trackingConsistencyScore +
                    difficultyBonus
                ));
                break;
        }

        if (this.elements.reactionSkill) {
            this.elements.reactionSkill.style.width = `${reactionSkill}%`;

            // Hide reaction skill element for memory grid
            const reactionSkillElement = this.elements.reactionSkill.parentElement.parentElement;
            if (this.currentGame.id === 'memory-grid') {
                reactionSkillElement.classList.add('hidden');
            } else {
                reactionSkillElement.classList.remove('hidden');
            }
        }

        // Only update memory skill for memory grid game
        if (this.elements.memorySkill) {
            if (this.currentGame.id === 'memory-grid') {
                this.elements.memorySkill.style.width = `${memorySkill}%`;
                this.elements.memorySkill.parentElement.parentElement.classList.remove('hidden');
            } else {
                this.elements.memorySkill.parentElement.parentElement.classList.add('hidden');
            }
        }

        if (this.elements.focusSkill) {
            this.elements.focusSkill.style.width = `${focusSkill}%`;
        }
    }
}

// Initialize the application
let attentionGame;

document.addEventListener('DOMContentLoaded', () => {
    attentionGame = new AttentionTrainingGame();
});