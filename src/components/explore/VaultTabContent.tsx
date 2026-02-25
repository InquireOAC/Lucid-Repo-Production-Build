import React, { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import FeaturedVideoCard from "./FeaturedVideoCard";
import VideoThumbnailCard from "./VideoThumbnailCard";
import ResearchStudyCard from "./ResearchStudyCard";
import TechniqueGridCard from "./TechniqueGridCard";
import { techniques } from "@/components/insights/techniqueData";
import {
  vaultVideos,
  researchStudies,
  dailyInsights,
  lucidDreamingTechniqueIndices,
  meditationTechniqueIndices,
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
  const techniqueIndices =
    category === "lucid-dreaming"
      ? lucidDreamingTechniqueIndices
      : meditationTechniqueIndices;

  const tips = dailyInsights[category];
  const todayTip = tips[new Date().getDay() % tips.length];

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

      {/* Techniques */}
      {techniqueIndices.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Techniques</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {techniqueIndices.map((index) => (
              <div key={index} className="shrink-0 w-[140px]">
                <TechniqueGridCard technique={techniques[index]} index={index} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Insight */}
      <div className="featured-card rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-1">Daily Insight</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{todayTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultTabContent;
