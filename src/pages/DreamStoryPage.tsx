import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DreamEntry } from "@/types/dream";
import { useDreamLikes } from "@/hooks/useDreamLikes";
import DreamComments from "@/components/DreamComments";
import ShareButton from "@/components/share/ShareButton";
import SymbolAvatar from "@/components/profile/SymbolAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Heart, MessageCircle, Eye, ChevronDown, Sparkles, Loader2, Headphones, MoreVertical, Pencil, Trash2, Globe, Lock, Video, Crown } from "lucide-react";
import { AudioPlayer } from "@/components/dreams/AudioPlayer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useSectionImageGeneration } from "@/hooks/useSectionImageGeneration";
import { toast } from "sonner";
import { suppressNativeStyle } from "@/hooks/useLongPressSave";
import { shareOrSaveImage } from "@/utils/shareOrSaveImage";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Download } from "lucide-react";
import { GenerateVideoDialog } from "@/components/dreams/GenerateVideoDialog";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { useUserRole } from "@/hooks/useUserRole";

const DreamStoryPage: React.FC = () => {
  const { dreamId } = useParams<{ dreamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dream, setDream] = useState<DreamEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [dreamId]);

  useEffect(() => {
    if (!dreamId) return;
    const fetchDream = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("dream_entries")
        .select("*, profiles!dream_entries_user_id_fkey(username, display_name, avatar_url, avatar_symbol, avatar_color)")
        .eq("id", dreamId)
        .maybeSingle();

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Only increment view count if not the owner
      if (!user || user.id !== data.user_id) {
        await supabase.from("dream_entries").update({ view_count: (data.view_count || 0) + 1 }).eq("id", dreamId);
      }

      const { count: likeCount } = await supabase
        .from("dream_likes")
        .select("id", { count: "exact", head: true })
        .eq("dream_id", dreamId);

      const { count: cCount } = await supabase
        .from("dream_comments")
        .select("id", { count: "exact", head: true })
        .eq("dream_id", dreamId);

      let userLiked = false;
      if (user) {
        const { data: likeData } = await supabase
          .from("dream_likes")
          .select("id")
          .eq("dream_id", dreamId)
          .eq("user_id", user.id)
          .maybeSingle();
        userLiked = !!likeData;
      }

      setDream({
        ...data,
        like_count: likeCount || 0,
        comment_count: cCount || 0,
        liked: userLiked,
        generatedImage: data.generatedImage || data.image_url,
        video_url: data.video_url,
        audio_url: data.audio_url,
      } as DreamEntry);
      setCommentCount(cCount || 0);
      setLoading(false);
    };
    fetchDream();
  }, [dreamId, user]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 pt-safe-top pb-20">
        <div className="pt-4 mb-4"><Skeleton className="h-8 w-20" /></div>
        <Skeleton className="w-full aspect-[3/4] rounded-2xl mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="container mx-auto max-w-2xl px-4 pt-safe-top pb-20 text-center py-20">
        <p className="text-muted-foreground">Dream not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>← Go back</Button>
      </div>
    );
  }

  return <DreamStoryContent dream={dream} setDream={setDream} commentCount={commentCount} setCommentCount={setCommentCount} />;
};

interface DreamStoryContentProps {
  dream: DreamEntry;
  setDream: React.Dispatch<React.SetStateAction<DreamEntry | null>>;
  commentCount: number;
  setCommentCount: (count: number) => void;
}

const DreamStoryContent: React.FC<DreamStoryContentProps> = ({ dream, setDream, commentCount, setCommentCount }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { likeCount, liked, handleLikeToggle } = useDreamLikes(user, dream);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const profile = dream.profiles || {} as any;
  const username = profile.username;
  const displayName = profile.display_name || username || "Anonymous";
  const imageUrl = dream.generatedImage || dream.image_url;
  const isOwner = user?.id === dream.user_id;

  // Video access gating
  const { subscription } = useSubscriptionContext();
  const { isAdmin } = useUserRole();
  const isMystic = isAdmin || (subscription?.status === "active" && subscription?.plan === "Premium");
  const canGenerateVideo = isOwner && isMystic;
  const showSubscribeLocked = isOwner && !isMystic;

  // Parse section_images
  const sectionImages: Array<{ section: number; text: string; image_url?: string; prompt?: string }> =
    Array.isArray((dream as any).section_images) ? (dream as any).section_images : [];

  const {
    isGenerating,
    progress,
    totalSections,
    generateSectionImages,
  } = useSectionImageGeneration(dream, (updated) => {
    setDream(prev => prev ? { ...prev, ...updated } : null);
  });

  const formattedDate = dream.created_at
    ? format(new Date(dream.created_at), "MMMM d, yyyy")
    : dream.date
    ? format(new Date(dream.date), "MMMM d, yyyy")
    : "";

  const handleTogglePublic = async () => {
    const newValue = !dream.is_public;
    const { error } = await supabase
      .from("dream_entries")
      .update({ is_public: newValue })
      .eq("id", dream.id);
    if (error) {
      toast.error("Failed to update visibility");
      return;
    }
    setDream(prev => prev ? { ...prev, is_public: newValue, isPublic: newValue } : null);
    toast.success(newValue ? "Dream is now public" : "Dream is now private");
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("dream_entries")
      .delete()
      .eq("id", dream.id);
    if (error) {
      toast.error("Failed to delete dream");
      return;
    }
    toast.success("Dream deleted");
    navigate("/journal", { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-2xl lg:max-w-3xl px-0 sm:px-4 pt-safe-top pb-24"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-1">
          <ShareButton dream={dream} variant="ghost" size="sm" />
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/journal`, { state: { editDreamId: dream.id } })}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTogglePublic}>
                  {dream.is_public ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Make Public
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Hero Image */}
      {imageUrl && (
        <HeroImage
          imageUrl={imageUrl}
          title={dream.title}
          tags={dream.tags}
          lucid={dream.lucid}
          videoUrl={dream.video_url}
          canGenerateVideo={canGenerateVideo}
          showSubscribeLocked={showSubscribeLocked}
          onGenerateVideo={() => setShowVideoDialog(true)}
        />
      )}

      {/* No image fallback */}
      {!imageUrl && (
        <div className="px-4 pt-6">
          {dream.tags && dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {dream.lucid && (
                <Badge className="bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  Lucid
                </Badge>
              )}
              {dream.tags.slice(0, 4).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {dream.title}
          </h1>
        </div>
      )}

      {/* Author bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => username && navigate(`/profile/${username}`)}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <SymbolAvatar
            symbol={profile.avatar_symbol}
            color={profile.avatar_color}
            avatarUrl={profile.avatar_url}
            fallbackLetter={displayName[0]?.toUpperCase() || "?"}
            size={36}
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLikeToggle}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              liked ? "text-red-400" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {likeCount}
          </button>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            {commentCount}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            {dream.view_count || 0}
          </span>
        </div>
      </div>

      {/* Audio Player */}
      {dream.audio_url && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Listen to this dream</span>
          </div>
          <AudioPlayer audioUrl={dream.audio_url} title={dream.title} compact />
        </div>
      )}

      {/* Story Content */}
      <div className="px-4">
        <div className="border-t border-border/30 pt-6">
          {sectionImages.length > 0 ? (
            <div className="space-y-8">
              {sectionImages.map((sec, i) => (
                <div key={i}>
                  <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap font-serif">
                    {sec.text}
                  </p>
                  {sec.image_url && (
                    <SectionImage imageUrl={sec.image_url} section={sec.section} index={i} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap font-serif">
              {dream.content}
            </p>
          )}
        </div>

        {/* Generate section images button (owner only) */}
        {isOwner && sectionImages.length === 0 && (
          <div className="mt-8 p-4 rounded-xl border border-border/30 bg-muted/10 text-center">
            <Sparkles className="h-5 w-5 mx-auto text-primary mb-2" />
            <p className="text-sm font-medium mb-1">Generate Story Images</p>
            <p className="text-xs text-muted-foreground mb-3">
              AI will split your dream into scenes and create cinematic images for each (uses 2-4 image credits)
            </p>
            <Button
              onClick={generateSectionImages}
              disabled={isGenerating}
              size="sm"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating {progress}/{totalSections}...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Story Images
                </>
              )}
            </Button>
          </div>
        )}

        {/* Generating progress inline */}
        {isGenerating && sectionImages.length === 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating image {progress} of {totalSections}...
          </div>
        )}

        {/* Analysis */}
        {dream.analysis && (
          <Collapsible open={analysisOpen} onOpenChange={setAnalysisOpen} className="mt-8 border-t border-border/30 pt-4">
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
              <h3 className="text-sm font-semibold text-foreground">Dream Analysis</h3>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", analysisOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {dream.analysis}
              </p>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Comments */}
        <div className="mt-8 border-t border-border/30 pt-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Comments</h3>
          <DreamComments dreamId={dream.id} onCommentCountChange={setCommentCount} />
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this dream from your journal. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

/* ---------- Long-press saveable image sub-components ---------- */

const HeroImage: React.FC<{ imageUrl: string; title: string; tags?: string[]; lucid?: boolean }> = ({ imageUrl, title, tags, lucid }) => {
  const [showMenu, setShowMenu] = useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = React.useRef<{ x: number; y: number } | null>(null);

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartPos.current = { x: t.clientX, y: t.clientY };
    timerRef.current = setTimeout(() => setShowMenu(true), 500);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const t = e.touches[0];
    if (Math.hypot(t.clientX - touchStartPos.current.x, t.clientY - touchStartPos.current.y) > 10) clearTimer();
  };
  const handleTouchEnd = () => clearTimer();
  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); setShowMenu(true); };

  const handleSave = () => {
    setShowMenu(false);
    shareOrSaveImage(imageUrl, `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`).catch(() => toast.error("Failed to save image"));
  };

  return (
    <>
      <div
        className="relative aspect-[3/4] sm:rounded-2xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        style={suppressNativeStyle}
      >
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" draggable={false} style={suppressNativeStyle} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {lucid && (
                <Badge className="bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                  Lucid
                </Badge>
              )}
              {tags.slice(0, 4).map(tag => (
                <Badge key={tag} variant="secondary" className="bg-white/15 text-white/90 border-0 text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            {title}
          </h1>
        </div>
      </div>
      <Drawer open={showMenu} onOpenChange={setShowMenu}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Image Actions</DrawerTitle></DrawerHeader>
          <div className="flex flex-col gap-1 px-4 pb-6">
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted/50 transition-colors text-left" onClick={handleSave}>
              <Download className="h-5 w-5 text-primary" />
              <span className="font-medium">Save Image</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

const SectionImage: React.FC<{ imageUrl: string; section: number; index: number }> = ({ imageUrl, section, index }) => {
  const [showMenu, setShowMenu] = useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = React.useRef<{ x: number; y: number } | null>(null);

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartPos.current = { x: t.clientX, y: t.clientY };
    timerRef.current = setTimeout(() => setShowMenu(true), 500);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const t = e.touches[0];
    if (Math.hypot(t.clientX - touchStartPos.current.x, t.clientY - touchStartPos.current.y) > 10) clearTimer();
  };
  const handleTouchEnd = () => clearTimer();
  const handleContextMenu = (e: React.MouseEvent) => { e.preventDefault(); setShowMenu(true); };

  const handleSave = () => {
    setShowMenu(false);
    shareOrSaveImage(imageUrl, `dream-section-${section}.png`).catch(() => toast.error("Failed to save image"));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="mt-4 rounded-xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        style={suppressNativeStyle}
      >
        <img
          src={imageUrl}
          alt={`Section ${section}`}
          className="w-full object-cover rounded-xl"
          loading="lazy"
          draggable={false}
          style={suppressNativeStyle}
        />
      </motion.div>
      <Drawer open={showMenu} onOpenChange={setShowMenu}>
        <DrawerContent>
          <DrawerHeader><DrawerTitle>Image Actions</DrawerTitle></DrawerHeader>
          <div className="flex flex-col gap-1 px-4 pb-6">
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted/50 transition-colors text-left" onClick={handleSave}>
              <Download className="h-5 w-5 text-primary" />
              <span className="font-medium">Save Image</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default DreamStoryPage;
