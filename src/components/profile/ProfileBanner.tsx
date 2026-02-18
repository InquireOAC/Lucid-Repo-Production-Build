import React, { useRef } from "react";
import { Camera, Trash2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileBannerProps {
  className?: string;
  bannerImage?: string | null;
  isOwnProfile?: boolean;
  onBannerUpdated?: (url: string) => void;
  onBannerRemoved?: () => void;
}

const ProfileBanner = ({ className, bannerImage, isOwnProfile, onBannerUpdated, onBannerRemoved }: ProfileBannerProps) => {
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
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRemove = async () => {
    if (!user) return;

    // Try to remove both jpg and png variants
    await supabase.storage
      .from("profile-banners")
      .remove([`${user.id}/banner.jpg`, `${user.id}/banner.png`, `${user.id}/banner.jpeg`, `${user.id}/banner.webp`]);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ banner_image: null } as any)
      .eq("id", user.id);

    if (updateError) {
      toast.error("Failed to remove banner");
      console.error(updateError);
      return;
    }

    toast.success("Banner removed");
    onBannerRemoved?.();
  };

  return (
    <div className={`profile-banner h-28 sm:h-36 w-full relative z-0 ${className || ''}`}>
      {bannerImage ? (
        <img src={bannerImage} alt="Profile banner" className="w-full h-full object-cover relative z-10" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-aurora-purple/40 via-aurora-violet/30 to-aurora-blue/40" />
      )}

      {isOwnProfile && (
        <>
          <div className="absolute top-3 right-3 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium hover:bg-black/70 transition-colors">
                  <Camera className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                  <Camera className="h-4 w-4 mr-2" />
                  Change photo
                </DropdownMenuItem>
                {bannerImage && (
                  <DropdownMenuItem onClick={handleRemove} className="cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove photo
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
