import { NextRequest, NextResponse } from "next/server";
import PincodeValidationService from "@/lib/server/pincodeValidation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pincode, orderAmount = 0 } = body;
    
    if (!pincode) {
      return NextResponse.json({
        success: false,
        message: "Pincode is required"
      }, { status: 400 });
    }
    
    const result = await PincodeValidationService.validatePincode(
      pincode.toString(),
      Number(orderAmount) || 0
    );
    
    return NextResponse.json({
      success: true,
      data: result,
      message: result.isValid 
        ? `Validation successful - ${result.appliedRule}` 
        : `Validation failed: ${result.validationErrors.join(', ')}`
    });
    
  } catch (error) {
    console.error("Error in pincode validation API:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error during validation"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pincode = url.searchParams.get('pincode');
    const orderAmount = url.searchParams.get('orderAmount');
    
    if (!pincode) {
      return NextResponse.json({
        success: false,
        message: "Pincode query parameter is required"
      }, { status: 400 });
    }
    
    const result = await PincodeValidationService.validatePincode(
      pincode,
      Number(orderAmount) || 0
    );
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error("Error in pincode validation API:", error);
    return NextResponse.json({
      success: false,
      message: "Internal server error during validation"
    }, { status: 500 });
  }
}
