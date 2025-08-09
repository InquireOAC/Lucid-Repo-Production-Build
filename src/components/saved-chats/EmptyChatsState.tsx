
import React from 'react';
import { MessageCircle } from 'lucide-react';

const EmptyChatsState = () => {
  return (
    <div className="text-center py-16">
      <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="h-10 w-10 text-purple-300" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-white/90">No saved chats yet</h3>
        <p className="text-white/70 max-w-md mx-auto leading-relaxed">
          Start a conversation with an AI dream expert and save it as a session to see it here. 
          Your saved conversations will help you track your dream analysis journey.
        </p>
      </div>
    </div>
  );
};

export default EmptyChatsState;
