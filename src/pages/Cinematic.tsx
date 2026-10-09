import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamStore } from "@/store/dreamStore";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { DreamEntry } from "@/types/dream";
import PageTransition from "@/components/ui/PageTransition";
import JournalPosterCard from "@/components/journal/JournalPosterCard";
import CinematicPlayer from "@/components/cinematic/CinematicPlayer";
import { Clapperboard, Play, Plus } from "lucide-react";

const pickPoster = (d: DreamEntry): string | undefined =>
  d.generatedImage || d.image_url || d.section_images?.find((s) => s.image_url)?.image_url;

const sceneCount = (d: DreamEntry): number =>
  d.section_images?.filter((s) => s.image_url).length || 0;

const Cinematic = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entries } = useDreamStore();
  useJournalEntries();

  const [activeFilm, setActiveFilm] = useState<DreamEntry | null>(null);

  const films = useMemo(
    () => (entries as DreamEntry[]).filter((d) => !!d.video_url && !d.is_archived),
    [entries],
  );
  const featured = films[0];

  return (
    <PageTransition className="min-h-screen pt-safe-top pb-safe-bottom">
      <div className="max-w-2xl mx-auto px-4 md:px-8 lg:max-w-7xl lg:px-12 xl:max-w-[1400px] xl:px-16 pb-10 lg:pb-16">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-8 lg:-mx-12 xl:-mx-16 px-4 md:px-8 lg:px-12 xl:px-16 pt-3 lg:pt-5 pb-2 lg:pb-3 bg-background/80 backdrop-blur-md">
          <p className="lucid-overline mb-1">Your dreams in motion</p>
          <h1 className="lucid-display text-3xl md:text-4xl xl:text-5xl">Your Films</h1>
        </div>

        {!user || films.length === 0 ? (
          <EmptyCinematic onCreate={() => navigate("/journal/new")} />
        ) : (
          <>
            {/* Featured film hero */}
            {featured && (
              <button
                type="button"
                onClick={() => setActiveFilm(featured)}
                className="lucid-hero relative w-full mt-3 mb-6 lg:mb-10 aspect-[16/10] md:aspect-[21/9] group text-left"
              >
                {pickPoster(featured) ? (
                  <img
                    src={pickPoster(featured)}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <img src="/dream-art/city-above-clouds.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                    <Play className="h-7 w-7 fill-current ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <p className="text-[11px] lg:text-xs uppercase tracking-[0.2em] text-primary/90 mb-1">
                    Latest Cinematic
                  </p>
                  <h2 className="lucid-display text-3xl lg:text-5xl text-white drop-shadow-md leading-tight">
                    {featured.title || "Untitled dream"}
                  </h2>
                  <p className="text-xs lg:text-sm text-white/70 mt-1">
                    {sceneCount(featured) > 0 ? `${sceneCount(featured)} scenes` : "Cinematic film"}
                  </p>
                </div>
              </button>
            )}

            {/* Films grid */}
            <h2 className="text-base md:text-lg lg:text-xl font-bold text-foreground mb-3 lg:mb-5">
              Your Films
              <span className="ml-2 text-xs lg:text-sm font-normal text-muted-foreground">
                ({films.length})
              </span>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 lg:gap-5">
              {films.map((d) => (
                <JournalPosterCard
                  key={d.id}
                  dream={d}
                  width="md"
                  showPlayOverlay
                  onOpen={(film) => setActiveFilm(film)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {activeFilm?.video_url && (
        <CinematicPlayer
          videoUrl={activeFilm.video_url}
          title={activeFilm.title}
          onClose={() => setActiveFilm(null)}
        />
      )}
    </PageTransition>
  );
};

const EmptyCinematic: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="lucid-hero relative mt-3">
    <div className="relative aspect-[3/4] md:aspect-[21/9]">
      <img src="/dream-art/city-above-clouds.png" alt="Dreamlike city floating among clouds" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-10 lg:pb-16 px-6 z-10">
        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/15">
          <Clapperboard className="h-7 w-7 text-white" />
        </div>
        <h2 className="lucid-display text-3xl md:text-4xl lg:text-6xl text-white mb-2 drop-shadow-md">
          Dream it. Make it cinema.
        </h2>
        <p className="text-sm lg:text-lg text-white/70 max-w-sm lg:max-w-2xl mb-5">
          Record a dream, visualize its scenes, then turn them into a short film.
        </p>
        <button
          onClick={onCreate}
          className="lucid-button"
        >
          <Plus className="h-4 w-4" />
          New Dream
        </button>
      </div>
    </div>
  </div>
);

export default Cinematic;
