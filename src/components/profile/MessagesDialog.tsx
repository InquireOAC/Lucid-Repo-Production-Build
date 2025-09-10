
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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

  // --- rendering using subcomponents ---
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] sm:max-h-[90vh] w-full h-full max-h-screen glass-card border-white/20 backdrop-blur-xl bg-background/95 p-0 m-0 sm:rounded-lg rounded-none">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="gradient-text text-xl font-semibold">
            {selectedConversation ? "Chat" : "Messages"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden p-6 pt-0">
          {!selectedConversation ? (
            <ConversationList
              conversations={conversations}
              onSelectConversation={(conv) => {
                setSelectedConversation(conv);
                if (setSelectedConversationUser) setSelectedConversationUser(conv);
              }}
            />
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;
