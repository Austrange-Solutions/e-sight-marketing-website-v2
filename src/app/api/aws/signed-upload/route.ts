import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { connect } from "@/dbConfig/dbConfig";
import UploadedImage from "@/models/UploadedImage";

// Mark route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';

// Create S3 client with explicit credentials
const createS3Client = () => {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.S3_REGION;

    console.log('Creating S3 client for signed URL:');
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

// Generate signed URL for upload
export async function POST(req: NextRequest) {
    try {
        // Connect to database
        await connect();
        
        console.log('Signed URL upload requested');
        
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
        
        const body = await req.json();
        const { fileName, fileType } = body;
        
        if (!fileName || !fileType) {
            return NextResponse.json(
                { error: 'fileName and fileType are required' },
                { status: 400 }
            );
        }

        console.log('File info:', { fileName, fileType });

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(fileType)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = fileName.split('.').pop();
        const uniqueFilename = `${timestamp}-${fileName}`;
        const s3Key = `${process.env.S3_PREFIX}${uniqueFilename}`;

        console.log('Generating signed URL for S3 key:', s3Key);

        try {
            // Create a fresh S3 client instance
            const client = createS3Client();
            
            // Create the command for signed URL
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET as string,
                Key: s3Key,
                ContentType: fileType,
            });

            // Generate signed URL (valid for 5 minutes)
            const signedUrl = await getSignedUrl(client, command, { 
                expiresIn: 300 // 5 minutes
            });
            
            // Generate CloudFront URL for viewing
            let cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN || '';
            if (cloudfrontDomain.startsWith('https://')) {
              cloudfrontDomain = cloudfrontDomain.replace('https://', '');
            } else if (cloudfrontDomain.startsWith('http://')) {
              cloudfrontDomain = cloudfrontDomain.replace('http://', '');
            }
            const viewUrl = `https://${cloudfrontDomain}/${s3Key}`;
            
            console.log('Signed URL generated successfully');

            return NextResponse.json({ 
                success: true,
                signedUrl,
                viewUrl,
                filename: uniqueFilename,
                s3Key,
                uploadMethod: 'signed-url'
            });

        } catch (s3Error: unknown) {
            console.error('S3 Signed URL Error:', s3Error);

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
        console.error('Error generating signed URL:', error);
        return NextResponse.json(
            { 
                error: 'Failed to generate signed URL', 
                details: error instanceof Error ? error.message : 'Unknown error',
                type: error instanceof Error ? error.constructor.name : 'Unknown'
            },
            { status: 500 }
        );
    }
}