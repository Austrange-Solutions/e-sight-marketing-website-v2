/**
 * Image URL normalization utilities
 * Ensures all product images are served through CloudFront
 */

/**
 * Normalizes image URLs for product images
 * Handles S3 keys, CloudFront URLs, and local paths
 *
 * @param imagePath - The image path from the database (S3 key, URL, or local path)
 * @returns Normalized image URL (CloudFront URL or local path)
 */
export function normalizeImageUrl(imagePath?: string | null): string {
  // Return fallback for empty/null images
  if (!imagePath) {
    return "/assets/images/maceazy-logo.png";
  }

  // Get current CloudFront domain from environment
  const currentCloudFrontDomain =
    process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN ||
    process.env.CLOUDFRONT_DOMAIN ||
    "https://d2z15s8mxf9k1i.cloudfront.net";

  const cdn = currentCloudFrontDomain.replace(/\/+$/, "");

  // List of old/legacy CloudFront domains to replace
  const legacyCloudFrontDomains = [
    "https://dw9tsoyfcyk5k.cloudfront.net",
    "dw9tsoyfcyk5k.cloudfront.net",
    "https://d2z15s8mxf9k1i.cloudfront.net", // Also normalize the current one
    "d2z15s8mxf9k1i.cloudfront.net",
  ];

  // If it's a full URL with an old CloudFront domain, replace it
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    for (const oldDomain of legacyCloudFrontDomains) {
      if (imagePath.includes(oldDomain)) {
        // Extract the S3 key (everything after the domain)
        let key = imagePath
          .replace(`https://${oldDomain.replace("https://", "")}`, "")
          .replace(`http://${oldDomain.replace("https://", "")}`, "")
          .replace(oldDomain, "")
          .replace(/^\/+/, "");

        // Replace old S3 prefix with new one if needed
        if (key.startsWith("e-sight-ecommerce-product-images/")) {
          key = key.replace(
            "e-sight-ecommerce-product-images/",
            "maceazy-marketing/",
          );
        }

        return `${cdn}/${key}`;
      }
    }
    // If it's some other full URL, return as is
    return imagePath;
  }

  // If it's a local path (starts with /), return as is
  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  // Otherwise, it's an S3 key - prepend CloudFront domain
  const key = imagePath.replace(/^\/+/, "");
  return `${cdn}/${key}`;
}

/**
 * Gets a product image URL with fallback
 * Tries multiple sources in order: item.image, productId.image, fallback
 *
 * @param item - Order item with potential image sources
 * @returns Normalized image URL
 */
export function getProductImageUrl(item: {
  image?: string;
  productId?: { image?: string };
}): string {
  const imagePath = item.image || item.productId?.image;
  return normalizeImageUrl(imagePath);
}
