
import { toPng } from "html-to-image";
import html2canvas from "html2canvas";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { saveAs } from "file-saver";

/**
 * Converts an HTML element to a PNG base64 string using html-to-image
 */
export const elementToPngBase64 = async (element: HTMLElement): Promise<string | null> => {
  try {
    console.log("Starting HTML to Image conversion with html-to-image");
    
    // Wait for all images in the element to be fully loaded
    const images = Array.from(element.querySelectorAll('img'));
    
    if (images.length > 0) {
      console.log(`Waiting for ${images.length} images to be ready...`);
      
      // Poll until all images report complete, max 5 seconds
      const maxWait = 5000;
      const interval = 100;
      let waited = 0;
      while (waited < maxWait) {
        const allReady = images.every(img => img.complete && img.naturalWidth > 0);
        if (allReady) {
          console.log("All images confirmed ready");
          break;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
        waited += interval;
      }
      if (waited >= maxWait) {
        console.warn("Image load timeout reached, proceeding anyway");
      }
    }
    
    console.log("Generating PNG base64 from HTML element");
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log(`Capture mode: ${isMobile ? 'html2canvas (mobile)' : 'html-to-image (desktop)'}`);
    
    let dataUrl: string;
    
    if (isMobile) {
      // html2canvas draws directly to canvas, bypassing SVG foreignObject
      // size limits that corrupt large base64 images on mobile Safari
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        logging: false,
      });
      dataUrl = canvas.toDataURL('image/png', 0.95);
    } else {
      // html-to-image produces higher quality on desktop
      dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 4.0,
        backgroundColor: null,
        cacheBust: false,
      });
    }
    
    console.log("High-resolution PNG base64 generated successfully");
    return dataUrl;
  } catch (error) {
    console.error("Error converting element to PNG base64:", error);
    return null;
  }
};

/**
 * Extracts base64 data from data URL (removes data:image/png;base64, prefix)
 */
export const extractBase64FromDataUrl = (dataUrl: string): string => {
  const base64Prefix = "data:image/png;base64,";
  if (dataUrl.startsWith(base64Prefix)) {
    return dataUrl.substring(base64Prefix.length);
  }
  return dataUrl;
};

/**
 * Saves base64 PNG data to filesystem using Capacitor Filesystem
 */
export const saveBase64ToFile = async (base64Data: string, fileName: string): Promise<string | null> => {
  try {
    console.log("Saving base64 data to filesystem:", fileName);
    
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    });
    
    console.log("File saved successfully:", result.uri);
    return result.uri;
  } catch (error) {
    console.error("Error saving file to filesystem:", error);
    return null;
  }
};

/**
 * Downloads a base64 PNG as a file (web fallback)
 */
export const downloadBase64Png = (base64Data: string, fileName: string): void => {
  try {
    console.log("Starting PNG download process");
    
    // Convert base64 to blob
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });
    
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
    console.log("Starting dream share process with html-to-image");

    // Generate PNG base64 from the element
    const dataUrl = await elementToPngBase64(element);
    if (!dataUrl) {
      throw new Error("Failed to generate share image");
    }

    // Extract base64 data without prefix
    const base64Data = extractBase64FromDataUrl(dataUrl);
    
    if (Capacitor.isNativePlatform()) {
      console.log("Using native sharing with Filesystem and Share");
      
      // Generate dynamic filename with timestamp
      const timestamp = Date.now();
      const fileName = `dreamcard_${timestamp}.png`;
      
      try {
        // Save file to device filesystem
        const fileUri = await saveBase64ToFile(base64Data, fileName);
        
        if (!fileUri) {
          throw new Error("Failed to save file to filesystem");
        }
        
        // Share the saved file using native share sheet
        await Share.share({
          title: title,
          text: text,
          url: fileUri,
          dialogTitle: 'Share Your Dream',
        });

        console.log("Native share with filesystem completed");
        return true;
      } catch (shareError) {
        console.error("Native share failed:", shareError);
        // Fall back to download
        downloadBase64Png(base64Data, `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`);
        return true;
      }
    }

    // Fallback for web: download the PNG directly
    console.log("Using web fallback for sharing - downloading PNG");
    downloadBase64Png(base64Data, `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`);
    return true;
  } catch (error) {
    console.error("Error sharing dream:", error);
    return false;
  }
};
