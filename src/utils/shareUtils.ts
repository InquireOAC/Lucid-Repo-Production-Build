import html2canvas from "html2canvas";

/**
 * Converts an HTML element to a PNG blob
 */
export const elementToPngBlob = async (element: HTMLElement): Promise<Blob | null> => {
  try {
    console.log("Starting HTML to Canvas conversion");
    
    // Wait for all images to load completely
    const images = Array.from(element.querySelectorAll('img'));
    
    if (images.length > 0) {
      console.log(`Waiting for ${images.length} images to load`);
      
      await Promise.all(
        images.map(img => {
          // If image is already loaded, resolve immediately
          if (img.complete && img.naturalHeight !== 0) {
            console.log(`Image already loaded: ${img.src.slice(0, 50)}...`);
            return Promise.resolve<void>();
          }
          
          // Otherwise wait for the image to load or fail
          return new Promise<void>((resolve) => {
            img.onload = () => {
              console.log(`Image loaded: ${img.src.slice(0, 50)}...`);
              resolve();
            };
            
            img.onerror = () => {
              console.error("Image failed to load:", img.src.slice(0, 50));
              // Replace with gradient instead of placeholder
              img.style.display = 'none';
              if (img.parentElement) {
                img.parentElement.style.background = 
                  'linear-gradient(to right, rgba(155, 135, 245, 0.8), rgba(126, 105, 171, 0.8))';
                img.parentElement.innerHTML += 
                  '<div style="display: flex; align-items: center; justify-content: center; height: 100%;">' +
                  '<span style="font-size: 2rem; color: white; font-weight: 500;">Dream Visualization</span>' +
                  '</div>';
              }
              resolve();
            };
            
            // Set a timeout in case the image takes too long
            setTimeout(() => {
              if (!img.complete) {
                console.warn("Image load timeout:", img.src.slice(0, 50));
                resolve();
              }
            }, 3000);
          });
        })
      );
    }
    
    console.log("All images processed, generating canvas");
    
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
            console.warn("Image not completely loaded in clone:", img.src?.slice(0, 50));
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
