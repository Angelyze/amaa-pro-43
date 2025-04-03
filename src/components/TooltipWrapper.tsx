
import React from 'react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface TooltipWrapperProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ 
  content, 
  children, 
  side = 'top',
  align = 'center',
  delayDuration = 300,
  className
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align} 
          className={className}
          avoidCollisions={true}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipWrapper;
