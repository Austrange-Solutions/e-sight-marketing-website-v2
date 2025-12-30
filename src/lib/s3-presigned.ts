import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Check if CloudFront signed URLs are configured
 */
function isCloudfrontSignedEnabled(): boolean {
  return !!(
    process.env.CLOUDFRONT_KEY_PAIR_ID &&
    process.env.CLOUDFRONT_PRIVATE_KEY
  );
}

/**
 * Generate CloudFront signed URL
 * @param url - Full CloudFront URL
 * @param expiresIn - Expiration time in seconds
 * @returns Signed CloudFront URL
 */
async function generateCloudfrontSignedUrl(
  url: string,
  expiresIn: number = 900
): Promise<string> {
  try {
    // Dynamically import cloudfront-signer to avoid bundler errors when it's not installed
    const { getSignedUrl: getCloudfrontSignedUrl } = await import('@aws-sdk/cloudfront-signer');

    const dateLessThan = new Date(Date.now() + expiresIn * 1000).toISOString();

    const signedUrl = getCloudfrontSignedUrl({
      url,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
      dateLessThan,
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating CloudFront signed URL:", error);
    throw error;
  }
}

/**
 * Generate a presigned URL for viewing a resource
 * Uses CloudFront signed URLs if configured, otherwise falls back to S3 presigned URLs
 * @param fileKey - S3 key (e.g., "resource/documents/file.pdf")
 * @param expiresIn - Expiration time in seconds (default: 900 = 15 minutes)
 * @returns Presigned URL for viewing the resource
 */
export async function generatePresignedUrl(
  fileKey: string,
  expiresIn: number = 900 // 15 minutes
): Promise<string> {
  try {
    // Try CloudFront signed URL first (better performance)
    if (isCloudfrontSignedEnabled()) {
      const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || process.env.CLOUDFRONT_DOMAIN;
      if (cloudfrontDomain) {
        const baseUrl = cloudfrontDomain.startsWith('http') ? cloudfrontDomain : `https://${cloudfrontDomain}`;
        const cloudfrontUrl = `${baseUrl}/${fileKey}`;
        return await generateCloudfrontSignedUrl(cloudfrontUrl, expiresIn);
      }
    }

    // Fallback to S3 presigned URL (always works)
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET || "austrange-storage",
      Key: fileKey,
      ResponseContentDisposition: "inline", // Display in browser, not download
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
}

/**
 * Generate presigned URLs for multiple resources
 * @param fileKeys - Array of S3 keys
 * @param expiresIn - Expiration time in seconds
 * @returns Map of fileKey -> presigned URL
 */
export async function generatePresignedUrls(
  fileKeys: string[],
  expiresIn: number = 900
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();

  await Promise.all(
    fileKeys.map(async (key) => {
      try {
        const url = await generatePresignedUrl(key, expiresIn);
        urlMap.set(key, url);
      } catch (error) {
        console.error('Failed to generate URL for key:', key, error);
      }
    })
  );

  return urlMap;
}
