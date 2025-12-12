'use client';

import React, { useEffect } from 'react';
import { Construction, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WIPPopupProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function WIPPopup({ isOpen, onClose, featureName = 'This feature' }: WIPPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto animate-bounce-in pointer-events-auto"
        onClick={onClose}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Construction className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Work in Progress</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {featureName} is coming soon!
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
              <Clock className="w-3 h-3" />
              <span>Stay tuned for updates</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes bounce-in {
            0% {
              transform: scale(0.5);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-bounce-in {
            animation: bounce-in 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}

// Hook to easily add WIP functionality to buttons
export function useWIP() {
  const [wipState, setWIPState] = React.useState<{ isOpen: boolean; featureName: string }>({
    isOpen: false,
    featureName: '',
  });

  const showWIP = React.useCallback((featureName: string) => {
    setWIPState({ isOpen: true, featureName });
  }, []);

  const hideWIP = React.useCallback(() => {
    setWIPState({ isOpen: false, featureName: '' });
  }, []);

  return { wipState, showWIP, hideWIP };
}
