
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe, Lock } from "lucide-react";

interface DreamDetailActionsProps {
  isAuthenticated?: boolean;
  isPublic?: boolean;
  onDelete?: () => void;
  onTogglePublic?: () => void;
}

const DreamDetailActions = ({
  isAuthenticated,
  isPublic,
  onTogglePublic
}: DreamDetailActionsProps) => {
  if (!isAuthenticated) return null;

  return (
    <div className="flex justify-end items-center mt-6">
      <div className="flex gap-2">
        {onTogglePublic && (
          <Button
            variant={isPublic ? "outline" : "default"}
            size="sm"
            onClick={onTogglePublic}
          >
            {isPublic ? (
              <>
                <Lock size={14} className="mr-1" /> Make Private
              </>
            ) : (
              <>
                <Globe size={14} className="mr-1" /> Share
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DreamDetailActions;
