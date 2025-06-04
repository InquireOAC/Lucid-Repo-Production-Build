
import React, { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToBlock: {
    id: string;
    username?: string;
    display_name?: string;
  };
  onUserBlocked: () => void;
  onFollowStateChanged?: () => void;
}

const BlockUserDialog = ({ open, onOpenChange, userToBlock, onUserBlocked, onFollowStateChanged }: BlockUserDialogProps) => {
  const [isBlocking, setIsBlocking] = useState(false);
  const { blockUser, refetchBlockedUsers } = useBlockedUsers();

  const handleBlockUser = async () => {
    setIsBlocking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to block users");

      // First, remove follow relationships
      const { error: unfollowError } = await supabase
        .from("follows")
        .delete()
        .or(`and(follower_id.eq.${user.id},followed_id.eq.${userToBlock.id}),and(follower_id.eq.${userToBlock.id},followed_id.eq.${user.id})`);

      if (unfollowError) {
        console.error("Error removing follow relationships:", unfollowError);
      }

      // Then block the user
      const { error } = await supabase
        .from("blocked_users")
        .insert({
          blocker_user_id: user.id,
          blocked_user_id: userToBlock.id,
          reason: "User blocked from profile"
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error("You have already blocked this user");
        } else {
          throw error;
        }
      } else {
        // Update local state immediately
        blockUser(userToBlock.id);
        
        // Refetch to ensure consistency
        refetchBlockedUsers();
        
        // Trigger follow state refresh if callback provided
        if (onFollowStateChanged) {
          onFollowStateChanged();
        }
        
        toast.success(`${userToBlock.username || userToBlock.display_name || 'User'} has been blocked`);
        onUserBlocked();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user. Please try again.");
    } finally {
      setIsBlocking(false);
    }
  };

  const displayName = userToBlock.username || userToBlock.display_name || 'this user';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to block <strong>{displayName}</strong>? 
            You will no longer see their posts, comments, or be able to interact with them. 
            This action will also automatically unfollow them and delete any message history between you.
            This action can be undone from your settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBlockUser}
            disabled={isBlocking}
            className="bg-red-600 hover:bg-red-700"
          >
            {isBlocking ? "Blocking..." : "Block User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BlockUserDialog;
