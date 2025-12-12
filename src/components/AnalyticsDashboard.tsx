'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Calendar,
  Award,
  Brain,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock analytics data
const weeklyData = [
  { day: 'Mon', minutes: 45, lessons: 2 },
  { day: 'Tue', minutes: 60, lessons: 3 },
  { day: 'Wed', minutes: 30, lessons: 1 },
  { day: 'Thu', minutes: 90, lessons: 4 },
  { day: 'Fri', minutes: 45, lessons: 2 },
  { day: 'Sat', minutes: 120, lessons: 5 },
  { day: 'Sun', minutes: 75, lessons: 3 },
];

const moduleProgress = [
  { name: 'Azure Identity', progress: 100, score: 92 },
  { name: 'Governance', progress: 85, score: 88 },
  { name: 'Virtual Networking', progress: 60, score: 75 },
  { name: 'Compute Resources', progress: 40, score: null },
  { name: 'Storage', progress: 20, score: null },
];

const strengthsWeaknesses = {
  strengths: ['Identity Management', 'RBAC', 'Resource Groups'],
  weaknesses: ['VNet Peering', 'Load Balancers', 'NSG Rules'],
};

export default function AnalyticsDashboard({ isOpen, onClose }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  const totalMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);
  const totalLessons = weeklyData.reduce((sum, d) => sum + d.lessons, 0);
  const avgMinutesPerDay = Math.round(totalMinutes / 7);
  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Learning Analytics
            </h2>
            <p className="text-white/70 text-sm mt-0.5">Track your learning journey</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="px-6 py-3 border-b border-gray-200 flex gap-2">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-full transition-colors',
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {range === 'week' ? 'This Week' : range === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Clock}
              label="Study Time"
              value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
              subtext="this week"
              color="blue"
            />
            <StatCard
              icon={Target}
              label="Lessons Completed"
              value={totalLessons.toString()}
              subtext="lessons"
              color="green"
            />
            <StatCard
              icon={TrendingUp}
              label="Daily Average"
              value={`${avgMinutesPerDay} min`}
              subtext="per day"
              color="purple"
            />
            <StatCard
              icon={Award}
              label="Quiz Score"
              value="85%"
              subtext="average"
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity Chart */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Weekly Activity
              </h3>
              <div className="flex items-end justify-between h-40 gap-2">
                {weeklyData.map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-t-lg overflow-hidden relative" style={{ height: '120px' }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(day.minutes / maxMinutes) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-indigo-500 rounded" />
                  Minutes studied
                </span>
              </div>
            </div>

            {/* Module Progress */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                Module Progress
              </h3>
              <div className="space-y-4">
                {moduleProgress.map((module, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{module.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{module.progress}%</span>
                        {module.score !== null && (
                          <span className="text-green-600 font-medium">
                            Score: {module.score}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          module.progress === 100
                            ? 'bg-green-500'
                            : module.progress >= 60
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        )}
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Strengths & Areas to Improve
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2">💪 Strengths</h4>
                  <div className="space-y-2">
                    {strengthsWeaknesses.strengths.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-green-100 text-green-700 text-sm px-3 py-1.5 rounded-lg"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-amber-700 mb-2">📚 Need Practice</h4>
                  <div className="space-y-2">
                    {strengthsWeaknesses.weaknesses.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-amber-100 text-amber-700 text-sm px-3 py-1.5 rounded-lg"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Study Recommendations */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Personalized Recommendations
              </h3>
              <div className="space-y-3">
                <RecommendationCard
                  title="Review VNet Peering"
                  description="Based on your quiz results, this topic needs more attention"
                  action="Start Review"
                  priority="high"
                />
                <RecommendationCard
                  title="Take Module 3 Quiz"
                  description="You've completed all lessons in this module"
                  action="Take Quiz"
                  priority="medium"
                />
                <RecommendationCard
                  title="Practice with Flashcards"
                  description="5 cards are due for review today"
                  action="Review Cards"
                  priority="low"
                />
              </div>
            </div>
          </div>

          {/* Learning Goals */}
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
            <h3 className="font-semibold text-gray-900 mb-4">🎯 Weekly Goals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GoalCard
                label="Study Time"
                current={totalMinutes}
                target={300}
                unit="min"
              />
              <GoalCard
                label="Lessons"
                current={totalLessons}
                target={15}
                unit="lessons"
              />
              <GoalCard
                label="Quiz Score"
                current={85}
                target={90}
                unit="%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{subtext}</p>
    </div>
  );
}

function RecommendationCard({
  title,
  description,
  action,
  priority,
}: {
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}) {
  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-green-500',
  };

  return (
    <div className={cn('bg-white rounded-lg p-3 border-l-4 border shadow-sm', priorityColors[priority])}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <button className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
          {action}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function GoalCard({
  label,
  current,
  target,
  unit,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
}) {
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={cn('text-sm font-bold', isComplete ? 'text-green-600' : 'text-gray-900')}>
          {current}/{target} {unit}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isComplete ? 'bg-green-500' : 'bg-indigo-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {isComplete && (
        <p className="text-xs text-green-600 mt-1">✓ Goal achieved!</p>
      )}
    </div>
  );
}
