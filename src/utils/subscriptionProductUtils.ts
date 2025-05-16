
/**
 * Normalize Stripe product objects to return correct hardcoded features.
 * - Premium plan: Unlimited features
 * - Basic plan: Limited features
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

  if (safeName === "premium") {
    features = [
      "Unlimited Dream Analysis",
      "Unlimited Dream Art Generation",
      "Priority Support"
    ];
  } else if (safeName === "basic") {
    features = [
      "10 Dream Analysis",
      "10 Dream Art Generations",
      "Priority Support"
    ];
  } else {
    // Fallback: If not strictly Basic or Premium, return whatever name/features exist
    features = product.features || [];
  }
  return {
    ...product,
    features,
  };
}
