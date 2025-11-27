import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Resource from "@/models/Resource";
import { getAdminFromRequest } from "@/middleware/adminAuth";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { generatePresignedUrl } from "@/lib/s3-presigned";

export const runtime = 'nodejs';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// GET - Get single resource and increment view count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    const { id } = await params;

    // Find and increment view count
    const resource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .select("-uploadedBy -__v");

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    if (!resource.isPublic) {
      return NextResponse.json(
        { error: "Resource not available" },
        { status: 403 }
      );
    }

    // Generate presigned URL (15-minute expiration)
    const presignedUrl = await generatePresignedUrl(resource.fileKey, 900);

    // Return resource with presigned URL
    const resourceData = {
      ...resource.toObject(),
      fileUrl: presignedUrl,
    };

    return NextResponse.json({
      success: true,
      data: resourceData,
    });
  } catch (error: any) {
    console.error("Error fetching resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resource" },
      { status: 500 }
    );
  }
}

// DELETE - Delete resource (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    // Verify admin
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find resource
    const resource = await Resource.findById(id);

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    // Delete from S3
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET || "austrange-storage",
        Key: resource.fileKey,
      });
      await s3Client.send(deleteCommand);
    } catch (s3Error) {
      console.error("Error deleting from S3:", s3Error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await Resource.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resource" },
      { status: 500 }
    );
  }
}

// PATCH - Update resource metadata (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connect();

    // Verify admin
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, isPublic } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const resource = await Resource.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resource,
      message: "Resource updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update resource" },
      { status: 500 }
    );
  }
}
