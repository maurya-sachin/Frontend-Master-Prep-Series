import { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, CreditCard, TrendingUp } from 'lucide-react';
import { updateStreak, getStudyProgress, saveStudyProgress } from '../utils/storage';

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const progress = getStudyProgress();

  const decks = [
    { key: 'javascript', name: 'JavaScript', icon: '📜', cards: 50 },
    { key: 'typescript', name: 'TypeScript', icon: '📘', cards: 30 },
    { key: 'react', name: 'React', icon: '⚛️', cards: 100 },
    { key: 'nextjs', name: 'Next.js', icon: '▲', cards: 25 },
    { key: 'performance', name: 'Performance', icon: '⚡', cards: 40 },
    { key: 'security', name: 'Security', icon: '🔒', cards: 30 },
  ];

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
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Study Flashcards</h2>
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
                  <p className="text-sm text-slate-400">{deck.cards} flashcards</p>
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

  const currentDeck = decks.find((d) => d.key === selectedDeck);
  const isSessionComplete = currentCardIndex >= (currentDeck?.cards || 0);

  if (isSessionComplete) {
    const total = sessionStats.correct + sessionStats.incorrect;
    const accuracy = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12 space-y-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="text-green-400" size={40} />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-100 mb-2">Session Complete!</h2>
            <p className="text-slate-400">Great job on completing the deck</p>
          </div>

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

          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedDeck(null);
                setCurrentCardIndex(0);
                setSessionStats({ correct: 0, incorrect: 0 });
              }}
              className="btn-secondary flex-1"
            >
              Back to Decks
            </button>
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
                Card {currentCardIndex + 1} of {currentDeck?.cards}
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
              width: `${((currentCardIndex + 1) / (currentDeck?.cards || 1)) * 100}%`,
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
        <div className="text-center p-8">
          {!isFlipped ? (
            <div className="space-y-4">
              <div className="text-6xl mb-6">❓</div>
              <h3 className="text-2xl font-semibold text-slate-100">
                Sample Question {currentCardIndex + 1}
              </h3>
              <p className="text-slate-400 text-sm">Click to reveal answer</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl mb-6">💡</div>
              <h3 className="text-xl font-semibold text-slate-100 mb-4">Answer</h3>
              <p className="text-slate-300 leading-relaxed">
                This is a sample answer for demonstration purposes. In production, this would load
                actual flashcard content from the markdown files.
              </p>
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
