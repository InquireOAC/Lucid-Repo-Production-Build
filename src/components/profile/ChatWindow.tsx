import React, { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DreamShareSelector from "./DreamShareSelector";
import SharedDreamCard from "./SharedDreamCard";
import SymbolAvatar from "./SymbolAvatar";

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

// Group messages by time gaps (5 min threshold)
function groupMessages(messages: any[]) {
  const groups: { date: string; messages: any[] }[] = [];
  let currentGroup: any[] = [];
  let lastTime: Date | null = null;
  let lastDate = "";

  for (const msg of messages) {
    const msgDate = new Date(msg.created_at);
    const dateStr = msgDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const timeDiff = lastTime ? (msgDate.getTime() - lastTime.getTime()) / 60000 : Infinity;

    if (dateStr !== lastDate || timeDiff > 30) {
      if (currentGroup.length > 0) {
        groups.push({ date: lastDate, messages: currentGroup });
      }
      currentGroup = [msg];
      lastDate = dateStr;
    } else {
      currentGroup.push(msg);
    }
    lastTime = msgDate;
  }
  if (currentGroup.length > 0) {
    groups.push({ date: lastDate, messages: currentGroup });
  }
  return groups;
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showDreamSelector, setShowDreamSelector] = useState(false);
  const navigate = useNavigate();

  const messageGroups = useMemo(() => groupMessages(messages), [messages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleShareDream = (dreamId: string) => {
    onSend(`[SHARED_DREAM:${dreamId}]`);
  };

  const displayName = selectedConversation.display_name || selectedConversation.username;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 h-14 border-b border-border bg-background/95 backdrop-blur-xl">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <button
          onClick={() => navigate(`/profile/${selectedConversation.username || selectedConversation.id}`)}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <SymbolAvatar
            symbol={selectedConversation.avatar_symbol}
            color={selectedConversation.avatar_color}
            fallbackLetter={displayName?.charAt(0)?.toUpperCase() || "U"}
            size={32}
          />
          <div className="text-left min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
          </div>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}
      >
        {messageGroups.map((group, gi) => (
          <div key={gi}>
            {/* Time separator */}
            <div className="flex justify-center my-4">
              <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>

            {group.messages.map((message: any, mi: number) => {
              const isMine = message.sender_id === user?.id;
              const isSharedDream = message.content.startsWith("[SHARED_DREAM:");
              const prev = group.messages[mi - 1];
              const showAvatar = !isMine && (!prev || prev.sender_id !== message.sender_id);
              const isLastInGroup = !group.messages[mi + 1] || group.messages[mi + 1].sender_id !== message.sender_id;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: mi * 0.02 }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} ${isLastInGroup ? "mb-3" : "mb-0.5"}`}
                >
                  {/* Received avatar spacer */}
                  {!isMine && (
                    <div className="w-7 mr-2 flex-shrink-0 flex items-end">
                      {showAvatar && (
                        <SymbolAvatar
                          symbol={selectedConversation.avatar_symbol}
                          color={selectedConversation.avatar_color}
                          fallbackLetter={displayName?.charAt(0)?.toUpperCase() || "U"}
                          size={24}
                          className="!border"
                        />
                      )}
                    </div>
                  )}

                  <div className={`max-w-[75%] ${isSharedDream ? "w-[75%]" : ""}`}>
                    {isSharedDream ? (
                      <div
                        className={`rounded-2xl overflow-hidden p-3 ${
                          isMine
                            ? "bg-gradient-to-br from-primary/80 to-accent/80 rounded-br-sm"
                            : "bg-muted/50 border border-border/50 rounded-bl-sm"
                        }`}
                      >
                        <p className={`text-xs mb-2 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {isMine ? "You" : displayName} shared a dream
                        </p>
                        <SharedDreamCard
                          dreamId={message.content.match(/\[SHARED_DREAM:([^\]]+)\]/)?.[1] || ""}
                        />
                      </div>
                    ) : (
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
                          isMine
                            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-br-sm"
                            : "bg-muted/50 border border-border/50 text-foreground rounded-bl-sm"
                        }`}
                      >
                        {message.content}
                      </div>
                    )}

                    {/* Timestamp on last message in consecutive group */}
                    {isLastInGroup && (
                      <p className={`text-[10px] text-muted-foreground mt-1 ${isMine ? "text-right mr-1" : "ml-1"}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0 px-4 py-2 border-t border-border bg-background"
        style={{ paddingBottom: `calc(4.5rem + env(safe-area-inset-bottom, 0px))` }}
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowDreamSelector(true)}
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Image className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="flex-1 h-9 rounded-full bg-muted/40 border-border/50 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !loading && newMessage.trim()) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              onClick={() => onSend()}
              disabled={loading || !newMessage.trim()}
              size="icon"
              className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      <DreamShareSelector
        isOpen={showDreamSelector}
        onClose={() => setShowDreamSelector(false)}
        onSelectDream={handleShareDream}
      />
    </div>
  );
};

export default ChatWindow;
