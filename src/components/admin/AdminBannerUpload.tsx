import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { uploadAdminBanner, AdminBannerKind } from "@/utils/uploadAdminBanner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  kind: AdminBannerKind;
  aspect?: "wide" | "square";
  className?: string;
  label?: string;
}

const AdminBannerUpload: React.FC<Props> = ({
  value,
  onChange,
  kind,
  aspect = "wide",
  className,
  label = "Banner image",
}) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadAdminBanner(file, kind);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      console.error("[AdminBannerUpload]", err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const aspectClass = aspect === "wide" ? "aspect-[16/9]" : "aspect-square";

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className={cn(
          "relative w-full overflow-hidden rounded-lg border-2 border-dashed cursor-pointer transition-colors",
          aspectClass,
          value
            ? "border-transparent"
            : "border-border/50 bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
        )}
      >
        {value ? (
          <>
            <img src={value} alt="Banner" className="w-full h-full object-cover" />
            {!uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4">
            <ImageIcon className="h-7 w-7 mb-2 text-muted-foreground/60" />
            <p className="text-xs font-medium">Drop an image or click to upload</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPG / PNG, up to 8MB</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-xs h-7 px-2"
        >
          <Upload className="h-3 w-3 mr-1" /> Replace
        </Button>
      )}
    </div>
  );
};

export default AdminBannerUpload;
