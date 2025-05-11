import html2canvas from "html2canvas";

/**
 * Converts an HTML element to a PNG blob with optimized settings for reliability
 */
export const elementToPngBlob = async (element: HTMLElement): Promise<Blob | null> => {
  try {
    console.log("Starting HTML to Canvas conversion");
    
    // Wait for all images to load completely before attempting conversion
    const images = Array.from(element.querySelectorAll('img'));
    
    if (images.length > 0) {
      console.log(`Waiting for ${images.length} images to load`);
      
      // Force all images to load or fail before continuing
      await Promise.all(
        images.map(img => {
          // If image is already loaded, resolve immediately
          if (img.complete && img.naturalHeight !== 0) {
            console.log(`Image already loaded: ${img.src.slice(0, 50)}...`);
            return Promise.resolve();
          }
          
          // Otherwise wait for the image to load or fail
          return new Promise<void>((resolve) => {
            img.onload = () => {
              console.log(`Image loaded: ${img.src.slice(0, 50)}...`);
              resolve();
            };
            
            // Handle image errors by replacing with a gradient
            img.onerror = () => {
              console.error("Image failed to load:", img.src.slice(0, 50));
              // Replace with gradient instead of placeholder
              img.style.display = 'none';
              if (img.parentElement) {
                img.parentElement.style.background = 
                  'linear-gradient(to right, #6344A5, #8976BF)';
                img.parentElement.innerHTML += 
                  '<div style="display: flex; align-items: center; justify-content: center; height: 100%;">' +
                  '<span style="font-size: 2rem; color: white; font-weight: 500;">Dream Visualization</span>' +
                  '</div>';
              }
              resolve();
            };
            
            // Set a shorter timeout for image loading - faster fail
            setTimeout(() => {
              if (!img.complete) {
                console.warn("Image load timeout:", img.src.slice(0, 50));
                img.dispatchEvent(new Event('error'));
                resolve();
              }
            }, 3000); // Reduced to 3 seconds for faster processing
          });
        })
      );
    }
    
    console.log("All images processed, generating canvas");
    
    // Use lower scale and quality settings for faster processing
    const canvas = await html2canvas(element, { 
      scale: 1, // Reduced scale for faster processing
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: null
    });
    
    console.log("Canvas generated successfully");
    
    return new Promise<Blob | null>((resolve) => {
      const blobTimeout = setTimeout(() => {
        console.warn("Blob creation timed out");
        resolve(null);
      }, 3000); // Reduced to 3 seconds
      
      canvas.toBlob((blob) => {
        clearTimeout(blobTimeout);
        console.log("Blob created:", blob ? "success" : "failed");
        resolve(blob);
      }, "image/png", 0.8); // Lower quality for better performance
    });
  } catch (error) {
    console.error("Error converting element to PNG:", error);
    return null;
  }
};

/**
 * Downloads a blob as a file with improved reliability
 */
export const downloadImage = (blob: Blob, fileName: string): void => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Clean up faster
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, 100);
};

/**
 * Shares content via Web Share API or falls back to download
 * Note: This is kept for reference but no longer used in favor of direct downloads
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
