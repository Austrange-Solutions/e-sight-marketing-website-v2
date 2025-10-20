import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create S3 client
function createS3Client() {
  return new S3Client({
    region: process.env.S3_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log("Disabled docs signed URL upload requested");

    // Check AWS credentials
    const requiredEnvVars = [
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "S3_BUCKET",
      "S3_REGION",
      "CLOUDFRONT_DOMAIN",
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error("Missing environment variables:", missingVars);
      // If running in development, provide a harmless fallback so local testing works without S3
      if (process.env.NODE_ENV !== "production") {
        const { fileName, fileType, documentType } = await request.json();
        const timestamp = Date.now();
        const sanitizedFileName = (fileName || "file").replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueFilename = `${timestamp}-${sanitizedFileName}`;
        const s3Key = `dev-fallback/disabled-docs/${documentType}/${uniqueFilename}`;

        const fakeSignedUrl = `https://example.com/fake-upload/${uniqueFilename}`;
        const fakeViewUrl = `https://example.com/fake-view/${uniqueFilename}`;

        return NextResponse.json({
          signedUrl: fakeSignedUrl,
          viewUrl: fakeViewUrl,
          filename: uniqueFilename,
          s3Key,
          note: `Development fallback used - set real AWS env vars to use S3. Missing: ${missingVars.join(", ")}`,
        });
      }

      return NextResponse.json(
        {
          error: "Server configuration error",
          details: `Missing environment variables: ${missingVars.join(", ")}`,
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fileName, fileType, documentType } = body;

    if (!fileName || !fileType || !documentType) {
      return NextResponse.json(
        { error: "fileName, fileType, and documentType are required" },
        { status: 400 }
      );
    }

    console.log("File info:", { fileName, fileType, documentType });

    // Validate file type - Allow images and PDFs for documents
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images (JPEG, PNG, WebP, GIF) and PDF files are allowed." },
        { status: 400 }
      );
    }

    // Generate unique filename with document type prefix
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${timestamp}-${sanitizedFileName}`;
    
    // Store in e-sight/disabled-docs folder
    const s3Key = `e-sight/disabled-docs/${documentType}/${uniqueFilename}`;

    console.log("Generating signed URL for S3 key:", s3Key);

    try {
      // Create a fresh S3 client instance
      const client = createS3Client();

      // Create the command for signed URL
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET as string,
        Key: s3Key,
        ContentType: fileType,
      });

      console.log("S3 Command created:", {
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        ContentType: fileType,
      });

      // Generate signed URL for upload (expires in 15 minutes)
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 900 });

      // Generate the CloudFront URL where the file will be accessible
      const viewUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;

      console.log("Signed URL generated successfully");
      console.log("View URL:", viewUrl);

      return NextResponse.json({
        signedUrl,
        viewUrl,
        filename: uniqueFilename,
        s3Key,
      });
    } catch (s3Error: unknown) {
      console.error("S3 Error:", s3Error);

      // Handle specific S3 errors
      if (
        s3Error &&
        typeof s3Error === "object" &&
        "Code" in s3Error &&
        s3Error.Code === "NoSuchBucket"
      ) {
        return NextResponse.json(
          {
            error: "S3 Bucket Not Found",
            details: `Bucket '${process.env.S3_BUCKET}' does not exist or is not accessible.`,
            code: "BUCKET_NOT_FOUND",
          },
          { status: 500 }
        );
      } else if (
        s3Error &&
        typeof s3Error === "object" &&
        "Code" in s3Error &&
        s3Error.Code === "AccessDenied"
      ) {
        return NextResponse.json(
          {
            error: "S3 Access Denied",
            details: "AWS credentials do not have permission to upload to this bucket.",
            code: "ACCESS_DENIED",
          },
          { status: 500 }
        );
      } else {
        throw s3Error; // Re-throw for general error handling
      }
    }
  } catch (error: unknown) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate signed URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
