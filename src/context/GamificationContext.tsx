'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'engagement' | 'social' | 'streak' | 'mastery';
  xpReward: number;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'quiz' | 'practice' | 'social';
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  expiresAt: Date;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  badge: string;
}

const levels: LevelInfo[] = [
  { level: 1, title: 'Novice Learner', minXP: 0, maxXP: 100, badge: '🌱' },
  { level: 2, title: 'Curious Student', minXP: 100, maxXP: 300, badge: '📚' },
  { level: 3, title: 'Active Learner', minXP: 300, maxXP: 600, badge: '⭐' },
  { level: 4, title: 'Knowledge Seeker', minXP: 600, maxXP: 1000, badge: '🎯' },
  { level: 5, title: 'Dedicated Scholar', minXP: 1000, maxXP: 1500, badge: '🏆' },
  { level: 6, title: 'Expert Learner', minXP: 1500, maxXP: 2200, badge: '💎' },
  { level: 7, title: 'Master Student', minXP: 2200, maxXP: 3000, badge: '🔥' },
  { level: 8, title: 'Knowledge Master', minXP: 3000, maxXP: 4000, badge: '👑' },
  { level: 9, title: 'Grand Scholar', minXP: 4000, maxXP: 5500, badge: '🌟' },
  { level: 10, title: 'Legendary Learner', minXP: 5500, maxXP: Infinity, badge: '🦄' },
];

const allAchievements: Achievement[] = [
  // Learning achievements
  { id: 'first_lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '👣', category: 'learning', xpReward: 50 },
  { id: 'five_lessons', title: 'Getting Started', description: 'Complete 5 lessons', icon: '📖', category: 'learning', xpReward: 100, target: 5 },
  { id: 'twenty_lessons', title: 'Bookworm', description: 'Complete 20 lessons', icon: '📚', category: 'learning', xpReward: 300, target: 20 },
  { id: 'first_module', title: 'Module Master', description: 'Complete your first module', icon: '🎓', category: 'learning', xpReward: 150 },
  { id: 'all_modules', title: 'Course Champion', description: 'Complete all modules', icon: '🏅', category: 'learning', xpReward: 500 },

  // Quiz achievements
  { id: 'first_quiz', title: 'Quiz Taker', description: 'Complete your first quiz', icon: '❓', category: 'mastery', xpReward: 50 },
  { id: 'perfect_quiz', title: 'Perfect Score', description: 'Get 100% on a quiz', icon: '💯', category: 'mastery', xpReward: 200 },
  { id: 'quiz_streak', title: 'Quiz Streak', description: 'Pass 5 quizzes in a row', icon: '🔥', category: 'mastery', xpReward: 300, target: 5 },

  // Engagement achievements
  { id: 'early_bird', title: 'Early Bird', description: 'Study before 7 AM', icon: '🌅', category: 'engagement', xpReward: 75 },
  { id: 'night_owl', title: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', category: 'engagement', xpReward: 75 },
  { id: 'weekend_warrior', title: 'Weekend Warrior', description: 'Study on both Saturday and Sunday', icon: '⚔️', category: 'engagement', xpReward: 100 },
  { id: 'focus_master', title: 'Focus Master', description: 'Complete 5 Pomodoro sessions', icon: '🎯', category: 'engagement', xpReward: 150, target: 5 },

  // Streak achievements
  { id: 'three_day_streak', title: 'Three Day Streak', description: 'Study for 3 consecutive days', icon: '🔥', category: 'streak', xpReward: 100, target: 3 },
  { id: 'week_streak', title: 'Week Warrior', description: 'Study for 7 consecutive days', icon: '📅', category: 'streak', xpReward: 250, target: 7 },
  { id: 'month_streak', title: 'Monthly Master', description: 'Study for 30 consecutive days', icon: '📆', category: 'streak', xpReward: 1000, target: 30 },

  // Social achievements
  { id: 'first_bookmark', title: 'Bookmarker', description: 'Create your first bookmark', icon: '🔖', category: 'social', xpReward: 25 },
  { id: 'first_note', title: 'Note Taker', description: 'Create your first note', icon: '📝', category: 'social', xpReward: 25 },
  { id: 'first_question', title: 'Curious Mind', description: 'Ask your first question', icon: '💭', category: 'social', xpReward: 50 },
  { id: 'helpful_answer', title: 'Helpful Hand', description: 'Get your answer upvoted', icon: '👍', category: 'social', xpReward: 75 },
  { id: 'study_group_join', title: 'Team Player', description: 'Join a study group', icon: '👥', category: 'social', xpReward: 50 },
];

interface GamificationContextType {
  xp: number;
  level: LevelInfo;
  streak: number;
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  addXP: (amount: number, reason: string) => void;
  unlockAchievement: (achievementId: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  checkAndUnlockAchievements: () => void;
  xpHistory: { amount: number; reason: string; timestamp: Date }[];
  showCelebration: boolean;
  celebrationData: { type: 'xp' | 'achievement' | 'level'; data: unknown } | null;
  dismissCelebration: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [xp, setXP] = useState(450); // Starting with some XP for demo
  const [streak, setStreak] = useState(5); // 5 day streak for demo
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([
    'first_lesson', 'first_quiz', 'three_day_streak', 'first_bookmark'
  ]);
  const [xpHistory, setXPHistory] = useState<{ amount: number; reason: string; timestamp: Date }[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ type: 'xp' | 'achievement' | 'level'; data: unknown } | null>(null);

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([
    {
      id: 'daily_video',
      title: 'Video Watcher',
      description: 'Watch 2 lesson videos',
      type: 'video',
      xpReward: 50,
      progress: 1,
      target: 2,
      completed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: 'daily_quiz',
      title: 'Quiz Champion',
      description: 'Complete 1 practice quiz',
      type: 'quiz',
      xpReward: 75,
      progress: 0,
      target: 1,
      completed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: 'daily_practice',
      title: 'Practice Makes Perfect',
      description: 'Answer 10 practice questions',
      type: 'practice',
      xpReward: 60,
      progress: 4,
      target: 10,
      completed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  ]);

  const getCurrentLevel = useCallback((currentXP: number): LevelInfo => {
    for (let i = levels.length - 1; i >= 0; i--) {
      if (currentXP >= levels[i].minXP) {
        return levels[i];
      }
    }
    return levels[0];
  }, []);

  const [level, setLevel] = useState<LevelInfo>(() => getCurrentLevel(xp));

  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
    setCelebrationData(null);
  }, []);

  const addXP = useCallback((amount: number, reason: string) => {
    setXP((prev) => {
      const newXP = prev + amount;
      const oldLevel = getCurrentLevel(prev);
      const newLevel = getCurrentLevel(newXP);

      // Check for level up
      if (newLevel.level > oldLevel.level) {
        setLevel(newLevel);
        setCelebrationData({ type: 'level', data: newLevel });
        setShowCelebration(true);
      } else {
        setCelebrationData({ type: 'xp', data: { amount, reason } });
        setShowCelebration(true);
      }

      return newXP;
    });

    setXPHistory((prev) => [...prev, { amount, reason, timestamp: new Date() }]);
  }, [getCurrentLevel]);

  const unlockAchievement = useCallback((achievementId: string) => {
    if (unlockedAchievementIds.includes(achievementId)) return;

    const achievement = allAchievements.find((a) => a.id === achievementId);
    if (!achievement) return;

    setUnlockedAchievementIds((prev) => [...prev, achievementId]);
    setCelebrationData({ type: 'achievement', data: achievement });
    setShowCelebration(true);

    // Award XP for achievement
    addXP(achievement.xpReward, `Achievement: ${achievement.title}`);
  }, [unlockedAchievementIds, addXP]);

  const updateChallengeProgress = useCallback((challengeId: string, progress: number) => {
    setDailyChallenges((prev) =>
      prev.map((challenge) => {
        if (challenge.id === challengeId) {
          const newProgress = Math.min(progress, challenge.target);
          const completed = newProgress >= challenge.target;

          if (completed && !challenge.completed) {
            // Award XP for completing challenge
            addXP(challenge.xpReward, `Daily Challenge: ${challenge.title}`);
          }

          return { ...challenge, progress: newProgress, completed };
        }
        return challenge;
      })
    );
  }, [addXP]);

  const checkAndUnlockAchievements = useCallback(() => {
    // This would check various conditions and unlock achievements
    // For demo, we'll leave this as a placeholder
  }, []);

  const unlockedAchievements = allAchievements.filter((a) =>
    unlockedAchievementIds.includes(a.id)
  ).map((a) => ({ ...a, unlockedAt: new Date() }));

  useEffect(() => {
    // Auto-dismiss celebration after 3 seconds
    if (showCelebration) {
      const timer = setTimeout(() => {
        dismissCelebration();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, dismissCelebration]);

  return (
    <GamificationContext.Provider
      value={{
        xp,
        level,
        streak,
        achievements: allAchievements,
        unlockedAchievements,
        dailyChallenges,
        addXP,
        unlockAchievement,
        updateChallengeProgress,
        checkAndUnlockAchievements,
        xpHistory,
        showCelebration,
        celebrationData,
        dismissCelebration,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}
