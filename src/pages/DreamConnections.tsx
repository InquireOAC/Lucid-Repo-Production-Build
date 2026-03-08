import React from "react";
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

  return (
    <PageTransition className="min-h-screen pt-safe-top">
      <div className="p-4 pb-2">
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
