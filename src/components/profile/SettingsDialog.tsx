
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut, CreditCard, Bell } from "lucide-react";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  handleSignOut: () => void;
  onSubscriptionClick: () => void;
  onNotificationsClick: () => void;
}

const SettingsDialog = ({
  isOpen,
  onOpenChange,
  handleSignOut,
  onSubscriptionClick,
  onNotificationsClick
}: SettingsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle className="gradient-text">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 justify-start"
            onClick={() => {
              onNotificationsClick();
              onOpenChange(false);
            }}
          >
            <Bell size={16} />
            <span>Notifications</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 justify-start"
            onClick={() => {
              onSubscriptionClick();
              onOpenChange(false);
            }}
          >
            <CreditCard size={16} />
            <span>Subscription</span>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full flex items-center gap-2 justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
