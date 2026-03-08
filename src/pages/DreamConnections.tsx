import React, { useMemo } from "react";
import PageTransition from "@/components/ui/PageTransition";
import ConnectionsHeader from "@/components/connections/ConnectionsHeader";
import ConnectionsFilterPills from "@/components/connections/ConnectionsFilterPills";
import SyncAlertCard from "@/components/connections/SyncAlertCard";
import DreamMatchCard from "@/components/connections/DreamMatchCard";
import CollectiveWaveCard from "@/components/connections/CollectiveWaveCard";
import DreamClusterCard from "@/components/connections/DreamClusterCard";
import EmptyConnections from "@/components/connections/EmptyConnections";
import StaggerContainer from "@/components/ui/StaggerContainer";
import { useDreamConnections } from "@/hooks/useDreamConnections";
import { Skeleton } from "@/components/ui/skeleton";

const DreamConnections: React.FC = () => {
  const { matches, waves, syncScore, filteredItems, isLoading, filter, setFilter } = useDreamConnections();

  const stars = useMemo(() =>
    Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2,
    })),
  []);

  return (
    <PageTransition className="relative min-h-screen pt-safe-top overflow-hidden">
      {/* Starry background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08)_0%,_transparent_60%)]" />
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 pb-2">
        <ConnectionsHeader matchCount={matches.length} activeWaves={waves.length} syncScore={syncScore} />
      </div>

      <div className="px-4 space-y-4 pb-6">
        <ConnectionsFilterPills active={filter} onChange={setFilter} />

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyConnections />
        ) : (
          <StaggerContainer className="space-y-3">
            {filteredItems.map((item) => {
              switch (item.type) {
                case "sync":
                  return <SyncAlertCard key={item.data.id} alert={item.data} />;
                case "match":
                  return <DreamMatchCard key={item.data.id} match={item.data} />;
                case "wave":
                  return <CollectiveWaveCard key={item.data.id} wave={item.data} />;
                case "cluster":
                  return <DreamClusterCard key={item.data.id} cluster={item.data} />;
              }
            })}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
};

export default DreamConnections;
