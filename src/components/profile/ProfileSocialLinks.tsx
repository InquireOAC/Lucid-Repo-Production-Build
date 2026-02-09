
import React from "react";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Globe, Edit } from "lucide-react";

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
  // Show the component if user has any social links OR if it's their own profile (so they can add links)
  const hasLinks = socialLinks && (
    socialLinks.twitter || 
    socialLinks.instagram || 
    socialLinks.facebook || 
    socialLinks.website
  );

  if (!hasLinks && !isOwnProfile) {
    return null;
  }

  return (
    <div className="flex items-center justify-start gap-3 mt-2 mb-2">
      {socialLinks?.twitter && (
        <a 
          href={`https://twitter.com/${socialLinks.twitter}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-white hover:text-gray-300 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      )}
      {socialLinks?.instagram && (
        <a 
          href={`https://instagram.com/${socialLinks.instagram}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-pink-500 hover:text-pink-600 transition-colors"
        >
          <Instagram size={20} />
        </a>
      )}
      {socialLinks?.facebook && (
        <a 
          href={`https://facebook.com/${socialLinks.facebook}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Facebook size={20} />
        </a>
      )}
      {socialLinks?.website && (
        <a 
          href={socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Globe size={20} />
        </a>
      )}
      {isOwnProfile && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onEdit} 
          className="h-8 text-xs px-3 ml-2"
        >
          <Edit size={12} className="mr-1" /> 
          {hasLinks ? 'Edit' : 'Add Links'}
        </Button>
      )}
    </div>
  );
};

export default ProfileSocialLinks;
