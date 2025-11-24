import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import EventModel from "@/models/Event";
import UploadedImage from "@/models/UploadedImage";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await EventModel.find({})
      .populate("thumbnailImage")
      .populate("galleryImages")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: events }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      location,
      date,
      participants,
      shortDescription,
      description,
      thumbnailImageId,
      galleryImageIds = [],
      isPublished = true,
    } = body || {};

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate image ids if provided (existence check optional)
    let thumbnailImage = undefined as any;
    if (thumbnailImageId) {
      thumbnailImage = await UploadedImage.findById(thumbnailImageId).lean();
      if (!thumbnailImage) {
        return NextResponse.json({ error: "Invalid thumbnailImageId" }, { status: 400 });
      }
    }

    const galleryImagesValid: string[] = [];
    if (Array.isArray(galleryImageIds)) {
      for (const id of galleryImageIds) {
        const img = await UploadedImage.findById(id).lean();
        if (!img) {
          return NextResponse.json({ error: `Invalid gallery image id: ${id}` }, { status: 400 });
        }
        galleryImagesValid.push(id);
      }
    }

    const event = await EventModel.create({
      title,
      slug: slug || undefined,
      location,
      date: date ? new Date(date) : undefined,
      participants,
      shortDescription,
      description,
      thumbnailImage: thumbnailImageId || undefined,
      galleryImages: galleryImagesValid,
      isPublished,
    });

    const populated = await EventModel.findById(event._id)
      .populate("thumbnailImage")
      .populate("galleryImages")
      .lean();

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
