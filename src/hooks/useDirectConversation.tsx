
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get or create a direct conversation between two users.
 * Returns { openChatWithUser, loading, error }
 */
export function useDirectConversation(myId: string | null, otherUserId: string | null) {
  const [chatPartner, setChatPartner] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open or start a conversation with another user
  const openChatWithUser = async (onReady: (user: any) => void) => {
    setError(null);
    setLoading(true);
    try {
      if (!myId || !otherUserId) {
        setLoading(false); 
        return;
      }
      // For direct messages, just select the other user's profile
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("id", otherUserId)
        .maybeSingle();
      if (!data || error) throw error || new Error("User not found");
      setChatPartner(data);
      onReady(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { chatPartner, openChatWithUser, loading, error };
}
