import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { connect } from "@/dbConfig/dbConfig";
import UploadedImage from "@/models/UploadedImage";

// Create S3 client with explicit credentials
const createS3Client = () => {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.S3_REGION;

    console.log('Creating S3 client with credentials:');
    console.log('Access Key ID:', accessKeyId);
    console.log('Secret Key (first 10 chars):', secretAccessKey?.substring(0, 10) + '...');
    console.log('Region:', region);

    return new S3Client({
        region: region as string,
        credentials: {
            accessKeyId: accessKeyId as string,
            secretAccessKey: secretAccessKey as string,
        },
    });
};

// Handle file upload via FormData
export async function POST(req: NextRequest) {
    try {
        console.log('File upload via form data requested');
        
        // Check AWS credentials first
        const requiredEnvVars = [
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'S3_BUCKET',
            'S3_PREFIX',
            'S3_REGION',
            'CLOUDFRONT_DOMAIN'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            console.error('Missing environment variables:', missingVars);
            return NextResponse.json(
                { 
                    error: 'Server configuration error',
                    details: `Missing environment variables: ${missingVars.join(', ')}`
                },
                { status: 500 }
            );
        }

        console.log('Environment check passed');
        console.log('AWS Access Key ID:', process.env.AWS_ACCESS_KEY_ID);
        console.log('S3 Bucket:', process.env.S3_BUCKET);
        console.log('S3 Region:', process.env.S3_REGION);
        console.log('S3 Prefix:', process.env.S3_PREFIX);
        console.log('CloudFront Domain:', process.env.CLOUDFRONT_DOMAIN);
        
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        console.log('File received:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        // Validate file type (optional)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (optional - 5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `${timestamp}-${file.name}`;
        const s3Key = `${process.env.S3_PREFIX}${uniqueFilename}`;

        console.log('Uploading to S3 key:', s3Key);

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Test S3 client configuration
        try {
            console.log('Testing S3 client configuration...');
            
            // Create a fresh S3 client instance
            const client = createS3Client();
            
            // Upload directly to S3
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET as string,
                Key: s3Key,
                Body: buffer,
                ContentType: file.type,
                ContentLength: buffer.length,
            });

            console.log('Attempting S3 upload...');
            const result = await client.send(command);
            console.log('S3 upload successful:', result);
            
            // Generate CloudFront URL
            const viewUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;
            const s3Url = `https://s3.${process.env.S3_REGION}.amazonaws.com/${process.env.S3_BUCKET}/${s3Key}`;
            
            // Save to MongoDB
            try {
                await connect();
                
                const imageData = {
                    filename: uniqueFilename,
                    originalName: file.name,
                    s3Key,
                    cloudFrontUrl: viewUrl,
                    s3Url,
                    fileSize: file.size,
                    fileType: file.type,
                    uploadMethod: 'direct' as const,
                    uploadedBy: 'anonymous', // You can change this based on your auth system
                    etag: result.ETag,
                    uploadedAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true
                };

                const savedImage = new UploadedImage(imageData);
                const mongoResult = await savedImage.save();
                
                console.log('Image saved to MongoDB:', mongoResult._id);
                
                return NextResponse.json({ 
                    success: true,
                    viewUrl,
                    filename: uniqueFilename,
                    s3Key,
                    size: file.size,
                    type: file.type,
                    etag: result.ETag,
                    mongoId: mongoResult._id,
                    savedToDatabase: true
                });
                
            } catch (dbError: unknown) {
                console.error('MongoDB save error:', dbError);
                
                // Still return success for S3 upload, but note DB error
                return NextResponse.json({ 
                    success: true,
                    viewUrl,
                    filename: uniqueFilename,
                    s3Key,
                    size: file.size,
                    type: file.type,
                    etag: result.ETag,
                    savedToDatabase: false,
                    dbError: dbError instanceof Error ? dbError.message : 'Unknown error',
                    warning: 'File uploaded to S3 but failed to save to database'
                });
            }

        } catch (s3Error: unknown) {
            console.error('S3 Error Details:', s3Error);

            // Provide specific error messages based on error type
            if (s3Error && typeof s3Error === 'object' && 'Code' in s3Error && s3Error.Code === 'SignatureDoesNotMatch') {
                return NextResponse.json(
                    { 
                        error: 'AWS Authentication Error',
                        details: 'Invalid AWS credentials. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
                        code: 'INVALID_CREDENTIALS'
                    },
                    { status: 500 }
                );
            } else if (s3Error && typeof s3Error === 'object' && 'Code' in s3Error && s3Error.Code === 'NoSuchBucket') {
                return NextResponse.json(
                    { 
                        error: 'S3 Bucket Not Found',
                        details: `Bucket '${process.env.S3_BUCKET}' does not exist or is not accessible.`,
                        code: 'BUCKET_NOT_FOUND'
                    },
                    { status: 500 }
                );
            } else if (s3Error && typeof s3Error === 'object' && 'Code' in s3Error && s3Error.Code === 'AccessDenied') {
                return NextResponse.json(
                    { 
                        error: 'S3 Access Denied',
                        details: 'AWS credentials do not have permission to upload to this bucket.',
                        code: 'ACCESS_DENIED'
                    },
                    { status: 500 }
                );
            } else {
                throw s3Error; // Re-throw for general error handling
            }
        }

    } catch (error: unknown) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { 
                error: 'Failed to upload file', 
                details: error instanceof Error ? error.message : 'Unknown error',
                type: error instanceof Error ? error.constructor.name : 'Unknown'
            },
            { status: 500 }
        );
    }
}