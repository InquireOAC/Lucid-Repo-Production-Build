
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";

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
      {/* Header */}
      <div className="flex items-center gap-3 p-4 glass-card rounded-xl mb-3 border-white/10">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/10">
          <ArrowLeft className="h-4 w-4 text-white/80" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full flex items-center justify-center">
            <span className="text-white/80 font-medium text-xs">
              {(selectedConversation.display_name || selectedConversation.username)?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <h3 className="font-medium text-white/90">
            {selectedConversation.display_name || selectedConversation.username}
          </h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-1 mb-4 scrollbar-hide">
        <div className="space-y-3 pr-3">
          {messages.map((message: any) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender_id === user?.id
                    ? "bg-gradient-to-br from-purple-500/80 to-pink-500/80 text-white backdrop-blur-sm border border-white/20"
                    : "glass-card border-white/10 text-white/90"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="glass-card rounded-xl p-3 border-white/10">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border-white/20 text-white/90 placeholder:text-white/50 focus:border-white/40 focus:bg-white/10"
            onKeyPress={(e) => {
              if (e.key === "Enter" && !loading && newMessage.trim()) {
                onSend();
              }
            }}
          />
          <Button
            onClick={onSend}
            disabled={loading || !newMessage.trim()}
            size="icon"
            className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-white/20 text-white shadow-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
