
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { toast } from "sonner";

interface UnblockUserButtonProps {
  userToUnblock: {
    id: string;
    username?: string;
    display_name?: string;
  };
  onUserUnblocked?: () => void;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default";
}

const UnblockUserButton = ({ 
  userToUnblock, 
  onUserUnblocked, 
  variant = "outline", 
  size = "sm" 
}: UnblockUserButtonProps) => {
  const { user } = useAuth();
  const { unblockUser } = useBlockedUsers();
  const [isUnblocking, setIsUnblocking] = useState(false);

  const handleUnblock = async () => {
    if (!user) {
      toast.error("You must be logged in to unblock users");
      return;
    }

    if (user.id === userToUnblock.id) {
      toast.error("You cannot unblock yourself");
      return;
    }

    setIsUnblocking(true);
    try {
      await unblockUser(userToUnblock.id);
      toast.success(`${userToUnblock.username || userToUnblock.display_name || 'User'} has been unblocked`);
      onUserUnblocked?.();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user. Please try again.");
    } finally {
      setIsUnblocking(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleUnblock}
      disabled={isUnblocking}
      className="text-green-600 hover:text-green-700 text-xs px-2"
    >
      <UserPlus className="h-3 w-3 mr-1" />
      {isUnblocking ? "Unblocking..." : "Unblock"}
    </Button>
  );
};

export default UnblockUserButton;
