import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import UploadedImage from "@/models/UploadedImage";

// Save upload metadata after successful signed URL upload
export async function POST(req: NextRequest) {
    try {
        console.log('Upload completion endpoint called');
        
        const body = await req.json();
        const { 
            filename,
            originalName,
            s3Key,
            viewUrl,
            fileSize,
            fileType,
            etag
        } = body;

        // Validate required fields
        if (!filename || !s3Key || !viewUrl) {
            return NextResponse.json(
                { error: 'filename, s3Key, and viewUrl are required' },
                { status: 400 }
            );
        }

        console.log('Saving upload metadata:', {
            filename,
            originalName,
            s3Key,
            viewUrl
        });

        try {
            await connect();
            
            const imageData = {
                filename,
                originalName: originalName || filename,
                s3Key,
                cloudFrontUrl: viewUrl,
                s3Url: `https://s3.${process.env.S3_REGION}.amazonaws.com/${process.env.S3_BUCKET}/${s3Key}`,
                fileSize: fileSize || 0,
                fileType: fileType || 'image/jpeg',
                uploadMethod: 'signed-url' as const,
                uploadedBy: 'admin', // You can change this based on your auth system
                etag: etag || '',
                uploadedAt: new Date(),
                updatedAt: new Date(),
                isActive: true
            };

            const savedImage = new UploadedImage(imageData);
            const mongoResult = await savedImage.save();
            
            console.log('Image metadata saved to MongoDB:', mongoResult._id);
            
            return NextResponse.json({ 
                success: true,
                message: 'Upload metadata saved successfully',
                mongoId: mongoResult._id,
                viewUrl,
                filename,
                s3Key
            });
            
        } catch (dbError: unknown) {
            console.error('MongoDB save error:', dbError);
            
            return NextResponse.json({ 
                success: false,
                error: 'Failed to save upload metadata',
                details: dbError instanceof Error ? dbError.message : 'Unknown error'
            }, { status: 500 });
        }

    } catch (error: unknown) {
        console.error('Error in upload completion:', error);
        return NextResponse.json(
            { 
                error: 'Failed to complete upload', 
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}