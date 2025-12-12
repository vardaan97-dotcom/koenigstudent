'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Bookmark {
  id: string;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  timestamp: number; // video timestamp in seconds
  note?: string;
  createdAt: Date;
  tags: string[];
}

export interface Note {
  id: string;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  type: 'pomodoro' | 'free' | 'exam_prep';
  focusMinutes: number;
  breakMinutes: number;
  completed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: 'study' | 'quiz' | 'exam' | 'live_session' | 'deadline';
  startDate: Date;
  endDate?: Date;
  reminder?: number; // minutes before
  recurring?: 'daily' | 'weekly' | 'none';
  color: string;
}

export interface SpacedRepetitionCard {
  id: string;
  front: string;
  back: string;
  moduleId: string;
  lessonId: string;
  difficulty: number; // 1-5
  nextReview: Date;
  interval: number; // days
  easeFactor: number;
  repetitions: number;
}

interface StudyContextType {
  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeNote: (id: string) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;

  // Focus Mode
  isFocusMode: boolean;
  currentSession: StudySession | null;
  startFocusMode: (type: 'pomodoro' | 'free', focusMinutes?: number) => void;
  endFocusMode: () => void;
  pomodoroCount: number;

  // Calendar
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  removeCalendarEvent: (id: string) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;

  // Spaced Repetition
  flashcards: SpacedRepetitionCard[];
  addFlashcard: (card: Omit<SpacedRepetitionCard, 'id' | 'nextReview' | 'interval' | 'easeFactor' | 'repetitions'>) => void;
  reviewFlashcard: (id: string, quality: number) => void; // quality 0-5
  getDueCards: () => SpacedRepetitionCard[];

  // Learning Preferences
  learningPreferences: {
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
    learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
    dailyGoalMinutes: number;
    preferredSessionLength: number;
    enableNotifications: boolean;
    darkMode: boolean;
  };
  updateLearningPreferences: (updates: Partial<StudyContextType['learningPreferences']>) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([
    {
      id: '1',
      lessonId: 'lesson-1',
      lessonTitle: 'Introduction to Azure',
      moduleTitle: 'Azure Fundamentals',
      timestamp: 120,
      note: 'Important: Azure subscription types',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['important', 'subscription'],
    },
    {
      id: '2',
      lessonId: 'lesson-3',
      lessonTitle: 'Virtual Networks',
      moduleTitle: 'Azure Networking',
      timestamp: 345,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['networking'],
    },
  ]);

  // Notes
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      lessonId: 'lesson-1',
      lessonTitle: 'Introduction to Azure',
      moduleTitle: 'Azure Fundamentals',
      content: 'Azure has 3 main subscription types: Free, Pay-As-You-Go, and Enterprise Agreement. Remember the differences for the exam!',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      color: 'yellow',
    },
  ]);

  // Focus Mode
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [pomodoroCount, setPomodoroCount] = useState(3); // Demo value

  // Calendar Events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Azure Fundamentals Study',
      description: 'Complete Module 1 lessons',
      type: 'study',
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      color: '#0891b2',
    },
    {
      id: '2',
      title: 'Practice Quiz',
      description: 'Module 1 assessment',
      type: 'quiz',
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      color: '#7c3aed',
    },
    {
      id: '3',
      title: 'AZ-104 Certification Exam',
      description: 'Final certification exam',
      type: 'exam',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      reminder: 60 * 24, // 1 day before
      color: '#dc2626',
    },
  ]);

  // Spaced Repetition
  const [flashcards, setFlashcards] = useState<SpacedRepetitionCard[]>([
    {
      id: '1',
      front: 'What is Azure Resource Manager (ARM)?',
      back: 'ARM is the deployment and management service for Azure. It provides a management layer that enables you to create, update, and delete resources.',
      moduleId: 'module-1',
      lessonId: 'lesson-1',
      difficulty: 3,
      nextReview: new Date(),
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
    },
    {
      id: '2',
      front: 'What are the 3 types of Azure subscriptions?',
      back: 'Free (with $200 credit), Pay-As-You-Go (usage-based), and Enterprise Agreement (for large organizations)',
      moduleId: 'module-1',
      lessonId: 'lesson-1',
      difficulty: 2,
      nextReview: new Date(),
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
    },
  ]);

  // Learning Preferences
  const [learningPreferences, setLearningPreferences] = useState<{
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
    learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
    dailyGoalMinutes: number;
    preferredSessionLength: number;
    enableNotifications: boolean;
    darkMode: boolean;
  }>({
    preferredStudyTime: 'morning',
    learningStyle: 'visual',
    dailyGoalMinutes: 60,
    preferredSessionLength: 25,
    enableNotifications: true,
    darkMode: false,
  });

  // Bookmark functions
  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    setBookmarks((prev) => [
      ...prev,
      { ...bookmark, id: crypto.randomUUID(), createdAt: new Date() },
    ]);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const updateBookmark = useCallback((id: string, updates: Partial<Bookmark>) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  // Note functions
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    setNotes((prev) => [
      ...prev,
      { ...note, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
    ]);
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n))
    );
  }, []);

  // Focus Mode functions
  const startFocusMode = useCallback((type: 'pomodoro' | 'free', focusMinutes = 25) => {
    setIsFocusMode(true);
    setCurrentSession({
      id: crypto.randomUUID(),
      startTime: new Date(),
      type,
      focusMinutes,
      breakMinutes: type === 'pomodoro' ? 5 : 0,
      completed: false,
    });
  }, []);

  const endFocusMode = useCallback(() => {
    setIsFocusMode(false);
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        endTime: new Date(),
        completed: true,
      });
      if (currentSession.type === 'pomodoro') {
        setPomodoroCount((prev) => prev + 1);
      }
    }
    setCurrentSession(null);
  }, [currentSession]);

  // Calendar functions
  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    setCalendarEvents((prev) => [
      ...prev,
      { ...event, id: crypto.randomUUID() },
    ]);
  }, []);

  const removeCalendarEvent = useCallback((id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  // Spaced Repetition functions (SM-2 algorithm)
  const addFlashcard = useCallback((card: Omit<SpacedRepetitionCard, 'id' | 'nextReview' | 'interval' | 'easeFactor' | 'repetitions'>) => {
    setFlashcards((prev) => [
      ...prev,
      {
        ...card,
        id: crypto.randomUUID(),
        nextReview: new Date(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      },
    ]);
  }, []);

  const reviewFlashcard = useCallback((id: string, quality: number) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;

        // SM-2 algorithm
        let { easeFactor, interval, repetitions } = card;

        if (quality >= 3) {
          if (repetitions === 0) {
            interval = 1;
          } else if (repetitions === 1) {
            interval = 6;
          } else {
            interval = Math.round(interval * easeFactor);
          }
          repetitions++;
        } else {
          repetitions = 0;
          interval = 1;
        }

        easeFactor = Math.max(
          1.3,
          easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        return { ...card, easeFactor, interval, repetitions, nextReview };
      })
    );
  }, []);

  const getDueCards = useCallback(() => {
    const now = new Date();
    return flashcards.filter((card) => card.nextReview <= now);
  }, [flashcards]);

  // Learning Preferences
  const updateLearningPreferences = useCallback((updates: Partial<StudyContextType['learningPreferences']>) => {
    setLearningPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <StudyContext.Provider
      value={{
        bookmarks,
        addBookmark,
        removeBookmark,
        updateBookmark,
        notes,
        addNote,
        removeNote,
        updateNote,
        isFocusMode,
        currentSession,
        startFocusMode,
        endFocusMode,
        pomodoroCount,
        calendarEvents,
        addCalendarEvent,
        removeCalendarEvent,
        updateCalendarEvent,
        flashcards,
        addFlashcard,
        reviewFlashcard,
        getDueCards,
        learningPreferences,
        updateLearningPreferences,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
