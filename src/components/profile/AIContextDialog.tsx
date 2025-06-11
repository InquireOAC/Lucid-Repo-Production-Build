
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AIContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIContextData {
  name?: string;
  pronouns?: string;
  age_range?: string;
  photo_url?: string;
  hair_color?: string;
  hair_style?: string;
  skin_tone?: string;
  eye_color?: string;
  height?: string;
  build?: string;
  clothing_style?: string;
  voice_tone?: string;
  aesthetic_preferences?: string[];
}

const AIContextDialog = ({ open, onOpenChange }: AIContextDialogProps) => {
  const { user } = useAuth();
  const [contextData, setContextData] = useState<AIContextData>({
    aesthetic_preferences: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const aestheticOptions = [
    "Surreal", "Painterly", "Realistic", "Anime", "Vaporwave", 
    "Cyberpunk", "Fantasy", "Minimalist", "Dark Academia", "Cottagecore"
  ];

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
          ...data,
          aesthetic_preferences: data.aesthetic_preferences || []
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

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('dream-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleAestheticToggle = (aesthetic: string) => {
    const current = contextData.aesthetic_preferences || [];
    const updated = current.includes(aesthetic)
      ? current.filter(a => a !== aesthetic)
      : [...current, aesthetic];
    
    setContextData(prev => ({
      ...prev,
      aesthetic_preferences: updated
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let photoUrl = contextData.photo_url;

      // Upload new photo if selected
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
        if (!photoUrl) {
          toast.error('Failed to upload photo');
          setIsLoading(false);
          return;
        }
      }

      const dataToSave = {
        ...contextData,
        photo_url: photoUrl,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ai_context')
        .upsert(dataToSave, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      toast.success('AI context saved successfully!');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving AI context:', error);
      toast.error(`Failed to save AI context: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Context for Dream Images</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Help AI generate dream images that better represent you
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Identity */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Identity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name or Nickname</Label>
                <Input
                  id="name"
                  value={contextData.name || ''}
                  onChange={(e) => setContextData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="How you'd like to be referred to"
                />
              </div>
              <div>
                <Label htmlFor="pronouns">Pronouns</Label>
                <Input
                  id="pronouns"
                  value={contextData.pronouns || ''}
                  onChange={(e) => setContextData(prev => ({ ...prev, pronouns: e.target.value }))}
                  placeholder="e.g., they/them, she/her, he/him"
                />
              </div>
              <div>
                <Label htmlFor="age_range">Age Range</Label>
                <Select
                  value={contextData.age_range || ''}
                  onValueChange={(value) => setContextData(prev => ({ ...prev, age_range: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="teen">Teen</SelectItem>
                    <SelectItem value="young_adult">Young Adult</SelectItem>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="middle_aged">Middle Aged</SelectItem>
                    <SelectItem value="elder">Elder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="font-semibold">Appearance</h3>
            
            {/* Photo Upload */}
            <div>
              <Label>Reference Photo (Optional)</Label>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-500">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hair_color">Hair Color</Label>
                <Input
                  id="hair_color"
                  value={contextData.hair_color || ''}
                  onChange={(e) => setContextData(prev => ({ ...prev, hair_color: e.target.value }))}
                  placeholder="e.g., brown, blonde, black"
                />
              </div>
              <div>
                <Label htmlFor="hair_style">Hair Style</Label>
                <Input
                  id="hair_style"
                  value={contextData.hair_style || ''}
                  onChange={(e) => setContextData(prev => ({ ...prev, hair_style: e.target.value }))}
                  placeholder="e.g., long, short, curly, straight"
                />
              </div>
              <div>
                <Label htmlFor="skin_tone">Skin Tone</Label>
                <Input
                  id="skin_tone"
                  value={contextData.skin_tone || ''}
                  onChange={(e) => setContextData(prev => ({ ...prev, skin_tone: e.target.value }))}
                  placeholder="e.g., fair, medium, dark"
                />
              </div>
              <div>
                <Label htmlFor="eye_color">Eye Color</Label>
                <Input
                  id="eye_color"
                  value={contextData.eye_color || ''}
                  onChange={(e) => setContextData(prev => ({ ...prev, eye_color: e.target.value }))}
                  placeholder="e.g., brown, blue, green"
                />
              </div>
              <div>
                <Label htmlFor="height">Height & Build</Label>
                <Input
                  id="height"
                  value={contextData.height || ''}
                  onChange={(e) => setContextData(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="e.g., tall and slim, average height"
                />
              </div>
              <div>
                <Label htmlFor="clothing_style">Typical Clothing Style</Label>
                <Input
                  id="clothing_style"
                  value={contextData.clothing_style || ''}
                  onChange={(e) => setContextData(prev => ({ ...prev, clothing_style: e.target.value }))}
                  placeholder="e.g., casual, business, alternative"
                />
              </div>
            </div>
          </div>

          {/* Voice/Tone */}
          <div className="space-y-4">
            <h3 className="font-semibold">Voice & Tone</h3>
            <div>
              <Label htmlFor="voice_tone">Personality/Tone</Label>
              <Textarea
                id="voice_tone"
                value={contextData.voice_tone || ''}
                onChange={(e) => setContextData(prev => ({ ...prev, voice_tone: e.target.value }))}
                placeholder="e.g., calm and thoughtful, humorous and energetic, analytical and precise"
                rows={3}
              />
            </div>
          </div>

          {/* Aesthetic Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dream Aesthetic Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Select visual styles you prefer for your dream images
            </p>
            <div className="flex flex-wrap gap-2">
              {aestheticOptions.map((aesthetic) => (
                <Badge
                  key={aesthetic}
                  variant={contextData.aesthetic_preferences?.includes(aesthetic) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleAestheticToggle(aesthetic)}
                >
                  {aesthetic}
                  {contextData.aesthetic_preferences?.includes(aesthetic) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save AI Context'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIContextDialog;
