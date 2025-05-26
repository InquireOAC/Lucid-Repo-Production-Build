
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyDreamGridProps {
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyMessage: {
    own: string;
    other: string;
  };
  isOwnProfile: boolean;
  actionLink: string;
  actionText: string;
}

const EmptyDreamGrid: React.FC<EmptyDreamGridProps> = ({
  emptyIcon,
  emptyTitle,
  emptyMessage,
  isOwnProfile,
  actionLink,
  actionText,
}) => (
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

export default EmptyDreamGrid;
