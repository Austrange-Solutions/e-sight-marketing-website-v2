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

    // Prevent overly long inputs (max 100 characters for email/ticket ID)
    if (query.length > 100) {
      return NextResponse.json(
        { error: "Search query is too long" },
        { status: 400 }
      );
    }

    // Try to find by Ticket ID first (exact match)
    let tickets = await SupportTicket.find({ ticketId: query });

    // If no tickets found by ID, try by Email (case-insensitive)
    // Safe: Input is sanitized via escapeRegex() and length-limited to 100 chars
    // The escapeRegex function escapes [.*+?^${}()|[\]\\] preventing ReDoS attacks
    if (tickets.length === 0) {
      const sanitizedQuery = escapeRegex(query);
      tickets = await SupportTicket.find({
        email: { $regex: new RegExp(`^${sanitizedQuery}$`, "i") }, // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp
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
