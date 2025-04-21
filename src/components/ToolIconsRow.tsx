import React from 'react';
import { Upload, TestTube, Code, Globe, Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type Tool =
  | 'upload'
  | 'research'
  | 'code'
  | 'web-search'
  | 'regular';

interface ToolIconsRowProps {
  disabled: boolean;
  activeOption: Tool;
  setActiveOption: (tool: Tool) => void;
  triggerFileUpload: () => void;
}

const toolConfig: Array<
  | { type: 'upload'; icon: React.ReactNode; label: string }
  | { type: 'research'; icon: React.ReactNode; label: string }
  | { type: 'code'; icon: React.ReactNode; label: string }
  | { type: 'web-search'; icon: React.ReactNode; label: string }
  | { type: 'regular'; icon: React.ReactNode; label: string }
> = [
  {
    type: 'upload',
    icon: <Upload size={18} />,
    label: 'Upload file',
  },
  {
    type: 'research',
    icon: <TestTube size={18} />,
    label: 'Research',
  },
  {
    type: 'code',
    icon: <Code size={18} />,
    label: 'Coding AI',
  },
  {
    type: 'web-search',
    icon: <Globe size={18} />,
    label: 'Web search',
  },
  {
    type: 'regular',
    icon: <Bot size={18} />,
    label: 'AMAA',
  },
];

const ToolIconsRow: React.FC<ToolIconsRowProps> = ({
  disabled,
  activeOption,
  setActiveOption,
  triggerFileUpload,
}) => {
  return (
    <div className="flex gap-1.5 justify-end">
      {toolConfig.map((tool) => (
        <Tooltip key={tool.type}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                if (disabled) return;
                if (tool.type === 'upload') {
                  triggerFileUpload();
                } else {
                  setActiveOption(tool.type as Tool);
                }
              }}
              disabled={disabled}
              className={`p-1.5 transition-colors focus:outline-none rounded amaa-chatbox-icon ${
                disabled
                  ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                  : activeOption === tool.type
                  ? 'text-teal'
                  : 'text-muted-foreground hover:text-teal'
              }`}
              aria-label={tool.label}
            >
              {tool.icon}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tool.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ToolIconsRow;
