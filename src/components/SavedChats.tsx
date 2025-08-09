
import React from 'react';
import { useSavedChats } from './saved-chats/useSavedChats';
import SavedChatsHeader from './saved-chats/SavedChatsHeader';
import LoadingState from './saved-chats/LoadingState';
import EmptyChatsState from './saved-chats/EmptyChatsState';
import SavedChatCard from './saved-chats/SavedChatCard';

interface SavedSession {
  id: string;
  expert_type: string;
  messages: Array<{
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>;
  created_at: string;
}

interface SavedChatsProps {
  onBack: () => void;
  onOpenSession: (session: SavedSession) => void;
}

const SavedChats = ({ onBack, onOpenSession }: SavedChatsProps) => {
  const { sessions, isLoading, deletingId, deleteSession } = useSavedChats();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen starry-background p-4">
      <div className="max-w-4xl mx-auto">
        <SavedChatsHeader onBack={onBack} sessionCount={sessions.length} />

        {sessions.length === 0 ? (
          <EmptyChatsState />
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <SavedChatCard
                key={session.id}
                session={session}
                onOpenSession={onOpenSession}
                onDeleteSession={deleteSession}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedChats;
