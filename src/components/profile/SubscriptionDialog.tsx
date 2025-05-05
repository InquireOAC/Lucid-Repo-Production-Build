
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import StripeSubscriptionManager from "./StripeSubscriptionManager";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionDialog = ({
  isOpen,
  onOpenChange
}: SubscriptionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="gradient-text">Subscription</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="space-y-6 py-4">
            <StripeSubscriptionManager />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
