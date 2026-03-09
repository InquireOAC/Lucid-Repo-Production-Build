import React, { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Play, Image as ImageIcon, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { downloadImageAsPng } from "@/utils/downloadImageAsPng";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface DreamGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string | null;
  videoUrl: string | null;
  date: string;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const formatDisplayDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return format(parsed, "MMM d, yyyy");
};

const isFeatured = (index: number) => index === 0 || index % 3 === 0;

const DreamGalleryDialog = ({ open, onOpenChange }: DreamGalleryDialogProps) => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["dream-gallery", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("dream_entries")
        .select("id, title, image_url, \"generatedImage\", video_url, date")
        .eq("user_id", user.id)
        .or("image_url.neq.,generatedImage.neq.,video_url.neq.")
        .order("date", { ascending: false });

      if (error) throw error;

      return (data || [])
        .filter((d: any) => d.image_url || d.generatedImage || d.video_url)
        .map((d: any): GalleryItem => ({
          id: d.id,
          title: d.title,
          imageUrl: d.image_url || d.generatedImage,
          videoUrl: d.video_url,
          date: d.date,
        }));
    },
    enabled: open && !!user,
  });

  const stats = useMemo(() => {
    const totalVisualized = items.length;
    const videos = items.filter((item) => Boolean(item.videoUrl)).length;
    return { totalVisualized, videos };
  }, [items]);

  const handleSave = async (url: string, label: string, kind: "image" | "video") => {
    const safeLabel = label.replace(/[^a-z0-9]/gi, "-").toLowerCase();

    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: kind === "image" ? "Dream Image" : "Dream Video",
          text: "Check out my dream from Lucid Repo!",
          url,
          dialogTitle: kind === "image" ? "Save or Share Dream Image" : "Save or Share Dream Video",
        });
        toast.success("Opened share sheet!");
        return;
      }

      if (kind === "image") {
        await downloadImageAsPng(url, `${safeLabel}.png`);
        toast.success("Image downloaded!");
        return;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch video");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${safeLabel}.mp4`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      toast.success("Video downloaded!");
    } catch {
      toast.error(`Failed to save ${kind}`);
    }
  };

  const handleShare = async () => {
    if (!selectedItem) return;

    const shareUrl = selectedItem.videoUrl || selectedItem.imageUrl;
    if (!shareUrl) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: selectedItem.title,
          text: "Check out this dream from Lucid Repo!",
          url: shareUrl,
          dialogTitle: "Share Dream",
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: selectedItem.title,
          text: "Check out this dream from Lucid Repo!",
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to share");
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] bg-background flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-xl">
              <div className="flex items-center justify-between px-4 h-14">
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-base font-semibold text-foreground">Dream Library</h1>
                <div className="w-10" />
              </div>
              <div className="px-4 pb-3">
                <p className="text-xs text-muted-foreground">
                  {stats.totalVisualized} dreams visualized · {stats.videos} videos
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: "touch" }}>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 p-4">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const featured = isFeatured(i);
                    return (
                      <Skeleton
                        key={i}
                        className={`${featured ? "col-span-2 aspect-[16/9]" : "aspect-[3/4]"} rounded-2xl animate-pulse`}
                      />
                    );
                  })}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[65vh] px-6 text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full blur-2xl bg-[radial-gradient(circle,hsl(var(--primary)/0.22),transparent_65%)]" />
                    <div className="relative p-6 rounded-full border border-border bg-card/70">
                      <ImageIcon className="h-12 w-12 text-muted-foreground animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Your dream visualizations will appear here</p>
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-2 gap-3 p-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {items.map((item, index) => {
                    const featured = isFeatured(index);
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        variants={itemVariants}
                        whileTap={{ scale: 0.98 }}
                        className={`relative ${featured ? "col-span-2 aspect-[16/9]" : "aspect-[3/4]"} rounded-2xl overflow-hidden border border-white/10 bg-muted text-left`}
                        onClick={() => setSelectedItem(item)}
                      >
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}

                        {item.videoUrl && (
                          <div className="absolute top-3 right-3 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-1 flex items-center gap-1.5">
                            <Play className="h-3 w-3 fill-white text-white" />
                            <span className="text-[10px] font-medium text-white">Video</span>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10">
                          <p className="text-sm text-white font-medium line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-white/75 mt-0.5">{formatDisplayDate(item.date)}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-[70] bg-background flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="flex-shrink-0 px-4 py-2.5 flex items-start justify-between gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-foreground/10"
                onClick={() => setSelectedItem(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1 min-w-0 text-center pt-1">
                <h1 className="text-sm font-medium text-primary-foreground line-clamp-1">{selectedItem.title}</h1>
                <p className="text-xs text-primary-foreground/70 mt-1">{formatDisplayDate(selectedItem.date)}</p>
              </div>

              <div className="w-10" />
            </div>

            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              {selectedItem.videoUrl ? (
                <video
                  src={selectedItem.videoUrl}
                  poster={selectedItem.imageUrl || undefined}
                  autoPlay
                  loop
                  playsInline
                  controls
                  className="max-w-full max-h-full rounded-2xl"
                />
              ) : selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain rounded-2xl"
                />
              ) : null}
            </div>

            <div className="flex-shrink-0 px-6 pb-8 pt-4 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="flex-1 max-w-[180px] border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              {selectedItem.imageUrl && (
                <Button
                  variant="outline"
                  className="flex-1 max-w-[180px] border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => handleSave(selectedItem.imageUrl!, selectedItem.title, "image")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save Image
                </Button>
              )}

              {selectedItem.videoUrl && (
                <Button
                  variant="outline"
                  className="flex-1 max-w-[180px] border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => handleSave(selectedItem.videoUrl!, `${selectedItem.title}-video`, "video")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save Video
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DreamGalleryDialog;
