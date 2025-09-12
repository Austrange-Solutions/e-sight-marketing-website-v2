import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

// GET: Test AWS credentials and S3 delete permissions
export async function GET(req: NextRequest) {
    try {
        // Create STS client to get caller identity
        const stsClient = new STSClient({
            region: process.env.S3_REGION as string,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
            },
        });

        // Get caller identity
        const identityCommand = new GetCallerIdentityCommand({});
        const identity = await stsClient.send(identityCommand);

        console.log('AWS Identity:', identity);

        // Test S3 permissions by trying to list objects
        const s3Client = new S3Client({
            region: process.env.S3_REGION as string,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
            },
        });

        try {
            const listCommand = new ListObjectsV2Command({
                Bucket: process.env.S3_BUCKET as string,
                MaxKeys: 5
            });
            const listResult = await s3Client.send(listCommand);
            console.log('S3 List test successful, found', listResult.Contents?.length || 0, 'objects');
        } catch (listError: unknown) {
            console.error('S3 List permission denied:', listError instanceof Error ? listError.message : 'Unknown error');
        }

        return NextResponse.json({ 
            success: true,
            identity: identity,
            userArn: identity.Arn,
            accountId: identity.Account,
            userId: identity.UserId,
            bucketPolicy: {
                current: "arn:aws:iam::329103132361:user/YOUR_IAM_USER_NAME",
                needed: identity.Arn,
                suggestion: "Use 'arn:aws:iam::329103132361:root' for full account access"
            }
        });

    } catch (error: unknown) {
        console.error('Error testing AWS:', error);
        return NextResponse.json(
            { 
                error: 'Failed to test AWS', 
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}