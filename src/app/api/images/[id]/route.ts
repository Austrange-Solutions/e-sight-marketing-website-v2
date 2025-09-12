import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import UploadedImage from "@/models/UploadedImage";
import mongoose from "mongoose";

// GET /api/images/[id] - Get single image
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connect();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid image ID format' },
                { status: 400 }
            );
        }

        const image = await UploadedImage.findOne({ _id: id, isActive: true });

        if (!image) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: image
        });

    } catch (error: unknown) {
        console.error('Error fetching image:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch image', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}

// PUT /api/images/[id] - Update image metadata
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connect();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid image ID format' },
                { status: 400 }
            );
        }

        const body = await req.json();

        // Fields that can be updated
        const allowedUpdates = [
            'description',
            'altText',
            'tags',
            'width',
            'height',
            'isActive'
        ];

        const updates: Record<string, unknown> = {};
        Object.keys(body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = body[key];
            }
        });

        updates.updatedAt = new Date();

        const updatedImage = await UploadedImage.findOneAndUpdate(
            { _id: id, isActive: true },
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedImage) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedImage,
            message: 'Image updated successfully'
        });

    } catch (error: unknown) {
        console.error('Error updating image:', error);
        return NextResponse.json(
            { 
                error: 'Failed to update image', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}

// DELETE /api/images/[id] - Delete single image
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connect();

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const hard = searchParams.get('hard') === 'true';

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: 'Invalid image ID format' },
                { status: 400 }
            );
        }

        let result;
        if (hard) {
            // Hard delete - permanently remove from database
            result = await UploadedImage.findByIdAndDelete(id);
        } else {
            // Soft delete - mark as inactive
            result = await UploadedImage.findOneAndUpdate(
                { _id: id, isActive: true },
                { 
                    isActive: false, 
                    updatedAt: new Date() 
                },
                { new: true }
            );
        }

        if (!result) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result,
            message: `Image ${hard ? 'permanently deleted' : 'marked as inactive'}`
        });

    } catch (error: unknown) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
            { 
                error: 'Failed to delete image', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}