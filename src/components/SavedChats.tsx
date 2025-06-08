
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Trash2, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

  const getExpertColor = (type: string) => {
    switch (type) {
      case 'jungian': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shamanic': return 'bg-green-100 text-green-800 border-green-200';
      case 'cbt': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <div className="flex items-center mb-8">
          <Button onClick={onBack} variant="ghost" size="sm" className="mr-3 hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Saved Chats</h1>
            <p className="text-muted-foreground text-sm">
              {sessions.length} {sessions.length === 1 ? 'conversation' : 'conversations'} saved
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No saved chats yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Start a conversation with an AI dream expert and save it as a session to see it here. 
              Your saved conversations will help you track your dream analysis journey.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20 group"
                onClick={() => onOpenSession(session)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header with expert type and timestamp */}
                      <div className="flex items-center gap-3 mb-3">
                        <Badge 
                          variant="outline" 
                          className={`font-medium ${getExpertColor(session.expert_type)}`}
                        >
                          <User className="h-3 w-3 mr-1" />
                          {formatExpertType(session.expert_type)}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(session.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })} at{' '}
                          {new Date(session.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>

                      {/* Preview of first message */}
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {getFirstMessage(session.messages)}
                        </p>
                      </div>

                      {/* Message count */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {session.messages.length} {session.messages.length === 1 ? 'message' : 'messages'}
                        </div>
                        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to continue →
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="ml-4 flex-shrink-0">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            onClick={(e) => e.stopPropagation()}
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === session.id}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this chat session? This action cannot be undone and will permanently remove all messages in this conversation.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSession(session.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedChats;
