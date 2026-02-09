import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

interface MessagesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: any[];
  selectedConversationUser?: any;
  setSelectedConversationUser?: (user: any) => void;
  fetchConversations?: () => void;
}

const MessagesDialog = ({
  isOpen,
  onOpenChange,
  conversations,
  selectedConversationUser,
  setSelectedConversationUser,
  fetchConversations,
}: MessagesDialogProps) => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && fetchConversations) fetchConversations();
  }, [isOpen, fetchConversations]);

  useEffect(() => {
    if (isOpen && selectedConversationUser) {
      setSelectedConversation(selectedConversationUser);
    } else if (isOpen && !selectedConversationUser) {
      setSelectedConversation(null);
    }
  }, [isOpen, selectedConversationUser]);

  useEffect(() => {
    if (selectedConversation) fetchMessages(selectedConversation.id);
  }, [selectedConversation]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedConversation(null);
      setMessages([]);
      setNewMessage("");
      setIsSelectionMode(false);
      setSelectedConversations(new Set());
      if (setSelectedConversationUser) setSelectedConversationUser(null);
    }
  }, [isOpen, setSelectedConversationUser]);

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    if (!user || !selectedConversation) return;
    const messageContent = customMessage || newMessage.trim();
    if (!messageContent) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        receiver_id: selectedConversation.id,
        content: messageContent,
      });
      if (error) throw error;
      if (!customMessage) setNewMessage("");
      fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedConversations.size === 0) return;
    setLoading(true);
    try {
      for (const partnerId of selectedConversations) {
        await supabase
          .from("messages")
          .delete()
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
          );
      }
      toast.success(`Deleted ${selectedConversations.size} conversation${selectedConversations.size > 1 ? "s" : ""}`);
      setSelectedConversations(new Set());
      setIsSelectionMode(false);
      if (fetchConversations) fetchConversations();
    } catch (error) {
      console.error("Error deleting conversations:", error);
      toast.error("Failed to delete conversations");
    } finally {
      setLoading(false);
    }
  };

  const toggleConversationSelection = (conversationId: string) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const filteredConversations = conversations.filter((c) => {
    const dn = c.display_name || "";
    const un = c.username || "";
    return dn.toLowerCase().includes(searchTerm.toLowerCase()) || un.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {!selectedConversation ? (
            <>
              {/* Conversation List Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-xl">
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-base font-semibold text-foreground">Messages</h1>
                <div className="flex items-center gap-1">
                  {isSelectionMode && selectedConversations.size > 0 && (
                    <Button variant="ghost" size="icon" onClick={handleDeleteSelected} disabled={loading}>
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary"
                    onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      setSelectedConversations(new Set());
                    }}
                  >
                    {isSelectionMode ? "Done" : "Edit"}
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="flex-shrink-0 px-4 py-2 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 rounded-lg bg-muted/50 border-none text-sm"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
                <ConversationList
                  conversations={filteredConversations}
                  onSelectConversation={(conv) => {
                    if (isSelectionMode) {
                      toggleConversationSelection(conv.id);
                    } else {
                      setSelectedConversation(conv);
                      if (setSelectedConversationUser) setSelectedConversationUser(conv);
                    }
                  }}
                  isSelectionMode={isSelectionMode}
                  selectedConversations={selectedConversations}
                />
              </div>
            </>
          ) : (
            <ChatWindow
              selectedConversation={selectedConversation}
              messages={messages}
              user={user}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              loading={loading}
              onBack={() => {
                setSelectedConversation(null);
                if (setSelectedConversationUser) setSelectedConversationUser(null);
              }}
              onSend={handleSendMessage}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessagesDialog;
