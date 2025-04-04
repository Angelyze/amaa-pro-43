import React from 'react';
import { 
  Tooltip, 
  TooltipContent, 
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
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        <span className="inline-block">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        align={align} 
        className={className}
        sideOffset={5}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipWrapper;
