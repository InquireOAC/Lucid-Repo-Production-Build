
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { toast } from "sonner";
import { downloadImageAsPng } from "./downloadImageAsPng";

/**
 * Saves or shares an image intelligently depending on platform.
 * If in a native environment (iOS/Android), use share sheet with PNG.
 * Else, download via web browser as PNG.
 */
export async function shareOrSaveImage(imageUrl: string, filename = "dream-image.png") {
  try {
    console.log("shareOrSaveImage called with URL:", imageUrl);
    
    if (Capacitor.isNativePlatform()) {
      console.log("Native platform detected, preparing PNG for share sheet");
      
      try {
        // Fetch the image and convert to PNG blob if needed
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        const blob = await response.blob();
        let pngBlob = blob;
        
        // Convert to PNG if not already
        if (blob.type !== "image/png") {
          console.log("Converting image to PNG format for sharing");
          
          const img = document.createElement("img");
          img.crossOrigin = "anonymous";
          img.src = imageUrl;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error("Failed to load image for conversion"));
          });
          
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            throw new Error("Failed to get canvas context");
          }
          
          ctx.drawImage(img, 0, 0);
          
          // Convert canvas to PNG blob directly
          pngBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to convert canvas to PNG blob"));
              }
            }, "image/png", 0.92);
          });
        }
        
        // Create object URL for the PNG blob
        const pngUrl = URL.createObjectURL(pngBlob);
        
        await Share.share({
          title: "Dream Image",
          text: "Check out my dream image from Lucid Repo!",
          url: pngUrl,
          dialogTitle: "Save or Share Dream Image",
        });
        
        toast.success("Opened share sheet!");
        
        // Clean up the object URL
        setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
        return;
      } catch (nativeError) {
        console.error("Native share failed, falling back to download:", nativeError);
        // Fall back to web download if native sharing fails
      }
    }
    
    // Web fallback: download as PNG
    console.log("Using web download fallback - saving as PNG");
    await downloadImageAsPng(imageUrl, filename);
    toast.success("Dream image downloaded as PNG!");
    
  } catch (error) {
    console.error("Failed to share/save dream image:", error);
    toast.error("Failed to export dream image. Please try again.");
  }
}
