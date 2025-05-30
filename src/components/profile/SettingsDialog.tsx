
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, LogOut, UserMinus } from "lucide-react";
import CommunityGuidelinesDialog from "@/components/moderation/CommunityGuidelinesDialog";
import BlockedUsersDialog from "@/components/moderation/BlockedUsersDialog";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
  onNotificationsClick?: () => void;
}

const SettingsDialog = ({ open, onOpenChange, onSignOut, onNotificationsClick }: SettingsDialogProps) => {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Community</h4>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setShowGuidelines(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Community Guidelines
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setShowBlockedUsers(true)}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Blocked Users
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Account</h4>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => {
                  onSignOut();
                  onOpenChange(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CommunityGuidelinesDialog
        open={showGuidelines}
        onOpenChange={setShowGuidelines}
      />

      <BlockedUsersDialog
        open={showBlockedUsers}
        onOpenChange={setShowBlockedUsers}
      />
    </>
  );
};

export default SettingsDialog;
