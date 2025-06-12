import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    return <div className="text-center py-8">
        <MessageSquare className="mx-auto mb-2 text-muted-foreground h-8 w-8" />
        <h3 className="font-medium mb-1">No messages yet</h3>
        <p className="text-sm text-muted-foreground">
          Connect with other dreamers to start chatting
        </p>
      </div>;
  }
  return <div className="space-y-2">
      {conversations.map((conversation: any) => <div key={conversation.id} onClick={() => onSelectConversation(conversation)} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer bg-violet-950">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar_url} />
            <AvatarFallback className="bg-dream-purple/20">
              {conversation.username ? conversation.username[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {conversation.display_name || conversation.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Tap to view conversation
            </p>
          </div>
        </div>)}
    </div>;
};
export default ConversationList;