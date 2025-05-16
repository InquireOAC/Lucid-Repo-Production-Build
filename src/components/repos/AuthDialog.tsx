
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background text-foreground shadow-2xl rounded-2xl border border-white/10 dark:bg-[#181827] dark:text-white dark:border-white/15">
        <DialogHeader>
          <DialogTitle className="font-bold text-lg text-gradient">Sign in required</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You need to sign in to like dreams and interact with the community.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end pt-2">
          <Button 
            onClick={() => window.location.href = "/auth"}
            className="w-full dark:bg-dream-purple dark:text-white dark:hover:bg-dream-purple/90"
          >
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

