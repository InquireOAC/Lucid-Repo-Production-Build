import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import ContentFlagDialog from "./ContentFlagDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
interface FlagButtonProps {
  contentType: 'dream' | 'comment' | 'video_comment';
  contentId: string;
  contentOwnerId: string;
  size?: 'sm' | 'default';
}
const FlagButton = ({
  contentType,
  contentId,
  contentOwnerId,
  size = 'sm'
}: FlagButtonProps) => {
  const {
    user
  } = useAuth();
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const handleFlagClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

    if (!user) {
      toast.error("You must be logged in to flag content");
      return;
    }
    if (user.id === contentOwnerId) {
      toast.error("You cannot flag your own content");
      return;
    }
    setFlagDialogOpen(true);
  };
  return <>
      <Button variant="ghost" size={size} onClick={handleFlagClick} className="text-muted-foreground hover:text-red-500 p-2 h-8 w-8" title="Flag inappropriate content">
        <Flag className="h-4 w-6\n" />
      </Button>

      <ContentFlagDialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen} contentType={contentType} contentId={contentId} contentOwnerId={contentOwnerId} />
    </>;
};
export default FlagButton;