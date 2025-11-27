import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Resource from "@/models/Resource";
import { getAdminFromRequest } from "@/middleware/adminAuth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generatePresignedUrls } from "@/lib/s3-presigned";

export const runtime = 'nodejs';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// GET - List all resources (public or filtered by category)
export async function GET(request: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: any = { isPublic: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .select("-uploadedBy -__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Resource.countDocuments(query),
    ]);

    // Generate presigned URLs for all resources (15-minute expiration)
    const fileKeys = resources.map((r: any) => r.fileKey);
    const presignedUrls = await generatePresignedUrls(fileKeys, 900); // 15 minutes

    // Replace fileUrl with presigned URL
    const resourcesWithPresignedUrls = resources.map((resource: any) => ({
      ...resource,
      fileUrl: presignedUrls.get(resource.fileKey) || resource.fileUrl,
    }));

    return NextResponse.json({
      success: true,
      data: resourcesWithPresignedUrls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST - Upload new resource (Admin only)
export async function POST(request: NextRequest) {
  try {
    await connect();

    // Verify admin
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, fileName, fileType, fileSize, category } = body;

    // Validate required fields
    if (!title || !fileName || !fileType || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ["annual-reports", "project-reports", "documents"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Generate S3 key
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `resource/${category}/${timestamp}_${sanitizedFileName}`;

    // Generate presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || "austrange-storage",
      Key: fileKey,
      ContentType: fileType,
      Metadata: {
        // Strip metadata by only including essential info
        uploaded: new Date().toISOString(),
      },
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Create file URL with CloudFront (check both env variables)
    const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || process.env.CLOUDFRONT_DOMAIN;
    const fileUrl = cloudfrontDomain 
      ? `${cloudfrontDomain.startsWith('http') ? cloudfrontDomain : `https://${cloudfrontDomain}`}/${fileKey}`
      : `https://${process.env.S3_BUCKET || 'austrange-storage'}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileKey}`;

    // Create resource document
    const resource = new Resource({
      title,
      description,
      fileUrl,
      fileKey,
      fileType,
      fileSize: fileSize || 0,
      category,
      uploadedBy: adminData.id,
      isPublic: true,
      viewCount: 0,
    });

    await resource.save();

    return NextResponse.json({
      success: true,
      data: {
        resource,
        uploadUrl: presignedUrl,
      },
      message: "Resource created. Use uploadUrl to upload the file.",
    });
  } catch (error: any) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create resource" },
      { status: 500 }
    );
  }
}
