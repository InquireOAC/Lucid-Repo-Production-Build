
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Play, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { downloadImageAsPng } from "@/utils/downloadImageAsPng";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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

  const handleSave = async (url: string, label: string) => {
    const filename = `${label.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: "Dream Image",
          text: "Check out my dream image from Lucid Repo!",
          url,
          dialogTitle: "Save or Share Dream Image",
        });
        toast.success("Opened share sheet!");
      } else {
        await downloadImageAsPng(url, filename);
        toast.success("Image downloaded!");
      }
    } catch {
      toast.error("Failed to save");
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
            <div className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-xl">
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-base font-semibold text-foreground">Dream Gallery</h1>
              <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: "touch" }}>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-2 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground px-6 text-center">
                  <ImageIcon className="h-12 w-12 mb-4 opacity-40" />
                  <p className="text-sm">No dream images or videos yet. Generate some from your dream entries!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer group"
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
                        <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                          <Play className="h-3 w-3 text-white fill-white" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                        <p className="text-[11px] text-white font-medium line-clamp-1">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen detail view */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-4 h-14">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setSelectedItem(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-sm font-medium text-white line-clamp-1 max-w-[60%]">{selectedItem.title}</h1>
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
                  className="max-w-full max-h-full rounded-xl"
                />
              ) : selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              ) : null}
            </div>

            <div className="flex-shrink-0 flex gap-3 px-6 pb-8 pt-4 justify-center">
              {selectedItem.imageUrl && (
                <Button
                  variant="outline"
                  className="flex-1 max-w-[200px] border-white/20 text-white hover:bg-white/10"
                  onClick={() => handleSave(selectedItem.imageUrl!, selectedItem.title)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save Image
                </Button>
              )}
              {selectedItem.videoUrl && (
                <Button
                  variant="outline"
                  className="flex-1 max-w-[200px] border-white/20 text-white hover:bg-white/10"
                  onClick={() => handleSave(selectedItem.videoUrl!, `${selectedItem.title}-video`)}
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
