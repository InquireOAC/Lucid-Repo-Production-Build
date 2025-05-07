
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useConversations(user: any) {
  const [conversations, setConversations] = useState([]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      // Get unique conversation partners
      const { data: sent, error: sentError } = await supabase
        .from("messages")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });
      
      const { data: received, error: receivedError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });
      
      if (sentError || receivedError) throw sentError || receivedError;
      
      // Combine and get unique user IDs
      const userIds = new Set([
        ...(sent || []).map((msg: any) => msg.receiver_id),
        ...(received || []).map((msg: any) => msg.sender_id)
      ]);
      
      if (userIds.size > 0) {
        // Get profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", Array.from(userIds));
        
        if (profilesError) throw profilesError;
        
        setConversations(profiles || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleStartConversation = () => {
    // Navigate to messages with this user
  };

  return {
    conversations,
    fetchConversations,
    handleStartConversation
  };
}
