
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Shield, Heart, AlertTriangle, Users, Lock } from "lucide-react";

interface CommunityGuidelinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommunityGuidelinesDialog = ({ open, onOpenChange }: CommunityGuidelinesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Community Guidelines
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-96 w-full rounded border p-6">
          <div className="space-y-6 text-sm">
            
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Our Values</h3>
              </div>
              <p>
                Lucid Repository is a community dedicated to sharing dreams, experiences, and supporting 
                each other's journey into the world of lucid dreaming. We believe in creating a safe, 
                respectful, and inclusive space for dreamers of all backgrounds.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Respectful Behavior</h3>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>Treat all community members with kindness and respect</li>
                <li>Be supportive and encouraging when others share their experiences</li>
                <li>Engage in constructive discussions and avoid personal attacks</li>
                <li>Respect different perspectives and experiences with dreaming</li>
                <li>Use inclusive language that welcomes everyone</li>
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-lg">Prohibited Content</h3>
              </div>
              <p className="font-medium text-red-600">We have zero tolerance for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Hate Speech:</strong> Any content targeting individuals based on race, religion, gender, sexual orientation, disability, or other protected characteristics</li>
                <li><strong>Harassment & Bullying:</strong> Threatening, intimidating, or repeatedly targeting other users</li>
                <li><strong>Explicit Content:</strong> Sexual, graphic, or inappropriate content not suitable for all audiences</li>
                <li><strong>Spam & Self-Promotion:</strong> Repetitive posts, advertisements, or content unrelated to dreaming</li>
                <li><strong>Misinformation:</strong> False or misleading information about health, safety, or dream practices</li>
                <li><strong>Personal Information:</strong> Sharing others' private information without consent</li>
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Privacy & Safety</h3>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>Only share personal information you're comfortable making public</li>
                <li>Respect others' privacy and boundaries</li>
                <li>Report any content that makes you feel unsafe or violates guidelines</li>
                <li>Use privacy settings to control who can see your content</li>
                <li>Be mindful when sharing sensitive dream content</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">Reporting & Moderation</h3>
              <p>
                If you encounter content that violates these guidelines, please use the flag button 
                to report it. Our moderation team reviews all reports and takes appropriate action, 
                which may include content removal, warnings, or account suspension.
              </p>
              <p>
                You can also block users whose content you don't want to see. This helps you 
                curate your own experience while we handle policy violations.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-lg">Consequences</h3>
              <p>
                Violations of these guidelines may result in:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Content removal</li>
                <li>Account warnings</li>
                <li>Temporary suspension</li>
                <li>Permanent account ban</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                We reserve the right to take action at our discretion to maintain community safety.
              </p>
            </section>

            <section className="bg-muted p-4 rounded-lg">
              <p className="font-medium">
                Remember: This community thrives when we all contribute to a positive, 
                supportive environment. Thank you for helping make Lucid Repository a 
                welcoming space for all dreamers!
              </p>
            </section>

            <p className="text-xs text-muted-foreground">
              Last updated: December 2024 | Questions? Contact our support team.
            </p>
          </div>
        </ScrollArea>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityGuidelinesDialog;
