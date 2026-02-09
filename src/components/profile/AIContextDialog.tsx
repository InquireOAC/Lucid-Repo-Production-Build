
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AIContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIContextData {
  name?: string;
  photo_url?: string;
  eye_color?: string;
  clothing_style?: string;
}

const AIContextDialog = ({
  open,
  onOpenChange
}: AIContextDialogProps) => {
  const { user } = useAuth();
  const [contextData, setContextData] = useState<AIContextData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (open && user) {
      loadAIContext();
    }
  }, [open, user]);

  const loadAIContext = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_context')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading AI context:', error);
        return;
      }

      if (data) {
        setContextData({
          name: data.name,
          photo_url: data.photo_url,
          eye_color: data.eye_color,
          clothing_style: data.clothing_style,
        });
      }
    } catch (error) {
      console.error('Error loading AI context:', error);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be smaller than 5MB');
        return;
      }
      setPhotoFile(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `ai-context-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('dream-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('dream-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let photoUrl = contextData.photo_url;

      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
        if (!photoUrl) {
          toast.error('Failed to upload photo');
          setIsLoading(false);
          return;
        }
      }

      const dataToSave = {
        name: contextData.name || null,
        photo_url: photoUrl || null,
        eye_color: contextData.eye_color || null,
        clothing_style: contextData.clothing_style || null,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ai_context')
        .upsert(dataToSave, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('Dream Avatar saved successfully!');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving Dream Avatar:', error);
      toast.error(`Failed to save Dream Avatar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Your Dream Avatar</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Help AI generate dream images that better represent you. Upload a reference photo for best results.
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <Label htmlFor="name">Name or Nickname</Label>
            <Input
              id="name"
              value={contextData.name || ''}
              onChange={e => setContextData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="How you'd like to be referred to"
            />
          </div>

          {/* Reference Photo */}
          <div>
            <Label>Reference Photo (Optional)</Label>
            <div className="mt-2">
              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {photoFile ? photoFile.name : 'Upload photo (max 5MB)'}
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>

          {/* Eye Color & Clothing Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eye_color">Eye Color</Label>
              <Input
                id="eye_color"
                value={contextData.eye_color || ''}
                onChange={e => setContextData(prev => ({ ...prev, eye_color: e.target.value }))}
                placeholder="e.g., brown, blue, green"
              />
            </div>
            <div>
              <Label htmlFor="clothing_style">Clothing Style</Label>
              <Input
                id="clothing_style"
                value={contextData.clothing_style || ''}
                onChange={e => setContextData(prev => ({ ...prev, clothing_style: e.target.value }))}
                placeholder="e.g., casual, alternative"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Avatar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIContextDialog;
