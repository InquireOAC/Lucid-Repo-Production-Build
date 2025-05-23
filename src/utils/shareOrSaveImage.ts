
import { Capacitor } from "@capacitor/core";
// Import native Share plugin from Capacitor
import { Share } from "@capacitor/share";
import { toast } from "sonner";
import { downloadImageAsPng } from "./downloadImageAsPng";

/**
 * Saves or shares an image intelligently depending on platform.
 * If in a native environment (iOS/Android), use share sheet.
 * Else, download via web browser.
 */
export async function shareOrSaveImage(imageUrl: string, filename = "dream-image.png") {
  try {
    if (Capacitor.isNativePlatform()) {
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert the blob to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve((reader.result as string).split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Share it using Capacitor's Share API (show save/share sheet)
      await Share.share({
        title: "Dream Image",
        text: "",
        // Use a data URL so iOS/Android shows photo preview/share/save sheet
        url: "data:image/png;base64," + base64String,
        dialogTitle: "Save or Share Dream Image",
      });
      toast.success("Opened share sheet!");
      return;
    }
    // Web fallback: use current download logic
    await downloadImageAsPng(imageUrl, filename);
    toast.success("Dream image downloaded!");
  } catch (error) {
    console.error("Failed to share/save dream image:", error);
    toast.error("Failed to export dream image.");
  }
}
