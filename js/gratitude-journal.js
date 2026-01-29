// Gratitude Categories Data
const gratitudeCategories = {
    workWins: {
        icon: "🏆",
        title: "Professional Milestones",
        description: "Work achievements and career progress",
        meta: "7 questions • Work-focused",
        questions: [
            "What is one small 'micro-win' you had today that moved a project forward?",
            "What task did you handle with more ease or confidence today than you did a month ago?",
            "Who is a colleague you were grateful to work with or learn from today?",
            "What feedback (even small) made you feel valued or seen recently?",
            "What problem did you solve today, no matter how small, that made your workflow smoother?",
            "What is one thing you learned today that will help you in your career?",
            "How did you demonstrate resilience or a positive attitude during a difficult work moment?"
        ]
    },
    team: {
        icon: "👥",
        title: "Team & Colleagues",
        description: "Workplace relationships and support systems",
        meta: "6 questions • People-focused",
        questions: [
            "Who is a colleague that made you smile or laugh during a busy moment today?",
            "What is one small way a teammate made your job easier or saved you time today?",
            "Which coworker did you see doing something impressive or helpful for the team?",
            "Whose unique perspective or specific skill did you appreciate in a discussion today?",
            "Did anyone offer you a word of encouragement or a simple 'thank you' that felt good?",
            "Who is someone you feel safe asking for help from when you're feeling overwhelmed?"
        ]
    },
    workTools: {
        icon: "🖥️",
        title: "Work Tools & Environment",
        description: "Resources that enable your best work",
        meta: "6 questions • Resource-focused",
        questions: [
            "What piece of technology or software worked flawlessly today and made your tasks smoother?",
            "What is one item in your workspace (a plant, a photo, or a specific object) that brings you a sense of calm when you look at it?",
            "What part of your physical setup—like your chair, lighting, or desk height—are you most grateful for today?",
            "What aspect of your work environment (like a quiet room, a window view, or flexible hours) helped you focus best today?",
            "What organizational tool or resource helped you feel more in control and less overwhelmed today?",
            "What 'small luxury' in your workday (like high-quality headphones, a favorite pen, or fast Wi-Fi) do you appreciate right now?"
        ]
    },
    skillGrowth: {
        icon: "📚",
        title: "Skill Development",
        description: "Learning and growth at work",
        meta: "6 questions • Growth-focused",
        questions: [
            "What is one small thing you learned today—even a tiny shortcut or a new term—that you didn't know yesterday?",
            "What is a skill you’ve been practicing that is finally starting to feel more natural or easier for you?",
            "How did a recent challenge or mistake provide you with a valuable lesson that will help you grow?",
            "What feedback or advice have you received that helped you see your work from a better perspective?",
            "What specific strength of yours (like patience, logic, or creativity) are you proud of using today?",
            "What learning resource, mentor, or piece of documentation are you grateful for right now?"
        ]
    },
    familyRelationships: {
        icon: "❤️",
        title: "Family & Relationships",
        description: "Personal connections outside work",
        meta: "6 questions • Personal-focused",
        questions: [
            "Who is someone you are looking forward to seeing or talking to once your workday is over today?",
            "What is a small, kind gesture from a loved one—like a text, a smile, or a shared meal—that made you feel cared for recently?",
            "Who has shown you extra patience or understanding lately while you’ve been busy or focused on your work?",
            "What is a funny or happy memory with a friend or family member that still makes you smile when it crosses your mind?",
            "Who is the first person you thought of today when you needed a moment of comfort or a quick laugh?",
            "What is one thing about your home life or a specific relationship that provides a 'safe harbor' from the stresses of work?"
        ]
    },
    healthWellness: {
        icon: "🌿",
        title: "Health & Wellness",
        description: "Physical and mental well-being",
        meta: "6 questions • Self-care focused",
        questions: [
            "What is one thing your body did for you today—like breathing effortlessly or staying focused—that you are grateful for?",
            "What small, healthy choice did you make today (like drinking water, stretching, or choosing a nourishing snack) that your body is thanking you for?",
            "What physical sensation are you enjoying right now, such as the feeling of a deep breath, a warm drink, or a moment of stillness?",
            "What healthy boundary did you set today—like stepping away from your screen or protecting your lunch hour—to preserve your energy?",
            "What sign of progress have you noticed in your physical or mental well-being lately, no matter how small?",
            "What 'micro-moment' of self-care (like a 1-minute meditation or a quick walk) are you most proud of prioritizing today?"
        ]
    },
    simplePleasures: {
        icon: "☕",
        title: "Simple Pleasures",
        description: "Everyday joys and small comforts",
        meta: "5 questions • Mindfulness focused",
        questions: [
            "What small, ordinary moment—like the first sip of a warm drink or a ray of sunlight—brought you unexpected joy today?",
            "What simple physical comfort, such as a favorite song or a comfortable chair, are you most grateful for right now?",
            "What is one beautiful or interesting detail in your surroundings that you noticed for the first time today?",
            "What was a brief 'micromoment' of peace or quiet that you truly appreciated during your busy day?",
            "What made you smile, laugh, or feel a sense of lightness in the middle of your work tasks?"
        ]
    },
    homeCommunity: {
        icon: "🏡",
        title: "Home & Community",
        description: "Your living environment and local support",
        meta: "5 questions • Environment focused",
        questions: [
            "What is your favorite 'nook' or spot in your home that immediately helps you relax after a long day?",
            "What is one thing about your neighborhood—like a nearby park, a quiet street, or a nice view—that you are grateful for?",
            "Which local business or person in your community (like a favorite barista, librarian, or neighbor) makes you feel welcome?",
            "What 'home comfort'—like a soft blanket, the smell of coffee, or a clean kitchen—did you most appreciate today?",
            "What is a convenience in your local area that saves you time or makes your daily routine feel less stressful?"
        ]
    },
    personalGrowth: {
        icon: "🌱",
        title: "Personal Growth",
        description: "Development outside professional life",
        meta: "7 questions • Reflection focused",
        questions: [
            "What is a personal strength you’ve noticed in yourself recently, like patience, curiosity, or resilience?",
            "What is one hobby or creative outlet—completely unrelated to work—that made you feel energized this week?",
            "How have you honored a personal boundary lately that protected your time, energy, or peace of mind?",
            "What is an 'aha!' moment or a new perspective you've gained recently that has changed how you see things?",
            "What is one thing you’ve forgiven yourself for recently, allowing you to move forward with a lighter heart?",
            "In what way did you act in true alignment with your personal values today, even in a small situation?",
            "What is a skill or habit you are developing for yourself (not for your resume) that brings you a sense of pride?"
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

        // Page setup
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let y = 30;

        // Title
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(90, 103, 216);
        doc.text('Gratitude Journal', pageWidth / 2, 20, { align: 'center' });

        // Metadata
        const category = gratitudeCategories[currentCategory];
        const now = new Date();

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(74, 85, 104);

        doc.text(`Category: ${category.title}`, margin, y);
        doc.text(`Date: ${now.toLocaleDateString()}`, margin, y + 7);
        y += 25;

        // Text wrapping helper using jsPDF's built-in method
        const wrapText = (text, width) => {
            return doc.splitTextToSize(text, width);
        };

        // Add content
        doc.setFontSize(12);

        category.questions.forEach((question, index) => {
            // Check page break
            if (y > 250) {
                doc.addPage();
                y = 30;
            }

            // Question
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(102, 126, 234);
            const questionLines = wrapText(`${index + 1}. ${question}`, contentWidth);

            questionLines.forEach(line => {
                if (y > 270) {
                    doc.addPage();
                    y = 30;
                }
                doc.text(line, margin, y);
                y += 7;
            });

            y += 5;

            // Answer
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(45, 55, 72);
            const answer = answers[index] || '[Skipped]';
            const answerLines = wrapText(`Answer: ${answer}`, contentWidth - 5);

            answerLines.forEach(line => {
                if (y > 270) {
                    doc.addPage();
                    y = 30;
                }
                doc.text(line, margin + 5, y);
                y += 6;
            });

            y += 12;
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(160, 174, 192);
            doc.text(
                `Page ${i} of ${pageCount} • takeworkbreaks.com`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Save
        const fileName = `gratitude-${category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.pdf`;
        doc.save(fileName);

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

// Save as image (with header)
async function saveAsImage() {
    showToast("Generating image...");

    try {
        // Create a temporary container for the image
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: fixed;
            top: -10000px;
            left: -10000px;
            width: 800px;
            background: #f8fafc;
            padding: 2rem;
            border-radius: 20px;
            z-index: 10000;
        `;

        // Add header
        const header = document.createElement('div');
        header.style.cssText = `
            text-align: center;
            margin-bottom: 2.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid #e2e8f0;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Gratitude Journal';
        title.style.cssText = `
            color: #2d3748;
            font-size: 2rem;
            margin-bottom: 0.5rem;
            font-family: sans-serif;
        `;

        const metaContainer = document.createElement('div');
        metaContainer.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 2rem;
            color: #718096;
            font-weight: 500;
            font-family: sans-serif;
        `;

        const categorySpan = document.createElement('span');
        categorySpan.id = 'tempCategory';
        categorySpan.textContent = `Category: ${gratitudeCategories[currentCategory].title}`;

        const dateSpan = document.createElement('span');
        dateSpan.id = 'tempDate';
        const now = new Date();
        dateSpan.textContent = `Date: ${now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`;

        metaContainer.appendChild(categorySpan);
        metaContainer.appendChild(dateSpan);

        header.appendChild(title);
        header.appendChild(metaContainer);
        tempContainer.appendChild(header);

        // Add answers content
        const answersDiv = document.createElement('div');
        answersDiv.id = 'tempAnswers';
        answersDiv.style.cssText = `
            margin-bottom: 3rem;
        `;

        const category = gratitudeCategories[currentCategory];
        category.questions.forEach((question, index) => {
            const answerReview = document.createElement('div');
            answerReview.style.cssText = `
                background: white;
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 1.5rem;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
                border-left: 4px solid #667eea;
                font-family: sans-serif;
            `;

            const questionH4 = document.createElement('h4');
            questionH4.textContent = `${index + 1}. ${question}`;
            questionH4.style.cssText = `
                color: #4a5568;
                font-size: 1.1rem;
                margin-bottom: 0.75rem;
                font-weight: 600;
            `;

            const answerContent = document.createElement('div');
            answerContent.textContent = answers[index] || '[Skipped]';
            answerContent.style.cssText = `
                color: #2d3748;
                line-height: 1.6;
                white-space: pre-wrap;
                padding: 1rem;
                background: #f7fafc;
                border-radius: 8px;
                font-size: 1rem;
            `;

            answerReview.appendChild(questionH4);
            answerReview.appendChild(answerContent);
            answersDiv.appendChild(answerReview);
        });

        tempContainer.appendChild(answersDiv);

        // Add footer
        const footer = document.createElement('div');
        footer.style.cssText = `
            text-align: center;
            color: #a0aec0;
            font-size: 0.9rem;
            padding-top: 2rem;
            border-top: 1px solid #e2e8f0;
            font-family: sans-serif;
        `;
        footer.textContent = 'Created with Take Work Breaks • takeworkbreaks.com';

        tempContainer.appendChild(footer);

        // Add to document
        document.body.appendChild(tempContainer);

        // Generate image
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            backgroundColor: '#f8fafc',
            logging: false,
            useCORS: true,
            allowTaint: true
        });

        // Remove temporary container
        document.body.removeChild(tempContainer);

        // Convert canvas to image
        const image = canvas.toDataURL('image/png');

        // Create download link
        const link = document.createElement('a');
        link.href = image;
        const fileName = `gratitude-journal-${gratitudeCategories[currentCategory].title.toLowerCase().replace(/\s+/g, '-')}-${now.toISOString().slice(0, 10)}.png`;
        link.download = fileName;
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
        background: linear-gradient(135deg, #38a169, #2f855a) !important;
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