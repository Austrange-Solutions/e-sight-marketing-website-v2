import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import FoundationSettings from "@/models/foundationSettingsModel";

// GET - Fetch all foundation settings
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const settings = await FoundationSettings.find({ isActive: true }).sort({ foundationCode: 1 });

    // If no settings exist, create defaults
    if (settings.length === 0) {
      const defaultSettings = [
        {
          foundationCode: "vsf",
          foundationName: "Vishnu Shakti Foundation",
          platformFeePercent: 12,
          foundationSharePercent: 65,
          razorpayFeePercent: 2,
          isActive: true,
          description: "Empowering visually impaired individuals",
        },
        {
          foundationCode: "cf",
          foundationName: "Chetana Foundation",
          platformFeePercent: 8,
          foundationSharePercent: 75,
          razorpayFeePercent: 2,
          isActive: true,
          description: "Supporting accessibility initiatives",
        },
      ];

      await FoundationSettings.insertMany(defaultSettings);
      const newSettings = await FoundationSettings.find({ isActive: true });
      
      return NextResponse.json({
        success: true,
        settings: newSettings,
        message: "Default settings created",
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching foundation settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch settings",
      },
      { status: 500 }
    );
  }
}

// POST - Update foundation settings
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { foundationCode, platformFeePercent, foundationSharePercent, razorpayFeePercent } = body;

    if (!foundationCode) {
      return NextResponse.json(
        { success: false, message: "Foundation code is required" },
        { status: 400 }
      );
    }

    // Validate percentages
    if (platformFeePercent !== undefined) {
      if (platformFeePercent < 0 || platformFeePercent > 100) {
        return NextResponse.json(
          { success: false, message: "Platform fee must be between 0 and 100%" },
          { status: 400 }
        );
      }
    }

    if (foundationSharePercent !== undefined) {
      if (foundationSharePercent < 0 || foundationSharePercent > 100) {
        return NextResponse.json(
          { success: false, message: "Foundation share must be between 0 and 100%" },
          { status: 400 }
        );
      }
    }

    if (razorpayFeePercent !== undefined) {
      if (razorpayFeePercent < 0 || razorpayFeePercent > 100) {
        return NextResponse.json(
          { success: false, message: "Razorpay fee must be between 0 and 100%" },
          { status: 400 }
        );
      }
    }

    // Update settings
    const settings = await FoundationSettings.findOneAndUpdate(
      { foundationCode },
      {
        $set: {
          ...(platformFeePercent !== undefined && { platformFeePercent }),
          ...(foundationSharePercent !== undefined && { foundationSharePercent }),
          ...(razorpayFeePercent !== undefined && { razorpayFeePercent }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!settings) {
      return NextResponse.json(
        { success: false, message: "Foundation settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating foundation settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update settings",
      },
      { status: 500 }
    );
  }
}
