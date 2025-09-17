import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

export async function GET() {
    try {
        console.log('Testing AWS credentials validation...');
        
        // Check if credentials exist
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.S3_REGION;

        console.log('Environment variables:');
        console.log('AWS_ACCESS_KEY_ID:', accessKeyId);
        console.log('AWS_SECRET_ACCESS_KEY length:', secretAccessKey?.length);
        console.log('AWS_SECRET_ACCESS_KEY first 10 chars:', secretAccessKey?.substring(0, 10));
        console.log('AWS_SECRET_ACCESS_KEY last 10 chars:', secretAccessKey?.substring(-10));
        console.log('S3_REGION:', region);

        if (!accessKeyId || !secretAccessKey || !region) {
            return NextResponse.json({
                error: 'Missing AWS credentials',
                details: {
                    hasAccessKey: !!accessKeyId,
                    hasSecretKey: !!secretAccessKey,
                    hasRegion: !!region
                }
            }, { status: 500 });
        }

        // Validate credential formats
        const accessKeyPattern = /^AKIA[0-9A-Z]{16}$/;
        const secretKeyPattern = /^[A-Za-z0-9/+=]{40}$/;

        const validations = {
            accessKeyFormat: accessKeyPattern.test(accessKeyId),
            secretKeyFormat: secretKeyPattern.test(secretAccessKey),
            accessKeyLength: accessKeyId.length,
            secretKeyLength: secretAccessKey.length,
            regionFormat: /^[a-z0-9-]+$/.test(region)
        };

        console.log('Credential validations:', validations);

        // Test with simple list buckets command
        const client = new S3Client({
            region: region,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
        });

        console.log('Testing with ListBuckets command...');
        const command = new ListBucketsCommand({});
        const result = await client.send(command);

        console.log('AWS credentials test successful!');
        console.log('Available buckets:', result.Buckets?.map(b => b.Name));

        return NextResponse.json({
            success: true,
            message: 'AWS credentials are valid',
            validations,
            bucketsFound: result.Buckets?.length || 0,
            bucketNames: result.Buckets?.map(b => b.Name)
        });

    } catch (error: unknown) {
        console.error('AWS credentials test failed:', error);

        return NextResponse.json({
            error: 'AWS credentials test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}