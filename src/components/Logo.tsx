
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
      size === 'large' && "w-[600px]", 
      className
    )}>
      <img 
        src="/AMAA.png" 
        alt="AMAA" 
        className={cn(
          "h-16 md:h-24", 
          size === 'large' && "w-[600px] h-auto object-contain"
        )} 
      />
    </div>
  );
};

export default Logo;
