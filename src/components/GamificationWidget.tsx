'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Star,
  Flame,
  Target,
  ChevronRight,
  X,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGamification, type Achievement, type DailyChallenge } from '@/context/GamificationContext';

interface GamificationWidgetProps {
  compact?: boolean;
}

export default function GamificationWidget({ compact = false }: GamificationWidgetProps) {
  const {
    xp,
    level,
    streak,
    achievements,
    unlockedAchievements,
    dailyChallenges,
  } = useGamification();

  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showChallengesModal, setShowChallengesModal] = useState(false);

  const xpProgress = ((xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
  const xpToNextLevel = level.maxXP - xp;

  const completedChallenges = dailyChallenges.filter((c) => c.completed).length;

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        {/* Level Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 rounded-full">
          <span className="text-lg">{level.badge}</span>
          <span className="text-sm font-semibold text-amber-800">Lvl {level.level}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-gray-700">{xp} XP</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 text-sm">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-gray-700">{streak} day streak</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                {level.badge}
              </div>
              <div>
                <p className="text-white/80 text-xs">Level {level.level}</p>
                <p className="text-white font-semibold">{level.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white">
                <Flame className="w-5 h-5" />
                <span className="font-bold text-xl">{streak}</span>
              </div>
              <p className="text-white/80 text-xs">day streak</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1">
              <span>{xp} XP</span>
              <span>{xpToNextLevel} XP to Level {level.level + 1}</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(xpProgress, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Challenges */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-600" />
              Daily Challenges
            </h3>
            <button
              onClick={() => setShowChallengesModal(true)}
              className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {dailyChallenges.slice(0, 2).map((challenge) => (
              <DailyChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs text-gray-500">
              {completedChallenges}/{dailyChallenges.length} completed today
            </span>
          </div>
        </div>

        {/* Achievements */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Recent Achievements
            </h3>
            <button
              onClick={() => setShowAchievementsModal(true)}
              className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              View All ({unlockedAchievements.length}/{achievements.length})
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {unlockedAchievements.slice(0, 5).map((achievement) => (
              <div
                key={achievement.id}
                className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg"
                title={achievement.title}
              >
                {achievement.icon}
              </div>
            ))}
            {achievements.length - unlockedAchievements.length > 0 && (
              <div
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 font-medium"
              >
                +{achievements.length - unlockedAchievements.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <AchievementsModal
          achievements={achievements}
          unlockedIds={unlockedAchievements.map((a) => a.id)}
          onClose={() => setShowAchievementsModal(false)}
        />
      )}

      {/* Challenges Modal */}
      {showChallengesModal && (
        <ChallengesModal
          challenges={dailyChallenges}
          onClose={() => setShowChallengesModal(false)}
        />
      )}
    </>
  );
}

function DailyChallengeCard({ challenge }: { challenge: DailyChallenge }) {
  const progress = (challenge.progress / challenge.target) * 100;

  return (
    <div className={cn(
      'p-3 rounded-xl border transition-all',
      challenge.completed
        ? 'bg-green-50 border-green-200'
        : 'bg-gray-50 border-gray-200'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {challenge.completed ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Target className="w-5 h-5 text-gray-400" />
          )}
          <span className={cn(
            'font-medium text-sm',
            challenge.completed ? 'text-green-700' : 'text-gray-700'
          )}>
            {challenge.title}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Zap className="w-3 h-3 text-amber-500" />
          <span className="text-amber-600 font-medium">+{challenge.xpReward} XP</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              challenge.completed ? 'bg-green-500' : 'bg-cyan-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {challenge.progress}/{challenge.target}
        </span>
      </div>
    </div>
  );
}

function AchievementsModal({
  achievements,
  unlockedIds,
  onClose,
}: {
  achievements: Achievement[];
  unlockedIds: string[];
  onClose: () => void;
}) {
  const categories = ['learning', 'mastery', 'engagement', 'streak', 'social'] as const;
  const categoryNames = {
    learning: 'Learning',
    mastery: 'Mastery',
    engagement: 'Engagement',
    streak: 'Streaks',
    social: 'Social',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Achievements
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <p className="text-sm text-gray-500 mb-6">
            You&apos;ve unlocked {unlockedIds.length} of {achievements.length} achievements
          </p>

          {categories.map((category) => {
            const categoryAchievements = achievements.filter((a) => a.category === category);
            if (categoryAchievements.length === 0) return null;

            return (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {categoryNames[category]}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categoryAchievements.map((achievement) => {
                    const isUnlocked = unlockedIds.includes(achievement.id);
                    return (
                      <div
                        key={achievement.id}
                        className={cn(
                          'p-3 rounded-xl border text-center transition-all',
                          isUnlocked
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        )}
                      >
                        <div className="relative inline-block">
                          <span className="text-3xl">{achievement.icon}</span>
                          {!isUnlocked && (
                            <Lock className="absolute -bottom-1 -right-1 w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className={cn(
                          'text-sm font-medium mt-2',
                          isUnlocked ? 'text-gray-900' : 'text-gray-500'
                        )}>
                          {achievement.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-amber-600">
                          <Zap className="w-3 h-3" />
                          +{achievement.xpReward} XP
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChallengesModal({
  challenges,
  onClose,
}: {
  challenges: DailyChallenge[];
  onClose: () => void;
}) {
  const hoursLeft = Math.floor(
    (challenges[0]?.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-600" />
            Daily Challenges
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-cyan-50 rounded-xl p-3 mb-4 flex items-center justify-between">
            <span className="text-sm text-cyan-700">Time remaining today</span>
            <span className="text-sm font-bold text-cyan-800">{hoursLeft} hours</span>
          </div>

          <div className="space-y-4">
            {challenges.map((challenge) => (
              <DailyChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              New challenges unlock every day at midnight
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
