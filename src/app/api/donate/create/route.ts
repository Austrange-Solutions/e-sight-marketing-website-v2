import { NextRequest, NextResponse } from "next/server";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import Donation from "@/models/Donation";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `donation_${Date.now()}`,
      notes: {
        donorName: name,
        donorEmail: email,
        donorPhone: phone,
        sticksEquivalent: (amount / 1499).toFixed(2),
      },
    };

    const order = await razorpay.orders.create(options);

    // Calculate sticks equivalent
    const sticksEquivalent = amount / 1499;

    // Create donation record with pending status
    const donation = await Donation.create({
      donorName: name,
      email: email.toLowerCase(),
      phone: phone,
      amount: amount,
      sticksEquivalent: sticksEquivalent,
      orderId: order.id,
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
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      donationId: donation._id,
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create donation" },
      { status: 500 }
    );
  }
}
