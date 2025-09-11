
import React from "react";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: any[];
  onSelectConversation: (user: any) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation
}) => {
  const formatLastMessageTime = (timestamp: string | null) => {
    if (!timestamp) return "New";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: false });
    } catch (error) {
      return "New";
    }
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-purple-300" />
        </div>
        <h3 className="font-semibold mb-2 text-foreground text-lg">No conversations yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Connect with other dreamers to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation: any, index: number) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-all duration-200 active:scale-[0.98]"
        >
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full flex items-center justify-center">
              <span className="text-white/90 font-semibold text-base">
                {(conversation.display_name || conversation.username)?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            {/* Online indicator - you can conditionally show this */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="font-semibold text-foreground truncate text-base">
                {conversation.display_name || conversation.username}
              </h4>
              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                {formatLastMessageTime(conversation.last_message_time)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {conversation.last_message || "Tap to start chatting"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
