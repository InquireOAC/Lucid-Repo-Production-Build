
import html2canvas from "html2canvas";

/**
 * Converts an HTML element to a PNG blob
 */
export const elementToPngBlob = async (element: HTMLElement): Promise<Blob | null> => {
  try {
    console.log("Starting HTML to Canvas conversion");
    
    // Wait for all images to load completely
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => {
            console.error("Image failed to load:", img.src);
            img.src = "https://placehold.co/600x400/6B5B95/ffffff?text=Dream+Image";
            resolve();
          };
        });
      })
    );
    
    console.log("All images loaded, generating canvas");
    
    // Use a scale of 2 for higher resolution
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (doc, ele) => {
        console.log("Canvas cloned, processing");
        // Force all images to be visible in clone
        const clonedImages = ele.querySelectorAll('img');
        clonedImages.forEach(img => {
          img.crossOrigin = "anonymous";
          if (!img.complete || img.naturalHeight === 0) {
            console.warn("Image not completely loaded in clone:", img.src);
          }
        });
      }
    });
    
    console.log("Canvas generated successfully");
    
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        console.log("Blob created:", blob ? "success" : "failed");
        resolve(blob);
      }, "image/png");
    });
  } catch (error) {
    console.error("Error converting element to PNG:", error);
    return null;
  }
};

/**
 * Shares content via Web Share API or falls back to download
 */
export const shareContent = async (blob: Blob | null, title: string, text: string): Promise<boolean> => {
  if (!blob) {
    console.error("No blob provided for sharing");
    return false;
  }

  // Create a File from the Blob
  const file = new File([blob], "dream-story.png", { type: "image/png" });
  
  // Check if Web Share API is available and can share files
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      console.log("Using Web Share API");
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return true;
    } catch (error) {
      console.error("Error sharing:", error);
      // Fall back to download if sharing failed
      downloadImage(blob, "dream-story.png");
      return false;
    }
  } else {
    console.log("Web Share API not available, falling back to download");
    // Fall back to download if Web Share API isn't available
    downloadImage(blob, "dream-story.png");
    return true;
  }
};

/**
 * Downloads a blob as a file
 */
const downloadImage = (blob: Blob, fileName: string): void => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
