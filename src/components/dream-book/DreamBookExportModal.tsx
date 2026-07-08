import React, { useState } from "react";
import { DreamEntry } from "@/types/dream";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2 } from "lucide-react";
import { exportDreamBookPdf } from "@/utils/exportDreamBookPdf";
import { saveAs } from "file-saver";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { toast } from "sonner";

interface DreamBookExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dreams: DreamEntry[];
  authorName: string;
}

const DreamBookExportModal = ({
  open,
  onOpenChange,
  dreams,
  authorName,
}: DreamBookExportModalProps) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);
    try {
      const blob = await exportDreamBookPdf(dreams, { display_name: authorName }, (cur, total) => {
        setProgress(Math.round((cur / total) * 100));
      });

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const result = await Filesystem.writeFile({
          path: "dream-book.pdf",
          data: base64,
          directory: Directory.Cache,
        });
        await Share.share({ title: "Dream Book", url: result.uri, dialogTitle: "Save Dream Book" });
      } else {
        saveAs(blob, "dream-book.pdf");
      }

      toast.success("Dream book exported!");
      onOpenChange(false);
    } catch (err) {
      console.error("Export failed", err);
      toast.error("Failed to export dream book");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Export Dream Book</DialogTitle>
          <DialogDescription>
            Generate a beautifully formatted PDF of your dream journal with {dreams.length} dream
            {dreams.length !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        {exporting ? (
          <div className="py-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Generating your book...</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground/60 text-center">{progress}%</p>
          </div>
        ) : (
          <div className="py-4">
            <Button onClick={handleExport} className="w-full" variant="luminous">
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DreamBookExportModal;
