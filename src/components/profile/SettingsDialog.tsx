
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut } from "lucide-react";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  handleSignOut: () => void;
  onNotificationsClick: () => void;
}

const SettingsDialog = ({
  isOpen,
  onOpenChange,
  handleSignOut,
  // onNotificationsClick, // notifications handler no longer needed for now
}: SettingsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle className="gradient-text">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-2">
          {/* Notifications button is hidden for now */}
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
