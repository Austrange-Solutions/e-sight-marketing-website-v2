import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connect } from "@/dbConfig/dbConfig";
import UploadedImage from "@/models/UploadedImage";

// Create S3 client
const createS3Client = () => {
    return new S3Client({
        region: process.env.S3_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
    });
};

// Extract S3 key from CloudFront URL
function extractS3KeyFromUrl(cloudFrontUrl: string): string | null {
    try {
        const url = new URL(cloudFrontUrl);
        // Remove leading slash and decode URL encoding (handles spaces and special characters)
        const decodedPath = decodeURIComponent(url.pathname.substring(1));
        console.log('Original URL pathname:', url.pathname.substring(1));
        console.log('Decoded S3 key:', decodedPath);
        return decodedPath;
    } catch (error) {
        console.error('Invalid CloudFront URL:', cloudFrontUrl);
        return null;
    }
}

// DELETE: Remove image from S3 and database
export async function DELETE(req: NextRequest) {
    try {
        console.log('Image deletion requested');
        
        const body = await req.json();
        const { cloudFrontUrl, s3Key } = body;
        
        if (!cloudFrontUrl && !s3Key) {
            return NextResponse.json(
                { error: 'Either cloudFrontUrl or s3Key is required' },
                { status: 400 }
            );
        }

        // Extract S3 key from CloudFront URL if not provided
        let actualS3Key = s3Key;
        if (!actualS3Key && cloudFrontUrl) {
            actualS3Key = extractS3KeyFromUrl(cloudFrontUrl);
        }

        if (!actualS3Key) {
            return NextResponse.json(
                { error: 'Could not extract S3 key from CloudFront URL' },
                { status: 400 }
            );
        }

        console.log('Deleting S3 object with key:', actualS3Key);

        // Delete from S3
        try {
            const client = createS3Client();
            const deleteCommand = new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET as string,
                Key: actualS3Key,
            });

            await client.send(deleteCommand);
            console.log('Successfully deleted from S3:', actualS3Key);
        } catch (s3Error: unknown) {
            console.error('S3 deletion error:', s3Error);
            // Continue even if S3 deletion fails (file might not exist)
        }

        // Delete from database
        try {
            await connect();
            
            // Try to find and update using the decoded S3 key
            let deleteResult = await UploadedImage.findOneAndUpdate(
                { s3Key: actualS3Key },
                { isActive: false, deletedAt: new Date() },
                { new: true }
            );

            // If not found, try with the original URL-encoded key
            if (!deleteResult && cloudFrontUrl) {
                const encodedKey = new URL(cloudFrontUrl).pathname.substring(1);
                if (encodedKey !== actualS3Key) {
                    console.log('Trying with encoded key:', encodedKey);
                    deleteResult = await UploadedImage.findOneAndUpdate(
                        { s3Key: encodedKey },
                        { isActive: false, deletedAt: new Date() },
                        { new: true }
                    );
                }
            }

            // If still not found, try searching by cloudFrontUrl
            if (!deleteResult && cloudFrontUrl) {
                console.log('Trying to find by cloudFrontUrl:', cloudFrontUrl);
                deleteResult = await UploadedImage.findOneAndUpdate(
                    { cloudFrontUrl: cloudFrontUrl },
                    { isActive: false, deletedAt: new Date() },
                    { new: true }
                );
            }

            console.log('Database deletion result:', deleteResult ? 'Updated' : 'Not found');
            
            if (deleteResult) {
                console.log('Found and marked as inactive - ID:', deleteResult._id);
            } else {
                console.log('Warning: Image metadata not found in database for S3 key:', actualS3Key);
            }
        } catch (dbError: unknown) {
            console.error('Database deletion error:', dbError);
            // Continue even if DB deletion fails
        }

        return NextResponse.json({ 
            success: true,
            message: 'Image deleted successfully',
            s3Key: actualS3Key
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