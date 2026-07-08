import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeletonStats: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Hero */}
      <Skeleton className="h-44 rounded-2xl" />
      {/* Frequency */}
      <Skeleton className="h-56 rounded-2xl" />
      {/* Recall */}
      <Skeleton className="h-40 rounded-2xl" />
      {/* Technique */}
      <Skeleton className="h-36 rounded-2xl" />
      {/* Triggers */}
      <Skeleton className="h-28 rounded-2xl" />
      {/* Lucidity */}
      <Skeleton className="h-36 rounded-2xl" />
    </div>
  );
};

export default LoadingSkeletonStats;
