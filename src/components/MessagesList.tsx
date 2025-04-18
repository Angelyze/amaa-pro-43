
import React, { useRef, useEffect } from 'react';
import { ExtendedMessage } from '@/services/conversationService';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';

interface MessagesListProps {
  messages: ExtendedMessage[];
  isLoading: boolean;
  onTopicClick: (topic: string) => void;
}

const MessagesList: React.FC<MessagesListProps> = ({ 
  messages, 
  isLoading, 
  onTopicClick 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingIndicatorRef = useRef<HTMLDivElement>(null);
  
  // Scroll to loading indicator when it appears
  useEffect(() => {
    if (isLoading && loadingIndicatorRef.current) {
      loadingIndicatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isLoading]);
  
  // Display messages in reverse order (newest first)
  const displayMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    type: msg.type,
    timestamp: msg.created_at,
    fileData: msg.fileData
  })).reverse();

  return (
    <div id="messages-section" className="w-full mx-auto mt-0 mb-8">
      <div className="space-y-4">
        {isLoading && (
          <div ref={loadingIndicatorRef}>
            <LoadingIndicator />
          </div>
        )}
        
        {displayMessages.map((message) => (
          <div key={message.id}>
            <Message
              content={message.content}
              type={message.type}
              timestamp={message.timestamp}
              fileData={message.fileData}
              onTopicClick={onTopicClick}
            />
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessagesList;
