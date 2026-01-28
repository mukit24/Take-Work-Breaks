// Gratitude Categories Data
const gratitudeCategories = {
    workWins: {
        icon: "🏆",
        title: "Professional Milestones",
        description: "Work achievements and career progress",
        meta: "5 questions • Work-focused",
        questions: [
            "What work accomplishment are you most proud of this month?",
            "What positive feedback or recognition have you received?",
            "What project did you complete successfully?",
            "What professional goal did you reach recently?",
            "What work challenge did you overcome with skill?"
        ]
    },
    team: {
        icon: "👥",
        title: "Team & Colleagues",
        description: "Workplace relationships and support systems",
        meta: "5 questions • People-focused",
        questions: [
            "Which coworker made your day better recently?",
            "What teamwork moment was particularly effective?",
            "Who provided valuable mentorship or guidance?",
            "What positive team culture moment stood out?",
            "How did a colleague help you solve a difficult problem?"
        ]
    },
    workTools: {
        icon: "🖥️",
        title: "Work Tools & Environment",
        description: "Resources that enable your best work",
        meta: "5 questions • Resource-focused",
        questions: [
            "What software or tool saves you significant time daily?",
            "What about your workspace makes you feel productive?",
            "What company benefit are you especially grateful for?",
            "What work-related resource helped you recently?",
            "What aspect of your work setup reduces stress?"
        ]
    },
    skillGrowth: {
        icon: "📚",
        title: "Skill Development",
        description: "Learning and growth at work",
        meta: "5 questions • Growth-focused",
        questions: [
            "What new work skill have you developed recently?",
            "What training or learning opportunity helped you grow?",
            "What mistake became a valuable lesson?",
            "What feedback significantly improved your work?",
            "What complex task expanded your capabilities?"
        ]
    },
    familyRelationships: {
        icon: "❤️",
        title: "Family & Relationships",
        description: "Personal connections outside work",
        meta: "5 questions • Personal-focused",
        questions: [
            "Which family member supported you recently?",
            "What friend made a positive difference in your life?",
            "What meaningful conversation did you have?",
            "What relationship brings you consistent joy?",
            "Who showed you unexpected kindness?"
        ]
    },
    healthWellness: {
        icon: "🌿",
        title: "Health & Wellness",
        description: "Physical and mental well-being",
        meta: "5 questions • Self-care focused",
        questions: [
            "What about your health are you grateful for today?",
            "What self-care practice helped you recently?",
            "What physical ability do you appreciate?",
            "What healthy habit are you maintaining?",
            "What brought you peace or calm recently?"
        ]
    },
    simplePleasures: {
        icon: "☕",
        title: "Simple Pleasures",
        description: "Everyday joys and small comforts",
        meta: "5 questions • Mindfulness focused",
        questions: [
            "What small moment brought you happiness today?",
            "What comfort (food, drink, cozy spot) are you thankful for?",
            "What made you smile or laugh recently?",
            "What beauty did you notice in your day?",
            "What sensory pleasure delighted you?"
        ]
    },
    homeCommunity: {
        icon: "🏡",
        title: "Home & Community",
        description: "Your living environment and local support",
        meta: "5 questions • Environment focused",
        questions: [
            "What about your home brings you comfort?",
            "What community resource do you appreciate?",
            "What neighborhood convenience makes life easier?",
            "What local business or service are you thankful for?",
            "What aspect of your living space supports your well-being?"
        ]
    },
    personalGrowth: {
        icon: "🌱",
        title: "Personal Growth",
        description: "Development outside professional life",
        meta: "5 questions • Reflection focused",
        questions: [
            "What personal insight have you gained recently?",
            "What hobby or interest enriches your life?",
            "What personal boundary are you maintaining well?",
            "What life lesson are you grateful to have learned?",
            "What personal value are you living authentically?"
        ]
    }
};

// App State
let currentCategory = null;
let currentQuestionIndex = 0;
let answers = {};
let totalQuestions = 0;

// DOM Elements
const elements = {
    categoryGrid: document.getElementById('categoryGrid'),
    categorySelector: document.getElementById('categorySelector'),
    questionInterface: document.getElementById('questionInterface'),
    reviewInterface: document.getElementById('reviewInterface'),
    categoryName: document.getElementById('categoryName'),
    progressText: document.getElementById('progressText'),
    currentQuestion: document.getElementById('currentQuestion'),
    answerInput: document.getElementById('answerInput'),
    charCount: document.getElementById('charCount'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    skipBtn: document.getElementById('skipBtn'),
    exportBtn: document.getElementById('exportBtn'),
    backToCategories: document.getElementById('backToCategories'),
    answersContainer: document.getElementById('answersContainer'),
    reviewCategory: document.getElementById('reviewCategory'),
    reviewDate: document.getElementById('reviewDate'),
    downloadPdfBtn: document.getElementById('downloadPdfBtn'),
    copyTextBtn: document.getElementById('copyTextBtn'),
    saveImageBtn: document.getElementById('saveImageBtn'),
    newSessionBtn: document.getElementById('newSessionBtn'),
};

// Initialize the app
function init() {
    renderCategoryGrid();
    setupEventListeners();
}

// Render category selection grid
function renderCategoryGrid() {
    elements.categoryGrid.innerHTML = Object.entries(gratitudeCategories).map(([key, category]) => `
        <div class="category-card" data-category="${key}">
            <div class="category-icon">${category.icon}</div>
            <h3 class="category-title">${category.title}</h3>
            <p class="category-desc">${category.description}</p>
            <div class="category-meta">${category.meta}</div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Category selection
    elements.categoryGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.category-card');
        if (card) {
            const category = card.dataset.category;
            selectCategory(category);
        }
    });

    // Navigation buttons
    elements.prevBtn.addEventListener('click', showPreviousQuestion);
    elements.nextBtn.addEventListener('click', showNextQuestion);
    elements.skipBtn.addEventListener('click', skipCurrentQuestion);

    // Export button
    elements.exportBtn.addEventListener('click', showReviewInterface);

    // Back buttons
    elements.backToCategories.addEventListener('click', showCategorySelector);

    // Textarea input
    elements.answerInput.addEventListener('input', handleAnswerInput);

    // Export options
    elements.downloadPdfBtn.addEventListener('click', downloadPdf);
    elements.copyTextBtn.addEventListener('click', copyText);
    elements.saveImageBtn.addEventListener('click', saveAsImage);
    elements.newSessionBtn.addEventListener('click', startNewSession);
}

// Select a category
function selectCategory(categoryKey) {
    currentCategory = categoryKey;
    const category = gratitudeCategories[categoryKey];

    // Initialize answers object
    answers = {};
    category.questions.forEach((_, index) => {
        answers[index] = '';
    });

    currentQuestionIndex = 0;
    totalQuestions = category.questions.length;

    // Update UI
    elements.categoryName.textContent = category.title;
    showQuestionInterface();
    updateQuestionDisplay();

    // Scroll to top of question interface
    setTimeout(() => {
        elements.questionInterface.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// Show question interface
function showQuestionInterface() {
    elements.categorySelector.hidden = true;
    elements.questionInterface.hidden = false;
    elements.reviewInterface.hidden = true;
}

// Show category selector
function showCategorySelector() {
    elements.categorySelector.hidden = false;
    elements.questionInterface.hidden = true;
    elements.reviewInterface.hidden = true;
    currentCategory = null;
}

// Show review interface
function showReviewInterface() {
    elements.categorySelector.hidden = true;
    elements.questionInterface.hidden = true;
    elements.reviewInterface.hidden = false;

    renderAnswersReview();
    updateReviewMetadata();

    // Scroll to top of review interface
    setTimeout(() => {
        elements.reviewInterface.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 100);
}

// Update question display
function updateQuestionDisplay() {
    const category = gratitudeCategories[currentCategory];
    const currentQuestion = category.questions[currentQuestionIndex];

    // Update progress
    elements.progressText.textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;

    // Update question text
    elements.currentQuestion.textContent = currentQuestion;

    // Update textarea with existing answer
    elements.answerInput.value = answers[currentQuestionIndex] || '';

    // Update character count
    updateCharacterCount();

    // Update button states
    elements.prevBtn.disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === totalQuestions - 1) {
        elements.nextBtn.textContent = 'Finish →';
        elements.nextBtn.classList.add('finish');
    } else {
        elements.nextBtn.textContent = 'Next Question →';
        elements.nextBtn.classList.remove('finish');
    }

    // Update export button
    updateExportButton();
}

// Handle answer input
function handleAnswerInput() {
    const answer = elements.answerInput.value.trim();
    answers[currentQuestionIndex] = answer;
    updateCharacterCount();
    updateExportButton();
}

// Update character count display
function updateCharacterCount() {
    const length = elements.answerInput.value.length;
    elements.charCount.textContent = `${length}/500 characters`;

    if (length > 450) {
        elements.charCount.style.color = '#e53e3e';
    } else if (length > 300) {
        elements.charCount.style.color = '#d69e2e';
    } else {
        elements.charCount.style.color = '#718096';
    }
}

// Skip current question
function skipCurrentQuestion() {
    answers[currentQuestionIndex] = '[Skipped]';
    showNextQuestion();
}

// Show previous question
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        updateQuestionDisplay();
    }
}

// Show next question
function showNextQuestion() {
    // Save current answer
    answers[currentQuestionIndex] = elements.answerInput.value.trim() || '[Skipped]';
    
    if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex++;
        updateQuestionDisplay();
    } else {
        // Last question - always allow review
        showReviewInterface();
    }
}

// Check if all questions are answered
function areAllQuestionsAnswered() {
    return true;
}

// Update export button state
function updateExportButton() {
    // Always enable the export button
    elements.exportBtn.disabled = false;
    
    // Show progress but don't disable
    const answeredCount = Object.values(answers).filter(a => a && a !== '[Skipped]' && a.trim().length > 0).length;
    
    if (answeredCount === totalQuestions) {
        elements.exportBtn.innerHTML = '<span class="btn-icon">📄</span> Review & Export Complete Journal';
        elements.exportBtn.classList.add('ready');
    } else if (answeredCount === 0) {
        elements.exportBtn.innerHTML = '<span class="btn-icon">📝</span> Review & Export Journal';
        elements.exportBtn.classList.remove('ready');
    } else {
        elements.exportBtn.innerHTML = `<span class="btn-icon">📝</span> Review & Export (${answeredCount}/${totalQuestions} answered)`;
        elements.exportBtn.classList.remove('ready');
    }
}

// Render answers in review interface
function renderAnswersReview() {
    const category = gratitudeCategories[currentCategory];

    elements.answersContainer.innerHTML = category.questions.map((question, index) => {
        const answer = answers[index] || '[Not answered]';
        return `
            <div class="answer-review">
                <h4>${index + 1}. ${question}</h4>
                <div class="answer-content">${answer}</div>
            </div>
        `;
    }).join('');
}

// Update review metadata
function updateReviewMetadata() {
    const category = gratitudeCategories[currentCategory];
    elements.reviewCategory.textContent = `Category: ${category.title}`;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    elements.reviewDate.textContent = `Date: ${dateStr}`;
}

// Start new session
function startNewSession() {
    showCategorySelector();
}

// Show toast notification
function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- PDF Export Functions ---

async function downloadPdf() {
    showToast("Generating PDF...");

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set document properties
        doc.setProperties({
            title: 'Gratitude Journal - Take Work Breaks',
            subject: 'Gratitude Practice',
            author: 'Take Work Breaks'
        });

        // Add header
        doc.setFontSize(20);
        doc.setTextColor(90, 103, 216);
        doc.text('Gratitude Journal', 105, 20, { align: 'center' });

        // Add category and date
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Category: ${gratitudeCategories[currentCategory].title}`, 20, 35);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);

        // Add content
        let yPosition = 60;
        const category = gratitudeCategories[currentCategory];

        doc.setFontSize(14);
        doc.setTextColor(45, 55, 72);

        category.questions.forEach((question, index) => {
            const answer = answers[index] || '[Not answered]';

            // Add question
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}. ${question}`, 20, yPosition);
            yPosition += 10;

            // Add answer
            doc.setFont(undefined, 'normal');
            const answerLines = doc.splitTextToSize(`Answer: ${answer}`, 170);
            doc.text(answerLines, 25, yPosition);
            yPosition += (answerLines.length * 7) + 15;

            // Add page break if needed
            if (yPosition > 270 && index < category.questions.length - 1) {
                doc.addPage();
                yPosition = 20;
            }
        });

        // Add footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Created with Take Work Breaks - takeworkbreaks.com', 105, 285, { align: 'center' });

        // Save PDF
        doc.save(`gratitude-journal-${new Date().toISOString().slice(0, 10)}.pdf`);
        showToast("PDF downloaded successfully!");

    } catch (error) {
        console.error('PDF generation failed:', error);
        showToast("Failed to generate PDF. Please try again.");
    }
}

// Copy text to clipboard
async function copyText() {
    const category = gratitudeCategories[currentCategory];
    let text = `GRATITUDE JOURNAL\n`;
    text += `Category: ${category.title}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;

    category.questions.forEach((question, index) => {
        const answer = answers[index] || '[Not answered]';
        text += `${index + 1}. ${question}\n`;
        text += `   Answer: ${answer}\n\n`;
    });

    text += `\n---\nCreated with Take Work Breaks (takeworkbreaks.com)`;

    try {
        await navigator.clipboard.writeText(text);
        showToast("Text copied to clipboard!");
    } catch (error) {
        console.error('Copy failed:', error);
        showToast("Failed to copy text. Please try again.");
    }
}

// Save as image
async function saveAsImage() {
    showToast("Generating image...");

    try {
        const content = document.getElementById('answersContainer');

        const canvas = await html2canvas(content, {
            scale: 2,
            backgroundColor: '#f8fafc',
            logging: false
        });

        // Convert canvas to image
        const image = canvas.toDataURL('image/png');

        // Create download link
        const link = document.createElement('a');
        link.href = image;
        link.download = `gratitude-journal-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Image saved successfully!");

    } catch (error) {
        console.error('Image generation failed:', error);
        showToast("Failed to generate image. Please try again.");
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add CSS for finish button
const style = document.createElement('style');
style.textContent = `
    .btn.finish {
        background: linear-gradient(135deg, #48bb78, #38a169);
    }
    .btn.finish:hover {
        background: linear-gradient(135deg, #38a169, #2f855a);
    }
    .btn.export.ready {
        animation: pulse 2s infinite;
    }
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);