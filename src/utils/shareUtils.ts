import html2canvas from "html2canvas";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";

/**
 * Converts an HTML element to a PNG blob with optimized settings for reliability
 */
export const elementToPngBlob = async (element: HTMLElement): Promise<Blob | null> => {
  try {
    console.log("Starting HTML to Canvas conversion");
    
    // Process any images and fonts in the element first
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
        
        // Verify image URLs and make sure they're not empty
        if (!img.src || img.src === '') {
          console.error("Image has empty source", img);
        } else {
          console.log("Image src:", img.src.substring(0, 100) + '...');
        }
        
        // Add load event listener for debugging
        img.addEventListener('load', () => {
          console.log("Image successfully loaded:", img.src ? (img.src.substring(0, 50) + "...") : "no source");
        });
        
        // Add error event listener for debugging
        img.addEventListener('error', (e) => {
          console.error("Image failed to load:", img.src, e);
        });
      });
      
      // Give a small timeout to ensure all styles are applied and images are loaded
      console.log("Waiting for images to load completely...");
      await new Promise(resolve => setTimeout(resolve, 3000)); // Increased timeout for image loading
    }
    
    console.log("Generating canvas");
    
    // Generate canvas with optimized settings for Instagram-quality images
    const canvas = await html2canvas(element, { 
      scale: 2.0, // Optimized scale for good quality without excessive size
      useCORS: true,
      allowTaint: true,
      logging: true, // Enable logging for debugging
      backgroundColor: null,
      imageTimeout: 15000, // Extended timeout for image processing
    });
    
    console.log("Canvas generated successfully");
    
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        console.log("Blob created:", blob ? `${Math.round(blob.size / 1024)}KB` : "failed");
        resolve(blob);
      }, "image/png", 0.92); // High quality for social sharing
    });
  } catch (error) {
    console.error("Error converting element to PNG:", error);
    return null;
  }
};

/**
 * Converts a blob to a data URL string
 */
export const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Downloads a blob as a file (fallback for non-capacitor environments)
 */
export const downloadImage = (blob: Blob, fileName: string): void => {
  try {
    console.log("Starting image download process");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      console.log("Download process completed");
    }, 100);
  } catch (error) {
    console.error("Error downloading image:", error);
    throw new Error("Failed to download image");
  }
};

/**
 * Shares a dream using the native share sheet on iOS or downloads on web
 */
export const shareDream = async (
  element: HTMLElement, 
  title: string, 
  text: string
): Promise<boolean> => {
  try {
    console.log("Starting dream share process");
    
    // Generate image blob from the element
    const blob = await elementToPngBlob(element);
    if (!blob) {
      throw new Error("Failed to generate share image");
    }

    // Generate a File object from the blob (needed for iOS/Android Share sheets)
    const file = new File([blob], `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`, { type: "image/png" });

    // If on a capacitor native platform (iOS/Android)
    if (Capacitor.isNativePlatform()) {
      console.log("Using native sharing");

      // Prefer new Capacitor share API with `files` property if available
      try {
        // @ts-ignore 'files' property may not show in some type defs
        await Share.share({
          title: title,
          text: text,
          // The actual image to share
          files: [file],
          dialogTitle: 'Share Your Dream',
        });
        console.log("Native share with image file completed");
        return true;
      } catch (filesShareError) {
        // Fall back to using dataUrl with url property if file attachment fails for some reason
        console.warn("Native share with file failed or unsupported, falling back to data URL...");

        const dataUrl = await blobToDataURL(blob);

        await Share.share({
          title: title,
          text: text,
          url: dataUrl,
          dialogTitle: 'Share Your Dream',
        });
        console.log("Native share fallback with data URL completed");
        return true;
      }
    }

    // Fallback for web: download the image
    console.log("Using web fallback for sharing");
    downloadImage(blob, `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`);
    return true;
  } catch (error) {
    console.error("Error sharing dream:", error);
    return false;
  }
};
