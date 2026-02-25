
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
                <div className="px-3 py-6 space-y-6">
                  {/* Cover spread */}
                  <div className="rounded-lg shadow-xl overflow-hidden border border-border/30 bg-[hsl(var(--card))]">
                    <div className="aspect-[16/10] flex items-center justify-center p-8 relative"
                      style={{ background: "linear-gradient(135deg, hsl(35 30% 92%), hsl(30 20% 88%))" }}
                    >
                      <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                      }} />
                      <div className="text-center space-y-4 relative z-10">
                        <div className="w-16 h-[2px] mx-auto" style={{ background: "hsl(260 30% 45%)" }} />
                        <h2 className="text-3xl font-serif font-bold" style={{ color: "hsl(260 30% 25%)" }}>Dream Journal</h2>
                        <div className="w-24 h-[1px] mx-auto" style={{ background: "hsl(260 20% 60%)" }} />
                        <p className="text-lg font-serif italic" style={{ color: "hsl(260 20% 45%)" }}>{authorName}</p>
                        <div className="space-y-1 pt-2">
                          <p className="text-sm" style={{ color: "hsl(260 10% 55%)" }}>{sorted.length} dream{sorted.length !== 1 ? "s" : ""}</p>
                          {dateRange && <p className="text-xs" style={{ color: "hsl(260 10% 65%)" }}>{dateRange}</p>}
                        </div>
                        <div className="pt-6">
                          <p className="text-xs font-serif italic" style={{ color: "hsl(260 10% 65%)" }}>
                            "Dreams are the royal road to the unconscious."
                          </p>
                          <p className="text-[10px] mt-1" style={{ color: "hsl(260 10% 70%)" }}>— Sigmund Freud</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dream entry spreads */}
                  {sorted.map((dream, i) => {
                    const imageUrl = dream.generatedImage || dream.image_url;
                    let dateStr = dream.date;
                    try { dateStr = format(new Date(dream.date), "MMMM d, yyyy"); } catch { /* keep */ }

                    return (
                      <div key={dream.id} className="rounded-lg shadow-xl overflow-hidden border border-border/30">
                        <div className="flex flex-col sm:flex-row">
                          {/* Left page — image */}
                          <div className="sm:w-1/2 relative" style={{ background: "linear-gradient(135deg, hsl(260 25% 22%), hsl(240 20% 18%))" }}>
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={dream.title}
                                className="w-full h-52 sm:h-full sm:absolute sm:inset-0 object-cover"
                                style={{ filter: "sepia(0.08) saturate(1.1)" }}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-52 sm:h-full sm:min-h-[280px] flex items-center justify-center p-6"
                                style={{ background: "linear-gradient(160deg, hsl(260 30% 20%), hsl(280 25% 15%), hsl(240 20% 18%))" }}
                              >
                                <h3 className="text-xl font-serif font-bold text-center leading-snug"
                                  style={{ color: "hsl(260 20% 70%)" }}
                                >
                                  {dream.title}
                                </h3>
                              </div>
                            )}
                            {/* Left page number */}
                            <div className="absolute bottom-2 left-3">
                              <span className="text-[10px] font-serif" style={{ color: "hsla(0 0% 100% / 0.4)" }}>{i * 2 + 1}</span>
                            </div>
                          </div>

                          {/* Spine divider */}
                          <div className="hidden sm:block w-[1px] relative">
                            <div className="absolute inset-0" style={{
                              background: "linear-gradient(180deg, transparent, hsl(var(--border) / 0.4), transparent)"
                            }} />
                            <div className="absolute inset-0 w-2 -translate-x-1" style={{
                              background: "linear-gradient(90deg, hsla(0 0% 0% / 0.06), transparent)"
                            }} />
                          </div>

                          {/* Right page — text */}
                          <div className="sm:w-1/2 p-5 flex flex-col justify-between"
                            style={{ background: "hsl(35 30% 93%)" }}
                          >
                            <div className="space-y-3 flex-1">
                              <h3 className="font-serif font-bold text-base leading-tight" style={{ color: "hsl(260 30% 20%)" }}>
                                {dream.title}
                              </h3>
                              <div className="flex items-center gap-2 text-xs flex-wrap" style={{ color: "hsl(260 10% 50%)" }}>
                                <span>{dateStr}</span>
                                {dream.mood && <><span>•</span><span>{dream.mood}</span></>}
                                {dream.lucid && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 gap-0.5 border-primary/30">
                                    <Star className="h-2.5 w-2.5" /> Lucid
                                  </Badge>
                                )}
                              </div>
                              {dream.tags && dream.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {dream.tags.slice(0, 5).map(t => (
                                    <span key={t} className="text-[11px] font-serif italic" style={{ color: "hsl(260 25% 45%)" }}>#{t}</span>
                                  ))}
                                </div>
                              )}
                              <div className="w-10 h-[1px] my-1" style={{ background: "hsl(260 15% 75%)" }} />
                              {dream.content && (
                                <p className="text-[12px] leading-relaxed font-serif line-clamp-[8]" style={{ color: "hsl(260 10% 30%)" }}>
                                  {dream.content}
                                </p>
                              )}
                              {dream.analysis && (
                                <div className="pt-2 mt-auto">
                                  <div className="w-full h-[1px] mb-2" style={{ background: "hsl(260 15% 80%)" }} />
                                  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "hsl(260 20% 50%)" }}>
                                    <FileText className="h-3 w-3" />
                                    <span className="font-serif italic">Analysis included</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Right page number */}
                            <div className="text-right mt-3">
                              <span className="text-[10px] font-serif" style={{ color: "hsl(260 10% 70%)" }}>{i * 2 + 2}</span>
                            </div>
                          </div>
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
                  Generate a beautifully formatted PDF book with double-page spreads of your dream entries, images, and analyses.
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
