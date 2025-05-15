
import { useState } from "react";

/**
 * Encapsulates all dialog/modal open states and their setters.
 */
export function useProfileDialogStates() {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  return {
    isEditProfileOpen, setIsEditProfileOpen,
    isSettingsOpen, setIsSettingsOpen,
    isMessagesOpen, setIsMessagesOpen,
    isSocialLinksOpen, setIsSocialLinksOpen,
    isSubscriptionOpen, setIsSubscriptionOpen,
    isNotificationsOpen, setIsNotificationsOpen,
    showFollowers, setShowFollowers,
    showFollowing, setShowFollowing,
  };
}
