
import React, { useState, useRef } from "react";
import { DreamEntry } from "@/types/dream";
import DreamShareCard, { DreamShareCardRef } from "./DreamShareCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share, Save, QrCode } from "lucide-react";
import { toast } from "sonner";
import { elementToPngBase64, extractBase64FromDataUrl } from "@/utils/shareUtils";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share as CapacitorShare } from "@capacitor/share";

interface ShareButtonProps {
  dream: DreamEntry;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  dream,
  variant = "outline",
  size = "default",
  className = ""
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const shareCardRef = useRef<DreamShareCardRef>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);

  // Enhanced normalization to ensure image is available
  const normalizedDream = {
    ...dream,
    id: dream.id || `dream-${Date.now()}`,
    title: dream.title || "Untitled Dream",
    generatedImage: dream.generatedImage || dream.image_url || null,
    imagePrompt: dream.imagePrompt || dream.image_prompt || "",
    content: dream.content || "No dream content available.",
    analysis: dream.analysis || "",
    date: dream.date || new Date().toISOString()
  };
  
  console.log("Dream in ShareButton:", normalizedDream);
  console.log("Image URL in ShareButton:", normalizedDream.generatedImage);

  const handleShareClick = async () => {
    if (isSharing) return;

    setIsSharing(true);
    
    try {
      // Show the dialog immediately
      setShowShareDialog(true);
      toast.success("Share card generated!");
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to generate share card");
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveCard = async () => {
    if (!previewCardRef.current || isSaving) return;
    
    setIsSaving(true);
    
    try {
      console.log("Starting save process for mobile...");
      
      // Generate PNG from the preview card
      const dataUrl = await elementToPngBase64(previewCardRef.current);
      if (!dataUrl) {
        throw new Error("Failed to generate image");
      }

      // Extract base64 and create filename
      const base64Data = extractBase64FromDataUrl(dataUrl);
      const filename = `${normalizedDream.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`;
      
      if (Capacitor.isNativePlatform()) {
        console.log("Using native sharing capabilities...");
        
        // Save file to device filesystem first
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache
        });
        
        console.log("File saved to cache:", savedFile.uri);
        
        // Use native share sheet to share the image
        await CapacitorShare.share({
          title: normalizedDream.title,
          text: `Check out my dream from Lucid Repo: ${normalizedDream.title}`,
          url: savedFile.uri,
          dialogTitle: 'Share Your Dream Card'
        });
        
        toast.success("Share card ready to share!");
      } else {
        // Fallback for web - download the file
        console.log("Using web fallback - downloading file");
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'image/png' });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success("Share card downloaded!");
      }
      
      // Close dialog after successful save
      setTimeout(() => {
        setShowShareDialog(false);
      }, 500);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save share card");
    } finally {
      setIsSaving(false);
    }
  };

  // Validate required fields
  if (!normalizedDream.title || !normalizedDream.content) {
    return null;
  }

  // Generate the dream link - use username from profiles if available, otherwise use user_id
  const dreamLink = normalizedDream.profiles?.username 
    ? `https://d388978b-fa85-4ea2-8121-266d2b9c0dc7.lovableproject.com/profile/${normalizedDream.profiles.username}/dream/${normalizedDream.id}`
    : `https://d388978b-fa85-4ea2-8121-266d2b9c0dc7.lovableproject.com/profile/${normalizedDream.user_id}/dream/${normalizedDream.id}`;

  return (
    <>
      <Button 
        onClick={handleShareClick} 
        variant={variant} 
        size={size} 
        disabled={isSharing} 
        className={`flex items-center justify-center gap-2 ${className}`}
      >
        <Share size={18} />
        <span>{isSharing ? "Generating..." : "Share"}</span>
      </Button>
      
      {/* Share card preview dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm max-h-[95vh] overflow-y-auto p-2">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center">Share Your Dream</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Full-size preview of the share card */}
            <div 
              ref={previewCardRef}
              className="w-full mx-auto"
              style={{ aspectRatio: '9/16' }}
            >
              <div 
                className="w-full h-full overflow-hidden"
                style={{
                  padding: '16px', 
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  background: 'linear-gradient(to bottom, #6344A5, #8976BF)',
                  borderRadius: '12px'
                }}
              >
                {/* App Name at the top */}
                <div className="flex items-center justify-center mb-3">
                  <h1 className="text-base font-bold text-white tracking-tight">
                    Lucid Repo
                  </h1>
                </div>
                
                {/* Title & Date */}
                <div className="mb-3">
                  <h2 className="text-lg font-bold leading-tight text-white text-left line-clamp-2">
                    {normalizedDream.title}
                  </h2>
                  <p className="text-xs text-white/50 mt-1 text-left">
                    {normalizedDream.date 
                      ? new Intl.DateTimeFormat('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }).format(new Date(normalizedDream.date))
                      : "Unknown Date"}
                  </p>
                </div>
                
                {/* Dream Story */}
                <div className="mb-3 bg-white/20 p-3 rounded-lg">
                  <p className="text-sm leading-normal text-white text-left line-clamp-6">
                    {normalizedDream.content.length > 200 
                      ? normalizedDream.content.substring(0, 200) + "..." 
                      : normalizedDream.content}
                  </p>
                </div>
                
                {/* Dream Analysis */}
                {normalizedDream.analysis && (
                  <div className="mb-3">
                    <div className="border-l-2 border-purple-300 pl-2">
                      <p className="text-xs italic text-white/90 text-left line-clamp-3">
                        {normalizedDream.analysis.length > 120 
                          ? normalizedDream.analysis.substring(0, 120) + "..." 
                          : normalizedDream.analysis}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Dream Visualization - with 256px height */}
                {normalizedDream.generatedImage && (
                  <div className="mb-3 flex items-center justify-center">
                    <div className="w-full overflow-hidden rounded-lg shadow-lg relative bg-[#8976BF]" style={{ height: '256px' }}>
                      <img 
                        src={normalizedDream.generatedImage}
                        alt="Dream Visualization"
                        className="w-full h-full object-contain"
                        style={{ 
                          borderRadius: '8px',
                          backgroundColor: '#8976BF'
                        }}
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>
                )}
                
                {/* Dream Link Section */}
                <div className="mb-3 bg-white/10 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/90 mb-1">View this dream:</p>
                      <p className="text-xs text-white font-mono truncate">
                        {dreamLink}
                      </p>
                    </div>
                    <div className="ml-2 bg-white p-2 rounded-md flex-shrink-0">
                      <QrCode size={24} className="text-purple-600" />
                    </div>
                  </div>
                </div>
                
                {/* Footer with logo - increased by 25px */}
                <div className="flex justify-center items-center mt-auto">
                  <img
                    src="/lovable-uploads/e94fd126-8216-43a0-a62d-cf081a8c036f.png"
                    alt="Lucid Repo Logo"
                    className="object-contain"
                    style={{ height: '49px', width: 'auto' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Save button */}
            <Button 
              onClick={handleSaveCard}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2"
            >
              <Save size={18} />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* The hidden share card component for fallback */}
      <DreamShareCard ref={shareCardRef} dream={normalizedDream} />
    </>
  );
};

export default ShareButton;
