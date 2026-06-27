import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamStore } from "@/store/dreamStore";
import { useJournalEntries } from "@/hooks/useJournalEntries";

import { Button } from "@/components/ui/button";
import PageTransition from "@/components/ui/PageTransition";
import JournalPosterCard from "@/components/journal/JournalPosterCard";
import PosterRail from "@/components/repos/netflix/PosterRail";
import DreamImageBackdrop from "@/components/ui/DreamImageBackdrop";
import DreamStatsCard from "@/components/home/DreamStatsCard";
import StatTile from "@/components/ui/StatTile";

import { DreamEntry } from "@/types/dream";
import { Film, Plus } from "lucide-react";

const hasPoster = (d: DreamEntry) =>
  !!(d.generatedImage || d.image_url || d.section_images?.some((s) => s.image_url));

const sceneCount = (d: DreamEntry) =>
  d.section_images?.filter((s) => s.image_url).length || 0;

const greetingForHour = (h: number) =>
  h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

const Home = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { entries } = useDreamStore();
  useJournalEntries();

  const myDreams = (entries as DreamEntry[]).filter((d) => !d.is_archived);

  const continueCreating = useMemo(
    () => myDreams.filter((d) => !d.video_url).slice(0, 12),
    [myDreams],
  );

  const week = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const inWeek = myDreams.filter(
      (d) => new Date(d.created_at || d.date).getTime() >= weekAgo,
    );
    return {
      dreams: inWeek.length,
      visualized: inWeek.filter(hasPoster).length,
      cinematics: inWeek.filter((d) => !!d.video_url).length,
      scenes: inWeek.reduce((sum, d) => sum + sceneCount(d), 0),
    };
  }, [myDreams]);

  // Signed-out welcome
  if (!user) {
    return (
      <PageTransition className="min-h-screen starry-background pt-safe-top pb-safe-bottom">
        <div className="max-w-2xl mx-auto px-4 md:px-8 lg:max-w-5xl lg:px-12 xl:max-w-6xl xl:px-16 pt-12 lg:pt-20 pb-10">
          <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-primary/30 via-accent/20 to-background aspect-[3/4] md:aspect-[21/9] lg:max-h-[520px] xl:max-h-[600px]">
            <DreamImageBackdrop dim={0.5} />
            <div className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-10 px-6 z-10">
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/15">
                <Film className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 lg:mb-5 drop-shadow-md">
                Your dreams, as cinema.
              </h1>
              <p className="text-sm lg:text-lg xl:text-xl text-white/70 max-w-md lg:max-w-2xl mb-5 lg:mb-8">
                Sign in to record dreams and turn them into cinematic scenes and short films.
              </p>
              <Button onClick={() => navigate("/auth")} variant="luminous" size="lg">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen starry-background pt-safe-top pb-safe-bottom">
      <div className="max-w-2xl mx-auto px-4 md:px-8 lg:max-w-5xl lg:px-12 xl:max-w-6xl xl:px-16 pb-10 lg:pb-16">

        {/* Greeting */}
        <div className="pt-6 lg:pt-10 mb-5 lg:mb-7">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
            {greetingForHour(new Date().getHours())},{" "}
            <span className="text-primary">{profile?.display_name || profile?.username || "Dreamer"}.</span>
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Ready to create something cinematic?
          </p>
        </div>

        {myDreams.length === 0 ? (
          <EmptyHero onCreate={() => navigate("/journal/new")} />
        ) : (
          <>
            {/* Continue Creating */}
            {continueCreating.length > 0 && (
              <PosterRail title="Continue Creating" onSeeAll={() => navigate("/journal")}>
                {continueCreating.map((d) => {
                  const n = sceneCount(d);
                  return (
                    <JournalPosterCard
                      key={d.id}
                      dream={d}
                      showPlayOverlay={!!d.video_url}
                      meta={n > 0 ? `${n} ${n === 1 ? "scene" : "scenes"}` : "Tap to visualize"}
                    />
                  );
                })}
              </PosterRail>
            )}

            {/* Dream Stats */}
            <div className="mb-6 lg:mb-8">
              <p className="text-xs lg:text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
                Dream Stats
              </p>
              <DreamStatsCard />
            </div>

            {/* This Week */}
            <div className="mb-6 lg:mb-8">
              <p className="text-xs lg:text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
                This Week
              </p>
              <div className="flex gap-2 lg:gap-3">
                <StatTile value={week.dreams} label="Dreams" />
                <StatTile value={week.visualized} label="Visualized" />
                <StatTile value={week.cinematics} label="Cinematics" />
                <StatTile value={week.scenes} label="Scenes" />
              </div>
            </div>
          </>
        )}

        {/* New Dream CTA */}
        <button
          onClick={() => navigate("/journal/new")}
          className="w-full h-12 lg:h-14 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-[0_0_24px_hsl(var(--primary)/0.35)] hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Dream
        </button>
      </div>
    </PageTransition>
  );
};

const EmptyHero: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="relative -mx-4 sm:-mx-6 md:mx-0 mb-6 lg:mb-10 md:rounded-2xl overflow-hidden lg:max-h-[520px] xl:max-h-[600px]">
    <div className="relative aspect-[3/4] md:aspect-[21/9] lg:max-h-[520px] xl:max-h-[600px] bg-gradient-to-br from-primary/30 via-accent/20 to-background">
      <DreamImageBackdrop dim={0.5} />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-10 lg:pb-16 px-6 lg:px-12 z-10">
        <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 lg:mb-6 border border-white/15">
          <Film className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 lg:mb-3 drop-shadow-md">
          Start your dream cinema
        </h2>
        <p className="text-sm lg:text-lg xl:text-xl text-white/70 max-w-sm lg:max-w-2xl mb-5 lg:mb-8">
          Record a dream and we'll turn it into scenes, images, and short films.
        </p>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 rounded-full bg-white text-black font-semibold text-sm lg:text-base hover:bg-white/90 transition-colors"
        >
          <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
          Record First Dream
        </button>
      </div>
    </div>
  </div>
);

export default Home;
