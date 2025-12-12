'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileQuestion,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Target,
  Brain,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Flag,
  ChevronLeft,
  Lightbulb,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamPrepProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'simulator' | 'weak_areas' | 'checklist';
type SimulatorState = 'setup' | 'exam' | 'results';

interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const mockExamQuestions: ExamQuestion[] = [
  {
    id: '1',
    question: 'Which Azure service provides identity and access management in the cloud?',
    options: ['Azure Kubernetes Service', 'Azure Active Directory', 'Azure Storage', 'Azure Functions'],
    correctAnswer: 1,
    explanation: 'Azure Active Directory (Azure AD) is Microsoft\'s cloud-based identity and access management service.',
    topic: 'Identity',
    difficulty: 'easy',
  },
  {
    id: '2',
    question: 'What is the maximum number of Azure subscriptions that can trust a single Azure AD tenant?',
    options: ['1', '10', '100', 'Unlimited'],
    correctAnswer: 3,
    explanation: 'An Azure AD tenant can be trusted by unlimited Azure subscriptions, but each subscription can only trust one Azure AD tenant.',
    topic: 'Governance',
    difficulty: 'medium',
  },
  {
    id: '3',
    question: 'Which RBAC role allows full access to manage all resources but cannot grant access to others?',
    options: ['Owner', 'Contributor', 'Reader', 'User Access Administrator'],
    correctAnswer: 1,
    explanation: 'The Contributor role can create and manage all types of Azure resources but cannot grant access to others.',
    topic: 'Identity',
    difficulty: 'easy',
  },
  {
    id: '4',
    question: 'What is VNet peering used for?',
    options: ['Encrypting data at rest', 'Connecting two virtual networks', 'Backing up VMs', 'Monitoring network traffic'],
    correctAnswer: 1,
    explanation: 'VNet peering connects two virtual networks, enabling resources in either VNet to communicate with each other.',
    topic: 'Networking',
    difficulty: 'easy',
  },
  {
    id: '5',
    question: 'Which Azure storage redundancy option provides the highest durability?',
    options: ['LRS', 'ZRS', 'GRS', 'GZRS'],
    correctAnswer: 3,
    explanation: 'GZRS (Geo-zone-redundant storage) combines ZRS with GRS, providing the highest durability.',
    topic: 'Storage',
    difficulty: 'medium',
  },
];

const weakAreas = [
  { topic: 'VNet Peering', score: 45, questions: 8, improvement: '+5%' },
  { topic: 'NSG Rules', score: 52, questions: 6, improvement: '+12%' },
  { topic: 'Load Balancers', score: 58, questions: 5, improvement: '+8%' },
  { topic: 'Storage Replication', score: 62, questions: 7, improvement: '+3%' },
];

const examChecklist = [
  { id: '1', text: 'Review all five exam domains', completed: true },
  { id: '2', text: 'Complete at least 3 full practice exams', completed: true },
  { id: '3', text: 'Score 80%+ on practice exams consistently', completed: false },
  { id: '4', text: 'Review weak areas identified by practice tests', completed: false },
  { id: '5', text: 'Review official Microsoft Learn modules', completed: true },
  { id: '6', text: 'Hands-on practice with Azure portal', completed: true },
  { id: '7', text: 'Memorize key CLI and PowerShell commands', completed: false },
  { id: '8', text: 'Rest well the night before the exam', completed: false },
  { id: '9', text: 'Prepare valid ID for exam day', completed: false },
  { id: '10', text: 'Arrive 15 minutes early to testing center', completed: false },
];

export default function ExamPrep({ isOpen, onClose }: ExamPrepProps) {
  const [activeTab, setActiveTab] = useState<Tab>('simulator');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-600 to-orange-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Exam Preparation</h2>
              <p className="text-white/70 text-sm">AZ-104 Azure Administrator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('simulator')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'simulator'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <FileQuestion className="w-4 h-4" />
            Exam Simulator
          </button>
          <button
            onClick={() => setActiveTab('weak_areas')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'weak_areas'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Target className="w-4 h-4" />
            Weak Area Drills
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={cn(
              'flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'checklist'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            Exam Day Checklist
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'simulator' && <ExamSimulator questions={mockExamQuestions} />}
          {activeTab === 'weak_areas' && <WeakAreaDrills areas={weakAreas} />}
          {activeTab === 'checklist' && <ExamChecklist items={examChecklist} />}
        </div>
      </div>
    </div>
  );
}

function ExamSimulator({ questions }: { questions: ExamQuestion[] }) {
  const [state, setState] = useState<SimulatorState>('setup');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (state !== 'exam' || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setState('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlagged(newFlagged);
  };

  const submitExam = () => {
    setState('results');
  };

  const restartExam = () => {
    setState('setup');
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(null));
    setFlagged(new Set());
    setTimeLeft(30 * 60);
    setIsPaused(false);
  };

  if (state === 'setup') {
    return (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Practice Exam</h3>
          <p className="text-gray-600 mb-6">
            Simulate real exam conditions with timed questions
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Questions</p>
                <p className="font-semibold text-gray-900">{questions.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Time Limit</p>
                <p className="font-semibold text-gray-900">30 minutes</p>
              </div>
              <div>
                <p className="text-gray-500">Passing Score</p>
                <p className="font-semibold text-gray-900">70%</p>
              </div>
              <div>
                <p className="text-gray-500">Difficulty</p>
                <p className="font-semibold text-gray-900">Mixed</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setState('exam')}
            className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (state === 'results') {
    const correctCount = answers.filter((a, i) => a === questions[i].correctAnswer).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;

    return (
      <div className="p-8">
        <div className="text-center mb-8">
          <div
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4',
              passed ? 'bg-green-100' : 'bg-red-100'
            )}
          >
            {passed ? (
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-red-600" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h3>
          <p className="text-gray-600 mt-1">
            {passed
              ? 'You passed the practice exam!'
              : 'You need 70% to pass. Review the questions below.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{score}%</p>
            <p className="text-sm text-gray-500">Score</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{correctCount}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-red-600">
              {questions.length - correctCount}
            </p>
            <p className="text-sm text-gray-500">Incorrect</p>
          </div>
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
          {questions.map((q, idx) => {
            const isCorrect = answers[idx] === q.correctAnswer;
            return (
              <div
                key={q.id}
                className={cn(
                  'p-4 rounded-xl border',
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                )}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <X className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{q.question}</p>
                    {!isCorrect && (
                      <p className="text-sm text-gray-600 mt-1">
                        Correct: {q.options[q.correctAnswer]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={restartExam}
          className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="flex flex-col h-full">
      {/* Timer and Controls */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span
              className={cn(
                'font-mono text-lg font-semibold',
                timeLeft < 300 ? 'text-red-600' : 'text-gray-700'
              )}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-gray-600" />
            ) : (
              <Pause className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <button
            onClick={toggleFlag}
            className={cn(
              'p-2 rounded-lg transition-colors',
              flagged.has(currentQuestion)
                ? 'bg-amber-100 text-amber-600'
                : 'hover:bg-gray-200 text-gray-500'
            )}
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              question.difficulty === 'easy'
                ? 'bg-green-100 text-green-700'
                : question.difficulty === 'medium'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            )}
          >
            {question.difficulty}
          </span>
          <span className="text-xs text-gray-500">{question.topic}</span>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-6">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={cn(
                'w-full text-left p-4 rounded-xl border-2 transition-all',
                answers[currentQuestion] === idx
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium',
                    answers[currentQuestion] === idx
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-gray-300 text-gray-500'
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-gray-700">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                  currentQuestion === idx
                    ? 'bg-red-600 text-white'
                    : answers[idx] !== null
                    ? 'bg-gray-300 text-gray-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                  flagged.has(idx) && 'ring-2 ring-amber-400'
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={submitExam}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WeakAreaDrills({ areas }: { areas: typeof weakAreas }) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Focus on Your Weak Areas</h3>
        <p className="text-gray-600">
          These topics need more practice based on your quiz and exam results.
        </p>
      </div>

      <div className="space-y-4">
        {areas.map((area, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{area.topic}</h4>
                <p className="text-sm text-gray-500">{area.questions} practice questions available</p>
              </div>
              <div className="text-right">
                <p className={cn(
                  'text-2xl font-bold',
                  area.score >= 60 ? 'text-amber-600' : 'text-red-600'
                )}>
                  {area.score}%
                </p>
                <p className="text-xs text-green-600">{area.improvement} this week</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full mb-3">
              <div
                className={cn(
                  'h-full rounded-full',
                  area.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${area.score}%` }}
              />
            </div>
            <button className="w-full py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Brain className="w-4 h-4" />
              Practice This Topic
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Pro Tip</p>
            <p className="text-sm text-blue-700 mt-1">
              Focus on one weak area at a time. Complete at least 20 practice questions
              before moving to the next topic for better retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamChecklist({ items }: { items: typeof examChecklist }) {
  const [checklist, setChecklist] = useState(items);

  const toggleItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter(i => i.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Exam Day Checklist</h3>
        <p className="text-gray-600">
          Make sure you&apos;ve completed everything before your exam.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900">Preparation Progress</span>
          <span className="font-bold text-red-600">{completedCount}/{checklist.length}</span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
              item.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200 hover:border-gray-300'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                item.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300'
              )}
            >
              {item.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <span
              className={cn(
                'flex-1',
                item.completed ? 'text-green-700 line-through' : 'text-gray-700'
              )}
            >
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
