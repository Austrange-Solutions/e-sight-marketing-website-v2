import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import SupportTicket from "@/models/SupportTicket";
import { getTokenFromRequest, verifyAdminToken } from "@/middleware/adminAuth";
import { sendSupportStatusUpdateEmail } from "@/helpers/resendEmail";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    // Admin Authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connect();

    // Admin Authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const reqBody = await request.json();
    const { ticketId, status, adminResponse } = reqBody;

    if (!ticketId || !status) {
      return NextResponse.json(
        { error: "Ticket ID and Status are required" },
        { status: 400 }
      );
    }

    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Update ticket
    ticket.status = status;
    if (adminResponse) {
      ticket.adminResponse = adminResponse;
    }
    ticket.resolvedBy = admin.id;
    
    await ticket.save();

    // Send email notification
    try {
      await sendSupportStatusUpdateEmail(
        ticket.email,
        ticket.name,
        ticket.ticketId,
        status,
        adminResponse
      );
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
