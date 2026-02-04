/**
 * Keyboard Shortcuts Hook
 * Provides application-wide keyboard shortcuts for power users
 */

import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  global?: boolean;
}

const shortcuts: ShortcutConfig[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Quick search / Command palette',
    action: () => {
      // Open search modal
      const event = new CustomEvent('openSearch');
      window.dispatchEvent(event);
    },
    global: true
  },
  {
    key: 'n',
    ctrl: true,
    description: 'New query',
    action: () => {
      window.location.href = '/queries/new';
    },
    global: true
  },
  {
    key: 's',
    ctrl: true,
    description: 'Save current item',
    action: () => {
      const event = new CustomEvent('saveShortcut');
      window.dispatchEvent(event);
    }
  },
  {
    key: 'e',
    ctrl: true,
    shift: true,
    description: 'Execute query',
    action: () => {
      const event = new CustomEvent('executeQuery');
      window.dispatchEvent(event);
    }
  },
  {
    key: '/',
    ctrl: false,
    description: 'Focus search',
    action: () => {
      const searchInput = document.querySelector<HTMLInputElement>('input[type="search"]');
      searchInput?.focus();
    },
    global: true
  }
];

export const useKeyboardShortcuts = (enabled = true) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs (except for global shortcuts)
    const target = event.target as HTMLElement;
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || 
                     target.isContentEditable;

    for (const shortcut of shortcuts) {
      if (isTyping && !shortcut.global) continue;

      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      
      if (event.key.toLowerCase() === shortcut.key && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
};

// Keyboard Shortcuts Help Modal Component
export const KeyboardShortcutsHelp = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
              <span className="text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.ctrl && (
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                    {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                  </kbd>
                )}
                {shortcut.shift && (
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                    Shift
                  </kbd>
                )}
                {shortcut.alt && (
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                    Alt
                  </kbd>
                )}
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                  {shortcut.key.toUpperCase()}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
};

export default useKeyboardShortcuts;
