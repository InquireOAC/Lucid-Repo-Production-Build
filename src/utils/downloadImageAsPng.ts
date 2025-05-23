
import { saveAs } from "file-saver";

/**
 * Downloads an image as PNG (converts to PNG if not already). Used for both preview and persisted files.
 * @param imageUrl - The image URL to download.
 * @param filename - Optional filename for the saved file.
 */
export async function downloadImageAsPng(imageUrl: string, filename: string = "dream-image.png") {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    let pngBlob = blob;
    if (blob.type !== "image/png") {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      const base64 = dataUrl.split(',')[1];
      const byteCharacters = atob(base64);
      const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      pngBlob = new Blob([byteArray], { type: "image/png" });
    }
    saveAs(pngBlob, filename);
  } catch (err) {
    console.error("Failed to auto-download dream image:", err);
  }
}
