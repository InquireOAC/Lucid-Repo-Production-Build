
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface SavedChatsProps {
  onBack: () => void;
  onOpenSession: (session: SavedSession) => void;
}

const SavedChats = ({ onBack, onOpenSession }: SavedChatsProps) => {
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

  const deleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening the session when clicking delete
    
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

  const getFirstMessage = (messages: any[]) => {
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    return firstUserMessage ? firstUserMessage.content : 'No messages';
  };

  const formatExpertType = (type: string) => {
    switch (type) {
      case 'jungian': return 'Jungian Analyst';
      case 'shamanic': return 'Shamanic Guide';
      case 'cbt': return 'CBT Therapist';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading saved chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button onClick={onBack} variant="ghost" size="sm" className="mr-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Saved Chats</h1>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved chats yet</h3>
            <p className="text-muted-foreground">
              Start a conversation and save it as a session to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-card rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onOpenSession(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {formatExpertType(session.expert_type)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleDateString()} at{' '}
                        {new Date(session.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {getFirstMessage(session.messages)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="text-xs text-muted-foreground">
                      {session.messages.length} messages
                    </div>
                    <Button
                      onClick={(e) => deleteSession(session.id, e)}
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === session.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedChats;
