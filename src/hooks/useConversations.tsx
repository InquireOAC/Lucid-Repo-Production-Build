
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
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) throw error;

      // Collect unique user IDs that are conversation partners (exclude own ID)
      const userIds = new Set();
      (messages || []).forEach((msg: any) => {
        if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
        if (msg.receiver_id !== user.id) userIds.add(msg.receiver_id);
      });
      
      if (userIds.size > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("public_profiles")
          .select("*")
          .in("id", Array.from(userIds));
        if (profilesError) throw profilesError;
        setConversations(profiles || []);
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
        .from("public_profiles")
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
