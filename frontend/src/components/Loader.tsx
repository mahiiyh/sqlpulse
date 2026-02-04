import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', text, fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses} role="status" aria-live="polite" aria-label={text || 'Loading'}>
      <div className="relative">
        {/* Outer rotating ring - blue gradient */}
        <div className={`${sizeClasses[size]} relative`}>
          <svg className="animate-spin" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gradient1)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="70 200"
              className="opacity-75"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Middle pulse ring - cyan */}
        <div className={`absolute inset-0 ${sizeClasses[size]}`}>
          <svg className="animate-ping opacity-50" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="#06B6D4"
              strokeWidth="6"
            />
          </svg>
        </div>

        {/* Center icon - database pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'} text-blue-600 dark:text-cyan-400 animate-pulse`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            />
          </svg>
        </div>
      </div>

      {/* Optional loading text */}
      {text && (
        <div className="mt-6 space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse">
            {text}
          </p>
          {/* Animated dots */}
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loader;
