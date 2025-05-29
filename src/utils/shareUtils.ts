
import html2canvas from "html2canvas";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { saveAs } from "file-saver";

/**
 * Converts an HTML element to a PNG blob
 */
export const elementToPngBlob = async (element: HTMLElement): Promise<Blob | null> => {
  try {
    console.log("Starting HTML to Canvas conversion");
    
    // Process any images in the element first
    const images = Array.from(element.querySelectorAll('img'));
    
    if (images.length > 0) {
      console.log(`Processing ${images.length} images in share card`);
      
      // Set gradient backgrounds on all image containers as fallbacks
      images.forEach(img => {
        if (img.alt === 'Lucid Repo Logo') return;
        
        if (img.parentElement) {
          img.parentElement.style.background = 
            'linear-gradient(to right, #6344A5, #8976BF)';
        }
      });
      
      // Give time for images to load
      console.log("Waiting for images to load completely...");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("Generating canvas from HTML element");
    
    // Generate canvas with settings optimized for PNG output
    const canvas = await html2canvas(element, { 
      scale: 2.0,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null,
      imageTimeout: 15000,
    });
    
    console.log("Canvas generated successfully");
    
    // Convert directly to PNG blob
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        console.log("PNG blob created:", blob ? `${Math.round(blob.size / 1024)}KB` : "failed");
        resolve(blob);
      }, "image/png", 0.92);
    });
  } catch (error) {
    console.error("Error converting element to PNG:", error);
    return null;
  }
};

/**
 * Downloads a PNG blob as a file
 */
export const downloadPngBlob = (blob: Blob, fileName: string): void => {
  try {
    console.log("Starting PNG download process");
    saveAs(blob, fileName);
    console.log("PNG download process completed");
  } catch (error) {
    console.error("Error downloading PNG:", error);
    throw new Error("Failed to download PNG file");
  }
};

/**
 * Shares a dream using the native share sheet on mobile or downloads on web
 */
export const shareDream = async (
  element: HTMLElement, 
  title: string, 
  text: string
): Promise<boolean> => {
  try {
    console.log("Starting dream share process");

    // Generate PNG blob from the element
    const pngBlob = await elementToPngBlob(element);
    if (!pngBlob) {
      throw new Error("Failed to generate share image");
    }

    if (Capacitor.isNativePlatform()) {
      console.log("Using native sharing with PNG blob");
      
      // Create a temporary object URL for the blob
      const imageUrl = URL.createObjectURL(pngBlob);
      
      try {
        await Share.share({
          title: title,
          text: text,
          url: imageUrl,
          dialogTitle: 'Share Your Dream',
        });

        console.log("Native share with PNG completed");
        
        // Clean up the object URL
        setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
        
        return true;
      } catch (shareError) {
        console.error("Native share failed:", shareError);
        // Clean up on error
        URL.revokeObjectURL(imageUrl);
        // Fall back to download
        downloadPngBlob(pngBlob, `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`);
        return true;
      }
    }

    // Fallback for web: download the PNG directly
    console.log("Using web fallback for sharing - downloading PNG");
    downloadPngBlob(pngBlob, `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`);
    return true;
  } catch (error) {
    console.error("Error sharing dream:", error);
    return false;
  }
};
