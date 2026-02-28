import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FeaturedVideoCard from "./FeaturedVideoCard";
import VideoThumbnailCard from "./VideoThumbnailCard";
import ResearchStudyCard from "./ResearchStudyCard";
import { Skeleton } from "@/components/ui/skeleton";

interface VaultTabContentProps {
  category: "lucid-dreaming" | "meditation";
}

const VaultTabContent: React.FC<VaultTabContentProps> = ({ category }) => {
  const { data: videos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ["explore-videos", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("explore_videos")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: articles = [], isLoading: loadingArticles } = useQuery({
    queryKey: ["explore-articles", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("explore_articles")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const [featured, ...rest] = videos;

  if (loadingVideos && loadingArticles) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="flex gap-3">
          <Skeleton className="h-32 w-[200px] rounded-xl shrink-0" />
          <Skeleton className="h-32 w-[200px] rounded-xl shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {featured && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Featured</h2>
          <FeaturedVideoCard video={featured} />
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">More Videos</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {rest.map((video) => (
              <VideoThumbnailCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}

      {articles.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Research & Studies</h2>
          <div className="space-y-3">
            {articles.map((article) => (
              <ResearchStudyCard key={article.id} study={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultTabContent;
