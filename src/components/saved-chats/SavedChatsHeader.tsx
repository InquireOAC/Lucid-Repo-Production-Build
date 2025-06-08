
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SavedChatsHeaderProps {
  onBack: () => void;
  sessionCount: number;
}

const SavedChatsHeader = ({ onBack, sessionCount }: SavedChatsHeaderProps) => {
  return (
    <div className="flex items-center mb-8">
      <Button onClick={onBack} variant="ghost" size="sm" className="mr-3 hover:bg-accent">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Saved Chats</h1>
        <p className="text-muted-foreground text-sm">
          {sessionCount} {sessionCount === 1 ? 'conversation' : 'conversations'} saved
        </p>
      </div>
    </div>
  );
};

export default SavedChatsHeader;
