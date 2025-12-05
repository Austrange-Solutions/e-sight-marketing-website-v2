import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import EventModel from "@/models/Event";
import { getAdminFromRequest } from "@/middleware/adminAuth";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const event = await EventModel.findById(id)
      .populate("thumbnailImage")
      .populate("galleryImages")
      .lean();
    if (!event) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: event }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const update: any = {};
    const allowed = [
      "slug",
      "title",
      "location",
      "date",
      "participants",
      "shortDescription",
      "description",
      "thumbnailImage",
      "galleryImages",
      "isPublished",
    ];
    for (const key of allowed) {
      if (key in body) update[key] = body[key];
    }
    if (update.date) update.date = new Date(update.date);

    const { id } = await context.params;
    const updated = await EventModel.findByIdAndUpdate(id, update, {
      new: true,
    })
      .populate("thumbnailImage")
      .populate("galleryImages")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connect();
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const deleted = await EventModel.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
