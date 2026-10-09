
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EmptyDreamGrid from "./EmptyDreamGrid";
import DreamCardItem from "./DreamCardItem";

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
  const navigate = useNavigate();

  if (dreams.length === 0) {
    return (
      <EmptyDreamGrid
        emptyIcon={emptyIcon}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
        isOwnProfile={isOwnProfile}
        actionLink={actionLink}
        actionText={actionText}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {dreams.map((dream: any) => (
        <DreamCardItem
          key={dream.id}
          dream={dream}
          isLiked={isLiked}
          onClick={() => navigate(`/dream/${dream.id}`)}
        />
      ))}
    </div>
  );
};
export default DreamGrid;
