
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TermsAcceptanceDialogProps {
  open: boolean;
  onAccept: () => void;
}

const TermsAcceptanceDialog = ({ open, onAccept }: TermsAcceptanceDialogProps) => {
  const [hasRead, setHasRead] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!hasRead) {
      toast.error("Please confirm you have read and agree to the terms");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("terms_acceptance")
        .insert({
          user_id: user.id,
          terms_version: "1.0"
        });

      if (error) throw error;

      toast.success("Terms accepted successfully");
      onAccept();
    } catch (error) {
      console.error("Error accepting terms:", error);
      toast.error("Failed to accept terms. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Use Agreement</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96 w-full rounded border p-4">
          <div className="space-y-4 text-sm">
            <h3 className="font-semibold text-lg">Welcome to Lucid Repository</h3>
            
            <p>
              By creating an account, you agree to abide by our community standards and guidelines. 
              We are committed to maintaining a safe, respectful, and inclusive environment for all users.
            </p>

            <h4 className="font-semibold text-base text-red-600">Zero Tolerance Policy</h4>
            <p>
              <strong>We have ZERO TOLERANCE for:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Hate speech, discrimination, or content targeting individuals based on race, religion, gender, sexual orientation, or other protected characteristics</li>
              <li>Harassment, bullying, or threatening behavior toward other users</li>
              <li>Abusive, violent, or harmful language or imagery</li>
              <li>Sexual content, explicit material, or inappropriate imagery</li>
              <li>Spam, promotional content, or attempts to deceive other users</li>
              <li>Sharing personal information of others without consent</li>
            </ul>

            <h4 className="font-semibold text-base">Community Expectations</h4>
            <p>We expect all users to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Treat others with respect and kindness</li>
              <li>Share dream content that is appropriate for all audiences</li>
              <li>Report any content that violates these guidelines</li>
              <li>Respect others' privacy and personal boundaries</li>
              <li>Use the platform for its intended purpose of sharing dreams and experiences</li>
            </ul>

            <h4 className="font-semibold text-base">Consequences</h4>
            <p>
              Violations of these terms may result in content removal, account suspension, or permanent ban 
              from the platform. We reserve the right to take action at our discretion to maintain community safety.
            </p>

            <p className="text-xs text-muted-foreground mt-6">
              Last updated: December 2024 | Version 1.0
            </p>
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="terms-agree" 
            checked={hasRead}
            onCheckedChange={(checked) => setHasRead(checked as boolean)}
          />
          <label htmlFor="terms-agree" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            I have read and agree to the Terms of Use and Community Guidelines
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button 
            onClick={handleAccept}
            disabled={!hasRead || isSubmitting}
            className="min-w-24"
          >
            {isSubmitting ? "Processing..." : "I Agree"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAcceptanceDialog;
