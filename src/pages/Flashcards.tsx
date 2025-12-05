import { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, CreditCard, TrendingUp, Loader } from 'lucide-react';
import { updateStreak, getStudyProgress, saveStudyProgress } from '../utils/storage';
import { loadFlashcardDeck } from '../utils/manifest';

interface FlashCard {
  question: string;
  answer: string;
  title: string;
  number: number;
  difficulty: string;
}

const DECK_PATHS: Record<string, string> = {
  javascript: '19-flashcards/by-topic/javascript.md',
  typescript: '19-flashcards/by-topic/typescript.md',
  react: '19-flashcards/by-topic/react.md',
  nextjs: '19-flashcards/by-topic/nextjs.md',
  performance: '19-flashcards/by-topic/performance.md',
  'html-css': '19-flashcards/by-topic/html-css.md',
};

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const progress = getStudyProgress();

  const decks = [
    { key: 'javascript', name: 'JavaScript', icon: '📜', description: 'Core JS concepts' },
    { key: 'typescript', name: 'TypeScript', icon: '📘', description: 'Type system mastery' },
    { key: 'react', name: 'React', icon: '⚛️', description: 'Hooks and patterns' },
    { key: 'nextjs', name: 'Next.js', icon: '▲', description: 'SSR and App Router' },
    { key: 'performance', name: 'Performance', icon: '⚡', description: 'Web Vitals' },
    { key: 'html-css', name: 'HTML & CSS', icon: '🎨', description: 'Layouts and styling' },
  ];

  useEffect(() => {
    if (selectedDeck && DECK_PATHS[selectedDeck]) {
      setLoading(true);
      loadFlashcardDeck(DECK_PATHS[selectedDeck])
        .then((loadedCards) => {
          setCards(loadedCards);
          setCurrentCardIndex(0);
          setIsFlipped(false);
          setSessionStats({ correct: 0, incorrect: 0 });
        })
        .catch((err) => {
          console.error('Failed to load deck:', err);
          setCards([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedDeck]);

  const handleAnswer = (correct: boolean) => {
    setSessionStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    if (correct) {
      updateStreak();
      const newProgress = getStudyProgress();
      newProgress.totalCards += 1;
      newProgress.masteredCards += 1;
      saveStudyProgress(newProgress);
    }

    // Move to next card
    setTimeout(() => {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }, 300);
  };

  if (!selectedDeck) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card text-center py-8">
          <CreditCard className="text-primary-400 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-100 dark:text-slate-100 mb-2">Study Flashcards</h2>
          <p className="text-slate-400 mb-6">
            Choose a deck to start studying with spaced repetition
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400">
              🔥 {progress.streak} Day Streak
            </div>
            <div className="px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400">
              📚 {progress.totalCards} Cards Studied
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck) => (
            <button
              key={deck.key}
              onClick={() => setSelectedDeck(deck.key)}
              className="card text-left hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl group-hover:scale-110 transition-transform">
                  {deck.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100 mb-1">{deck.name}</h3>
                  <p className="text-sm text-slate-400">{deck.description}</p>
                </div>
                <div className="px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium">
                  Start
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-16">
          <Loader className="animate-spin text-primary-400 mx-auto mb-4" size={48} />
          <p className="text-slate-300">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  const currentDeck = decks.find((d) => d.key === selectedDeck);
  const isSessionComplete = currentCardIndex >= cards.length;
  const currentCard = cards[currentCardIndex];

  if (isSessionComplete || cards.length === 0) {
    const total = sessionStats.correct + sessionStats.incorrect;
    const accuracy = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12 space-y-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="text-green-400" size={40} />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-100 mb-2">
              {cards.length === 0 ? 'No Cards Found' : 'Session Complete!'}
            </h2>
            <p className="text-slate-400">
              {cards.length === 0
                ? 'Unable to load flashcards for this deck'
                : 'Great job on completing the deck'}
            </p>
          </div>

          {cards.length > 0 && (
            <div className="grid grid-cols-3 gap-4 py-6">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="text-3xl font-bold text-slate-100">{total}</div>
                <div className="text-sm text-slate-400">Total Cards</div>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{sessionStats.correct}</div>
                <div className="text-sm text-slate-400">Correct</div>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="text-3xl font-bold text-primary-400">{accuracy}%</div>
                <div className="text-sm text-slate-400">Accuracy</div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedDeck(null);
                setCards([]);
                setCurrentCardIndex(0);
                setSessionStats({ correct: 0, incorrect: 0 });
              }}
              className="btn-secondary flex-1"
            >
              Back to Decks
            </button>
            {cards.length > 0 && (
              <button
                onClick={() => {
                  setCurrentCardIndex(0);
                  setSessionStats({ correct: 0, incorrect: 0 });
                  setIsFlipped(false);
                }}
                className="btn-primary flex-1"
              >
                <RotateCcw size={20} className="inline mr-2" />
                Restart
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentDeck?.icon}</span>
            <div>
              <h3 className="font-semibold text-slate-100">{currentDeck?.name}</h3>
              <p className="text-sm text-slate-400">
                Card {currentCardIndex + 1} of {cards.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedDeck(null)}
            className="text-sm text-slate-400 hover:text-slate-300"
          >
            Exit
          </button>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`card min-h-[400px] flex items-center justify-center cursor-pointer transition-all duration-500 ${
          isFlipped ? 'bg-gradient-to-br from-primary-500/10 to-purple-500/10' : ''
        }`}
      >
        <div className="text-center p-8 w-full">
          {!isFlipped ? (
            <div className="space-y-4">
              <div className="text-6xl mb-6">❓</div>
              <h3 className="text-sm text-primary-400 mb-2">{currentCard?.title}</h3>
              <p className="text-xl font-semibold text-slate-100">
                {currentCard?.question}
              </p>
              <p className="text-slate-400 text-sm mt-4">Click to reveal answer</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl mb-6">💡</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Answer</h3>
              <p className="text-slate-300 leading-relaxed">
                {currentCard?.answer}
              </p>
              {currentCard?.difficulty && (
                <p className="text-sm text-slate-500 mt-4">
                  Difficulty: {currentCard.difficulty}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Answer Buttons */}
      {isFlipped && (
        <div className="grid grid-cols-2 gap-4 fade-in">
          <button
            onClick={() => handleAnswer(false)}
            className="btn-secondary flex items-center justify-center gap-2 py-4"
          >
            <XCircle size={20} />
            Need Review
          </button>
          <button
            onClick={() => handleAnswer(true)}
            className="btn-primary flex items-center justify-center gap-2 py-4"
          >
            <CheckCircle size={20} />
            Got It!
          </button>
        </div>
      )}
    </div>
  );
}
