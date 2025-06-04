
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserMinus, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_symbol: string;
    avatar_color: string;
  } | null;
}

interface BlockedUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BlockedUsersDialog = ({ open, onOpenChange }: BlockedUsersDialogProps) => {
  const { user } = useAuth();
  const { unblockUser, refetchBlockedUsers } = useBlockedUsers();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null);

  const fetchBlockedUsers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blocked_users")
        .select(`
          id,
          blocked_user_id,
          created_at,
          profiles!blocked_users_blocked_user_id_fkey (
            username,
            display_name,
            avatar_symbol,
            avatar_color
          )
        `)
        .eq("blocker_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Fetched blocked users data:", data);
      setBlockedUsers(data || []);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      toast.error("Failed to load blocked users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchBlockedUsers();
    }
  }, [open, user]);

  const handleUnblockUser = async (blockedUserId: string, username: string) => {
    setUnblockingUserId(blockedUserId);
    try {
      await unblockUser(blockedUserId);
      toast.success(`${username} has been unblocked`);
      
      // Remove from local state
      setBlockedUsers(prev => prev.filter(u => u.blocked_user_id !== blockedUserId));
      
      // Refetch to ensure consistency
      refetchBlockedUsers();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user. Please try again.");
    } finally {
      setUnblockingUserId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Blocked Users</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading blocked users...</div>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UserMinus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No blocked users</h3>
              <p className="text-sm text-muted-foreground">
                Users you block will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: blockedUser.profiles?.avatar_color || '#6366f1' }}
                    >
                      {blockedUser.profiles?.avatar_symbol || '👤'}
                    </div>
                    <div>
                      <p className="font-medium">
                        {blockedUser.profiles?.display_name || blockedUser.profiles?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{blockedUser.profiles?.username || 'unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblockUser(
                      blockedUser.blocked_user_id,
                      blockedUser.profiles?.username || 'user'
                    )}
                    disabled={unblockingUserId === blockedUser.blocked_user_id}
                    className="text-green-600 hover:text-green-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {unblockingUserId === blockedUser.blocked_user_id ? "Unblocking..." : "Unblock"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockedUsersDialog;
