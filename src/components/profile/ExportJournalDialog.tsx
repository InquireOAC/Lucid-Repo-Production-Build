
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Loader2, BookOpen, RefreshCw, Star, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDreamStore } from "@/store/dreamStore";
import { useAuth } from "@/contexts/AuthContext";
import { exportDreamJournalPdf } from "@/utils/exportDreamJournalPdf";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ExportJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportJournalDialog = ({ open, onOpenChange }: ExportJournalDialogProps) => {
  const { entries } = useDreamStore();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const authorName = user?.user_metadata?.display_name || user?.user_metadata?.username || "Dreamer";

  let dateRange = "";
  if (sorted.length > 0) {
    try {
      const earliest = sorted[sorted.length - 1].date;
      const latest = sorted[0].date;
      dateRange = `${format(new Date(earliest), "MMM d, yyyy")} — ${format(new Date(latest), "MMM d, yyyy")}`;
    } catch { /* skip */ }
  }

  const handleGenerate = async () => {
    if (entries.length === 0) {
      toast.error("No dreams to export");
      return;
    }
    setIsGenerating(true);
    setPdfBlob(null);
    try {
      const blob = await exportDreamJournalPdf(
        entries,
        { display_name: user?.user_metadata?.display_name, username: user?.user_metadata?.username },
        (current, total) => setProgress({ current, total })
      );
      setPdfBlob(blob);
      toast.success("Dream journal PDF generated!");
    } catch (e) {
      console.error("PDF generation failed:", e);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    saveAs(pdfBlob, "dream-journal.pdf");
  };

  const handleShare = async () => {
    if (!pdfBlob) return;
    if (Capacitor.isNativePlatform()) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          const result = await Filesystem.writeFile({
            path: "dream-journal.pdf",
            data: base64,
            directory: Directory.Cache,
          });
          await Share.share({ url: result.uri, title: "My Dream Journal" });
        };
        reader.readAsDataURL(pdfBlob);
      } catch {
        toast.error("Failed to share");
      }
    } else {
      handleDownload();
    }
  };

  const handleClose = () => {
    setPdfBlob(null);
    setProgress({ current: 0, total: 0 });
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-xl">
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold text-foreground">Export Dream Journal</h1>
            <div className="w-10" />
          </div>

          {pdfBlob ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1">
                <div className="px-4 py-6 space-y-4">
                  {/* Cover card */}
                  <div className="rounded-xl border border-primary/20 bg-card p-6 text-center space-y-3 shadow-lg">
                    <div className="w-12 h-0.5 bg-primary/40 mx-auto" />
                    <h2 className="text-2xl font-bold text-foreground">Dream Journal</h2>
                    <div className="w-16 h-0.5 bg-primary/30 mx-auto" />
                    <p className="text-base text-primary/80 italic">{authorName}</p>
                    <p className="text-sm text-muted-foreground">{sorted.length} dream{sorted.length !== 1 ? "s" : ""}</p>
                    {dateRange && <p className="text-xs text-muted-foreground">{dateRange}</p>}
                  </div>

                  {/* Dream entry cards */}
                  {sorted.map((dream, i) => {
                    const imageUrl = dream.generatedImage || dream.image_url;
                    let dateStr = dream.date;
                    try { dateStr = format(new Date(dream.date), "MMMM d, yyyy"); } catch { /* keep original */ }

                    return (
                      <div key={dream.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={dream.title}
                            className="w-full h-40 object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="p-4 space-y-2">
                          <h3 className="font-semibold text-foreground text-base leading-tight">{dream.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>{dateStr}</span>
                            {dream.mood && <><span>•</span><span>{dream.mood}</span></>}
                            {dream.lucid && (
                              <Badge variant="outline" className="text-xs py-0 px-1.5 gap-0.5">
                                <Star className="h-3 w-3" /> Lucid
                              </Badge>
                            )}
                          </div>
                          {dream.tags && dream.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {dream.tags.slice(0, 5).map(t => (
                                <span key={t} className="text-xs text-primary/70">#{t}</span>
                              ))}
                            </div>
                          )}
                          {dream.content && (
                            <p className="text-sm text-muted-foreground line-clamp-3">{dream.content}</p>
                          )}
                          {dream.analysis && (
                            <div className="flex items-center gap-1.5 text-xs text-primary/60 pt-1">
                              <FileText className="h-3.5 w-3.5" />
                              <span>Analysis included</span>
                            </div>
                          )}
                        </div>
                        <div className="px-4 pb-2 text-right">
                          <span className="text-[10px] text-muted-foreground/50">{i + 1} / {sorted.length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 flex gap-2"
                style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
              >
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={handleShare} className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="icon" onClick={handleGenerate} title="Regenerate">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-10 space-y-6">
              <BookOpen className="h-16 w-16 text-primary/60" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {entries.length} dream{entries.length !== 1 ? "s" : ""} will be exported
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Generate a beautifully formatted PDF book with your dream entries, images, and analyses.
                </p>
              </div>
              {isGenerating ? (
                <div className="flex flex-col items-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Processing dream {progress.current} of {progress.total}...
                  </p>
                </div>
              ) : (
                <Button onClick={handleGenerate} disabled={entries.length === 0} className="w-full max-w-xs">
                  Generate PDF
                </Button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExportJournalDialog;
