
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SavedSession {
  id: string;
  expert_type: string;
  messages: Array<{
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
  }>;
  created_at: string;
}

export const useSavedChats = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSavedSessions();
    }
  }, [user]);

  const loadSavedSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('dream_chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out sessions with no messages or empty messages array
      const validSessions = (data || []).filter(session => 
        session.messages && 
        Array.isArray(session.messages) && 
        session.messages.length > 0
      );
      
      setSessions(validSessions);
    } catch (error) {
      console.error('Error loading saved sessions:', error);
      toast.error('Failed to load saved sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    setDeletingId(sessionId);
    try {
      const { error } = await supabase
        .from('dream_chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
      // Remove from local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete chat');
    } finally {
      setDeletingId(null);
    }
  };

  return {
    sessions,
    isLoading,
    deletingId,
    deleteSession,
    loadSavedSessions
  };
};
