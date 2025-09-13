import { NextRequest , NextResponse } from "next/server";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
    region: process.env.S3_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

// GET: Return CloudFront URL for viewing images
export async function GET(req: NextRequest) {
    try {
        console.log('AWS API called with URL:', req.url);
        
        const { searchParams } = new URL(req.url);
        const key_data = searchParams.get('key_data');

        console.log('Extracted key_data:', key_data);

        if (!key_data) {
            return NextResponse.json(
                { error: 'key_data parameter is required' },
                { status: 400 }
            );
        }

        // Return CloudFront URL instead of signed S3 URL
        // Check if key_data already contains the prefix
        let fullPath = key_data;
        if (!key_data.startsWith(process.env.S3_PREFIX!)) {
            fullPath = `${process.env.S3_PREFIX}${key_data}`;
        }
        
        const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${fullPath}`;
        
        console.log('Generated CloudFront URL:', cloudFrontUrl);
        
        return NextResponse.json({ url: cloudFrontUrl });
    } catch (error) {
        console.error('Error generating CloudFront URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate CloudFront URL' },
            { status: 500 }
        );
    }
}

// POST: Generate signed URL for uploading files to S3
export async function POST(req: NextRequest) {
    try {
        console.log('Upload URL generation requested');
        console.log('Request method:', req.method);
        console.log('Request headers:', Object.fromEntries(req.headers.entries()));
        
        // Check if request has body
        const contentLength = req.headers.get('content-length');
        console.log('Content-Length:', contentLength);
        
        if (!contentLength || contentLength === '0') {
            return NextResponse.json(
                { error: 'Request body is empty. Please provide filename and contentType in JSON format.' },
                { status: 400 }
            );
        }

        let requestBody;
        try {
            const text = await req.text();
            console.log('Raw request body:', text);
            
            if (!text.trim()) {
                return NextResponse.json(
                    { error: 'Request body is empty' },
                    { status: 400 }
                );
            }
            
            requestBody = JSON.parse(text);
            console.log('Parsed request body:', requestBody);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return NextResponse.json(
                { 
                    error: 'Invalid JSON in request body',
                    details: parseError instanceof Error ? parseError.message : 'Unknown parse error',
                    hint: 'Expected format: {"filename": "image.png", "contentType": "image/png"}'
                },
                { status: 400 }
            );
        }

        const { filename, contentType } = requestBody;

        if (!filename) {
            return NextResponse.json(
                { 
                    error: 'filename is required',
                    hint: 'Expected format: {"filename": "image.png", "contentType": "image/png"}'
                },
                { status: 400 }
            );
        }

        // Generate unique filename to avoid conflicts
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${filename}`;
        const s3Key = `${process.env.S3_PREFIX}${uniqueFilename}`;

        console.log('Generating upload URL for:', s3Key);

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET as string,
            Key: s3Key,
            ContentType: contentType || 'application/octet-stream',
        });

        // Generate signed URL for upload (expires in 15 minutes)
        const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
        
        // Generate the final CloudFront URL where the image will be accessible
        const viewUrl = `https://${process.env.CLOUDFRONT_DOMAIN}/${s3Key}`;
        
        console.log('Generated upload URL:', uploadUrl);
        console.log('Final view URL:', viewUrl);

        return NextResponse.json({ 
            uploadUrl,
            viewUrl,
            filename: uniqueFilename,
            s3Key
        });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        return NextResponse.json(
            { 
                error: 'Failed to generate upload URL',
                details: error instanceof Error ? error.message : 'Unknown error',
                type: error instanceof Error ? error.constructor.name : 'UnknownError'
            },
            { status: 500 }
        );
    }
}