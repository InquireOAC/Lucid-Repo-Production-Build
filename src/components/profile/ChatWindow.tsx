import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDreamSelector, setShowDreamSelector] = useState(false);
  const navigate = useNavigate();

  // Always keep the view scrolled to bottom when messages change
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleShareDream = (dreamId: string) => {
    onSend(`[SHARED_DREAM:${dreamId}]`);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={
        {
          // Fallbacks if not defined globally
          // @ts-ignore
          "--tabbar-h": "56px",
          "--chat-input-h": "72px",
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 p-4 backdrop-blur-xl bg-background/95 rounded-xl border border-white/10 shadow-lg m-4 mb-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/10">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full flex items-center justify-center">
            <span className="text-white/90 font-medium text-xs">
              {(selectedConversation.display_name || selectedConversation.username)?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => navigate(`/profile/${selectedConversation.username || selectedConversation.id}`)}
            className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer text-left"
          >
            {selectedConversation.display_name || selectedConversation.username}
          </button>
        </div>
      </div>

      {/* Messages Area (true flex scroller) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          ref={scrollerRef}
          className="h-full overflow-y-auto mx-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            // keep last bubble above composer + tab bar + safe area
            paddingBottom: `calc(var(--tabbar-h) + var(--chat-input-h) + env(safe-area-inset-bottom, 0px) + 16px)`,
          }}
        >
          <div className="space-y-3 p-4">
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.sender_id === user?.id
                      ? "bg-gradient-to-br from-purple-900/60 to-purple-700/80 text-white backdrop-blur-lg border border-purple-300/20"
                      : "bg-gradient-to-br from-blue-900/60 to-cyan-700/80 text-white backdrop-blur-lg border border-blue-300/20"
                  } rounded-2xl overflow-hidden`}
                >
                  {message.content.startsWith("[SHARED_DREAM:") ? (
                    <div className="p-3">
                      <p className="text-xs opacity-70 mb-2">
                        {message.sender_id === user?.id ? "You" : "They"} shared a dream
                      </p>
                      <SharedDreamCard
                        dreamId={message.content.match(/\[SHARED_DREAM:([^\]]+)\]/)?.[1] || ""}
                      />
                      <p className="text-xs opacity-70 mt-2">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3">
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
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
      </div>

      {/* Fixed Composer (pinned above tab bar) */}
      <div
        className="fixed inset-x-0 z-20"
        style={{
          bottom: `calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div className="mx-4 mb-2 backdrop-blur-xl bg-background/95 rounded-xl p-3 border border-white/10 shadow-lg">
          <div className="flex gap-2 items-center" style={{ height: "var(--chat-input-h)" }}>
            <Button
              onClick={() => setShowDreamSelector(true)}
              size="icon"
              variant="ghost"
              className="hover:bg-white/10 text-muted-foreground hover:text-foreground"
            >
              <Share className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !loading && newMessage.trim()) {
                  e.preventDefault();
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
