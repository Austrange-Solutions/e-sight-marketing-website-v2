import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import AdminSettings from "@/models/adminSettingsModel";

export async function GET() {
  try {
    await connect();
    
    const settings = await AdminSettings.find({ isActive: true });
    
    // Convert to key-value pairs for easy access
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.settingKey] = setting.settingValue;
      return acc;
    }, {} as Record<string, string | number | boolean>);
    
    return NextResponse.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    const { settingKey, settingValue, description } = body;
    
    if (!settingKey || settingValue === undefined || !description) {
      return NextResponse.json(
        { success: false, message: "Setting key, value, and description are required" },
        { status: 400 }
      );
    }
    
    // Update or create setting
    const setting = await AdminSettings.findOneAndUpdate(
      { settingKey },
      { settingValue, description, isActive: true },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error("Error saving admin setting:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save admin setting" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect();
    
    const body = await request.json();
    const { settings } = body; // Array of {settingKey, settingValue, description}
    
    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, message: "Settings must be an array" },
        { status: 400 }
      );
    }
    
    // Bulk update settings
    const operations = settings.map(({ settingKey, settingValue, description }) => ({
      updateOne: {
        filter: { settingKey },
        update: { settingValue, description, isActive: true },
        upsert: true
      }
    }));
    
    await AdminSettings.bulkWrite(operations);
    
    return NextResponse.json({
      success: true,
      message: "Settings updated successfully"
    });
  } catch (error) {
    console.error("Error updating admin settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update admin settings" },
      { status: 500 }
    );
  }
}
