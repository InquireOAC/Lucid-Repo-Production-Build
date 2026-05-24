import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedPublicDreams } from "@/hooks/useFeedPublicDreams";
import { useDreamStore } from "@/store/dreamStore";
import { useJournalEntries } from "@/hooks/useJournalEntries";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/ui/PageTransition";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import FAB from "@/components/ui/FAB";

import JournalHeroPoster from "@/components/journal/JournalHeroPoster";
import JournalPosterCard from "@/components/journal/JournalPosterCard";
import PosterRail from "@/components/repos/netflix/PosterRail";
import PosterCard from "@/components/repos/netflix/PosterCard";
import HeroPoster from "@/components/repos/netflix/HeroPoster";

import { DreamEntry } from "@/types/dream";
import { Film, Plus, Moon } from "lucide-react";

const hasPoster = (d: DreamEntry) =>
  !!(d.generatedImage || d.image_url || d.section_images?.some((s) => s.image_url));

const Home = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { dreams: feedDreams, isLoading: feedLoading } = useFeedPublicDreams(user);

  // Pull from store first (instant), fall back to a sync if empty.
  const { entries } = useDreamStore();
  useJournalEntries(); // triggers a background sync when user is present

  const myDreams = entries as DreamEntry[];

  const heroDream = useMemo(() => {
    if (!myDreams.length) return null;
    const withVideo = myDreams.find((d) => !!d.video_url && hasPoster(d));
    if (withVideo) return withVideo;
    const withMedia = myDreams.find(hasPoster);
    return withMedia || myDreams[0];
  }, [myDreams]);

  const continueCreating = useMemo(
    () => myDreams.filter((d) => !d.video_url).slice(0, 10),
    [myDreams],
  );
  const cinematicDreams = useMemo(
    () => myDreams.filter((d) => !!d.video_url).slice(0, 10),
    [myDreams],
  );

  // Stats strip (compact, text-only)
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const weekCount = myDreams.filter(
      (d) => new Date(d.created_at || d.date).getTime() >= weekAgo,
    ).length;
    const cinematicCount = myDreams.filter((d) => !!d.video_url).length;
    const sceneCount = myDreams.reduce(
      (sum, d) =>
        sum + (d.section_images?.filter((s) => !!s.image_url).length || 0),
      0,
    );
    return { weekCount, cinematicCount, sceneCount };
  }, [myDreams]);

  // Signed-out: keep a simple welcome hero
  if (!user) {
    return (
      <PageTransition className="min-h-screen starry-background pt-safe-top pb-safe-bottom">
        <div className="max-w-2xl mx-auto px-4 md:px-8 pt-12 pb-10">
          <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-primary/30 via-accent/20 to-background aspect-[3/4] md:aspect-[21/9]">
            <div className="absolute -top-10 -left-10 w-80 h-80 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-10 px-6 z-10">
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/15">
                <Film className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 drop-shadow-md">
                Your dreams, as cinema.
              </h1>
              <p className="text-sm text-white/70 max-w-md mb-5">
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
      <div className="max-w-2xl mx-auto px-4 md:px-8 pb-10">
        {/* Soft greeting strip (no big text hero — the visual hero is the dream) */}
        <div className="pt-6 mb-3 flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Tonight's Dreamscape
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[40%] text-right">
            {profile?.display_name || profile?.username || "Dreamer"}
          </p>
        </div>

        <div className="mb-4">
          <AnnouncementBanner />
        </div>

        {/* Cinematic hero — featured personal dream */}
        {heroDream ? (
          <JournalHeroPoster dream={heroDream} label="Featured" />
        ) : (
          <EmptyHero onCreate={() => navigate("/journal/new")} />
        )}

        {/* Stats strip */}
        {myDreams.length > 0 && (
          <div className="mb-6 -mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
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

        {/* Continue Creating */}
        {continueCreating.length > 0 && (
          <PosterRail
            title="Continue Creating"
            onSeeAll={() => navigate("/journal")}
          >
            {continueCreating.map((d) => (
              <JournalPosterCard key={d.id} dream={d} />
            ))}
          </PosterRail>
        )}

        {/* Your Cinematic Dreams */}
        {cinematicDreams.length > 0 && (
          <PosterRail
            title="Your Cinematics"
            onSeeAll={() => navigate("/journal")}
          >
            {cinematicDreams.map((d) => (
              <JournalPosterCard key={d.id} dream={d} showPlayOverlay />
            ))}
          </PosterRail>
        )}

        {/* Featured Dreamscapes (community / public feed) */}
        <PosterRail
          title="Featured Dreamscapes"
          onSeeAll={() => navigate("/lucid-repo")}
        >
          {feedLoading ? (
            [0, 1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="flex-shrink-0 w-[130px] md:w-[150px] aspect-[2/3] rounded-md"
              />
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

      {/* FAB */}
      <FAB label="New Dream" to="/journal/new" />
    </PageTransition>
  );
};

const EmptyHero: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="relative -mx-4 sm:-mx-6 md:mx-0 mb-6 md:rounded-2xl overflow-hidden">
    <div className="relative aspect-[3/4] md:aspect-[21/9] bg-gradient-to-br from-primary/30 via-accent/20 to-background">
      <div className="absolute -top-16 -left-8 w-80 h-80 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center pb-10 px-6 z-10">
        <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/15">
          <Film className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-md">
          Start your dream cinema
        </h2>
        <p className="text-sm text-white/70 max-w-sm mb-5">
          Record a dream and we'll turn it into scenes, images, and short films.
        </p>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Record First Dream
        </button>
      </div>
    </div>
  </div>
);

export default Home;
