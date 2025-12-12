'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap, Award, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGamification } from '@/context/GamificationContext';

export default function CelebrationOverlay() {
  const { showCelebration, celebrationData, dismissCelebration } = useGamification();
  const [confetti, setConfetti] = useState<{ id: number; x: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (showCelebration) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'][
          Math.floor(Math.random() * 6)
        ],
      }));
      setConfetti(particles);
    }
  }, [showCelebration]);

  if (!showCelebration || !celebrationData) return null;

  const getContent = () => {
    switch (celebrationData.type) {
      case 'level':
        const levelData = celebrationData.data as { level: number; title: string; badge: string };
        return {
          icon: <Trophy className="w-12 h-12 text-amber-500" />,
          title: 'Level Up!',
          subtitle: `You reached Level ${levelData.level}`,
          detail: `${levelData.badge} ${levelData.title}`,
          color: 'from-amber-500 to-orange-500',
        };
      case 'achievement':
        const achievementData = celebrationData.data as { icon: string; title: string; xpReward: number };
        return {
          icon: <Award className="w-12 h-12 text-purple-500" />,
          title: 'Achievement Unlocked!',
          subtitle: achievementData.title,
          detail: (
            <span className="flex items-center gap-1 justify-center">
              <Zap className="w-4 h-4 text-amber-500" />
              +{achievementData.xpReward} XP
            </span>
          ),
          color: 'from-purple-500 to-indigo-500',
          emoji: achievementData.icon,
        };
      case 'xp':
        const xpData = celebrationData.data as { amount: number; reason: string };
        return {
          icon: <Star className="w-12 h-12 text-cyan-500" />,
          title: `+${xpData.amount} XP`,
          subtitle: xpData.reason,
          detail: null,
          color: 'from-cyan-500 to-blue-500',
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      onClick={dismissCelebration}
    >
      {/* Confetti */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 w-3 h-3 rounded-sm animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Celebration Card */}
      <div className="relative animate-celebration-pop pointer-events-auto">
        {/* Glow effect */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r blur-3xl opacity-30',
            content.color
          )}
        />

        <div className="relative bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm mx-4">
          {/* Sparkles */}
          <div className="absolute -top-4 -right-4">
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -left-2">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>

          {/* Icon */}
          <div className="mb-4 flex justify-center">
            {'emoji' in content && content.emoji ? (
              <span className="text-6xl">{content.emoji}</span>
            ) : (
              <div className={cn('w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br', content.color)}>
                <div className="text-white">{content.icon}</div>
              </div>
            )}
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{content.title}</h2>
          <p className="text-gray-600 mb-2">{content.subtitle}</p>
          {content.detail && (
            <p className="text-lg font-semibold text-gray-800">{content.detail}</p>
          )}

          {/* Dismiss hint */}
          <p className="text-xs text-gray-400 mt-4">Click anywhere to dismiss</p>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes celebration-pop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-confetti {
          animation: confetti-fall 3s ease-in-out forwards;
        }

        .animate-celebration-pop {
          animation: celebration-pop 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
