
import React from "react";
import { MessageSquare } from "lucide-react";

interface ConversationListProps {
  conversations: any[];
  onSelectConversation: (user: any) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation
}) => {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="glass-card rounded-xl p-6 border-white/10">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-purple-300" />
          </div>
          <h3 className="font-semibold mb-2 text-white/90">No messages yet</h3>
          <p className="text-sm text-white/70">
            Connect with other dreamers to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-hide">
      {conversations.map((conversation: any) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className="glass-card rounded-xl p-4 cursor-pointer border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 bg-card/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full flex items-center justify-center">
              <span className="text-white/80 font-medium text-sm">
                {(conversation.display_name || conversation.username)?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-foreground">
                {conversation.display_name || conversation.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">Tap to start chatting</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
