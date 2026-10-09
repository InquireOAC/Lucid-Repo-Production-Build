import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSeriesChapters, useSeriesFollow, DreamSeries } from "@/hooks/useDreamSeries";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Eye, Heart, Plus, UserPlus, UserCheck, Trash2 } from "lucide-react";
import SymbolAvatar from "@/components/profile/SymbolAvatar";
import AddChapterDialog from "./AddChapterDialog";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface SeriesDetailPageProps {
  series: DreamSeries;
  open: boolean;
  onClose: () => void;
  isOwner?: boolean;
  onOpenDream?: (dream: any) => void;
}

const SeriesDetailPage: React.FC<SeriesDetailPageProps> = ({
  series,
  open,
  onClose,
  isOwner,
  onOpenDream,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { chapters, isLoading, addChapter, removeChapter } = useSeriesChapters(series.id);
  const { isFollowing, toggleFollow } = useSeriesFollow(user?.id);
  const [addChapterOpen, setAddChapterOpen] = useState(false);

  const profile = series.profiles || {} as any;
  const displayName = profile.display_name || profile.username || "Anonymous";
  const following = isFollowing(series.id);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Cover */}
        <div className="relative aspect-[16/9] flex-shrink-0">
          {series.cover_image_url ? (
            <img src={series.cover_image_url} alt={series.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <button onClick={onClose} className="absolute top-3 left-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1 mb-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground uppercase">
                {series.status}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase">
                {series.chapter_count} chapters
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">{series.title}</h1>
            {series.description && (
              <p className="text-sm text-white/70 line-clamp-2">{series.description}</p>
            )}
          </div>
        </div>

        {/* Author & actions */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
          <button
            onClick={() => {
              if (profile.username) {
                onClose();
                navigate(`/profile/${profile.username}`);
              }
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <SymbolAvatar
              symbol={profile.avatar_symbol}
              color={profile.avatar_color}
              avatarUrl={profile.avatar_url}
              fallbackLetter={displayName[0]?.toUpperCase() || "?"}
              size={32}
            />
            <div className="text-left">
              <p className="text-sm font-medium">{displayName}</p>
              {profile.username && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
            </div>
          </button>

          <div className="flex items-center gap-2">
            {!isOwner && user && (
              <Button
                variant={following ? "secondary" : "default"}
                size="sm"
                onClick={() => toggleFollow(series.id)}
                className="gap-1.5"
              >
                {following ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                {following ? "Following" : "Follow"}
              </Button>
            )}
            {isOwner && (
              <Button variant="outline" size="sm" onClick={() => setAddChapterOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add Chapter
              </Button>
            )}
          </div>
        </div>

        {/* Tags */}
        {series.tags && series.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 py-2">
            {series.tags.map(tag => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary/80">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Chapter list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-2">
            Chapters
          </h3>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading chapters...</p>
          ) : chapters.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No chapters yet</p>
              {isOwner && <p className="text-xs text-muted-foreground mt-1">Add your dreams as chapters</p>}
            </div>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter, idx) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/20 hover:border-primary/30 hover:bg-muted/10 transition-all cursor-pointer group"
                  onClick={() => onOpenDream?.(chapter.dream)}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">{chapter.chapter_number}</span>
                  </div>
                  
                  {chapter.dream?.generatedImage || chapter.dream?.image_url ? (
                    <img
                      src={chapter.dream.generatedImage || chapter.dream.image_url}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : null}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {chapter.dream?.title || "Untitled"}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {chapter.dream?.content?.slice(0, 80)}
                    </p>
                  </div>

                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChapter(chapter.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add chapter dialog */}
        <AddChapterDialog
          open={addChapterOpen}
          onOpenChange={setAddChapterOpen}
          seriesId={series.id}
          existingDreamIds={chapters.map(c => c.dream_id)}
          onAddChapter={addChapter}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SeriesDetailPage;
