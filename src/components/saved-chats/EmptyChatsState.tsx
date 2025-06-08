
import React from 'react';
import { MessageCircle } from 'lucide-react';

const EmptyChatsState = () => {
  return (
    <div className="text-center py-16">
      <div className="bg-muted/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <MessageCircle className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-3">No saved chats yet</h3>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
        Start a conversation with an AI dream expert and save it as a session to see it here. 
        Your saved conversations will help you track your dream analysis journey.
      </p>
    </div>
  );
};

export default EmptyChatsState;
