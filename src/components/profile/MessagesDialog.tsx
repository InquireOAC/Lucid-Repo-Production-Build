import React, { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

  // Fetch all conversations every time dialog is (re)opened
  useEffect(() => {
    if (isOpen && fetchConversations) {
      fetchConversations();
    }
  }, [isOpen, fetchConversations]);

  // If selectedConversationUser set (e.g. via "Message" button), select that user only
  useEffect(() => {
    if (isOpen && selectedConversationUser) {
      setSelectedConversation(selectedConversationUser);
    } else if (isOpen && !selectedConversationUser) {
      // If opening generally (e.g. via Messages), show conversation list
      setSelectedConversation(null);
    }
  }, [isOpen, selectedConversationUser]);

  // --- REMOVE this "auto-select" effect below ---

  // useEffect(() => {
  //   // If only one conversation and dialog opens, auto-select it
  //   if (
  //     isOpen &&
  //     conversations?.length === 1 &&
  //     !selectedConversationUser &&
  //     selectedConversation == null
  //   ) {
  //     setSelectedConversation(conversations[0]);
  //   }
  // }, [isOpen, conversations, selectedConversationUser, selectedConversation]);

  // Automatically scroll to bottom when messages change
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // When dialog is closed, reset selection
  useEffect(() => {
    if (!isOpen) {
      setSelectedConversation(null);
      setMessages([]);
      setNewMessage("");
      if (setSelectedConversationUser) setSelectedConversationUser(null);
    }
  }, [isOpen, setSelectedConversationUser]);

  // Support: externally passed conversation user triggers dialog
  useEffect(() => {
    // If only one conversation and dialog opens, auto-select it
    if (
      isOpen &&
      conversations?.length === 1 &&
      !selectedConversationUser &&
      selectedConversation == null
    ) {
      setSelectedConversation(conversations[0]);
    }
  }, [isOpen, conversations, selectedConversationUser, selectedConversation]);

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

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedConversation.id);
      toast.success("Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">
            {selectedConversation ? "Chat" : "Messages"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {!selectedConversation ? (
            conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conversation: any) => (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                    onClick={() => {
                      setSelectedConversation(conversation);
                      if (setSelectedConversationUser) setSelectedConversationUser(conversation);
                    }}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.avatar_url} />
                      <AvatarFallback className="bg-dream-purple/20">
                        {conversation.username
                          ? conversation.username[0].toUpperCase()
                          : "U"}
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto mb-2 text-muted-foreground h-8 w-8" />
                <h3 className="font-medium mb-1">No messages yet</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with other dreamers to start chatting
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col h-[400px]">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedConversation(null);
                    if (setSelectedConversationUser) setSelectedConversationUser(null);
                  }}
                >
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
                  {selectedConversation.display_name ||
                    selectedConversation.username}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
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
                          : "bg-gray-200 dark:bg-gray-700"
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
                    e.key === "Enter" && handleSendMessage()
                  }
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={loading || !newMessage.trim()}
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesDialog;
