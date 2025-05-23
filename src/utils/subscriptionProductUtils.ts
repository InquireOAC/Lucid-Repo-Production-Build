
/**
 * Normalize Stripe product objects to return correct hardcoded features.
 * - Mystic plan: Unlimited features
 * - Dreamer plan: Limited features
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  features: string[];
}

export function normalizeProduct(product: any): Product {
  const safeName = (product.name || "").trim().toLowerCase();
  let features: string[] = [];

  // Ensure we handle both name and ID matches
  if (
    safeName === "mystic" ||
    product.id === "price_premium"
  ) {
    features = [
      "Unlimited Dream Analysis",
      "Unlimited Dream Art Generations",
      "Priority Support"
    ];
  } else if (
    safeName === "dreamer" ||
    product.id === "price_basic"
  ) {
    features = [
      "Unlimited Dream Analysis",
      "15 Dream Art Generations",
      "Priority Support"
    ];
  } else {
    // Fallback: If not strictly Dreamer or Mystic, return whatever name/features exist
    features = product.features || [];
  }
  return {
    ...product,
    features,
  };
}
