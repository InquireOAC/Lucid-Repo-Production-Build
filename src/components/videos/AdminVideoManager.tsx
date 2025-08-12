import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Settings, RefreshCw } from 'lucide-react';
import { useVideoEntries } from '@/hooks/useVideoEntries';
import { useAuth } from '@/contexts/AuthContext';

interface AdminVideoManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminVideoManager = ({ isOpen, onClose }: AdminVideoManagerProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [dreamerStoryName, setDreamerStoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addVideoFromYoutube, refreshVideoStatistics, isLoading } = useVideoEntries();
  const { user } = useAuth();

  // Simple admin check - you can make this more sophisticated
  const isAdmin = user?.email === 'inquireoac@gmail.com'; // Replace with your admin email

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || !dreamerStoryName.trim()) return;

    setIsSubmitting(true);
    const result = await addVideoFromYoutube(youtubeUrl.trim(), dreamerStoryName.trim());
    
    if (result.success) {
      setYoutubeUrl('');
      setDreamerStoryName('');
      onClose();
    }
    
    setIsSubmitting(false);
  };

  if (!isAdmin) {
    return null; // Don't render for non-admin users
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white gradient-text flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add YouTube Video
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url" className="text-white text-sm font-medium">
              YouTube URL
            </Label>
            <Input
              id="youtube-url"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="glass-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dreamer-story" className="text-white text-sm font-medium">
              Dreamer Story Name
            </Label>
            <Input
              id="dreamer-story"
              value={dreamerStoryName}
              onChange={(e) => setDreamerStoryName(e.target.value)}
              placeholder="Enter the dreamer's story name"
              className="glass-input"
              required
            />
          </div>

          <div className="text-sm text-white/60">
            <p>The video title, description, and thumbnail will be automatically fetched from YouTube.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="glass-button flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !youtubeUrl.trim() || !dreamerStoryName.trim()}
            >
              {isSubmitting ? 'Adding...' : 'Add Video'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const AdminVideoButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { refreshVideoStatistics, isLoading } = useVideoEntries();

  // Simple admin check
  const isAdmin = user?.email === 'inquireoac@gmail.com'; // Replace with your admin email

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          size="sm"
          className="glass-button"
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Videos
        </Button>
        
        <Button
          onClick={refreshVideoStatistics}
          variant="outline"
          size="sm"
          className="glass-button"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>
      
      <AdminVideoManager
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default AdminVideoManager;