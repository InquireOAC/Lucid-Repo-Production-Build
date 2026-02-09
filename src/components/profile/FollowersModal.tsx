
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SymbolAvatar from "./SymbolAvatar";

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
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto ios-scroll-fix">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-muted-foreground py-8">No users found.</div>
          ) : (
            users.map(user => {
              const displayName = user.username || user.display_name || "User";
              const fallbackLetter = displayName.charAt(0).toUpperCase();
              
              return (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full flex items-center gap-3 py-2 justify-start px-1"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/profile/${user.username ?? user.id}`);
                  }}
                >
                  <SymbolAvatar
                    symbol={user.avatar_symbol}
                    color={user.avatar_color}
                    fallbackLetter={fallbackLetter}
                    size={28}
                  />
                  <span className="truncate">{displayName}</span>
                </Button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
