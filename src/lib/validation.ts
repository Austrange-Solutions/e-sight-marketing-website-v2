/**
 * Security validation utilities
 */

/**
 * Validates if a URL is safe for use in the application
 * Checks against allowed domains (CloudFront, S3)
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  try {
    const parsedUrl = new URL(url);

    // Only allow HTTPS (or HTTP for localhost in dev)
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      return false;
    }

    // Allow localhost in development
    if (
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1"
    ) {
      return process.env.NODE_ENV === "development";
    }

    // Check against allowed domains
    const allowedDomains = [
      process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN ||
        "dw9tsoyfcyk5k.cloudfront.net",
      "austrange-storage.s3.ap-south-1.amazonaws.com",
      "s3.ap-south-1.amazonaws.com",
    ];

    return allowedDomains.some(
      (domain) =>
        parsedUrl.hostname === domain ||
        parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Sanitizes a string for use in regular expressions
 * Escapes special regex characters to prevent ReDoS attacks
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validates email format (basic check)
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  // Simple email validation - not using regex for performance
  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  return local.length > 0 && domain.length > 0 && domain.includes(".");
}

/**
 * Sanitizes and validates a URL for safe use in href attributes and window.open
 * Returns sanitized URL or '#' if invalid
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "#";

  // First check if it's a valid URL
  if (!isValidUrl(url)) return "#";

  // Additional XSS protection - block javascript: and data: protocols
  const lowerUrl = url.toLowerCase().trim();
  if (
    lowerUrl.startsWith("javascript:") ||
    lowerUrl.startsWith("data:") ||
    lowerUrl.startsWith("vbscript:")
  ) {
    return "#";
  }

  return url;
}
