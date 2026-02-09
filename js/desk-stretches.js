// Desk Stretches Application
class DeskStretches {
    constructor() {
        // Exercise data with step-by-step breakdown and timing
        this.stretches = [
            {
                id: 'neck-tilt',
                name: 'Neck Tilt',
                baseTime: 25, // seconds per rep
                steps: [
                    { instruction: 'Sit up straight with shoulders relaxed', time: 3 },
                    { instruction: 'Slowly tilt your head to the left', time: 3 },
                    { instruction: 'Hold for 5 seconds, feeling the stretch', time: 5 },
                    { instruction: 'Return to center position slowly', time: 3 },
                    { instruction: 'Tilt your head to the right', time: 3 },
                    { instruction: 'Hold for 5 seconds', time: 5 },
                    { instruction: 'Return to center and relax', time: 3 }
                ],
                image: 'assets/stretches/neck-tilt.jpg',
                benefit: 'Relieves neck tension and improves flexibility'
            },
            {
                id: 'shoulder-roll',
                name: 'Shoulder Roll',
                baseTime: 30,
                steps: [
                    { instruction: 'Sit or stand with your arms relaxed', time: 4 },
                    { instruction: 'Slowly roll your shoulders up toward your ears', time: 4 },
                    { instruction: 'Complete 5 forward rotations', time: 7 },
                    { instruction: 'Pause', time: 2 },
                    { instruction: 'Start backward rotations', time: 4 },
                    { instruction: 'Complete 5 backward rotations', time: 7 },
                    { instruction: 'Keep your arms relaxed', time: 2 }
                ],
                image: 'assets/stretches/shoulder-roll.jpg',
                benefit: 'Reduces shoulder stiffness and improves circulation'
            },
            {
                id: 'side-stretch',
                name: 'Side Stretch',
                baseTime: 45,
                steps: [
                    { instruction: 'Sit tall with your feet flat on the floor', time: 3 },
                    { instruction: 'Place your right hand on your right hip', time: 4 },
                    { instruction: 'Raise your left arm straight overhead', time: 3 },
                    { instruction: 'Gently lean to the right side', time: 2 },
                    { instruction: 'Hold for 10 seconds while breathing deeply', time: 10 },
                    { instruction: 'Return to center position slowly', time: 2 },
                    { instruction: 'Lower your left arm and place on your left hip', time: 4 },
                    { instruction: 'Raise your right arm overhead', time: 3 },
                    { instruction: 'Lean to the left side', time: 2 },
                    { instruction: 'Hold for 10 seconds', time: 10 },
                    { instruction: 'Return to center and relax', time: 2 }
                ],
                image: 'assets/stretches/side-stretch.jpg',
                benefit: 'Stretches side muscles and improves posture'
            },
            {
                id: 'wrist-flex',
                name: 'Wrist Flex',
                baseTime: 55,
                steps: [
                    { instruction: 'Extend your right arm straight forward', time: 3 },
                    { instruction: 'Palm facing down, use left hand to pull fingers back', time: 5 },
                    { instruction: 'Hold for 5 seconds', time: 5 },
                    { instruction: 'Release and turn your right palm facing up', time: 4 },
                    { instruction: 'Gently pull fingers downward', time: 3 },
                    { instruction: 'Hold for 5 seconds', time: 5 },
                    { instruction: 'Release and shake out your right hand', time: 3 },
                    { instruction: 'Now, extend your left arm straight forward', time: 3 },
                    { instruction: 'Palm facing down, use right hand to pull fingers back', time: 5 },
                    { instruction: 'Hold for 5 seconds', time: 5 },
                    { instruction: 'Release and turn your left palm facing up', time: 3 },
                    { instruction: 'Gently pull fingers downward', time: 3 },
                    { instruction: 'Hold for 5 seconds', time: 5 },
                    { instruction: 'Release and shake out your left hand', time: 3 },
                ],
                image: 'assets/stretches/wrist-flex.jpg',
                benefit: 'Prevents wrist strain from typing and mouse use'
            },
            {
                id: 'spinal-twist',
                name: 'Spinal Twist',
                baseTime: 50,
                steps: [
                    { instruction: 'Sit tall with both feet flat on the floor', time: 3 },
                    { instruction: 'Place your right hand on your left knee', time: 3 },
                    { instruction: 'Place your left hand on the chair back for support', time: 4 },
                    { instruction: 'Gently twist your upper body to the left', time: 3 },
                    { instruction: 'Hold for 10 seconds while breathing deeply', time: 10 },
                    { instruction: 'Return to center slowly', time: 2 },
                    { instruction: 'Now pause and prepare for opposite side', time: 3 },
                    { instruction: 'Place your left hand on your right knee', time: 3 },
                    { instruction: 'Place your right hand on the chair back for support', time: 4 },
                    { instruction: 'Gently twist your upper body to the right', time: 3 },
                    { instruction: 'Hold for 10 seconds while breathing deeply', time: 10 },
                    { instruction: 'Return to center slowly', time: 2 },
                ],
                image: 'assets/stretches/spinal-twist.jpg',
                benefit: 'Increases spinal mobility and relieves back tension'
            },
            {
                id: 'leg-extensions',
                name: 'Leg Extensions',
                baseTime: 35,
                steps: [
                    { instruction: 'Sit tall with your back against the chair', time: 4 },
                    { instruction: 'Extend your right leg straight out', time: 3 },
                    { instruction: 'Parallel to the floor, flex your foot', time: 3 },
                    { instruction: 'Hold for 5 seconds while squeezing thigh muscle', time: 5 },
                    { instruction: 'Slowly lower your leg back to the floor', time: 3 },
                    { instruction: 'Pause and prepare for left leg', time: 3 },
                    { instruction: 'Extend your left leg straight out', time: 3 },
                    { instruction: 'Parallel to the floor, flex your foot', time: 3 },
                    { instruction: 'Hold for 5 seconds while squeezing thigh muscle', time: 5 },
                    { instruction: 'Slowly lower your leg back to the floor', time: 3 },

                ],
                image: 'assets/stretches/leg-extensions.jpg',
                benefit: 'Improves leg circulation and prevents stiffness'
            }
        ];

        // Application state
        this.currentStretch = null;
        this.isRunning = false;
        this.isPaused = false;
        this.currentStep = 0;
        this.currentRep = 1;
        this.totalReps = 2;
        this.totalDuration = 0;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.stepInterval = null;
        this.completionBell = null;

        this.useVoice = false;
        this.voiceAudio = null;
        this.volume = 0.5; // Default volume 50%
        this.voiceFiles = {}; // Cache for loaded audio file paths
        this.stepStartTime = 0; // When the current step started
        this.currentStepDuration = 0; // Duration of current step in milliseconds
        this.voicePlayedForCurrentStep = false;

        // DOM Elements
        this.elements = {
            // Main containers
            stretchGrid: document.getElementById('stretchGrid'),
            stretchInterface: document.getElementById('stretchInterface'),
            exerciseInterface: document.getElementById('exerciseInterface'),

            // Instruction view
            stretchName: document.getElementById('stretchName'),
            stretchInstructions: document.getElementById('stretchInstructions'),
            stretchGif: document.getElementById('stretchGif'),

            // Session controls
            repSelect: document.getElementById('repSelect'),
            customReps: document.getElementById('customReps'),
            customRepsLabel: document.getElementById('customRepsLabel'),
            estimatedTime: document.getElementById('estimatedTime'),

            // Exercise view
            exerciseName: document.getElementById('exerciseName'),
            exerciseTimer: document.getElementById('exerciseTimer'),
            currentStep: document.getElementById('currentStep'),
            currentRep: document.getElementById('currentRep'),
            totalSteps: document.getElementById('totalSteps'),
            totalReps: document.getElementById('totalReps'),
            currentInstruction: document.getElementById('currentInstruction'),
            progressDots: document.getElementById('progressDots'),

            // Buttons
            startBtn: document.getElementById('startBtn'),
            backToStretches: document.getElementById('backToStretches'),
            exercisePauseBtn: document.getElementById('exercisePauseBtn'),
            exerciseEndBtn: document.getElementById('exerciseEndBtn'),

            completionView: document.getElementById('completionView'),
            completedExerciseName: document.getElementById('completedExerciseName'),
            completedReps: document.getElementById('completedReps'),
            completedTime: document.getElementById('completedTime'),
            backToAllBtn: document.getElementById('backToAllBtn'),
            customReps: document.getElementById('customReps')
        };

        this.init();
    }

    init() {
        this.renderStretchGrid();
        this.setupEventListeners();
        this.preloadCompletionBell();
        this.initializeVoiceControls();
    }

    initializeVoiceControls() {
        // This will be called when showing stretch interface
    }

    preloadCompletionBell() {
        this.completionBell = new Audio('assets/sounds/bell.mp3');
        this.completionBell.volume = 0.6;
        this.completionBell.preload = 'auto';
    }

    renderStretchGrid() {
        this.elements.stretchGrid.innerHTML = this.stretches.map(stretch => `
            <div class="stretch-card" data-stretch-id="${stretch.id}">
                <h3 class="stretch-grid-name">${stretch.name}</h3>
                <p class="stretch-benefit">${stretch.benefit}</p>
                <span class="stretch-meta">${stretch.baseTime}s per rep</span>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Stretch card selection
        this.elements.stretchGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.stretch-card');
            if (card) {
                const stretchId = card.dataset.stretchId;
                this.selectStretch(stretchId);
            }
        });

        this.elements.backToStretches.addEventListener('click', () => this.showStretchGrid());
        this.elements.startBtn.addEventListener('click', () => this.startExercise());
        this.elements.exercisePauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.exerciseEndBtn.addEventListener('click', () => this.endExercise());

        this.elements.backToAllBtn.addEventListener('click', () => this.showStretchGrid());

        // Rep selection
        this.elements.repSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            const showCustom = value === 'custom';

            this.elements.customReps.style.display = showCustom ? 'block' : 'none';
            this.elements.customRepsLabel.style.display = showCustom ? 'block' : 'none';

            this.updateEstimatedTime();
        });

        // Custom reps input
        this.elements.customReps.addEventListener('input', () => {
            this.updateEstimatedTime();
        });
    }

    setupVoiceControlListeners() {
        const voiceToggle = document.getElementById('voiceToggle');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        const volumeControl = document.getElementById('volumeControl');

        if (voiceToggle) {
            voiceToggle.addEventListener('change', (e) => {
                this.useVoice = e.target.checked;
                if (volumeControl) {
                    if (this.useVoice) {
                        volumeControl.classList.add('visible');
                    } else {
                        volumeControl.classList.remove('visible');
                    }
                }

                // If turning off voice while exercise is running, stop current voice
                if (!this.useVoice && this.isRunning) {
                    this.stopVoice();
                }
            });

            // Set initial state
            voiceToggle.checked = this.useVoice;
        }

        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = parseInt(e.target.value) / 100;
                volumeValue.textContent = `${e.target.value}%`;

                // Update current voice volume if playing
                if (this.voiceAudio) {
                    this.voiceAudio.volume = this.volume;
                }
            });

            // Set initial values
            volumeSlider.value = this.volume * 100;
            volumeValue.textContent = `${this.volume * 100}%`;
        }
    }

    selectStretch(stretchId) {
        this.currentStretch = this.stretches.find(s => s.id === stretchId);
        if (!this.currentStretch) return;

        this.showStretchInterface();
        this.updateEstimatedTime();
        this.prepareVoiceFiles();
    }

    prepareVoiceFiles() {
        if (!this.currentStretch) return;

        // Clear previous voice files
        this.voiceFiles = {};

        const volumeControl = document.getElementById('volumeControl');
        volumeControl.classList.remove('visible');

        // Generate voice file paths based on stretch ID and step numbers
        this.currentStretch.steps.forEach((step, index) => {
            // Convert stretch ID to filename format (e.g., "neck-tilt" -> "neck_tilt")
            const stretchName = this.currentStretch.id.replace(/-/g, '_');
            const fileName = `${stretchName}_instruction_${index + 1}.mp3`;
            this.voiceFiles[index] = `assets/stretches/${fileName}`;
        });
    }

    // Play voice for current step
    playCurrentStepVoice() {
        if (!this.useVoice || !this.isRunning || this.isPaused) return;

        // Get voice file for current step (within current rep)
        const stepIndex = this.currentStep;
        const voiceFile = this.voiceFiles[stepIndex];

        if (!voiceFile) return;

        // Stop any current voice
        this.stopVoice();

        // Play the voice
        this.playVoice(voiceFile);
    }

    // Play voice audio
    playVoice(audioPath) {
        if (!audioPath) return;

        this.voiceAudio = new Audio(audioPath);
        this.voiceAudio.volume = this.volume;

        // Handle playback errors silently
        const playPromise = this.voiceAudio.play();
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
    stopVoice() {
        if (this.voiceAudio) {
            this.voiceAudio.pause();
            this.voiceAudio.currentTime = 0;
            this.voiceAudio = null;
        }
    }

    showStretchInterface() {
        this.elements.stretchGrid.hidden = true;
        this.elements.stretchInterface.hidden = false;
        this.elements.exerciseInterface.hidden = true;

        // Update stretch details
        this.elements.stretchName.textContent = `Instructions For ${this.currentStretch.name}`;
        this.elements.stretchGif.src = this.currentStretch.image;
        this.elements.stretchGif.alt = this.currentStretch.name;

        // Convert steps to bullet points
        this.updateInstructions();

        // Add voice controls HTML
        this.addVoiceControls();

        // Scroll to interface
        setTimeout(() => {
            this.elements.stretchInterface.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }

    addVoiceControls() {
        this.setupVoiceControlListeners();
    }

    updateInstructions() {
        const instructionsList = this.elements.stretchInstructions;
        const steps = this.currentStretch.steps;

        instructionsList.innerHTML = steps.map((step, index) =>
            `<li><strong>Step ${index + 1}:</strong> ${step.instruction} (${step.time}s)</li>`
        ).join('');
    }

    updateEstimatedTime() {
        if (!this.currentStretch) return;

        const repValue = this.elements.repSelect.value;
        let reps = 2; // Default

        if (repValue === 'custom') {
            reps = parseInt(this.elements.customReps.value) || 1;
        } else {
            reps = parseInt(repValue);
        }

        this.totalReps = reps;
        this.totalDuration = this.currentStretch.baseTime * reps;

        this.elements.estimatedTime.textContent = `${this.totalDuration}s (${reps} rep${reps > 1 ? 's' : ''})`;
    }

    startExercise() {
        if (!this.currentStretch) return;

        // Reset state
        this.isRunning = true;
        this.isPaused = false;
        this.currentStep = 0;
        this.currentRep = 1;
        this.timeLeft = this.totalDuration;

        // Switch to exercise interface
        this.elements.stretchInterface.hidden = true;
        this.elements.exerciseInterface.hidden = false;

        // Update exercise display
        this.elements.exerciseName.textContent = this.currentStretch.name;
        this.elements.exerciseTimer.textContent = this.formatTime(this.totalDuration);

        // Initialize rep display
        this.updateRepDisplay();

        // Start the exercise
        this.nextStep();
        this.startTimer();

        // Scroll to exercise interface
        setTimeout(() => {
            this.elements.exerciseInterface.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }

    updateRepDisplay() {
        // Update rep counters in the display
        this.elements.currentRep.textContent = this.currentRep;
        this.elements.totalReps.textContent = this.totalReps;
    }

    nextStep() {
        if (!this.isRunning) return;

        const steps = this.currentStretch.steps;

        // Check if we've completed all steps for current rep
        if (this.currentStep >= steps.length) {
            // Move to next rep
            this.currentStep = 0;
            this.currentRep++;

            // Check if all reps are completed
            if (this.currentRep > this.totalReps) {
                this.completeExercise();
                return;
            }

            // Update rep display
            this.updateRepDisplay();
        }

        // Calculate current step info (within current rep)
        const stepIndex = this.currentStep;
        const currentStepData = steps[stepIndex];

        // Update display
        this.elements.currentStep.textContent = this.currentStep + 1;
        this.elements.totalSteps.textContent = steps.length;
        this.elements.currentInstruction.textContent = currentStepData.instruction;

        // Track step timing for pause/resume
        this.stepStartTime = Date.now();
        this.currentStepDuration = currentStepData.time * 1000;

        // Reset voice played flag for new step
        this.voicePlayedForCurrentStep = false;

        // Play voice for this step if enabled AND not already played
        if (this.useVoice && !this.voicePlayedForCurrentStep) {
            this.playCurrentStepVoice();
            this.voicePlayedForCurrentStep = true;
        }

        // Schedule next step
        clearTimeout(this.stepInterval);
        this.stepInterval = setTimeout(() => {
            this.currentStep++;
            this.nextStep();
        }, currentStepData.time * 1000);
    }

    startTimer() {
        clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.timeLeft--;
                this.elements.exerciseTimer.textContent = this.formatTime(this.timeLeft);

                if (this.timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.completeExercise();
                }
            }
        }, 1000);
    }

    togglePause() {
        if (!this.isRunning) return;

        this.isPaused = !this.isPaused;
        this.elements.exercisePauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';

        if (this.isPaused) {
            clearInterval(this.timerInterval);
            clearTimeout(this.stepInterval);
            this.stopVoice(); // Stop voice when paused

            // Calculate how much time has passed in current step
            if (this.stepStartTime > 0) {
                const elapsed = Date.now() - this.stepStartTime;
                this.currentStepDuration = Math.max(100, this.currentStepDuration - elapsed);
            }
        } else {
            this.startTimer();

            // Play voice only if not already played for this step
            if (this.useVoice && !this.voicePlayedForCurrentStep) {
                this.playCurrentStepVoice();
                this.voicePlayedForCurrentStep = true;
            }

            // Resume step timer with remaining time
            clearTimeout(this.stepInterval);
            this.stepStartTime = Date.now();
            this.stepInterval = setTimeout(() => {
                this.currentStep++;
                this.nextStep();
            }, this.currentStepDuration);
        }
    }

    endExercise() {
        this.stopExercise();
        this.showStretchInterface();
    }

    completeExercise() {
        this.stopExercise(); // This will stop voice

        // Hide exercise interface
        this.elements.exerciseInterface.hidden = true;

        // Show completion view
        this.elements.completionView.hidden = false;

        // Update completion view details
        this.elements.completedExerciseName.textContent = this.currentStretch.name;
        this.elements.completedReps.textContent = `${this.totalReps} rep${this.totalReps > 1 ? 's' : ''}`;
        this.elements.completedTime.textContent = `${this.totalDuration} seconds`;

        // Play completion bell (voice already stopped)
        if (this.completionBell) {
            this.completionBell.currentTime = 0;
            this.completionBell.play().catch(e => console.log('Bell failed:', e));
        }
    }

    stopExercise() {
        this.isRunning = false;
        this.isPaused = false;

        clearInterval(this.timerInterval);
        clearTimeout(this.stepInterval);
        this.stopVoice(); // Add this line
    }

    showStretchGrid() {
        this.stopExercise();
        this.elements.stretchInterface.hidden = true;
        this.elements.exerciseInterface.hidden = true;
        this.elements.completionView.hidden = true;
        this.elements.stretchGrid.hidden = false;

        // Reset voice settings
        this.useVoice = false;
        this.stopVoice();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    formatTime(seconds) {
        if (seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the application
let deskStretches;

document.addEventListener('DOMContentLoaded', () => {
    deskStretches = new DeskStretches();
});

// Real-time validation
customReps.addEventListener('input', function () {
    let value = parseInt(this.value) || 0;

    if (value < 0) {
        this.value = 1;
    } else if (value > 100) {
        this.value = 100;
    }
});

// Final validation on blur
customReps.addEventListener('blur', function () {
    if (!this.value || parseInt(this.value) < 1) {
        this.value = 1;
    }
});