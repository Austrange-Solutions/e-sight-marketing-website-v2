import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.S3_BUCKET || "austrange-storage";
// Use a specific folder for support tickets
const S3_PREFIX = "e-sight-support-tickets/";

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Filename and content type are required" },
        { status: 400 }
      );
    }

    // Generate a unique file path
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const key = `${S3_PREFIX}${timestamp}-${random}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Return the URL that will be used to access the file after upload
    // Assuming CloudFront or direct S3 access. 
    // If CloudFront is used, we should construct the CloudFront URL.
    const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;
    const fileUrl = cloudFrontDomain 
      ? `${cloudFrontDomain}/${key}`
      : `https://${S3_BUCKET}.s3.${process.env.S3_REGION || "ap-south-1"}.amazonaws.com/${key}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key
    });
  } catch (error: any) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
