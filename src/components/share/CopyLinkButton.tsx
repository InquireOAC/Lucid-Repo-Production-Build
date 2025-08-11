
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, Check } from "lucide-react";
import { toast } from "sonner";
import { DreamEntry } from "@/types/dream";

interface CopyLinkButtonProps {
  dream: DreamEntry;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  dream,
  variant = "outline",
  size = "default",
  className = ""
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      // Create a universal link that supports deep linking
      // This link will open the app if installed, or redirect to app store if not
      const baseUrl = "https://lucidrepo.app"; // You'll need to set up this domain
      const dreamLink = `${baseUrl}/dream/${dream.id}`;
      
      await navigator.clipboard.writeText(dreamLink);
      
      setIsCopied(true);
      toast.success("Dream link copied to clipboard!");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  return (
    <Button 
      onClick={handleCopyLink} 
      variant={variant} 
      size={size} 
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {isCopied ? <Check size={18} /> : <Link size={18} />}
      <span>{isCopied ? "Copied!" : "Copy Link"}</span>
    </Button>
  );
};

export default CopyLinkButton;
