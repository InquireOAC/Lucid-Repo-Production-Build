
import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="mb-6 text-muted-foreground">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
