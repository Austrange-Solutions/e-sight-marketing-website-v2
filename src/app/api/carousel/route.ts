import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import UploadedImage from '@/models/UploadedImage';
import { generatePresignedUrls } from '@/lib/s3-presigned';

export async function GET(req: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Query images tagged with 'carousel' (most recent first)
    const images = await UploadedImage.find({ tags: { $in: ['carousel'] }, isActive: true })
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .lean();

    const keys = images.map((img: any) => img.s3Key).filter(Boolean);
    const urlMap = await generatePresignedUrls(keys, 900); // 15 minutes

    const payload = images.map((img: any) => ({
      id: img._id,
      key: img.s3Key,
      altText: img.altText || img.originalName || img.filename,
      url: urlMap.get(img.s3Key) || img.cloudFrontUrl || img.s3Url,
    }));

    return NextResponse.json({ success: true, data: payload });
  } catch (error: unknown) {
    console.error('Error fetching carousel images:', error);
    return NextResponse.json({ error: 'Failed to fetch carousel images', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}
