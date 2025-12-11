'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Award,
  BookOpen,
  Timer,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';

interface QubitsPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  moduleTitle: string;
  onComplete: (score: number, totalTime: number, results: QuestionResult[]) => void;
}

interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  selectedAnswers: string[];
  correctAnswers: string[];
  timeSpent: number;
}

type TestPhase = 'intro' | 'test' | 'review' | 'results';

export default function QubitsPracticeModal({
  isOpen,
  onClose,
  questions,
  moduleTitle,
  onComplete,
}: QubitsPracticeModalProps) {
  const [phase, setPhase] = useState<TestPhase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [lastTimestamp, setLastTimestamp] = useState(Date.now());
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    if (phase !== 'test') return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Track time per question
  useEffect(() => {
    if (phase !== 'test') return;

    const now = Date.now();
    const timeDiff = Math.floor((now - lastTimestamp) / 1000);

    if (timeDiff > 0 && currentQuestion) {
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeDiff,
      }));
    }

    setLastTimestamp(now);
  }, [currentIndex, phase, currentQuestion, lastTimestamp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionId: string) => {
    if (phase === 'review') return;

    const question = currentQuestion;
    if (!question) return;

    setAnswers((prev) => {
      const current = prev[question.id] || [];

      if (question.questionType === 'single' || question.questionType === 'true_false') {
        return { ...prev, [question.id]: [optionId] };
      } else {
        // Multiple selection
        if (current.includes(optionId)) {
          return { ...prev, [question.id]: current.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [question.id]: [...current, optionId] };
        }
      }
    });
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
      setShowExplanation(false);
    }
  };

  const calculateResults = useCallback(() => {
    const questionResults: QuestionResult[] = questions.map((q) => {
      const selected = answers[q.id] || [];
      const correct = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      const isCorrect =
        selected.length === correct.length &&
        selected.every((s) => correct.includes(s));

      return {
        questionId: q.id,
        isCorrect,
        selectedAnswers: selected,
        correctAnswers: correct,
        timeSpent: questionTimes[q.id] || 0,
      };
    });

    const correctCount = questionResults.filter((r) => r.isCorrect).length;
    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    setResults(questionResults);
    setScore(finalScore);

    return { questionResults, finalScore };
  }, [questions, answers, questionTimes, totalQuestions]);

  const handleSubmit = () => {
    const { questionResults, finalScore } = calculateResults();
    onComplete(finalScore, timeElapsed, questionResults);
    setPhase('results');
  };

  const handleReview = () => {
    setCurrentIndex(0);
    setPhase('review');
  };

  const handleRetry = () => {
    setPhase('intro');
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedQuestions(new Set());
    setTimeElapsed(0);
    setQuestionTimes({});
    setResults([]);
    setScore(0);
    setShowExplanation(false);
  };

  if (!isOpen) return null;

  // Intro Screen
  if (phase === 'intro') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl overflow-hidden w-full max-w-xl shadow-2xl">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">Qubits Practice Test</h2>
            <p className="text-cyan-100">{moduleTitle}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
                  <p className="text-sm text-gray-500">Questions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Timer className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">No Limit</p>
                  <p className="text-sm text-gray-500">Time</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Answer all questions to the best of your ability</span>
                </li>
                <li className="flex items-start gap-2">
                  <Flag className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Flag questions you want to review later</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>You need 70% or higher to pass</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setPhase('test');
                  setLastTimestamp(Date.now());
                }}
                className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (phase === 'results') {
    const passed = score >= 70;
    const correctCount = results.filter((r) => r.isCorrect).length;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl overflow-hidden w-full max-w-xl shadow-2xl">
          <div
            className={cn(
              'p-8 text-center',
              passed
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-amber-500 to-orange-600'
            )}
          >
            <div
              className={cn(
                'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
                passed ? 'bg-white/20' : 'bg-white/20'
              )}
            >
              {passed ? (
                <Award className="w-10 h-10 text-white" />
              ) : (
                <AlertCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-white/80">
              {passed
                ? 'You passed the practice test!'
                : "You didn't pass this time, but don't give up!"}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">{score}%</p>
                <p className="text-sm text-gray-500">Score</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-green-600">{correctCount}</p>
                <p className="text-sm text-gray-500">Correct</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">{formatTime(timeElapsed)}</p>
                <p className="text-sm text-gray-500">Time</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReview}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Review Answers
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-3 px-4 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Back to Qubits
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Test or Review Screen
  const questionResult = results.find((r) => r.questionId === currentQuestion?.id);
  const selectedAnswers = answers[currentQuestion?.id] || [];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">{moduleTitle}</p>
              <p className="font-semibold">
                Question {currentIndex + 1} of {totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {phase === 'test' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(timeElapsed)}</span>
                </div>
              )}
              {phase === 'review' && (
                <span className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium">
                  Review Mode
                </span>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100 flex-shrink-0">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentQuestion && (
            <div>
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {currentQuestion.questionType === 'multiple' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                        Select All That Apply
                      </span>
                    )}
                    {phase === 'review' && questionResult && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          questionResult.isCorrect
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {questionResult.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentQuestion.questionText}
                  </h3>
                </div>
                {phase === 'test' && (
                  <button
                    onClick={toggleFlag}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      flaggedQuestions.has(currentQuestion.id)
                        ? 'bg-amber-100 text-amber-600'
                        : 'text-gray-400 hover:bg-gray-100'
                    )}
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswers.includes(option.id);
                  const isCorrect = option.isCorrect;
                  const showCorrectness = phase === 'review';

                  let optionStyle = 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50';
                  if (isSelected && !showCorrectness) {
                    optionStyle = 'border-cyan-500 bg-cyan-50';
                  }
                  if (showCorrectness) {
                    if (isCorrect) {
                      optionStyle = 'border-green-500 bg-green-50';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-red-500 bg-red-50';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id)}
                      disabled={phase === 'review'}
                      className={cn(
                        'w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                        optionStyle,
                        phase === 'review' && 'cursor-default'
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                          isSelected && !showCorrectness && 'border-cyan-500 bg-cyan-500',
                          showCorrectness && isCorrect && 'border-green-500 bg-green-500',
                          showCorrectness && isSelected && !isCorrect && 'border-red-500 bg-red-500',
                          !isSelected && !showCorrectness && 'border-gray-300'
                        )}
                      >
                        {showCorrectness && isCorrect && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                        {showCorrectness && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-white" />
                        )}
                        {isSelected && !showCorrectness && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-gray-700',
                          showCorrectness && isCorrect && 'text-green-700 font-medium',
                          showCorrectness && isSelected && !isCorrect && 'text-red-700'
                        )}
                      >
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Review Mode) */}
              {phase === 'review' && currentQuestion.explanation && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-cyan-600 font-medium text-sm hover:text-cyan-700"
                  >
                    {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                  </button>
                  {showExplanation && (
                    <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Question Navigator */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex flex-wrap gap-2 mb-4 max-h-20 overflow-y-auto">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id]?.length > 0;
              const isFlagged = flaggedQuestions.has(q.id);
              const isCurrent = idx === currentIndex;
              const result = results.find((r) => r.questionId === q.id);

              let btnStyle = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
              if (isCurrent) {
                btnStyle = 'bg-cyan-600 text-white';
              } else if (phase === 'review' && result) {
                btnStyle = result.isCorrect
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700';
              } else if (isAnswered) {
                btnStyle = 'bg-cyan-100 text-cyan-700';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => goToQuestion(idx)}
                  className={cn(
                    'relative w-9 h-9 rounded-lg font-medium text-sm transition-colors',
                    btnStyle
                  )}
                >
                  {idx + 1}
                  {isFlagged && phase === 'test' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => goToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                currentIndex === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              {phase === 'test' && (
                <>
                  {answeredCount} of {totalQuestions} answered
                  {flaggedQuestions.size > 0 && (
                    <span className="ml-2 text-amber-600">
                      ({flaggedQuestions.size} flagged)
                    </span>
                  )}
                </>
              )}
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => goToQuestion(currentIndex + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : phase === 'test' ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Submit Test
                <CheckCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
              >
                Finish Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
