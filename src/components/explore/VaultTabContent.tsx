import React, { useMemo } from "react";
import FeaturedVideoCard from "./FeaturedVideoCard";
import VideoThumbnailCard from "./VideoThumbnailCard";
import ResearchStudyCard from "./ResearchStudyCard";
import {
  vaultVideos,
  researchStudies,
  type VaultCategory,
} from "@/data/vaultContent";

interface VaultTabContentProps {
  category: VaultCategory;
}

const VaultTabContent: React.FC<VaultTabContentProps> = ({ category }) => {
  const videos = useMemo(
    () => vaultVideos.filter((v) => v.category === category),
    [category]
  );
  const studies = useMemo(
    () => researchStudies.filter((s) => s.category === category),
    [category]
  );
  const [featured, ...rest] = videos;

  return (
    <div className="space-y-6">
      {/* Featured Video */}
      {featured && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Featured</h2>
          <FeaturedVideoCard video={featured} />
        </div>
      )}

      {/* More Videos */}
      {rest.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">More Videos</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {rest.map((video, i) => (
              <VideoThumbnailCard key={i} video={video} />
            ))}
          </div>
        </div>
      )}

      {/* Research & Studies */}
      {studies.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Research & Studies</h2>
          <div className="space-y-3">
            {studies.map((study, i) => (
              <ResearchStudyCard key={i} study={study} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default VaultTabContent;
