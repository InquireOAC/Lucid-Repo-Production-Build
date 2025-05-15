import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Custom hook to start or open a direct conversation thread with another user
export function useStartConversation(user: any, targetUser: any, onOpen: (conversation: any) => void) {
  return useCallback(async () => {
    if (!user || !targetUser) return;
    
    // Since there's no conversations table, we'll use the messages table to determine if there's
    // an existing conversation between these users
    const { data: existingMessages } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .or(`sender_id.eq.${targetUser.id},receiver_id.eq.${targetUser.id}`)
      .limit(1);

    // If there are existing messages, we consider this an existing conversation
    const hasExistingConversation = existingMessages && existingMessages.length > 0;

    // Instead of returning a conversation object, we'll return the target user
    // with a flag indicating if there's an existing conversation
    const conversationData = {
      id: targetUser.id,
      username: targetUser.username,
      display_name: targetUser.display_name,
      avatar_url: targetUser.avatar_url || targetUser.profile_picture,
      hasExistingMessages: hasExistingConversation
    };
    
    onOpen(conversationData);
  }, [user, targetUser, onOpen]);
}
