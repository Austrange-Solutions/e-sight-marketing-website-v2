import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import SupportTicket from "@/models/SupportTicket";
import { escapeRegex } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Please provide a Ticket ID or Email" },
        { status: 400 }
      );
    }

    // Try to find by Ticket ID first (exact match)
    let tickets = await SupportTicket.find({ ticketId: query });

    // If no tickets found by ID, try by Email (case-insensitive)
    // Sanitize input to prevent ReDoS attacks
    if (tickets.length === 0) {
      const sanitizedQuery = escapeRegex(query);
      tickets = await SupportTicket.find({
        email: { $regex: new RegExp(`^${sanitizedQuery}$`, "i") },
      }).sort({ createdAt: -1 });
    }

    if (tickets.length === 0) {
      return NextResponse.json(
        { error: "No tickets found matching your criteria" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
