
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Save, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SavedChats from './SavedChats';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  expert_type: string;
  title: string | null;
  created_at: string;
}

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

const DreamChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expertType, setExpertType] = useState<'jungian' | 'shamanic' | 'cbt'>('jungian');
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [viewMode, setViewMode] = useState<'chat' | 'savedChats' | 'readOnly'>('chat');
  const [isSaving, setIsSaving] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('dream_chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const saveCurrentSession = async () => {
    if (!user || messages.length === 0 || isSaving) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('dream_chat_sessions')
        .insert({
          user_id: user.id,
          expert_type: expertType,
          messages: messages.map(msg => ({
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          title: `${expertType.charAt(0).toUpperCase() + expertType.slice(1)} Session`
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Chat session saved successfully!');
      loadSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save chat session');
    } finally {
      setIsSaving(false);
    }
  };

  const openSavedSession = (session: SavedSession) => {
    setMessages(session.messages.map((msg, index) => ({
      id: `${session.id}-${index}`,
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp
    })));
    setExpertType(session.expert_type as 'jungian' | 'shamanic' | 'cbt');
    setIsReadOnly(true);
    setViewMode('readOnly');
  };

  const handleBackToChat = () => {
    setViewMode('chat');
    setIsReadOnly(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSession(null);
    setIsReadOnly(false);
    setViewMode('chat');
  };

  const createNewSession = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('dream_chat_sessions')
        .insert({
          user_id: user.id,
          expert_type: expertType,
          title: `${expertType.charAt(0).toUpperCase() + expertType.slice(1)} Session`
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  const saveMessage = async (sessionId: string, sender: 'user' | 'ai', content: string) => {
    try {
      const { error } = await supabase
        .from('dream_chat_messages')
        .insert({
          session_id: sessionId,
          sender,
          content
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('dream_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formattedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        sender: msg.sender as 'user' | 'ai',
        content: msg.content,
        timestamp: msg.created_at
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user || isLoading || isReadOnly) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Create new session if needed
    let sessionId = currentSession;
    if (!sessionId) {
      sessionId = await createNewSession();
      if (!sessionId) {
        toast.error('Failed to create chat session');
        setIsLoading(false);
        return;
      }
      setCurrentSession(sessionId);
    }

    // Add user message to UI
    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Save user message
    await saveMessage(sessionId, 'user', userMessage);

    try {
      // Call AI function
      const { data, error } = await supabase.functions.invoke('dream-chat', {
        body: {
          message: userMessage,
          expertType,
          sessionId
        }
      });

      if (error) throw error;

      // Add AI response to UI
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Save AI message
      await saveMessage(sessionId, 'ai', data.response);

      // Update session timestamp
      await supabase
        .from('dream_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      // Reload sessions to update order
      loadSessions();

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpertChange = (newExpertType: 'jungian' | 'shamanic' | 'cbt') => {
    if (messages.length > 0) {
      const confirmed = window.confirm(
        'Changing expert type will start a new conversation. Continue?'
      );
      if (!confirmed) return;
      handleNewChat();
    }
    setExpertType(newExpertType);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to use the AI Dream Chat</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'savedChats') {
    return <SavedChats onBack={handleBackToChat} onOpenSession={openSavedSession} />;
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex-shrink-0 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={() => setViewMode('savedChats')} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Chats
            </Button>
            <h1 className="text-base font-bold absolute left-1/2 transform -translate-x-1/2">AI Dream Chat</h1>
            <div className="flex gap-2">
              {messages.length > 0 && !isReadOnly && (
                <Button 
                  onClick={saveCurrentSession} 
                  variant="outline" 
                  size="sm"
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Chat'}
                </Button>
              )}
              {isReadOnly && (
                <Button onClick={handleNewChat} variant="outline" size="sm">
                  New Chat
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col pb-16 px-4">
        <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
          <div className="bg-card rounded-lg border flex flex-col h-full">
            {/* Expert Selection */}
            <div className="flex-shrink-0 p-4 border-b">
              <label className="block text-sm font-medium mb-2">Choose Your Dream Expert:</label>
              <Select value={expertType} onValueChange={handleExpertChange} disabled={isReadOnly}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jungian">Jungian Analyst</SelectItem>
                  <SelectItem value="shamanic">Shamanic Guide</SelectItem>
                  <SelectItem value="cbt">CBT Therapist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Messages Area - This will take all available space */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <p className="mb-2">Welcome to AI Dream Chat!</p>
                  <p className="text-sm">
                    Ask questions about your dreams and get insights from your chosen expert.
                    Your dreams from the journal will provide context for personalized interpretations.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-2 rounded-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">AI is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isReadOnly ? "This is a saved session (read-only)" : "Ask about your dreams..."}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading || isReadOnly}
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim() || isReadOnly}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamChat;
