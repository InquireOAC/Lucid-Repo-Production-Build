
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import { toast } from "sonner";
import { saveAs } from "file-saver";

/**
 * Saves or shares an image as PNG depending on platform.
 * Enhanced with better error handling for temporary URLs.
 */
export async function shareOrSaveImage(imageUrl: string, filename = "dream-image.png") {
  try {
    console.log("shareOrSaveImage called with URL:", imageUrl);
    
    if (!imageUrl || (!imageUrl.startsWith("http") && !imageUrl.startsWith("data:"))) {
      throw new Error("Invalid image URL provided");
    }
    
    let blob: Blob;
    
    // Try multiple approaches to get the image data
    try {
      // First attempt: direct fetch
      const response = await fetch(imageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }
      
      blob = await response.blob();
      
      if (!blob || blob.size === 0) {
        throw new Error("Empty blob received");
      }
    } catch (fetchError) {
      console.warn("Direct fetch failed, trying canvas approach:", fetchError);
      
      // Fallback: try to get image from DOM if it's already loaded
      const existingImages = document.querySelectorAll('img');
      let targetImage: HTMLImageElement | null = null;
      
      for (const img of existingImages) {
        if (img.src === imageUrl && img.complete && img.naturalWidth > 0) {
          targetImage = img;
          break;
        }
      }
      
      if (targetImage) {
        console.log("Found existing image in DOM, using canvas to convert");
        
        const canvas = document.createElement("canvas");
        canvas.width = targetImage.naturalWidth;
        canvas.height = targetImage.naturalHeight;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }
        
        ctx.drawImage(targetImage, 0, 0);
        
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((canvasBlob) => {
            if (canvasBlob) {
              resolve(canvasBlob);
            } else {
              reject(new Error("Failed to convert canvas to blob"));
            }
          }, "image/png", 0.92);
        });
      } else {
        throw new Error("Could not access image data - URL may have expired");
      }
    }
    
    // Convert to PNG if not already
    let pngBlob = blob;
    if (blob.type !== "image/png") {
      console.log("Converting to PNG format");
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      const imageDataUrl = URL.createObjectURL(blob);
      img.src = imageDataUrl;
      
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
      
      pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to PNG blob"));
          }
        }, "image/png", 0.92);
      });
      
      URL.revokeObjectURL(imageDataUrl);
    }
    
    if (Capacitor.isNativePlatform()) {
      console.log("Native platform detected, using share sheet with PNG");
      
      const pngUrl = URL.createObjectURL(pngBlob);
      
      await Share.share({
        title: "Dream Image",
        text: "Check out my dream image from Lucid Repo!",
        url: pngUrl,
        dialogTitle: "Save or Share Dream Image",
      });
      
      toast.success("Opened share sheet!");
      setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
    } else {
      // Web: download as PNG
      console.log("Web platform detected, downloading PNG");
      saveAs(pngBlob, filename);
      toast.success("Dream image downloaded as PNG!");
    }
    
  } catch (error) {
    console.error("Failed to share/save dream image:", error);
    
    // Provide specific error messages based on the type of failure
    let errorMessage = 'Failed to export dream image. ';
    
    if (imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      errorMessage += 'The image URL has expired. Try regenerating the image and saving it immediately.';
    } else {
      errorMessage += 'Please try again or regenerate the image.';
    }
    
    toast.error(errorMessage);
    throw error;
  }
}
