import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server'; // Commented out as it's not being usedmport { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import AdminSettings from "@/models/adminSettingsModel";

export async function POST() {
  try {
    await connect();
    
    // Default settings for delivery charges
    const defaultSettings = [
      {
        settingKey: "DEFAULT_DELIVERY_CHARGES",
        settingValue: 500,
        description: "Default delivery charges for areas not in our delivery zone (₹500)"
      },
      {
        settingKey: "MUMBAI_SUBURBAN_CHARGES",
        settingValue: 100,
        description: "Standard delivery charges for Mumbai suburban areas (₹100)"
      },
      {
        settingKey: "PINCODE_VALIDATION_STRICT",
        settingValue: true,
        description: "Enable strict pincode validation (exact digit-by-digit matching)"
      },
      {
        settingKey: "PINCODE_LENGTH_VALIDATION",
        settingValue: 6,
        description: "Required pincode length (6 digits)"
      },
      {
        settingKey: "FREE_DELIVERY_THRESHOLD",
        settingValue: 2000,
        description: "Minimum order amount for free delivery (₹2000)"
      }
    ];
    
    // Check if settings already exist
    const existingSettings = await AdminSettings.find({
      settingKey: { $in: defaultSettings.map(s => s.settingKey) }
    });
    
    const existingKeys = existingSettings.map(s => s.settingKey);
    const newSettings = defaultSettings.filter(s => !existingKeys.includes(s.settingKey));
    
    if (newSettings.length > 0) {
      await AdminSettings.insertMany(newSettings);
    }
    
    return NextResponse.json({
      success: true,
      message: `Initialized ${newSettings.length} new settings, ${existingKeys.length} already existed`,
      data: {
        newSettings: newSettings.length,
        existingSettings: existingKeys.length,
        totalSettings: defaultSettings.length
      }
    });
  } catch (error) {
    console.error("Error initializing admin settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initialize admin settings" },
      { status: 500 }
    );
  }
}
