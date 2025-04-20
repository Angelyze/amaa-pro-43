
import React from 'react';
import Logo from './Logo';
import AMAAChatBox from './AMAAChatBox';
import ConversationControls from './ConversationControls';
import { SavedConversation } from './ConversationControls';
import { ExtendedMessage } from '@/services/conversationService';
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MainSearchProps {
  onSendMessage: (content: string, type: 'regular' | 'web-search' | 'research') => void;
  onUploadFile: (file: File) => void;
  onVoiceInput: () => void;
  onNewConversation: () => void;
  onSaveConversation: (title?: string) => void;
  onLoadConversation: (conversation: SavedConversation) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  savedConversations: SavedConversation[];
  currentMessages: ExtendedMessage[];
  isDisabled: boolean;
  isPremium: boolean;
  isLoggedIn: boolean;
}

const MainSearch: React.FC<MainSearchProps> = ({
  onSendMessage,
  onUploadFile,
  onVoiceInput,
  onNewConversation,
  onSaveConversation,
  onLoadConversation,
  onRenameConversation,
  onDeleteConversation,
  savedConversations,
  currentMessages,
  isDisabled,
  isPremium,
  isLoggedIn
}) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-6">
      <Logo />
      
      <div className="w-full max-w-3xl mt-8">
        <AMAAChatBox 
          onSendMessage={onSendMessage}
          onUploadFile={onUploadFile}
          onVoiceInput={onVoiceInput}
          disabled={isDisabled}
        />
      </div>
      
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <Info size={12} />
        <span>
          {isLoggedIn ? (
            isPremium ? (
              "You are a Premium user, using the unlimited capabilities of the app."
            ) : (
              <>
                Free users have 10 queries. 
                <Link to="/subscribe" className="text-teal hover:text-teal-light hover:underline mx-1">
                  Go Premium
                </Link> 
                for unlimited access and much more.
              </>
            )
          ) : (
            <>
              Free users have 10 queries. 
              <Link to="/subscribe" className="text-teal hover:text-teal-light hover:underline mx-1">
                Go Premium
              </Link> 
              for unlimited access and much more.
            </>
          )}
        </span>
      </div>

      {isLoggedIn && (
        <ConversationControls 
          onNewConversation={onNewConversation}
          onSaveConversation={onSaveConversation}
          onLoadConversation={onLoadConversation}
          onRenameConversation={onRenameConversation}
          onDeleteConversation={onDeleteConversation}
          savedConversations={savedConversations}
          currentMessages={currentMessages}
        />
      )}
    </div>
  );
};

export default MainSearch;
