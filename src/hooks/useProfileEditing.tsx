import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProfileEditing(user: any) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  // Remove avatarUrl logic, instead use symbol and color
  const [avatarSymbol, setAvatarSymbol] = useState<string | null>(null);
  const [avatarColor, setAvatarColor] = useState<string | null>(null);
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
          avatar_symbol: avatarSymbol,
          avatar_color: avatarColor,
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

  // No avatarUrl/setAvatarUrl/handleAvatarChange logic anymore 

  return {
    displayName,
    setDisplayName,
    username,
    setUsername,
    bio,
    setBio,
    avatarSymbol,
    setAvatarSymbol,
    avatarColor,
    setAvatarColor,
    socialLinks,
    setSocialLinks,
    handleUpdateProfile,
    handleUpdateSocialLinks,
  };
}
