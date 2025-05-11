
import html2canvas from "html2canvas";

/**
 * Converts an HTML element to a PNG blob with optimized settings for reliability
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
        if (img.parentElement) {
          img.parentElement.style.background = 
            'linear-gradient(to right, #6344A5, #8976BF)';
        }
        
        // Force image loading before generation
        if (!img.complete) {
          console.log("Image not yet loaded, waiting...");
          img.style.opacity = '0.9'; // Slightly transparent until loaded
          
          // If image loads successfully, make it fully visible
          img.addEventListener('load', () => {
            console.log("Image loaded successfully");
            img.style.opacity = '1';
          });
          
          // If image fails to load, log the error but continue
          img.addEventListener('error', () => {
            console.log("Image failed to load:", img.src);
          });
        } else {
          console.log("Image already loaded:", img.src.substring(0, 50) + "...");
        }
      });
      
      // Give a small timeout to ensure all styles are applied and images are loaded
      console.log("Waiting for images to load completely...");
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    console.log("Generating canvas");
    
    // Generate canvas with optimized settings for Instagram-quality images
    const canvas = await html2canvas(element, { 
      scale: 3.0, // Higher scale for better quality on Instagram's vertical format
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null,
      imageTimeout: 5000, // Extended timeout for image processing
    });
    
    console.log("Canvas generated successfully");
    
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        console.log("Blob created:", blob ? `${Math.round(blob.size / 1024)}KB` : "failed");
        resolve(blob);
      }, "image/png", 0.98); // Higher quality for social sharing
    });
  } catch (error) {
    console.error("Error converting element to PNG:", error);
    return null;
  }
};

/**
 * Downloads a blob as a file
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
