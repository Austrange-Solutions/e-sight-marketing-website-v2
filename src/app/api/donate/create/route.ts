import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";
import Foundation from "@/models/Foundation";
import Razorpay from "razorpay";
import mongoose from "mongoose";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, phone, amount, message, isAnonymous, address, city, state, pan, foundation } = body;

    // Validation
    if (!name || !email || !phone || !amount) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        { success: false, message: "Minimum donation amount is ₹1" },
        { status: 400 }
      );
    }

    // Lookup foundation by code (preferred) or ObjectId (fallback)
    let foundationDoc;
    if (foundation) {
      // Try finding by code first
      foundationDoc = await Foundation.findOne({ code: foundation, isActive: true });
      
      // If not found by code and looks like ObjectId, try by _id
      if (!foundationDoc && mongoose.Types.ObjectId.isValid(foundation)) {
        foundationDoc = await Foundation.findOne({ _id: foundation, isActive: true });
      }
    }

    // If still no foundation, try to get first active one (fallback)
    if (!foundationDoc) {
      foundationDoc = await Foundation.findOne({ isActive: true }).sort({ priority: 1 });
    }

    // If STILL no foundation, return error
    if (!foundationDoc) {
      return NextResponse.json(
        { success: false, message: "Invalid foundation selection or no active foundations available" },
        { status: 400 }
      );
    }

    const selectedFoundation = foundationDoc.code;
    const foundationName = foundationDoc.displayName || foundationDoc.foundationName;

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `donation_${selectedFoundation}_${Date.now()}`,
      notes: {
        donorName: name,
        donorEmail: email,
        donorPhone: phone,
        sticksEquivalent: (amount / 1499).toFixed(2),
        foundation: selectedFoundation,
      },
    };

    const order = await razorpay.orders.create(options);

    // Use platform fee from Foundation model (now stored per foundation)
    const platformFeePercent = foundationDoc.platformFeePercent || 10;

    // Calculate breakdown using foundation percentages from Foundation model
    const breakdown = {
      platformFee: Math.round(amount * (platformFeePercent / 100) * 100) / 100,
      afterPlatformFee: 0,
      foundationAmount: 0,
      companyAmount: 0,
      platformFeePercent: platformFeePercent,
      foundationSharePercent: foundationDoc.foundationSharePercent,
      companySharePercent: foundationDoc.companySharePercent,
    };

    breakdown.afterPlatformFee = Math.round((amount - breakdown.platformFee) * 100) / 100;
    breakdown.foundationAmount = Math.round(breakdown.afterPlatformFee * (foundationDoc.foundationSharePercent / 100) * 100) / 100;
    breakdown.companyAmount = Math.round((breakdown.afterPlatformFee - breakdown.foundationAmount) * 100) / 100;
    const sticksEquivalent = amount / 1499;

    // Create donation record with pending status
    const donation = await Donation.create({
      donorName: name,
      email: email.toLowerCase(),
      phone: phone,
      amount: amount,
      platformFee: breakdown.platformFee,
      foundationAmount: breakdown.foundationAmount,
      companyAmount: breakdown.companyAmount,
      platformFeePercent: breakdown.platformFeePercent,
      foundationSharePercent: breakdown.foundationSharePercent,
      companySharePercent: breakdown.companySharePercent,
      sticksEquivalent: sticksEquivalent,
      orderId: order.id,
      status: "pending",
      message: message || "",
      isAnonymous: isAnonymous || false,
      foundation: foundationDoc._id, // Store ObjectId reference
      // Optional tax exemption fields
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      pan: pan ? pan.toUpperCase() : undefined,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      donationId: donation._id,
      foundationName: foundationName,
      breakdown: {
        totalAmount: amount,
        platformFee: breakdown.platformFee,
        foundationAmount: breakdown.foundationAmount,
        companyAmount: breakdown.companyAmount,
      },
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create donation" },
      { status: 500 }
    );
  }
}
