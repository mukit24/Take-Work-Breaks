// Attention Training Games Application
class AttentionTrainingGame {
    constructor() {
        // Game data with orange color added
        this.games = [
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
                id: 'memory-grid',
                name: 'Memory Grid',
                description: 'Remember and reproduce lit patterns',
                skill: 'Visual Memory',
                instruction: 'Memorize the pattern, then click cells in same order.',
                difficulty: {
                    easy: { gridSize: 3, sequenceLength: 3, timeLimit: 5 },
                    medium: { gridSize: 4, sequenceLength: 4, timeLimit: 4 },
                    hard: { gridSize: 4, sequenceLength: 6, timeLimit: 3 }
                }
            },
            {
                id: 'sound-hunter',
                name: 'Sound Hunter',
                description: 'Identify target sound among noise',
                skill: 'Auditory Focus',
                instruction: 'Listen for the target sound. Is it present?',
                difficulty: {
                    easy: { tones: 3, backgroundNoise: 0.1, timeLimit: 3 },
                    medium: { tones: 5, backgroundNoise: 0.3, timeLimit: 2 },
                    hard: { tones: 7, backgroundNoise: 0.5, timeLimit: 1 }
                }
            },
            {
                id: 'flanker-focus',
                name: 'Flanker Focus',
                description: 'Identify center arrow direction',
                skill: 'Selective Attention',
                instruction: 'Identify direction of CENTER arrow only',
                difficulty: {
                    easy: { arrows: 3, speed: 2000, congruentOnly: true },
                    medium: { arrows: 5, speed: 1500, congruentOnly: false },
                    hard: { arrows: 7, speed: 1000, congruentOnly: false }
                }
            },
            {
                id: 'switching-task',
                name: 'Switching Task',
                description: 'Apply changing rules to shapes',
                skill: 'Mental Flexibility',
                instruction: 'Follow the changing rules for shapes',
                difficulty: {
                    easy: { rules: 2, switchEvery: 10, timeLimit: 4 },
                    medium: { rules: 3, switchEvery: 8, timeLimit: 3 },
                    hard: { rules: 4, switchEvery: 6, timeLimit: 2 }
                }
            },
            {
                id: 'tracking-test',
                name: 'Tracking Test',
                description: 'Follow moving object among distractors',
                skill: 'Sustained Attention',
                instruction: 'Follow the BLUE circle. Click when it turns GREEN!',
                difficulty: {
                    easy: { targets: 1, distractors: 5, speed: 2 },
                    medium: { targets: 1, distractors: 10, speed: 3 },
                    hard: { targets: 1, distractors: 15, speed: 4 }
                }
            }
        ];

        // Game state
        this.currentGame = null;
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.level = 1;
        this.timeLeft = 0;
        this.totalTime = 120; // 2 minutes default
        this.difficulty = 'medium';
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

        // Add these for cleanup
        this.gameTimeouts = [];  // Store timeouts for cleanup
        this.moveElementsInterval = null;
        this.clickableTimeout = null;

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
                reaction: 'Memory games don\'t measure reaction time.'
            },
            'sound-hunter': {
                reaction: 'Time to identify if target sound is present. Tests auditory processing.',
                accuracy: 'Correctly identifying presence/absence of target tone.'
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
            this.gainNode.gain.value = 0.5;
        } catch (error) {
            console.log('Audio not supported:', error);
        }
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
        this.timeLeft = this.totalTime;

        this.updateDisplay();
        this.updateTimerDisplay();
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

            circle.classList.add('active');
            setTimeout(() => {
                circle.classList.remove('active');
                this.generateNewColors();
            }, 300);

            this.playSound('correct');
        } else {
            this.score = Math.max(0, this.score - 50);
            this.currentStreak = 0;
            circle.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                circle.style.animation = '';
            }, 500);

            this.playSound('wrong');
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
        this.userSequence.push(cellIndex);

        cell.classList.add('active');
        setTimeout(() => cell.classList.remove('active'), 300);

        // Check if correct
        const currentIndex = this.userSequence.length - 1;
        if (this.userSequence[currentIndex] === this.currentSequence[currentIndex]) {
            this.playSound('correct');

            if (this.userSequence.length === this.currentSequence.length) {
                // Complete sequence
                this.score += 500;
                this.correctAnswers++;
                this.currentStreak++;
                if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

                setTimeout(() => {
                    this.userSequence = [];
                    this.showMemorySequence();
                }, 1000);

                this.updateInstructions('Correct! Remember the next pattern...');
            }
        } else {
            // Wrong answer
            this.playSound('wrong');
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

    // Game 3: Sound Hunter
    setupSoundHunterElements() {
        const container = document.createElement('div');
        container.className = 'sound-hunter-container';

        const visualizer = document.createElement('div');
        visualizer.className = 'sound-visualizer';

        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.className = 'sound-wave';
            wave.style.animationDelay = `${i * 0.3}s`;
            visualizer.appendChild(wave);
        }

        container.appendChild(visualizer);

        const controls = document.createElement('div');
        controls.className = 'sound-controls';

        const yesBtn = document.createElement('button');
        yesBtn.className = 'sound-btn sound-yes';
        yesBtn.textContent = 'YES';
        yesBtn.addEventListener('click', () => this.handleSoundAnswer(true));

        const noBtn = document.createElement('button');
        noBtn.className = 'sound-btn sound-no';
        noBtn.textContent = 'NO';
        noBtn.addEventListener('click', () => this.handleSoundAnswer(false));

        controls.appendChild(yesBtn);
        controls.appendChild(noBtn);
        container.appendChild(controls);

        this.elements.gameContainer.appendChild(container);
        this.currentTargetFrequency = 440;
        this.currentTones = [];
    }

    startSoundHunter() {
        if (!this.isRunning) return;
        this.playSoundSet();
    }

    playSoundSet() {
        if (!this.audioContext || !this.isRunning) return;

        const difficulty = this.currentGame.difficulty[this.difficulty];
        this.currentTones = [];

        // Add target sound (50% chance)
        const hasTarget = Math.random() > 0.5;
        if (hasTarget) {
            this.currentTones.push(this.currentTargetFrequency);
        }

        // Add distractor tones
        const numDistractors = difficulty.tones - (hasTarget ? 1 : 0);
        for (let i = 0; i < numDistractors; i++) {
            const randomFreq = 300 + Math.random() * 500;
            this.currentTones.push(randomFreq);
        }

        // Shuffle tones
        this.currentTones.sort(() => Math.random() - 0.5);

        // Play tones
        this.currentTones.forEach((freq, index) => {
            setTimeout(() => {
                if (this.isRunning && !this.isPaused) {
                    this.playTone(freq, 0.3);
                }
            }, index * 300);
        });

        this.correctAnswer = hasTarget;
        this.startTime = Date.now();
    }

    handleSoundAnswer(userAnswer) {
        if (!this.isRunning || this.isPaused) return;

        this.totalAnswers++;
        const reactionTime = Date.now() - this.startTime;
        this.reactionTimes.push(reactionTime);

        if (userAnswer === this.correctAnswer) {
            this.score += 200;
            this.correctAnswers++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;
            this.playSound('correct');
            this.updateInstructions('Correct! Listen for next sound...');
        } else {
            this.score = Math.max(0, this.score - 100);
            this.currentStreak = 0;
            this.playSound('wrong');
            this.updateInstructions('Wrong! The target was ' + (this.correctAnswer ? 'present' : 'not present'));
        }

        this.updateDisplay();

        setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.playSoundSet();
            }
        }, 1000);
    }

    // Game 4: Flanker Focus
    setupFlankerFocusElements() {
        const container = document.createElement('div');
        container.className = 'flanker-container';

        const arrowsDiv = document.createElement('div');
        arrowsDiv.className = 'flanker-arrows';

        const difficulty = this.currentGame.difficulty[this.difficulty];
        this.currentArrows = [];

        for (let i = 0; i < difficulty.arrows; i++) {
            const arrowBox = document.createElement('div');
            arrowBox.className = 'arrow-box';

            if (i === Math.floor(difficulty.arrows / 2)) {
                arrowBox.classList.add('focus');
            }

            arrowsDiv.appendChild(arrowBox);
        }

        container.appendChild(arrowsDiv);

        const keyInstructions = document.createElement('div');
        keyInstructions.className = 'arrow-key';
        keyInstructions.innerHTML = 'Press ← for LEFT or → for RIGHT';
        container.appendChild(keyInstructions);

        this.elements.gameContainer.appendChild(container);

        // Keyboard controls
        this.keydownHandler = (e) => {
            if (!this.isRunning || this.isPaused || e.repeat) return;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.handleFlankerAnswer(e.key === 'ArrowRight' ? 'right' : 'left');
            }
        };

        document.addEventListener('keydown', this.keydownHandler);
    }

    startFlankerFocus() {
        if (!this.isRunning) return;
        this.generateFlankerArrows();
    }

    generateFlankerArrows() {
        if (!this.isRunning) return;

        const difficulty = this.currentGame.difficulty[this.difficulty];
        const arrows = this.elements.gameContainer.querySelectorAll('.arrow-box');
        const directions = ['←', '→'];

        // Choose center direction
        const centerDirection = directions[Math.floor(Math.random() * 2)];
        const centerIndex = Math.floor(difficulty.arrows / 2);

        // Determine if congruent (all same direction) or incongruent
        let flankerDirection;
        if (difficulty.congruentOnly || Math.random() > 0.5) {
            flankerDirection = centerDirection; // Congruent
        } else {
            flankerDirection = centerDirection === '←' ? '→' : '←'; // Incongruent
        }

        arrows.forEach((arrow, index) => {
            if (index === centerIndex) {
                arrow.textContent = centerDirection;
                this.correctAnswer = centerDirection === '→' ? 'right' : 'left';
            } else {
                arrow.textContent = flankerDirection;
            }
        });

        this.startTime = Date.now();
    }

    handleFlankerAnswer(userAnswer) {
        if (!this.isRunning) return;

        this.totalAnswers++;
        const reactionTime = Date.now() - this.startTime;
        this.reactionTimes.push(reactionTime);

        if (userAnswer === this.correctAnswer) {
            this.score += 150;
            this.correctAnswers++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;
            this.playSound('correct');
        } else {
            this.score = Math.max(0, this.score - 75);
            this.currentStreak = 0;
            this.playSound('wrong');
        }

        this.updateDisplay();

        setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.generateFlankerArrows();
            }
        }, 500);
    }

    // Game 5: Switching Task
    setupSwitchingTaskElements() {
        const container = document.createElement('div');
        container.className = 'switching-container';

        const instructions = document.createElement('div');
        instructions.className = 'switching-instructions';
        instructions.id = 'switchingInstructions';
        container.appendChild(instructions);

        const shapesDiv = document.createElement('div');
        shapesDiv.className = 'switching-shapes';

        const circle = document.createElement('div');
        circle.className = 'shape-item shape-circle';
        circle.innerHTML = '<div class="shape-icon">○</div>';
        circle.addEventListener('click', () => this.handleShapeClick('circle'));

        const square = document.createElement('div');
        square.className = 'shape-item shape-square';
        square.innerHTML = '<div class="shape-icon">□</div>';
        square.addEventListener('click', () => this.handleShapeClick('square'));

        shapesDiv.appendChild(circle);
        shapesDiv.appendChild(square);
        container.appendChild(shapesDiv);

        this.elements.gameContainer.appendChild(container);

        this.currentRule = 'color';
        this.currentColor = 'blue';
    }

    startSwitchingTask() {
        if (!this.isRunning) return;
        this.updateSwitchingInstructions();
    }

    updateSwitchingInstructions() {
        if (!this.isRunning) return;

        const instructions = document.getElementById('switchingInstructions');
        if (this.currentRule === 'color') {
            instructions.textContent = 'RULE: Click BLUE shapes only';
        } else {
            instructions.textContent = 'RULE: Click CIRCLES only';
        }

        const shapes = this.elements.gameContainer.querySelectorAll('.shape-item');
        shapes.forEach(shape => {
            const isCircle = shape.classList.contains('shape-circle');
            const isBlue = shape.classList.contains('shape-circle'); // Circle is blue

            if (this.currentRule === 'color') {
                shape.style.opacity = isBlue ? '1' : '0.5';
            } else {
                shape.style.opacity = isCircle ? '1' : '0.5';
            }
        });

        this.startTime = Date.now();
    }

    handleShapeClick(shapeType) {
        if (!this.isRunning || this.isPaused) return;

        this.totalAnswers++;
        const reactionTime = Date.now() - this.startTime;
        this.reactionTimes.push(reactionTime);

        const isCircle = shapeType === 'circle';
        const isBlue = isCircle; // In our design, circle is blue

        let isCorrect = false;
        if (this.currentRule === 'color') {
            isCorrect = isBlue;
        } else {
            isCorrect = isCircle;
        }

        if (isCorrect) {
            this.score += 100;
            this.correctAnswers++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;
            this.playSound('correct');

            // Switch rule after certain number of correct answers
            const difficulty = this.currentGame.difficulty[this.difficulty];
            if (this.correctAnswers % difficulty.switchEvery === 0) {
                this.currentRule = this.currentRule === 'color' ? 'shape' : 'color';
                this.updateSwitchingInstructions();
            }
        } else {
            this.score = Math.max(0, this.score - 50);
            this.currentStreak = 0;
            this.playSound('wrong');
        }

        this.updateDisplay();
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
        if (!this.isRunning) return;

        this.isClickable = false;
        if (this.targetElement) {
            this.targetElement.classList.remove('clickable');
        }

        this.clickableTimeout = setTimeout(() => {
            if (this.isRunning && !this.isPaused) {
                this.isClickable = true;
                if (this.targetElement) {
                    this.targetElement.classList.add('clickable');
                }
                this.startTime = Date.now();

                // Auto-disable after 2 seconds if not clicked
                setTimeout(() => {
                    if (this.isClickable && this.isRunning) {
                        this.isClickable = false;
                        if (this.targetElement) {
                            this.targetElement.classList.remove('clickable');
                        }
                        this.scheduleClickable();
                    }
                }, 2000);
            }
        }, Math.random() * 3000 + 2000);
    }

    handleTrackingClick() {
        if (!this.isRunning || this.isPaused || !this.isClickable) return;

        this.totalAnswers++;
        const reactionTime = Date.now() - this.startTime;
        this.reactionTimes.push(reactionTime);

        this.score += 250;
        this.correctAnswers++;
        this.currentStreak++;
        if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

        this.playSound('correct');
        this.updateDisplay();

        this.isClickable = false;
        if (this.targetElement) {
            this.targetElement.classList.remove('clickable');
        }
        this.scheduleClickable();
    }

    // Common game methods
    startGame() {
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
        this.elements.pauseGameBtn.disabled = false;

        this.updateDisplay();
        this.updateTimerDisplay();

        // Show game started message
        if (this.currentGame && this.currentGame.instruction) {
            this.updateInstructions(this.currentGame.instruction + ' Game started!');
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
        this.startGameSpecificLogic();
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
            case 'sound-hunter':
                this.startSoundHunter();
                break;
            case 'flanker-focus':
                this.startFlankerFocus();
                break;
            case 'switching-task':
                this.startSwitchingTask();
                break;
            case 'tracking-test':
                this.startTrackingTest();
                break;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.elements.pauseGameBtn.textContent = this.isPaused ? 'Resume' : 'Pause';

        if (this.currentGame.id === 'tracking-test') {
            if (this.isPaused) {
                if (this.moveElementsInterval) {
                    clearInterval(this.moveElementsInterval);
                    this.moveElementsInterval = null;
                }
            } else {
                this.moveElementsInterval = setInterval(() => this.moveElements(), 50);
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
        this.elements.pauseGameBtn.disabled = true;
        this.elements.pauseGameBtn.textContent = 'Pause';
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
            case 'sound-hunter':
                this.setupSoundHunterElements();
                this.updateInstructions(this.currentGame.instruction);
                break;
            case 'flanker-focus':
                this.setupFlankerFocusElements();
                this.updateInstructions(this.currentGame.instruction);
                break;
            case 'switching-task':
                this.setupSwitchingTaskElements();
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

        if (this.clickableTimeout) {
            clearTimeout(this.clickableTimeout);
            this.clickableTimeout = null;
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

    playSound(type) {
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
        envelope.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
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
        envelope.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
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

        this.hideMemorySkill();

        // Update skill meters
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

    hideMemorySkill() {
        const memorySkillElement = document.querySelector('.skill-meter:nth-child(2)');

        if (memorySkillElement) {
            if (this.currentGame.id !== 'memory-grid') {
                memorySkillElement.classList.add('hidden');
            } else {
                memorySkillElement.classList.remove('hidden');
            }
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

    // Also update showTooltip to remove targetElement parameter:
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

    // Update skill meters
    updateSkillMeters(accuracy, avgReaction) {
        let reactionSkill = 0;
        let memorySkill = 0;
        let focusSkill = 0;

        switch (this.currentGame.id) {
            case 'color-reactor':
            case 'flanker-focus':
                reactionSkill = Math.min(100, accuracy + this.bestStreak * 5);
                focusSkill = Math.min(100, this.bestStreak * 10);
                break;
            case 'memory-grid':
                memorySkill = Math.min(100, accuracy + this.bestStreak * 8);
                focusSkill = Math.min(100, this.bestStreak * 12);
                break;
            case 'sound-hunter':
                reactionSkill = Math.min(100, 100 - Math.min(avgReaction / 20, 100));
                focusSkill = Math.min(100, accuracy);
                break;
            case 'switching-task':
                reactionSkill = Math.min(100, accuracy);
                focusSkill = Math.min(100, this.bestStreak * 15);
                break;
            case 'tracking-test':
                focusSkill = Math.min(100, accuracy * 2);
                reactionSkill = Math.min(100, 100 - Math.min(avgReaction / 30, 100));
                break;
        }

        if (this.elements.reactionSkill) {
            this.elements.reactionSkill.style.width = `${reactionSkill}%`;
        }

        // Only update memory skill for memory grid game
        if (this.elements.memorySkill && this.currentGame.id === 'memory-grid') {
            this.elements.memorySkill.style.width = `${memorySkill}%`;
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