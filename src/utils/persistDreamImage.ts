
/**
 * Util function: Fetches image from external URL (OpenAI, etc), converts to DataURL.
 * Call this before saving to DB (ideal for images that may expire).
 */
export const fetchImageAsDataURL = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("persistDreamImage error:", e);
    return null;
  }
};
