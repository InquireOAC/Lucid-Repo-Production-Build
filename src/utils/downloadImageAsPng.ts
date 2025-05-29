
import { saveAs } from "file-saver";

/**
 * Downloads an image as PNG (converts to PNG if not already). Used for both preview and persisted files.
 * @param imageUrl - The image URL to download.
 * @param filename - Optional filename for the saved file.
 */
export async function downloadImageAsPng(imageUrl: string, filename: string = "dream-image.png") {
  try {
    console.log("downloadImageAsPng called with URL:", imageUrl);
    
    // Check if URL is valid
    if (!imageUrl || (!imageUrl.startsWith("http") && !imageUrl.startsWith("data:"))) {
      throw new Error("Invalid image URL provided");
    }
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error("Received empty or invalid image data");
    }
    
    let pngBlob = blob;
    
    // Convert to PNG if not already
    if (blob.type !== "image/png") {
      console.log("Converting image to PNG format");
      
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
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(',')[1];
      const byteCharacters = atob(base64);
      const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      pngBlob = new Blob([byteArray], { type: "image/png" });
    }
    
    console.log("Saving file with saveAs");
    saveAs(pngBlob, filename);
    
  } catch (err) {
    console.error("Failed to download dream image:", err);
    throw err; // Re-throw so calling function can handle it
  }
}
