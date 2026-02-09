import React, { useRef } from "react";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProfileBannerProps {
  className?: string;
  bannerImage?: string | null;
  isOwnProfile?: boolean;
  onBannerUpdated?: (url: string) => void;
}

const ProfileBanner = ({ className, bannerImage, isOwnProfile, onBannerUpdated }: ProfileBannerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/banner.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-banners")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload banner image");
      console.error(uploadError);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-banners")
      .getPublicUrl(path);

    const url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ banner_image: url } as any)
      .eq("id", user.id);

    if (updateError) {
      toast.error("Failed to save banner");
      console.error(updateError);
      return;
    }

    toast.success("Banner updated!");
    onBannerUpdated?.(url);
  };

  return (
    <div className={`profile-banner h-28 sm:h-36 w-full relative ${className || ''}`}>
      {bannerImage ? (
        <img src={bannerImage} alt="Profile banner" className="w-full h-full object-cover relative z-10" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-aurora-purple/40 via-aurora-violet/30 to-aurora-blue/40" />
      )}

      {isOwnProfile && (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group"
          >
            <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </>
      )}
    </div>
  );
};

export default ProfileBanner;
