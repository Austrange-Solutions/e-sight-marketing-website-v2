import { connect } from "@/dbConfig/dbConfig";
import DeliveryArea from "@/models/deliveryAreaModel";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/middleware/auth";
import { getAdminFromRequest } from "@/middleware/adminAuth";

// GET: Fetch all delivery areas or check specific pincode
export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const url = new URL(request.url);
    const pincode = url.searchParams.get('pincode');
    const checkOnly = url.searchParams.get('check') === 'true';

    if (pincode && checkOnly) {
      // Exact pincode match - digit by digit
      const exactPincode = pincode.trim();
      
      // Validate pincode format (exactly 6 digits)
      if (!/^\d{6}$/.test(exactPincode)) {
        return NextResponse.json({
          exists: false,
          deliveryCharges: 500,
          area: null,
          error: "Invalid pincode format. Must be exactly 6 digits."
        });
      }
      
      const area = await DeliveryArea.findOne({ 
        pincode: exactPincode, // Exact string match
        isActive: true 
      });
      
      return NextResponse.json({
        exists: !!area,
        deliveryCharges: area ? area.deliveryCharges : 500, // 500 for outside areas
        area: area ? {
          pincode: area.pincode,
          areaName: area.areaName,
          district: area.district,
          deliveryCharges: area.deliveryCharges
        } : null
      });
    }

    // For admin: get all areas
    const adminData = getAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const areas = await DeliveryArea.find({})
      .sort({ pincode: 1 })
      .lean();

    return NextResponse.json({ areas });
  } catch (error: unknown) {
    console.error('Delivery areas fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching delivery areas';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST: Add new delivery area (Admin only)
export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pincode, areaName, district, deliveryCharges = 100 } = await request.json();

    if (!pincode || !areaName || !district) {
      return NextResponse.json({ 
        error: "Pincode, area name and district are required" 
      }, { status: 400 });
    }

    // Check if pincode already exists
    const existingArea = await DeliveryArea.findOne({ pincode: pincode.trim() });
    if (existingArea) {
      return NextResponse.json({ 
        error: "Pincode already exists" 
      }, { status: 400 });
    }

    const newArea = new DeliveryArea({
      pincode: pincode.trim(),
      areaName: areaName.trim(),
      district: district.trim(),
      deliveryCharges,
      isActive: true
    });

    await newArea.save();

    return NextResponse.json({ 
      success: true, 
      area: newArea 
    });
  } catch (error: unknown) {
    console.error('Delivery area creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating delivery area';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT: Update delivery area (Admin only)
export async function PUT(request: NextRequest) {
  try {
    await connect();
    
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { _id, pincode, areaName, district, deliveryCharges, isActive } = await request.json();

    if (!_id) {
      return NextResponse.json({ error: "Area ID is required" }, { status: 400 });
    }

    const updatedArea = await DeliveryArea.findByIdAndUpdate(
      _id,
      {
        pincode: pincode?.trim(),
        areaName: areaName?.trim(),
        district: district?.trim(),
        deliveryCharges,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!updatedArea) {
      return NextResponse.json({ error: "Delivery area not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      area: updatedArea 
    });
  } catch (error: unknown) {
    console.error('Delivery area update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error updating delivery area';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE: Remove delivery area (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    await connect();
    
    const userData = await getUserFromToken(request);
    if (!userData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const areaId = url.searchParams.get('id');

    if (!areaId) {
      return NextResponse.json({ error: "Area ID is required" }, { status: 400 });
    }

    const deletedArea = await DeliveryArea.findByIdAndDelete(areaId);

    if (!deletedArea) {
      return NextResponse.json({ error: "Delivery area not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Delivery area deleted successfully" 
    });
  } catch (error: unknown) {
    console.error('Delivery area deletion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error deleting delivery area';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
