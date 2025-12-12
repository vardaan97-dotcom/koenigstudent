'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Timer,
  X,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Target,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudy } from '@/context/StudyContext';
import { useGamification } from '@/context/GamificationContext';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
}

type TimerState = 'idle' | 'focus' | 'break';

const presetTimes = [
  { label: '15 min', focus: 15, break: 3 },
  { label: '25 min', focus: 25, break: 5 },
  { label: '45 min', focus: 45, break: 10 },
  { label: '60 min', focus: 60, break: 15 },
];

export default function FocusMode({ isOpen, onClose }: FocusModeProps) {
  const { startFocusMode, endFocusMode, pomodoroCount } = useStudy();
  const { addXP, unlockAchievement } = useGamification();

  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [selectedPreset, setSelectedPreset] = useState(1); // 25 min default
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const currentPreset = presetTimes[selectedPreset];
  const totalTime = timerState === 'break' ? currentPreset.break * 60 : currentPreset.focus * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playSound = useCallback((type: 'complete' | 'tick') => {
    if (!soundEnabled) return;
    // In a real app, play actual sounds here
    console.log(`Playing ${type} sound`);
  }, [soundEnabled]);

  const handleComplete = useCallback(() => {
    playSound('complete');

    if (timerState === 'focus') {
      // Completed a focus session
      setCompletedSessions((prev) => prev + 1);
      endFocusMode();
      addXP(25, 'Completed Pomodoro session');

      // Check for achievements
      if (completedSessions + 1 >= 5) {
        unlockAchievement('focus_master');
      }

      // Start break
      setTimerState('break');
      setTimeLeft(currentPreset.break * 60);
      setIsRunning(true);
    } else if (timerState === 'break') {
      // Break complete, ready for next focus
      setTimerState('idle');
      setTimeLeft(currentPreset.focus * 60);
      setIsRunning(false);
    }
  }, [timerState, currentPreset, playSound, endFocusMode, addXP, completedSessions, unlockAchievement]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleComplete]);

  const startTimer = () => {
    if (timerState === 'idle') {
      setTimerState('focus');
      startFocusMode('pomodoro', currentPreset.focus);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimerState('idle');
    setTimeLeft(currentPreset.focus * 60);
    endFocusMode();
  };

  const changePreset = (index: number) => {
    setSelectedPreset(index);
    setTimeLeft(presetTimes[index].focus * 60);
    setTimerState('idle');
    setIsRunning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Focus Mode</h2>
              <p className="text-white/70 text-xs">Pomodoro Timer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Sound Effects</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  soundEnabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
                )}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="px-6 py-8">
          {/* Session type indicator */}
          <div className="flex justify-center mb-6">
            <div
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium',
                timerState === 'break'
                  ? 'bg-green-100 text-green-700'
                  : timerState === 'focus'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {timerState === 'break' ? (
                <span className="flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  Break Time
                </span>
              ) : timerState === 'focus' ? (
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Focus Session
                </span>
              ) : (
                'Ready to Focus'
              )}
            </div>
          </div>

          {/* Circular Progress */}
          <div className="relative w-56 h-56 mx-auto mb-6">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="112"
                cy="112"
                r="100"
                stroke={timerState === 'break' ? '#10b981' : '#6366f1'}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                className="transition-all duration-1000"
              />
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-gray-900 tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                {timerState === 'break' ? 'remaining break' : 'remaining focus'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={resetTimer}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-6 h-6 text-gray-500" />
            </button>

            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg',
                timerState === 'break'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              )}
            >
              {isRunning ? (
                <Pause className="w-7 h-7 text-white" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1" />
              )}
            </button>

            <div className="w-12" /> {/* Spacer for symmetry */}
          </div>

          {/* Preset Selection */}
          {timerState === 'idle' && (
            <div className="flex justify-center gap-2 mb-6">
              {presetTimes.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => changePreset(idx)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    selectedPreset === idx
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Session Stats */}
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">{completedSessions}</span>
              </div>
              <p className="text-xs text-gray-500">Today&apos;s Sessions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Target className="w-5 h-5 text-indigo-500" />
                <span className="text-2xl font-bold text-gray-900">{pomodoroCount}</span>
              </div>
              <p className="text-xs text-gray-500">Total Sessions</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="px-6 py-4 bg-indigo-50 border-t border-indigo-100">
          <p className="text-xs text-indigo-700 text-center">
            💡 Tip: During focus time, minimize distractions by closing other tabs and silencing notifications.
          </p>
        </div>
      </div>
    </div>
  );
}
