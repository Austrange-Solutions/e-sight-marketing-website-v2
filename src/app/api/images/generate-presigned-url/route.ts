import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAdminFromRequest } from "@/middleware/adminAuth";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.S3_BUCKET || "austrange-storage";
const S3_PREFIX = process.env.S3_PREFIX || "e-sight-ecommerce-product-images/";

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminData = getAdminFromRequest(req);
    if (!adminData) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { filename, fileType, folder } = body;

    // Validation
    if (!filename || !fileType) {
      return NextResponse.json(
        { error: "Filename and fileType are required" },
        { status: 400 }
      );
    }

    // Validate file type (allow common image and video formats)
    const allowedTypes = [
      // images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // videos
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed types: " + allowedTypes.join(", ") },
        { status: 400 }
      );
    }

    // Determine folder path based on use case
    let folderPath = S3_PREFIX;
    if (folder === "donation-logos") {
      folderPath = `${S3_PREFIX}donation-logos/`;
    } else if (folder === "products") {
      folderPath = `${S3_PREFIX}products/`;
    } else if (folder === "gallery") {
      folderPath = `${S3_PREFIX}gallery/`;
    } else if (folder === "carousel") {
      folderPath = `${S3_PREFIX}carousel/`;
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folderPath}${timestamp}-${sanitizedFilename}`;

    // Create S3 PutObject command
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: fileType,
      // ACL: "public-read", // Uncomment if you want public access directly (not recommended, use CloudFront)
    });

    // Generate presigned URL (expires in 5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Construct CloudFront URL for accessing the file after upload
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
    const fileUrl = cloudfrontDomain 
      ? `https://${cloudfrontDomain}/${key}`
      : `https://${S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
      fileUrl,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
