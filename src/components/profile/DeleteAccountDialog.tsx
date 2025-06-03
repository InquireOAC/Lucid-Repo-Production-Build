
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountDialog = ({ open, onOpenChange }: DeleteAccountDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error("You must be logged in to delete your account");
      return;
    }

    setIsDeleting(true);

    try {
      console.log("Starting account deletion process...");
      
      // Call the database function to delete all user data
      const { error } = await supabase.rpc('delete_user_account', {
        user_id_to_delete: user.id
      });

      if (error) {
        console.error("Error deleting account:", error);
        throw error;
      }

      console.log("Account deletion completed successfully");
      toast.success("Your account has been permanently deleted");
      
      // Close the dialog
      onOpenChange(false);
      
      // The user will be automatically signed out when their auth record is deleted
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      toast.error(`Failed to delete account: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to permanently delete your account? This action cannot be undone.
            </p>
            <p className="font-medium text-destructive">
              This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Your profile and personal information</li>
              <li>All your dream entries and analyses</li>
              <li>Your followers and following relationships</li>
              <li>All your messages and conversations</li>
              <li>Your subscription data (if applicable)</li>
              <li>All other data associated with your account</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account Permanently"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;
