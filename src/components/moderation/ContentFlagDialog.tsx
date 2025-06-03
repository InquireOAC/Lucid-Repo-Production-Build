
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'dream' | 'comment';
  contentId: string;
  contentOwnerId: string;
}

const FLAG_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'obscene_nudity', label: 'Obscene/Nudity' },
  { value: 'vulgar_language', label: 'Vulgar Language' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'harassment', label: 'Harassment' }
];

const ContentFlagDialog = ({ 
  open, 
  onOpenChange, 
  contentType, 
  contentId, 
  contentOwnerId 
}: ContentFlagDialogProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason for flagging this content");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to flag content");

      const { error } = await supabase
        .from("content_flags")
        .insert({
          reporter_user_id: user.id,
          flagged_content_type: contentType,
          flagged_content_id: contentId,
          flagged_user_id: contentOwnerId,
          reason: selectedReason,
          additional_notes: additionalNotes.trim() || null
        });

      if (error) throw error;

      toast.success("Content has been flagged for review. Thank you for helping keep our community safe.");
      onOpenChange(false);
      setSelectedReason('');
      setAdditionalNotes('');
    } catch (error) {
      console.error("Error flagging content:", error);
      toast.error("Failed to flag content. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Why are you flagging this content?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {FLAG_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label htmlFor={reason.value}>{reason.label}</Label>
              </div>
            ))}
          </RadioGroup>

          <div>
            <Label htmlFor="additional-notes" className="text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="additional-notes"
              placeholder="Provide more context about why you're flagging this content..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="mt-1"
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Flag"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentFlagDialog;
