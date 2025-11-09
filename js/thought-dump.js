// Thought Dump Journal Application
class ThoughtDump {
    constructor() {
        this.elements = {
            thoughtsInput: document.getElementById('thoughtsInput'),
            releaseBtn: document.getElementById('releaseBtn'),
            clearBtn: document.getElementById('clearBtn'),
            characterCount: document.getElementById('characterCount'),
            releaseOverlay: document.getElementById('releaseOverlay'),
            floatingText: document.getElementById('floatingText'),
            closeOverlay: document.getElementById('closeOverlay')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.restoreSession();
    }

    setupEventListeners() {
        // Input events
        this.elements.thoughtsInput.addEventListener('input', () => {
            this.handleInputChange();
        });

        // Button events
        this.elements.releaseBtn.addEventListener('click', () => {
            this.releaseThoughts();
        });

        this.elements.clearBtn.addEventListener('click', () => {
            this.clearThoughts();
        });

        this.elements.closeOverlay.addEventListener('click', () => {
            this.closeOverlay();
        });

        // Keyboard shortcuts
        this.elements.thoughtsInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.releaseThoughts();
            }
        });
    }

    handleInputChange() {
        const text = this.elements.thoughtsInput.value;
        const charCount = text.length;

        // Update character count (no limit)
        this.elements.characterCount.textContent = `${charCount}`;

        // Enable/disable release button
        this.elements.releaseBtn.disabled = charCount === 0;

        // Save to session storage
        this.saveToSession(text);

        // Visual feedback based on content length
        this.updateVisualFeedback(charCount);
    }

    updateVisualFeedback(charCount) {
        const input = this.elements.thoughtsInput;

        if (charCount === 0) {
            input.style.borderColor = '#e2e8f0';
            input.style.background = '#fafafa';
        } else if (charCount < 100) {
            input.style.borderColor = '#a0aec0';
            input.style.background = '#f7fafc';
        } else if (charCount < 500) {
            input.style.borderColor = '#667eea';
            input.style.background = '#ffffff';
        } else {
            // For longer writings - encouraging color
            input.style.borderColor = '#48bb78';
            input.style.background = '#f0fff4';
        }
    }

    releaseThoughts() {
        const text = this.elements.thoughtsInput.value;

        if (!text.trim()) return;

        // Start release animation
        this.startReleaseAnimation(text);

        // Clear the input
        this.clearThoughts();

        // Clear session storage
        this.clearSession();
    }

    startReleaseAnimation(text) {
        // Set paper content (first 100 chars)
        const previewText = text.length > 100 ? text.substring(0, 100) + '...' : text;
        document.getElementById('paperContent').textContent = `"${previewText}"`;

        // Show overlay
        this.elements.releaseOverlay.classList.remove('hidden');

        // Start burning animation
        this.startBurningAnimation();
    }

    startBurningAnimation() {
    const paper = document.getElementById('burningPaper');
    const embersContainer = document.getElementById('embersContainer');
    const completionMessage = document.querySelector('.completion-message');
    
    // Reset completion message opacity
    completionMessage.style.opacity = '0';
    
    // Step 1: Paper starts to burn after a brief pause
    setTimeout(() => {
        paper.style.animation = 'burnPaper 3s ease-in forwards, glow 1s ease-in-out infinite';
        
        // Create embers
        this.createEmbers(embersContainer);
        
    }, 1000);
    
    // Step 2: Show completion message AFTER burn animation completes (3 seconds + buffer)
    setTimeout(() => {
        completionMessage.style.opacity = '1';
    }, 4500); // Increased from 4000 to 4500 to ensure burn completes
}

    createEmbers(container) {
        const emberCount = 15;

        for (let i = 0; i < emberCount; i++) {
            setTimeout(() => {
                const ember = document.createElement('div');
                ember.className = 'ember';

                // Random position around paper
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 50;
                const startX = 150 + Math.cos(angle) * distance;
                const startY = 100 + Math.sin(angle) * distance;

                ember.style.cssText = `
                left: ${startX}px;
                top: ${startY}px;
                animation: floatEmber ${2 + Math.random() * 2}s ease-out forwards;
                animation-delay: ${Math.random() * 1}s;
            `;

                container.appendChild(ember);

                // Remove ember after animation
                setTimeout(() => ember.remove(), 4000);
            }, i * 200);
        }
    }

    closeOverlay() {
        this.elements.releaseOverlay.classList.add('hidden');

        // Clear all particles
        const particles = document.querySelectorAll('.floating-particle');
        particles.forEach(particle => particle.remove());
    }

    clearThoughts() {
        this.elements.thoughtsInput.value = '';
        this.elements.thoughtsInput.focus();
        this.handleInputChange();

        // Add visual feedback
        this.showClearFeedback();
    }

    showClearFeedback() {
        const input = this.elements.thoughtsInput;
        input.style.transition = 'all 0.5s ease';
        input.style.background = '#f0fff4';
        input.style.borderColor = '#48bb78';

        setTimeout(() => {
            input.style.background = '#fafafa';
            input.style.borderColor = '#e2e8f0';
        }, 1000);
    }

    saveToSession(text) {
        sessionStorage.setItem('thoughtDump_content', text);
    }

    restoreSession() {
        const saved = sessionStorage.getItem('thoughtDump_content');
        if (saved) {
            this.elements.thoughtsInput.value = saved;
            this.handleInputChange();
        }
    }

    clearSession() {
        sessionStorage.removeItem('thoughtDump_content');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThoughtDump();
});