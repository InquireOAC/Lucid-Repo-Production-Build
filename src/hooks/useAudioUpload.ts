import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAudioUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const uploadAudio = async (audioBlob: Blob, dreamId: string = 'preview'): Promise<string | null> => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    setIsUploading(true);

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const randomId = crypto.randomUUID();
      const fileName = `${timestamp}-${randomId}.webm`;
      const filePath = `${user.id}/dreams/${dreamId}/${fileName}`;

      console.log('Uploading audio to:', filePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dream-audio')
        .upload(filePath, audioBlob, {
          contentType: 'audio/webm',
          upsert: true,
          cacheControl: '31536000', // 1 year cache
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('dream-audio')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      console.log('Audio uploaded successfully:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('Audio upload error:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteAudio = async (audioUrl: string): Promise<boolean> => {
    if (!user || !audioUrl) return false;

    try {
      // Extract file path from URL
      const urlParts = audioUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'dream-audio');
      
      if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
        console.error('Invalid audio URL format');
        return false;
      }

      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      
      console.log('Deleting audio file:', filePath);

      const { error } = await supabase.storage
        .from('dream-audio')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      console.log('Audio deleted successfully');
      return true;

    } catch (error) {
      console.error('Audio deletion error:', error);
      return false;
    }
  };

  return {
    uploadAudio,
    deleteAudio,
    isUploading,
  };
};