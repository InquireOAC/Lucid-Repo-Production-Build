
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
      <Button onClick={onBack} variant="ghost" size="sm" className="mr-3 hover:bg-white/10 text-white/80 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-white/90">Saved Chats</h1>
        <p className="text-white/60 text-sm">
          {sessionCount} {sessionCount === 1 ? 'conversation' : 'conversations'} saved
        </p>
      </div>
    </div>
  );
};

export default SavedChatsHeader;
