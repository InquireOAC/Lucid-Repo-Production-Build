import { useState } from "react";
import { DreamEntry } from "@/types/dream";
import { useNavigate } from "react-router-dom";
import { useLikes } from "@/hooks/useLikes";
import { toast } from "sonner";

export function useLucidRepoDreamActions(
  user: any,
  dreamsState: DreamEntry[],
  setDreamsState: (updater: (dreams: DreamEntry[]) => DreamEntry[]) => void,
  refreshLikedDreams: () => void,
  handleUpdateDream: (id: string, updates: Partial<DreamEntry>) => Promise<boolean>,
  fetchPublicDreams: () => void
) {
  const navigate = useNavigate();
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState<number>(0);

  // useLikes hook to keep liked state in sync and handle like logic
  const { handleLike } = useLikes(user, dreamsState, setDreamsState, refreshLikedDreams);

  const handleOpenDream = (dream: DreamEntry) => {
    // Save current scroll position
    setSavedScrollPosition(window.scrollY);
    setSelectedDream({ ...dream });
  };

  const handleCloseDream = () => {
    setSelectedDream(null);
    // Restore scroll position after a brief delay to ensure modal is closed
    setTimeout(() => {
      window.scrollTo(0, savedScrollPosition);
    }, 100);
  };

  const handleNavigateToProfile = (username: string | undefined) => {
    if (username) navigate(`/profile/${username}`);
  };

  // The MAIN handler: when liking a dream from modal, update state
  const handleDreamLike = async (dreamId: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    
    const success = await handleLike(dreamId);
    if (success) {
      // Find the updated dream with the new like count
      const updatedDream = dreamsState.find(d => d.id === dreamId);
      if (updatedDream) {
        // Update the selected dream if it's the one being liked
        if (selectedDream && selectedDream.id === dreamId) {
          setSelectedDream({ 
            ...updatedDream,
            // Ensure both like count fields are consistent
            like_count: updatedDream.like_count,
            likeCount: updatedDream.like_count
          });
        }
      }
    }
  };

  // Handler for liking dreams from the card list (not modal)
  const handleDreamLikeFromCard = async (dreamId: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    
    await handleLike(dreamId);
  };

  const handleDreamUpdate = (id: string, updates: Partial<DreamEntry>) => {
    const dreamToUpdate = dreamsState.find(d => d.id === id);
    if (!dreamToUpdate) {
      toast.error("Dream not found");
      return;
    }
    if (user && dreamToUpdate.user_id !== user.id) {
      return;
    }
    handleUpdateDream(id, updates).then(success => {
      if (success) {
        fetchPublicDreams();
        if (updates.is_public === false || updates.isPublic === false) {
          toast.success("Dream is now private");
        }
      } else {
        toast.error("Failed to update dream");
      }
    });
  };

  return {
    selectedDream,
    authDialogOpen,
    setAuthDialogOpen,
    handleOpenDream,
    handleCloseDream,
    handleNavigateToProfile,
    handleDreamLike,
    handleDreamLikeFromCard,
    handleDreamUpdate
  };
}
