import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoEntry } from '@/types/video';
import { toast } from 'sonner';

export const useVideoEntries = () => {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('video_entries')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
        return;
      }

      // Convert database format to VideoEntry format
      const formattedVideos: VideoEntry[] = data.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description || '',
        video_url: video.youtube_url,
        thumbnail_url: video.thumbnail_url,
        dreamer_story_name: video.dreamer_story_name,
        duration: video.duration,
        created_at: video.created_at,
        view_count: video.view_count,
        like_count: video.like_count,
      }));

      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  };

  const addVideoFromYoutube = async (youtubeUrl: string, dreamerStoryName: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: {
          youtube_url: youtubeUrl,
          dreamer_story_name: dreamerStoryName,
        },
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast.success('Video added successfully! It will be visible once published.');
        await fetchVideos(); // Refresh the list
        return { success: true, video: data.video };
      } else {
        throw new Error(data.error || 'Failed to add video');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Failed to add video from YouTube');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVideoPublication = async (videoId: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('video_entries')
        .update({ is_published: isPublished })
        .eq('id', videoId);

      if (error) {
        throw error;
      }

      toast.success(isPublished ? 'Video published successfully' : 'Video unpublished');
      await fetchVideos(); // Refresh the list
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video');
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    isLoading,
    fetchVideos,
    addVideoFromYoutube,
    toggleVideoPublication,
  };
};