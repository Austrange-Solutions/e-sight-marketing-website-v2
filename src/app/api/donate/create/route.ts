import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";
import Foundation from "@/models/Foundation";
import mongoose from "mongoose";
import { validateAndSanitize, sanitizeEmail, sanitizePhone, validateAndSanitizeWithWordLimit } from '@/lib/validation/xss';

// Both payment gateways available
import Razorpay from "razorpay";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Force Node.js runtime and dynamic rendering
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Active payment gateway: CASHFREE
const ACTIVE_GATEWAY = 'cashfree'; // Change to 'razorpay' if needed

// Avoid initializing gateway at import time to prevent build-time env errors

// Initialize Razorpay (Available but inactive)
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, phone, amount, message, isAnonymous, address, city, state, pan, foundation } = body;

    // Validate and sanitize donor inputs to prevent XSS
    let sanitizedDonorData;
    try {
      sanitizedDonorData = {
        name: validateAndSanitize(name, { fieldName: 'name', maxLength: 200, strict: true }),
        email: sanitizeEmail(email),
        phone: sanitizePhone(phone),
        message: message ? validateAndSanitizeWithWordLimit(message, { fieldName: 'message', maxWords: 150, strict: true }) : '',
        address: address ? validateAndSanitize(address, { fieldName: 'address', maxLength: 500, strict: false }) : undefined,
        city: city ? validateAndSanitize(city, { fieldName: 'city', maxLength: 100, strict: false }) : undefined,
        state: state ? validateAndSanitize(state, { fieldName: 'state', maxLength: 100, strict: false }) : undefined,
        pan: pan ? validateAndSanitize(pan, { fieldName: 'PAN', maxLength: 20, strict: false }) : undefined,
      };
    } catch (validationError) {
      return NextResponse.json(
        { success: false, message: validationError instanceof Error ? validationError.message : 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Validation
    if (!sanitizedDonorData.name || !sanitizedDonorData.email || !sanitizedDonorData.phone || !amount) {
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
    
    // Calculate sticks equivalent
    const sticksEquivalent = amount / 1499;

    // Generate unique order ID
    const orderId = `donation_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create Cashfree order (Active Gateway)
    const appId = process.env.CASHFREE_APP_ID;
    const secret = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secret) {
      return NextResponse.json(
        { success: false, message: "Missing Cashfree credentials. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const env = process.env.CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" 
      ? CFEnvironment.PRODUCTION 
      : CFEnvironment.SANDBOX;
    const cashfree = new Cashfree(env, appId, secret);
    const orderRequest = {
      order_id: orderId,
      order_amount: parseFloat(amount.toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: `donor_${Date.now()}`,
        customer_name: sanitizedDonorData.name,
        customer_email: sanitizedDonorData.email,
        customer_phone: sanitizedDonorData.phone,
      },
      order_note: `Donation - ${sticksEquivalent.toFixed(2)} E-Kaathi Pro sticks`,
    };

  const response = await cashfree.PGCreateOrder(orderRequest);

    if (!response || !response.data) {
      return NextResponse.json(
        { success: false, message: "Failed to create order" },
        { status: 500 }
      );
    }

    const order = response.data;

    // Create donation record with pending status
    const donation = await Donation.create({
      donorName: sanitizedDonorData.name,
      email: sanitizedDonorData.email,
      phone: sanitizedDonorData.phone,
      amount: amount,
      platformFee: breakdown.platformFee,
      foundationAmount: breakdown.foundationAmount,
      companyAmount: breakdown.companyAmount,
      platformFeePercent: breakdown.platformFeePercent,
      foundationSharePercent: breakdown.foundationSharePercent,
      companySharePercent: breakdown.companySharePercent,
      sticksEquivalent: sticksEquivalent,
      orderId: order.order_id,
      status: "pending",
      message: sanitizedDonorData.message || "",
      isAnonymous: isAnonymous || false,
      foundation: foundationDoc._id, // Store ObjectId reference
      // Optional tax exemption fields
      address: sanitizedDonorData.address || undefined,
      city: sanitizedDonorData.city || undefined,
      state: sanitizedDonorData.state || undefined,
      pan: sanitizedDonorData.pan ? sanitizedDonorData.pan.toUpperCase() : undefined,
    });

    return NextResponse.json({
      success: true,
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      orderAmount: order.order_amount,
      orderCurrency: order.order_currency,
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
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create donation" },
      { status: 500 }
    );
  }
}
