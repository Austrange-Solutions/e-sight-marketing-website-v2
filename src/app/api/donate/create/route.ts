import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Force Node.js runtime and dynamic rendering
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validate required environment variables
if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  throw new Error("Missing Cashfree credentials. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in environment variables.");
}

// Initialize Cashfree
const cashfree = new Cashfree(
  process.env.CASHFREE_ENDPOINT === "https://api.cashfree.com/pg" 
    ? CFEnvironment.PRODUCTION 
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, phone, amount, message, isAnonymous, address, city, state, pan } = body;

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

    // Calculate sticks equivalent
    const sticksEquivalent = amount / 1499;

    // Generate unique order ID
    const orderId = `donation_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create Cashfree order
    const orderRequest = {
      order_id: orderId,
      order_amount: parseFloat(amount.toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: `donor_${Date.now()}`,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      },
      // Intentionally omitting return_url to avoid auto-redirects when using JS checkout modal.
      // You can configure a webhook later:
      // order_meta: { notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/donate/webhook` },
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
      donorName: name,
      email: email.toLowerCase(),
      phone: phone,
      amount: amount,
      sticksEquivalent: sticksEquivalent,
      orderId: order.order_id,
      status: "pending",
      message: message || "",
      isAnonymous: isAnonymous || false,
      // Optional tax exemption fields
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      pan: pan ? pan.toUpperCase() : undefined,
    });

    return NextResponse.json({
      success: true,
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      orderAmount: order.order_amount,
      orderCurrency: order.order_currency,
      donationId: donation._id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create donation" },
      { status: 500 }
    );
  }
}
