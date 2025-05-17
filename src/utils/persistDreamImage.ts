
/**
 * Util function: Fetches image from external URL (OpenAI, etc), converts to DataURL.
 * Call this before saving to DB (ideal for images that may expire).
 */
export const fetchImageAsDataURL = async (url: string): Promise<string | null> => {
  try {
    if (!url) {
      console.error("fetchImageAsDataURL: No URL provided");
      return null;
    }
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) {
      console.error(`fetchImageAsDataURL: Failed to fetch image: ${response.status} ${response.statusText}`);
      return null;
    }
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string" && reader.result.startsWith("data:image/")) {
          resolve(reader.result);
        } else {
          console.error("fetchImageAsDataURL: FileReader result was not a valid base64 image DataURL", reader.result);
          reject(new Error("FileReader did not produce a valid base64 data URL."));
        }
      };
      reader.onerror = (error) => {
        console.error("fetchImageAsDataURL: FileReader error", error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("persistDreamImage error: Could not convert to base64 data URL", e);
    return null;
  }
};
