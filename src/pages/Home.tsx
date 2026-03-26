import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedPublicDreams } from "@/hooks/useFeedPublicDreams";

import { useLucidStats } from "@/hooks/useLucidStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAcademyProgress, getTierInfo, getNextTierInfo } from "@/hooks/useAcademyProgress";
import { usePinnedTechniques } from "@/hooks/usePinnedTechniques";
import { techniques } from "@/components/insights/techniqueData";

import techniqueImgRealityChecks from "@/assets/techniques/reality-checks.jpeg";
import techniqueImgSsild from "@/assets/techniques/ssild.jpeg";
import techniqueImgWild from "@/assets/techniques/wild.jpeg";
import techniqueImgFild from "@/assets/techniques/fild.jpeg";
import techniqueImgDeild from "@/assets/techniques/deild.jpeg";
import techniqueImgMeditation from "@/assets/techniques/meditation.jpeg";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/ui/PageTransition";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Pencil,
  
  BookOpen,
  Brain,
  Heart,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Pin,
  Crosshair,
  Clock,
  ArrowUpRight,
} from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dreams, isLoading: feedLoading } = useFeedPublicDreams(user);
  const { stats } = useLucidStats();
  const { pinnedIndices } = usePinnedTechniques();

  const { data: todayCount } = useQuery({
    queryKey: ["repo-today-count"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("dream_entries")
        .select("*", { count: "exact", head: true })
        .eq("is_public", true)
        .gte("created_at", today);
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  return (
    <PageTransition className="min-h-screen starry-background pt-safe-top px-4 md:px-8 pb-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Greeting + Record CTA */}
        <div className="pt-4">
          <h1 className="text-lg font-semibold text-foreground mb-0.5">
            {user
              ? `Welcome back, ${profile?.display_name || profile?.username || "Dreamer"}`
              : "Sign in to get started"}
          </h1>
          <p className="text-muted-foreground text-xs mb-3">
            What did you dream last night?
          </p>
          <Button
            variant="aurora"
            className="w-auto inline-flex items-center gap-2 text-sm px-6 py-2.5 rounded-full"
            onClick={() => navigate("/journal/new")}
          >
            <Pencil size={16} />
            Record a Dream
          </Button>
        </div>

        {/* AI Dream Analyst CTA */}
        <div
          className="rounded-2xl bg-[#0d1425] border border-primary/15 p-3 cursor-pointer hover:border-primary/25 transition-colors"
          onClick={() => navigate("/chat")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Crosshair size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">AI Dream Analyst</h3>
              <p className="text-xs text-muted-foreground">Interpret your dreams with AI</p>
            </div>
            <ArrowUpRight size={16} className="text-primary shrink-0" />
          </div>
        </div>

        {/* Dream Book CTA */}
        <div
          className="rounded-2xl bg-[#0d1425] border border-primary/15 p-3 cursor-pointer hover:border-primary/25 transition-colors"
          onClick={() => navigate("/dream-book")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">Dream Book</h3>
              <p className="text-xs text-muted-foreground">Your personal dream gallery</p>
            </div>
            <ArrowUpRight size={16} className="text-primary shrink-0" />
          </div>
        </div>

        {/* Pinned Techniques */}
        <PinnedTechniquesSection pinnedIndices={pinnedIndices} />

        {/* Dream Academy Card */}
        <AcademyEntryCard />

        {/* Lucid Insights */}
        {stats && <LucidInsightsCard stats={stats} onTap={() => navigate("/lucid-stats")} />}

        {/* Feed */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Following Feed
          </h2>
          {feedLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : dreams.length === 0 ? (
            <div className="rounded-2xl bg-[#0d1425] border border-primary/10">
              <div className="p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  No dreams from people you follow yet.
                </p>
                <Button
                  variant="link"
                  className="text-primary mt-2"
                  onClick={() => navigate("/lucid-repo")}
                >
                  Discover dreamers to follow →
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {dreams.slice(0, 3).map((dream: any) => (
                <FeedDreamCard
                  key={dream.id}
                  dream={dream}
                  onClick={() => navigate(`/dream/${dream.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Today's Repo Activity */}
        {todayCount != null && todayCount > 0 && (
          <button
            onClick={() => navigate("/lucid-repo")}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-primary/10 border border-primary/15 hover:bg-primary/15 transition-colors"
          >
            <span className="text-sm">🌙</span>
            <span className="text-xs font-medium text-primary">
              {todayCount} dream{todayCount !== 1 ? "s" : ""} shared to the Repo today
            </span>
            <ChevronRight size={14} className="text-primary/60" />
          </button>
        )}

        {/* While Falling Asleep */}
        <FallingAsleepSection />
      </div>
    </PageTransition>
  );
};

/* ===== Sub-components ===== */

interface LucidInsightsProps {
  stats: {
    recall_chart: { day?: string; count?: number }[];
    total_lucid_dreams: number;
    total_entries: number;
    techniques: { technique: string; rate: number }[];
    avg_lucidity_level: number;
  };
  onTap: () => void;
}

const LucidInsightsCard: React.FC<LucidInsightsProps> = ({ stats, onTap }) => {
  const chartData = (stats.recall_chart || []).slice(-14).map((p) => ({
    day: p.day ? new Date(p.day).toLocaleDateString(undefined, { day: "numeric" }) : "",
    count: p.count ?? 0,
  }));

  const lucidRate =
    stats.total_entries > 0
      ? Math.round((stats.total_lucid_dreams / stats.total_entries) * 100)
      : 0;

  const topTechnique = stats.techniques?.[0];

  return (
    <div
      className="rounded-2xl bg-[#0d1425] border border-border/20 p-5 space-y-3 cursor-pointer hover:border-primary/25 transition-colors"
      onClick={onTap}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Lucid Insights</h2>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>

      {chartData.length > 2 && (
        <div className="h-24 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="insightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis hide allowDecimals={false} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#insightGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-foreground">{lucidRate}%</p>
          <p className="text-[10px] text-muted-foreground">Lucid Rate</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground truncate">
            {topTechnique ? topTechnique.technique : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {topTechnique ? `${topTechnique.rate}% success` : "Top Technique"}
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{stats.avg_lucidity_level}</p>
          <p className="text-[10px] text-muted-foreground">Avg Lucidity</p>
        </div>
      </div>
    </div>
  );
};

const FeedDreamCard = ({
  dream,
  onClick,
}: {
  dream: any;
  onClick: () => void;
}) => (
  <div
    className="rounded-2xl bg-[#0d1425] border border-border/20 cursor-pointer hover:border-primary/25 transition-colors overflow-hidden"
    onClick={onClick}
  >
    <div className="flex gap-3 p-3">
      {(dream.image_url || dream.generatedImage) && (
        <img
          src={dream.image_url || dream.generatedImage}
          alt=""
          className="w-20 h-20 rounded-lg object-cover shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          {dream.profiles?.avatar_url ? (
            <img
              src={dream.profiles.avatar_url}
              className="w-5 h-5 rounded-full"
              alt=""
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary/20" />
          )}
          <span className="text-xs text-muted-foreground truncate">
            {dream.profiles?.display_name ||
              dream.profiles?.username ||
              "Dreamer"}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-foreground truncate">
          {dream.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {dream.content?.slice(0, 120)}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart size={12} /> {dream.like_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} /> {dream.comment_count || 0}
          </span>
        </div>
      </div>
    </div>
  </div>
);


const ACADEMY_QUOTES = [
  "The path to lucidity is paved with consistency.",
  "Every dream remembered is a step toward awareness.",
  "Your subconscious speaks — learn to listen.",
];

const AcademyEntryCard = () => {
  const navigate = useNavigate();
  const { progress } = useAcademyProgress();
  const tier = getTierInfo(progress?.current_tier || 1);
  const next = getNextTierInfo(progress?.total_xp || 0);
  const quote = ACADEMY_QUOTES[(progress?.total_xp || 0) % ACADEMY_QUOTES.length];

  return (
    <div
      className="rounded-2xl bg-[#0d1425] border border-border/20 p-5 cursor-pointer hover:border-primary/25 transition-colors"
      onClick={() => navigate("/learn")}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">Dream Academy</h3>
          <p className="text-xs font-medium text-primary uppercase tracking-wider">
            Rank: {tier.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{progress?.total_xp || 0} XP</p>
          {next && (
            <p className="text-[10px] text-muted-foreground">{next.xpNeeded - (progress?.total_xp || 0)} to next level</p>
          )}
        </div>
      </div>
      {next && (
        <Progress value={next.progress} className="h-2 bg-muted/20 mb-3" />
      )}
      <p className="text-xs text-muted-foreground italic">"{quote}"</p>
    </div>
  );
};

/* Sleep-onset technique cards with custom images */
const FALLING_ASLEEP_CARDS: { idx: number; image: string }[] = [
  { idx: 3, image: techniqueImgWild },
  { idx: 4, image: techniqueImgSsild },
  { idx: 5, image: techniqueImgFild },
  { idx: 6, image: techniqueImgDeild },
  { idx: 7, image: techniqueImgMeditation },
  { idx: 0, image: techniqueImgRealityChecks },
];


const PinnedTechniquesSection: React.FC<{ pinnedIndices: number[] }> = ({ pinnedIndices }) => {
  const navigate = useNavigate();

  if (pinnedIndices.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-medium text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
          <Pin size={14} className="text-primary" />
          Pinned Technique
        </h2>
        <div className="rounded-2xl bg-[#0d1425] border border-border/20 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Pin a technique from the Explore page to display it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {pinnedIndices.map((idx) => {
          const t = techniques[idx];
          if (!t) return null;
          return (
            <div
              key={idx}
              onClick={() => navigate(`/insights/technique/${idx}`)}
              className="rounded-2xl bg-[#0d1425] border border-border/20 p-5 cursor-pointer hover:border-primary/25 transition-colors"
            >
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Pin size={12} />
                Pinned Technique
              </p>
              <h3 className="text-xl font-bold text-foreground mb-1">
                {t.acronym || t.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {t.name}{t.acronym ? `. ${t.shortDescription}` : ""}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> 15m
                </span>
                <span className="flex items-center gap-1">
                  <ArrowUpRight size={12} /> {t.difficulty}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FallingAsleepSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">
        Lucid Techniques
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {FALLING_ASLEEP_CARDS.map(({ idx, image }) => {
          const t = techniques[idx];
          if (!t) return null;
          return (
            <div
              key={idx}
              onClick={() => navigate(`/insights/technique/${idx}`)}
              className="cursor-pointer relative rounded-2xl overflow-hidden aspect-square group"
            >
              <img
                src={image}
                alt={t.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-semibold text-white text-sm leading-tight drop-shadow-md">
                  {t.acronym || t.name}
                </h3>
                <p className="text-[10px] text-white/70 mt-0.5">{t.shortDescription}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;

