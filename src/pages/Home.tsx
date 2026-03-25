import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedPublicDreams } from "@/hooks/useFeedPublicDreams";
import { useChallenges, Challenge } from "@/hooks/useChallenges";
import { useLucidStats } from "@/hooks/useLucidStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/ui/PageTransition";
import SymbolAvatar from "@/components/profile/SymbolAvatar";
import {
  Pencil,
  Trophy,
  Flame,
  MessageCircle,
  Compass,
  BookOpen,
  Brain,
  Heart,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dreams, isLoading: feedLoading } = useFeedPublicDreams(user);
  const { challenges } = useChallenges();
  const { stats } = useLucidStats();

  const activeChallenge = challenges.find(
    (c: Challenge) => c.status === "active"
  );

  return (
    <PageTransition className="min-h-screen starry-background pt-safe-top px-4 md:px-8 pb-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Greeting + Record CTA */}
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Welcome back{user ? "" : " — sign in to get started"}
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            What did you dream last night?
          </p>
          <Button
            variant="aurora"
            className="w-full flex items-center gap-2 text-base py-6"
            onClick={() => navigate("/journal/new")}
          >
            <Pencil size={20} />
            Record a Dream
          </Button>
        </div>

        {/* Streak + Stats Row */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <MiniStatCard
              icon={<Flame className="text-orange-400" size={20} />}
              value={stats.current_recall_streak}
              label="Day Streak"
            />
            <MiniStatCard
              icon={<Brain className="text-primary" size={20} />}
              value={stats.total_lucid_dreams}
              label="Lucid Dreams"
            />
            <MiniStatCard
              icon={<BookOpen className="text-emerald-400" size={20} />}
              value={stats.total_entries}
              label="Total Dreams"
            />
          </div>
        )}

        {/* Active Challenge */}
        {activeChallenge && (
          <Card className="glass-card border-primary/20 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/15">
                  <Trophy className="text-primary" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary uppercase tracking-wide mb-0.5">
                    Today's Challenge
                  </p>
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {activeChallenge.title}
                  </h3>
                  {activeChallenge.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {activeChallenge.description}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary shrink-0"
                  onClick={() => navigate("/lucid-repo")}
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-2">
          <QuickLink
            icon={<MessageCircle size={20} />}
            label="Chat"
            onClick={() => navigate("/chat")}
          />
          <QuickLink
            icon={<Compass size={20} />}
            label="Learn"
            onClick={() => navigate("/learn")}
          />
          <QuickLink
            icon={<Brain size={20} />}
            label="Insights"
            onClick={() => navigate("/insights")}
          />
          <QuickLink
            icon={<BookOpen size={20} />}
            label="Dream Book"
            onClick={() => navigate("/dream-book")}
          />
        </div>

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
            <Card className="glass-card border-primary/10">
              <CardContent className="p-6 text-center">
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
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {dreams.slice(0, 20).map((dream: any) => (
                <FeedDreamCard
                  key={dream.id}
                  dream={dream}
                  onClick={() => navigate(`/dream/${dream.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

/* ===== Sub-components ===== */

const MiniStatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) => (
  <Card className="glass-card border-primary/10">
    <CardContent className="p-3 flex flex-col items-center gap-1">
      {icon}
      <span className="text-xl font-bold text-foreground">{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </CardContent>
  </Card>
);

const QuickLink = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card/50 border border-primary/10 hover:bg-primary/10 transition-colors"
  >
    <span className="text-primary">{icon}</span>
    <span className="text-[11px] font-medium text-muted-foreground">
      {label}
    </span>
  </button>
);

const FeedDreamCard = ({
  dream,
  onClick,
}: {
  dream: any;
  onClick: () => void;
}) => (
  <Card
    className="glass-card border-primary/10 cursor-pointer hover:border-primary/25 transition-colors overflow-hidden"
    onClick={onClick}
  >
    <CardContent className="p-0">
      <div className="flex gap-3 p-3">
        {/* Image thumbnail */}
        {(dream.image_url || dream.generatedImage) && (
          <img
            src={dream.image_url || dream.generatedImage}
            alt=""
            className="w-20 h-20 rounded-lg object-cover shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          {/* Author */}
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
          {/* Title + preview */}
          <h3 className="font-semibold text-sm text-foreground truncate">
            {dream.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {dream.content?.slice(0, 120)}
          </p>
          {/* Engagement */}
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
    </CardContent>
  </Card>
);

export default Home;
