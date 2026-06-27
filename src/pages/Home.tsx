import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedPublicDreams } from "@/hooks/useFeedPublicDreams";
import { useDreamStore } from "@/store/dreamStore";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useChallenges } from "@/hooks/useChallenges";
import { useEvents } from "@/hooks/useEvents";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/ui/PageTransition";
import FAB from "@/components/ui/FAB";
import HomeHeroCarousel from "@/components/home/HomeHeroCarousel";
import JournalPosterCard from "@/components/journal/JournalPosterCard";
import PosterRail from "@/components/repos/netflix/PosterRail";
import PosterCard from "@/components/repos/netflix/PosterCard";
import DreamImageBackdrop from "@/components/ui/DreamImageBackdrop";

import { DreamEntry } from "@/types/dream";
import { Film, Plus, Moon } from "lucide-react";

const hasPoster = (d: DreamEntry) =>
  !!(d.generatedImage || d.image_url || d.section_images?.some((s) => s.image_url));

const Home = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { dreams: feedDreams, isLoading: feedLoading } = useFeedPublicDreams(user);
  const { announcements } = useAnnouncements();
  const { challenges } = useChallenges();
  const { events } = useEvents();

  const { entries } = useDreamStore();
  useJournalEntries();

  const myDreams = entries as DreamEntry[];

  const heroDream = useMemo(() => {
    if (!myDreams.length) return null;
    // Most recent dream that has video or any image → ideal carousel anchor
    return (
      myDreams.find((d) => !!d.video_url) ||
      myDreams.find(hasPoster) ||
      myDreams[0]
    );
  }, [myDreams]);

  const continueCreating = useMemo(
    () => myDreams.filter((d) => !d.video_url).slice(0, 10),
    [myDreams],
  );

  const cinematicDreams = useMemo(
    () => myDreams.filter((d) => !!d.video_url).slice(0, 10),
    [myDreams],
  );

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekCount = myDreams.filter(
      (d) => new Date(d.created_at || d.date).getTime() >= weekAgo,
    ).length;
    const cinematicCount = myDreams.filter((d) => !!d.video_url).length;
    const sceneCount = myDreams.reduce(
      (sum, d) => sum + (d.section_images?.filter((s) => !!s.image_url).length || 0),
      0,
    );
    return { weekCount, cinematicCount, sceneCount };
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
      <div className="max-w-2xl mx-auto px-4 md:px-8 lg:max-w-7xl lg:px-12 xl:max-w-[1400px] xl:px-16 2xl:max-w-[1500px] pb-10 lg:pb-16">

        {/* Greeting strip */}
        <div className="pt-6 lg:pt-10 mb-3 lg:mb-5 flex items-baseline justify-between">
          <p className="text-xs lg:text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Tonight's Dreamscape
          </p>
          <p className="text-xs lg:text-sm text-muted-foreground truncate max-w-[40%] text-right">
            {profile?.display_name || profile?.username || "Dreamer"}
          </p>
        </div>

        {/* ── Swipeable hero carousel ─────────────────────────────── */}
        {myDreams.length > 0 ? (
          <HomeHeroCarousel
            heroDream={heroDream}
            events={events}
            challenges={challenges}
            announcements={announcements}
          />
        ) : (
          <EmptyHero onCreate={() => navigate("/journal/new")} />
        )}

        {/* Stats strip */}
        {myDreams.length > 0 && (
          <div className="mb-6 lg:mb-10 -mt-2 flex items-center gap-3 lg:gap-5 flex-wrap text-[11px] lg:text-sm text-muted-foreground">
            {stats.weekCount > 0 && (
              <span>
                <span className="text-foreground font-semibold">{stats.weekCount}</span>{" "}
                dream{stats.weekCount !== 1 ? "s" : ""} this week
              </span>
            )}
            {stats.cinematicCount > 0 && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span>
                  <span className="text-foreground font-semibold">{stats.cinematicCount}</span>{" "}
                  cinematic{stats.cinematicCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
            {stats.sceneCount > 0 && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span>
                  <span className="text-foreground font-semibold">{stats.sceneCount}</span>{" "}
                  scene{stats.sceneCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        )}

        {/* ── Continue Creating ────────────────────────────────────── */}
        {continueCreating.length > 0 && (
          <PosterRail title="Continue Creating" onSeeAll={() => navigate("/journal")}>
            {continueCreating.map((d) => (
              <JournalPosterCard key={d.id} dream={d} />
            ))}
          </PosterRail>
        )}

        {/* ── Your Cinematic Dreams (finished films) ──────────────── */}
        {cinematicDreams.length > 0 && (
          <PosterRail title="Your Cinematic Dreams" onSeeAll={() => navigate("/journal")}>
            {cinematicDreams.map((d) => (
              <JournalPosterCard key={d.id} dream={d} showPlayOverlay />
            ))}
          </PosterRail>
        )}

        {/* ── Featured Dreamscapes (community feed) ───────────────── */}
        <PosterRail title="Featured Dreamscapes" onSeeAll={() => navigate("/lucid-repo")}>
          {feedLoading ? (
            [0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="flex-shrink-0 w-[130px] md:w-[150px] aspect-[2/3] rounded-md" />
            ))
          ) : feedDreams.length > 0 ? (
            feedDreams.slice(0, 10).map((d: any) => (
              <PosterCard key={d.id} dream={d as DreamEntry} />
            ))
          ) : (
            <button
              onClick={() => navigate("/lucid-repo")}
              className="flex-shrink-0 w-[130px] md:w-[150px] aspect-[2/3] rounded-md border border-dashed border-border/50 flex flex-col items-center justify-center text-center px-3 hover:border-primary/40 transition-colors"
            >
              <Moon className="h-6 w-6 text-muted-foreground/60 mb-2" />
              <span className="text-[11px] text-muted-foreground leading-tight">
                Discover dreams shared by others
              </span>
            </button>
          )}
        </PosterRail>

      </div>

      <FAB label="New Dream" to="/journal/new" />
    </PageTransition>
  );
};

const EmptyHero: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="relative -mx-4 sm:-mx-6 md:mx-0 mb-6 lg:mb-10 md:rounded-2xl overflow-hidden lg:max-h-[520px] xl:max-h-[600px]">
    <div className="relative aspect-[3/4] md:aspect-[21/9] lg:max-h-[520px] xl:max-h-[600px] bg-gradient-to-br from-primary/30 via-accent/20 to-background">
      <div className="absolute -top-16 -left-8 w-80 h-80 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
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
