'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutAction {
  key: string;
  description: string;
  modifiers?: ('ctrl' | 'shift' | 'alt')[];
}

const shortcuts: { category: string; actions: ShortcutAction[] }[] = [
  {
    category: 'Navigation',
    actions: [
      { key: 'j', description: 'Next lesson' },
      { key: 'k', description: 'Previous lesson' },
      { key: 'h', description: 'Go to home/dashboard' },
      { key: 'n', description: 'Next module' },
      { key: 'p', description: 'Previous module' },
    ],
  },
  {
    category: 'Video Controls',
    actions: [
      { key: 'Space', description: 'Play/Pause video' },
      { key: '→', description: 'Skip forward 10 seconds' },
      { key: '←', description: 'Skip backward 10 seconds' },
      { key: 'f', description: 'Toggle fullscreen' },
      { key: 'm', description: 'Toggle mute' },
      { key: '↑', description: 'Increase volume' },
      { key: '↓', description: 'Decrease volume' },
    ],
  },
  {
    category: 'Study Tools',
    actions: [
      { key: 'b', description: 'Add bookmark', modifiers: ['ctrl'] },
      { key: 'n', description: 'New note', modifiers: ['ctrl'] },
      { key: 'f', description: 'Toggle focus mode', modifiers: ['ctrl'] },
      { key: 'a', description: 'Open AI assistant', modifiers: ['ctrl'] },
      { key: 's', description: 'Open social hub', modifiers: ['ctrl'] },
    ],
  },
  {
    category: 'Quiz',
    actions: [
      { key: '1-4', description: 'Select answer option' },
      { key: 'Enter', description: 'Submit answer' },
      { key: 'n', description: 'Next question' },
      { key: 'r', description: 'Flag question for review' },
    ],
  },
  {
    category: 'General',
    actions: [
      { key: '/', description: 'Open search', modifiers: ['ctrl'] },
      { key: '?', description: 'Show keyboard shortcuts' },
      { key: 'Escape', description: 'Close modal/dialog' },
    ],
  },
];

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  // Global keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === 'Escape' && isOpen) {
        onClose();
        return;
      }

      // Open shortcuts modal with ?
      if (e.key === '?' && !isOpen) {
        e.preventDefault();
        // This would need to be handled by parent component
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-cyan-600" />
            <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((group) => (
              <div key={group.category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {group.category}
                </h3>
                <div className="space-y-2">
                  {group.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm text-gray-700">{action.description}</span>
                      <div className="flex items-center gap-1">
                        {action.modifiers?.map((mod) => (
                          <kbd
                            key={mod}
                            className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600"
                          >
                            {mod === 'ctrl' ? '⌘/Ctrl' : mod.charAt(0).toUpperCase() + mod.slice(1)}
                          </kbd>
                        ))}
                        {action.modifiers && <span className="text-gray-400">+</span>}
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-600">
                          {action.key}
                        </kbd>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            Press <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono mx-1">?</kbd> anytime to show this dialog
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to use keyboard shortcuts throughout the app
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const withCtrl = e.ctrlKey || e.metaKey;
      const withShift = e.shiftKey;

      // Build key combo string
      let combo = '';
      if (withCtrl) combo += 'ctrl+';
      if (withShift) combo += 'shift+';
      combo += key;

      if (shortcuts[combo]) {
        e.preventDefault();
        shortcuts[combo]();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
