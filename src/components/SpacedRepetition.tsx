'use client';

import React, { useState, useCallback } from 'react';
import {
  Brain,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudy, type SpacedRepetitionCard } from '@/context/StudyContext';

interface SpacedRepetitionProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'overview' | 'review' | 'create';

export default function SpacedRepetition({ isOpen, onClose }: SpacedRepetitionProps) {
  const { flashcards, addFlashcard, reviewFlashcard, getDueCards } = useStudy();
  const [view, setView] = useState<View>('overview');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });

  const dueCards = getDueCards();
  const cardsToReview = view === 'review' ? dueCards : [];

  const currentCard = cardsToReview[currentCardIndex];

  const handleRating = useCallback((quality: number) => {
    if (!currentCard) return;

    reviewFlashcard(currentCard.id, quality);
    setShowAnswer(false);

    if (currentCardIndex < cardsToReview.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      // Review session complete
      setView('overview');
      setCurrentCardIndex(0);
    }
  }, [currentCard, currentCardIndex, cardsToReview.length, reviewFlashcard]);

  const handleAddCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;

    addFlashcard({
      front: newCard.front,
      back: newCard.back,
      moduleId: 'module-1',
      lessonId: 'lesson-1',
      difficulty: 3,
    });

    setNewCard({ front: '', back: '' });
  };

  const startReview = () => {
    if (dueCards.length === 0) return;
    setView('review');
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Spaced Repetition</h2>
              <p className="text-white/70 text-sm">Flashcard review system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {view !== 'review' && (
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setView('overview')}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors',
                view === 'overview'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setView('create')}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors',
                view === 'create'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Create Cards
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'overview' && (
            <OverviewView
              totalCards={flashcards.length}
              dueCards={dueCards.length}
              onStartReview={startReview}
              cards={flashcards}
            />
          )}

          {view === 'create' && (
            <CreateView
              newCard={newCard}
              setNewCard={setNewCard}
              onAddCard={handleAddCard}
              existingCards={flashcards}
            />
          )}

          {view === 'review' && currentCard && (
            <ReviewView
              card={currentCard}
              showAnswer={showAnswer}
              onShowAnswer={() => setShowAnswer(true)}
              onRating={handleRating}
              currentIndex={currentCardIndex}
              totalCards={cardsToReview.length}
              onBack={() => {
                setView('overview');
                setCurrentCardIndex(0);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewView({
  totalCards,
  dueCards,
  onStartReview,
  cards,
}: {
  totalCards: number;
  dueCards: number;
  onStartReview: () => void;
  cards: SpacedRepetitionCard[];
}) {
  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{totalCards}</p>
          <p className="text-sm text-gray-600">Total Cards</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{dueCards}</p>
          <p className="text-sm text-gray-600">Due Today</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{totalCards - dueCards}</p>
          <p className="text-sm text-gray-600">Mastered</p>
        </div>
      </div>

      {/* Start Review Button */}
      <button
        onClick={onStartReview}
        disabled={dueCards === 0}
        className={cn(
          'w-full py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-3',
          dueCards > 0
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        )}
      >
        <Brain className="w-6 h-6" />
        {dueCards > 0 ? `Start Review (${dueCards} cards)` : 'No cards due for review'}
      </button>

      {/* Card Preview List */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">Your Flashcards</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {card.front}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>
                  Next review: {new Date(card.nextReview).toLocaleDateString()}
                </span>
                <span>Interval: {card.interval} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateView({
  newCard,
  setNewCard,
  onAddCard,
  existingCards,
}: {
  newCard: { front: string; back: string };
  setNewCard: (card: { front: string; back: string }) => void;
  onAddCard: () => void;
  existingCards: SpacedRepetitionCard[];
}) {
  return (
    <div>
      {/* Create Form */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Flashcard
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question (Front)
            </label>
            <textarea
              value={newCard.front}
              onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
              placeholder="Enter the question..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer (Back)
            </label>
            <textarea
              value={newCard.back}
              onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
              placeholder="Enter the answer..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={onAddCard}
            disabled={!newCard.front.trim() || !newCard.back.trim()}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors font-medium"
          >
            Add Flashcard
          </button>
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">AI Suggestion</p>
            <p className="text-sm text-amber-700 mt-1">
              Based on your recent quiz results, consider creating flashcards for:
              VNet Peering, NSG Rules, and Load Balancer types.
            </p>
          </div>
        </div>
      </div>

      {/* Existing Cards Count */}
      <p className="text-center text-sm text-gray-500 mt-4">
        You have {existingCards.length} flashcards in your collection
      </p>
    </div>
  );
}

function ReviewView({
  card,
  showAnswer,
  onShowAnswer,
  onRating,
  currentIndex,
  totalCards,
  onBack,
}: {
  card: SpacedRepetitionCard;
  showAnswer: boolean;
  onShowAnswer: () => void;
  onRating: (quality: number) => void;
  currentIndex: number;
  totalCards: number;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Progress */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
          Exit Review
        </button>
        <span className="text-sm text-gray-500">
          Card {currentIndex + 1} of {totalCards}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
        <div
          className="h-full bg-purple-600 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className={cn(
          'w-full max-w-md aspect-[4/3] rounded-2xl shadow-lg transition-all duration-500 cursor-pointer',
          showAnswer
            ? 'bg-gradient-to-br from-green-100 to-emerald-100'
            : 'bg-gradient-to-br from-purple-100 to-indigo-100'
        )}
        onClick={() => !showAnswer && onShowAnswer()}
      >
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          {!showAnswer ? (
            <>
              <p className="text-xs text-purple-600 font-medium mb-2">QUESTION</p>
              <p className="text-lg font-medium text-gray-900">{card.front}</p>
              <p className="text-sm text-purple-600 mt-6">Tap to reveal answer</p>
            </>
          ) : (
            <>
              <p className="text-xs text-green-600 font-medium mb-2">ANSWER</p>
              <p className="text-lg text-gray-900">{card.back}</p>
            </>
          )}
        </div>
      </div>

      {/* Rating Buttons */}
      {showAnswer && (
        <div className="mt-8 w-full max-w-md">
          <p className="text-center text-sm text-gray-600 mb-4">
            How well did you know this?
          </p>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => onRating(1)}
              className="py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Again
            </button>
            <button
              onClick={() => onRating(2)}
              className="py-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
            >
              Hard
            </button>
            <button
              onClick={() => onRating(4)}
              className="py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Good
            </button>
            <button
              onClick={() => onRating(5)}
              className="py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              Easy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
