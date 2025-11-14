// Frontend Master Flashcard App
// Complete spaced repetition system with SM-2 algorithm

class FlashcardApp {
  constructor() {
    this.decks = [];
    this.currentDeck = null;
    this.currentSession = [];
    this.currentCardIndex = 0;
    this.sessionStats = {
      studied: 0,
      correct: 0,
      startTime: null
    };

    // Load progress from localStorage
    this.progress = this.loadProgress();

    this.initializeApp();
  }

  // Initialize the application
  initializeApp() {
    this.setupEventListeners();
    this.loadDecks();
    this.updateStats();
    this.showView('study');
  }

  // Setup all event listeners
  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.showView(view);

        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(b => {
          b.classList.remove('bg-gradient-to-r', 'from-indigo-500', 'to-indigo-600', 'text-white');
        });
        btn.classList.add('bg-gradient-to-r', 'from-indigo-500', 'to-indigo-600', 'text-white');
      });
    });

    // Card flip
    document.getElementById('flip-btn').addEventListener('click', () => {
      this.flipCard();
    });

    // Rating buttons
    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating);
        this.rateCard(rating);
      });
    });

    // Session controls
    document.getElementById('end-session').addEventListener('click', () => {
      this.endSession();
    });

    document.getElementById('new-session').addEventListener('click', () => {
      this.showView('decks');
      document.getElementById('session-complete').classList.add('hidden');
      document.getElementById('flashcard-area').style.display = 'block';
    });

    document.getElementById('view-progress').addEventListener('click', () => {
      this.showView('progress');
    });

    // Settings
    document.getElementById('new-cards-limit').addEventListener('change', (e) => {
      this.progress.settings.newCardsPerDay = parseInt(e.target.value);
      this.saveProgress();
    });

    document.getElementById('review-cards-limit').addEventListener('change', (e) => {
      this.progress.settings.reviewCardsPerDay = parseInt(e.target.value);
      this.saveProgress();
    });

    document.getElementById('autoplay').addEventListener('change', (e) => {
      this.progress.settings.autoplay = e.target.checked;
      this.saveProgress();
    });

    document.getElementById('export-data').addEventListener('click', () => {
      this.exportProgress();
    });

    document.getElementById('reset-progress').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        this.resetProgress();
      }
    });

    // Category filters
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => {
          b.classList.remove('bg-gradient-to-r', 'from-indigo-500', 'to-indigo-600');
          b.classList.add('bg-slate-700');
        });
        btn.classList.remove('bg-slate-700');
        btn.classList.add('bg-gradient-to-r', 'from-indigo-500', 'to-indigo-600');
        this.filterDecks(btn.dataset.category);
      });
    });
  }

  // Show specific view
  showView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
      view.classList.add('hidden');
      view.classList.remove('block');
    });

    const targetView = document.getElementById(`${viewName}-view`);
    targetView.classList.remove('hidden');
    targetView.classList.add('block');

    // Load view-specific data
    if (viewName === 'decks') {
      this.renderDecks();
    } else if (viewName === 'progress') {
      this.renderProgress();
    } else if (viewName === 'settings') {
      this.loadSettings();
    }
  }

  // Load all available decks
  async loadDecks() {
    // Define all available decks
    const deckDefinitions = [
      // By Topic
      {
        name: 'JavaScript Master',
        file: '14-flashcards/by-topic/javascript.md',
        description: '100 essential JavaScript concepts',
        category: 'by-topic',
        icon: '📜',
        cards: 100
      },
      {
        name: 'React Deep Dive',
        file: '14-flashcards/by-topic/react.md',
        description: '100 React patterns and best practices',
        category: 'by-topic',
        icon: '⚛️',
        cards: 100
      },
      {
        name: 'TypeScript Essentials',
        file: '14-flashcards/by-topic/typescript.md',
        description: '50 TypeScript type system concepts',
        category: 'by-topic',
        icon: '📘',
        cards: 50
      },
      {
        name: 'HTML & CSS',
        file: '14-flashcards/by-topic/html-css.md',
        description: '50 modern HTML and CSS techniques',
        category: 'by-topic',
        icon: '🎨',
        cards: 50
      },
      {
        name: 'Next.js Patterns',
        file: '14-flashcards/by-topic/nextjs.md',
        description: '40 Next.js App Router concepts',
        category: 'by-topic',
        icon: '▲',
        cards: 40
      },
      {
        name: 'Performance Optimization',
        file: '14-flashcards/by-topic/performance.md',
        description: '40 performance optimization techniques',
        category: 'by-topic',
        icon: '⚡',
        cards: 40
      },
      {
        name: 'Security Best Practices',
        file: '14-flashcards/by-topic/security.md',
        description: '30 security concepts for frontend',
        category: 'by-topic',
        icon: '🔒',
        cards: 30
      },
      {
        name: 'Testing Mastery',
        file: '14-flashcards/by-topic/testing.md',
        description: '50 testing concepts and patterns',
        category: 'by-topic',
        icon: '🧪',
        cards: 50
      },
      {
        name: 'Code Output Prediction',
        file: '14-flashcards/by-topic/code-output.md',
        description: '50 tricky code output questions',
        category: 'by-topic',
        icon: '🔍',
        cards: 50
      },
      // Curated Decks
      {
        name: 'Daily 20',
        file: '14-flashcards/curated-decks/daily-20.md',
        description: 'Quick 20-card daily review',
        category: 'curated',
        icon: '☀️',
        cards: 20
      },
      {
        name: 'Pre-Interview 30',
        file: '14-flashcards/curated-decks/pre-interview-30.md',
        description: 'Essential concepts before interviews',
        category: 'curated',
        icon: '💼',
        cards: 30
      }
    ];

    this.decks = deckDefinitions.map(deck => ({
      ...deck,
      loaded: false,
      cards: []
    }));
  }

  // Parse markdown file to extract flashcards
  async loadDeckCards(deck) {
    if (deck.loaded) return deck;

    try {
      const response = await fetch(deck.file);
      const text = await response.text();

      const cards = this.parseMarkdownCards(text);
      deck.cards = cards;
      deck.loaded = true;

      return deck;
    } catch (error) {
      console.error(`Error loading deck ${deck.name}:`, error);
      deck.cards = [];
      deck.loaded = true;
      return deck;
    }
  }

  // Parse markdown to extract individual cards
  parseMarkdownCards(markdown) {
    const cards = [];
    const cardBlocks = markdown.split(/^## Card \d+:/gm).slice(1);

    cardBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      const title = lines[0].trim();

      let question = '';
      let answer = '';
      let difficulty = '🟡 Medium';
      let frequency = '⭐⭐⭐';
      let tags = [];

      let currentSection = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('**Q:**')) {
          currentSection = 'question';
          question = line.replace('**Q:**', '').trim();
        } else if (line.startsWith('**A:**')) {
          currentSection = 'answer';
          answer = line.replace('**A:**', '').trim();
        } else if (line.startsWith('**Difficulty:**')) {
          difficulty = line.replace('**Difficulty:**', '').trim();
        } else if (line.startsWith('**Frequency:**')) {
          frequency = line.replace('**Frequency:**', '').trim();
        } else if (line.startsWith('**Tags:**')) {
          tags = line.replace('**Tags:**', '').trim().split(' ');
        } else if (line && currentSection === 'question') {
          question += ' ' + line;
        } else if (line && currentSection === 'answer') {
          answer += ' ' + line;
        }
      }

      cards.push({
        id: `${index + 1}`,
        title,
        question,
        answer,
        difficulty,
        frequency,
        tags
      });
    });

    return cards;
  }

  // Render all decks
  renderDecks() {
    const container = document.getElementById('decks-container');
    container.innerHTML = '';

    this.decks.forEach(deck => {
      const cardProgress = this.getDeckProgress(deck.name);
      const masteredCount = cardProgress.mastered;
      const totalCards = deck.cards.length || 100;

      const deckCard = document.createElement('div');
      deckCard.className = 'bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-indigo-500 transition-all cursor-pointer group';
      deckCard.innerHTML = `
        <h3 class="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">${deck.icon} ${deck.name}</h3>
        <p class="text-slate-400 text-sm mb-4">${deck.description}</p>
        <div class="flex justify-between items-center text-sm text-slate-500 mb-4">
          <span>${totalCards} cards</span>
          <span>${masteredCount} mastered</span>
        </div>
        <button class="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg font-semibold transition-all" data-deck="${deck.name}">
          Start Session
        </button>
      `;

      deckCard.querySelector('button').addEventListener('click', () => {
        this.startSession(deck);
      });

      container.appendChild(deckCard);
    });
  }

  // Filter decks by category
  filterDecks(category) {
    const container = document.getElementById('decks-container');
    const deckCards = container.querySelectorAll('.deck-card');

    if (category === 'all') {
      deckCards.forEach(card => card.style.display = 'block');
      return;
    }

    deckCards.forEach((card, index) => {
      const deck = this.decks[index];
      card.style.display = deck.category === category ? 'block' : 'none';
    });
  }

  // Start a new study session
  async startSession(deck) {
    // Load deck cards if not already loaded
    await this.loadDeckCards(deck);

    if (deck.cards.length === 0) {
      alert('This deck has no cards yet!');
      return;
    }

    this.currentDeck = deck;
    this.currentSession = [...deck.cards];
    this.currentCardIndex = 0;
    this.sessionStats = {
      studied: 0,
      correct: 0,
      startTime: Date.now()
    };

    // Show study view
    this.showView('study');
    document.getElementById('flashcard-area').style.display = 'block';
    document.getElementById('session-complete').classList.add('hidden');
    document.getElementById('deck-name').textContent = deck.name;

    // Show first card
    this.showCard();
  }

  // Show current card
  showCard() {
    if (this.currentCardIndex >= this.currentSession.length) {
      this.endSession();
      return;
    }

    const card = this.currentSession[this.currentCardIndex];
    const flashcard = document.getElementById('flashcard');

    // Reset flip state
    flashcard.classList.remove('flipped');
    document.getElementById('rating-buttons').classList.add('hidden');

    // Update card content
    document.getElementById('card-question').textContent = card.question;
    document.getElementById('card-answer').innerHTML = this.formatAnswer(card.answer);
    document.getElementById('difficulty-badge').textContent = card.difficulty;
    document.getElementById('difficulty-badge-back').textContent = card.difficulty;
    document.getElementById('frequency-badge').textContent = card.frequency;

    // Update tags
    const tagsContainer = document.getElementById('card-tags');
    tagsContainer.innerHTML = card.tags.map(tag => `<span>${tag}</span>`).join(' ');

    // Update progress
    document.getElementById('card-progress').textContent =
      `${this.currentCardIndex + 1} / ${this.currentSession.length}`;

    const progressPercent = ((this.currentCardIndex) / this.currentSession.length) * 100;
    document.getElementById('session-progress').style.width = `${progressPercent}%`;
  }

  // Format answer text (simple markdown-like formatting)
  formatAnswer(answer) {
    // Replace code blocks
    answer = answer.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Replace bold
    answer = answer.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Add line breaks
    answer = answer.replace(/\n/g, '<br>');

    return answer;
  }

  // Flip the current card
  flipCard() {
    const flashcard = document.getElementById('flashcard');
    const isFlipped = flashcard.classList.contains('flipped');

    if (isFlipped) {
      flashcard.classList.remove('flipped');
      document.getElementById('rating-buttons').classList.add('hidden');
    } else {
      flashcard.classList.add('flipped');
      document.getElementById('rating-buttons').classList.remove('hidden');
    }
  }

  // Rate the current card (SM-2 algorithm)
  rateCard(rating) {
    const card = this.currentSession[this.currentCardIndex];

    // Get or create card progress
    const cardId = `${this.currentDeck.name}-${card.id}`;
    let cardProgress = this.progress.cards[cardId] || {
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: Date.now()
    };

    // SM-2 Algorithm
    if (rating >= 2) { // Good or Easy
      if (cardProgress.repetitions === 0) {
        cardProgress.interval = 1;
      } else if (cardProgress.repetitions === 1) {
        cardProgress.interval = 6;
      } else {
        cardProgress.interval = Math.round(cardProgress.interval * cardProgress.easeFactor);
      }
      cardProgress.repetitions += 1;
      this.sessionStats.correct++;
    } else { // Again or Hard
      cardProgress.repetitions = 0;
      cardProgress.interval = 1;
    }

    // Update ease factor
    cardProgress.easeFactor = Math.max(1.3,
      cardProgress.easeFactor + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
    );

    // Set next review date
    cardProgress.nextReview = Date.now() + (cardProgress.interval * 24 * 60 * 60 * 1000);

    // Save progress
    this.progress.cards[cardId] = cardProgress;
    this.sessionStats.studied++;

    // Update deck progress
    const deckProgress = this.progress.deckProgress[this.currentDeck.name] || { studied: 0, mastered: 0 };
    deckProgress.studied = Math.max(deckProgress.studied, this.sessionStats.studied);
    if (rating >= 2) {
      deckProgress.mastered++;
    }
    this.progress.deckProgress[this.currentDeck.name] = deckProgress;

    // Update stats
    this.progress.stats.totalStudied++;
    this.updateStreak();
    this.saveProgress();

    // Move to next card
    this.currentCardIndex++;
    this.showCard();
  }

  // End current session
  endSession() {
    const flashcardArea = document.getElementById('flashcard-area');
    const sessionComplete = document.getElementById('session-complete');

    flashcardArea.style.display = 'none';
    sessionComplete.classList.remove('hidden');

    // Calculate stats
    const accuracy = this.sessionStats.studied > 0
      ? Math.round((this.sessionStats.correct / this.sessionStats.studied) * 100)
      : 0;

    document.getElementById('cards-studied').textContent = this.sessionStats.studied;
    document.getElementById('accuracy-rate').textContent = `${accuracy}%`;

    this.saveProgress();
  }

  // Get deck progress
  getDeckProgress(deckName) {
    return this.progress.deckProgress[deckName] || { studied: 0, mastered: 0 };
  }

  // Update streak
  updateStreak() {
    const today = new Date().toDateString();
    const lastStudy = this.progress.stats.lastStudyDate;

    if (lastStudy !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      if (lastStudy === yesterday) {
        this.progress.stats.currentStreak++;
      } else {
        this.progress.stats.currentStreak = 1;
      }

      this.progress.stats.lastStudyDate = today;
    }

    this.updateStats();
  }

  // Update displayed stats
  updateStats() {
    const stats = this.progress.stats;

    document.getElementById('today-count').textContent = this.getTodayCount();
    document.getElementById('streak-count').textContent = stats.currentStreak;
    document.getElementById('total-cards').textContent = stats.totalStudied;
    document.getElementById('mastered-cards').textContent = this.getMasteredCount();
    document.getElementById('current-streak').textContent = stats.currentStreak;
    document.getElementById('study-time').textContent = `${Math.round(stats.totalTime / 60)}m`;
  }

  // Get today's study count
  getTodayCount() {
    const today = new Date().toDateString();
    return this.progress.stats.lastStudyDate === today ? this.progress.stats.todayStudied : 0;
  }

  // Get total mastered cards count
  getMasteredCount() {
    return Object.values(this.progress.cards).filter(card =>
      card.repetitions >= 3 && card.easeFactor >= 2.5
    ).length;
  }

  // Render progress view
  renderProgress() {
    this.updateStats();

    // Render deck progress
    const deckProgressContainer = document.getElementById('deck-progress');
    deckProgressContainer.innerHTML = '';

    this.decks.forEach(deck => {
      const progress = this.getDeckProgress(deck.name);
      const totalCards = deck.cards.length || 100;
      const percent = Math.round((progress.mastered / totalCards) * 100);

      const progressItem = document.createElement('div');
      progressItem.className = 'mb-6';
      progressItem.innerHTML = `
        <div class="flex justify-between mb-2">
          <span>${deck.icon} ${deck.name}</span>
          <span class="text-slate-400">${progress.mastered} / ${totalCards}</span>
        </div>
        <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300" style="width: ${percent}%"></div>
        </div>
      `;

      deckProgressContainer.appendChild(progressItem);
    });
  }

  // Load settings
  loadSettings() {
    document.getElementById('new-cards-limit').value = this.progress.settings.newCardsPerDay;
    document.getElementById('review-cards-limit').value = this.progress.settings.reviewCardsPerDay;
    document.getElementById('autoplay').checked = this.progress.settings.autoplay;
  }

  // Load progress from localStorage
  loadProgress() {
    const saved = localStorage.getItem('flashcard-progress');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      cards: {},
      deckProgress: {},
      stats: {
        totalStudied: 0,
        currentStreak: 0,
        lastStudyDate: null,
        todayStudied: 0,
        totalTime: 0
      },
      settings: {
        newCardsPerDay: 20,
        reviewCardsPerDay: 100,
        autoplay: true
      }
    };
  }

  // Save progress to localStorage
  saveProgress() {
    localStorage.setItem('flashcard-progress', JSON.stringify(this.progress));
  }

  // Export progress as JSON
  exportProgress() {
    const dataStr = JSON.stringify(this.progress, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'flashcard-progress.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  // Reset all progress
  resetProgress() {
    localStorage.removeItem('flashcard-progress');
    this.progress = this.loadProgress();
    this.updateStats();
    this.renderProgress();
    alert('Progress reset successfully!');
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new FlashcardApp();
});
