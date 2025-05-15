
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FollowersModalProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: any[];
  loading?: boolean;
}

const FollowersModal = ({ title, open, onOpenChange, users, loading }: FollowersModalProps) => {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-muted-foreground py-8">No users found.</div>
          ) : (
            users.map(user => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full flex items-center gap-3 py-2 justify-start px-1"
                onClick={() => {
                  onOpenChange(false);
                  navigate(`/profile/${user.username ?? user.id}`);
                }}
              >
                <Avatar className="h-7 w-7 ">
                  <AvatarImage src={user.profile_picture || user.avatar_url} />
                  <AvatarFallback>
                    {(user.username || user.display_name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{user.username || user.display_name || "User"}</span>
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
