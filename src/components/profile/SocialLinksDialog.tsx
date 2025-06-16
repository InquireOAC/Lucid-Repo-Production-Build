
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Instagram, Facebook, Globe } from "lucide-react";

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
  handleUpdateSocialLinks: () => void;
}

const SocialLinksDialog = ({
  isOpen,
  onOpenChange,
  socialLinks,
  setSocialLinks,
  handleUpdateSocialLinks
}: SocialLinksDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">Social Links</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <X size={16} className="text-white" />
              X (Twitter) Username
            </Label>
            <Input
              id="twitter"
              value={socialLinks.twitter}
              onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
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
              value={socialLinks.instagram}
              onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
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
              value={socialLinks.facebook}
              onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
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
              value={socialLinks.website}
              onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateSocialLinks}
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
