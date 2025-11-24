// Desk Stretches Application
class DeskStretches {
    constructor() {
        this.stretches = [
            {
                id: 'neck-tilt',
                name: 'Neck Tilt',
                duration: 30,
                instructions: 'Slowly tilt your head to the left, bringing ear toward shoulder. Hold for 5 seconds. Return to center. Repeat on the right side. Keep shoulders relaxed throughout.',
                image: 'assets/stretches/neck-tilt.jpg',
                benefit: 'Relieves neck tension and improves flexibility'
            },
            {
                id: 'shoulder-roll',
                name: 'Shoulder Roll',
                duration: 30,
                instructions: 'Slowly roll your shoulders up toward your ears. Move them back in a circular motion. Then roll them down and forward. Complete 5 rotations forward. Reverse direction and complete 5 rotations backward. Keep your arms relaxed throughout the movement.',
                image: 'assets/stretches/shoulder-roll.jpg',
                benefit: 'Reduces shoulder stiffness and improves circulation'
            },
            {
                id: 'side-stretch',
                name: 'Side Stretch',
                duration: 30,
                instructions: 'Sit tall with your feet flat on the floor. Raise your right arm straight overhead. Gently lean to the left side until you feel a stretch. Hold for 10 seconds. Return to center and lower your arm. Repeat on the opposite side with left arm overhead leaning right. Keep your hips firmly planted in the chair.',
                image: 'assets/stretches/side-stretch.jpg',
                benefit: 'Stretches side muscles and improves posture'
            },
            {
                id: 'wrist-flex',
                name: 'Wrist Flex',
                duration: 30,
                instructions: 'Extend your right arm straight forward with palm facing down. Use your left hand to gently pull the fingers back toward your body. Hold for 10 seconds until you feel a stretch in your forearm. Release and turn palm facing up. Gently pull fingers downward and Hold for 10 seconds. Repeat with the left arm.',
                image: 'assets/stretches/wrist-flex.jpg',
                benefit: 'Prevents wrist strain from typing and mouse use'
            },
            {
                id: 'spinal-twist',
                name: 'Spinal Twist',
                duration: 30,
                instructions: 'Sit tall with both feet flat on the floor. Place your right hand on your left knee. Gently twist your upper body to the left. Use your left hand on the chair back for support. Hold for 15 seconds while breathing deeply. Return to center slowly. Repeat on the opposite side twisting to the right.',
                image: 'assets/stretches/spinal-twist.jpg',
                benefit: 'Increases spinal mobility and relieves back tension'
            },
            {
                id: 'leg-extensions',
                name: 'Leg Extensions',
                duration: 30,
                instructions: 'Sit tall with your back against the chair. Extend your right leg straight out until it is parallel to the floor. Flex your foot and point your toes toward the ceiling. Hold for 5 seconds while squeezing your thigh muscle. Slowly lower your leg back to the floor. Alternate and repeat with your left leg. Complete 5 extensions per leg.',
                image: 'assets/stretches/leg-extensions.jpg',
                benefit: 'Improves leg circulation and prevents stiffness'
            }
        ];

        this.currentStretch = null;
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 0; // Changed from timeLeft to currentTime
        this.timerInterval = null;

        this.elements = {
            stretchGrid: document.getElementById('stretchGrid'),
            stretchInterface: document.getElementById('stretchInterface'),
            stretchName: document.getElementById('stretchName'),
            stretchInstructions: document.getElementById('stretchInstructions'),
            stretchGif: document.getElementById('stretchGif'),
            stretchTimer: document.getElementById('stretchTimer'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            backToStretches: document.getElementById('backToStretches'),
            endExercise: document.getElementById('endExercise')
        };

        this.init();
    }

    init() {
        this.renderStretchGrid();
        this.setupEventListeners();
    }

    renderStretchGrid() {
        this.elements.stretchGrid.innerHTML = this.stretches.map(stretch => `
            <div class="stretch-card" data-stretch-id="${stretch.id}">
                <h3 class="stretch-grid-name">${stretch.name}</h3>
                <p class="stretch-benefit">${stretch.benefit}</p>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Control buttons
        this.elements.startBtn.addEventListener('click', () => this.startStretch());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.resetBtn.addEventListener('click', () => this.resetStretch());

        // Navigation buttons
        this.elements.backToStretches.addEventListener('click', () => this.showStretchGrid());
        this.elements.endExercise.addEventListener('click', () => this.endExercise());

        // Stretch card clicks
        this.elements.stretchGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.stretch-card');
            if (card) {
                const stretchId = card.dataset.stretchId;
                this.selectStretch(stretchId);
            }
        });
    }

    selectStretch(stretchId) {
        this.currentStretch = this.stretches.find(s => s.id === stretchId);
        if (!this.currentStretch) return;

        this.showStretchInterface();
        this.resetStretch();
    }

    showStretchInterface() {
        this.elements.stretchGrid.hidden = true;
        this.elements.stretchInterface.hidden = false;

        // Update stretch details
        this.elements.stretchName.textContent = `Instructions For ${this.currentStretch.name}`;
        this.elements.stretchGif.src = this.currentStretch.image; // Changed from gif to image
        this.elements.stretchGif.alt = this.currentStretch.name;

        // Convert instructions to bullet points
        this.updateInstructions(this.currentStretch.instructions);

        // Scroll to interface
        setTimeout(() => {
            this.elements.stretchInterface.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }

    // New method to convert instructions to bullet points
    updateInstructions(instructions) {
        const instructionsList = document.getElementById('stretchInstructions');

        // Split instructions by periods and create bullet points
        const points = instructions.split('.')
            .filter(point => point.trim().length > 0)
            .map(point => point.trim() + '.');

        instructionsList.innerHTML = points.map(point =>
            `<li>${point}</li>`
        ).join('');
    }

    showStretchGrid() {
        this.stopStretch();
        this.elements.stretchInterface.hidden = true;
        this.elements.stretchGrid.hidden = false;

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    startStretch() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;
        this.currentTime = 0; // Start from 0

        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;

        this.updateTimerDisplay();
        this.startTimer();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.elements.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';

        if (this.isPaused) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    resetStretch() {
        this.stopStretch();
        this.currentTime = 0; // Reset to 0
        this.updateTimerDisplay();

        this.elements.stretchTimer.classList.remove('warning', 'completed');
    }

    stopStretch() {
        this.isRunning = false;
        this.isPaused = false;

        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.pauseBtn.textContent = 'Pause';

        this.stopTimer();
    }

    startTimer() {
        this.stopTimer(); // Clear any existing timer

        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.currentTime++; // Increment time instead of decrementing
                this.updateTimerDisplay();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        this.elements.stretchTimer.textContent = this.currentTime;

        // Remove the warning/completed logic since we're counting up
        // You can add different visual states based on time if needed
        this.elements.stretchTimer.classList.remove('warning', 'completed');

        // Optional: Add visual feedback for longer durations
        if (this.currentTime >= 30) {
            this.elements.stretchTimer.classList.add('completed');
        } else if (this.currentTime >= 20) {
            this.elements.stretchTimer.classList.add('warning');
        }
    }

    // Removed completeStretch method since we don't need it for stopwatch
    endExercise() {
        this.stopStretch();
        this.showStretchGrid();
    }
}

// Initialize the application
let deskStretches;

document.addEventListener('DOMContentLoaded', () => {
    deskStretches = new DeskStretches();
});