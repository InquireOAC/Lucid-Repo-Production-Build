
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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

  // Always fetch all conversations every time the dialog is opened
  useEffect(() => {
    if (isOpen && fetchConversations) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  // Handle navigation between messages list and conversation chat window
  useEffect(() => {
    if (isOpen && selectedConversationUser) {
      setSelectedConversation(selectedConversationUser);
    } else if (isOpen && !selectedConversationUser) {
      setSelectedConversation(null);
    }
  }, [isOpen, selectedConversationUser]);

  // Fetch messages when a conversation is clicked/selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedConversation(null);
      setMessages([]);
      setNewMessage("");
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
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation.id,
          content: messageContent
        });

      if (error) throw error;

      if (!customMessage) {
        setNewMessage("");
      }
      fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    const displayName = conversation.display_name || "";
    const username = conversation.username || "";
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // --- rendering using subcomponents ---
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] sm:max-h-[90vh] w-full h-full max-h-screen glass-card border-white/20 backdrop-blur-xl bg-background/95 p-0 m-0 sm:rounded-lg rounded-none">
        <div className="pt-safe-top pb-safe-bottom h-full flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 pr-safe-right pl-safe-left border-b border-white/10">
            <DialogTitle className="gradient-text text-xl font-semibold">
              {selectedConversation ? "Chat" : "Messages"}
            </DialogTitle>
          </DialogHeader>
          
          {!selectedConversation && (
            <div className="px-6 py-4 pr-safe-right pl-safe-left border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-ring"
                />
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            {!selectedConversation ? (
              <div className="h-full overflow-y-auto px-6 py-4 pr-safe-right pl-safe-left">
                <ConversationList
                  conversations={filteredConversations}
                  onSelectConversation={(conv) => {
                    setSelectedConversation(conv);
                    if (setSelectedConversationUser) setSelectedConversationUser(conv);
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col min-h-0 p-6 pr-safe-right pl-safe-left">
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
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;
