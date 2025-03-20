
import React, { useState, useEffect } from 'react';
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
}

const ConversationControls: React.FC<ConversationControlsProps> = ({
  onNewConversation,
  onSaveConversation,
  onLoadConversation,
  onRenameConversation,
  onDeleteConversation,
  currentMessages
}) => {
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  
  useEffect(() => {
    // Load saved conversations from localStorage
    const saved = localStorage.getItem('savedConversations');
    if (saved) {
      try {
        const parsedConversations = JSON.parse(saved);
        setSavedConversations(parsedConversations);
      } catch (error) {
        console.error('Error parsing saved conversations:', error);
      }
    }
  }, []);
  
  const handleRename = (id: string) => {
    const conversation = savedConversations.find(c => c.id === id);
    if (!conversation) return;
    
    const newTitle = prompt('Enter new name:', conversation.title);
    if (newTitle && newTitle.trim() !== '') {
      onRenameConversation(id, newTitle.trim());
      
      // Update local state
      const updated = savedConversations.map(c => 
        c.id === id ? { ...c, title: newTitle.trim() } : c
      );
      setSavedConversations(updated);
      localStorage.setItem('savedConversations', JSON.stringify(updated));
    }
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      onDeleteConversation(id);
      
      // Update local state
      const updated = savedConversations.filter(c => c.id !== id);
      setSavedConversations(updated);
      localStorage.setItem('savedConversations', JSON.stringify(updated));
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
