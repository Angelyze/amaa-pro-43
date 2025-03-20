
import React from 'react';
import { Button } from './ui/button';
import { Plus, Save, Folder } from 'lucide-react';

interface ConversationControlsProps {
  onNewConversation: () => void;
  onSaveConversation: () => void;
  onLoadConversation: () => void;
}

const ConversationControls: React.FC<ConversationControlsProps> = ({
  onNewConversation,
  onSaveConversation,
  onLoadConversation
}) => {
  return (
    <div className="flex items-center justify-center gap-2 my-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onNewConversation}
        className="gap-1.5"
      >
        <Plus size={16} />
        <span>New AMAA</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSaveConversation}
        className="gap-1.5"
      >
        <Save size={16} />
        <span>Save</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onLoadConversation}
        className="gap-1.5"
      >
        <Folder size={16} />
        <span>Load AMAA</span>
      </Button>
    </div>
  );
};

export default ConversationControls;
