
import React from 'react';
import { Button } from './ui/button';
import { Plus, Save, Folder, Pencil, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

export interface SavedConversation {
  id: string;
  title: string;
  messages: any[];
  savedAt: string;
}

interface ConversationControlsProps {
  onNewConversation: () => void;
  onSaveConversation: (title?: string) => void;
  onLoadConversation: (conversation: SavedConversation) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  currentMessages: any[];
  savedConversations: SavedConversation[];
}

const ConversationControls: React.FC<ConversationControlsProps> = ({
  onNewConversation,
  onSaveConversation,
  onLoadConversation,
  onRenameConversation,
  onDeleteConversation,
  currentMessages,
  savedConversations
}) => {
  const handleRename = (id: string) => {
    const conversation = savedConversations.find(c => c.id === id);
    if (!conversation) return;
    
    const newTitle = prompt('Enter new name:', conversation.title);
    if (newTitle && newTitle.trim() !== '') {
      onRenameConversation(id, newTitle.trim());
    }
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      onDeleteConversation(id);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 my-2">
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
        onClick={() => onSaveConversation()}
        className="gap-1.5"
        disabled={currentMessages.length === 0}
      >
        <Save size={16} />
        <span>Save AMAA</span>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1.5"
            disabled={savedConversations.length === 0}
          >
            <Folder size={16} />
            <span>Load AMAA</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border shadow-md">
          {savedConversations.length === 0 ? (
            <DropdownMenuItem disabled>No saved conversations</DropdownMenuItem>
          ) : (
            savedConversations.map((conversation) => (
              <DropdownMenuItem key={conversation.id} className="flex items-center justify-between py-2">
                <span 
                  className="flex-grow truncate hover:cursor-pointer" 
                  onClick={() => onLoadConversation(conversation)}
                >
                  {conversation.title}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(conversation.id);
                    }}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive hover:text-destructive/90" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(conversation.id);
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ConversationControls;
