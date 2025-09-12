import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import UploadedImage from "@/models/UploadedImage";

// GET /api/images/stats - Get upload statistics
export async function GET(req: NextRequest) {
    try {
        await connect();

        const [
            totalStats,
            fileTypeStats,
            recentUploads,
            uploadTrends
        ] = await Promise.all([
            // Overall statistics
            UploadedImage.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalFiles: { $sum: 1 },
                        totalSize: { $sum: '$fileSize' },
                        avgSize: { $avg: '$fileSize' },
                        maxSize: { $max: '$fileSize' },
                        minSize: { $min: '$fileSize' }
                    }
                }
            ]),

            // File type distribution
            UploadedImage.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: '$fileType',
                        count: { $sum: 1 },
                        totalSize: { $sum: '$fileSize' },
                        avgSize: { $avg: '$fileSize' }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            // Recent uploads (last 10)
            UploadedImage.find({ isActive: true })
                .sort({ uploadedAt: -1 })
                .limit(10)
                .select('filename originalName fileSize fileType uploadedAt cloudFrontUrl')
                .lean(),

            // Upload trends (last 30 days)
            UploadedImage.aggregate([
                {
                    $match: {
                        isActive: true,
                        uploadedAt: {
                            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$uploadedAt"
                                }
                            }
                        },
                        count: { $sum: 1 },
                        totalSize: { $sum: '$fileSize' }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ])
        ]);

        const stats = {
            overview: totalStats[0] || {
                totalFiles: 0,
                totalSize: 0,
                avgSize: 0,
                maxSize: 0,
                minSize: 0
            },
            fileTypes: fileTypeStats,
            recentUploads,
            uploadTrends: uploadTrends.map(trend => ({
                date: trend._id.date,
                count: trend.count,
                totalSize: trend.totalSize
            }))
        };

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error: unknown) {
        console.error('Error fetching image statistics:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch statistics', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}