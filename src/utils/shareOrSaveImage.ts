
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { toast } from "sonner";
import { saveAs } from "file-saver";

/**
 * Automatically downloads image on generation and provides manual save option
 */
export async function autoDownloadImage(imageUrl: string, filename = "dream-image.png") {
  try {
    console.log("Auto-downloading image:", imageUrl);
    
    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Dream image downloaded automatically!");
    return true;
  } catch (error) {
    console.warn("Auto download failed, will provide manual save option:", error);
    return false;
  }
}

/**
 * Saves or shares an image as PNG depending on platform.
 * Simplified approach to handle CORS issues with external URLs.
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
      
      toast.success("Opened share sheet!");
    } else {
      // Web: Try direct download first
      console.log("Web platform detected, attempting download");
      
      try {
        // For external URLs (like OpenAI), try direct download link
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Dream image download started!");
      } catch (downloadError) {
        console.warn("Direct download failed, opening in new tab:", downloadError);
        
        // Fallback: open image in new tab so user can save manually
        window.open(imageUrl, '_blank');
        toast.info("Image opened in new tab - right-click to save!");
      }
    }
    
  } catch (error) {
    console.error("Failed to share/save dream image:", error);
    
    // Provide specific error messages based on the type of failure
    let errorMessage = 'Failed to save dream image. ';
    
    if (imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      errorMessage += 'The image URL may have expired. Opening in new tab so you can save manually.';
      // Try to open in new tab as last resort
      try {
        window.open(imageUrl, '_blank');
        toast.info(errorMessage);
      } catch {
        toast.error('Unable to access image - please regenerate.');
      }
    } else {
      errorMessage += 'Please try again or regenerate the image.';
      toast.error(errorMessage);
    }
    
    throw error;
  }
}
