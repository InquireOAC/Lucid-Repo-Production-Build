import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Share } from "lucide-react";
import DreamShareSelector from "./DreamShareSelector";
import SharedDreamCard from "./SharedDreamCard";

interface ChatWindowProps {
  selectedConversation: any;
  messages: any[];
  user: any;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  loading: boolean;
  onBack: () => void;
  onSend: (customMessage?: string) => void;
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
  const [showDreamSelector, setShowDreamSelector] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleShareDream = (dreamId: string) => {
    // Send message with shared dream
    onSend(`[SHARED_DREAM:${dreamId}]`);
  };

  return (
    <div className="flex flex-col h-full">
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
          <button 
            onClick={() => window.location.href = `/profile/${selectedConversation.username || selectedConversation.id}`}
            className="font-medium text-white/90 hover:text-white transition-colors cursor-pointer text-left"
          >
            {selectedConversation.display_name || selectedConversation.username}
          </button>
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
                className={`max-w-[80%] ${
                  message.sender_id === user?.id
                    ? "bg-gradient-to-br from-purple-500/80 to-pink-500/80 text-white backdrop-blur-sm border border-white/20"
                    : "glass-card border-white/10 text-white/90"
                } rounded-2xl overflow-hidden`}
              >
                {/* Check if message contains shared dream */}
                {message.content.startsWith('[SHARED_DREAM:') ? (
                  <div className="p-3">
                    <p className="text-xs opacity-70 mb-2">
                      {message.sender_id === user?.id ? "You" : "They"} shared a dream
                    </p>
                    <SharedDreamCard 
                      dreamId={message.content.match(/\[SHARED_DREAM:([^\]]+)\]/)?.[1] || ''}
                    />
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="p-3">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="glass-card rounded-xl p-3 border-white/10">
        <div className="flex gap-2">
          <Button
            onClick={() => setShowDreamSelector(true)}
            size="icon"
            variant="ghost"
            className="hover:bg-white/10 text-white/70"
          >
            <Share className="h-4 w-4" />
          </Button>
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
            onClick={() => onSend()}
            disabled={loading || !newMessage.trim()}
            size="icon"
            className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-white/20 text-white shadow-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dream Share Selector */}
      <DreamShareSelector
        isOpen={showDreamSelector}
        onClose={() => setShowDreamSelector(false)}
        onSelectDream={handleShareDream}
      />
    </div>
  );
};

export default ChatWindow;