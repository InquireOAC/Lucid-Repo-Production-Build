import React from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Instagram, Facebook, Globe, Edit } from "lucide-react";
interface ProfileSocialLinksProps {
  socialLinks?: any;
  isOwnProfile: boolean;
  onEdit: () => void;
}
const ProfileSocialLinks = ({
  socialLinks,
  isOwnProfile,
  onEdit
}: ProfileSocialLinksProps) => {
  if (!socialLinks) return null;
  return <div className="flex items-center gap-2 mt-2">
      {socialLinks.twitter && <a href={`https://twitter.com/${socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
          <Twitter size={16} />
        </a>}
      {socialLinks.instagram && <a href={`https://instagram.com/${socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">
          <Instagram size={16} />
        </a>}
      {socialLinks.facebook && <a href={`https://facebook.com/${socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
          <Facebook size={16} />
        </a>}
      {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
          <Globe size={16} />
        </a>}
      {isOwnProfile && <Button variant="ghost" size="sm" onClick={onEdit} className="h-6 text-xs px-2 ml-20">
          <Edit size={10} className="mr-1" /> Edit
        </Button>}
    </div>;
};
export default ProfileSocialLinks;