import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Heart, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DreamDetail from "@/components/DreamDetail";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SymbolAvatar from "./SymbolAvatar"; // Import SymbolAvatar

interface DreamGridProps {
  dreams: any[];
  isLiked?: boolean;
  isOwnProfile: boolean;
  emptyTitle: string;
  emptyMessage: {
    own: string;
    other: string;
  };
  emptyIcon: React.ReactNode;
  actionLink: string;
  actionText: string;
  refreshDreams?: () => void;
}

const showUpdateDreamErrorToast = () => {
  toast.error("Failed to update dream");
};

const DreamGrid = ({
  dreams,
  isLiked = false,
  isOwnProfile,
  emptyTitle,
  emptyMessage,
  emptyIcon,
  actionLink,
  actionText,
  refreshDreams,
}: DreamGridProps) => {
  const [selectedDream, setSelectedDream] = useState<any>(null);
  
  // Handle dream deletion
  const handleDeleteDream = async (id: string) => {
    try {
      // Delete the dream from Supabase
      const { error } = await supabase
        .from("dream_entries")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Close the dream detail modal
      setSelectedDream(null);
      
      // Remove the dream from the local list
      // This avoids having to refresh the page
      const updatedDreams = dreams.filter(dream => dream.id !== id);
      dreams.splice(0, dreams.length, ...updatedDreams);
      
      // Show success message
      toast.success("Dream deleted successfully");
      
      // Refresh dreams if the callback is provided
      if (refreshDreams) {
        refreshDreams();
      }
    } catch (error) {
      console.error("Error deleting dream:", error);
      toast.error("Failed to delete dream");
    }
  };
  
  // Handle dream update
  const handleUpdateDream = async (id: string, updates: any) => {
    // Only allow update if it's the owner's dream
    if (!isOwnProfile) {
      // Silently return (DO NOT show failed toast)
      return;
    }
    try {
      // Update the dream in Supabase
      const { error } = await supabase
        .from("dream_entries")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
      
      // Update the dream in the local list
      const dreamIndex = dreams.findIndex(dream => dream.id === id);
      if (dreamIndex !== -1) {
        dreams[dreamIndex] = { ...dreams[dreamIndex], ...updates };
      }
      
      // Update the selected dream if it's the one being edited
      if (selectedDream && selectedDream.id === id) {
        setSelectedDream({ ...selectedDream, ...updates });
      }
      
      // Show success message
      toast.success("Dream updated successfully");
      
      // Refresh dreams if the callback is provided
      if (refreshDreams) {
        refreshDreams();
      }
    } catch (error) {
      console.error("Error updating dream:", error);
      // Only show the error toast if isOwnProfile (already checked above)
      showUpdateDreamErrorToast();
    }
  };

  if (dreams.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyIcon}
        <h3 className="text-lg font-medium mb-1">{emptyTitle}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {isOwnProfile ? emptyMessage.own : emptyMessage.other}
        </p>
        <Link to={actionLink}>
          <Button variant="outline">{actionText}</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {dreams.map((dream: any) => (
          <Card 
            key={dream.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-all relative"
            onClick={() => setSelectedDream(dream)}
          >
            <CardContent className="p-0">
              {dream.generatedImage ? (
                <div className="relative">
                  <img 
                    src={dream.generatedImage} 
                    alt={dream.title}
                    className="aspect-square object-cover w-full"
                  />
                </div>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-dream-purple/10 relative">
                  <Moon size={32} className="text-dream-purple opacity-50" />
                </div>
              )}
              <div className="p-2">
                <p className="text-sm font-semibold truncate">{dream.title}</p>
                <div className="flex items-center justify-between mt-1">
                  {isLiked ? (
                    <div className="flex items-center gap-1">
                      {/* Use SymbolAvatar for liked dreams (showing dream creator info) */}
                      <SymbolAvatar
                        symbol={dream.profiles?.avatar_symbol}
                        color={dream.profiles?.avatar_color}
                        fallbackLetter={
                          (
                            dream.profiles?.display_name?.[0] ||
                            dream.profiles?.username?.[0] ||
                            "U"
                          ).toUpperCase()
                        }
                        size={16}
                        className="h-4 w-4"
                      />
                      <span className="text-xs text-muted-foreground truncate max-w-[70px]">
                        {dream.profiles?.display_name || dream.profiles?.username || "User"}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      {new Date(dream.created_at).toLocaleDateString()}
                    </Badge>
                  )}
                  {isLiked && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(dream.created_at).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedDream && (
        <DreamDetail
          dream={selectedDream}
          tags={[]} // Pass tags if available
          onClose={() => setSelectedDream(null)}
          onUpdate={handleUpdateDream}
          onDelete={isOwnProfile ? handleDeleteDream : undefined}
          isAuthenticated={true}
        />
      )}
    </>
  );
};
export default DreamGrid;
