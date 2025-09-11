
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to retrieve all unique conversation partners for the authenticated user.
 * Returns conversation partner profile objects.
 */
export function useConversations(user: any) {
  const [conversations, setConversations] = useState([]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch messages sent or received by the user
      const { data: messages, error } = await supabase
        .from("messages")
        .select("sender_id, receiver_id, content, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner and get the most recent message
      const conversationMap = new Map();
      (messages || []).forEach((msg: any) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        // Only store the first (most recent) message for each partner
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            partnerId,
            last_message: msg.content,
            last_message_time: msg.created_at
          });
        }
      });
      
      if (conversationMap.size > 0) {
        // Fetch profiles for all conversation partners
        const partnerIds = Array.from(conversationMap.keys());
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", partnerIds);
          
        if (profilesError) throw profilesError;
        
        // Merge profile data with last message info
        const conversationsWithMessages = (profiles || []).map(profile => {
          const messageInfo = conversationMap.get(profile.id);
          return {
            ...profile,
            last_message: messageInfo?.last_message,
            last_message_time: messageInfo?.last_message_time
          };
        });
        
        // Sort by most recent message first
        conversationsWithMessages.sort((a, b) => {
          if (!a.last_message_time) return 1;
          if (!b.last_message_time) return -1;
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        });
        
        setConversations(conversationsWithMessages);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    if (!user || !otherUserId) return null;

    try {
      // First, get the other user's profile
      const { data: otherUserProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherUserId)
        .maybeSingle();

      if (profileError || !otherUserProfile) {
        console.error("Error fetching other user profile:", profileError);
        return null;
      }

      // Check if there's already a conversation between these users
      const { data: existingMessages, error: messagesError } = await supabase
        .from("messages")
        .select("id")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .limit(1);

      if (messagesError) {
        console.error("Error checking existing messages:", messagesError);
      }

      // If no existing conversation, we could optionally create an initial message
      // For now, just return the profile so the UI can open the chat window
      return otherUserProfile;
    } catch (error) {
      console.error("Error starting conversation:", error);
      return null;
    }
  };

  return {
    conversations,
    fetchConversations,
    handleStartConversation
  };
}
