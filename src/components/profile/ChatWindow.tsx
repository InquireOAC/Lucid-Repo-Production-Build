
import React, { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatWindowProps {
  selectedConversation: any;
  messages: any[];
  user: any;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  loading: boolean;
  onBack: () => void;
  onSend: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedConversation,
  messages,
  user,
  newMessage,
  setNewMessage,
  loading,
  onBack,
  onSend,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={selectedConversation.avatar_url} />
          <AvatarFallback className="bg-dream-purple/20">
            {selectedConversation.username
              ? selectedConversation.username[0].toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">
          {selectedConversation.display_name || selectedConversation.username}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message: any) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === user?.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender_id === user?.id
                  ? "bg-dream-purple text-white"
                  : "bg-blue-700 dark:bg-blue-700"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) =>
            e.key === "Enter" && onSend()
          }
        />
        <Button
          size="icon"
          onClick={onSend}
          disabled={loading || !newMessage.trim()}
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
