import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', animated = true, showText = true }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-lg' },
    md: { container: 'w-10 h-10', text: 'text-xl' },
    lg: { container: 'w-16 h-16', text: 'text-3xl' },
    xl: { container: 'w-24 h-24', text: 'text-5xl' }
  };

  const { container, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Animated Logo Container */}
      <div className={`${container} relative ${animated ? 'group' : ''}`}>
        {/* Pulse rings animation */}
        {animated && (
          <>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 animate-ping" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-30 animate-pulse" />
          </>
        )}
        
        {/* Main logo */}
        <div className={`relative ${container} bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-xl shadow-lg ${animated ? 'group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300' : ''} flex items-center justify-center overflow-hidden`}>
          {/* Shimmer effect */}
          {animated && (
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
          )}
          
          {/* Pulse wave SVG */}
          <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 40 40" fill="none">
            <path 
              d="M 4 20 L 8 20 L 11 14 L 14 26 L 17 12 L 20 20 L 23 18 L 26 22 L 29 19 L 32 20 L 36 20" 
              stroke="rgba(255,255,255,0.4)" 
              strokeWidth="1.5" 
              fill="none" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className={animated ? 'animate-pulse' : ''}
            />
          </svg>
          
          {/* Letter S */}
          <span className="relative text-white font-bold" style={{ fontSize: size === 'xl' ? '3rem' : size === 'lg' ? '2rem' : size === 'md' ? '1.5rem' : '1.25rem' }}>
            S
          </span>
        </div>
      </div>

      {/* Brand text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${text} font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent`}>
            SQLPulse
          </span>
          {size === 'xl' && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">
              Real-time SQL Management
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
