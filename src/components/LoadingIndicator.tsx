
import React from 'react';

interface LoadingIndicatorProps {
  text?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ text = 'Thinking...' }) => {
  return (
    <div className="flex items-center justify-center w-full mb-4 transition-all duration-500 animate-fade-in">
      <div className="assistant-message flex items-center justify-center">
        <div className="flex space-x-2 items-center">
          <div className="text-sm text-muted-foreground">{text}</div>
          <div className="flex space-x-1">
            <div className="h-2 w-2 rounded-full bg-teal animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 rounded-full bg-teal animate-pulse" style={{ animationDelay: '300ms' }}></div>
            <div className="h-2 w-2 rounded-full bg-teal animate-pulse" style={{ animationDelay: '600ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
