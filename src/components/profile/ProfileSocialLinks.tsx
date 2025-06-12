
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
  console.log("ProfileSocialLinks - socialLinks:", socialLinks);
  console.log("ProfileSocialLinks - isOwnProfile:", isOwnProfile);
  
  // Show the component if user has any social links OR if it's their own profile (so they can add links)
  const hasLinks = socialLinks && (
    socialLinks.twitter || 
    socialLinks.instagram || 
    socialLinks.facebook || 
    socialLinks.website
  );

  console.log("ProfileSocialLinks - hasLinks:", hasLinks);

  // Always show if it's own profile OR if has links
  if (!hasLinks && !isOwnProfile) {
    console.log("ProfileSocialLinks - not rendering (no links and not own profile)");
    return null;
  }

  console.log("ProfileSocialLinks - rendering component");

  return (
    <div className="flex items-center justify-center gap-3 mt-4 mb-4 w-full">
      <div className="flex items-center gap-3">
        {socialLinks?.twitter && (
          <a 
            href={`https://twitter.com/${socialLinks.twitter}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:text-blue-500 transition-colors"
          >
            <Twitter size={24} />
          </a>
        )}
        {socialLinks?.instagram && (
          <a 
            href={`https://instagram.com/${socialLinks.instagram}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-pink-500 hover:text-pink-600 transition-colors"
          >
            <Instagram size={24} />
          </a>
        )}
        {socialLinks?.facebook && (
          <a 
            href={`https://facebook.com/${socialLinks.facebook}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Facebook size={24} />
          </a>
        )}
        {socialLinks?.website && (
          <a 
            href={socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe size={24} />
          </a>
        )}
        {isOwnProfile && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit} 
            className="h-10 text-sm px-4"
          >
            <Edit size={16} className="mr-2" /> 
            {hasLinks ? 'Edit Links' : 'Add Links'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileSocialLinks;
