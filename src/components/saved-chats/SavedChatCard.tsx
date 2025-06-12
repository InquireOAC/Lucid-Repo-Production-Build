import React from 'react';
import { Clock, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
interface SavedChatCardProps {
  session: SavedSession;
  onOpenSession: (session: SavedSession) => void;
  onDeleteSession: (sessionId: string) => void;
  deletingId: string | null;
}
const SavedChatCard = ({
  session,
  onOpenSession,
  onDeleteSession,
  deletingId
}: SavedChatCardProps) => {
  const getFirstMessage = (messages: any[]) => {
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    return firstUserMessage ? firstUserMessage.content : 'No messages';
  };
  const formatExpertType = (type: string) => {
    switch (type) {
      case 'jungian':
        return 'Jungian Analyst';
      case 'shamanic':
        return 'Shamanic Guide';
      case 'cbt':
        return 'CBT Therapist';
      default:
        return type;
    }
  };
  const getExpertColor = (type: string) => {
    switch (type) {
      case 'jungian':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shamanic':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cbt':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  return <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20 group bg-purple-200" onClick={() => onOpenSession(session)}>
      <CardContent className="p-6 bg-purple-800 rounded-lg ">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header with expert type and timestamp */}
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className={`font-medium ${getExpertColor(session.expert_type)}`}>
                {formatExpertType(session.expert_type)}
              </Badge>
              <div className="flex items-center text-xs text-white">
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
              <p className="text-sm text-white line-clamp-2 leading-relaxed">
                {getFirstMessage(session.messages)}
              </p>
            </div>

            {/* Message count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-white">
                <MessageCircle className="h-3 w-3 mr-1" />
                {session.messages.length} {session.messages.length === 1 ? 'message' : 'messages'}
              </div>
              <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Click to continue →
              </span>
            </div>
          </div>

          {/* Delete button */}
          <div className="ml-4 flex-shrink-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button onClick={e => e.stopPropagation()} variant="ghost" size="sm" disabled={deletingId === session.id} className="text-white hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all">
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
                  <AlertDialogAction onClick={() => onDeleteSession(session.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default SavedChatCard;