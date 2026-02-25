
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Loader2, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDreamStore } from "@/store/dreamStore";
import { useAuth } from "@/contexts/AuthContext";
import { exportDreamJournalPdf } from "@/utils/exportDreamJournalPdf";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

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
            ) : pdfBlob ? (
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button onClick={handleDownload} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={handleShare} className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" onClick={handleGenerate} className="w-full text-muted-foreground">
                  Regenerate
                </Button>
              </div>
            ) : (
              <Button onClick={handleGenerate} disabled={entries.length === 0} className="w-full max-w-xs">
                Generate PDF
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExportJournalDialog;
