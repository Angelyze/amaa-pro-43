
import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: 'default' | 'large';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'default' }) => {
  // For large size, we'll use explicit width/height settings with !important to ensure they're applied
  const isLarge = size === 'large';
  
  return (
    <div className={cn(
      "flex flex-col items-center", 
      isLarge ? "w-[600px] min-w-[600px]" : "",
      className
    )}>
      <img 
        src="/AMAA.png" 
        alt="AMAA" 
        className={cn(
          isLarge ? "w-[600px] min-w-[600px] h-auto" : "h-16 md:h-24"
        )} 
        style={isLarge ? { width: '600px', minWidth: '600px' } : undefined}
      />
    </div>
  );
};

export default Logo;
