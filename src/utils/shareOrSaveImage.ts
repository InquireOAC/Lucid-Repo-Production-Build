
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";

/**
 * Saves or shares an image as PNG depending on platform.
 * Now optimized to work with Supabase storage URLs.
 */
export async function shareOrSaveImage(imageUrl: string, filename = "dream-image.png") {
  try {
    console.log("shareOrSaveImage called with URL:", imageUrl);
    
    if (!imageUrl) {
      throw new Error("No image URL provided");
    }
    
    if (Capacitor.isNativePlatform()) {
      console.log("Native platform detected, using share sheet");
      
      await Share.share({
        title: "Dream Image",
        text: "Check out my dream image from Lucid Repo!",
        url: imageUrl,
        dialogTitle: "Save or Share Dream Image",
      });
    } else {
      console.log("Web platform detected, attempting download");
      
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (downloadError) {
        console.warn("Direct download failed, opening in new tab:", downloadError);
        window.open(imageUrl, '_blank');
      }
    }
    
  } catch (error) {
    console.error("Failed to share/save dream image:", error);
    throw error;
  }
}
