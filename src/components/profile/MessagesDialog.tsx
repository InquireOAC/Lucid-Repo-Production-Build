import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
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

  const handleDeleteSelected = async () => {
    if (!user || selectedConversations.size === 0) return;
    
    setLoading(true);
    try {
      // Delete all messages between current user and selected users
      for (const partnerId of selectedConversations) {
        await supabase
          .from("messages")
          .delete()
          .or(
            `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
          );
      }
      
      toast.success(`Deleted ${selectedConversations.size} conversation${selectedConversations.size > 1 ? 's' : ''}`);
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

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    const displayName = conversation.display_name || "";
    const username = conversation.username || "";
    return displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           username.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] sm:max-h-[90vh] w-full h-screen sm:h-[90vh] glass-card border-white/20 backdrop-blur-xl bg-background/95 p-0 m-0 sm:rounded-lg rounded-none">
        <div className="h-full flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
            {!selectedConversation ? (
              <div className="flex flex-col gap-3">
                <DialogTitle className="text-white text-xl font-semibold text-center">
                  Messages
                </DialogTitle>
                <div className="flex items-center justify-start gap-2">
                  <Button
                    variant={isSelectionMode ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      setSelectedConversations(new Set());
                    }}
                  >
                    {isSelectionMode ? "Cancel" : "Select"}
                  </Button>
                  {isSelectionMode && selectedConversations.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete ({selectedConversations.size})
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center relative">
                <DialogTitle className="text-white text-xl font-semibold">
                  Chat
                </DialogTitle>
              </div>
            )}
          </DialogHeader>
          
          {!selectedConversation && (
            <div className="px-6 py-4 border-b border-white/5 flex-shrink-0">
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
          
          <div className="flex-1 min-h-0">
            {!selectedConversation ? (
              <div className="h-full overflow-y-auto px-6 py-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;