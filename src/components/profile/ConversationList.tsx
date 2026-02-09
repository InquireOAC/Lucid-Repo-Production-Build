import React from "react";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import SymbolAvatar from "./SymbolAvatar";

interface ConversationListProps {
  conversations: any[];
  onSelectConversation: (user: any) => void;
  isSelectionMode?: boolean;
  selectedConversations?: Set<string>;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  isSelectionMode = false,
  selectedConversations = new Set(),
}) => {
  const formatLastMessageTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: false });
    } catch {
      return "";
    }
  };

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-8">
        <div className="w-20 h-20 border border-border rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground text-base mb-1">No messages yet</h3>
        <p className="text-sm text-muted-foreground text-center">
          Start a conversation from someone's profile
        </p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conversation: any) => {
        const isSelected = selectedConversations.has(conversation.id);
        const displayName = conversation.display_name || conversation.username;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-muted/30 transition-colors ${
              isSelected ? "bg-primary/10" : ""
            }`}
          >
            {isSelectionMode && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelectConversation(conversation)}
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-5 flex-shrink-0"
              />
            )}

            <SymbolAvatar
              symbol={conversation.avatar_symbol}
              color={conversation.avatar_color}
              fallbackLetter={displayName?.charAt(0)?.toUpperCase() || "U"}
              size={56}
              className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground text-sm truncate">
                  {displayName}
                </h4>
                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                  {formatLastMessageTime(conversation.last_message_time)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {conversation.last_message || "Tap to start chatting"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
