
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DreamDetailActionsProps {
  isAuthenticated?: boolean;
  isPublic?: boolean;
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
      <div className="flex items-center gap-3">
        {onTogglePublic && (
          <>
            <span className="text-sm text-muted-foreground flex items-center">
              {isPublic ? (
                <>
                  <Globe size={14} className="mr-1" /> Public
                </>
              ) : (
                <>
                  <Lock size={14} className="mr-1" /> Private
                </>
              )}
            </span>
            <Switch
              checked={isPublic}
              onCheckedChange={onTogglePublic}
              aria-label="Toggle public/private"
              className="data-[state=checked]:bg-dream-lavender"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DreamDetailActions;
