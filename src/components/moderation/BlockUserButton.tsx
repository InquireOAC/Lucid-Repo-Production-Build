
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";
import BlockUserDialog from "./BlockUserDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BlockUserButtonProps {
  userToBlock: {
    id: string;
    username?: string;
    display_name?: string;
  };
  onUserBlocked?: () => void;
  onFollowStateChanged?: () => void;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default";
}

const BlockUserButton = ({ userToBlock, onUserBlocked, onFollowStateChanged, variant = "outline", size = "sm" }: BlockUserButtonProps) => {
  const { user } = useAuth();
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  const handleBlockClick = () => {
    if (!user) {
      toast.error("You must be logged in to block users");
      return;
    }

    if (user.id === userToBlock.id) {
      toast.error("You cannot block yourself");
      return;
    }

    setBlockDialogOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleBlockClick}
        className="text-red-600 hover:text-red-700"
      >
        <UserMinus className="h-4 w-4 mr-1" />
        Block User
      </Button>

      <BlockUserDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        userToBlock={userToBlock}
        onUserBlocked={() => {
          onUserBlocked?.();
          setBlockDialogOpen(false);
        }}
        onFollowStateChanged={onFollowStateChanged}
      />
    </>
  );
};

export default BlockUserButton;
