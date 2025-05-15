
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Custom hook to start or open a direct conversation thread with another user
export function useStartConversation(user: any, targetUser: any, onOpen: (conversation: any) => void) {
  return useCallback(async () => {
    if (!user || !targetUser) return;
    // Find an existing thread between these two users
    let { data: existingConvos } = await supabase
      .from("conversations")
      .select("*")
      .contains("participants", [user.id, targetUser.id]);

    let convo =
      existingConvos?.find((c: any) =>
        c.participants.includes(user.id) && c.participants.includes(targetUser.id)
      ) || null;

    if (!convo) {
      // Create it
      const { data, error } = await supabase
        .from("conversations")
        .insert([{ participants: [user.id, targetUser.id] }])
        .select("*")
        .maybeSingle();
      convo = data;
    }
    if (convo) onOpen(convo);
  }, [user, targetUser, onOpen]);
}
