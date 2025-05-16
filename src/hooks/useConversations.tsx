
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
          .from("profiles")
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

  // For future extension; currently not used
  const handleStartConversation = () => {};

  return {
    conversations,
    fetchConversations,
    handleStartConversation
  };
}
