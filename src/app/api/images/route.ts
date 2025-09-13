import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import UploadedImage, { IUploadedImage } from "@/models/UploadedImage";
import mongoose from "mongoose";

// GET /api/images - Fetch all images with optional filtering
export async function GET(req: NextRequest) {
    try {
        await connect();

        const { searchParams } = new URL(req.url);
        
        // Query parameters for filtering
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const fileType = searchParams.get('fileType');
        const tags = searchParams.get('tags')?.split(',');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy') || 'uploadedAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const uploadedBy = searchParams.get('uploadedBy');

        // Build query
        const query: Record<string, unknown> = { isActive: true };

        if (fileType) {
            query.fileType = fileType;
        }

        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }

        if (uploadedBy) {
            query.uploadedBy = uploadedBy;
        }

        if (search) {
            query.$or = [
                { filename: { $regex: search, $options: 'i' } },
                { originalName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { altText: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort: Record<string, 1 | -1> = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Execute queries
        const [images, totalCount] = await Promise.all([
            UploadedImage.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            UploadedImage.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            success: true,
            data: images,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error: unknown) {
        console.error('Error fetching images:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch images', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}

// POST /api/images - Create/Save new image record
export async function POST(req: NextRequest) {
    try {
        await connect();

        const body = await req.json();
        
        // Validate required fields
        const requiredFields = ['filename', 'originalName', 's3Key', 'cloudFrontUrl', 'fileSize', 'fileType'];
        const missingFields = requiredFields.filter(field => !body[field]);
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { 
                    error: 'Missing required fields', 
                    missingFields 
                },
                { status: 400 }
            );
        }

        // Check if image with this S3 key already exists
        const existingImage = await UploadedImage.findOne({ s3Key: body.s3Key });
        if (existingImage) {
            return NextResponse.json(
                { 
                    error: 'Image with this S3 key already exists',
                    existingImage: existingImage._id
                },
                { status: 409 }
            );
        }

        // Create new image record
        const imageData: Partial<IUploadedImage> = {
            filename: body.filename,
            originalName: body.originalName,
            s3Key: body.s3Key,
            cloudFrontUrl: body.cloudFrontUrl,
            s3Url: body.s3Url || `https://s3.${process.env.S3_REGION}.amazonaws.com/${process.env.S3_BUCKET}/${body.s3Key}`,
            fileSize: body.fileSize,
            fileType: body.fileType,
            width: body.width,
            height: body.height,
            uploadMethod: body.uploadMethod || 'direct',
            tags: body.tags || [],
            description: body.description,
            altText: body.altText,
            uploadedBy: body.uploadedBy || 'anonymous',
            etag: body.etag,
            uploadedAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };

        const newImage = new UploadedImage(imageData);
        const savedImage = await newImage.save();

        return NextResponse.json({
            success: true,
            data: savedImage,
            message: 'Image saved successfully'
        }, { status: 201 });

    } catch (error: unknown) {
        console.error('Error saving image:', error);
        
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            return NextResponse.json(
                { 
                    error: 'Duplicate image', 
                    details: 'An image with this S3 key already exists' 
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { 
                error: 'Failed to save image', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}

// DELETE /api/images - Bulk delete (soft delete)
export async function DELETE(req: NextRequest) {
    try {
        await connect();

        const { searchParams } = new URL(req.url);
        const ids = searchParams.get('ids')?.split(',');
        const hard = searchParams.get('hard') === 'true';

        if (!ids || ids.length === 0) {
            return NextResponse.json(
                { error: 'No image IDs provided' },
                { status: 400 }
            );
        }

        // Validate ObjectIds
        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length !== ids.length) {
            return NextResponse.json(
                { error: 'Invalid image ID format' },
                { status: 400 }
            );
        }

        let result;
        if (hard) {
            // Hard delete - permanently remove from database
            result = await UploadedImage.deleteMany({ 
                _id: { $in: validIds } 
            });
        } else {
            // Soft delete - mark as inactive
            result = await UploadedImage.updateMany(
                { _id: { $in: validIds } },
                { 
                    isActive: false, 
                    updatedAt: new Date() 
                }
            );
        }

        return NextResponse.json({
            success: true,
            deletedCount: 'deletedCount' in result ? result.deletedCount : ('modifiedCount' in result ? result.modifiedCount : 0),
            message: `${'deletedCount' in result ? result.deletedCount : ('modifiedCount' in result ? result.modifiedCount : 0)} image(s) ${hard ? 'permanently deleted' : 'marked as inactive'}`
        });

    } catch (error: unknown) {
        console.error('Error deleting images:', error);
        return NextResponse.json(
            { 
                error: 'Failed to delete images', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}