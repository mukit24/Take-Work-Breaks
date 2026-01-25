// Content Data - Initially empty, will be loaded from JSON files
let contentData = {
    quotes: [],
    jokes: []
};

// App State
let currentType = 'both'; // 'both', 'quotes', 'jokes'
let currentCategory = null; // null for all categories
let currentContent = [];
let currentIndex = 0;
let isLoading = false;

// Categories Data
const categories = {
    quotes: [
        { id: 'focus', name: 'Focus & Concentration 🎯', desc: 'Sharpen your mind and attention', icon: '🎯' },
        { id: 'productivity', name: 'Productivity ⚡', desc: 'Get things done efficiently', icon: '⚡' },
        { id: 'perseverance', name: 'Perseverance 💪', desc: 'Keep going despite challenges', icon: '💪' },
        { id: 'mindfulness', name: 'Mindfulness 🧘', desc: 'Stay present and aware', icon: '🧘' },
        { id: 'creativity', name: 'Creativity 🎨', desc: 'Spark innovation and ideas', icon: '🎨' }
    ],
    jokes: [
        { id: 'tech', name: 'Tech Humor 💻', desc: 'Programming and tech jokes', icon: '💻' },
        { id: 'worklife', name: 'Work/Life 😄', desc: 'Office and work-related humor', icon: '😄' },
        { id: 'clean', name: 'Clean Fun 🌟', desc: 'Family-friendly jokes', icon: '🌟' },
        { id: 'braint', name: 'Brain Teasers 🧩', desc: 'Puzzles and thinking jokes', icon: '🧩' }
    ]
};

// DOM Elements
const elements = {
    typeGrid: document.querySelector('.type-grid'),
    categorySection: document.querySelector('.category-section'),
    categoryGrid: document.getElementById('categoryGrid'),
    allCategoriesBtn: document.getElementById('allCategoriesBtn'),
    contentDisplay: document.querySelector('.content-display'),
    contentTitle: document.getElementById('contentTitle'),
    contentIcon: document.getElementById('contentIcon'),
    contentType: document.getElementById('contentType'),
    contentCategory: document.getElementById('contentCategory'),
    contentText: document.getElementById('contentText'),
    contentCounter: document.getElementById('contentCounter'),
    refreshBtn: document.getElementById('refreshBtn'),
    backToCategories: document.getElementById('backToCategories'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    copyBtn: document.getElementById('copyBtn'),
    shareBtn: document.getElementById('shareBtn')
};

// Initialize the app
async function init() {
    setupEventListeners();
    await loadContentData();
    updateTypeUI();
}

// Load JSON data with lazy loading
async function loadContentData() {
    try {
        isLoading = true;

        // Load quotes data
        const quotesResponse = await fetch('data/quotes.json');
        contentData.quotes = await quotesResponse.json();

        // Load jokes data
        const jokesResponse = await fetch('data/jokes.json');
        contentData.jokes = await jokesResponse.json();

        console.log(`Loaded ${contentData.quotes.length} quotes and ${contentData.jokes.length} jokes`);
    } catch (error) {
        console.error('Error loading content data:', error);
        // Fallback to default data if loading fails
        contentData.quotes = getDefaultQuotes();
        contentData.jokes = getDefaultJokes();
    } finally {
        isLoading = false;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Type selection
    elements.typeGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.type-card');
        if (card) {
            currentType = card.dataset.type;
            updateTypeUI();
            showCategorySection();
        }
    });

    // Category selection
    elements.categoryGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.category-card');
        if (card) {
            currentCategory = card.dataset.categoryId;
            loadContentForCategory();
            showContentDisplay();
        }
    });

    // All categories button
    elements.allCategoriesBtn.addEventListener('click', () => {
        currentCategory = null;
        loadContentForCategory();
        showContentDisplay();
    });

    // Content navigation
    elements.refreshBtn.addEventListener('click', getRandomContent);
    elements.backToCategories.addEventListener('click', showCategorySection);
    elements.prevBtn.addEventListener('click', showPreviousContent);
    elements.nextBtn.addEventListener('click', showNextContent);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.shareBtn.addEventListener('click', shareContent);
}

// Update type selection UI
function updateTypeUI() {
    document.querySelectorAll('.type-card').forEach(card => {
        if (card.dataset.type === currentType) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// Show category section
function showCategorySection() {
    renderCategoryGrid();
    elements.categorySection.hidden = false;
    elements.contentDisplay.hidden = true;
}

// Render category grid based on current type
function renderCategoryGrid() {
    let categoriesToShow = [];

    if (currentType === 'both') {
        categoriesToShow = [...categories.quotes, ...categories.jokes];
    } else if (currentType === 'quotes') {
        categoriesToShow = categories.quotes;
    } else if (currentType === 'jokes') {
        categoriesToShow = categories.jokes;
    }

    elements.categoryGrid.innerHTML = categoriesToShow.map(cat => `
        <div class="category-card" data-category-id="${cat.id}">
            <div class="cat-icon">${cat.icon}</div>
            <div class="cat-content">
                <div class="cat-name">${cat.name}</div>
                <div class="cat-desc">${cat.desc}</div>
            </div>
        </div>
    `).join('');
}

// Load content for selected category
function loadContentForCategory() {
    currentContent = [];
    currentIndex = 0;

    if (currentType === 'both') {
        // Mix quotes and jokes
        if (currentCategory) {
            // Filter by specific category
            const quoteCat = categories.quotes.find(c => c.id === currentCategory);
            const jokeCat = categories.jokes.find(c => c.id === currentCategory);

            if (quoteCat) {
                currentContent = contentData.quotes.filter(item => item.category === currentCategory);
            } else if (jokeCat) {
                currentContent = contentData.jokes.filter(item => item.category === currentCategory);
            }
        } else {
            // All categories mixed
            currentContent = [...contentData.quotes, ...contentData.jokes];
        }
    } else if (currentType === 'quotes') {
        currentContent = currentCategory
            ? contentData.quotes.filter(item => item.category === currentCategory)
            : contentData.quotes;
    } else if (currentType === 'jokes') {
        currentContent = currentCategory
            ? contentData.jokes.filter(item => item.category === currentCategory)
            : contentData.jokes;
    }

    // Shuffle the content
    shuffleArray(currentContent);

    if (currentContent.length > 0) {
        displayContent(0);
    } else {
        elements.contentText.textContent = 'No content found for this selection.';
    }
}

// Show content display
function showContentDisplay() {
    elements.categorySection.hidden = true;
    elements.contentDisplay.hidden = false;

    // Update title based on selection
    let title = 'Daily Inspiration';
    if (currentType === 'quotes') title = 'Motivational Quotes';
    else if (currentType === 'jokes') title = 'Funny Jokes';

    elements.contentTitle.textContent = title;
}

// Display content at index
function displayContent(index) {
    if (currentContent.length === 0) return;

    const content = currentContent[index];
    const isQuote = 'quote' in content;

    // Update UI based on content type
    elements.contentIcon.textContent = isQuote ? '💫' : '😂';
    elements.contentType.textContent = isQuote ? 'Motivational Quote' : 'Funny Joke';

    // Find category name
    const allCategories = [...categories.quotes, ...categories.jokes];
    const category = allCategories.find(cat => cat.id === content.category);
    elements.contentCategory.textContent = category ? category.name : 'General';

    // Update content text
    elements.contentText.className = 'content-text';
    if (isQuote) {
        elements.contentText.classList.add('quote');
        elements.contentText.innerHTML = `"${content.quote}"`;
    } else {
        elements.contentText.classList.add('joke');
        elements.contentText.innerHTML = `
            ${content.setup}
            <span class="punchline">${content.punchline}</span>
        `;
    }

    // Update counter and navigation
    elements.contentCounter.textContent = `Showing: ${index + 1}/${currentContent.length}`;
    elements.prevBtn.disabled = index === 0;
    elements.nextBtn.disabled = index === currentContent.length - 1;

    // Update author if present
    if (isQuote && content.author) {
        elements.contentText.innerHTML += `<div class="author">— ${content.author}</div>`;
    }
}

// Get random content
function getRandomContent() {
    if (currentContent.length === 0) return;

    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * currentContent.length);
    } while (newIndex === currentIndex && currentContent.length > 1);

    currentIndex = newIndex;
    displayContent(currentIndex);
}

// Show previous content
function showPreviousContent() {
    if (currentIndex > 0) {
        currentIndex--;
        displayContent(currentIndex);
    }
}

// Show next content
function showNextContent() {
    if (currentIndex < currentContent.length - 1) {
        currentIndex++;
        displayContent(currentIndex);
    }
}

// Copy to clipboard
async function copyToClipboard() {
    const content = currentContent[currentIndex];
    let textToCopy = '';

    if ('quote' in content) {
        textToCopy = `"${content.quote}"`;
        if (content.author) {
            textToCopy += ` — ${content.author}`;
        }
    } else {
        textToCopy = `${content.setup}\n\n${content.punchline}`;
    }

    try {
        await navigator.clipboard.writeText(textToCopy);
        showFeedback('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
        showFeedback('Failed to copy', true);
    }
}

// Share content
async function shareContent() {
    const content = currentContent[currentIndex];
    let shareText = '';

    if ('quote' in content) {
        shareText = `💫 "${content.quote}"`;
        if (content.author) {
            shareText += ` — ${content.author}\n\n`;
        }
        shareText += `Shared via Take Work Breaks`;
    } else {
        shareText = `😂 ${content.setup}\n\n${content.punchline}\n\nShared via Take Work Breaks`;
    }

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Take Work Breaks',
                text: shareText,
                url: window.location.href
            });
        } catch (err) {
            console.log('Share cancelled:', err);
        }
    } else {
        // Fallback to clipboard
        await copyToClipboard();
    }
}

// Show feedback message
function showFeedback(message, isError = false) {
    const feedback = document.createElement('div');
    feedback.className = `copy-feedback ${isError ? 'error' : ''}`;
    feedback.textContent = message;
    feedback.style.background = isError ? '#f56565' : '#48bb78';

    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

// Utility function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Default quotes data (fallback)
function getDefaultQuotes() {
    return [
        {
            id: 1,
            quote: "The only way to do great work is to love what you do.",
            author: "Steve Jobs",
            category: "focus"
        },
        {
            id: 2,
            quote: "Productivity is never an accident. It is always the result of a commitment to excellence, intelligent planning, and focused effort.",
            author: "Paul J. Meyer",
            category: "productivity"
        },
        {
            id: 3,
            quote: "Perseverance is not a long race; it is many short races one after the other.",
            author: "Walter Elliot",
            category: "perseverance"
        },
        {
            id: 4,
            quote: "The present moment is the only time over which we have dominion.",
            author: "Thich Nhat Hanh",
            category: "mindfulness"
        },
        {
            id: 5,
            quote: "Creativity is intelligence having fun.",
            author: "Albert Einstein",
            category: "creativity"
        },
        {
            id: 6,
            quote: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
            author: "Alexander Graham Bell",
            category: "focus"
        },
        {
            id: 7,
            quote: "Your time is limited, so don't waste it living someone else's life.",
            author: "Steve Jobs",
            category: "productivity"
        },
        {
            id: 8,
            quote: "Fall seven times, stand up eight.",
            author: "Japanese Proverb",
            category: "perseverance"
        },
        {
            id: 9,
            quote: "The best way to capture moments is to pay attention. This is how we cultivate mindfulness.",
            author: "Jon Kabat-Zinn",
            category: "mindfulness"
        },
        {
            id: 10,
            quote: "You can't use up creativity. The more you use, the more you have.",
            author: "Maya Angelou",
            category: "creativity"
        }
    ];
}

// Default jokes data (fallback)
function getDefaultJokes() {
    return [
        {
            id: 1,
            setup: "Why do programmers prefer dark mode?",
            punchline: "Because light attracts bugs!",
            category: "tech"
        },
        {
            id: 2,
            setup: "Why did the developer go broke?",
            punchline: "Because he used up all his cache!",
            category: "tech"
        },
        {
            id: 3,
            setup: "My boss told me to have a good day...",
            punchline: "So I went home.",
            category: "worklife"
        },
        {
            id: 4,
            setup: "Why don't scientists trust atoms?",
            punchline: "Because they make up everything!",
            category: "clean"
        },
        {
            id: 5,
            setup: "I told my wife she was drawing her eyebrows too high.",
            punchline: "She looked surprised.",
            category: "clean"
        },
        {
            id: 6,
            setup: "What do you call a bear with no teeth?",
            punchline: "A gummy bear!",
            category: "clean"
        },
        {
            id: 7,
            setup: "I'm reading a book on anti-gravity.",
            punchline: "It's impossible to put down!",
            category: "braint"
        },
        {
            id: 8,
            setup: "Why did the scarecrow win an award?",
            punchline: "Because he was outstanding in his field!",
            category: "braint"
        },
        {
            id: 9,
            setup: "What did one ocean say to the other ocean?",
            punchline: "Nothing, they just waved.",
            category: "clean"
        },
        {
            id: 10,
            setup: "How many programmers does it take to change a light bulb?",
            punchline: "None, that's a hardware problem!",
            category: "tech"
        }
    ];
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);