// Content Data - Initially empty, will be loaded from JSON files
let contentData = {
    quotes: [],
    jokes: []
};

// App State
let currentType = ''; // 'quotes' or 'jokes'
let currentCategory = 'all'; // 'all' or specific category
let currentContent = [];
let currentItem = null;

// Categories Data
const categories = {
    quotes: [
        { id: 'focus', name: 'Focus & Concentration', desc: 'Sharpen your mind and attention' },
        { id: 'productivity', name: 'Productivity', desc: 'Get things done efficiently' },
        { id: 'perseverance', name: 'Perseverance', desc: 'Keep going despite challenges' },
        { id: 'mindfulness', name: 'Mindfulness', desc: 'Stay present and aware' },
        { id: 'creativity', name: 'Creativity', desc: 'Spark innovation and ideas' }
    ],
    jokes: [
        { id: 'tech', name: 'Tech Humor', desc: 'Programming and tech jokes' },
        { id: 'worklife', name: 'Work/Life', desc: 'Office and work-related humor' },
        { id: 'clean', name: 'Clean Fun', desc: 'Family-friendly jokes' },
        { id: 'braint', name: 'Brain Teasers', desc: 'Puzzles and thinking jokes' }
    ]
};

// DOM Elements
const elements = {
    typeSelector: document.getElementById('typeSelector'),
    typeGrid: document.querySelector('.type-grid'),
    contentDisplay: document.getElementById('contentDisplay'),
    contentTitle: document.getElementById('contentTitle'),
    contentIcon: document.getElementById('contentIcon'),
    contentType: document.getElementById('contentType'),
    contentCategory: document.getElementById('contentCategory'),
    contentText: document.getElementById('contentText'),
    categoryDropdown: document.getElementById('categoryDropdown'),
    newContentBtn: document.getElementById('newContentBtn'),
    backToTypes: document.getElementById('backToTypes'),
    copyBtn: document.getElementById('copyBtn'),
    shareBtn: document.getElementById('shareBtn')
};

// Initialize the app
async function init() {
    setupEventListeners();
    await loadContentData();
}

// Load JSON data with lazy loading
async function loadContentData() {
    try {
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
    }
}

// Setup event listeners
function setupEventListeners() {
    // Type selection (only two cards)
    elements.typeGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.type-card');
        if (card) {
            currentType = card.dataset.type;
            initializeContentDisplay();
            showContentDisplay();
        }
    });

    // Category dropdown change
    elements.categoryDropdown.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        getRandomContent();
    });

    // New content button
    elements.newContentBtn.addEventListener('click', getRandomContent);

    // Back button
    elements.backToTypes.addEventListener('click', () => {
        elements.typeSelector.hidden = false;
        elements.contentDisplay.hidden = true;
    });

    // Copy button
    elements.copyBtn.addEventListener('click', copyToClipboard);

    // Share button
    elements.shareBtn.addEventListener('click', shareContent);
}

// Initialize content display with dropdown and title
function initializeContentDisplay() {
    // Update title and icon based on type
    if (currentType === 'quotes') {
        elements.contentTitle.textContent = 'Daily Motivation';
        elements.contentIcon.textContent = '💫';
        elements.newContentBtn.textContent = '🎲 New Quote';
    } else {
        elements.contentTitle.textContent = 'Funny Jokes';
        elements.contentIcon.textContent = '😂';
        elements.newContentBtn.textContent = '🎲 New Joke';
    }

    // Populate category dropdown
    populateCategoryDropdown();

    // Get initial content
    getRandomContent();
}

// Populate category dropdown based on current type
function populateCategoryDropdown() {
    elements.categoryDropdown.innerHTML = '<option value="all">All Categories</option>';

    const currentCategories = currentType === 'quotes' ? categories.quotes : categories.jokes;

    currentCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        elements.categoryDropdown.appendChild(option);
    });
}

// Show content display
function showContentDisplay() {
    elements.typeSelector.hidden = true;
    elements.contentDisplay.hidden = false;
}

// Get random content based on current type and category
function getRandomContent() {
    // Get the content array for current type
    let contentArray = currentType === 'quotes' ? contentData.quotes : contentData.jokes;

    // Filter by category if not "all"
    if (currentCategory !== 'all') {
        contentArray = contentArray.filter(item => item.category === currentCategory);
    }

    if (contentArray.length === 0) {
        elements.contentText.textContent = 'No content found for this selection.';
        return;
    }

    // Get random item
    const randomIndex = Math.floor(Math.random() * contentArray.length);
    currentItem = contentArray[randomIndex];

    displayContent(currentItem);
}

// Display content
function displayContent(item) {
    const isQuote = 'quote' in item;
    
    // Update content type display
    elements.contentType.textContent = isQuote ? 'Motivational Quote' : 'Funny Joke';
    
    // Find category name
    const allCategories = [...categories.quotes, ...categories.jokes];
    const category = allCategories.find(cat => cat.id === item.category);
    elements.contentCategory.textContent = category ? category.name : 'General';
    
    // Update content text with animation
    elements.contentText.style.opacity = '0';
    
    setTimeout(() => {
        elements.contentText.className = 'content-text';
        let html = '';
        
        if (isQuote) {
            elements.contentText.classList.add('quote');
            // Quote text with author below
            html = `
                <div class="quote-text">"${item.quote}"</div>
                ${item.author ? `<div class="quote-author">— ${item.author}</div>` : ''}
            `;
        } else {
            elements.contentText.classList.add('joke');
            // Setup with punchline below
            html = `
                <div class="joke-setup">${item.setup}</div>
                <div class="joke-punchline">${item.punchline}</div>
            `;
        }
        
        elements.contentText.innerHTML = html;
        elements.contentText.style.opacity = '1';
    }, 300);
}

// Copy to clipboard
async function copyToClipboard() {
    if (!currentItem) return;

    let textToCopy = '';

    if ('quote' in currentItem) {
        textToCopy = `"${currentItem.quote}"`;
        if (currentItem.author) {
            textToCopy += ` — ${currentItem.author}`;
        }
    } else {
        textToCopy = `${currentItem.setup}\n\n${currentItem.punchline}`;
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
    if (!currentItem) return;

    let shareText = '';
    let shareTitle = '';

    if ('quote' in currentItem) {
        shareTitle = 'Inspirational Quote';
        shareText = `💫 "${currentItem.quote}"`;
        if (currentItem.author) {
            shareText += ` — ${currentItem.author}\n\n`;
        }
        shareText += `Shared via Take Work Breaks`;
    } else {
        shareTitle = 'Funny Joke';
        shareText = `😂 ${currentItem.setup}\n\n${currentItem.punchline}\n\nShared via Take Work Breaks`;
    }

    if (navigator.share) {
        try {
            await navigator.share({
                title: shareTitle,
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