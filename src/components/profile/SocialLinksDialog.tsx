
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Twitter, Instagram, Facebook, Globe } from "lucide-react";

interface SocialLinks {
  twitter: string;
  instagram: string;
  facebook: string;
  website: string;
}

interface SocialLinksDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  socialLinks: SocialLinks;
  setSocialLinks: (value: SocialLinks) => void;
  handleUpdateSocialLinks: () => Promise<void>;
}

const SocialLinksDialog = ({
  isOpen,
  onOpenChange,
  socialLinks,
  setSocialLinks,
  handleUpdateSocialLinks
}: SocialLinksDialogProps) => {
  const [localLinks, setLocalLinks] = useState<SocialLinks>({
    twitter: "",
    instagram: "",
    facebook: "",
    website: ""
  });

  useEffect(() => {
    if (isOpen && socialLinks) {
      setLocalLinks({
        twitter: socialLinks.twitter || "",
        instagram: socialLinks.instagram || "",
        facebook: socialLinks.facebook || "",
        website: socialLinks.website || ""
      });
    }
  }, [isOpen, socialLinks]);

  const handleChange = (network: keyof SocialLinks, value: string) => {
    setLocalLinks(prev => ({
      ...prev,
      [network]: value
    }));
  };

  const handleSave = async () => {
    // Update parent state
    setSocialLinks(localLinks);
    
    // Call the update function
    await handleUpdateSocialLinks();
    
    // Close the dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Social Links</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <Twitter size={16} className="text-blue-400" />
              Twitter Username
            </Label>
            <Input
              id="twitter"
              value={localLinks.twitter}
              onChange={(e) => handleChange("twitter", e.target.value)}
              placeholder="username (without @)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <Instagram size={16} className="text-pink-500" />
              Instagram Username
            </Label>
            <Input
              id="instagram"
              value={localLinks.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
              placeholder="username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <Facebook size={16} className="text-blue-600" />
              Facebook Username
            </Label>
            <Input
              id="facebook"
              value={localLinks.facebook}
              onChange={(e) => handleChange("facebook", e.target.value)}
              placeholder="username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe size={16} className="text-gray-600" />
              Website URL
            </Label>
            <Input
              id="website"
              value={localLinks.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-dream-lavender to-dream-purple"
          >
            Save Links
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialLinksDialog;
