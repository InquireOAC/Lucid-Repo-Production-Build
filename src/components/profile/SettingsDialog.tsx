
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, LogOut, UserMinus, Trash2, FileText, Scale, User, Link, Bell, AlarmClock, Palette, ArrowLeft, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import CommunityGuidelinesDialog from "@/components/moderation/CommunityGuidelinesDialog";
import BlockedUsersDialog from "@/components/moderation/BlockedUsersDialog";
import DeleteAccountDialog from "./DeleteAccountDialog";
import AIContextDialog from "./AIContextDialog";
import SocialLinksDialog from "./SocialLinksDialog";
import NotificationsDialog from "./NotificationsDialog";
import WakeTimerDialog from "./WakeTimerDialog";
import ColorSchemeDialog from "./ColorSchemeDialog";
import ExportJournalDialog from "./ExportJournalDialog";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
  onNotificationsClick?: () => void;
  socialLinks?: any;
  setSocialLinks?: (v: any) => void;
  handleUpdateSocialLinks?: () => void;
}

const SettingsDialog = ({
  open,
  onOpenChange,
  onSignOut,
  onNotificationsClick,
  socialLinks,
  setSocialLinks,
  handleUpdateSocialLinks
}: SettingsDialogProps) => {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showAIContext, setShowAIContext] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWakeTimer, setShowWakeTimer] = useState(false);
  const [showColorScheme, setShowColorScheme] = useState(false);
  const [showExportJournal, setShowExportJournal] = useState(false);

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return <>
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-xl">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold text-foreground">Settings</h1>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
            <div className="px-6 py-6 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Profile</h4>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowSocialLinks(true)}>
                  <Link className="h-4 w-4 mr-2" />
                  Social Links
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Appearance</h4>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowColorScheme(true)}>
                  <Palette className="h-4 w-4 mr-2" />
                  Color Scheme
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Notifications</h4>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowNotifications(true)}>
                  <Bell className="h-4 w-4 mr-2" />
                  Push Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowWakeTimer(true)}>
                  <AlarmClock className="h-4 w-4 mr-2" />
                  Wake Timer
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Dream Avatar</h4>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowAIContext(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Avatar
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Data</h4>
                <Button variant="ghost" className="w-full justify-start opacity-60 cursor-not-allowed" disabled>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Export Dream Journal
                  <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Coming Soon</span>
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Community</h4>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowGuidelines(true)}>
                  <Shield className="h-4 w-4 mr-2" />
                  Community Guidelines
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setShowBlockedUsers(true)}>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Blocked Users
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Legal</h4>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleExternalLink('https://www.lucidrepo.com/privacy-policy-1')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleExternalLink('https://www.lucidrepo.com/terms-of-service')}>
                  <Scale className="h-4 w-4 mr-2" />
                  Terms of Service
                </Button>
              </div>

              <Separator />

              <div className="space-y-2 pb-24">
                <h4 className="font-medium text-sm text-muted-foreground">Account</h4>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={() => {
                  onSignOut();
                  onOpenChange(false);
                }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteAccount(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <CommunityGuidelinesDialog open={showGuidelines} onOpenChange={setShowGuidelines} />
    <BlockedUsersDialog open={showBlockedUsers} onOpenChange={setShowBlockedUsers} />
    <DeleteAccountDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount} />
    <AIContextDialog open={showAIContext} onOpenChange={setShowAIContext} />
    <NotificationsDialog isOpen={showNotifications} onOpenChange={setShowNotifications} />
    <WakeTimerDialog isOpen={showWakeTimer} onOpenChange={setShowWakeTimer} />
    <ColorSchemeDialog open={showColorScheme} onOpenChange={setShowColorScheme} />
    <ExportJournalDialog open={showExportJournal} onOpenChange={setShowExportJournal} />
    {socialLinks && setSocialLinks && handleUpdateSocialLinks && <SocialLinksDialog isOpen={showSocialLinks} onOpenChange={setShowSocialLinks} socialLinks={socialLinks} setSocialLinks={setSocialLinks} handleUpdateSocialLinks={handleUpdateSocialLinks} />}
  </>;
};

export default SettingsDialog;
