
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Save, MessageCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SavedChats from './SavedChats';
import { useChatFeatureAccess } from '@/hooks/useChatFeatureAccess';
import { showSubscriptionPrompt } from '@/lib/stripe';

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
  const {
    canUseChat,
    recordChatUsage,
    isChecking,
    isAppCreator,
    hasActiveSubscription,
    hasUsedFeature
  } = useChatFeatureAccess();

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
    if (!user || messages.length === 0 || isSaving) {
      if (messages.length === 0) {
        toast.error('Cannot save empty chat session');
      }
      return;
    }

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

  const handleSendMessage = async () => {
    if (!input.trim() || !user || isLoading || isReadOnly) return;

    // Check if user can use chat feature before sending
    const canUse = await canUseChat();
    if (!canUse) {
      return; // canUseChat already shows the subscription prompt
    }

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

      // Record usage after successful chat interaction
      await recordChatUsage();

      // Show appropriate success message for non-subscribers
      if (!isAppCreator && !hasActiveSubscription && !hasUsedFeature('analysis')) {
        toast.success("Free trial used! Subscribe to continue using AI Dream Chat.", {
          duration: 5000,
          action: {
            label: "Subscribe",
            onClick: () => window.location.href = '/profile?tab=subscription'
          }
        });
      }

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
      const confirmed = window.confirm('Changing expert type will start a new conversation. Continue?');
      if (!confirmed) return;
      handleNewChat();
    }
    setExpertType(newExpertType);
  };

  // Determine if chat features should be enabled
  const hasUsedFreeTrial = hasUsedFeature('analysis');
  const isChatEnabled = isAppCreator || hasActiveSubscription || !hasUsedFreeTrial;

  if (!user) {
    return (
      <div className="h-screen starry-background p-4 flex items-center justify-center overflow-hidden">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white/90">Authentication Required</h2>
          <p className="text-white/70">Please sign in to use the AI Dream Chat</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'savedChats') {
    return <SavedChats onBack={handleBackToChat} onOpenSession={openSavedSession} />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] starry-background flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => setViewMode('savedChats')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 glass-card border-white/10 text-white/80 hover:text-white hover:border-white/20"
          >
            <MessageCircle className="h-4 w-4" />
            Chats
          </Button>
          <h1 className="text-base font-bold absolute left-1/2 transform -translate-x-1/2 text-white/90">
            Dream Chat
          </h1>
          <div className="flex gap-2">
            {messages.length > 0 && !isReadOnly && (
              <Button
                onClick={saveCurrentSession}
                variant="outline"
                size="sm"
                disabled={isSaving}
                className="flex items-center gap-2 glass-card border-white/10 text-white/80 hover:text-white hover:border-white/20"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
            {isReadOnly && (
              <Button onClick={handleNewChat} variant="outline" size="sm" className="glass-card border-white/10 text-white/80 hover:text-white hover:border-white/20">
                New Chat
              </Button>
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10">
          {/* Expert Selection */}
          <div className="p-4 border-b border-white/10">
            <label className="block text-sm font-medium mb-2 text-white/90">Choose Your Dream Expert:</label>
            <Select 
              value={expertType} 
              onValueChange={handleExpertChange} 
              disabled={isReadOnly || !isChatEnabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jungian">Jungian Analyst</SelectItem>
                <SelectItem value="shamanic">Spiritual Guide</SelectItem>
                <SelectItem value="cbt">CBT Therapist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feature Access Status */}
        {!isAppCreator && !hasActiveSubscription && (
          <div className="mt-4 glass-card rounded-xl border border-white/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/20">
                {hasUsedFreeTrial ? <Lock className="h-4 w-4 text-purple-300" /> : <MessageCircle className="h-4 w-4 text-purple-300" />}
              </div>
              <div>
                {!hasUsedFreeTrial ? (
                  <>
                    <h3 className="text-sm font-medium mb-1 text-white/90">Free Trial Available</h3>
                    <p className="text-xs text-white/70">
                      This is your first time using AI Dream Chat. You can try it for free once, then upgrade for unlimited access.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-medium mb-1 text-white/90">Premium Feature</h3>
                    <p className="text-xs text-white/70 mb-2">
                      You've used your free trial. Subscribe for unlimited AI Dream Chat access.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => showSubscriptionPrompt('analysis')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Upgrade Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Active Notice */}
        {!isAppCreator && hasActiveSubscription && (
          <div className="mt-4 glass-card rounded-xl border border-green-400/20 p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-300" />
              <span className="text-sm font-medium text-white/90">Unlimited Chat Access</span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              You have unlimited access to AI Dream Chat with your subscription.
            </p>
          </div>
        )}
      </div>

      {/* Messages Area - Takes remaining space and scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-0">
          {messages.length === 0 ? (
            <div className="text-center">
              <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <p className="mb-2 text-white/90 font-medium text-lg">Welcome to your Dream Consultant</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Ask questions about your dreams and get insights from your chosen expert. 
                  Your dreams from the journal will provide context for interpretations.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : 'glass-card border border-white/10 text-white/90'
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
              <div className="glass-card border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-300" />
                <span className="text-sm text-white/70">AI is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom above tab bar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 border-t border-white/10 glass-card backdrop-blur-xl bg-background/95">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isReadOnly
                ? "This is a saved session (read-only)"
                : !isChatEnabled
                ? "Subscribe to continue chatting..."
                : "Ask about your dreams..."
            }
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading || isReadOnly || isChecking || !isChatEnabled}
            className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-ring"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim() || isReadOnly || isChecking || !isChatEnabled}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 transition-all duration-300"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : !isChatEnabled ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DreamChat;
