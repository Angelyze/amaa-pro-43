
import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: 'default' | 'large';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'default' }) => {
  return (
    <div className={cn(
      "flex flex-col items-center",
      size === 'large' ? "w-full max-w-[600px] px-4" : "",
      className
    )}>
      <img 
        src="/AMAA.png" 
        alt="AMAA" 
        className={cn(
          "w-full h-auto",
          size === 'large' ? "max-w-[600px]" : "h-16 md:h-24"
        )}
      />
    </div>
  );
};

export default Logo;
