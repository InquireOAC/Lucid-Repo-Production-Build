
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProfileEditing(user: any) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    instagram: "",
    facebook: "",
    website: ""
  });
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          username,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    }
  };
  
  const handleUpdateSocialLinks = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          social_links: socialLinks,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast.success("Social links updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error updating social links");
    }
  };
  
  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };
  
  return {
    displayName,
    setDisplayName,
    username,
    setUsername,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    socialLinks,
    setSocialLinks,
    handleUpdateProfile,
    handleUpdateSocialLinks,
    handleAvatarChange
  };
}
