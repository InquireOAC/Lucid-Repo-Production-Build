
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, LogOut, UserMinus, Trash2, FileText, Scale } from "lucide-react";
import CommunityGuidelinesDialog from "@/components/moderation/CommunityGuidelinesDialog";
import BlockedUsersDialog from "@/components/moderation/BlockedUsersDialog";
import DeleteAccountDialog from "./DeleteAccountDialog";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
  onNotificationsClick?: () => void;
}

const SettingsDialog = ({ open, onOpenChange, onSignOut, onNotificationsClick }: SettingsDialogProps) => {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
              <h4 className="font-medium text-sm text-muted-foreground">Legal</h4>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleExternalLink('https://www.lucidrepo.com/privacy-policy-1')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleExternalLink('https://www.lucidrepo.com/terms-of-service')}
              >
                <Scale className="h-4 w-4 mr-2" />
                Terms of Service
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
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteAccount(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
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

      <DeleteAccountDialog
        open={showDeleteAccount}
        onOpenChange={setShowDeleteAccount}
      />
    </>
  );
};

export default SettingsDialog;
