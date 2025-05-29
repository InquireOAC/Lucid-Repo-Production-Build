
import { Capacitor } from "@capacitor/core";
// Import native Share plugin from Capacitor
import { Share } from "@capacitor/share";
import { toast } from "sonner";
import { downloadImageAsPng } from "./downloadImageAsPng";

/**
 * Saves or shares an image intelligently depending on platform.
 * If in a native environment (iOS/Android), use share sheet with URL.
 * Else, download via web browser.
 */
export async function shareOrSaveImage(imageUrl: string, filename = "dream-image.png") {
  try {
    console.log("shareOrSaveImage called with URL:", imageUrl);
    
    if (Capacitor.isNativePlatform()) {
      console.log("Native platform detected, using share sheet with URL");
      
      try {
        // Share directly using the image URL - no base64 conversion needed
        await Share.share({
          title: "Dream Image",
          text: "Check out my dream image from Lucid Repo!",
          url: imageUrl, // Use the URL directly
          dialogTitle: "Save or Share Dream Image",
        });
        
        toast.success("Opened share sheet!");
        return;
      } catch (nativeError) {
        console.error("Native share failed, falling back to download:", nativeError);
        // Fall back to web download if native sharing fails
      }
    }
    
    // Web fallback: use download logic with blob handling
    console.log("Using web download fallback");
    await downloadImageAsPng(imageUrl, filename);
    toast.success("Dream image downloaded!");
    
  } catch (error) {
    console.error("Failed to share/save dream image:", error);
    toast.error("Failed to export dream image. Please try again.");
  }
}
